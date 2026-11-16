"use client";

/**
 * Backward-compatibility shim for active development sessions, HMR caches,
 * and legacy imports.
 *
 * All MQTT broker infrastructure has been replaced with the direct ESP32
 * Wi-Fi communication architecture in @/lib/station.
 */
export * from "./station";

export {
  StationProvider as MqttProvider,
  usePawStation as usePawStationMqtt,
  useStationStatus,
  useScheduleTelemetry,
  createStationClient as createMqttClient,
} from "./station";

export type {
  StationStatusContextValue as MqttStatusContextValue,
  StationContextValue as MqttContextValue,
  StationConnection as MqttConnection,
} from "./station";
