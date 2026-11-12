"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { PawIcon, ScaleIcon, WaterDropIcon, KibbleIcon, SignalIcon, ShieldIcon } from "./Icons";
import TickerBand from "./TickerBand";
import { useAuth } from "@/lib/auth-context";

export default function Hero() {
  const { user, openAuthModal } = useAuth();

  return (
    <section className="relative min-h-[100dvh] flex flex-col justify-between pt-24 md:pt-28 overflow-hidden bg-[#0B0F0B] transition-colors duration-200">
      {/* Background ambient gradient glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(212,246,108,0.12)_0%,transparent_70%)] blur-[80px] pointer-events-none" />

      {/* Main Hero Header & Headline */}
      <div className="section-container relative z-10 text-center max-w-4xl mx-auto pt-6 pb-8">
        {/* Subtle pill tag */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#131A14] border border-white/[0.08] shadow-[0_0_16px_rgba(212,246,108,0.1)] mb-6 text-[12px] font-medium text-[#D4F66C]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4F66C]" />
          <span>Feline IoT Feeder &amp; Digital Scale Station</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4F66C]" />
        </motion.div>

        {/* Headline: Line 1 White, Line 2 Muted Sage */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
          className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-bold tracking-tight leading-[1.08] mb-6 text-balance"
        >
          <span className="text-white block">Automated care</span>
          <span className="text-[#8FA391] block">for your cat&apos;s daily flow</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
          className="text-[16px] md:text-[18px] text-[#8FA391] max-w-2xl mx-auto leading-relaxed mb-8"
        >
          Stress-free automated dry kibble dispensing, fresh water replenishment,
          and precision gram-level health monitoring built on open hardware.
        </motion.p>

        {/* Dual Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#D4F66C] text-[#0C120C] text-[14px] font-bold tracking-tight shadow-[0_0_24px_rgba(212,246,108,0.3)] hover:bg-[#C6EC57] transition-all active:scale-[0.98]"
            >
              <span>Go to Dashboard</span>
              <svg className="w-4 h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <button
              onClick={() => openAuthModal("signup")}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#D4F66C] text-[#0C120C] text-[14px] font-bold tracking-tight shadow-[0_0_24px_rgba(212,246,108,0.3)] hover:bg-[#C6EC57] transition-all active:scale-[0.98]"
            >
              <span>Get Started</span>
              <svg className="w-4 h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          )}

          <a
            href="#why-cat-care"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-[#131A14] text-white border border-white/[0.1] hover:bg-[#1A251C] text-[14px] font-medium tracking-tight transition-all active:scale-[0.98]"
          >
            <svg className="w-3.5 h-3.5 fill-current text-[#D4F66C]" viewBox="0 0 24 24">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span>Explore Hardware</span>
          </a>
        </motion.div>
      </div>

      {/* 5-Card Feature Row (Screenshot 1 Layout) */}
      <div id="hero-features" className="section-container relative z-10 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Card 1: Topographic Wave Lines Vector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
            className="apple-card p-5 flex flex-col justify-between h-[230px] bg-[#131A14] border border-white/[0.08]"
          >
            {/* Topographic line vector graphic */}
            <div className="h-16 w-full overflow-hidden opacity-40 text-[#D4F66C]">
              <svg viewBox="0 0 200 80" className="w-full h-full stroke-current" fill="none" strokeWidth="1.5">
                <path d="M 0 20 Q 50 5, 100 20 T 200 20" />
                <path d="M 0 35 Q 50 15, 100 35 T 200 35" />
                <path d="M 0 50 Q 50 30, 100 50 T 200 50" />
                <path d="M 0 65 Q 50 45, 100 65 T 200 65" />
              </svg>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#D4F66C] mb-1">
                Acoustic Shield
              </div>
              <h3 className="text-[15px] font-bold text-white mb-1.5 leading-snug">
                Sensory Sensitivity
              </h3>
              <p className="text-[12px] text-[#8FA391] leading-relaxed">
                Silent servo disengage prevents anxiety-inducing motor hums.
              </p>
            </div>
          </motion.div>

          {/* Card 2: 35g / 10kg Metric */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            className="apple-card p-5 flex flex-col justify-between h-[230px] bg-[#131A14] border border-white/[0.08]"
          >
            <div className="flex items-center justify-between">
              <ScaleIcon className="w-5 h-5 text-[#D4F66C]" />
              <span className="text-[11px] font-mono text-[#8FA391]">HX711 24-bit</span>
            </div>
            <div>
              <div className="text-[32px] font-bold text-white font-mono tracking-tight leading-none mb-2">
                35g <span className="text-[16px] text-[#8FA391] font-normal">/ 10kg</span>
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#D4F66C] mb-1">
                Gram Accuracy
              </div>
              <p className="text-[12px] text-[#8FA391] leading-relaxed">
                Calibrated strain gauge captures intake and detects presence.
              </p>
            </div>
          </motion.div>

          {/* Card 3: Interactive Routine Schedule Preview (Featured Card) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
            className="apple-card p-5 flex flex-col justify-between h-[230px] bg-[#162017] border border-[#D4F66C]/30 shadow-[0_0_24px_rgba(212,246,108,0.08)]"
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#D4F66C]/15 text-[#D4F66C] text-[10px] font-semibold uppercase tracking-wider">
                <span className="w-1 h-1 rounded-full bg-[#D4F66C]" />
                Automated Routine
              </div>
              <KibbleIcon className="w-4 h-4 text-[#D4F66C]" />
            </div>

            {/* Schedule Items */}
            <div className="space-y-1.5 my-auto text-[11px] font-mono">
              <div className="flex items-center justify-between text-white/90">
                <span className="text-[#8FA391]">08:00</span>
                <span>Morning Kibble (35g)</span>
              </div>
              <div className="flex items-center justify-between text-white/90">
                <span className="text-[#8FA391]">12:00</span>
                <span>Water Top-Up (3s)</span>
              </div>
              <div className="flex items-center justify-between text-white/90">
                <span className="text-[#8FA391]">18:00</span>
                <span>Evening Feed (35g)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px]">
              <span className="text-[#8FA391]">3 Daily Events</span>
              <span className="text-[#D4F66C] font-semibold">Configured &rarr;</span>
            </div>
          </motion.div>

          {/* Card 4: Donut Progress Ring */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
            className="apple-card p-5 flex flex-col justify-between h-[230px] bg-[#131A14] border border-white/[0.08]"
          >
            <div className="flex items-center justify-between">
              <WaterDropIcon className="w-5 h-5 text-accent-azure" />
              <span className="text-[11px] font-mono text-accent-azure">Adequate</span>
            </div>

            {/* Donut progress ring */}
            <div className="flex items-center gap-3 my-auto">
              <div className="relative w-14 h-14 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="3.5"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#0284C7"
                    strokeDasharray="98, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[12px] font-bold text-white font-mono">
                  98%
                </span>
              </div>
              <div className="text-[11px] text-[#8FA391] leading-tight">
                Reservoir probe monitored
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-accent-azure mb-1">
                Soft-Stop Pump
              </div>
              <p className="text-[12px] text-[#8FA391] leading-relaxed">
                600ms voltage ramp prevents splashing and eliminates back-EMF.
              </p>
            </div>
          </motion.div>

          {/* Card 5: Live Hardware Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55, ease: "easeOut" }}
            className="apple-card p-5 flex flex-col justify-between h-[230px] bg-[#131A14] border border-white/[0.08]"
          >
            <div className="flex items-center justify-between">
              <SignalIcon className="w-5 h-5 text-[#D4F66C]" />
              <span className="inline-flex items-center gap-1 text-[11px] text-accent-forest font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-forest animate-pulse" />
                Live 1 Hz
              </span>
            </div>
            <div>
              <div className="text-[18px] font-bold text-white tracking-tight mb-1 font-mono">
                8884 WSS
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#D4F66C] mb-1">
                HiveMQ Cloud TLS
              </div>
              <p className="text-[12px] text-[#8FA391] leading-relaxed">
                Sub-100ms commands over encrypted WebSocket telemetry.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Prominent, Bigger Marquee Ticker Band anchored at the bottom */}
      <TickerBand />
    </section>
  );
}
