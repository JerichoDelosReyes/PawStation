"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckIcon, ScaleIcon, SignalIcon } from "./Icons";
import { useAuth } from "@/lib/auth-context";

export default function CtaSection() {
  const { user, openAuthModal } = useAuth();
  const [pingLatency, setPingLatency] = useState<number>(28);
  const [scaleDisplay, setScaleDisplay] = useState<string>("3,820.4 g [STABLE]");
  const [isPinging, setIsPinging] = useState<boolean>(false);

  const handleTestPing = () => {
    setIsPinging(true);
    setTimeout(() => {
      setPingLatency(Math.floor(22 + Math.random() * 14));
      setIsPinging(false);
    }, 280);
  };

  const handleSimulateTare = () => {
    setScaleDisplay("0.0 g [TARED]");
    setTimeout(() => {
      setScaleDisplay("3,820.4 g [STABLE]");
    }, 1800);
  };

  return (
    <section className="py-24 md:py-32 bg-canvas-light dark:bg-canvas-dark relative overflow-hidden transition-colors duration-200 border-t border-[#D8E4F2] dark:border-white/[0.04]">
      {/* Background ambient periwinkle wash */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(74,114,184,0.14)_0%,transparent_70%)] blur-[80px] pointer-events-none" />

      <div className="section-container max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Command Deck & Launch Controls */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="lg:col-span-7 flex flex-col items-start text-left"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-navy-card border border-[#D8E4F2] dark:border-white/[0.1] text-[12px] font-medium text-periwinkle dark:text-periwinkle-light mb-6 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
              <span className="font-mono uppercase tracking-wider text-[11px]">Hardware Workbench</span>
              <span className="text-navy-muted dark:text-navy-lightMuted">&middot; Direct ESP32 Telemetry</span>
            </div>

            {/* Asymmetric Bold Headline */}
            <h2 className="text-[clamp(2.1rem,4vw,3.4rem)] font-bold tracking-tight text-navy dark:text-white leading-[1.12] mb-5 text-balance">
              Ready to experience true feeding clarity?
            </h2>

            {/* Industrial Subtitle */}
            <p className="text-[15px] md:text-[17px] text-navy-muted dark:text-navy-lightMuted max-w-xl mb-8 leading-relaxed">
              Stream gram-calibrated load cell telemetry, trigger silent 35g portions,
              and regulate peristaltic hydration directly from your browser. Zero proprietary cloud lock-in.
            </p>

            {/* Value Matrix Specification Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-xl mb-8 text-[13px] text-navy dark:text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#EBF3FA] dark:bg-navy-deep flex items-center justify-center text-periwinkle shrink-0">
                  <CheckIcon className="w-3.5 h-3.5" />
                </div>
                <span>100% Offline-Resilient Firmware</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#EBF3FA] dark:bg-navy-deep flex items-center justify-center text-periwinkle shrink-0">
                  <CheckIcon className="w-3.5 h-3.5" />
                </div>
                <span>Isolated Dual-Rail 5V Circuit</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#EBF3FA] dark:bg-navy-deep flex items-center justify-center text-periwinkle shrink-0">
                  <CheckIcon className="w-3.5 h-3.5" />
                </div>
                <span>Encrypted HiveMQ Cloud TLS</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#EBF3FA] dark:bg-navy-deep flex items-center justify-center text-periwinkle shrink-0">
                  <CheckIcon className="w-3.5 h-3.5" />
                </div>
                <span>Gram-Exact HX711 Strain Gauge</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              {user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-periwinkle hover:bg-periwinkle-hover text-white text-[14px] font-bold tracking-tight shadow-[0_4px_20px_rgba(74,114,184,0.35)] transition-all active:scale-[0.98]"
                >
                  <span>Open Hardware Workspace</span>
                  <svg className="w-4 h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal("signup")}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-periwinkle hover:bg-periwinkle-hover text-white text-[14px] font-bold tracking-tight shadow-[0_4px_20px_rgba(74,114,184,0.35)] transition-all active:scale-[0.98]"
                >
                  <span>Launch Workspace Now</span>
                  <svg className="w-4 h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              )}

              <a
                href="https://github.com/JerichoDelosReyes/PawStation.git"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white dark:bg-navy-card text-navy dark:text-[#F0F4FA] border border-[#D8E4F2] dark:border-white/[0.12] hover:bg-[#EBF3FA] dark:hover:bg-[#1A263D] text-[13px] font-semibold tracking-tight transition-all active:scale-[0.98] shadow-sm"
              >
                <span>GitHub Repository</span>
                <svg className="w-3.5 h-3.5 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          </motion.div>

          {/* Right Column: Live Station Diagnostic Telemetry Deck */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-5"
          >
            <div className="relative rounded-2xl bg-[#080D16] border border-[#20304C] p-5 sm:p-6 shadow-[0_16px_48px_rgba(0,0,0,0.6)] font-mono text-[12px] text-white">
              
              {/* Terminal Title Bar */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                  <span className="text-[11px] font-bold tracking-wider text-sky-400">
                    PAWSTATION-DIAG-01
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-navy-lightMuted">
                  <span className="px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-400">
                    8883 WSS
                  </span>
                  <span>TLS 1.3</span>
                </div>
              </div>

              {/* Diagnostic Metrics Matrix */}
              <div className="space-y-2.5 mb-5 text-[11px] sm:text-[12px]">
                <div className="flex items-center justify-between p-2 rounded bg-white/[0.03] border border-white/[0.04]">
                  <span className="text-navy-lightMuted">MCU Hardware</span>
                  <span className="text-white">ESP32-S3 Dual-Core 240MHz</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white/[0.03] border border-white/[0.04]">
                  <div className="flex items-center gap-1.5 text-navy-lightMuted">
                    <ScaleIcon className="w-3.5 h-3.5 text-periwinkle" />
                    <span>HX711 24-bit</span>
                  </div>
                  <span className="text-sky-300 font-bold">{scaleDisplay}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white/[0.03] border border-white/[0.04]">
                  <span className="text-navy-lightMuted">SG90 Feeder Gate</span>
                  <span className="text-white">20&deg; &rarr; 160&deg; [DISENGAGED]</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white/[0.03] border border-white/[0.04]">
                  <span className="text-navy-lightMuted">XY-MOS Soft-Stop</span>
                  <span className="text-sky-300">0.00V (600ms Ramped)</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white/[0.03] border border-white/[0.04]">
                  <div className="flex items-center gap-1.5 text-navy-lightMuted">
                    <SignalIcon className="w-3.5 h-3.5 text-sky-400" />
                    <span>Broker Latency</span>
                  </div>
                  <span className="text-white">
                    {isPinging ? "pinging..." : `${pingLatency} ms · 1.0 Hz`}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white/[0.03] border border-white/[0.04]">
                  <span className="text-navy-lightMuted">Aux 5V Power Rail</span>
                  <span className="text-sky-400">5.12V / 1.8A Available</span>
                </div>
              </div>

              {/* Interactive Workbench Quick-Test Buttons */}
              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleTestPing}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-sky-400 text-[11px] font-semibold transition-colors active:scale-95"
                >
                  Test Latency Ping
                </button>
                <button
                  type="button"
                  onClick={handleSimulateTare}
                  className="px-3 py-1.5 rounded-lg bg-periwinkle/20 hover:bg-periwinkle/30 text-periwinkle text-[11px] font-semibold transition-colors active:scale-95"
                >
                  Zero Balance Tare
                </button>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
