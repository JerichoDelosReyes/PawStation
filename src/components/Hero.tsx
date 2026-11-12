"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { PawOutlineIcon } from "./Icons";
import TickerBand from "./TickerBand";
import PrototypeHeroFigure from "./PrototypeHeroFigure";
import { useAuth } from "@/lib/auth-context";

export default function Hero() {
  const { user, openAuthModal } = useAuth();

  return (
    <section className="relative min-h-[100dvh] lg:h-[100dvh] lg:max-h-[100dvh] flex flex-col justify-between pt-16 md:pt-16 overflow-hidden bg-canvas-light dark:bg-canvas-dark transition-colors duration-200">
      {/* Background ambient periwinkle gradient glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(74,114,184,0.12)_0%,transparent_70%)] blur-[70px] pointer-events-none" />

      {/* Middle Hero Content: vertically centered in available space */}
      <div className="section-container relative w-full flex-1 flex flex-col justify-center py-4 md:py-6 lg:py-6 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left Column: Text & Actions */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start text-left z-10">
            {/* Top Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-navy-card border border-[#D8E4F2] dark:border-white/[0.08] shadow-[0_1px_3px_rgba(28,41,66,0.04)] mb-4 md:mb-5 text-[12px] font-medium text-navy dark:text-[#F0F4FA] transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-periwinkle" />
              <span>100% Dedicated Cat Hardware &amp; Scheduling</span>
              <span className="w-1.5 h-1.5 rounded-full bg-periwinkle" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
              className="text-[clamp(2.1rem,4.2vw,3.6rem)] font-bold tracking-tight leading-[1.1] text-navy dark:text-white mb-4 md:mb-5"
            >
              Gentle Care, Built
              <br />
              Around{" "}
              <span className="relative inline-block mt-1">
                {/* 3 radiating sketch marks in periwinkle */}
                <svg
                  className="absolute -top-3.5 -right-2 w-6 h-5 text-periwinkle pointer-events-none"
                  viewBox="0 0 24 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="4" y1="16" x2="1" y2="8" />
                  <line x1="12" y1="14" x2="12" y2="4" />
                  <line x1="20" y1="16" x2="23" y2="8" />
                </svg>
                {/* Soft rounded highlighter background pill */}
                <span className="relative z-10 px-3 py-0.5 rounded-xl bg-[#DCE8F5] dark:bg-[#1E2B42] text-navy dark:text-white transition-colors">
                  Your Cat.
                </span>
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
              className="text-[14px] md:text-[16px] leading-relaxed text-navy-muted dark:text-navy-lightMuted max-w-xl mb-6 md:mb-7 transition-colors"
            >
              Stress-free automated dry kibble dispensing, fresh water replenishment,
              and precision gram-level health monitoring built on open hardware.
            </motion.p>

            {/* Action Pill Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              className="flex flex-wrap items-center gap-3.5 mb-6 md:mb-8"
            >
              {user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 bg-periwinkle hover:bg-periwinkle-hover text-white text-[13px] font-semibold tracking-tight shadow-[0_2px_12px_rgba(74,114,184,0.25)] transition-all duration-150 active:scale-[0.98]"
                >
                  <PawOutlineIcon className="w-4 h-4 text-white" />
                  <span>Go to Dashboard</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal("signup")}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 bg-periwinkle hover:bg-periwinkle-hover text-white text-[13px] font-semibold tracking-tight shadow-[0_2px_12px_rgba(74,114,184,0.25)] transition-all duration-150 active:scale-[0.98]"
                >
                  <PawOutlineIcon className="w-4 h-4 text-white" />
                  <span>Get Started</span>
                </button>
              )}
              <a
                href="#why-cat-care"
                className="inline-flex items-center justify-center rounded-full px-6 py-3 bg-white dark:bg-navy-card text-navy dark:text-[#F0F4FA] border border-[#D8E4F2] dark:border-white/[0.12] hover:bg-[#EBF3FA] dark:hover:bg-[#1A263D] text-[13px] font-semibold tracking-tight transition-all duration-150 active:scale-[0.98] shadow-sm"
              >
                <span>Explore Hardware</span>
              </a>
            </motion.div>

            {/* Metrics Row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.4, ease: "easeOut" }}
              className="flex items-center gap-5 sm:gap-8 pt-4 md:pt-5 border-t border-[#D8E4F2] dark:border-white/[0.08] w-full max-w-lg transition-colors"
            >
              <div>
                <div className="text-[20px] sm:text-[24px] md:text-[26px] font-bold tracking-tight text-navy dark:text-white font-mono">
                  1,500+
                </div>
                <div className="text-[11px] sm:text-[12px] text-navy-muted dark:text-navy-lightMuted mt-0.5">
                  Meals Dispensed
                </div>
              </div>
              <div className="w-px h-9 md:h-10 bg-[#D8E4F2] dark:bg-white/[0.1] shrink-0" />
              <div>
                <div className="text-[20px] sm:text-[24px] md:text-[26px] font-bold tracking-tight text-navy dark:text-white font-mono">
                  8+ Years
                </div>
                <div className="text-[11px] sm:text-[12px] text-navy-muted dark:text-navy-lightMuted mt-0.5">
                  Hardware Reliability
                </div>
              </div>
              <div className="w-px h-9 md:h-10 bg-[#D8E4F2] dark:bg-white/[0.1] shrink-0" />
              <div>
                <div className="text-[20px] sm:text-[24px] md:text-[26px] font-bold tracking-tight text-navy dark:text-white font-mono">
                  100%
                </div>
                <div className="text-[11px] sm:text-[12px] text-navy-muted dark:text-navy-lightMuted mt-0.5">
                  Feline-Safe Build
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Physical Hardware Prototype & 3D Schematic Figure */}
          <div className="lg:col-span-6 xl:col-span-6 relative flex items-center justify-center pt-2 lg:pt-0">
            <PrototypeHeroFigure />
          </div>
        </div>
      </div>

      {/* Prominent, Bigger Marquee Ticker Band anchored at the bottom of the first section */}
      <TickerBand />
    </section>
  );
}
