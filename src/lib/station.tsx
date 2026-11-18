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
  raw?: number;
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

export {
  ALLOWED_STATION_COMMANDS,
  isAllowedStationCommand,
  isValidStationHost,
  sanitizeStationHost,
  isValidScheduleString,
  isPrivateHost,
  type StationCommand,
} from "./station-validation";

import {
  ALLOWED_STATION_COMMANDS,
  isAllowedStationCommand,
  isValidStationHost,
  sanitizeStationHost,
  isValidScheduleString,
  isPrivateHost,
  type StationCommand,
} from "./station-validation";

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
  scaleInverted: boolean;
  setScaleInverted: (inverted: boolean) => void;
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

const DEFAULT_ENV_HOST = process.env.NEXT_PUBLIC_ESP32_HOST?.trim() || "192.168.0.118";

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
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [scheduleData, setScheduleData] = useState<ScheduleTelemetryData | null>(null);
  const [stationStatus, setStationStatus] = useState<StationStatus>(
    DEFAULT_ENV_HOST ? "connecting" : "offline"
  );
  const [isStationOnline, setIsStationOnline] = useState<boolean>(false);
  const [stationError, setStationError] = useState<string | null>(
    DEFAULT_ENV_HOST ? null : "ESP32 host unconfigured"
  );
  const [statusMessage, setStatusMessage] = useState<string>(
    DEFAULT_ENV_HOST ? "connecting" : "ESP32 host unconfigured"
  );
  const [lastSentSchedule, setLastSentSchedule] = useState<string | null>(null);
  const [scaleInverted, setScaleInvertedState] = useState<boolean>(true);

  // Load saved scale polarity preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("pawstation_scale_inverted");
        if (saved !== null) {
          setScaleInvertedState(saved === "true");
        }
      } catch {
        /* ignore */
      }
    }
  }, []);

  const setScaleInverted = useCallback((inverted: boolean) => {
    setScaleInvertedState(inverted);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("pawstation_scale_inverted", String(inverted));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const wsRef = useRef<WebSocket | null>(null);
  const watchdogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const lastCommandTimesRef = useRef<{ [key: string]: number }>({});

  // Load saved host from localStorage or fetch server environment host
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("pawstation_esp32_host");
        if (saved && isValidStationHost(saved.trim())) {
          const sanitized = sanitizeStationHost(saved.trim());
          if (sanitized) {
            setEsp32HostState(sanitized);
            return;
          }
        }
      } catch {
        /* ignore */
      }

      // If no valid localStorage value, synchronize with backend .env host
      fetch("/api/station/host")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.host && isValidStationHost(data.host)) {
            const sanitized = sanitizeStationHost(data.host);
            if (sanitized) {
              setEsp32HostState(sanitized);
              try {
                localStorage.setItem("pawstation_esp32_host", sanitized);
              } catch {
                /* ignore */
              }
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  const setEsp32Host = useCallback((host: string) => {
    const trimmed = host.trim();
    if (!trimmed) {
      setEsp32HostState("");
      setStationError("ESP32 host unconfigured");
      setStatusMessage("ESP32 host unconfigured");
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("pawstation_esp32_host");
        } catch {
          /* ignore */
        }
      }
      return;
    }

    if (!isValidStationHost(trimmed)) {
      setStationError("Invalid host address format");
      setStatusMessage("Invalid host address format");
      return;
    }

    const sanitized = sanitizeStationHost(trimmed);
    setEsp32HostState(sanitized);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("pawstation_esp32_host", sanitized);
      } catch {
        /* ignore */
      }
    }

    // Persist to .env and server process environment in the background
    fetch("/api/station/host", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host: sanitized }),
    }).catch(() => {});
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // DIRECT ESP32 WI-FI CONNECTION (WEBSOCKET + HTTP REST)
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!esp32Host) {
      setStationStatus("offline");
      setIsStationOnline(false);
      setStationError("ESP32 host unconfigured");
      setStatusMessage("ESP32 host unconfigured");
      return;
    }

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
          let weightVal = typeof data.weight === "number" ? data.weight : 0;
          // When scale polarity is reversed (e.g. load cell beam inverted or negative delta),
          // rectify negative readings so downward pressure displays as positive grams
          if (scaleInverted && weightVal < 0) {
            weightVal = Math.abs(weightVal);
          }
          if (Math.abs(weightVal) < 2.0) {
            weightVal = 0.0;
          }

          const isCat = Boolean(data.cat) || (Math.abs(weightVal) >= 500);

          const telemetryData: TelemetryData = {
            weight: weightVal,
            raw: typeof data.raw === "number" ? data.raw : (typeof data.rawValue === "number" ? data.rawValue : undefined),
            scaleOk: data.scaleOk !== undefined ? Boolean(data.scaleOk) : true,
            cat: isCat,
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
      // Modern browsers forbid unencrypted ws:// on https:// origins with an immediate SecurityError DOMException.
      // Skip WebSocket and rely cleanly on HTTP polling when on an HTTPS origin.
      if (typeof window !== "undefined" && window.location.protocol === "https:" && wsUrl.startsWith("ws://")) {
        return;
      }

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
          // Keep attempting without prematurely locking out HTTP fallback
        };

        ws.onclose = () => {
          if (!isMounted) return;
          // Do not immediately force offline if telemetry is being received via HTTP proxy
          if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = setTimeout(connectWs, 3000);
        };
      } catch {
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = setTimeout(connectWs, 3000);
      }
    }

    connectWs();

    // Hybrid HTTP telemetry poll (runs every 1.2s whenever WS is not actively delivering)
    const pollTelemetry = async () => {
      if (!isMounted || !esp32Host) return;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

      const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
      const isPrivate = isPrivateHost(esp32Host);

      // 1. Try Next.js server proxy & Cloud Relay (guaranteed HTTPS delivery for Vercel & mobile)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(
          `/api/station/telemetry?host=${encodeURIComponent(esp32Host)}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (res.ok) {
          const text = await res.text();
          handleTelemetryFrame(text);
          return;
        }
      } catch {
        // Fall through to direct fetch
      }

      // 2. Direct fetch fallback from browser to local ESP32 IP
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1800);
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
    };

    pollTelemetry();
    pollTimerRef.current = setInterval(pollTelemetry, 1200);

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
      // Security: Validate against strictly allowed commands enum
      if (!isAllowedStationCommand(command)) {
        console.warn(`[Security] Rejected unauthorized station command: ${command}`);
        return;
      }

      // Live ESP32 Wi-Fi Execution
      if (!isStationOnline) return;

      // Rate limit / debouncing guard: min 1000ms cooldown per command to prevent actuator burnout & flooding
      const now = Date.now();
      const lastExec = lastCommandTimesRef.current[command] || 0;
      if (now - lastExec < 1000) {
        return;
      }
      lastCommandTimesRef.current[command] = now;

      // 1. Try WebSocket (send both raw command and JSON for complete firmware compatibility)
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify({ cmd: command, command }));
          wsRef.current.send(command);
          return;
        } catch {
          // Fall through to proxy / HTTP
        }
      }

      // 2. Next.js server proxy (guaranteed delivery across private networks)
      fetch("/api/station/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command, host: esp32Host }),
      }).catch(() => {});

      // 3. Fallback direct HTTP calls (both dedicated endpoint and REST API)
      if (esp32Host && isValidStationHost(esp32Host)) {
        // Dedicated zero-overhead route (/dispense, /pump, /tare)
        fetch(buildHttpUrl(esp32Host, `/${command}`), {
          method: "GET",
          mode: "no-cors",
        }).catch(() => {});

        // Direct POST to /api/command
        fetch(buildHttpUrl(esp32Host, "/api/command"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command, cmd: command }),
          mode: "no-cors",
        }).catch(() => {});
      }
    },
    [isStationOnline, esp32Host]
  );

  // ──────────────────────────────────────────────────────────────────────────
  // FEEDING SCHEDULE PUBLICATION
  // ──────────────────────────────────────────────────────────────────────────
  const publishSchedule = useCallback(
    (scheduleString: string) => {
      const trimmed = scheduleString.trim();
      // Security: Validate schedule format before dispatching to ESP32 firmware parser
      if (!isValidScheduleString(trimmed)) {
        console.warn(`[Security] Rejected invalid schedule string: ${scheduleString}`);
        return;
      }

      setLastSentSchedule(trimmed);

      // Live ESP32 Wi-Fi Execution
      if (!isStationOnline) return;

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(
            JSON.stringify({ type: "schedule", schedule: trimmed })
          );
        } catch {
          // Fall through to proxy / HTTP
        }
      }

      // Next.js server proxy fallback
      fetch("/api/station/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule: trimmed, host: esp32Host }),
      }).catch(() => {
        if (esp32Host && isValidStationHost(esp32Host)) {
          fetch(buildHttpUrl(esp32Host, "/api/schedule"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ schedule: trimmed }),
          }).catch(() => {});
        }
      });
    },
    [isStationOnline, esp32Host]
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
      scaleInverted,
      setScaleInverted,
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
      scaleInverted,
      setScaleInverted,
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
    if (!isAllowedStationCommand(command)) {
      onError?.(`Rejected unauthorized command: ${command}`);
      return;
    }
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ cmd: command, command }));
    }
  }

  function sendSchedule(scheduleString: string) {
    const trimmed = scheduleString.trim();
    if (!isValidScheduleString(trimmed)) {
      onError?.(`Rejected invalid schedule format: ${scheduleString}`);
      return;
    }
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "schedule", schedule: trimmed }));
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
