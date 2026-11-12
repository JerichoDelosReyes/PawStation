"use client";

import { motion } from "framer-motion";
import { KibbleIcon, CalmIcon, ScaleIcon, WaterDropIcon } from "./Icons";

const cards = [
  {
    icon: KibbleIcon,
    title: "Cats Aren't Dogs",
    subtitle: "Controlled Portions",
    description:
      "Small, controlled dry kibble portions dispensed by an SG90 servo-driven gate. Each rotation delivers exactly 35 grams, matching natural feline grazing habits rather than bulk feeding.",
  },
  {
    icon: CalmIcon,
    title: "Reduce Feeding Stress",
    subtitle: "Silent Auto-Detach",
    description:
      "Silent servo motion eliminates sudden mechanical noises that trigger cat anxiety. The MCU cuts PWM hold-duty immediately after dispensing, preventing buzzing and motor heat.",
  },
  {
    icon: ScaleIcon,
    title: "Track Visit Behavior",
    subtitle: "24-Bit HX711 Load Cell",
    description:
      "Gram-accurate intake measurement and real-time cat visit detection. Historical frequency and consumption records stream continuously to your private Supabase database.",
  },
  {
    icon: WaterDropIcon,
    title: "Fresh Water Flow",
    subtitle: "PWM Soft-Stop Pump",
    description:
      "Peristaltic pump delivers fresh hydration on demand. An XY-MOS switch ramps motor voltage down smoothly over 600ms, eliminating splashing and voltage spikes.",
  },
];

export default function WhyCatCare() {
  return (
    <section
      id="why-cat-care"
      className="py-24 md:py-32 bg-[#0B0F0B] border-t border-white/[0.04] transition-colors duration-200"
    >
      <div className="section-container max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20 max-w-2xl mx-auto">
          <span className="inline-block text-[12px] font-semibold tracking-[0.05em] uppercase text-[#D4F66C] mb-3">
            Hardware Architecture
          </span>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-white leading-tight">
            Built Different, For Cats
          </h2>
          <p className="text-[16px] md:text-[18px] text-[#8FA391] mt-4 leading-relaxed">
            Every circuit, motor ramp, and food pathway is purpose-built to
            respect feline sensory sensitivity and daily nutritional rhythms.
          </p>
        </div>

        {/* 1x4 Card Grid on Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: "easeOut" }}
              className="apple-card p-6 lg:p-7 flex flex-col justify-between bg-[#131A14] border border-white/[0.08] hover:border-[#D4F66C]/40 hover:shadow-[0_0_24px_rgba(212,246,108,0.08)] transition-all"
            >
              <div>
                {/* Icon Container */}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-[#162017] border border-white/[0.06] text-[#D4F66C]">
                  <card.icon className="w-9 h-9 text-[#D4F66C]" />
                </div>

                {/* Subtitle pill */}
                <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#D4F66C] mb-2">
                  {card.subtitle}
                </div>

                {/* Card Title */}
                <h3 className="text-xl lg:text-2xl font-bold tracking-tight text-white mb-3">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-[14px] leading-relaxed text-[#8FA391]">
                  {card.description}
                </p>
              </div>

              {/* Bottom spec tag */}
              <div className="pt-5 mt-6 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#8FA391] font-mono">
                <span>Spec #{i + 1}</span>
                <span className="text-[#D4F66C] font-sans font-medium">
                  Feline Safe
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
