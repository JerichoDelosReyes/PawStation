"use client";

import { useState, useEffect, useRef, memo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScaleIcon,
  WaterDropIcon,
  KibbleIcon,
  FeederIcon,
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
  PencilIcon,
} from "./Icons";
import { usePawStation, useScheduleTelemetry, type StationStatus } from "@/lib/station";
import { supabase } from "@/lib/supabase";
import { dbSync } from "@/lib/database-sync";
import { useAuth } from "@/lib/auth-context";

const MOBILE_NAV_TABS = [
  { id: 0 as const, label: "Companion", icon: CatIcon },
  { id: 1 as const, label: "Feeder Status", icon: FeederIcon },
  { id: 2 as const, label: "Routine Log", icon: ClockIcon },
];

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
  } = usePawStation();

  const { user } = useAuth();
  const scheduleData = useScheduleTelemetry();

  // Local visits state (starts empty for new accounts; populated from database or realtime telemetry)
  const [catVisits, setCatVisits] = useState<CatVisit[]>([]);

  const [lastAction, setLastAction] = useState<string | null>(null);
  const [commandCooldown, setCommandCooldown] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"all" | "routine" | "visits">("all");
  const [mobileActiveCard, setMobileActiveCard] = useState<0 | 1 | 2>(1);
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

  // Auto-record visits on feline presence transition (detected via platform scale)
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

      setCatVisits((prev) => [newVisit, ...prev].slice(0, 8));

      // Record to Supabase with in-memory offline fallback
      dbSync.recordVisit({
        id: newVisit.id,
        userId: user?.id,
        visitStart: newVisit.visit_start,
        peakWeightG: newVisit.peak_weight_g,
        durationSeconds: newVisit.duration_seconds,
      });

      // Snapshot telemetry log on presence change
      dbSync.logTelemetrySnapshot(telemetry);
    }
  }, [telemetry?.cat, telemetry?.weight, user?.id]);

  // Periodic scale telemetry logging directly into Supabase (every 30s)
  useEffect(() => {
    if (!telemetry || !isStationOnline) return;

    const interval = setInterval(() => {
      if (telemetry) {
        dbSync.logTelemetrySnapshot(telemetry);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [telemetry, isStationOnline]);

  // Initial fetch from Supabase
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let mounted = true;

    let query = supabase
      .from("cat_visits")
      .select("*")
      .order("visit_start", { ascending: false })
      .limit(8);

    if (user?.id) {
      query = query.eq("user_id", user.id);
    }

    query.then(({ data, error }) => {
      if (!error && mounted) {
        if (data && data.length > 0) {
          setCatVisits(
            data.map((row: any) => ({
              id: row.id,
              visit_start: row.visit_start,
              peak_weight_g: Number(row.peak_weight_g),
              duration_seconds: row.duration_seconds ?? null,
            }))
          );
        } else {
          setCatVisits([]);
        }
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
          if (user?.id && newRow.user_id && newRow.user_id !== user.id) return;
          setCatVisits((prev) => [
            {
              id: newRow.id,
              visit_start: newRow.visit_start,
              peak_weight_g: Number(newRow.peak_weight_g),
              duration_seconds: newRow.duration_seconds ?? null,
            },
            ...prev.filter((v) => v.id !== newRow.id),
          ].slice(0, 8));
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleCommand = (cmd: "dispense" | "pump" | "tare", label: string) => {
    if (commandCooldown || !isStationOnline) return;
    setCommandCooldown(true);
    setLastAction(label);
    sendCommand(cmd);

    // Audit command and log feeding events to Supabase
    if (user) {
      dbSync.logCommandAudit(cmd, user.id);
    }

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

    // Persist directly to Supabase with offline queue fallback
    dbSync.recordVisit({
      id: manualVisit.id,
      userId: user?.id,
      visitStart: manualVisit.visit_start,
      peakWeightG: manualVisit.peak_weight_g,
      durationSeconds: manualVisit.duration_seconds,
    });

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
    <div className="w-full h-full flex-1 min-h-0 flex flex-col justify-between select-none overflow-hidden relative">
      {/* ── Action Feedback Toast ── */}
      <AnimatePresence>
        {lastAction && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-md mx-auto px-5 py-2 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-[12px] font-semibold flex items-center justify-center gap-2 shadow-xl shrink-0 z-30 mb-2"
          >
            <CheckIcon className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
            <span>{lastAction}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          RESPONSIVE CARD DECK: EXACT 1-PAGE ZERO-SCROLL WORKSTATION
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 xl:gap-6 items-stretch max-w-[1540px] mx-auto w-full h-full flex-1 min-h-0 overflow-hidden">
        {/* ═══════════════════════════════════════════════════════════
            CARD 1: COMPANION STATUS & PLATFORM SCALE
        ═══════════════════════════════════════════════════════════ */}
        <div
          className={`${
            mobileActiveCard === 0 ? "flex" : "hidden lg:flex"
          } flex-col justify-between rounded-[28px] lg:rounded-[32px] bg-[#FAF7F0] dark:bg-[#161B26] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_4px_24px_rgb(0,0,0,0.03)] p-4 sm:p-5 xl:p-6 h-full min-h-0 overflow-hidden relative transition-all`}
        >
          {/* Top Pill Header & Edit Shortcut */}
          <div className="flex items-center justify-between gap-2 relative z-10 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Platform Scale
            </span>

            {onOpenEditProfile && (
              <button
                type="button"
                onClick={onOpenEditProfile}
                className="w-8 h-8 rounded-full bg-white dark:bg-white/10 hover:bg-neutral-100 dark:hover:bg-white/15 text-neutral-800 dark:text-white flex items-center justify-center shadow-sm border border-black/[0.05] dark:border-white/10 transition-all active:scale-95 cursor-pointer"
                title="Edit Companion Profile"
                aria-label="Edit Companion Profile"
              >
                <PencilIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Big Headline */}
          <div className="mt-2 mb-1 relative z-10 shrink-0">
            <h2 className="text-[26px] sm:text-[30px] xl:text-[36px] font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.05]">
              Companion
              <br />
              Status
            </h2>
          </div>

          {/* ── Feline Avatar & Real-Time Scale Biometrics ── */}
          <div className="relative my-auto py-1 flex flex-col items-center justify-center min-h-0">
            {/* Ambient Presence Ring */}
            <div
              className={`absolute w-44 h-44 rounded-full blur-2xl transition-colors duration-500 pointer-events-none ${
                telemetry?.cat
                  ? "bg-emerald-400/25 dark:bg-emerald-500/20"
                  : "bg-amber-400/15 dark:bg-amber-500/10"
              }`}
            />

            {/* Cat Avatar Container */}
            <div className="relative z-10 w-32 h-32 sm:w-40 sm:h-40 xl:w-44 xl:h-44 rounded-full bg-gradient-to-tr from-[#D1C7BD] to-[#F5EFE6] dark:from-[#242C3C] dark:to-[#171D27] p-2 shadow-xl flex flex-col items-center justify-center border-4 border-white/60 dark:border-white/10">
              <div className="w-full h-full rounded-full bg-[#DFD7CE] dark:bg-[#1E2533] flex flex-col items-center justify-center relative overflow-hidden">
                <CatIcon className="w-16 h-16 sm:w-20 sm:h-20 xl:w-24 xl:h-24 text-neutral-800 dark:text-neutral-200 fill-current" />
              </div>
            </div>

            {/* Cat Identity Pill Badge */}
            <div className="mt-3 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-md border border-black/[0.05] dark:border-white/10 flex items-center gap-1.5 shadow-sm shrink-0">
              <span className="text-[13.5px] sm:text-[15px] font-bold text-neutral-900 dark:text-white">
                {catName}
              </span>
              <span className="text-[12px] sm:text-[13px] text-neutral-500 dark:text-neutral-400">
                · {catBreed}
              </span>
            </div>

            {/* Real-Time Acoustic / Presence Visualizer Bars */}
            <div className="mt-3 flex items-center gap-1.5 h-6 shrink-0">
              {[4, 7, 12, 18, 14, 20, 10, 15, 8, 4].map((h, i) => (
                <span
                  key={i}
                  style={{ height: telemetry?.cat ? `${h * 1.3}px` : "3.5px" }}
                  className={`w-1 sm:w-1.5 rounded-full transition-all duration-300 ${
                    telemetry?.cat ? "bg-neutral-900 dark:bg-white" : "bg-neutral-300 dark:bg-white/20"
                  }`}
                />
              ))}
            </div>

            {/* Live Presence Pill */}
            <div className="mt-2.5 shrink-0">
              {telemetry?.cat ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-[11.5px] sm:text-[12px] font-bold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>On Scale Platform</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3.5 py-1 rounded-full bg-black/[0.05] dark:bg-white/[0.06] text-neutral-600 dark:text-neutral-400 text-[11.5px] sm:text-[12px] font-medium">
                  <span>Platform Clear</span>
                </span>
              )}
            </div>

            {/* Big Scale Weight (Cat on Platform) */}
            <div className="mt-2.5 text-center shrink-0">
              <span className="text-[44px] sm:text-[54px] xl:text-[62px] font-black tracking-tight leading-none text-neutral-900 dark:text-white font-mono tabular-nums">
                {telemetry ? `${telemetry.weight.toFixed(1)}` : "4200.0"}
                <span className="text-[20px] sm:text-[24px] ml-1.5 font-bold">g</span>
              </span>
            </div>
          </div>

          {/* ── Action Controls (Tare & Record Visit) ── */}
          <div className="flex items-center justify-center gap-3 mt-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.06] shrink-0">
            {/* Record Visit Entry (Paw Icon) */}
            <button
              type="button"
              onClick={handleLogVisit}
              className={`h-11 sm:h-12 px-4 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer ${
                visitLogged ? "ring-4 ring-neutral-400/40" : ""
              }`}
              title="Record Scale Visit Log"
              aria-label="Record Scale Visit Log"
            >
              <PawIcon className="w-4 h-4 fill-current" />
              <span className="text-[12px] font-bold">Record Visit</span>
            </button>

            {/* Zero Tare Dark Circle */}
            <button
              type="button"
              onClick={() => handleCommand("tare", "Scale Zeroed (Tare)")}
              disabled={!isStationOnline || commandCooldown}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-neutral-400/30 dark:border-white/20 bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-neutral-900 dark:text-white flex items-center justify-center shadow-sm active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Zero Scale (Tare)"
              aria-label="Zero Scale (Tare)"
            >
              <TareIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            CARD 2: FEEDER STATUS (Hardware Sculpture & Pods)
        ═══════════════════════════════════════════════════════════ */}
        <div
          className={`${
            mobileActiveCard === 1 ? "flex" : "hidden lg:flex"
          } flex-col justify-between rounded-[28px] lg:rounded-[32px] bg-[#FAF7F0] dark:bg-[#161B26] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_4px_24px_rgb(0,0,0,0.03)] p-4 sm:p-5 xl:p-6 h-full min-h-0 overflow-hidden transition-all`}
        >
          {/* Top Pill Header */}
          <div className="flex items-center justify-between gap-2 shrink-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm">
              <div className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center">
                <PawIcon className="w-2.5 h-2.5 fill-current" />
              </div>
              <span className="text-[11px] font-bold tracking-tight">
                {isStationOnline ? "PawStation Online" : "Station Offline"}
              </span>
            </div>

            {onOpenDiagnostics && (
              <button
                type="button"
                onClick={onOpenDiagnostics}
                className="w-8 h-8 rounded-full bg-white dark:bg-white/10 hover:bg-neutral-100 dark:hover:bg-white/15 text-neutral-800 dark:text-white flex items-center justify-center shadow-sm border border-black/[0.05] dark:border-white/10 transition-all active:scale-95 cursor-pointer"
                title="Hardware Diagnostics & Pinout"
                aria-label="Hardware Diagnostics & Pinout"
              >
                <ChipIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Big Display Title */}
          <div className="mt-2 mb-1 shrink-0">
            <h2 className="text-[26px] sm:text-[30px] xl:text-[36px] font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.05]">
              Feeder
              <br />
              Status
            </h2>
          </div>

          {/* ── Central PawStation 3D Hardware Sculpture ── */}
          <div className="relative flex-1 flex flex-col items-center justify-center min-h-0 pt-2 pb-5 sm:pb-6 xl:pb-7">
            {/* Real PawStation Hardware 3D Sculpture */}
            <div className="relative z-10 w-full max-w-[360px] sm:max-w-[430px] xl:max-w-[490px] 2xl:max-w-[530px] h-[190px] sm:h-[230px] xl:h-[270px] 2xl:h-[295px] flex items-center justify-center transform-gpu scale-105 sm:scale-110 xl:scale-115 -translate-y-1 sm:-translate-y-2">
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src="/hero-figure-light-transparent.webp"
                  alt="PawStation Physical Hardware Sculpture"
                  width={600}
                  height={350}
                  priority
                  className="w-full h-full object-contain pointer-events-none select-none dark:hidden drop-shadow-sm"
                />
                <Image
                  src="/hero-figure-dark-transparent.webp"
                  alt="PawStation Physical Hardware Sculpture"
                  width={600}
                  height={350}
                  priority
                  className="w-full h-full object-contain pointer-events-none select-none hidden dark:block drop-shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* ── Bottom Section: Hardware Pods + Manual Controls ── */}
          <div className="shrink-0 space-y-2 sm:space-y-2.5">
            {/* Hardware Pods: Left = Water Moisture Probe, Right = Food Chute Servo */}
            <div className="w-full grid grid-cols-2 gap-2.5 sm:gap-3">
              {/* Left Pod: Moisture Sensor Reservoir Status */}
              <div className="rounded-[20px] sm:rounded-[24px] bg-[#B9CEC8] dark:bg-[#1E302C] p-3 text-[#163831] dark:text-[#A7D4CB] flex flex-col justify-between transition-colors shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="w-6 h-6 rounded-full bg-white/40 dark:bg-white/10 flex items-center justify-center">
                    <WaterDropIcon className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span className="text-[9.5px] font-bold uppercase tracking-wider opacity-75">
                    Reservoir
                  </span>
                </div>
                <div className="mt-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isWaterLow ? "bg-rose-500 animate-pulse" : "bg-emerald-600"
                      }`}
                    />
                    <span className="text-[14px] sm:text-[16px] font-black leading-tight tracking-tight">
                      {isWaterLow ? "Water Low" : "Water OK"}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold opacity-85 block mt-0.5 leading-snug">
                    LM393 Probe
                  </span>
                </div>
              </div>

              {/* Right Pod: Dry Food Dispenser Chute */}
              <div className="rounded-[20px] sm:rounded-[24px] bg-[#F8E39D] dark:bg-[#382F16] p-3 text-[#473409] dark:text-[#F8E09D] flex flex-col justify-between transition-colors shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="w-6 h-6 rounded-full bg-white/40 dark:bg-white/10 flex items-center justify-center">
                    <KibbleIcon className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span className="text-[9.5px] font-bold uppercase tracking-wider opacity-75">
                    Dispenser
                  </span>
                </div>
                <div className="mt-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        telemetry?.dispensing ? "bg-amber-600 animate-pulse" : "bg-emerald-600"
                      }`}
                    />
                    <span className="text-[14px] sm:text-[16px] font-black leading-tight tracking-tight">
                      {telemetry?.dispensing ? "Dispensing" : "Ready"}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold opacity-85 block mt-0.5 leading-snug">
                    SG90 Servo
                  </span>
                </div>
              </div>
            </div>

            {/* ── Manual Actuation Black Pill Controls ── */}
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleCommand("dispense", "Dispensing Food")}
                  disabled={!isStationOnline || telemetry?.dispensing || commandCooldown}
                  className="py-2.5 sm:py-3 px-3 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-95 text-[11.5px] sm:text-[12px] font-bold tracking-tight shadow-md flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <KibbleIcon className="w-3.5 h-3.5 fill-current" />
                  <span>{telemetry?.dispensing ? "Dispensing..." : "Dispense Food"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCommand("pump", "Running Fountain (3s)")}
                  disabled={!isStationOnline || telemetry?.pump !== "OFF" || isWaterLow || commandCooldown}
                  className="py-2.5 sm:py-3 px-3 rounded-full bg-[#A8C4BD] text-[#163831] dark:bg-[#2A3E39] dark:text-[#B2E0D6] hover:opacity-95 text-[11.5px] sm:text-[12px] font-bold tracking-tight shadow-md flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <PumpIcon className="w-3.5 h-3.5" />
                  <span>{telemetry?.pump !== "OFF" ? "Pump Running" : "Run Fountain"}</span>
                </button>
              </div>

              {/* Bottom Shelf: Station Timing & Pump Status */}
              <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[10.5px] text-neutral-600 dark:text-neutral-400">
                <span className="font-semibold uppercase tracking-wider text-[9.5px]">
                  Routine Status
                </span>
                <span className="font-mono">
                  {scheduleData?.lastAuto ? `Last feed: ${scheduleData.lastAuto}` : "Ready"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            CARD 3: ROUTINE AUTOMATION & VISIT COLLECTION
        ═══════════════════════════════════════════════════════════ */}
        <div
          className={`${
            mobileActiveCard === 2 ? "flex" : "hidden lg:flex"
          } flex-col justify-between rounded-[28px] lg:rounded-[32px] bg-[#FAF7F0] dark:bg-[#161B26] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_4px_24px_rgb(0,0,0,0.03)] p-4 sm:p-5 xl:p-6 h-full min-h-0 overflow-hidden transition-all`}
        >
          {/* Top Header & Diagnostics Action */}
          <div className="shrink-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Automation &amp; Records
              </span>

              {onOpenDiagnostics && (
                <button
                  type="button"
                  onClick={onOpenDiagnostics}
                  className="w-8 h-8 rounded-full bg-white dark:bg-white/10 hover:bg-neutral-100 dark:hover:bg-white/15 text-neutral-800 dark:text-white flex items-center justify-center shadow-sm border border-black/[0.05] dark:border-white/10 transition-all active:scale-95 cursor-pointer"
                  title="Hardware Diagnostics & Pinout"
                  aria-label="Hardware Diagnostics & Pinout"
                >
                  <ChipIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Big Headline */}
            <div className="mt-2 mb-2">
              <h2 className="text-[26px] sm:text-[30px] xl:text-[36px] font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.05]">
                Your
                <br />
                Collection
              </h2>
            </div>

            {/* Filter Pill Tabs (All / Routine / Visits) */}
            <div className="flex items-center gap-1.5 mb-2">
              <button
                type="button"
                onClick={() => setSelectedTab("all")}
                className={`py-1 px-3 rounded-full text-[11px] font-bold transition-all ${
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
                className={`py-1 px-3 rounded-full text-[11px] font-bold transition-all ${
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
                className={`py-1 px-3 rounded-full text-[11px] font-bold transition-all ${
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
          <div
            className={`flex-1 flex flex-col ${
              selectedTab === "all" ? "justify-between" : "justify-start"
            } overflow-hidden min-h-0`}
          >
            {selectedTab === "routine" || selectedTab === "all" ? (
              <form onSubmit={handleSaveRoutine} className="space-y-2.5">
                {/* Station Clock HUD */}
                <div className="flex items-center justify-between p-2.5 rounded-[18px] bg-[#E3DFD4] dark:bg-[#151A24] border border-black/[0.04] dark:border-white/[0.06]">
                  <div className="flex items-center gap-1.5">
                    <ClockIcon className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
                    <span className="text-[11.5px] font-semibold text-neutral-700 dark:text-neutral-300">
                      Station Clock
                    </span>
                  </div>
                  <span className="text-[12px] font-bold font-mono text-neutral-900 dark:text-white">
                    {scheduleData?.clock || "--:--"}
                  </span>
                </div>

                {/* Automatic Dispense Switch */}
                <div className="flex items-center justify-between p-2.5 rounded-[18px] bg-[#E3DFD4] dark:bg-[#151A24] border border-black/[0.04] dark:border-white/[0.06]">
                  <div>
                    <span className="text-[12px] font-bold text-neutral-900 dark:text-white block">
                      Automatic Feeder
                    </span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
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
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out disabled:opacity-40 ${
                      enabledRoutine ? "bg-neutral-900 dark:bg-white" : "bg-neutral-300 dark:bg-white/20"
                    }`}
                    role="switch"
                    aria-checked={enabledRoutine}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full ${
                        enabledRoutine ? "bg-white dark:bg-neutral-900 translate-x-4" : "bg-white translate-x-0"
                      } shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </button>
                </div>

                {/* Dispense Times Pill List */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Feeding Times
                    </span>
                    <span className="text-[9.5px] font-mono text-neutral-500">
                      {routineTimes.length} of 6
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {routineTimes.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-white dark:bg-[#151A24] border border-black/[0.05] dark:border-white/10"
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
                          className="font-mono font-bold text-[12px] bg-transparent text-neutral-900 dark:text-white focus:outline-none w-18"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (routineTimes.length <= 1) return;
                            hasUserEditedRoutine.current = true;
                            setRoutineTimes(routineTimes.filter((_, i) => i !== idx));
                          }}
                          disabled={!isStationOnline || routineTimes.length <= 1}
                          className="text-neutral-400 hover:text-rose-500 transition-colors p-0.5"
                        >
                          <CloseIcon className="w-3 h-3" />
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
                        className="py-1 px-2 rounded-xl border border-dashed border-neutral-400/60 dark:border-white/20 text-neutral-700 dark:text-neutral-300 text-[11px] font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-all text-center"
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
                  className="w-full py-2.5 px-4 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-[12px] font-bold shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save Routine
                </button>
              </form>
            ) : null}

            {/* Visit Collection Feed (Scale Platform Visits) */}
            {(selectedTab === "visits" || selectedTab === "all") && (
              <div
                className={`space-y-1.5 flex-1 min-h-0 flex flex-col ${
                  selectedTab === "all" ? "mt-2 justify-end" : "justify-start"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Platform Visits (Scale Log)
                  </span>
                  <span className="text-[9.5px] font-mono text-neutral-400">
                    {catVisits.length} recorded
                  </span>
                </div>

                <div
                  className={`space-y-1.5 overflow-y-auto pr-1 ${
                    selectedTab === "visits"
                      ? "flex-1 min-h-0"
                      : "max-h-[140px] sm:max-h-[160px] xl:max-h-[190px]"
                  }`}
                >
                  {catVisits.length === 0 ? (
                    <div className="py-5 px-3 rounded-[18px] bg-black/[0.02] dark:bg-white/[0.02] border border-dashed border-black/10 dark:border-white/10 flex flex-col items-center justify-center text-center gap-1 my-auto">
                      <ScaleIcon className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                      <span className="text-[11.5px] font-semibold text-neutral-700 dark:text-neutral-300">
                        No Platform Visits Yet
                      </span>
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500 max-w-[220px]">
                        Visits will log automatically when {catName} steps on the scale.
                      </span>
                    </div>
                  ) : (
                    catVisits.map((v, idx) => (
                      <div
                        key={v.id || idx}
                        className="p-2.5 rounded-[18px] bg-[#D7E5C1] dark:bg-[#202E1B] text-[#243F14] dark:text-[#CBE5A8] flex items-center justify-between shadow-sm transition-all hover:scale-[1.01]"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-white/40 dark:bg-white/10 flex items-center justify-center font-bold">
                            <CatIcon className="w-3.5 h-3.5 fill-current" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[12px] font-bold">
                                {catName} on Scale
                              </span>
                              <span className="text-[8.5px] px-1.5 py-0.2 rounded-full bg-white/50 dark:bg-white/20 font-mono">
                                Scale Log
                              </span>
                            </div>
                            <span className="text-[10px] opacity-80 block font-mono">
                              {formatTimeAgo(v.visit_start)} · {v.peak_weight_g.toFixed(0)}g
                            </span>
                          </div>
                        </div>

                        <div className="w-7 h-7 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center shadow-sm">
                          <ArrowRightIcon className="w-3 h-3" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MOBILE IPHONE LIQUID GLASS NAVIGATION BAR (< lg ONLY)
      ───────────────────────────────────────────────────────────── */}
      <nav
        role="tablist"
        aria-label="Workstation view navigation"
        className="lg:hidden shrink-0 pt-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] w-full max-w-sm sm:max-w-md mx-auto z-30 select-none"
      >
        <div className="relative p-2 sm:p-2.5 rounded-full bg-white/70 dark:bg-[#151924]/70 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/60 dark:border-white/[0.12] shadow-[0_10px_35px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-1px_1px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.55),0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.18),inset_0_-1px_1px_rgba(0,0,0,0.4)] flex items-center justify-between gap-1 sm:gap-1.5 overflow-hidden">
          {/* Authentic iOS Liquid Glass Specular Top Highlight */}
          <div className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/30 to-transparent" />

          {MOBILE_NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = mobileActiveCard === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setMobileActiveCard(tab.id)}
                className={`relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 min-h-[46px] sm:min-h-[50px] py-2.5 sm:py-3 px-2 sm:px-3 rounded-full text-[12px] sm:text-[13px] font-bold tracking-tight transition-transform active:scale-[0.96] cursor-pointer focus:outline-none ${
                  isActive
                    ? "text-white dark:text-neutral-900"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileLiquidGlassActiveTab"
                    transition={{
                      type: "spring",
                      stiffness: 450,
                      damping: 35,
                    }}
                    className="absolute inset-0 rounded-full bg-neutral-900 dark:bg-white shadow-[0_4px_14px_rgba(0,0,0,0.2),inset_0_1px_0.5px_rgba(255,255,255,0.2)] dark:shadow-[0_4px_16px_rgba(255,255,255,0.22),inset_0_1px_0.5px_rgba(255,255,255,0.8)]"
                  />
                )}
                <Icon className="w-4 h-4 shrink-0 relative z-10 transition-colors" />
                <span className="relative z-10 whitespace-nowrap leading-none">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default memo(LiveStation);
