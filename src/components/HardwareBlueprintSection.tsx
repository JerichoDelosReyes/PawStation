"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const IOS_EASE = [0.16, 1, 0.3, 1] as const;

const ARCHITECTURE_MODULES = [
  {
    code: "/ 01",
    title: "Suspended Birch Sled",
    badge: "±0.1g HX711 ADC",
    metric: "24-Bit Precision",
    description:
      "A floating Baltic birch sled decoupled from the weighing platform. The 24-bit differential ADC isolates cat body mass from food intake, tracking daily consumption down to the single kibble.",
    spec: "GPIO 18 / 19 · 10 SPS",
  },
  {
    code: "/ 02",
    title: "Anti-Regurgitation Chute",
    badge: "35g SG90 Servo",
    metric: "0 mA Auto-Detach",
    description:
      "A 6-chamber radial gate sweeps through 20° to 160° to meter small, biological portions. The firmware detaches servo PWM duty immediately to eliminate motor buzzing and coil heat.",
    spec: "GPIO 21 · 5V Isolated Rail",
  },
  {
    code: "/ 03",
    title: "Whisper Hydration Flow",
    badge: "600ms Soft-Stop",
    metric: "< 16 dB Acoustic",
    description:
      "A peristaltic pump controlled by an XY-MOS dual MOSFET. A 600ms cosine duty decay eliminates sudden water splashing, back-EMF spikes, and whisker sensory fatigue.",
    spec: "GPIO 23 · 1N4007 Diode",
  },
  {
    code: "/ 04",
    title: "Dual-Rail Telemetry Hub",
    badge: "ESP32 & MQTTS",
    metric: "TLS 1.3 Port 8883",
    description:
      "Isolated 3.3V logic and 5.0V actuator rails prevent brownout restarts during pump and servo engagement. Non-blocking FreeRTOS tasks stream real-time events directly to Supabase.",
    spec: "Xtensa Dual-Core · 240MHz",
  },
];

export default function HardwareBlueprintSection() {
  const [activeIdx, setActiveIdx] = useState<number>(0);

  return (
    <section id="blueprint" className="py-24 sm:py-32 px-6 sm:px-10 lg:px-14 bg-[#111113] text-white border-t border-white/[0.08]">
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
              Engineered for
              <br />
              Feline Senses
            </h2>
          </div>

          <div className="lg:col-span-7 flex flex-col items-start lg:pl-6">
            <p className="text-[15px] sm:text-[16px] text-[#9CA3AF] leading-relaxed mb-4 max-w-xl">
              Four decoupled hardware subsystems engineered to work in harmony. Every mechanical tolerance, motor ramp, and sensor line is purpose-built to eliminate feline anxiety and ensure uninterrupted nutrition.
            </p>
            <a
              href="#faq"
              className="group inline-flex items-center gap-2 text-[13px] font-semibold text-white hover:opacity-75 transition-opacity"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span>Technical Architecture</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </a>
          </div>
        </motion.div>

        {/* 4 Minimalist Architecture Cards with Staggered Fluid Motion */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ARCHITECTURE_MODULES.map((item, idx) => {
            const isActive = activeIdx === idx;
            return (
              <motion.div
                key={item.code}
                initial={{ opacity: 0, y: 36, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.85,
                  delay: idx * 0.1,
                  ease: IOS_EASE,
                }}
                whileHover={{
                  scale: 1.025,
                  y: -3,
                  transition: { type: "spring", stiffness: 350, damping: 25 },
                }}
                whileTap={{
                  scale: 0.98,
                  transition: { type: "spring", stiffness: 500, damping: 30 },
                }}
                onClick={() => setActiveIdx(idx)}
                className={`group p-8 rounded-2xl border transition-colors duration-200 flex flex-col justify-between min-h-[320px] select-none cursor-pointer shadow-md will-change-transform ${
                  isActive
                    ? "bg-[#1A1A1E] border-white/40 shadow-xl"
                    : "bg-[#161619] border-white/10 hover:border-white/25 hover:bg-[#18181C]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[12px] font-mono text-[#6B7280] group-hover:text-white transition-colors">
                      {item.code}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] text-[#9CA3AF]">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-[19px] sm:text-[20px] font-bold text-white tracking-tight leading-snug mb-3">
                    {item.title}
                  </h3>

                  <p className="text-[13px] text-[#9CA3AF] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#6B7280] group-hover:text-white transition-colors">
                  <span>{item.spec}</span>
                  <span className="font-semibold text-white">{item.metric}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
