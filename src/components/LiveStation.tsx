"use client";

import { useState, useEffect, useRef, memo } from "react";
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
import { usePawStationMqtt, type StationStatus } from "@/lib/mqtt";
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

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("dummy") &&
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("your-")
);

function LiveStation({ catName = "Cat", onStatusChange }: LiveStationProps) {
  const {
    telemetry,
    stationStatus,
    isStationOnline,
    statusMessage,
    brokerError,
    sendCommand,
  } = usePawStationMqtt();

  const [catVisits, setCatVisits] = useState<CatVisit[]>([]);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [commandCooldown, setCommandCooldown] = useState(false);
  const prevCatRef = useRef<boolean>(false);

  useEffect(() => {
    onStatusChange?.(stationStatus);
  }, [stationStatus, onStatusChange]);

  // Visit log: only add an entry when telemetry.cat changes from false to true.
  useEffect(() => {
    if (!telemetry) return;
    const wasCat = prevCatRef.current;
    const isCat = telemetry.cat;
    prevCatRef.current = isCat;

    if (!wasCat && isCat) {
      const newVisit: CatVisit = {
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        visit_start: new Date().toISOString(),
        peak_weight_g: telemetry.weight,
        duration_seconds: null,
      };

      if (isSupabaseConfigured) {
        supabase
          .from("cat_visits")
          .insert({
            visit_start: newVisit.visit_start,
            peak_weight_g: newVisit.peak_weight_g,
          })
          .then(({ error }) => {
            if (error) {
              setCatVisits((prev) => [newVisit, ...prev].slice(0, 5));
            } else {
              setCatVisits((prev) => [newVisit, ...prev].slice(0, 5));
            }
          });
      } else {
        setCatVisits((prev) => [newVisit, ...prev].slice(0, 5));
      }
    }
  }, [telemetry?.cat, telemetry?.weight]);

  // Initial fetch from Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let mounted = true;
    async function fetchVisits() {
      try {
        const { data, error } = await supabase
          .from("cat_visits")
          .select("id, visit_start, peak_weight_g, duration_seconds")
          .order("visit_start", { ascending: false })
          .limit(5);
        if (!error && data && mounted) {
          setCatVisits(data);
        }
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
          if (mounted) {
            setCatVisits((prev) => [payload.new as CatVisit, ...prev].slice(0, 5));
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCommand = (cmd: "dispense" | "pump" | "tare", label: string) => {
    if (commandCooldown || !isStationOnline) return;
    setCommandCooldown(true);
    setLastAction(label);
    sendCommand(cmd);
    setTimeout(() => {
      setCommandCooldown(false);
    }, 1200);
    setTimeout(() => {
      setLastAction(null);
    }, 3500);
  };

  const getRssiInfo = (rssi: number | undefined) => {
    if (rssi == null) return { label: "--", text: "--", bars: 0 };
    if (rssi >= -60) return { label: "Good", text: `${rssi} dBm (Good)`, bars: 3 };
    if (rssi >= -75) return { label: "Fair", text: `${rssi} dBm (Fair)`, bars: 2 };
    return { label: "Weak", text: `${rssi} dBm (Weak)`, bars: 1 };
  };

  const rssiInfo = getRssiInfo(telemetry?.rssi);

  // Status badge display logic
  const getBadgeContent = () => {
    if (statusMessage === "Broker settings missing") {
      return {
        text: "Broker settings missing",
        badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25",
        dotClass: "bg-rose-500",
        pingClass: "bg-rose-400",
      };
    }
    if (statusMessage === "not authorized (check credentials)") {
      return {
        text: "Not authorized (check credentials)",
        badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25",
        dotClass: "bg-rose-500",
        pingClass: "bg-rose-400",
      };
    }
    if (statusMessage === "cannot reach broker") {
      return {
        text: "Cannot reach broker",
        badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25",
        dotClass: "bg-rose-500",
        pingClass: "bg-rose-400",
      };
    }
    if (statusMessage === "connecting" || stationStatus === "connecting") {
      return {
        text: "Connecting...",
        badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25",
        dotClass: "bg-amber-500",
        pingClass: "bg-amber-400",
      };
    }
    if (isStationOnline) {
      return {
        text: "ESP32 Online",
        badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
        dotClass: "bg-emerald-500",
        pingClass: "bg-emerald-400",
      };
    }
    return {
      text: "Station offline",
      badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25",
      dotClass: "bg-rose-500",
      pingClass: "bg-rose-400",
    };
  };

  const badge = getBadgeContent();

  // Active error to show in banner
  const bannerMessage =
    statusMessage === "Broker settings missing"
      ? "Broker settings missing"
      : statusMessage === "not authorized (check credentials)"
      ? "Not authorized (check credentials)"
      : statusMessage === "cannot reach broker"
      ? "Cannot reach broker"
      : !isStationOnline && stationStatus !== "connecting"
      ? "Station offline"
      : brokerError;

  return (
    <section id="live-station" className="w-full">
      {/* Precision Physical-Digital Hardware Station Card */}
      <div className="w-full rounded-apple-2xl bg-white dark:bg-[#161B26] border border-black/[0.08] dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] overflow-hidden transition-all">
        {/* ── Top Console HUD Bar ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-5 sm:px-7 py-4 border-b border-black/[0.06] dark:border-white/[0.08] bg-[#FAF8F5] dark:bg-[#131722] transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-accent-amber/15 text-accent-amber flex items-center justify-center shadow-inner shrink-0">
              <PawIcon className="w-4 h-4 fill-current" />
            </div>
            <span className="text-[13px] font-bold text-neutral-900 dark:text-white tracking-tight uppercase">
              Pawstation Workstation
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Top Hardware Actuation Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Dispense Food Button */}
              <button
                type="button"
                onClick={() => handleCommand("dispense", "Dispensing Food")}
                disabled={!isStationOnline || telemetry?.dispensing || commandCooldown}
                className="apple-button bg-amber-500 hover:bg-amber-600 text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed text-[12px] font-semibold px-3.5 py-1.5 rounded-apple transition-all active:scale-[0.98] inline-flex items-center gap-1.5"
                title="Dispense dry food"
              >
                <KibbleIcon className="w-3.5 h-3.5 fill-current" />
                <span>{telemetry?.dispensing ? "Dispensing..." : "Dispense Food"}</span>
              </button>

              {/* Run Pump Button */}
              <button
                type="button"
                onClick={() => handleCommand("pump", "Running Water Pump for 3 seconds")}
                disabled={
                  !isStationOnline ||
                  telemetry?.pump !== "OFF" ||
                  telemetry?.waterLow ||
                  commandCooldown
                }
                title={
                  telemetry?.waterLow
                    ? "Pump locked to prevent motor burnout while reservoir is low"
                    : "Trigger water pump cycle (3 seconds)"
                }
                className="apple-button bg-sky-600 dark:bg-sky-500 hover:bg-sky-700 dark:hover:bg-sky-600 text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed text-[12px] font-semibold px-3.5 py-1.5 rounded-apple transition-all active:scale-[0.98] inline-flex items-center gap-1.5"
              >
                <PumpIcon className="w-3.5 h-3.5" />
                <span>Run Pump (3s)</span>
              </button>

              {/* Zero Scale (Tare) Button */}
              <button
                type="button"
                onClick={() => handleCommand("tare", "Scale Zeroed (Tare)")}
                disabled={!isStationOnline || commandCooldown}
                className="apple-button bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 border border-black/10 dark:border-white/10 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed text-[12px] font-semibold px-3.5 py-1.5 rounded-apple transition-all active:scale-[0.98] inline-flex items-center gap-1.5"
                title="Zero the HX711 scale load cell"
              >
                <TareIcon className="w-3.5 h-3.5" />
                <span>Zero Scale</span>
              </button>
            </div>

            {commandCooldown && (
              <span className="text-[11px] font-mono text-amber-500 animate-pulse">
                Cooldown: 1.2s
              </span>
            )}

            <div className="h-4 w-px bg-black/10 dark:bg-white/10 hidden sm:block" />

            {/* Real-time Status Badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border transition-colors ${badge.badgeClass}`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${badge.pingClass}`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${badge.dotClass}`}
                />
              </span>
              <span>{badge.text}</span>
            </div>
          </div>
        </div>

        {/* ── Status / Broker Notification Banner ── */}
        <AnimatePresence>
          {bannerMessage && !isStationOnline && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 py-2.5 bg-rose-500/10 border-b border-rose-500/20 text-rose-600 dark:text-rose-400 text-[12px] flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="font-medium">{bannerMessage}</span>
              </div>
              <span className="text-[11px] opacity-75 font-mono">
                {bannerMessage === "Broker settings missing"
                  ? "Set NEXT_PUBLIC_MQTT_* in .env.local"
                  : "Auto-reconnect active"}
              </span>
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
                        10 kg Aluminum Bar
                      </p>
                    </div>
                  </div>

                  {telemetry && telemetry.scaleOk === false && (
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20">
                      Scale offline
                    </span>
                  )}
                </div>

                {/* Big Metric Display */}
                <div className="my-2">
                  <div className="text-[38px] sm:text-[46px] font-bold tracking-tight text-neutral-900 dark:text-white font-mono tabular-nums leading-none">
                    {telemetry ? (
                      telemetry.scaleOk === false ? (
                        <span className="text-[26px] sm:text-[32px] text-rose-600 dark:text-rose-400">
                          Scale offline
                        </span>
                      ) : (
                        `${telemetry.weight.toFixed(1)} g`
                      )
                    ) : (
                      <span className="text-neutral-400 dark:text-neutral-600">--</span>
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
                  <span>Visits since station start: {telemetry ? telemetry.visits : "--"}</span>
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
                        LM393 probe
                      </p>
                    </div>
                  </div>

                  {telemetry ? (
                    <span
                      className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                        telemetry.waterLow
                          ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25"
                          : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25"
                      }`}
                    >
                      {telemetry.waterLow ? "Low - refill" : "Level OK"}
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border bg-neutral-200/60 dark:bg-white/[0.06] text-neutral-500 dark:text-neutral-400 border-black/[0.04] dark:border-white/[0.06]">
                      --
                    </span>
                  )}
                </div>

                {/* Big Metric Display */}
                <div className="my-2">
                  <div className="text-[34px] sm:text-[42px] font-bold tracking-tight text-neutral-900 dark:text-white font-mono tabular-nums leading-tight">
                    Sensor reading: {telemetry ? telemetry.water : "--"}
                  </div>
                  <span className="text-[11.5px] text-neutral-500 dark:text-neutral-400 mt-1 inline-block">
                    LM393 conductivity ADC sensor
                  </span>
                </div>
              </div>

              {/* Pump Status & Safety Lockout */}
              <div className="mt-5 pt-4 border-t border-black/[0.06] dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-[12px]">
                <div className="flex items-center gap-2">
                  <PumpIcon className="w-3.5 h-3.5 text-sky-500" />
                  <span className="text-neutral-600 dark:text-neutral-300">
                    Pump:{" "}
                    <strong className="font-mono text-neutral-900 dark:text-white">
                      {telemetry?.pump ?? "--"}
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
              BOTTOM PANEL: FELINE VISIT LOG + TELEMETRY HUD
          ───────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Visit Log */}
            <div className="bg-[#FAF8F5] dark:bg-[#181D2A] border border-black/[0.06] dark:border-white/[0.08] rounded-apple-xl p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-accent-amber/15 text-accent-amber flex items-center justify-center">
                      <CatIcon className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Feline Visit Log
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {isSupabaseConfigured ? "Live Stream" : "This session"}
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
                            {v.peak_weight_g.toFixed(1)} g
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
                      No visits recorded yet. Waiting for feline trigger.
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
                    ESP32 DevKit
                  </span>
                </div>

                <div className="space-y-2.5 text-[12px]">
                  {/* WiFi RSSI */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#131722] border border-black/[0.04] dark:border-white/[0.05]">
                    <span className="text-neutral-600 dark:text-neutral-400">Wi-Fi Signal (RSSI)</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-end gap-0.5 h-3">
                        {[1, 2, 3, 4].map((bar) => {
                          const active = bar <= rssiInfo.bars;
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
                        {rssiInfo.text}
                      </span>
                    </div>
                  </div>

                  {/* Broker Port */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#131722] border border-black/[0.04] dark:border-white/[0.05]">
                    <span className="text-neutral-600 dark:text-neutral-400">Broker Socket</span>
                    <span className="font-mono text-neutral-900 dark:text-white">8884 WSS (TLS)</span>
                  </div>

                  {/* Protocol */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#131722] border border-black/[0.04] dark:border-white/[0.05]">
                    <span className="text-neutral-600 dark:text-neutral-400">Broker Protocol</span>
                    <span className="font-mono text-neutral-900 dark:text-white">HiveMQ Cloud MQTT over TLS</span>
                  </div>

                  {/* Dispenser Status */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#131722] border border-black/[0.04] dark:border-white/[0.05]">
                    <span className="text-neutral-600 dark:text-neutral-400">Dispenser Status</span>
                    <span
                      className={`font-mono font-semibold ${
                        telemetry?.dispensing
                          ? "text-amber-500 animate-pulse"
                          : "text-neutral-900 dark:text-white"
                      }`}
                    >
                      {telemetry?.dispensing
                        ? "Dispensing"
                        : telemetry
                        ? "Idle"
                        : "--"}
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

export default memo(LiveStation);
