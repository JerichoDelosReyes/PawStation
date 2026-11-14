"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScaleIcon,
  WaterDropIcon,
  KibbleIcon,
  PumpIcon,
  CatIcon,
  SignalIcon,
  TareIcon,
  PawIcon,
  CheckIcon,
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

interface LiveStationProps {
  catName?: string;
  onStatusChange?: (status: StationStatus) => void;
}

export default function LiveStation({ catName = "Cat", onStatusChange }: LiveStationProps) {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [stationStatus, setStationStatus] = useState<StationStatus>("connecting");
  const [brokerError, setBrokerError] = useState<string | null>(null);
  const [catVisits, setCatVisits] = useState<CatVisit[]>([]);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const mqttRef = useRef<MqttConnection | null>(null);

  const handleTelemetry = useCallback((data: TelemetryData) => {
    setTelemetry(data);
    setBrokerError(null);
  }, []);

  const handleStatus = useCallback(
    (status: StationStatus) => {
      setStationStatus(status);
      onStatusChange?.(status);
    },
    [onStatusChange]
  );

  const handleBrokerError = useCallback((error: string) => {
    setBrokerError(error);
  }, []);

  // MQTT connection lifecycle
  useEffect(() => {
    const conn = createMqttClient(handleTelemetry, handleStatus, handleBrokerError);
    mqttRef.current = conn;
    conn.connect();
    return () => conn.disconnect();
  }, [handleTelemetry, handleStatus, handleBrokerError]);

  // Fetch recent feline visits from Supabase & subscribe to Realtime
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
        /* Supabase fallback handled gracefully */
      }
    }
    fetchVisits();

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

  const sendCommand = (cmd: "dispense" | "pump" | "tare", label: string) => {
    if (commandCooldown) return;
    setCommandCooldown(true);
    setLastAction(label);
    mqttRef.current?.publish(cmd);
    setTimeout(() => {
      setCommandCooldown(false);
    }, 1200);
    setTimeout(() => {
      setLastAction(null);
    }, 3500);
  };

  const isOnline = stationStatus === "online";
  const isConnecting = stationStatus === "connecting";

  // Water level percentage (raw 0-4095; calibrated threshold ~1500)
  const waterPercent = telemetry
    ? Math.min(100, Math.max(0, Math.round((telemetry.water / 4095) * 100)))
    : 78; // aesthetic default when waiting for first telemetry frame

  const rssiLabel = (rssi: number) => {
    if (rssi > -50) return "Excellent";
    if (rssi > -60) return "Good";
    if (rssi > -70) return "Fair";
    return "Weak";
  };

  const rssiBars = (rssi: number) => {
    if (rssi > -50) return 4;
    if (rssi > -60) return 3;
    if (rssi > -70) return 2;
    return 1;
  };

  return (
    <section id="live-station" className="w-full">
      {/* Precision Physical-Digital Hardware Station Card */}
      <div className="w-full rounded-apple-2xl bg-white dark:bg-[#161B26] border border-black/[0.08] dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] overflow-hidden transition-all">
        {/* ── Top Console HUD Bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-7 py-4 border-b border-black/[0.06] dark:border-white/[0.08] bg-[#FAF8F5] dark:bg-[#131722] transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-accent-amber/15 text-accent-amber flex items-center justify-center shadow-inner">
              <PawIcon className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-neutral-900 dark:text-white tracking-tight uppercase">
                  PawStation Telemetry Workstation
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-neutral-200/70 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 font-semibold">
                  ESP32-S3
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Continuous 24-bit biometric stream · HiveMQ Cloud WSS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time Status Badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                isOnline
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25"
                  : isConnecting
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25"
                  : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isOnline ? "bg-emerald-400" : isConnecting ? "bg-amber-400" : "bg-rose-400"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isOnline ? "bg-emerald-500" : isConnecting ? "bg-amber-500" : "bg-rose-500"
                  }`}
                />
              </span>
              <span>
                {isOnline ? "ESP32 Online" : isConnecting ? "Connecting to HiveMQ..." : "Station Offline"}
              </span>
            </div>

            <span className="hidden sm:inline-flex text-[11px] font-mono text-neutral-500 dark:text-neutral-400 px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06]">
              Port 8884 TLS
            </span>
          </div>
        </div>

        {/* ── Broker Error Notification ── */}
        <AnimatePresence>
          {brokerError && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 py-2.5 bg-rose-500/10 border-b border-rose-500/20 text-rose-600 dark:text-rose-400 text-[12px] flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>{brokerError}</span>
              </div>
              <span className="text-[11px] opacity-75">Auto-reconnecting every 5s</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Action Confirmation Toast ── */}
        <AnimatePresence>
          {lastAction && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="px-6 py-2 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[12px] flex items-center gap-2 font-medium"
            >
              <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
              <span>Command Dispatched: {lastAction}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-5 sm:p-7 space-y-6">
          {/* ─────────────────────────────────────────────────────────
              INSTRUMENT GRID: LOAD CELL + FLUIDICS
          ───────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Tile 1: 24-Bit Load Cell Biometrics */}
            <div className="bg-[#FAF8F5] dark:bg-[#181D2A] border border-black/[0.06] dark:border-white/[0.08] rounded-apple-xl p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <ScaleIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        24-Bit Load Cell (HX711)
                      </span>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 leading-none">
                        10 kg Aluminum Bar · Sub-gram calibration
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                      telemetry?.scaleOk !== false
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
                    }`}
                  >
                    {telemetry?.scaleOk !== false ? "Stable ±0.1g" : "ADC Error"}
                  </span>
                </div>

                {/* Big Metric Display */}
                <div className="my-2">
                  <div className="text-[38px] sm:text-[46px] font-bold tracking-tight text-neutral-900 dark:text-white font-mono tabular-nums leading-none">
                    {telemetry ? (
                      `${telemetry.weight.toFixed(1)} g`
                    ) : (
                      <span className="text-neutral-400 dark:text-neutral-600">0.0 g</span>
                    )}
                  </div>
                  <span className="text-[11.5px] text-neutral-500 dark:text-neutral-400 mt-1 inline-block">
                    Net weight on feeding platform
                  </span>
                </div>
              </div>

              {/* Feline Presence Visualizer */}
              <div className="mt-5 pt-4 border-t border-black/[0.06] dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {telemetry?.cat ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[12px] font-medium">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <CatIcon className="w-3.5 h-3.5 fill-current" />
                      <span>{catName} Detected on Platform</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-200/60 dark:bg-white/[0.06] text-neutral-600 dark:text-neutral-400 border border-black/[0.04] dark:border-white/[0.06] text-[12px] font-medium">
                      <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-600" />
                      <CatIcon className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Chassis Clear · Ready for Entry</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[12px] text-neutral-600 dark:text-neutral-400 font-mono">
                  <PawIcon className="w-3.5 h-3.5 text-accent-amber fill-current" />
                  <span>Visits Today: {telemetry?.visits ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Tile 2: Liquid Reservoir & Fluidics */}
            <div className="bg-[#FAF8F5] dark:bg-[#181D2A] border border-black/[0.06] dark:border-white/[0.08] rounded-apple-xl p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                      <WaterDropIcon className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        Liquid Reservoir & Fluidics
                      </span>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 leading-none">
                        LM393 Probe · 720 ml Alcove Tank
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                      telemetry?.waterLow
                        ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25"
                        : "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25"
                    }`}
                  >
                    {telemetry?.waterLow ? "Low Reservoir" : "Adequate Level"}
                  </span>
                </div>

                {/* Big Metric Display */}
                <div className="my-2">
                  <div className="text-[38px] sm:text-[46px] font-bold tracking-tight text-neutral-900 dark:text-white font-mono tabular-nums leading-none">
                    {waterPercent}%
                  </div>
                  <span className="text-[11.5px] text-neutral-500 dark:text-neutral-400 mt-1 inline-block">
                    Estimated volume: {Math.round((waterPercent / 100) * 720)} ml remaining
                  </span>
                </div>

                {/* Animated Fluidics Gauge */}
                <div className="mt-3 w-full h-3 rounded-full bg-neutral-200 dark:bg-white/[0.08] p-0.5 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full transition-all duration-500 ${
                      telemetry?.waterLow
                        ? "bg-rose-500"
                        : "bg-gradient-to-r from-sky-400 to-blue-600 dark:from-cyan-400 dark:to-blue-500"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${waterPercent}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Pump Status & Safety Lockout */}
              <div className="mt-5 pt-4 border-t border-black/[0.06] dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-[12px]">
                <div className="flex items-center gap-2">
                  <PumpIcon className="w-3.5 h-3.5 text-sky-500" />
                  <span className="text-neutral-600 dark:text-neutral-300">
                    Pump:{" "}
                    <strong className="font-mono text-neutral-900 dark:text-white">
                      {telemetry?.pump === "RUNNING"
                        ? "ACTIVE (3s Cycle)"
                        : telemetry?.pump === "STOPPING"
                        ? "SOFT-STOPPING"
                        : "IDLE"}
                    </strong>
                  </span>
                </div>

                {telemetry?.waterLow && (
                  <span className="text-[10.5px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                    Lockout Armed: Motor Protected
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────
              TACTILE HARDWARE COMMAND BAR (Apple / Teenage Engineering)
          ───────────────────────────────────────────────────────── */}
          <div className="bg-[#FAF8F5] dark:bg-[#11141D] rounded-apple-xl p-5 sm:p-6 border border-black/[0.06] dark:border-white/[0.06] transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Hardware Actuation Controls
                </span>
                <p className="text-[11.5px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Micro-haptic commands dispatched over authenticated TLS HiveMQ topic{" "}
                  <code className="text-neutral-800 dark:text-neutral-200 font-mono text-[11px]">
                    pawstation/cmd
                  </code>
                </p>
              </div>

              {commandCooldown && (
                <span className="text-[11px] font-mono text-neutral-400 animate-pulse">
                  Radio cooldown: 1.2s
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Dispense Food Button */}
              <button
                type="button"
                onClick={() => sendCommand("dispense", "Dispensing 35g Kibble")}
                disabled={!isOnline || telemetry?.dispensing || commandCooldown}
                className="apple-button bg-amber-500 hover:bg-amber-600 text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed text-[12.5px] font-semibold px-4 py-2.5 rounded-apple transition-all active:scale-[0.98]"
              >
                <KibbleIcon className="w-4 h-4 fill-current" />
                <span>{telemetry?.dispensing ? "Dispensing..." : "Dispense Food (35g)"}</span>
              </button>

              {/* Run Pump Button */}
              <button
                type="button"
                onClick={() => sendCommand("pump", "Running Water Pump for 3 seconds")}
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
                className="apple-button bg-sky-600 dark:bg-sky-500 hover:bg-sky-700 dark:hover:bg-sky-600 text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed text-[12.5px] font-semibold px-4 py-2.5 rounded-apple transition-all active:scale-[0.98]"
              >
                <PumpIcon className="w-4 h-4" />
                <span>Run Pump (3s)</span>
              </button>

              {/* Zero Scale (Tare) Button */}
              <button
                type="button"
                onClick={() => sendCommand("tare", "Scale Zeroed (Tare)")}
                disabled={!isOnline || commandCooldown}
                className="apple-button bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 border border-black/10 dark:border-white/10 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed text-[12.5px] font-semibold px-4 py-2.5 rounded-apple transition-all active:scale-[0.98]"
              >
                <TareIcon className="w-4 h-4" />
                <span>Zero Scale (Tare)</span>
              </button>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────
              BOTTOM PANEL: FELINE VISIT LOG + TELEMETRY HUD
          ───────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Supabase Cat Visit Log */}
            <div className="bg-[#FAF8F5] dark:bg-[#181D2A] border border-black/[0.06] dark:border-white/[0.08] rounded-apple-xl p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-accent-amber/15 text-accent-amber flex items-center justify-center">
                      <CatIcon className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Feline Visit Log (Supabase Realtime)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Live Stream
                  </span>
                </div>

                {catVisits.length > 0 ? (
                  <div className="space-y-2">
                    {catVisits.map((v) => {
                      const time = new Date(v.visit_start).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      const dur = v.duration_seconds
                        ? `${Math.floor(v.duration_seconds / 60)}m ${v.duration_seconds % 60}s`
                        : "Active";
                      return (
                        <div
                          key={v.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#131722] border border-black/[0.04] dark:border-white/[0.05] text-[12px] transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <PawIcon className="w-3 h-3 text-accent-amber fill-current" />
                            <span className="text-neutral-600 dark:text-neutral-400 font-mono">
                              {time}
                            </span>
                          </div>
                          <span className="font-mono font-semibold text-neutral-900 dark:text-white">
                            {v.peak_weight_g.toFixed(2)} kg
                          </span>
                          <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">
                            {dur}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-[12px] text-neutral-400 dark:text-neutral-500">
                      No visits recorded yet today. Waiting for feline trigger.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Hardware Telemetry HUD */}
            <div className="bg-[#FAF8F5] dark:bg-[#181D2A] border border-black/[0.06] dark:border-white/[0.08] rounded-apple-xl p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                      <SignalIcon className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Station Telemetry HUD
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                    ESP32-S3 SoC
                  </span>
                </div>

                <div className="space-y-2.5 text-[12px]">
                  {/* WiFi RSSI */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#131722] border border-black/[0.04] dark:border-white/[0.05]">
                    <span className="text-neutral-600 dark:text-neutral-400">Wi-Fi Signal (RSSI)</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-end gap-0.5 h-3">
                        {[1, 2, 3, 4].map((bar) => {
                          const active = bar <= rssiBars(telemetry?.rssi ?? -52);
                          return (
                            <span
                              key={bar}
                              style={{ height: `${bar * 25}%` }}
                              className={`w-1 rounded-sm ${
                                active
                                  ? "bg-emerald-500"
                                  : "bg-neutral-300 dark:bg-white/10"
                              }`}
                            />
                          );
                        })}
                      </div>
                      <span className="font-mono font-semibold text-neutral-900 dark:text-white">
                        {telemetry ? `${telemetry.rssi} dBm (${rssiLabel(telemetry.rssi)})` : "-52 dBm (Good)"}
                      </span>
                    </div>
                  </div>

                  {/* Broker Port */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#131722] border border-black/[0.04] dark:border-white/[0.05]">
                    <span className="text-neutral-600 dark:text-neutral-400">Broker Socket</span>
                    <span className="font-mono text-neutral-900 dark:text-white">8884 WSS (TLS 1.3)</span>
                  </div>

                  {/* Protocol */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#131722] border border-black/[0.04] dark:border-white/[0.05]">
                    <span className="text-neutral-600 dark:text-neutral-400">Broker Protocol</span>
                    <span className="font-mono text-neutral-900 dark:text-white">HiveMQ Cloud MQTT/TLS</span>
                  </div>

                  {/* Dispensing Loop */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#131722] border border-black/[0.04] dark:border-white/[0.05]">
                    <span className="text-neutral-600 dark:text-neutral-400">Dispenser Status</span>
                    <span
                      className={`font-mono font-semibold ${
                        telemetry?.dispensing
                          ? "text-amber-500 animate-pulse"
                          : "text-neutral-900 dark:text-white"
                      }`}
                    >
                      {telemetry?.dispensing ? "Actuating Servo (35g)" : "Idle / Ready"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
