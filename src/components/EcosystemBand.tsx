"use client";

import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

const IOS_EASE = [0.16, 1, 0.3, 1] as const;

interface MaterialItem {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
}

// Row 1: Electronics & Sensors
const ROW_ONE_MATERIALS: MaterialItem[] = [
  {
    id: "esp32",
    name: "ESP32",
    subtitle: "Espressif ESP32 DevKit",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
      </svg>
    ),
  },
  {
    id: "hx711",
    name: "HX711",
    subtitle: "24-bit Load Cell Amplifier",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M7 12h3l2-4 2 8 2-4h1" />
      </svg>
    ),
  },
  {
    id: "load-cell",
    name: "Load Cell",
    subtitle: "10 kg Aluminum Bar",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="10" rx="2" />
        <circle cx="6" cy="12" r="1.5" fill="#94A3B8" />
        <circle cx="18" cy="12" r="1.5" fill="#94A3B8" />
        <path d="M10 10v4M14 10v4" />
      </svg>
    ),
  },
  {
    id: "xy-mos",
    name: "XY-MOS",
    subtitle: "Dual MOSFET Switch Module",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    id: "moisture-sensor",
    name: "Moisture Sensor",
    subtitle: "LM393 Comparator Board",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.5c0 0-6 7.5-6 11.5a6 6 0 0 0 12 0c0-4-6-11.5-6-11.5z" />
        <path d="M10 13v4M14 13v4" />
      </svg>
    ),
  },
  {
    id: "capacitor",
    name: "Capacitor",
    subtitle: "470-1000 µF Electrolytic",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h7M15 12h7" />
        <path d="M9 5v14M15 5v14" />
        <path d="M5 8h2M6 7v2" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "diode",
    name: "Diode",
    subtitle: "1N4007 Flyback Diode",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h6M16 12h6" />
        <path d="M8 6l8 6-8 6V6z" fill="#F43F5E" fillOpacity="0.2" />
        <path d="M16 6v12" />
      </svg>
    ),
  },
];

// Row 2: Actuation, Power & Structure
const ROW_TWO_MATERIALS: MaterialItem[] = [
  {
    id: "water-pump",
    name: "Water Pump",
    subtitle: "3-5V Submersible Micro Pump",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="8" width="14" height="12" rx="3" />
        <path d="M12 3v5M9 3h6" />
        <circle cx="12" cy="14" r="2.5" />
      </svg>
    ),
  },
  {
    id: "servo-motor",
    name: "Servo Motor",
    subtitle: "SG90 Micro Servo",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="6" width="16" height="12" rx="2" />
        <circle cx="15" cy="12" r="3" />
        <path d="M2 9v6M22 9v6" />
      </svg>
    ),
  },
  {
    id: "5v-supply",
    name: "5V Supply",
    subtitle: "Phone Charger / Power Bank",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#84CC16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="16" height="12" rx="2" />
        <path d="M19 10h2v4h-2" />
        <path d="M8 12h4M10 10v4" />
      </svg>
    ),
  },
  {
    id: "breadboard",
    name: "Breadboard",
    subtitle: "Solderless, 830-Point",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <circle cx="6" cy="8" r="0.8" fill="#CBD5E1" />
        <circle cx="10" cy="8" r="0.8" fill="#CBD5E1" />
        <circle cx="14" cy="8" r="0.8" fill="#CBD5E1" />
        <circle cx="18" cy="8" r="0.8" fill="#CBD5E1" />
        <circle cx="6" cy="16" r="0.8" fill="#CBD5E1" />
        <circle cx="10" cy="16" r="0.8" fill="#CBD5E1" />
        <circle cx="14" cy="16" r="0.8" fill="#CBD5E1" />
        <circle cx="18" cy="16" r="0.8" fill="#CBD5E1" />
        <line x1="2" y1="12" x2="22" y2="12" strokeDasharray="2 2" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: "jumper-wires",
    name: "Jumper Wires",
    subtitle: "Male and Female Dupont",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 18c3-8 5-12 8-12s5 4 8 12" />
        <circle cx="4" cy="18" r="1.5" fill="#EAB308" />
        <circle cx="20" cy="18" r="1.5" fill="#EAB308" />
      </svg>
    ),
  },
  {
    id: "usb-cable",
    name: "USB Cable",
    subtitle: "Data-Capable USB Cable",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="19" r="2" />
        <path d="M12 17V7M9 7h6M9 3h6v4H9z" />
        <path d="M6 10l6-3 6 3" />
      </svg>
    ),
  },
  {
    id: "frame",
    name: "Frame",
    subtitle: "Cardboard, Bottles and Tubing",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
      </svg>
    ),
  },
];

export default function EcosystemBand() {
  const { openAuthModal } = useAuth();

  // 4x repetition for silky-smooth infinite looping on both rows
  const marqueeRowOne = [
    ...ROW_ONE_MATERIALS,
    ...ROW_ONE_MATERIALS,
    ...ROW_ONE_MATERIALS,
    ...ROW_ONE_MATERIALS,
  ];

  const marqueeRowTwo = [
    ...ROW_TWO_MATERIALS,
    ...ROW_TWO_MATERIALS,
    ...ROW_TWO_MATERIALS,
    ...ROW_TWO_MATERIALS,
  ];

  return (
    <section
      id="ecosystem"
      className="relative pt-16 sm:pt-20 pb-20 sm:pb-28 px-6 sm:px-12 lg:px-16 bg-[#161618] text-white overflow-hidden select-none"
    >
      <div id="materials" className="absolute -top-24" />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.85, ease: IOS_EASE }}
        className="max-w-7xl mx-auto"
      >
        {/* Large "Our Materials" Title on Left */}
        <h2 className="text-[clamp(2.8rem,5.5vw,4.5rem)] font-extrabold tracking-[-0.035em] text-white leading-none mb-6">
          Our Materials
        </h2>

        {/* Full-Width Hairline Divider Beneath Headline */}
        <div className="w-full h-[1px] bg-white/15 mb-10 sm:mb-12" />

        {/* Right-Offset Column (Starts ~1/3 across) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 mb-14 sm:mb-16">
          <div className="lg:col-span-4" />
          <div className="lg:col-span-8 max-w-xl">
            <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#9CA3AF] mb-5 font-normal">
              PawStation is built from low-cost, easy-to-find parts. An ESP32 reads the scale and the water sensor, turns the feeder, runs the pump, and reports everything to this website over Wi-Fi. No special equipment needed, just a handful of modules and a bit of wiring.
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
          TWO-ROW INFINITE HORIZONTAL MARQUEE OF OUTLINED CARDS (100VW)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden flex flex-col gap-4 sm:gap-5">
        {/* Soft edge fade masks for seamless entry/exit */}
        <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-[#161618] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-[#161618] to-transparent z-10 pointer-events-none" />

        {/* Row 1: Sensors & Core Electronics (Drifting Left) */}
        <div className="flex w-max gap-5 sm:gap-6 animate-ticker hover:[animation-play-state:paused] motion-reduce:animate-none">
          {marqueeRowOne.map((item, idx) => (
            <motion.div
              key={`row1-${item.id}-${idx}`}
              whileHover={{ scale: 1.03, y: -2 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="w-[240px] sm:w-[280px] h-[130px] sm:h-[140px] rounded-[24px] bg-[#18181B] border border-white/10 hover:border-white/30 transition-all flex flex-col justify-center items-center px-6 shadow-sm shrink-0 select-none cursor-pointer"
            >
              <div className="opacity-95 hover:opacity-100 transition-opacity flex items-center gap-3">
                {item.icon}
                <span className="text-[20px] sm:text-[22px] font-bold tracking-tight font-sans text-white">
                  {item.name}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#6B7280] mt-2 text-center">
                {item.subtitle}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Row 2: Actuation, Power & Structure (Drifting Right) */}
        <div className="flex w-max gap-5 sm:gap-6 animate-ticker-reverse hover:[animation-play-state:paused] motion-reduce:animate-none">
          {marqueeRowTwo.map((item, idx) => (
            <motion.div
              key={`row2-${item.id}-${idx}`}
              whileHover={{ scale: 1.03, y: -2 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="w-[240px] sm:w-[280px] h-[130px] sm:h-[140px] rounded-[24px] bg-[#18181B] border border-white/10 hover:border-white/30 transition-all flex flex-col justify-center items-center px-6 shadow-sm shrink-0 select-none cursor-pointer"
            >
              <div className="opacity-95 hover:opacity-100 transition-opacity flex items-center gap-3">
                {item.icon}
                <span className="text-[20px] sm:text-[22px] font-bold tracking-tight font-sans text-white">
                  {item.name}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#6B7280] mt-2 text-center">
                {item.subtitle}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
