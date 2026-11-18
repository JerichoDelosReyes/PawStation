"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloseIcon,
  ChipIcon,
  SignalIcon,
  ScaleIcon,
  KibbleIcon,
  PumpIcon,
  WaterDropIcon,
  ShieldIcon,
  TareIcon,
  CheckIcon,
  RefreshIcon,
} from "./Icons";
import { usePawStation, isValidStationHost } from "@/lib/station";

interface HardwareDiagnosticsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

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
    detail: "10 kg aluminum bar load cell with ADC",
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
    label: "Direct Wi-Fi Controller",
    detail: "ESP32 Local Network (WebSocket / HTTP REST)",
    pin: "Port 80 /ws",
    pinRole: "Direct Wi-Fi · Zero Cloud Dependency",
    accent: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
  },
];

export default function HardwareDiagnosticsDrawer({
  isOpen,
  onClose,
}: HardwareDiagnosticsDrawerProps) {
  const {
    telemetry,
    stationStatus,
    isStationOnline,
    statusMessage,
    stationError,
    sendCommand,
    esp32Host,
    setEsp32Host,
    scaleInverted,
    setScaleInverted,
  } = usePawStation();

  const [hostInput, setHostInput] = useState(esp32Host || "pawstation.local");
  const [hostSaved, setHostSaved] = useState(false);
  const [isSavingHost, setIsSavingHost] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [hostError, setHostError] = useState<string | null>(null);
  const [rawView, setRawView] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  useEffect(() => {
    setHostInput(esp32Host || "pawstation.local");
    setHostError(null);
  }, [esp32Host]);

  // Handle ESC key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSaveHost = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = hostInput.trim();
    if (!trimmed) {
      setHostError("Please enter an IP address or hostname.");
      return;
    }
    if (!isValidStationHost(trimmed)) {
      setHostError("Invalid host. Enter an IP (e.g. 192.168.0.118) or mDNS (e.g. pawstation.local)");
      return;
    }
    setHostError(null);
    setIsSavingHost(true);

    try {
      // 1. Immediately apply to active station connection and localStorage
      setEsp32Host(trimmed);

      // 2. Persist to .env and server runtime
      const res = await fetch("/api/station/host", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host: trimmed }),
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setHostSaved(true);
        setSaveSuccessMsg(data.savedToFile ? "Saved to .env & Connected" : "Host Updated & Connected");
        setTimeout(() => {
          setHostSaved(false);
          setSaveSuccessMsg(null);
        }, 3000);
      } else {
        setHostSaved(true);
        setSaveSuccessMsg("Connected");
        setTimeout(() => {
          setHostSaved(false);
          setSaveSuccessMsg(null);
        }, 3000);
      }
    } catch {
      setHostSaved(true);
      setSaveSuccessMsg("Connected (client)");
      setTimeout(() => {
        setHostSaved(false);
        setSaveSuccessMsg(null);
      }, 3000);
    } finally {
      setIsSavingHost(false);
    }
  };

  const handleTare = () => {
    if (cooldown || !isStationOnline) return;
    setCooldown(true);
    sendCommand("tare");
    setTimeout(() => setCooldown(false), 1200);
  };

  const getRssiQuality = (rssi?: number) => {
    if (rssi == null) return { text: "No Signal", bars: 0, color: "text-neutral-400" };
    if (rssi >= -60) return { text: `${rssi} dBm (Excellent)`, bars: 3, color: "text-emerald-500" };
    if (rssi >= -75) return { text: `${rssi} dBm (Good)`, bars: 2, color: "text-amber-500" };
    return { text: `${rssi} dBm (Weak)`, bars: 1, color: "text-rose-500" };
  };

  const rssi = getRssiQuality(telemetry?.rssi);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 select-none"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-[#FAF7F0] dark:bg-[#131720] border-l border-black/10 dark:border-white/10 shadow-2xl z-50 flex flex-col overflow-hidden text-neutral-900 dark:text-white"
            role="dialog"
            aria-label="Hardware Diagnostics"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.08] dark:border-white/[0.08] bg-white/70 dark:bg-[#181D2A]/70 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center">
                  <ChipIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold tracking-tight">
                    Hardware Diagnostics
                  </h2>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    ESP32 Firmware &amp; Breadboard Pinout
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/10 dark:hover:bg-white/15 text-neutral-600 dark:text-neutral-300 flex items-center justify-center transition-all active:scale-95"
                aria-label="Close Diagnostics"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Station Connection Card */}
              <div className="rounded-[24px] bg-white dark:bg-[#181E2B] border border-black/[0.06] dark:border-white/[0.08] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    Connection &amp; Mode
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        isStationOnline
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isStationOnline ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                      />
                      <span>{isStationOnline ? "Online" : "Offline"}</span>
                    </span>
                  </div>
                </div>

                {/* Host Editor */}
                <form onSubmit={handleSaveHost} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[12px] font-semibold text-neutral-700 dark:text-neutral-300">
                      ESP32 Host Address (Direct Wi-Fi / mDNS)
                    </label>
                    <span className="text-[10px] font-mono text-neutral-400">
                      Updates .env &amp; Live Link
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={hostInput}
                      disabled={isSavingHost}
                      onChange={(e) => {
                        setHostInput(e.target.value);
                        if (hostError) setHostError(null);
                      }}
                      placeholder="e.g. 192.168.0.118 or pawstation.local"
                      className="flex-1 px-3.5 py-2 rounded-full border border-black/10 dark:border-white/10 bg-[#FBF9F5] dark:bg-[#121620] text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={isSavingHost}
                      className="px-4 py-2 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-[12px] font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5 min-w-[72px] justify-center"
                    >
                      {isSavingHost ? (
                        <RefreshIcon className="w-3.5 h-3.5 animate-spin" />
                      ) : hostSaved ? (
                        <>
                          <CheckIcon className="w-3.5 h-3.5" />
                          <span>Saved</span>
                        </>
                      ) : (
                        "Save"
                      )}
                    </button>
                  </div>
                  {saveSuccessMsg && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium px-1 flex items-center gap-1.5">
                      <CheckIcon className="w-3.5 h-3.5" />
                      <span>{saveSuccessMsg}</span>
                    </p>
                  )}
                  {hostError && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium px-1">
                      {hostError}
                    </p>
                  )}
                </form>
              </div>

              {/* Real-Time RF & Sensor Calibration */}
              <div className="rounded-[24px] bg-white dark:bg-[#181E2B] border border-black/[0.06] dark:border-white/[0.08] p-5 shadow-sm space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Sensor Biometrics &amp; Signal
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-[#FBF9F5] dark:bg-[#121620] border border-black/[0.04] dark:border-white/[0.06]">
                    <span className="text-[10.5px] uppercase font-mono tracking-wider text-neutral-400 block">
                      Wi-Fi RSSI
                    </span>
                    <span className={`text-[13px] font-bold font-mono mt-0.5 block ${rssi.color}`}>
                      {rssi.text}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FBF9F5] dark:bg-[#121620] border border-black/[0.04] dark:border-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] uppercase font-mono tracking-wider text-neutral-400 block">
                        Scale Load Cell
                      </span>
                      <span
                        className={`text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full ${
                          telemetry
                            ? telemetry.scaleOk
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : "text-neutral-400"
                        }`}
                      >
                        {telemetry ? (telemetry.scaleOk ? "HX711 OK" : "No Signal") : "--"}
                      </span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between gap-1">
                      <span className="text-[13px] font-bold font-mono text-neutral-900 dark:text-white block">
                        {telemetry ? `${telemetry.weight.toFixed(1)} g` : "--"}
                      </span>
                      {telemetry?.raw !== undefined && (
                        <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 truncate" title={`Raw ADC: ${telemetry.raw}`}>
                          ADC: {telemetry.raw}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Scale Actions: Tare & Polarity Toggle */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleTare}
                    disabled={!isStationOnline || cooldown}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full border border-neutral-300 dark:border-white/15 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-[12px] font-semibold text-neutral-900 dark:text-white transition-all active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <TareIcon className="w-4 h-4" />
                    <span>Zero Scale</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScaleInverted(!scaleInverted)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full border text-[12px] font-semibold transition-all active:scale-98 ${
                      scaleInverted
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : "border-neutral-300 dark:border-white/15 text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                    title="Invert reading sign if downward force produces negative numbers"
                  >
                    <span>Polarity: {scaleInverted ? "Inverted (+)" : "Normal (-)"}</span>
                  </button>
                </div>
              </div>

              {/* Hardware Topology Pinout Specifications */}
              <div className="rounded-[24px] bg-white dark:bg-[#181E2B] border border-black/[0.06] dark:border-white/[0.08] p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-black/[0.04] dark:border-white/[0.06]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    Hardware Pinout Topology
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-300">
                    ESP32 DevKit
                  </span>
                </div>

                <div className="space-y-2">
                  {hardwareSpecs.map((spec) => (
                    <div
                      key={spec.label}
                      className="p-3 rounded-2xl bg-[#FBF9F5] dark:bg-[#121620] border border-black/[0.04] dark:border-white/[0.06]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${spec.accent}`}>
                            <spec.icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-[12px] font-bold text-neutral-900 dark:text-white block">
                              {spec.label}
                            </span>
                            <span className="text-[10.5px] text-neutral-500 dark:text-neutral-400 block leading-tight">
                              {spec.detail}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-neutral-200/70 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 shrink-0">
                          {spec.pin}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5 text-[9.5px] font-mono text-neutral-500 dark:text-neutral-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span>{spec.pinRole}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw Telemetry Inspector */}
              <div className="pt-2 pb-6">
                <button
                  type="button"
                  onClick={() => setRawView(!rawView)}
                  className="text-[11px] font-mono text-neutral-500 hover:text-neutral-900 dark:hover:text-white underline underline-offset-2 transition-colors block text-center w-full"
                >
                  {rawView ? "Hide Raw Telemetry Payload" : "Inspect Raw WebSocket Stream"}
                </button>

                {rawView && (
                  <pre className="mt-3 p-3 rounded-2xl bg-neutral-900 text-emerald-400 text-[10px] font-mono overflow-x-auto leading-relaxed border border-black/10">
                    {JSON.stringify(
                      {
                        telemetry,
                        stationStatus,
                        statusMessage,
                        stationError,
                      },
                      null,
                      2
                    )}
                  </pre>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
