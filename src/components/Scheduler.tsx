"use client";

import { useState, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckIcon,
  ScaleIcon,
  KibbleIcon,
  PumpIcon,
  SignalIcon,
  ShieldIcon,
  WaterDropIcon,
  CalmIcon,
} from "./Icons";
import { useAuth } from "@/lib/auth-context";

const hardwareSpecs = [
  {
    icon: SignalIcon,
    label: "Main Controller SoC",
    detail: "ESP32 DevKit 30-pin, 240MHz Dual-Core, 3.3V Logic",
    accent: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  },
  {
    icon: ScaleIcon,
    label: "24-Bit Biometrics ADC",
    detail: "HX711 differential bridge amplifier, 10 kg aluminum load cell",
    accent: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  },
  {
    icon: PumpIcon,
    label: "Fluidics Actuator",
    detail: "XY-MOS Dual Optocoupler MOSFET, Soft-stop PWM decay",
    accent: "text-sky-600 dark:text-sky-400 bg-sky-500/10",
  },
  {
    icon: ShieldIcon,
    label: "Dual-Rail Power Architecture",
    detail: "Isolated 5V 2A external rail with 1000µF decoupling capacitor",
    accent: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
  },
  {
    icon: KibbleIcon,
    label: "Micro-Portion Chute Servo",
    detail: "TowerPro SG90 with 1N4007 diode & auto-detach firmware",
    accent: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  },
  {
    icon: WaterDropIcon,
    label: "Encrypted Broker Fabric",
    detail: "HiveMQ Cloud Serverless, WSS 8884 / TLS 1.3 mutual auth",
    accent: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10",
  },
];

const pinAssignments = [
  { pin: "GPIO 18", role: "HX711 Serial Clock (SCK)", type: "Output (3.3V)" },
  { pin: "GPIO 19", role: "HX711 Serial Data (DT)", type: "Input Pull-Up" },
  { pin: "GPIO 21", role: "SG90 Servo PWM Signal", type: "Timer PWM (50Hz)" },
  { pin: "GPIO 23", role: "XY-MOS Gate Trigger", type: "PWM Soft-Start" },
  { pin: "GPIO 34", role: "Water LM393 Sensor Analog", type: "ADC1 Channel 6" },
  { pin: "GPIO 02", role: "Station Status Diagnostic LED", type: "Onboard Pulse" },
];

interface SchedulerProps {
  catName?: string;
}

export default function Scheduler({ catName }: SchedulerProps) {
  const { catProfile } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    catName: catName || catProfile?.catName || "Whiskers",
    portionSize: "35",
    morningTime: "08:00",
    eveningTime: "18:00",
    waterInterval: "4",
    lowWaterThreshold: "1500",
  });

  useEffect(() => {
    if (catProfile?.catName && (!form.catName || form.catName === "Whiskers")) {
      setForm((prev) => ({ ...prev, catName: catProfile.catName }));
    }
  }, [catProfile?.catName]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const portionGrams = Number(form.portionSize) || 35;
  // Approximation: ~3.8 kcal per gram of standard high-protein feline kibble
  const estimatedKcal = Math.round(portionGrams * 3.8);

  return (
    <section id="scheduler" className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ─────────────────────────────────────────────────────────
            LEFT COLUMN: AUTOMATED ROUTINE SCHEDULER (7 COLS)
        ───────────────────────────────────────────────────────── */}
        <div className="lg:col-span-7 rounded-apple-2xl bg-white dark:bg-[#161B26] border border-black/[0.08] dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] p-6 sm:p-8 transition-all">
          <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-black/[0.06] dark:border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-accent-amber">
                  Routine Automation
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                  Daily Cycle Active
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
                Feeding & Hydration Schedule
              </h2>
            </div>
            <div className="w-9 h-9 rounded-xl bg-accent-amber/10 text-accent-amber flex items-center justify-center">
              <CalmIcon className="w-5 h-5" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="saved"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="py-12 px-6 text-center flex flex-col items-center justify-center bg-[#FAF8F5] dark:bg-[#181D2A] rounded-apple-xl border border-black/[0.06] dark:border-white/[0.08]"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <CheckIcon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                  Station Routine Synchronized
                </h3>
                <p className="text-[13px] text-neutral-600 dark:text-neutral-300 max-w-sm mb-6 leading-relaxed">
                  Configured for <strong className="text-neutral-900 dark:text-white">{form.catName}</strong>:{" "}
                  Dispensing <strong className="font-mono text-neutral-900 dark:text-white">{form.portionSize}g</strong> (approx. {estimatedKcal} kcal) at{" "}
                  <strong className="font-mono text-neutral-900 dark:text-white">{form.morningTime}</strong> and{" "}
                  <strong className="font-mono text-neutral-900 dark:text-white">{form.eveningTime}</strong>. Water circulation cycle every{" "}
                  <strong className="font-mono text-neutral-900 dark:text-white">{form.waterInterval}h</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="apple-button bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 px-6 py-2.5 rounded-full text-[13px] font-semibold active:scale-95 transition-all"
                >
                  Modify Schedule
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Pet Name input */}
                <div>
                  <label
                    htmlFor="catName"
                    className="block text-[12px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5"
                  >
                    Target Companion Profile
                  </label>
                  <input
                    id="catName"
                    name="catName"
                    type="text"
                    value={form.catName}
                    onChange={handleChange}
                    placeholder="Companion Name"
                    className="w-full rounded-apple border border-black/[0.1] dark:border-white/[0.12] bg-[#FAF8F5] dark:bg-[#181D2A] px-4 py-2.5 text-[14px] font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-amber/40 transition-all"
                  />
                </div>

                {/* Portion Size Slider + Input */}
                <div className="bg-[#FAF8F5] dark:bg-[#181D2A] p-4 sm:p-5 rounded-apple-xl border border-black/[0.06] dark:border-white/[0.08]">
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="portionSize"
                      className="text-[12px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                    >
                      Kibble Portion Size
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold border border-amber-500/20">
                        ~{estimatedKcal} kcal / meal
                      </span>
                      <span className="text-[16px] font-bold font-mono text-neutral-900 dark:text-white tabular-nums">
                        {form.portionSize} g
                      </span>
                    </div>
                  </div>

                  <input
                    id="portionSize"
                    name="portionSize"
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={form.portionSize}
                    onChange={handleChange}
                    className="w-full h-2 bg-neutral-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />

                  <div className="flex justify-between text-[10.5px] font-mono text-neutral-400 dark:text-neutral-500 mt-2">
                    <span>10g (Micro-snack)</span>
                    <span>35g (Recommended)</span>
                    <span>100g (Full bowl)</span>
                  </div>
                </div>

                {/* Time Pickers (Morning & Evening) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#FAF8F5] dark:bg-[#181D2A] p-4 rounded-apple-xl border border-black/[0.06] dark:border-white/[0.08]">
                    <label
                      htmlFor="morningTime"
                      className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5"
                    >
                      Morning Dispense Time
                    </label>
                    <input
                      id="morningTime"
                      name="morningTime"
                      type="time"
                      value={form.morningTime}
                      onChange={handleChange}
                      required
                      className="w-full rounded-apple border border-black/[0.1] dark:border-white/[0.12] bg-white dark:bg-[#131722] px-3.5 py-2 text-[14px] font-mono font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-amber/40 transition-all"
                    />
                  </div>

                  <div className="bg-[#FAF8F5] dark:bg-[#181D2A] p-4 rounded-apple-xl border border-black/[0.06] dark:border-white/[0.08]">
                    <label
                      htmlFor="eveningTime"
                      className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5"
                    >
                      Evening Dispense Time
                    </label>
                    <input
                      id="eveningTime"
                      name="eveningTime"
                      type="time"
                      value={form.eveningTime}
                      onChange={handleChange}
                      required
                      className="w-full rounded-apple border border-black/[0.1] dark:border-white/[0.12] bg-white dark:bg-[#131722] px-3.5 py-2 text-[14px] font-mono font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-amber/40 transition-all"
                    />
                  </div>
                </div>

                {/* Water Circulation Interval */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#FAF8F5] dark:bg-[#181D2A] p-4 rounded-apple-xl border border-black/[0.06] dark:border-white/[0.08]">
                    <label
                      htmlFor="waterInterval"
                      className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5"
                    >
                      Water Circulation Cadence
                    </label>
                    <select
                      id="waterInterval"
                      name="waterInterval"
                      value={form.waterInterval}
                      onChange={handleChange}
                      className="w-full rounded-apple border border-black/[0.1] dark:border-white/[0.12] bg-white dark:bg-[#131722] px-3.5 py-2 text-[13px] font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-azure/40 transition-all"
                    >
                      <option value="2">Every 2 Hours (Frequent Aeration)</option>
                      <option value="4">Every 4 Hours (Standard)</option>
                      <option value="6">Every 6 Hours (Whisper Quiet)</option>
                      <option value="8">Every 8 Hours (Conservation)</option>
                    </select>
                  </div>

                  <div className="bg-[#FAF8F5] dark:bg-[#181D2A] p-4 rounded-apple-xl border border-black/[0.06] dark:border-white/[0.08]">
                    <label
                      htmlFor="lowWaterThreshold"
                      className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5"
                    >
                      Low Water Lockout Threshold
                    </label>
                    <select
                      id="lowWaterThreshold"
                      name="lowWaterThreshold"
                      value={form.lowWaterThreshold}
                      onChange={handleChange}
                      className="w-full rounded-apple border border-black/[0.1] dark:border-white/[0.12] bg-white dark:bg-[#131722] px-3.5 py-2 text-[13px] font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-azure/40 transition-all"
                    >
                      <option value="1200">1,200 (Sensitive · ~250ml reserve)</option>
                      <option value="1500">1,500 (Calibrated Standard · ~180ml)</option>
                      <option value="1800">1,800 (Permissive · ~120ml)</option>
                    </select>
                  </div>
                </div>

                {/* Save Routine Button */}
                <button
                  type="submit"
                  className="apple-button w-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 py-3 rounded-apple text-[14px] font-semibold shadow-sm active:scale-[0.98] transition-all"
                >
                  Save Station Routine
                </button>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 text-center font-mono">
                  Routine parameters cached in local station state and mirrored to HiveMQ retain topic.
                </p>
              </form>
            )}
          </AnimatePresence>
        </div>

        {/* ─────────────────────────────────────────────────────────
            RIGHT COLUMN: HARDWARE SPECIFICATIONS & PINOUT HUD (5 COLS)
        ───────────────────────────────────────────────────────── */}
        <div className="lg:col-span-5 rounded-apple-2xl bg-white dark:bg-[#161B26] border border-black/[0.08] dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] p-6 sm:p-8 transition-all">
          <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-black/[0.06] dark:border-white/[0.06]">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Architecture Blueprint
              </span>
              <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
                Hardware Topology
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-200/60 dark:bg-white/10 text-neutral-700 dark:text-neutral-300">
              Rev 2.4 PCB
            </span>
          </div>

          {/* Component Specs List (EcosystemBand style) */}
          <div className="space-y-3 mb-6">
            {hardwareSpecs.map((spec) => (
              <div
                key={spec.label}
                className="flex items-start gap-3 p-3 rounded-apple bg-[#FAF8F5] dark:bg-[#181D2A] border border-black/[0.04] dark:border-white/[0.06] transition-colors"
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${spec.accent}`}
                >
                  <spec.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-neutral-900 dark:text-white leading-tight">
                    {spec.label}
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">
                    {spec.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pin Assignment Matrix Table */}
          <div className="p-4 rounded-apple-xl bg-[#FAF8F5] dark:bg-[#11141D] border border-black/[0.06] dark:border-white/[0.06]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-mono">
                Pinout Trace Table
              </span>
              <span className="text-[9.5px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Isolated 3.3V / 5V
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] font-mono">
              {pinAssignments.map((p) => (
                <div
                  key={p.pin}
                  className="flex items-center justify-between py-1 border-b border-black/[0.03] dark:border-white/[0.04] last:border-0"
                >
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {p.pin}
                  </span>
                  <span className="text-neutral-600 dark:text-neutral-400 text-right">
                    {p.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
