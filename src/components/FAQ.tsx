"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDownIcon,
  ShieldIcon,
  ScaleIcon,
  KibbleIcon,
  WaterDropIcon,
  SignalIcon,
} from "./Icons";

interface FAQItem {
  id: string;
  category: "Mechanics" | "Safety" | "Reliability" | "Calibration" | "Materials" | "Electrical";
  icon: typeof ShieldIcon;
  q: string;
  a: string;
  tag: string;
  highlight: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "servo",
    category: "Mechanics",
    icon: KibbleIcon,
    tag: "SG90 Micro-Servo",
    highlight: "35g / dispense · Detached pin hold",
    q: "How does the servo dispense dry kibble?",
    a: "An SG90 micro servo rotates a feeder disc between two positions (20° and 160°). Each rotation drops approximately 35g of dry kibble through the gate. The servo is powered from an isolated external 5V supply and detaches after each dispense to prevent overheating and stalling at the end stops. A 470–1000 µF electrolytic capacitor smooths the supply voltage during rotation.",
  },
  {
    id: "pump",
    category: "Safety",
    icon: WaterDropIcon,
    tag: "PWM Soft-Stop",
    highlight: "600ms ramp-down · 1N4007 flyback",
    q: "What protects the pump from running away?",
    a: "The pump is limited to 3 seconds per command in firmware. After 3 seconds at full duty, the ESP32 ramps the PWM signal on the XY-MOS MOSFET switch down to zero over 600ms (soft-stop), which reduces voltage spikes. A 1N4007 flyback diode across the motor terminals absorbs any remaining back-EMF. The firmware ignores duplicate pump commands while a cycle is already running.",
  },
  {
    id: "network",
    category: "Reliability",
    icon: SignalIcon,
    tag: "MQTT Last-Will",
    highlight: "6s telemetry loss detection",
    q: "What happens if the station loses Wi-Fi or power?",
    a: "The MQTT broker holds a last-will message that immediately flags the station as offline. The web dashboard detects missing telemetry after approximately 6 seconds and displays a clear offline indicator. The ESP32 automatically retries Wi-Fi and broker connections using non-blocking timers, so the watchdog timer never triggers a reset. Food and water already dispensed remain available to the cat.",
  },
  {
    id: "scale",
    category: "Calibration",
    icon: ScaleIcon,
    tag: "HX711 24-Bit ADC",
    highlight: "±0.1g resolution · Software tare",
    q: "How do I calibrate the load cell scale?",
    a: "Set CALIBRATION_FACTOR to 1 in the firmware and upload. With the scale empty, let it tare automatically. Place an object of known weight (for example 500g). Read the displayed value from Serial Monitor. Divide that reading by the known weight in grams to get your factor. Upload the new factor and verify with a second known weight. Use the Zero Scale (tare) button in the dashboard after placing the empty bowl.",
  },
  {
    id: "materials",
    category: "Materials",
    icon: ShieldIcon,
    tag: "Food-Grade Standard",
    highlight: "BPA-free plastic · Non-toxic silicone",
    q: "Are the materials safe for contact with cat food and water?",
    a: "You are responsible for using food-grade plastics, non-toxic silicone tubing, and sanitary food storage containers for all parts that contact food or water. The electronics and breadboard must be kept away from water and out of reach of the cat. Route tubing so a leak cannot reach the wiring. The structural frame can be built from cardboard, plywood, or food-safe plastic.",
  },
  {
    id: "power",
    category: "Electrical",
    icon: SignalIcon,
    tag: "Dual-Rail Isolation",
    highlight: "2A isolated rail · Common ground",
    q: "Why does the hardware use a separate 5V power supply?",
    a: "The pump and servo draw far more current than the ESP32 can supply from its pins or from a weak USB port. Early testing showed the ESP32 resetting whenever the 5V parts activated, caused by power dips. The dual-rail design uses a separate 5V supply (phone charger, approximately 2A) for the servo and pump, with only the grounds shared between the two supplies. The ESP32 is never powered from both USB and VIN simultaneously.",
  },
];

const IOS_EASE = [0.16, 1, 0.3, 1] as const;

export default function FAQ() {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  const toggleOpen = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const allOpen = useMemo(() => {
    return FAQ_ITEMS.length > 0 && FAQ_ITEMS.every((item) => openIds[item.id]);
  }, [openIds]);

  const toggleAll = () => {
    if (allOpen) {
      setOpenIds({});
    } else {
      const next: Record<string, boolean> = {};
      FAQ_ITEMS.forEach((item) => {
        next[item.id] = true;
      });
      setOpenIds(next);
    }
  };

  return (
    <section
      id="faq"
      className="py-24 sm:py-32 px-6 sm:px-10 lg:px-14 bg-[#111113] text-white border-t border-white/[0.08]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header with iOS Curve Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.85, ease: IOS_EASE }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-14"
        >
          <div className="lg:col-span-5">
            <h2 className="text-[clamp(2.5rem,5vw,3.8rem)] font-extrabold tracking-[-0.03em] text-white leading-[1.08]">
              Frequently
              <br />
              Asked Questions
            </h2>
          </div>

          <div className="lg:col-span-7 flex flex-col items-start lg:pl-6">
            <p className="text-[15px] sm:text-[16px] text-[#9CA3AF] leading-relaxed mb-6 max-w-xl">
              Technical specifications on electrical isolation, kinematic kibble metering, fail-safe water shutoff, and load cell calibration.
            </p>

            {/* Expand / Collapse All Toggle Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={toggleAll}
              className="group px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#18181B] border border-white/10 hover:border-white/25 text-[13px] font-medium text-neutral-300 hover:text-white transition-colors inline-flex items-center gap-2.5 shadow-sm cursor-pointer select-none"
            >
              <svg
                className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-transform duration-200"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {allOpen ? (
                  <>
                    <polyline points="4 14 12 6 20 14" />
                    <line x1="12" y1="6" x2="12" y2="18" />
                  </>
                ) : (
                  <>
                    <polyline points="4 10 12 18 20 10" />
                    <line x1="12" y1="6" x2="12" y2="18" />
                  </>
                )}
              </svg>
              <span>{allOpen ? "Collapse All" : "Expand All"}</span>
              <span className="text-[11px] font-mono text-neutral-500">
                ({FAQ_ITEMS.length})
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* 
          Smooth 2-Column Responsive Grid:
          Each card expands with silky hardware spring height, avoiding grid row squishing.
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {FAQ_ITEMS.map((item, idx) => (
            <FAQCard
              key={item.id}
              item={item}
              isOpen={!!openIds[item.id]}
              onToggle={() => toggleOpen(item.id)}
              delay={idx * 0.04}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQCard({
  item,
  isOpen,
  onToggle,
  delay,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  delay: number;
}) {
  const IconComponent = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.5,
        delay,
        ease: IOS_EASE,
      }}
      className={`rounded-2xl bg-[#161619] border select-none overflow-hidden transition-colors duration-200 shadow-sm ${
        isOpen
          ? "border-white/25 shadow-lg shadow-black/40 bg-[#18181c]"
          : "border-white/10 hover:border-white/20"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-6 sm:p-7 flex items-start justify-between text-left gap-4 group cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div
            className={`mt-0.5 p-2 rounded-xl border transition-colors shrink-0 ${
              isOpen
                ? "bg-white text-black border-white"
                : "bg-white/[0.04] text-neutral-400 border-white/10 group-hover:text-white group-hover:border-white/20"
            }`}
          >
            <IconComponent className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] font-mono tracking-wide text-neutral-400 uppercase">
                {item.category}
              </span>
              <span className="text-white/20 text-[10px]">•</span>
              <span className="text-[11px] font-mono text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {item.tag}
              </span>
            </div>
            <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight leading-snug group-hover:text-white/90">
              {item.q}
            </h3>
          </div>
        </div>

        <span
          className={`p-2 rounded-full border transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 ${
            isOpen
              ? "rotate-180 bg-white text-black border-white"
              : "bg-white/[0.05] text-[#9CA3AF] border-white/10 group-hover:border-white/20 group-hover:text-white"
          }`}
        >
          <ChevronDownIcon className="w-3.5 h-3.5" />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: {
                  duration: 0.32,
                  ease: [0.16, 1, 0.3, 1],
                },
                opacity: {
                  duration: 0.2,
                  delay: 0.06,
                  ease: "easeOut",
                },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: {
                  duration: 0.25,
                  ease: [0.16, 1, 0.3, 1],
                },
                opacity: {
                  duration: 0.15,
                  ease: "easeIn",
                },
              },
            }}
            className="overflow-hidden"
          >
            <div className="px-6 sm:px-7 pb-6 sm:pb-7 pt-0">
              <div className="pt-4 border-t border-white/10">
                <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#9CA3AF] mb-4">
                  {item.a}
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-[11px] font-mono text-neutral-300 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{item.highlight}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
