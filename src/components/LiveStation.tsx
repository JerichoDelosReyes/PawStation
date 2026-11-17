"use client";

import { useState, useEffect, useRef, memo } from "react";
import Image from "next/image";
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
  ClockIcon,
  ChipIcon,
  ArrowRightIcon,
  CloseIcon,
  RefreshIcon,
} from "./Icons";
import { usePawStation, useScheduleTelemetry, type StationStatus } from "@/lib/station";
import { supabase } from "@/lib/supabase";

interface CatVisit {
  id: string;
  visit_start: string;
  peak_weight_g: number;
  duration_seconds: number | null;
}

interface LiveStationProps {
  catName?: string;
  catBreed?: string;
  onStatusChange?: (status: StationStatus) => void;
  onOpenDiagnostics?: () => void;
  onOpenEditProfile?: () => void;
}

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("dummy") &&
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("your-")
);

function LiveStation({
  catName = "Whiskers",
  catBreed = "Domestic Longhair",
  onStatusChange,
  onOpenDiagnostics,
  onOpenEditProfile,
}: LiveStationProps) {
  const {
    telemetry,
    stationStatus,
    isStationOnline,
    statusMessage,
    stationError,
    sendCommand,
    publishSchedule,
    lastSentSchedule,
    isDemoMode,
  } = usePawStation();

  const scheduleData = useScheduleTelemetry();

  // Local visits state
  const [catVisits, setCatVisits] = useState<CatVisit[]>([
    {
      id: "visit-1",
      visit_start: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      peak_weight_g: 4180,
      duration_seconds: 42,
    },
    {
      id: "visit-2",
      visit_start: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      peak_weight_g: 4210,
      duration_seconds: 35,
    },
    {
      id: "visit-3",
      visit_start: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      peak_weight_g: 4150,
      duration_seconds: 58,
    },
  ]);

  const [lastAction, setLastAction] = useState<string | null>(null);
  const [commandCooldown, setCommandCooldown] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"all" | "routine" | "visits">("all");
  const [mobileActiveCard, setMobileActiveCard] = useState<0 | 1 | 2>(0);
  const [visitLogged, setVisitLogged] = useState(false);

  // Routine schedule form state
  const [enabledRoutine, setEnabledRoutine] = useState(true);
  const [routineTimes, setRoutineTimes] = useState<string[]>(["08:00", "18:00"]);
  const [sentPayload, setSentPayload] = useState<string | null>(null);
  const hasUserEditedRoutine = useRef(false);
  const prevCatRef = useRef<boolean>(false);

  useEffect(() => {
    onStatusChange?.(stationStatus);
  }, [stationStatus, onStatusChange]);

  // Sync routine schedule from telemetry
  useEffect(() => {
    if (!scheduleData?.sched) return;
    if (sentPayload && scheduleData.sched === sentPayload) {
      setSentPayload(null);
    }
    if (!hasUserEditedRoutine.current || scheduleData.sched === lastSentSchedule) {
      const parts = scheduleData.sched.split("|");
      const isEnabled = parts[0] === "1";
      const timesList = parts[1]
        ? parts[1]
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];
      setEnabledRoutine(isEnabled);
      setRoutineTimes(timesList.length > 0 ? timesList : ["08:00"]);
    }
  }, [scheduleData?.sched, lastSentSchedule, sentPayload]);

  // Auto-record visits on feline presence transition (detected via 24-bit platform scale)
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
        duration_seconds: 30,
      };

      if (isSupabaseConfigured) {
        supabase
          .from("cat_visits")
          .insert({
            visit_start: newVisit.visit_start,
            peak_weight_g: newVisit.peak_weight_g,
          })
          .then(({ error }) => {
            if (!error) {
              setCatVisits((prev) => [newVisit, ...prev].slice(0, 8));
            } else {
              setCatVisits((prev) => [newVisit, ...prev].slice(0, 8));
            }
          });
      } else {
        setCatVisits((prev) => [newVisit, ...prev].slice(0, 8));
      }
    }
  }, [telemetry?.cat, telemetry?.weight]);

  // Initial fetch from Supabase
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let mounted = true;
    supabase
      .from("cat_visits")
      .select("*")
      .order("visit_start", { ascending: false })
      .limit(8)
      .then(({ data, error }) => {
        if (!error && data && mounted) {
          setCatVisits(
            data.map((row: any) => ({
              id: row.id,
              visit_start: row.visit_start,
              peak_weight_g: row.peak_weight_g,
              duration_seconds: row.duration_seconds ?? null,
            }))
          );
        }
      });

    const channel = supabase
      .channel("public:cat_visits_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "cat_visits" },
        (payload) => {
          if (!mounted) return;
          const newRow = payload.new as any;
          setCatVisits((prev) => [
            {
              id: newRow.id,
              visit_start: newRow.visit_start,
              peak_weight_g: newRow.peak_weight_g,
              duration_seconds: newRow.duration_seconds ?? null,
            },
            ...prev,
          ].slice(0, 8));
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

  const handleLogVisit = () => {
    setVisitLogged(true);
    setLastAction("Visit Entry Recorded");
    const manualVisit: CatVisit = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      visit_start: new Date().toISOString(),
      peak_weight_g: telemetry ? telemetry.weight : 4200,
      duration_seconds: 25,
    };
    setCatVisits((prev) => [manualVisit, ...prev].slice(0, 8));
    setTimeout(() => setVisitLogged(false), 2000);
    setTimeout(() => setLastAction(null), 3000);
  };

  const handleSaveRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStationOnline) return;
    const cleaned = Array.from(new Set(routineTimes.map((t) => t.trim()).filter(Boolean))).sort();
    const payload = `${enabledRoutine ? 1 : 0}|${cleaned.join(",")}`;
    setRoutineTimes(cleaned);
    setSentPayload(payload);
    publishSchedule(payload);
    setLastAction("Feeding Routine Saved");
    setTimeout(() => setLastAction(null), 3000);
  };

  const formatTimeAgo = (isoString: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
      if (diff < 60) return "Just now";
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    } catch {
      return "Recent";
    }
  };

  const isWaterLow = telemetry?.waterLow ?? false;

  return (
    <div className="w-full flex flex-col gap-6 select-none">
      {/* ── Action Feedback Toast ── */}
      <AnimatePresence>
        {lastAction && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-md mx-auto px-5 py-2.5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-[12.5px] font-semibold flex items-center justify-center gap-2 shadow-xl"
          >
            <CheckIcon className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{lastAction}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile Card Selector Tabs (< lg) ── */}
      <div className="lg:hidden flex items-center justify-center gap-2 p-1.5 rounded-full bg-[#E8E4DA] dark:bg-[#1C2230] max-w-sm mx-auto w-full">
        <button
          type="button"
          onClick={() => setMobileActiveCard(0)}
          className={`flex-1 py-2 px-3 rounded-full text-[12px] font-bold transition-all ${
            mobileActiveCard === 0
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
              : "text-neutral-600 dark:text-neutral-400"
          }`}
        >
          Feeder Status
        </button>
        <button
          type="button"
          onClick={() => setMobileActiveCard(1)}
          className={`flex-1 py-2 px-3 rounded-full text-[12px] font-bold transition-all ${
            mobileActiveCard === 1
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
              : "text-neutral-600 dark:text-neutral-400"
          }`}
        >
          Companion
        </button>
        <button
          type="button"
          onClick={() => setMobileActiveCard(2)}
          className={`flex-1 py-2 px-3 rounded-full text-[12px] font-bold transition-all ${
            mobileActiveCard === 2
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
              : "text-neutral-600 dark:text-neutral-400"
          }`}
        >
          Routine &amp; Log
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          RESPONSIVE CARD DECK: 3 BESPOKE APP-STYLE CARDS SIDE-BY-SIDE
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch max-w-[1580px] mx-auto w-full">
        {/* ═══════════════════════════════════════════════════════════
            CARD 1: FEEDER STATUS (Actual PawStation Hardware Sculpture)
        ═══════════════════════════════════════════════════════════ */}
        <div
          className={`${
            mobileActiveCard === 0 ? "flex" : "hidden lg:flex"
          } flex-col justify-between rounded-[36px] bg-[#EFECE3] dark:bg-[#1A202C] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-7 min-h-[660px] transition-all`}
        >
          {/* Top Pill Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm">
              <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center">
                <PawIcon className="w-3 h-3 fill-current" />
              </div>
              <span className="text-[11.5px] font-bold tracking-tight">
                {isStationOnline
                  ? isDemoMode
                    ? "PawStation (Demo)"
                    : "PawStation Online"
                  : "Station Offline"}
              </span>
            </div>

            {onOpenDiagnostics && (
              <button
                type="button"
                onClick={onOpenDiagnostics}
                className="w-10 h-10 rounded-full bg-white dark:bg-white/10 hover:bg-neutral-100 dark:hover:bg-white/15 text-neutral-800 dark:text-white flex items-center justify-center shadow-sm border border-black/[0.05] dark:border-white/10 transition-all active:scale-95 cursor-pointer"
                title="Hardware Diagnostics & Pinout"
                aria-label="Hardware Diagnostics & Pinout"
              >
                <ChipIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Big Display Title */}
          <div className="mt-4 mb-2">
            <h2 className="text-[38px] sm:text-[44px] font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.05]">
              Feeder
              <br />
              Status
            </h2>
          </div>

          {/* ── Central PawStation 3D Hardware Sculpture ── */}
          <div className="relative my-auto py-2 flex flex-col items-center justify-center">
            {/* Real PawStation Hardware 3D Sculpture with Transparent Alpha & Ground Contact Shadow */}
            <div className="relative z-10 w-full max-w-[420px] sm:max-w-[460px] h-[240px] sm:h-[265px] flex items-center justify-center my-1 transform-gpu scale-105 sm:scale-110">
              {/* Natural Ground Contact Shadow */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[80%] h-5 bg-black/[0.09] dark:bg-black/50 rounded-full blur-[10px] pointer-events-none" />

              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src="/hero-figure-light-transparent.webp"
                  alt="PawStation Physical Hardware Sculpture"
                  width={800}
                  height={460}
                  priority
                  className="w-full h-full object-contain pointer-events-none select-none dark:hidden"
                />
                <Image
                  src="/hero-figure-dark-transparent.webp"
                  alt="PawStation Physical Hardware Sculpture"
                  width={800}
                  height={460}
                  priority
                  className="w-full h-full object-contain pointer-events-none select-none hidden dark:block"
                />
              </div>
            </div>

            {/* Hardware Pods: Left = Water Moisture Probe, Right = Food Chute Servo */}
            <div className="w-full grid grid-cols-2 gap-3 sm:gap-4 mt-3">
              {/* Left Pod: Moisture Sensor Reservoir Status */}
              <div className="rounded-[28px] bg-[#B9CEC8] dark:bg-[#1E302C] p-4 text-[#163831] dark:text-[#A7D4CB] flex flex-col justify-between transition-colors shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-full bg-white/40 dark:bg-white/10 flex items-center justify-center">
                    <WaterDropIcon className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                    Reservoir
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isWaterLow ? "bg-rose-500 animate-pulse" : "bg-emerald-600"
                      }`}
                    />
                    <span className="text-[16px] sm:text-[18px] font-black leading-tight tracking-tight">
                      {isWaterLow ? "Water Low" : "Water OK"}
                    </span>
                  </div>
                  <span className="text-[10.5px] font-semibold opacity-85 block mt-1 leading-snug">
                    LM393 Moisture Probe
                  </span>
                </div>
              </div>

              {/* Right Pod: Dry Food Dispenser Chute */}
              <div className="rounded-[28px] bg-[#F8E39D] dark:bg-[#382F16] p-4 text-[#473409] dark:text-[#F8E09D] flex flex-col justify-between transition-colors shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-full bg-white/40 dark:bg-white/10 flex items-center justify-center">
                    <KibbleIcon className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                    Dispenser
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        telemetry?.dispensing ? "bg-amber-600 animate-pulse" : "bg-emerald-600"
                      }`}
                    />
                    <span className="text-[16px] sm:text-[18px] font-black leading-tight tracking-tight">
                      {telemetry?.dispensing ? "Dispensing" : "Chute Ready"}
                    </span>
                  </div>
                  <span className="text-[10.5px] font-semibold opacity-85 block mt-1 leading-snug">
                    SG90 Servo Actuator
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Manual Actuation Black Pill Controls ── */}
          <div className="space-y-2 mt-4">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleCommand("dispense", "Dispensing Food (Chute Cycle)")}
                disabled={!isStationOnline || telemetry?.dispensing || commandCooldown}
                className="py-3.5 px-4 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-95 text-[12.5px] font-bold tracking-tight shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <KibbleIcon className="w-3.5 h-3.5 fill-current" />
                <span>{telemetry?.dispensing ? "Dispensing..." : "Dispense Food"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleCommand("pump", "Running Fountain (3s)")}
                disabled={!isStationOnline || telemetry?.pump !== "OFF" || isWaterLow || commandCooldown}
                className="py-3.5 px-4 rounded-full bg-[#A8C4BD] text-[#163831] dark:bg-[#2A3E39] dark:text-[#B2E0D6] hover:opacity-95 text-[12.5px] font-bold tracking-tight shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <PumpIcon className="w-3.5 h-3.5" />
                <span>{telemetry?.pump !== "OFF" ? "Pump Running" : "Run Fountain"}</span>
              </button>
            </div>

            {/* Bottom Shelf: Station Timing & Pump Status */}
            <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-400">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Routine Status
              </span>
              <span className="font-mono">
                {scheduleData?.lastAuto ? `Last feed: ${scheduleData.lastAuto}` : "Chute ready"}
              </span>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            CARD 2: COMPANION STATUS & 24-BIT PLATFORM SCALE (HX711)
        ═══════════════════════════════════════════════════════════ */}
        <div
          className={`${
            mobileActiveCard === 1 ? "flex" : "hidden lg:flex"
          } flex-col justify-between rounded-[36px] bg-[#EAE7DC] dark:bg-[#181E2B] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-7 min-h-[660px] relative overflow-hidden transition-all`}
        >
          {/* Top Pill Header & Edit Shortcut */}
          <div className="flex items-center justify-between gap-3 relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Platform Scale (HX711)
            </span>

            {onOpenEditProfile && (
              <button
                type="button"
                onClick={onOpenEditProfile}
                className="w-10 h-10 rounded-full bg-white dark:bg-white/10 hover:bg-neutral-100 dark:hover:bg-white/15 text-neutral-800 dark:text-white flex items-center justify-center shadow-sm border border-black/[0.05] dark:border-white/10 transition-all active:scale-95 cursor-pointer"
                title="Edit Companion Profile"
                aria-label="Edit Companion Profile"
              >
                <CloseIcon className="w-4 h-4 rotate-45" />
              </button>
            )}
          </div>

          {/* Big Headline */}
          <div className="mt-3 mb-2 relative z-10">
            <h2 className="text-[38px] sm:text-[44px] font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.05]">
              Companion
              <br />
              Status
            </h2>
          </div>

          {/* ── Feline Avatar & Real-Time Scale Biometrics ── */}
          <div className="relative my-auto py-2 flex flex-col items-center justify-center">
            {/* Ambient Presence Ring */}
            <div
              className={`absolute w-56 h-56 rounded-full blur-2xl transition-colors duration-500 ${
                telemetry?.cat
                  ? "bg-emerald-400/25 dark:bg-emerald-500/20"
                  : "bg-amber-400/15 dark:bg-amber-500/10"
              }`}
            />

            {/* Cat Avatar Container */}
            <div className="relative z-10 w-44 h-44 rounded-full bg-gradient-to-tr from-[#D1C7BD] to-[#F5EFE6] dark:from-[#242C3C] dark:to-[#171D27] p-2.5 shadow-2xl flex flex-col items-center justify-center border-4 border-white/60 dark:border-white/10">
              <div className="w-full h-full rounded-full bg-[#DFD7CE] dark:bg-[#1E2533] flex flex-col items-center justify-center relative overflow-hidden">
                <CatIcon className="w-20 h-20 text-neutral-800 dark:text-neutral-200 fill-current" />
              </div>
            </div>

            {/* Cat Identity Pill Badge */}
            <div className="mt-4 px-4 py-1.5 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-md border border-black/[0.05] dark:border-white/10 flex items-center gap-2 shadow-sm">
              <span className="text-[13px] font-bold text-neutral-900 dark:text-white">
                {catName}
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                · {catBreed}
              </span>
            </div>

            {/* Real-Time Acoustic / Presence Visualizer Bars */}
            <div className="mt-4 flex items-center gap-1.5 h-6">
              {[4, 8, 14, 22, 16, 26, 12, 18, 9, 5].map((h, i) => (
                <span
                  key={i}
                  style={{ height: telemetry?.cat ? `${h}px` : "4px" }}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    telemetry?.cat ? "bg-neutral-900 dark:bg-white" : "bg-neutral-300 dark:bg-white/20"
                  }`}
                />
              ))}
            </div>

            {/* Live Presence Pill */}
            <div className="mt-2">
              {telemetry?.cat ? (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-[11.5px] font-bold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>Detected on Scale Platform</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.05] dark:bg-white/[0.06] text-neutral-600 dark:text-neutral-400 text-[11px] font-medium">
                  <span>Platform Clear · Ready</span>
                </span>
              )}
            </div>

            {/* Big 24-Bit Scale Weight (Cat on Platform) */}
            <div className="mt-3 text-center">
              <span className="text-[40px] sm:text-[46px] font-black tracking-tight leading-none text-neutral-900 dark:text-white font-mono tabular-nums">
                {telemetry ? `${telemetry.weight.toFixed(1)}` : "4200.0"}
                <span className="text-[20px] ml-1 font-bold">g</span>
              </span>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                24-Bit Load Cell Platform Weight
              </p>
            </div>
          </div>

          {/* ── Circular Action Controls (Zero Tare & Record Visit) ── */}
          <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06]">
            {/* Record Visit Entry (Paw Icon, NOT a camera) */}
            <button
              type="button"
              onClick={handleLogVisit}
              className={`h-14 px-5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer ${
                visitLogged ? "ring-4 ring-neutral-400/40" : ""
              }`}
              title="Record Scale Visit Log"
              aria-label="Record Scale Visit Log"
            >
              <PawIcon className="w-5 h-5 fill-current" />
              <span className="text-[12.5px] font-bold">Record Visit</span>
            </button>

            {/* Zero Tare Dark Circle */}
            <button
              type="button"
              onClick={() => handleCommand("tare", "Scale Zeroed (Tare)")}
              disabled={!isStationOnline || commandCooldown}
              className="w-14 h-14 rounded-full border border-neutral-400/30 dark:border-white/20 bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-neutral-900 dark:text-white flex items-center justify-center shadow-md active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Zero Scale (Tare HX711)"
              aria-label="Zero Scale (Tare HX711)"
            >
              <TareIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            CARD 3: ROUTINE AUTOMATION & VISIT COLLECTION
        ═══════════════════════════════════════════════════════════ */}
        <div
          className={`${
            mobileActiveCard === 2 ? "flex" : "hidden lg:flex"
          } flex-col justify-between rounded-[36px] bg-[#EFECE3] dark:bg-[#1A202C] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-7 min-h-[660px] transition-all`}
        >
          {/* Top Header & Diagnostics Action */}
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Automation &amp; Records
              </span>

              {onOpenDiagnostics && (
                <button
                  type="button"
                  onClick={onOpenDiagnostics}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-white/10 hover:bg-neutral-100 dark:hover:bg-white/15 text-neutral-800 dark:text-white text-[11px] font-bold border border-black/[0.05] dark:border-white/10 transition-all active:scale-95 cursor-pointer"
                  title="Open Hardware Diagnostics"
                >
                  <ChipIcon className="w-3.5 h-3.5" />
                  <span>Diagnostics</span>
                </button>
              )}
            </div>

            {/* Big Headline */}
            <div className="mt-3 mb-4">
              <h2 className="text-[38px] sm:text-[44px] font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.05]">
                Your
                <br />
                Collection
              </h2>
            </div>

            {/* Filter Pill Tabs (All / Routine / Visits) */}
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setSelectedTab("all")}
                className={`py-2 px-4 rounded-full text-[12px] font-bold transition-all ${
                  selectedTab === "all"
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
                    : "border border-neutral-300 dark:border-white/20 text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab("routine")}
                className={`py-2 px-4 rounded-full text-[12px] font-bold transition-all ${
                  selectedTab === "routine"
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
                    : "border border-neutral-300 dark:border-white/20 text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                Auto Routine
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab("visits")}
                className={`py-2 px-4 rounded-full text-[12px] font-bold transition-all ${
                  selectedTab === "visits"
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
                    : "border border-neutral-300 dark:border-white/20 text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                Visits
              </button>
            </div>
          </div>

          {/* ── Tab Content: Routine Automation or Recent Visits ── */}
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {selectedTab === "routine" || selectedTab === "all" ? (
              <form onSubmit={handleSaveRoutine} className="space-y-4">
                {/* Station Clock HUD */}
                <div className="flex items-center justify-between p-3.5 rounded-[22px] bg-[#E3DFD4] dark:bg-[#151A24] border border-black/[0.04] dark:border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                    <span className="text-[12px] font-semibold text-neutral-700 dark:text-neutral-300">
                      Station Clock
                    </span>
                  </div>
                  <span className="text-[13px] font-bold font-mono text-neutral-900 dark:text-white">
                    {scheduleData?.clock || "--:--"}
                  </span>
                </div>

                {/* Automatic Dispense Switch */}
                <div className="flex items-center justify-between p-3.5 rounded-[22px] bg-[#E3DFD4] dark:bg-[#151A24] border border-black/[0.04] dark:border-white/[0.06]">
                  <div>
                    <span className="text-[12.5px] font-bold text-neutral-900 dark:text-white block">
                      Automatic Feeder
                    </span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {enabledRoutine ? "Active on station" : "Disabled"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isStationOnline) return;
                      hasUserEditedRoutine.current = true;
                      setEnabledRoutine(!enabledRoutine);
                    }}
                    disabled={!isStationOnline}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out disabled:opacity-40 ${
                      enabledRoutine ? "bg-neutral-900 dark:bg-white" : "bg-neutral-300 dark:bg-white/20"
                    }`}
                    role="switch"
                    aria-checked={enabledRoutine}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full ${
                        enabledRoutine ? "bg-white dark:bg-neutral-900 translate-x-5" : "bg-white translate-x-0"
                      } shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </button>
                </div>

                {/* Dispense Times Pill List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Feeding Times
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">
                      {routineTimes.length} of 6
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {routineTimes.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-2 rounded-2xl bg-white dark:bg-[#151A24] border border-black/[0.05] dark:border-white/10"
                      >
                        <input
                          type="time"
                          value={t}
                          disabled={!isStationOnline}
                          onChange={(e) => {
                            hasUserEditedRoutine.current = true;
                            const next = [...routineTimes];
                            next[idx] = e.target.value;
                            setRoutineTimes(next);
                          }}
                          className="font-mono font-bold text-[13px] bg-transparent text-neutral-900 dark:text-white focus:outline-none w-20"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (routineTimes.length <= 1) return;
                            hasUserEditedRoutine.current = true;
                            setRoutineTimes(routineTimes.filter((_, i) => i !== idx));
                          }}
                          disabled={!isStationOnline || routineTimes.length <= 1}
                          className="text-neutral-400 hover:text-rose-500 transition-colors p-1"
                        >
                          <CloseIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    {routineTimes.length < 6 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!isStationOnline) return;
                          hasUserEditedRoutine.current = true;
                          setRoutineTimes([...routineTimes, "12:00"]);
                        }}
                        disabled={!isStationOnline}
                        className="py-2 px-3 rounded-2xl border border-dashed border-neutral-400/60 dark:border-white/20 text-neutral-700 dark:text-neutral-300 text-[12px] font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-all text-center"
                      >
                        + Add Time
                      </button>
                    )}
                  </div>
                </div>

                {/* Save Schedule Black Pill */}
                <button
                  type="submit"
                  disabled={!isStationOnline}
                  className="w-full py-3 px-4 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-[13px] font-bold shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save Routine
                </button>
              </form>
            ) : null}

            {/* Visit Collection Feed (Scale Platform Visits) */}
            {(selectedTab === "visits" || selectedTab === "all") && (
              <div className="mt-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Platform Visits (Scale Log)
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {catVisits.length} recorded
                  </span>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {catVisits.map((v, idx) => (
                    <div
                      key={v.id || idx}
                      className="p-3 rounded-[24px] bg-[#D7E5C1] dark:bg-[#202E1B] text-[#243F14] dark:text-[#CBE5A8] flex items-center justify-between shadow-sm transition-all hover:scale-[1.01]"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-white/40 dark:bg-white/10 flex items-center justify-center font-bold">
                          <CatIcon className="w-4 h-4 fill-current" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12.5px] font-bold">
                              {catName} on Scale
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/50 dark:bg-white/20 font-mono">
                              Scale Log
                            </span>
                          </div>
                          <span className="text-[10.5px] opacity-80 block font-mono">
                            {formatTimeAgo(v.visit_start)} · {v.peak_weight_g.toFixed(0)}g
                          </span>
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center shadow-sm">
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(LiveStation);
