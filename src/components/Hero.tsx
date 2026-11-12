"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { PawIcon, PawOutlineIcon, StarIcon } from "./Icons";
import TickerBand from "./TickerBand";
import { useAuth } from "@/lib/auth-context";

export default function Hero() {
  const { user, openAuthModal } = useAuth();
  return (
    <section className="relative min-h-[100dvh] lg:h-[100dvh] lg:max-h-[100dvh] flex flex-col justify-between pt-16 md:pt-16 overflow-hidden bg-canvas-light dark:bg-canvas-dark transition-colors duration-200">
      {/* Middle Hero Content: vertically centered in available space */}
      <div className="section-container relative w-full flex-1 flex flex-col justify-center py-4 md:py-6 lg:py-6 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left Column: Text & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left z-10">
            {/* Top Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.09] shadow-[0_1px_3px_rgba(0,0,0,0.04)] mb-4 md:mb-5 text-[12px] font-medium text-[#18181B] dark:text-[#F4F4F5] transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent-amber" />
              <span>100% Dedicated Cat Hardware &amp; Scheduling</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent-amber" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
              className="text-[clamp(2.1rem,4.2vw,3.6rem)] font-bold tracking-tight leading-[1.1] text-[#18181B] dark:text-[#F4F4F5] mb-4 md:mb-5"
            >
              Gentle Care, Built
              <br />
              Around{" "}
              <span className="relative inline-block mt-1">
                {/* 3 yellow radiating sketch marks */}
                <svg
                  className="absolute -top-3.5 -right-2 w-6 h-5 text-accent-amber pointer-events-none"
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
                {/* Soft rounded grey highlighter background pill */}
                <span className="relative z-10 px-3 py-0.5 rounded-xl bg-[#E5E5EA] dark:bg-[#2C2C2E] text-[#18181B] dark:text-[#F4F4F5] transition-colors">
                  Your Cat.
                </span>
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
              className="text-[14px] md:text-[16px] leading-relaxed text-[#71717A] dark:text-[#A1A1AA] max-w-xl mb-6 md:mb-7 transition-colors"
            >
              Stress-free automated feeding and watering designed exclusively
              for cats, powered by precision hardware and smart scheduling.
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
                  className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 bg-[#18181B] text-white hover:bg-[#27272A] dark:bg-white dark:text-[#18181B] dark:hover:bg-gray-100 text-[13px] font-semibold tracking-tight transition-all duration-150 active:scale-[0.98] shadow-sm"
                >
                  <PawOutlineIcon className="w-4 h-4 text-white dark:text-[#18181B]" />
                  <span>Go to Dashboard</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal("signup")}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 bg-[#18181B] text-white hover:bg-[#27272A] dark:bg-white dark:text-[#18181B] dark:hover:bg-gray-100 text-[13px] font-semibold tracking-tight transition-all duration-150 active:scale-[0.98] shadow-sm"
                >
                  <PawOutlineIcon className="w-4 h-4 text-white dark:text-[#18181B]" />
                  <span>Get Started</span>
                </button>
              )}
              <a
                href="#why-cat-care"
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 bg-white dark:bg-[#1C1C1E] text-[#18181B] dark:text-[#F4F4F5] border border-black/[0.12] dark:border-white/[0.12] hover:bg-gray-50 dark:hover:bg-[#2C2C2E] text-[13px] font-semibold tracking-tight transition-all duration-150 active:scale-[0.98] shadow-sm"
              >
                <PawOutlineIcon className="w-4 h-4 text-[#18181B] dark:text-[#F4F4F5]" />
                <span>Hardware Architecture</span>
              </a>
            </motion.div>

            {/* Metrics Row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.4, ease: "easeOut" }}
              className="flex items-center gap-5 sm:gap-8 pt-4 md:pt-5 border-t border-black/[0.08] dark:border-white/[0.08] w-full max-w-lg transition-colors"
            >
              <div>
                <div className="text-[20px] sm:text-[24px] md:text-[26px] font-bold tracking-tight text-[#18181B] dark:text-[#F4F4F5] font-mono">
                  1,500+
                </div>
                <div className="text-[11px] sm:text-[12px] text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
                  Meals Dispensed
                </div>
              </div>
              <div className="w-px h-9 md:h-10 bg-black/[0.1] dark:bg-white/[0.1] shrink-0" />
              <div>
                <div className="text-[20px] sm:text-[24px] md:text-[26px] font-bold tracking-tight text-[#18181B] dark:text-[#F4F4F5] font-mono">
                  8+ Years
                </div>
                <div className="text-[11px] sm:text-[12px] text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
                  Hardware Reliability
                </div>
              </div>
              <div className="w-px h-9 md:h-10 bg-black/[0.1] dark:bg-white/[0.1] shrink-0" />
              <div>
                <div className="text-[20px] sm:text-[24px] md:text-[26px] font-bold tracking-tight text-[#18181B] dark:text-[#F4F4F5] font-mono">
                  100%
                </div>
                <div className="text-[11px] sm:text-[12px] text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
                  Feline-Safe Build
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Visual Elements */}
          <div className="lg:col-span-5 relative flex items-center justify-center pt-2 lg:pt-0">
            {/* Watermark Paw floating top-left */}
            <div className="absolute -top-6 left-2 sm:left-6 w-16 h-16 text-accent-amber/20 dark:text-accent-amber/10 -rotate-12 pointer-events-none z-0">
              <PawIcon className="w-full h-full" />
            </div>

            {/* White curved outline stroke wrapping behind the arches */}
            <svg
              className="absolute -top-10 -left-6 w-[120%] h-[120%] pointer-events-none z-0 stroke-white/80 dark:stroke-white/20"
              viewBox="0 0 400 450"
              fill="none"
              strokeWidth="2.5"
              strokeDasharray="6 4"
            >
              <path d="M 40 220 C 30 100, 160 40, 240 70 C 320 100, 370 200, 350 320 C 330 420, 200 430, 120 400" />
            </svg>

            {/* Arches Container */}
            <div className="relative flex items-end justify-center z-10 pb-4 md:pb-6">
              {/* Left Arch: Pastel Sky Blue with Calico Kitten */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                className="w-36 sm:w-44 md:w-48 h-56 sm:h-68 md:h-76 rounded-t-full rounded-b-3xl bg-[#D6EBF8] dark:bg-[#1E3A5F]/70 border-2 border-white dark:border-sky-400/30 shadow-sm overflow-hidden relative flex flex-col justify-end transition-colors"
              >
                {/* Decorative arch ambient glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#C0E3F7]/40 dark:from-sky-500/10 to-transparent pointer-events-none" />

                {/* Calico Kitten Vector */}
                <svg
                  viewBox="0 0 200 240"
                  className="w-full h-auto drop-shadow-sm select-none"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Calico Body */}
                  <path
                    d="M 40 240 C 40 170, 70 140, 100 140 C 130 140, 160 170, 160 240 Z"
                    fill="#FDFBF7"
                  />
                  {/* Calico dark spot on body */}
                  <path
                    d="M 120 170 C 135 170, 155 185, 158 215 C 145 220, 130 205, 125 190 Z"
                    fill="#3F3F46"
                  />
                  {/* Calico ginger spot on body */}
                  <path
                    d="M 45 200 C 42 180, 60 170, 75 180 C 70 200, 55 210, 45 200 Z"
                    fill="#E67E22"
                  />

                  {/* Kitten Head */}
                  <circle cx="100" cy="110" r="48" fill="#FDFBF7" />

                  {/* Left Ear (Grey/Dark Calico patch) */}
                  <path d="M 62 82 L 48 35 L 85 68 Z" fill="#3F3F46" />
                  <path d="M 64 76 L 55 46 L 80 68 Z" fill="#FCA5A5" opacity="0.6" />

                  {/* Right Ear (Ginger Calico patch) */}
                  <path d="M 138 82 L 152 35 L 115 68 Z" fill="#E67E22" />
                  <path d="M 136 76 L 145 46 L 120 68 Z" fill="#FCA5A5" opacity="0.6" />

                  {/* Calico eye patch over left eye */}
                  <path
                    d="M 68 90 C 60 95, 58 115, 72 125 C 85 125, 90 105, 82 95 Z"
                    fill="#3F3F46"
                    opacity="0.9"
                  />

                  {/* Eyes */}
                  <circle cx="80" cy="112" r="5" fill="#18181B" />
                  <circle cx="78.5" cy="110" r="1.5" fill="#FFFFFF" />
                  <circle cx="120" cy="112" r="5" fill="#18181B" />
                  <circle cx="118.5" cy="110" r="1.5" fill="#FFFFFF" />

                  {/* Pink Nose */}
                  <polygon points="97,122 103,122 100,126" fill="#F472B6" />

                  {/* Mouth */}
                  <path
                    d="M 95 128 Q 100 132 105 128"
                    stroke="#71717A"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Whiskers Left */}
                  <line x1="60" y1="122" x2="40" y2="120" stroke="#A1A1AA" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="60" y1="126" x2="38" y2="128" stroke="#A1A1AA" strokeWidth="1.2" strokeLinecap="round" />
                  {/* Whiskers Right */}
                  <line x1="140" y1="122" x2="160" y2="120" stroke="#A1A1AA" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="140" y1="126" x2="162" y2="128" stroke="#A1A1AA" strokeWidth="1.2" strokeLinecap="round" />

                  {/* Paws resting on bottom */}
                  <ellipse cx="80" cy="235" rx="14" ry="10" fill="#FFFFFF" stroke="#E4E4E7" strokeWidth="1" />
                  <ellipse cx="120" cy="235" rx="14" ry="10" fill="#FFFFFF" stroke="#E4E4E7" strokeWidth="1" />
                </svg>
              </motion.div>

              {/* Right Arch: Warm Pastel Yellow with Ginger Tabby Cat (Taller) */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                className="w-40 sm:w-48 md:w-52 h-68 sm:h-80 md:h-88 rounded-t-full rounded-b-3xl bg-[#FEF08A]/70 dark:bg-[#5C4D1E]/60 border-2 border-white dark:border-amber-400/30 shadow-sm overflow-hidden relative -ml-8 sm:-ml-10 z-10 flex flex-col justify-end transition-colors"
              >
                {/* Decorative arch ambient glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#FDE047]/20 dark:from-amber-400/10 to-transparent pointer-events-none" />

                {/* Ginger Tabby Cat Vector */}
                <svg
                  viewBox="0 0 220 280"
                  className="w-full h-auto drop-shadow-sm select-none"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Tabby Body */}
                  <path
                    d="M 40 280 C 40 190, 75 160, 110 160 C 145 160, 180 190, 180 280 Z"
                    fill="#F59E0B"
                  />
                  {/* Tabby chest bib (cream white) */}
                  <path
                    d="M 85 280 C 85 210, 110 195, 110 195 C 110 195, 135 210, 135 280 Z"
                    fill="#FFFBEB"
                  />

                  {/* Body Tabby Stripes */}
                  <path d="M 55 220 Q 75 222 80 215" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 52 245 Q 75 247 82 240" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 165 220 Q 145 222 140 215" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 168 245 Q 145 247 138 240" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Cat Head */}
                  <circle cx="110" cy="120" r="54" fill="#F59E0B" />

                  {/* Left Ear */}
                  <path d="M 68 88 L 52 32 L 95 72 Z" fill="#F59E0B" />
                  <path d="M 70 82 L 60 45 L 88 72 Z" fill="#FCA5A5" opacity="0.7" />

                  {/* Right Ear */}
                  <path d="M 152 88 L 168 32 L 125 72 Z" fill="#F59E0B" />
                  <path d="M 150 82 L 160 45 L 132 72 Z" fill="#FCA5A5" opacity="0.7" />

                  {/* Forehead Tabby 'M' marking */}
                  <path d="M 95 86 L 102 100 L 110 88 L 118 100 L 125 86" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                  {/* White Muzzle Area */}
                  <ellipse cx="110" cy="138" rx="20" ry="14" fill="#FFFBEB" />

                  {/* Eyes (Happy gentle green eyes) */}
                  <ellipse cx="88" cy="122" rx="6" ry="7" fill="#15803D" />
                  <circle cx="88" cy="122" r="4" fill="#18181B" />
                  <circle cx="86" cy="119" r="1.8" fill="#FFFFFF" />

                  <ellipse cx="132" cy="122" rx="6" ry="7" fill="#15803D" />
                  <circle cx="132" cy="122" r="4" fill="#18181B" />
                  <circle cx="130" cy="119" r="1.8" fill="#FFFFFF" />

                  {/* Nose */}
                  <polygon points="107,133 113,133 110,137" fill="#F472B6" />

                  {/* Smiling Mouth */}
                  <path
                    d="M 103 140 Q 110 144 117 140"
                    stroke="#B45309"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Tabby Cheeks */}
                  <line x1="68" y1="135" x2="42" y2="132" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="68" y1="140" x2="40" y2="142" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="152" y1="135" x2="178" y2="132" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="152" y1="140" x2="180" y2="142" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />

                  {/* Front Paws */}
                  <ellipse cx="88" cy="275" rx="16" ry="11" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" />
                  <ellipse cx="132" cy="275" rx="16" ry="11" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" />
                </svg>
              </motion.div>

              {/* Floating White Rating Card positioned at bottom-right/bottom-center */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
                className="absolute -bottom-2 -right-2 sm:right-0 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md rounded-2xl border border-black/[0.08] dark:border-white/[0.1] shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] p-3 px-4 flex items-center gap-3 z-30 transition-colors"
              >
                {/* 3 Circular Avatars Stack */}
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-[#E0F2FE] dark:bg-sky-900/60 border-2 border-white dark:border-[#1C1C1E] flex items-center justify-center overflow-hidden">
                    <svg viewBox="0 0 20 20" className="w-5 h-5 text-sky-600 dark:text-sky-300" fill="currentColor">
                      <circle cx="10" cy="7" r="3.5" />
                      <path d="M4 17c0-3 3-5 6-5s6 2 6 5v1H4v-1z" />
                    </svg>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#FEF3C7] dark:bg-amber-900/60 border-2 border-white dark:border-[#1C1C1E] flex items-center justify-center overflow-hidden">
                    <svg viewBox="0 0 20 20" className="w-5 h-5 text-amber-600 dark:text-amber-300" fill="currentColor">
                      <circle cx="10" cy="7" r="3.5" />
                      <path d="M4 17c0-3 3-5 6-5s6 2 6 5v1H4v-1z" />
                    </svg>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#DCFCE7] dark:bg-emerald-900/60 border-2 border-white dark:border-[#1C1C1E] flex items-center justify-center overflow-hidden">
                    <svg viewBox="0 0 20 20" className="w-5 h-5 text-emerald-600 dark:text-emerald-300" fill="currentColor">
                      <circle cx="10" cy="7" r="3.5" />
                      <path d="M4 17c0-3 3-5 6-5s6 2 6 5v1H4v-1z" />
                    </svg>
                  </div>
                </div>

                {/* Score & Subtext */}
                <div>
                  <div className="flex items-center gap-1.5 leading-none">
                    <StarIcon className="w-3.5 h-3.5 text-accent-amber" />
                    <span className="font-semibold text-[13px] text-[#18181B] dark:text-[#F4F4F5] font-mono">
                      4.9/5
                    </span>
                  </div>
                  <div className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] mt-1 leading-none">
                    1,500+ Happy Cat Parents
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent, Bigger Marquee Ticker Band anchored at the bottom of the first section */}
      <TickerBand />
    </section>
  );
}
