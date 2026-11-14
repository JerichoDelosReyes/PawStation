"use client";

import { useState, useEffect, useRef, memo } from "react";
import {
  ScaleIcon,
  KibbleIcon,
  PumpIcon,
  SignalIcon,
  ShieldIcon,
  WaterDropIcon,
  CalmIcon,
  CloseIcon,
  ClockIcon,
} from "./Icons";
import { useStationStatus, useScheduleTelemetry } from "@/lib/mqtt";

const hardwareSpecs = [
  {
    icon: SignalIcon,
    label: "Main Controller",
    detail: "ESP32 DevKit, dual-core, 3.3V logic",
    pin: "GPIO 02",
    pinRole: "Status Diagnostic LED · Onboard Pulse",
    accent: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  },
  {
    icon: ScaleIcon,
    label: "24-Bit Load Cell Amplifier",
    detail: "HX711 with 10 kg aluminum bar load cell",
    pin: "GPIO 18 / 19",
    pinRole: "SCK (Serial Clock) · DT (Serial Data)",
    accent: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  },
  {
    icon: KibbleIcon,
    label: "Feeder Servo",
    detail: "SG90 micro servo, auto-detach after each dispense",
    pin: "GPIO 21",
    pinRole: "Timer PWM (50Hz) · Auto-detach Chute",
    accent: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  },
  {
    icon: PumpIcon,
    label: "Fluidics Actuator",
    detail: "XY-MOS dual MOSFET module, soft-stop PWM ramp-down",
    pin: "GPIO 23",
    pinRole: "Gate Trigger · PWM Soft-Start Ramp",
    accent: "text-sky-600 dark:text-sky-400 bg-sky-500/10",
  },
  {
    icon: WaterDropIcon,
    label: "Water Level Sensor",
    detail: "LM393 analog resistance probe, reservoir monitor",
    pin: "GPIO 34",
    pinRole: "ADC1 Channel 6 · Analog Voltage Input",
    accent: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10",
  },
  {
    icon: ShieldIcon,
    label: "Separate Power Supply",
    detail: "External 5V supply for servo & pump, common ground",
    pin: "Common GND",
    pinRole: "Isolated 5V Rail · 470–1000 µF Cap",
    accent: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
  },
  {
    icon: SignalIcon,
    label: "Encrypted Broker Fabric",
    detail: "HiveMQ Cloud Serverless, WSS 8884 / TLS 1.3 mutual auth",
    pin: "Port 8884",
    pinRole: "MQTTS Secure WebSocket · TLS Encrypted",
    accent: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
  },
];

interface SchedulerProps {
  catName?: string;
}

function Scheduler({ catName = "Whiskers" }: SchedulerProps) {
  const {
    isStationOnline,
    publishSchedule,
    lastSentSchedule,
  } = useStationStatus();
  const scheduleData = useScheduleTelemetry();

  const [enabled, setEnabled] = useState(true);
  const [times, setTimes] = useState<string[]>(["08:00", "18:00"]);
  const [sentPayload, setSentPayload] = useState<string | null>(null);
  const hasUserEditedRef = useRef(false);

  // Load the current schedule from scheduleData.sched ("1|08:00,18:00" format)
  useEffect(() => {
    if (!scheduleData?.sched) return;

    // If scheduleData.sched matches sentPayload, clear waiting flag
    if (sentPayload && scheduleData.sched === sentPayload) {
      setSentPayload(null);
    }

    // Only auto-populate from station if user hasn't actively edited local form
    if (!hasUserEditedRef.current || scheduleData.sched === lastSentSchedule) {
      const parts = scheduleData.sched.split("|");
      const isEnabled = parts[0] === "1";
      const timesList = parts[1]
        ? parts[1]
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];
      setEnabled(isEnabled);
      setTimes(timesList.length > 0 ? timesList : ["08:00"]);
    }
  }, [scheduleData?.sched, lastSentSchedule, sentPayload]);

  const handleToggle = () => {
    if (!isStationOnline) return;
    hasUserEditedRef.current = true;
    setEnabled((prev) => !prev);
  };

  const handleTimeChange = (index: number, val: string) => {
    if (!isStationOnline) return;
    hasUserEditedRef.current = true;
    setTimes((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleAddTime = () => {
    if (!isStationOnline || times.length >= 6) return;
    hasUserEditedRef.current = true;
    setTimes((prev) => [...prev, "12:00"]);
  };

  const handleRemoveTime = (index: number) => {
    if (!isStationOnline) return;
    hasUserEditedRef.current = true;
    setTimes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStationOnline) return;

    // Sort and de-duplicate before sending
    const cleanedTimes = Array.from(
      new Set(times.map((t) => t.trim()).filter(Boolean))
    ).sort();

    const payload = `${enabled ? 1 : 0}|${cleanedTimes.join(",")}`;
    setTimes(cleanedTimes);
    setSentPayload(payload);
    publishSchedule(payload);
  };

  // Sync state determination
  const isSavedOnStation = sentPayload
    ? scheduleData?.sched === sentPayload
    : Boolean(scheduleData?.sched);

  return (
    <section id="scheduler" className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* ─────────────────────────────────────────────────────────
            LEFT COLUMN: FEEDING SCHEDULE (7 COLS)
        ───────────────────────────────────────────────────────── */}
        <div className="lg:col-span-7 h-full flex flex-col rounded-apple-2xl bg-white dark:bg-[#161B26] border border-black/[0.08] dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] p-6 sm:p-8 transition-all">
          <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-black/[0.06] dark:border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-accent-amber">
                  Routine Automation
                </span>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                    isSavedOnStation
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                  }`}
                >
                  {isSavedOnStation ? "Saved on station" : "Waiting for station..."}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
                Feeding Schedule
              </h2>
            </div>
            <div className="w-9 h-9 rounded-xl bg-accent-amber/10 text-accent-amber flex items-center justify-center">
              <CalmIcon className="w-5 h-5" />
            </div>
          </div>

          <form onSubmit={handleSave} className="flex-1 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              {/* Station Clock & Last Auto Feed Telemetry HUD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-apple-xl bg-[#FAF8F5] dark:bg-[#181D2A] border border-black/[0.06] dark:border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-neutral-600 dark:text-neutral-400">
                    <ClockIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10.5px] uppercase font-mono tracking-wider text-neutral-500 dark:text-neutral-400 block leading-tight">
                      Station Clock
                    </span>
                    <span className="text-[13px] font-mono font-semibold text-neutral-900 dark:text-white">
                      {scheduleData?.clock || "--:--"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-neutral-600 dark:text-neutral-400">
                    <KibbleIcon className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <span className="text-[10.5px] uppercase font-mono tracking-wider text-neutral-500 dark:text-neutral-400 block leading-tight">
                      Last Automatic Feed
                    </span>
                    <span className="text-[13px] font-mono font-semibold text-neutral-900 dark:text-white">
                      {scheduleData?.lastAuto || "None yet"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Warning if Station Clock is not synced */}
              {scheduleData && scheduleData.timeOk === false && (
                <div className="p-3 rounded-apple bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[12px] flex items-center gap-2 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span>Station clock not synced - scheduled feeds will not run.</span>
                </div>
              )}

              {/* Target Companion Profile (Display-Only) */}
              <div>
                <label className="block text-[12px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                  Target Companion Profile
                </label>
                <div className="w-full rounded-apple border border-black/[0.08] dark:border-white/[0.08] bg-[#FAF8F5] dark:bg-[#181D2A] px-4 py-2.5 text-[14px] font-medium text-neutral-900 dark:text-white select-none">
                  {catName}
                </div>
              </div>

              {/* Schedule Enable/Disable Toggle */}
              <div className="flex items-center justify-between p-4 rounded-apple-xl bg-[#FAF8F5] dark:bg-[#181D2A] border border-black/[0.06] dark:border-white/[0.08]">
                <div>
                  <span className="text-[13px] font-bold text-neutral-900 dark:text-white block">
                    Automatic Dispensing Routine
                  </span>
                  <span className="text-[11.5px] text-neutral-500 dark:text-neutral-400">
                    {enabled ? "Schedule is active on station" : "Automatic feeds disabled"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleToggle}
                  disabled={!isStationOnline}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
                    enabled ? "bg-amber-500" : "bg-neutral-300 dark:bg-white/20"
                  }`}
                  role="switch"
                  aria-checked={enabled}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* List of feeding times (up to 6) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[12px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Dispense Times (Up to 6)
                  </label>
                  <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                    {times.length} of 6 configured
                  </span>
                </div>

                <div className="space-y-2.5">
                  {times.map((timeVal, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={timeVal}
                        disabled={!isStationOnline}
                        onChange={(e) => handleTimeChange(idx, e.target.value)}
                        required
                        className="flex-1 rounded-apple border border-black/[0.1] dark:border-white/[0.12] bg-white dark:bg-[#131722] px-3.5 py-2 text-[14px] font-mono font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-amber/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTime(idx)}
                        disabled={!isStationOnline || times.length <= 1}
                        className="p-2 rounded-apple border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#131722] hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Remove time"
                      >
                        <CloseIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {times.length < 6 && (
                  <button
                    type="button"
                    onClick={handleAddTime}
                    disabled={!isStationOnline}
                    className="apple-button w-full border border-dashed border-black/[0.15] dark:border-white/[0.15] hover:border-accent-amber hover:bg-accent-amber/5 text-neutral-700 dark:text-neutral-300 py-2.5 rounded-apple text-[12.5px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    + Add Feeding Time
                  </button>
                )}
              </div>
            </div>

            {/* Save Button & Note Pinned at Bottom */}
            <div className="mt-auto pt-4 space-y-2">
              <button
                type="submit"
                disabled={!isStationOnline}
                className="apple-button w-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 py-3 rounded-apple text-[14px] font-semibold shadow-sm active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save Feeding Schedule
              </button>

              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 text-center font-mono">
                Each automatic feed runs one standard dispense cycle.
              </p>
            </div>
          </form>
        </div>

        {/* ─────────────────────────────────────────────────────────
            RIGHT COLUMN: HARDWARE TOPOLOGY WITH INTEGRATED PIN TRACES
        ───────────────────────────────────────────────────────── */}
        <div className="lg:col-span-5 h-full flex flex-col rounded-apple-2xl bg-white dark:bg-[#161B26] border border-black/[0.08] dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] p-6 sm:p-8 transition-all">
          <div className="flex items-center justify-between gap-3 mb-5 pb-3.5 border-b border-black/[0.06] dark:border-white/[0.06]">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Architecture Blueprint
              </span>
              <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
                Hardware Topology
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-200/60 dark:bg-white/10 text-neutral-700 dark:text-neutral-300">
              Breadboard prototype
            </span>
          </div>

          {/* Component Specs Cards with Integrated Pin Traces */}
          <div className="flex-1 flex flex-col justify-between gap-2.5">
            {hardwareSpecs.map((spec) => (
              <div
                key={spec.label}
                className="p-3 rounded-apple bg-[#FAF8F5] dark:bg-[#181D2A] border border-black/[0.04] dark:border-white/[0.06] transition-all hover:border-black/[0.08] dark:hover:border-white/[0.12]"
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${spec.accent}`}
                  >
                    <spec.icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[12.5px] font-bold text-neutral-900 dark:text-white leading-tight">
                        {spec.label}
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-neutral-200/70 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 border border-black/[0.04] dark:border-white/[0.06] shrink-0">
                        {spec.pin}
                      </span>
                    </div>

                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">
                      {spec.detail}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-mono text-neutral-600 dark:text-neutral-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="truncate">{spec.pinRole}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(Scheduler);
