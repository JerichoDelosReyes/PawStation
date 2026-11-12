"use client";

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
}

export type StationStatus = "online" | "offline" | "connecting";

export type StationCommand = "dispense" | "pump" | "tare";

// Strictly allowlisted actuator commands per Docs/Security Architecture and Hardening.md Section 2.3
const ALLOWED_COMMANDS = new Set<string>(["dispense", "pump", "tare"]);

export interface MqttConnection {
  client: mqtt.MqttClient | null;
  connect: () => void;
  disconnect: () => void;
  publish: (command: StationCommand | string) => void;
}

const HIVEMQ_HOST = process.env.NEXT_PUBLIC_HIVEMQ_HOST || "";
const HIVEMQ_PORT = process.env.NEXT_PUBLIC_HIVEMQ_PORT || "8884";
const HIVEMQ_PATH = process.env.NEXT_PUBLIC_HIVEMQ_PATH || "/mqtt";
const HIVEMQ_USER = process.env.NEXT_PUBLIC_HIVEMQ_USER || "";
const HIVEMQ_PASS = process.env.NEXT_PUBLIC_HIVEMQ_PASS || "";

const BROKER_URL = `wss://${HIVEMQ_HOST}:${HIVEMQ_PORT}${HIVEMQ_PATH}`;

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
    if (!HIVEMQ_HOST) {
      onBrokerError("MQTT broker host not configured");
      return;
    }

    onStatus("connecting");

    try {
      client = mqtt.connect(BROKER_URL, {
        username: HIVEMQ_USER,
        password: HIVEMQ_PASS,
        clientId: `pawstation-web-${Math.random().toString(16).slice(2, 10)}`,
        clean: true,
        reconnectPeriod: 5000,
        connectTimeout: 10000,
      });

      client.on("connect", () => {
        client?.subscribe(["pawstation/telemetry", "pawstation/status"]);
        resetTelemetryTimeout();
      });

      client.on("message", (topic: string, payload: Buffer) => {
        const message = payload.toString();

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
        onBrokerError(`Broker connection error: ${err.message}`);
      });

      client.on("offline", () => {
        onBrokerError("Lost connection to broker");
      });

      client.on("reconnect", () => {
        onStatus("connecting");
      });
    } catch (err) {
      onBrokerError(`Failed to connect: ${err}`);
    }
  }

  function disconnect() {
    if (telemetryTimeout) clearTimeout(telemetryTimeout);
    client?.end(true);
    client = null;
  }

  function publish(command: StationCommand | string) {
    // Validate command against strict allowlist before emitting
    if (!ALLOWED_COMMANDS.has(command)) {
      console.warn(`[Security] Rejected unauthorized command: ${command}`);
      return;
    }

    if (client?.connected) {
      client.publish("pawstation/cmd", command);
    }
  }

  return { client, connect, disconnect, publish };
}
