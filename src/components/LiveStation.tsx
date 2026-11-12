"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  ScaleIcon,
  WaterDropIcon,
  KibbleIcon,
  PumpIcon,
  CatIcon,
  SignalIcon,
  TareIcon,
  PawIcon,
} from "./Icons";
import {
  createMqttClient,
  type TelemetryData,
  type StationStatus,
  type MqttConnection,
} from "@/lib/mqtt";
import { supabase } from "@/lib/supabase";

interface CatVisit {
  id: string;
  visit_start: string;
  peak_weight_g: number;
  duration_seconds: number | null;
}

export default function LiveStation() {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [stationStatus, setStationStatus] = useState<StationStatus>("connecting");
  const [brokerError, setBrokerError] = useState<string | null>(null);
  const [catVisits, setCatVisits] = useState<CatVisit[]>([]);
  const mqttRef = useRef<MqttConnection | null>(null);

  const handleTelemetry = useCallback((data: TelemetryData) => {
    setTelemetry(data);
    setBrokerError(null);
  }, []);

  const handleStatus = useCallback((status: StationStatus) => {
    setStationStatus(status);
  }, []);

  const handleBrokerError = useCallback((error: string) => {
    setBrokerError(error);
  }, []);

  // MQTT connection
  useEffect(() => {
    const conn = createMqttClient(handleTelemetry, handleStatus, handleBrokerError);
    mqttRef.current = conn;
    conn.connect();
    return () => conn.disconnect();
  }, [handleTelemetry, handleStatus, handleBrokerError]);

  // Fetch recent cat visits from Supabase
  useEffect(() => {
    async function fetchVisits() {
      try {
        const { data } = await supabase
          .from("cat_visits")
          .select("id, visit_start, peak_weight_g, duration_seconds")
          .order("visit_start", { ascending: false })
          .limit(5);
        if (data) setCatVisits(data);
      } catch {
        /* Supabase may not be configured yet */
      }
    }
    fetchVisits();

    // Subscribe to realtime inserts
    const channel = supabase
      .channel("cat-visits-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "cat_visits" },
        (payload) => {
          setCatVisits((prev) => [payload.new as CatVisit, ...prev].slice(0, 5));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const [commandCooldown, setCommandCooldown] = useState(false);

  const sendCommand = (cmd: "dispense" | "pump" | "tare") => {
    if (commandCooldown) return;
    setCommandCooldown(true);
    mqttRef.current?.publish(cmd);
    setTimeout(() => {
      setCommandCooldown(false);
    }, 1200);
  };

  const isOnline = stationStatus === "online";
  const isConnecting = stationStatus === "connecting";

  // Water level percentage (map raw 0-4095 to percentage; LOW_WATER_RAW=1500)
  const waterPercent = telemetry
    ? Math.min(100, Math.max(0, Math.round((telemetry.water / 4095) * 100)))
    : 0;

  const rssiLabel = (rssi: number) => {
    if (rssi > -50) return "Excellent";
    if (rssi > -60) return "Good";
    if (rssi > -70) return "Fair";
    return "Weak";
  };

  return (
    <section id="live-station" className="py-20 md:py-28 bg-canvas-light dark:bg-canvas-dark transition-colors duration-200">
      <div className="section-container">
        <div className="text-center mb-12">
          <span className="inline-block text-[11px] font-semibold tracking-[0.04em] uppercase text-accent-azure mb-3">
            Live Hardware Console
          </span>
          <h2 className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold tracking-tight text-[#18181B] dark:text-[#F4F4F5]">
            PawStation Console
          </h2>
        </div>

        {/* Console container */}
        <div className="max-w-4xl mx-auto bg-[#121214] rounded-apple-lg border border-white/[0.06] overflow-hidden">
          {/* Console header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <PawIcon className="w-4 h-4 text-accent-amber" />
              <span className="text-[13px] font-semibold text-[#F4F4F5]">
                PawStation Console
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Connection status */}
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isOnline
                      ? "bg-sky-500"
                      : isConnecting
                      ? "bg-accent-amber animate-pulse"
                      : "bg-accent-crimson"
                  }`}
                />
                <span className="text-[11px] font-medium text-[#A1A1AA]">
                  {isOnline
                    ? "ESP32: Online"
                    : isConnecting
                    ? "Connecting..."
                    : "Station Offline"}
                </span>
              </div>
              {telemetry && (
                <span className="text-[11px] text-[#71717A]">8883 TLS</span>
              )}
            </div>
          </div>

          {/* Broker error */}
          {brokerError && (
            <div className="px-5 py-2 bg-accent-crimson/10 border-b border-accent-crimson/20">
              <p className="text-[12px] text-accent-crimson">{brokerError}</p>
            </div>
          )}

          {/* Main console grid */}
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Scale tile */}
            <div className="console-tile">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ScaleIcon className="w-4 h-4 text-accent-amber" />
                  <span className="console-label">Load Cell</span>
                </div>
                {telemetry && (
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      telemetry.scaleOk
                        ? "bg-sky-500/15 text-sky-600 dark:text-sky-400"
                        : "bg-accent-crimson/15 text-accent-crimson"
                    }`}
                  >
                    {telemetry.scaleOk ? "Stable" : "Offline"}
                  </span>
                )}
              </div>
              <div className="console-value">
                {telemetry ? `${telemetry.weight.toFixed(1)} g` : <SkeletonPill />}
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <CatIcon
                    className={`w-3.5 h-3.5 ${
                      telemetry?.cat ? "text-accent-amber" : "text-[#52525B]"
                    }`}
                  />
                  <span className="text-[12px] text-[#A1A1AA]">
                    {telemetry?.cat ? "Cat Present" : "No Cat"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <PawIcon className="w-3 h-3 text-[#52525B]" />
                  <span className="text-[12px] text-[#A1A1AA]">
                    Visits: {telemetry?.visits ?? "--"}
                  </span>
                </div>
              </div>
            </div>

            {/* Water tile */}
            <div className="console-tile">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <WaterDropIcon className="w-4 h-4 text-accent-azure" />
                  <span className="console-label">Water Reservoir</span>
                </div>
                {telemetry && (
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      telemetry.waterLow
                        ? "bg-accent-crimson/15 text-accent-crimson"
                        : "bg-sky-500/15 text-sky-600 dark:text-sky-400"
                    }`}
                  >
                    {telemetry.waterLow ? "Low" : "Adequate"}
                  </span>
                )}
              </div>
              <div className="console-value">
                {telemetry ? `${waterPercent}%` : <SkeletonPill />}
              </div>
              {/* Water level bar */}
              <div className="mt-3 w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    telemetry?.waterLow ? "bg-accent-crimson" : "bg-accent-azure"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${waterPercent}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[12px] text-[#A1A1AA]">
                  Pump: {telemetry?.pump ?? "OFF"}
                </span>
              </div>
            </div>
          </div>

          {/* Hardware controls */}
          <div className="px-5 pb-5">
            <div className="console-tile">
              <div className="flex items-center justify-between mb-4">
                <span className="console-label">Hardware Controls</span>
                {telemetry?.waterLow && (
                  <span className="text-[11px] font-medium text-accent-crimson bg-accent-crimson/15 px-2.5 py-0.5 rounded-full">
                    Pump Lockout: Low Water
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => sendCommand("dispense")}
                  disabled={!isOnline || telemetry?.dispensing || commandCooldown}
                  className="apple-button bg-accent-amber text-white hover:bg-accent-amber/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <KibbleIcon className="w-4 h-4" />
                  Dispense Food
                </button>
                <button
                  onClick={() => sendCommand("pump")}
                  disabled={
                    !isOnline ||
                    telemetry?.pump !== "OFF" ||
                    telemetry?.waterLow ||
                    commandCooldown
                  }
                  title={
                    telemetry?.waterLow
                      ? "Pump locked to prevent motor burnout while reservoir is low"
                      : "Trigger water pump cycle (3 seconds)"
                  }
                  className="apple-button bg-accent-azure text-white hover:bg-accent-azure/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <PumpIcon className="w-4 h-4" />
                  Run Pump (3s)
                </button>
                <button
                  onClick={() => sendCommand("tare")}
                  disabled={!isOnline || commandCooldown}
                  className="apple-button bg-[#2C2C2E] text-[#F4F4F5] hover:bg-[#3A3A3C] border border-white/[0.1] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <TareIcon className="w-4 h-4" />
                  Zero Scale
                </button>
              </div>
            </div>
          </div>

          {/* Bottom panel: visits + signal */}
          <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cat visit log */}
            <div className="console-tile">
              <div className="flex items-center gap-2 mb-4">
                <CatIcon className="w-4 h-4 text-accent-amber" />
                <span className="console-label">Cat Visit Log (Supabase)</span>
              </div>
              {catVisits.length > 0 ? (
                <div className="space-y-2">
                  {catVisits.map((v) => {
                    const time = new Date(v.visit_start).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" }
                    );
                    const dur = v.duration_seconds
                      ? `${Math.floor(v.duration_seconds / 60)}m ${v.duration_seconds % 60}s`
                      : "active";
                    return (
                      <div
                        key={v.id}
                        className="flex items-center justify-between text-[12px]"
                      >
                        <span className="text-[#A1A1AA]">{time}</span>
                        <span className="text-[#F4F4F5] font-mono">
                          {v.peak_weight_g.toFixed(2)} kg
                        </span>
                        <span className="text-[#71717A]">{dur}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-4 skeleton-pill rounded" />
                  ))}
                </div>
              )}
            </div>

            {/* Signal and status */}
            <div className="console-tile">
              <div className="flex items-center gap-2 mb-4">
                <SignalIcon className="w-4 h-4 text-sky-500" />
                <span className="console-label">Station Telemetry</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#A1A1AA]">Wi-Fi RSSI</span>
                  <span className="text-[#F4F4F5] font-mono">
                    {telemetry ? `${telemetry.rssi} dBm (${rssiLabel(telemetry.rssi)})` : "--"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#A1A1AA]">Broker Port</span>
                  <span className="text-[#F4F4F5] font-mono">8884 WSS</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#A1A1AA]">Protocol</span>
                  <span className="text-[#F4F4F5] font-mono">MQTT/TLS</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#A1A1AA]">Dispensing</span>
                  <span className={`font-mono ${telemetry?.dispensing ? "text-accent-amber" : "text-[#F4F4F5]"}`}>
                    {telemetry?.dispensing ? "Active" : "Idle"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SkeletonPill() {
  return <div className="h-8 w-28 skeleton-pill rounded-md" />;
}
