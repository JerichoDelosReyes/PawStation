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

export interface StationStatusContextValue {
  stationStatus: StationStatus;
  isStationOnline: boolean;
  statusMessage: string;
  stationError: string | null;
  brokerError: string | null; // Compatibility alias
  sendCommand: (command: StationCommand) => void;
  publishSchedule: (scheduleString: string) => void;
  lastSentSchedule: string | null;
  isConfigured: boolean;
  isBrokerConfigured: boolean; // Compatibility alias
  esp32Host: string;
  setEsp32Host: (host: string) => void;
  isDemoMode: boolean;
  setIsDemoMode: (demo: boolean) => void;
}

export interface StationContextValue extends StationStatusContextValue {
  telemetry: TelemetryData | null;
}

// Backward compatibility aliases
export type MqttStatusContextValue = StationStatusContextValue;
export type MqttContextValue = StationContextValue;

const StationStatusContext = createContext<StationStatusContextValue | null>(null);
const StationTelemetryContext = createContext<TelemetryData | null>(null);
const StationScheduleContext = createContext<ScheduleTelemetryData | null>(null);

const DEFAULT_ENV_HOST = process.env.NEXT_PUBLIC_ESP32_HOST?.trim() || "";

function formatCurrentTime(): string {
  const now = new Date();
  return [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join(":");
}

function buildWsUrl(host: string): string {
  let cleanHost = host.trim();
  cleanHost = cleanHost.replace(/^(ws:\/\/|wss:\/\/|http:\/\/|https:\/\/)/, "");
  // If no explicit port is specified, default to embedded WebSocket port 81
  if (!cleanHost.includes(":") && !cleanHost.includes("/")) {
    cleanHost = `${cleanHost}:81`;
  }
  return `ws://${cleanHost.replace(/\/+$/, "")}`;
}

function buildHttpUrl(host: string, path: string): string {
  let cleanHost = host.trim();
  cleanHost = cleanHost.replace(/^(ws:\/\/|wss:\/\/|http:\/\/|https:\/\/)/, "");
  // Strip WebSocket port :81 so HTTP requests go to standard port 80
  cleanHost = cleanHost.replace(/:81$/, "").replace(/\/+$/, "");
  return `http://${cleanHost}${path}`;
}

export function StationProvider({ children }: { children: ReactNode }) {
  const [esp32Host, setEsp32HostState] = useState<string>(DEFAULT_ENV_HOST);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(!DEFAULT_ENV_HOST);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [scheduleData, setScheduleData] = useState<ScheduleTelemetryData | null>(null);
  const [stationStatus, setStationStatus] = useState<StationStatus>(
    DEFAULT_ENV_HOST ? "connecting" : "online"
  );
  const [isStationOnline, setIsStationOnline] = useState<boolean>(!DEFAULT_ENV_HOST);
  const [stationError, setStationError] = useState<string | null>(
    DEFAULT_ENV_HOST ? null : "ESP32 host unconfigured"
  );
  const [statusMessage, setStatusMessage] = useState<string>(
    DEFAULT_ENV_HOST ? "connecting" : "ESP32 host unconfigured"
  );
  const [lastSentSchedule, setLastSentSchedule] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const watchdogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const demoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync saved host from localStorage if available in browser
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pawstation_esp32_host");
      if (saved && saved.trim() !== DEFAULT_ENV_HOST) {
        setEsp32HostState(saved.trim());
      }
    }
  }, []);

  const setEsp32Host = useCallback((host: string) => {
    const trimmed = host.trim();
    setEsp32HostState(trimmed);
    if (typeof window !== "undefined") {
      if (trimmed) {
        localStorage.setItem("pawstation_esp32_host", trimmed);
      } else {
        localStorage.removeItem("pawstation_esp32_host");
      }
    }
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // MOCK / DEMO MODE SIMULATION
  // Keeps the dashboard fully interactive when hardware is unconfigured or offline
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isDemoMode) {
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
        demoIntervalRef.current = null;
      }
      return;
    }

    // Set initial realistic telemetry
    setTelemetry((prev) => {
      if (prev) return prev;
      return {
        weight: 42.5,
        scaleOk: true,
        cat: false,
        visits: 3,
        water: 78,
        waterLow: false,
        pump: "OFF",
        dispensing: false,
        rssi: -58,
        clock: formatCurrentTime(),
        timeOk: true,
        sched: "08:00,18:00",
        lastAuto: "08:00",
      };
    });

    setScheduleData((prev) => {
      if (prev) return prev;
      return {
        sched: "08:00,18:00",
        clock: formatCurrentTime(),
        timeOk: true,
        lastAuto: "08:00",
      };
    });

    setIsStationOnline(true);
    setStationStatus("online");
    setStatusMessage("ESP32 Direct Wi-Fi (Demo)");

    // Periodic gentle clock update
    demoIntervalRef.current = setInterval(() => {
      const currentTime = formatCurrentTime();
      setTelemetry((prev) => {
        if (!prev) return null;
        // Minor realistic load cell noise (+/- 0.05g)
        const jitter = (Math.random() - 0.5) * 0.1;
        const newWeight = Math.max(0, parseFloat((prev.weight + jitter).toFixed(1)));
        return {
          ...prev,
          clock: currentTime,
          weight: newWeight,
        };
      });

      setScheduleData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          clock: currentTime,
        };
      });
    }, 1000);

    return () => {
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
        demoIntervalRef.current = null;
      }
    };
  }, [isDemoMode]);

  // ──────────────────────────────────────────────────────────────────────────
  // DIRECT ESP32 WI-FI CONNECTION (WEBSOCKET + HTTP REST)
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!esp32Host) {
      setIsDemoMode(true);
      setStationError("ESP32 host unconfigured");
      setStatusMessage("ESP32 host unconfigured");
      return;
    }

    setIsDemoMode(false);
    setStationStatus("connecting");
    setStatusMessage("connecting");
    setStationError(null);

    let isMounted = true;

    const resetWatchdog = () => {
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
      }
      watchdogTimerRef.current = setTimeout(() => {
        if (!isMounted) return;
        setIsStationOnline(false);
        setStationStatus("offline");
        setStatusMessage("station offline");
        setStationError("ESP32 telemetry timeout (>6s)");
      }, 6000);
    };

    const handleTelemetryFrame = (rawText: string) => {
      try {
        const data = JSON.parse(rawText);
        if (data && typeof data === "object") {
          const telemetryData: TelemetryData = {
            weight: typeof data.weight === "number" ? data.weight : 0,
            scaleOk: data.scaleOk !== undefined ? Boolean(data.scaleOk) : true,
            cat: Boolean(data.cat),
            visits: typeof data.visits === "number" ? data.visits : 0,
            water: typeof data.water === "number" ? data.water : 0,
            waterLow: Boolean(data.waterLow),
            pump: data.pump === "RUNNING" || data.pump === "STOPPING" ? data.pump : "OFF",
            dispensing: Boolean(data.dispensing),
            rssi: typeof data.rssi === "number" ? data.rssi : -60,
            clock: data.clock || formatCurrentTime(),
            timeOk: Boolean(data.timeOk),
            sched: data.sched || "08:00,18:00",
            lastAuto: data.lastAuto || "--",
          };

          setTelemetry(telemetryData);
          setScheduleData((prev) => {
            if (
              prev &&
              prev.sched === telemetryData.sched &&
              prev.clock === telemetryData.clock &&
              prev.timeOk === telemetryData.timeOk &&
              prev.lastAuto === telemetryData.lastAuto
            ) {
              return prev;
            }
            return {
              sched: telemetryData.sched,
              clock: telemetryData.clock,
              timeOk: telemetryData.timeOk,
              lastAuto: telemetryData.lastAuto,
            };
          });

          setIsStationOnline(true);
          setStationStatus("online");
          setStatusMessage("online");
          setStationError(null);
          resetWatchdog();
        }
      } catch {
        // Ignore malformed JSON frames safely
      }
    };

    function connectWs() {
      if (!isMounted) return;

      const wsUrl = buildWsUrl(esp32Host);
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
          setIsStationOnline(true);
          setStationStatus("online");
          setStatusMessage("online");
          setStationError(null);
          resetWatchdog();
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          if (typeof event.data === "string") {
            handleTelemetryFrame(event.data);
          }
        };

        ws.onerror = () => {
          if (!isMounted) return;
          setStationError("cannot reach ESP32");
          setStatusMessage("cannot reach ESP32");
        };

        ws.onclose = () => {
          if (!isMounted) return;
          setIsStationOnline(false);
          setStationStatus("offline");
          setStatusMessage("cannot reach ESP32");
          // Schedule reconnect attempt
          if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = setTimeout(connectWs, 3000);
        };
      } catch {
        setStationError("cannot reach ESP32");
        setStatusMessage("cannot reach ESP32");
        setStationStatus("offline");
        setIsStationOnline(false);
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = setTimeout(connectWs, 3000);
      }
    }

    connectWs();

    // Secondary HTTP telemetry poll fallback every 2.5s if WS is not open
    pollTimerRef.current = setInterval(async () => {
      if (!isMounted || !esp32Host) return;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(buildHttpUrl(esp32Host, "/api/telemetry"), {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const text = await res.text();
          handleTelemetryFrame(text);
        }
      } catch {
        // HTTP poll error handled by existing error/timeout state
      }
    }, 2500);

    return () => {
      isMounted = false;
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [esp32Host]);

  // ──────────────────────────────────────────────────────────────────────────
  // HARDWARE COMMAND ACTUATION
  // ──────────────────────────────────────────────────────────────────────────
  const sendCommand = useCallback(
    (command: StationCommand) => {
      // Demo / Mock Mode Execution
      if (isDemoMode) {
        if (command === "dispense") {
          setTelemetry((prev) => (prev ? { ...prev, dispensing: true } : prev));
          setTimeout(() => {
            setTelemetry((prev) =>
              prev
                ? {
                    ...prev,
                    dispensing: false,
                    weight: parseFloat((prev.weight + 15.0).toFixed(1)),
                  }
                : prev
            );
          }, 1500);
        } else if (command === "pump") {
          setTelemetry((prev) => (prev ? { ...prev, pump: "RUNNING" } : prev));
          setTimeout(() => {
            setTelemetry((prev) => (prev ? { ...prev, pump: "STOPPING" } : prev));
          }, 2400);
          setTimeout(() => {
            setTelemetry((prev) =>
              prev
                ? {
                    ...prev,
                    pump: "OFF",
                    water: Math.max(0, prev.water - 1),
                  }
                : prev
            );
          }, 3000);
        } else if (command === "tare") {
          setTelemetry((prev) => (prev ? { ...prev, weight: 0.0 } : prev));
        }
        return;
      }

      // Live ESP32 Wi-Fi Execution
      if (!isStationOnline) return;

      // 1. Try WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify({ cmd: command, command }));
        } catch {
          // Fall through to HTTP POST fallback
        }
      }

      // 2. HTTP POST fallback to /api/command
      if (esp32Host) {
        fetch(buildHttpUrl(esp32Host, "/api/command"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command }),
        }).catch(() => {
          /* Safely handled */
        });
      }
    },
    [isDemoMode, isStationOnline, esp32Host]
  );

  // ──────────────────────────────────────────────────────────────────────────
  // FEEDING SCHEDULE PUBLICATION
  // ──────────────────────────────────────────────────────────────────────────
  const publishSchedule = useCallback(
    (scheduleString: string) => {
      setLastSentSchedule(scheduleString);

      // Demo Mode Execution
      if (isDemoMode) {
        setTelemetry((prev) => (prev ? { ...prev, sched: scheduleString } : prev));
        setScheduleData((prev) => (prev ? { ...prev, sched: scheduleString } : prev));
        return;
      }

      // Live ESP32 Wi-Fi Execution
      if (!isStationOnline) return;

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(
            JSON.stringify({ type: "schedule", schedule: scheduleString })
          );
        } catch {
          // Fall through to HTTP POST
        }
      }

      if (esp32Host) {
        fetch(buildHttpUrl(esp32Host, "/api/schedule"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schedule: scheduleString }),
        }).catch(() => {
          /* Safely handled */
        });
      }
    },
    [isDemoMode, isStationOnline, esp32Host]
  );

  const statusValue = useMemo<StationStatusContextValue>(
    () => ({
      stationStatus,
      isStationOnline,
      statusMessage,
      stationError,
      brokerError: stationError, // Compatibility alias
      sendCommand,
      publishSchedule,
      lastSentSchedule,
      isConfigured: Boolean(esp32Host),
      isBrokerConfigured: Boolean(esp32Host), // Compatibility alias
      esp32Host,
      setEsp32Host,
      isDemoMode,
      setIsDemoMode,
    }),
    [
      stationStatus,
      isStationOnline,
      statusMessage,
      stationError,
      sendCommand,
      publishSchedule,
      lastSentSchedule,
      esp32Host,
      setEsp32Host,
      isDemoMode,
    ]
  );

  return (
    <StationStatusContext.Provider value={statusValue}>
      <StationScheduleContext.Provider value={scheduleData}>
        <StationTelemetryContext.Provider value={telemetry}>
          {children}
        </StationTelemetryContext.Provider>
      </StationScheduleContext.Provider>
    </StationStatusContext.Provider>
  );
}

// Hook for components that only need connection and status
export function useStationStatus(): StationStatusContextValue {
  const ctx = useContext(StationStatusContext);
  if (!ctx) {
    throw new Error("useStationStatus must be used within a StationProvider");
  }
  return ctx;
}

// Hook for Schedule card so it only re-renders when schedule/clock changes
export function useScheduleTelemetry(): ScheduleTelemetryData | null {
  return useContext(StationScheduleContext);
}

// Full hook for components that need active telemetry
export function usePawStation(): StationContextValue {
  const statusCtx = useContext(StationStatusContext);
  const telemetry = useContext(StationTelemetryContext);
  if (!statusCtx) {
    throw new Error("usePawStation must be used within a StationProvider");
  }
  return useMemo(
    () => ({
      ...statusCtx,
      telemetry,
    }),
    [statusCtx, telemetry]
  );
}

// Backward compatibility alias for usePawStationMqtt
export const usePawStationMqtt = usePawStation;
export const MqttProvider = StationProvider;

// Standalone station client helper
export interface StationConnection {
  ws: WebSocket | null;
  connect: () => void;
  disconnect: () => void;
  sendCommand: (command: StationCommand | string) => void;
  sendSchedule: (scheduleString: string) => void;
  publish: (command: StationCommand | string) => void; // alias
}

export type MqttConnection = StationConnection;

export function createStationClient(
  host: string,
  onTelemetry: (data: TelemetryData) => void,
  onStatus: (status: StationStatus) => void,
  onError?: (error: string) => void
): StationConnection {
  let ws: WebSocket | null = null;
  let watchdogTimeout: ReturnType<typeof setTimeout> | null = null;

  function resetTimeout() {
    if (watchdogTimeout) clearTimeout(watchdogTimeout);
    watchdogTimeout = setTimeout(() => {
      onStatus("offline");
      onError?.("telemetry timeout (>6s)");
    }, 6000);
  }

  function connect() {
    if (!host) {
      onError?.("ESP32 host unconfigured");
      onStatus("offline");
      return;
    }

    onStatus("connecting");
    try {
      ws = new WebSocket(buildWsUrl(host));
      ws.onopen = () => {
        onStatus("online");
        resetTimeout();
      };
      ws.onmessage = (event) => {
        if (typeof event.data === "string") {
          try {
            const data: TelemetryData = JSON.parse(event.data);
            onTelemetry(data);
            onStatus("online");
            resetTimeout();
          } catch {
            /* Safely ignored */
          }
        }
      };
      ws.onerror = () => {
        onError?.("cannot reach ESP32");
      };
      ws.onclose = () => {
        onStatus("offline");
      };
    } catch {
      onError?.("cannot reach ESP32");
      onStatus("offline");
    }
  }

  function disconnect() {
    if (watchdogTimeout) clearTimeout(watchdogTimeout);
    if (ws) {
      ws.close();
      ws = null;
    }
  }

  function sendCommand(command: StationCommand | string) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ cmd: command, command }));
    }
  }

  function sendSchedule(scheduleString: string) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "schedule", schedule: scheduleString }));
    }
  }

  return {
    ws,
    connect,
    disconnect,
    sendCommand,
    sendSchedule,
    publish: sendCommand,
  };
}

export const createMqttClient = createStationClient;
