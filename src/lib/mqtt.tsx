"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import mqtt from "mqtt";

export interface TelemetryData {
  weight: number;
  scaleOk: boolean;
  cat: boolean;
  visits: number;
  water: number;
  waterLow: boolean;
  pump: "OFF" | "RUNNING" | "STOPPING";
  dispensing: boolean;
  rssi: number;
  clock: string;
  timeOk: boolean;
  sched: string;
  lastAuto: string;
}

export interface ScheduleTelemetryData {
  sched: string;
  clock: string;
  timeOk: boolean;
  lastAuto: string;
}

export type StationStatus = "online" | "offline" | "connecting";
export type StationCommand = "dispense" | "pump" | "tare";

export interface MqttStatusContextValue {
  stationStatus: StationStatus;
  isStationOnline: boolean;
  statusMessage: string;
  brokerError: string | null;
  sendCommand: (command: StationCommand) => void;
  publishSchedule: (scheduleString: string) => void;
  lastSentSchedule: string | null;
  isBrokerConfigured: boolean;
}

export interface MqttContextValue extends MqttStatusContextValue {
  telemetry: TelemetryData | null;
}

const MqttStatusContext = createContext<MqttStatusContextValue | null>(null);
const MqttTelemetryContext = createContext<TelemetryData | null>(null);
const MqttScheduleContext = createContext<ScheduleTelemetryData | null>(null);

const MQTT_HOST = process.env.NEXT_PUBLIC_MQTT_HOST?.trim() || "";
const MQTT_USER = process.env.NEXT_PUBLIC_MQTT_USER?.trim() || "";
const MQTT_PASS = process.env.NEXT_PUBLIC_MQTT_PASS?.trim() || "";

const isConfigured = Boolean(MQTT_HOST && MQTT_USER && MQTT_PASS);

export function MqttProvider({ children }: { children: ReactNode }) {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [scheduleData, setScheduleData] = useState<ScheduleTelemetryData | null>(null);
  const [stationStatus, setStationStatus] = useState<StationStatus>(
    isConfigured ? "connecting" : "offline"
  );
  const [isStationOnline, setIsStationOnline] = useState(false);
  const [brokerError, setBrokerError] = useState<string | null>(
    isConfigured ? null : "Broker settings missing"
  );
  const [statusMessage, setStatusMessage] = useState<string>(
    isConfigured ? "connecting" : "Broker settings missing"
  );
  const [lastSentSchedule, setLastSentSchedule] = useState<string | null>(null);

  const clientRef = useRef<mqtt.MqttClient | null>(null);
  const telemetryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOnlineRef = useRef(false);
  const brokerErrorRef = useRef<string | null>(isConfigured ? null : "Broker settings missing");
  const statusMessageRef = useRef<string>(isConfigured ? "connecting" : "Broker settings missing");

  useEffect(() => {
    // If any of the three env vars is empty, show "Broker settings missing" instead of attempting to connect
    if (!MQTT_HOST || !MQTT_USER || !MQTT_PASS) {
      setBrokerError("Broker settings missing");
      brokerErrorRef.current = "Broker settings missing";
      setStatusMessage("Broker settings missing");
      statusMessageRef.current = "Broker settings missing";
      setStationStatus("offline");
      setIsStationOnline(false);
      isOnlineRef.current = false;
      return;
    }

    setStationStatus("connecting");
    setStatusMessage("connecting");
    statusMessageRef.current = "connecting";
    setBrokerError(null);
    brokerErrorRef.current = null;

    const clientId = `pawstation-${Math.random().toString(16).slice(2, 10)}`;
    const brokerUrl = `wss://${MQTT_HOST}:8884/mqtt`;

    let client: mqtt.MqttClient;
    try {
      client = mqtt.connect(brokerUrl, {
        username: MQTT_USER,
        password: MQTT_PASS,
        clientId,
        reconnectPeriod: 2000,
        connectTimeout: 8000,
        clean: true,
      });
      clientRef.current = client;
    } catch {
      setBrokerError("cannot reach broker");
      brokerErrorRef.current = "cannot reach broker";
      setStatusMessage("cannot reach broker");
      statusMessageRef.current = "cannot reach broker";
      setStationStatus("offline");
      setIsStationOnline(false);
      isOnlineRef.current = false;
      return;
    }

    const resetTelemetryTimer = () => {
      if (telemetryTimeoutRef.current) {
        clearTimeout(telemetryTimeoutRef.current);
      }
      telemetryTimeoutRef.current = setTimeout(() => {
        isOnlineRef.current = false;
        setIsStationOnline(false);
        setStationStatus("offline");
        setStatusMessage("station offline");
        statusMessageRef.current = "station offline";
      }, 6000);
    };

    client.on("connect", () => {
      setBrokerError(null);
      brokerErrorRef.current = null;
      // Wait for telemetry / retained status to determine station online state
      client.subscribe(["pawstation/telemetry", "pawstation/status"], { qos: 1 });
      resetTelemetryTimer();
    });

    client.on("message", (topic: string, payload: Buffer) => {
      const text = payload.toString().trim();

      if (topic === "pawstation/status") {
        if (text === "offline") {
          if (telemetryTimeoutRef.current) {
            clearTimeout(telemetryTimeoutRef.current);
          }
          isOnlineRef.current = false;
          setIsStationOnline(false);
          setStationStatus("offline");
          setStatusMessage("station offline");
          statusMessageRef.current = "station offline";
        }
        return;
      }

      if (topic === "pawstation/telemetry") {
        try {
          const data: TelemetryData = JSON.parse(text);
          setTelemetry(data);

          // Narrow schedule updates so Scheduler component only re-renders when its fields change
          setScheduleData((prev) => {
            if (
              prev &&
              prev.sched === data.sched &&
              prev.clock === data.clock &&
              prev.timeOk === data.timeOk &&
              prev.lastAuto === data.lastAuto
            ) {
              return prev;
            }
            return {
              sched: data.sched,
              clock: data.clock,
              timeOk: data.timeOk,
              lastAuto: data.lastAuto,
            };
          });

          // Only update status state when transitioning into online to prevent 1 Hz React context churn
          if (!isOnlineRef.current) {
            isOnlineRef.current = true;
            setIsStationOnline(true);
            setStationStatus("online");
            setStatusMessage("online");
            statusMessageRef.current = "online";
            setBrokerError(null);
            brokerErrorRef.current = null;
          }

          resetTelemetryTimer();
        } catch {
          // Ignore malformed JSON frames safely
        }
      }
    });

    client.on("error", (err: Error) => {
      const msg = err.message?.toLowerCase() || "";
      const code = (err as unknown as { code?: number })?.code;

      if (
        msg.includes("not authorized") ||
        msg.includes("bad username") ||
        code === 4 ||
        code === 5
      ) {
        setBrokerError("not authorized (check credentials)");
        brokerErrorRef.current = "not authorized (check credentials)";
        setStatusMessage("not authorized (check credentials)");
        statusMessageRef.current = "not authorized (check credentials)";
      } else {
        setBrokerError("cannot reach broker");
        brokerErrorRef.current = "cannot reach broker";
        setStatusMessage("cannot reach broker");
        statusMessageRef.current = "cannot reach broker";
      }

      isOnlineRef.current = false;
      setIsStationOnline(false);
      setStationStatus("offline");
    });

    client.on("offline", () => {
      isOnlineRef.current = false;
      setIsStationOnline(false);
      setStationStatus("offline");
      if (
        brokerErrorRef.current !== "not authorized (check credentials)" &&
        brokerErrorRef.current !== "Broker settings missing"
      ) {
        setBrokerError("cannot reach broker");
        brokerErrorRef.current = "cannot reach broker";
        setStatusMessage("cannot reach broker");
        statusMessageRef.current = "cannot reach broker";
      }
    });

    client.on("reconnect", () => {
      // Avoid thrashing state back and forth while offline retrying
      if (isOnlineRef.current) {
        isOnlineRef.current = false;
        setIsStationOnline(false);
        setStationStatus("connecting");
        setStatusMessage("connecting");
        statusMessageRef.current = "connecting";
      }
    });

    return () => {
      if (telemetryTimeoutRef.current) {
        clearTimeout(telemetryTimeoutRef.current);
      }
      client.end(true);
      clientRef.current = null;
    };
  }, []);

  const sendCommand = useCallback(
    (command: StationCommand) => {
      if (!isStationOnline || !clientRef.current?.connected) {
        return;
      }
      clientRef.current.publish("pawstation/cmd", command);
    },
    [isStationOnline]
  );

  const publishSchedule = useCallback(
    (scheduleString: string) => {
      if (!isStationOnline || !clientRef.current?.connected) {
        return;
      }
      setLastSentSchedule(scheduleString);
      clientRef.current.publish("pawstation/schedule", scheduleString, {
        retain: true,
        qos: 1,
      });
    },
    [isStationOnline]
  );

  const statusValue = useMemo<MqttStatusContextValue>(
    () => ({
      stationStatus,
      isStationOnline,
      statusMessage,
      brokerError,
      sendCommand,
      publishSchedule,
      lastSentSchedule,
      isBrokerConfigured: isConfigured,
    }),
    [
      stationStatus,
      isStationOnline,
      statusMessage,
      brokerError,
      sendCommand,
      publishSchedule,
      lastSentSchedule,
    ]
  );

  return (
    <MqttStatusContext.Provider value={statusValue}>
      <MqttScheduleContext.Provider value={scheduleData}>
        <MqttTelemetryContext.Provider value={telemetry}>
          {children}
        </MqttTelemetryContext.Provider>
      </MqttScheduleContext.Provider>
    </MqttStatusContext.Provider>
  );
}

// Hook for components that only need connection and status without telemetry re-render churn
export function useStationStatus(): MqttStatusContextValue {
  const ctx = useContext(MqttStatusContext);
  if (!ctx) {
    throw new Error("useStationStatus must be used within an MqttProvider");
  }
  return ctx;
}

// Hook for Schedule card so it only re-renders when schedule/clock changes, not on 1Hz weight/water
export function useScheduleTelemetry(): ScheduleTelemetryData | null {
  return useContext(MqttScheduleContext);
}

// Full hook for components that need active telemetry
export function usePawStationMqtt(): MqttContextValue {
  const statusCtx = useContext(MqttStatusContext);
  const telemetry = useContext(MqttTelemetryContext);
  if (!statusCtx) {
    throw new Error("usePawStationMqtt must be used within an MqttProvider");
  }
  return useMemo(
    () => ({
      ...statusCtx,
      telemetry,
    }),
    [statusCtx, telemetry]
  );
}

// Allowlisted actuator commands for backwards compatibility
const ALLOWED_COMMANDS = new Set<string>(["dispense", "pump", "tare"]);

export interface MqttConnection {
  client: mqtt.MqttClient | null;
  connect: () => void;
  disconnect: () => void;
  publish: (command: StationCommand | string) => void;
}

export function createMqttClient(
  onTelemetry: (data: TelemetryData) => void,
  onStatus: (status: StationStatus) => void,
  onBrokerError: (error: string) => void
): MqttConnection {
  let client: mqtt.MqttClient | null = null;
  let telemetryTimeout: ReturnType<typeof setTimeout> | null = null;

  function resetTelemetryTimeout() {
    if (telemetryTimeout) clearTimeout(telemetryTimeout);
    telemetryTimeout = setTimeout(() => {
      onStatus("offline");
    }, 6000);
  }

  function connect() {
    if (!MQTT_HOST || !MQTT_USER || !MQTT_PASS) {
      onBrokerError("Broker settings missing");
      onStatus("offline");
      return;
    }

    onStatus("connecting");

    try {
      client = mqtt.connect(`wss://${MQTT_HOST}:8884/mqtt`, {
        username: MQTT_USER,
        password: MQTT_PASS,
        clientId: `pawstation-${Math.random().toString(16).slice(2, 10)}`,
        clean: true,
        reconnectPeriod: 2000,
        connectTimeout: 8000,
      });

      client.on("connect", () => {
        client?.subscribe(["pawstation/telemetry", "pawstation/status"], { qos: 1 });
      });

      client.on("message", (topic: string, payload: Buffer) => {
        const message = payload.toString().trim();

        if (topic === "pawstation/status") {
          onStatus(message === "online" ? "online" : "offline");
          return;
        }

        if (topic === "pawstation/telemetry") {
          try {
            const data: TelemetryData = JSON.parse(message);
            onTelemetry(data);
            onStatus("online");
            resetTelemetryTimeout();
          } catch {
            /* malformed telemetry payload safely ignored */
          }
        }
      });

      client.on("error", (err: Error) => {
        const msg = err.message?.toLowerCase() || "";
        const code = (err as unknown as { code?: number })?.code;
        if (
          msg.includes("not authorized") ||
          msg.includes("bad username") ||
          code === 4 ||
          code === 5
        ) {
          onBrokerError("not authorized (check credentials)");
        } else {
          onBrokerError("cannot reach broker");
        }
      });

      client.on("offline", () => {
        onBrokerError("cannot reach broker");
      });

      client.on("reconnect", () => {
        onStatus("connecting");
      });
    } catch {
      onBrokerError("cannot reach broker");
    }
  }

  function disconnect() {
    if (telemetryTimeout) clearTimeout(telemetryTimeout);
    client?.end(true);
    client = null;
  }

  function publish(command: StationCommand | string) {
    if (!ALLOWED_COMMANDS.has(command)) return;
    if (client?.connected) {
      client.publish("pawstation/cmd", command);
    }
  }

  return { client, connect, disconnect, publish };
}
