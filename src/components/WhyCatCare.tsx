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
    color: "text-accent-amber",
    bg: "bg-accent-amber/10 dark:bg-accent-amber/15",
  },
  {
    icon: CalmIcon,
    title: "Reduce Feeding Stress",
    subtitle: "Silent Auto-Detach",
    description:
      "Silent servo motion eliminates sudden mechanical noises that trigger cat anxiety. The MCU cuts PWM hold-duty immediately after dispensing, preventing buzzing and motor heat.",
    color: "text-accent-azure",
    bg: "bg-accent-azure/10 dark:bg-accent-azure/15",
  },
  {
    icon: ScaleIcon,
    title: "Track Visit Behavior",
    subtitle: "24-Bit HX711 Load Cell",
    description:
      "Gram-accurate intake measurement and real-time cat visit detection. Historical frequency and consumption records stream continuously to your private Supabase database.",
    color: "text-accent-forest",
    bg: "bg-accent-forest/10 dark:bg-accent-forest/15",
  },
  {
    icon: WaterDropIcon,
    title: "Fresh Water Flow",
    subtitle: "PWM Soft-Stop Pump",
    description:
      "Peristaltic pump delivers fresh hydration on demand. An XY-MOS switch ramps motor voltage down smoothly over 600ms, eliminating splashing and voltage spikes.",
    color: "text-accent-azure",
    bg: "bg-accent-azure/10 dark:bg-accent-azure/15",
  },
];

export default function WhyCatCare() {
  return (
    <section
      id="why-cat-care"
      className="py-24 md:py-32 bg-white dark:bg-[#121214] transition-colors duration-200"
    >
      <div className="section-container max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20 max-w-2xl mx-auto">
          <span className="inline-block text-[12px] font-semibold tracking-[0.05em] uppercase text-accent-amber mb-3">
            Hardware Architecture
          </span>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-[#18181B] dark:text-[#F4F4F5] leading-tight">
            Built Different, For Cats
          </h2>
          <p className="text-[16px] md:text-[18px] text-[#71717A] dark:text-[#A1A1AA] mt-4 leading-relaxed">
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
              className="apple-card p-6 lg:p-7 flex flex-col justify-between hover:shadow-md dark:hover:border-white/[0.14] transition-all"
            >
              <div>
                {/* Icon Container */}
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${card.bg}`}
                >
                  <card.icon className={`w-10 h-10 ${card.color}`} />
                </div>

                {/* Subtitle pill */}
                <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-accent-amber mb-2">
                  {card.subtitle}
                </div>

                {/* Card Title */}
                <h3 className="text-xl lg:text-2xl font-bold tracking-tight text-[#18181B] dark:text-[#F4F4F5] mb-3">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-[14px] leading-relaxed text-[#71717A] dark:text-[#A1A1AA]">
                  {card.description}
                </p>
              </div>

              {/* Bottom spec tag */}
              <div className="pt-5 mt-6 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between text-[11px] text-[#71717A] dark:text-[#A1A1AA] font-mono">
                <span>Spec #{i + 1}</span>
                <span className="text-accent-forest font-sans font-medium">
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
