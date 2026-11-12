"use client";

import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

const IOS_EASE = [0.16, 1, 0.3, 1] as const;

interface Partner {
  id: string;
  name: string;
  company: string;
  logo: React.ReactNode;
}

const PARTNERS: Partner[] = [
  {
    id: "espressif",
    name: "espressif",
    company: "Espressif Systems",
    logo: (
      <div className="flex items-center gap-3">
        <svg className="w-7 h-7 text-white fill-current" viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[22px] font-bold tracking-tight font-sans text-white">espressif</span>
      </div>
    ),
  },
  {
    id: "supabase",
    name: "supabase",
    company: "Supabase Postgres",
    logo: (
      <div className="flex items-center gap-3">
        <svg className="w-7 h-7 text-[#3ECF8E] fill-current" viewBox="0 0 24 24">
          <path d="M21.362 9.354H12V.304a.304.304 0 0 0-.52-.214L.087 11.485a.305.305 0 0 0 .215.52H12v9.05a.304.304 0 0 0 .52.215l11.394-11.394a.305.305 0 0 0-.215-.521z" />
        </svg>
        <span className="text-[22px] font-bold tracking-tight font-sans text-white">supabase</span>
      </div>
    ),
  },
  {
    id: "hivemq",
    name: "HiveMQ",
    company: "HiveMQ MQTT Cloud",
    logo: (
      <div className="flex items-center gap-3">
        <svg className="w-7 h-7 text-[#FFC000] fill-current" viewBox="0 0 24 24">
          <path d="M12 2l8.5 5v10L12 22l-8.5-5V7L12 2zm0 3.5L5.5 9v6l6.5 3.5 6.5-3.5V9L12 5.5z" />
        </svg>
        <span className="text-[22px] font-bold tracking-tight font-sans text-white">HiveMQ</span>
      </div>
    ),
  },
  {
    id: "hx711",
    name: "HX711",
    company: "Avia Semiconductor",
    logo: (
      <div className="flex items-center gap-3">
        <svg className="w-7 h-7 text-[#60A5FA] fill-current" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M7 12h10M12 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="text-[22px] font-bold tracking-tight font-sans text-white">HX711 ADC</span>
      </div>
    ),
  },
  {
    id: "freertos",
    name: "FreeRTOS",
    company: "Amazon FreeRTOS",
    logo: (
      <div className="flex items-center gap-3">
        <svg className="w-7 h-7 text-[#34D399] fill-current" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[22px] font-bold tracking-tight font-sans text-white">FreeRTOS</span>
      </div>
    ),
  },
];

export default function EcosystemBand() {
  const { openAuthModal } = useAuth();
  // Duplicate array for seamless infinite marquee loop
  const marqueeItems = [...PARTNERS, ...PARTNERS, ...PARTNERS];

  return (
    <section
      id="ecosystem"
      className="relative pt-16 sm:pt-20 pb-20 sm:pb-28 px-6 sm:px-12 lg:px-16 bg-[#161618] text-white overflow-hidden select-none"
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.85, ease: IOS_EASE }}
        className="max-w-7xl mx-auto"
      >
        {/* Large "Our Partners" Title on Left (Exact Fynsec Reference) */}
        <h2 className="text-[clamp(2.8rem,5.5vw,4.5rem)] font-extrabold tracking-[-0.035em] text-white leading-none mb-6">
          Our Partners
        </h2>

        {/* Full-Width Hairline Divider Beneath Headline */}
        <div className="w-full h-[1px] bg-white/15 mb-10 sm:mb-12" />

        {/* Right-Offset Column (Starts ~1/3 across) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 mb-14 sm:mb-16">
          <div className="lg:col-span-4" />
          <div className="lg:col-span-8 max-w-xl">
            <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#9CA3AF] mb-5 font-normal">
              Our goal from day one has been to help divide the needles from the haystack, focusing on what matters, while ignoring the rest. Effective feline nutrition is about getting the biological basics right. PawStation helps you do that, saving time on the easy stuff, so you can focus on loving your cat.
            </p>

            <button
              type="button"
              onClick={() => openAuthModal("signup")}
              className="group inline-flex items-center gap-2.5 text-[14px] font-semibold text-white hover:opacity-85 transition-opacity"
            >
              <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-bold transition-transform duration-200 group-hover:scale-110">
                ›
              </span>
              <span>Get Started</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────
          INFINITE HORIZONTAL MARQUEE OF OUTLINED CARDS (100VW)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden group">
        {/* Soft edge fade masks for seamless entry/exit */}
        <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-[#161618] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-[#161618] to-transparent z-10 pointer-events-none" />

        <div className="flex w-max gap-5 sm:gap-6 animate-ticker group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          {marqueeItems.map((partner, idx) => (
            <motion.div
              key={`${partner.id}-${idx}`}
              whileHover={{ scale: 1.03, y: -2 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="w-[240px] sm:w-[280px] h-[130px] sm:h-[140px] rounded-[24px] bg-[#18181B] border border-white/10 hover:border-white/30 transition-all flex flex-col justify-center items-center px-6 shadow-sm shrink-0 select-none cursor-pointer"
            >
              <div className="opacity-90 hover:opacity-100 transition-opacity">
                {partner.logo}
              </div>
              <span className="text-[11px] font-mono text-[#6B7280] mt-2">
                {partner.company}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
