"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KibbleIcon, WaterDropIcon, ScaleIcon, ShieldIcon } from "./Icons";

const IOS_EASE = [0.16, 1, 0.3, 1] as const;

interface HelpCard {
  number: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  icon: typeof KibbleIcon;
  render3D: React.ReactNode;
}

const CARDS: HelpCard[] = [
  {
    number: "/ 01",
    title: "Monitor intake across daily cycles",
    shortDesc: "Sub-gram intake measurement and meal frequency detection.",
    fullDesc:
      "Scan your cat's exact feeding frequency and consumption habits in real-time. Detect irregularities such as skipped meals, sudden overeating, or rapid weight fluctuations using 24-bit continuous load-cell metrics.",
    icon: KibbleIcon,
    render3D: (
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Minimalist 3D Chute & Kibble Visual */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2A2A30] to-[#141416] border border-white/15 flex items-center justify-center shadow-2xl transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">
          <KibbleIcon className="w-10 h-10 text-white" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-mono text-[10px] font-bold shadow-lg">
          35g
        </div>
      </div>
    ),
  },
  {
    number: "/ 02",
    title: "Effortless Portions & Whisper Flow",
    shortDesc: "Silent servo auto-detach and 600ms soft-stop pump.",
    fullDesc:
      "Eliminate mealtime anxiety and whisker fatigue. The SG90 servo cuts PWM hold-duty immediately to eliminate motor hum, while the 600ms cosine decay pump prevents water splashing and electric transients.",
    icon: WaterDropIcon,
    render3D: (
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Minimalist 3D Fluidics Visual */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2A2A30] to-[#141416] border border-white/15 flex items-center justify-center shadow-2xl transform rotate-3 group-hover:rotate-0 transition-transform duration-300">
          <WaterDropIcon className="w-10 h-10 text-white" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-mono text-[10px] font-bold shadow-lg">
          0dB
        </div>
      </div>
    ),
  },
  {
    number: "/ 03",
    title: "Continuous Biometric Health Tracking",
    shortDesc: "Hospital-grade weight tracking without intrusive wearables.",
    fullDesc:
      "Track baseline feline wellness non-invasively. The 10kg load cell measures entry mass and meal grams with ±0.1g resolution, streaming encrypted telemetry to your private cloud dashboard.",
    icon: ShieldIcon,
    render3D: (
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Minimalist 3D Biometric Scale Visual */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2A2A30] to-[#141416] border border-white/15 flex items-center justify-center shadow-2xl transform -rotate-3 group-hover:rotate-0 transition-transform duration-300">
          <ScaleIcon className="w-10 h-10 text-white" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-mono text-[10px] font-bold shadow-lg">
          24b
        </div>
      </div>
    ),
  },
];

export default function HowPawStationHelps() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const toggleCard = (idx: number) => {
    setExpandedIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="features" className="py-24 sm:py-32 px-6 sm:px-10 lg:px-14 bg-[#111113] text-white border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header with iOS Curve Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.85, ease: IOS_EASE }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16 sm:mb-20"
        >
          <div className="lg:col-span-5">
            <h2 className="text-[clamp(2.5rem,5vw,3.8rem)] font-extrabold tracking-[-0.03em] text-white leading-[1.08]">
              How Can
              <br />
              PawStation Help?
            </h2>
          </div>

          <div className="lg:col-span-7 flex flex-col items-start lg:pl-6">
            <p className="text-[15px] sm:text-[16px] text-[#9CA3AF] leading-relaxed mb-4 max-w-xl">
              With strong foundations in feline nutrition and open hardware, our automated workstation solves common challenges cat owners face—preventing obesity, reducing mealtime stress, and detecting health issues days in advance.
            </p>
            <a
              href="#faq"
              className="group inline-flex items-center gap-2 text-[13px] font-semibold text-white hover:opacity-75 transition-opacity"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span>FAQ</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </a>
          </div>
        </motion.div>

        {/* 3 Numbered Minimalist Feature Cards with Click / Touch Expansion */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CARDS.map((card, idx) => {
            const isExpanded = expandedIdx === idx;
            return (
              <motion.div
                key={card.number}
                layout
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                onClick={() => toggleCard(idx)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleCard(idx);
                  }
                }}
                initial={{ opacity: 0, y: 38, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.7,
                  delay: idx * 0.1,
                  ease: IOS_EASE,
                  layout: { duration: 0.35, ease: IOS_EASE },
                }}
                whileHover={{
                  y: -3,
                  transition: { type: "spring", stiffness: 400, damping: 25 },
                }}
                whileTap={{
                  scale: 0.985,
                  transition: { type: "spring", stiffness: 500, damping: 30 },
                }}
                className={`group relative p-7 sm:p-9 rounded-2xl transition-colors duration-300 flex flex-col justify-between h-full min-h-[420px] select-none cursor-pointer overflow-hidden border will-change-transform ${
                  isExpanded
                    ? "bg-[#1C1C22] border-white/35 shadow-[0_12px_36px_rgba(0,0,0,0.45)] ring-1 ring-white/10"
                    : "bg-[#161619] border-white/10 hover:border-white/25 hover:bg-[#19191D] shadow-lg"
                }`}
              >
                {/* Number tag at top */}
                <div
                  className={`text-[12px] font-mono transition-colors ${
                    isExpanded ? "text-white font-bold" : "text-[#6B7280] group-hover:text-neutral-300"
                  }`}
                >
                  {card.number}
                </div>

                {/* Center 3D Render */}
                <div className="flex-1 my-auto py-6 sm:py-8 flex items-center justify-center pointer-events-none">
                  {card.render3D}
                </div>

                {/* Bottom Content Area */}
                <div className="relative z-10 pt-2">
                  <h3 className="text-[20px] sm:text-[22px] font-bold text-white tracking-tight leading-snug mb-2.5 min-h-[54px] flex items-end">
                    {card.title}
                  </h3>

                  {/* Description changes smoothly on Click / Touch */}
                  <div className="overflow-hidden">
                    <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#9CA3AF] transition-colors duration-200">
                      {isExpanded ? card.fullDesc : card.shortDesc}
                    </p>

                    {isExpanded && (
                      <div className="pt-3">
                        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white">
                          <span>Learn more</span>
                          <span>→</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
