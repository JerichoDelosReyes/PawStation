"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon } from "./Icons";

const faqItems = [
  {
    q: "How does the servo dispense dry kibble?",
    a: "An SG90 micro servo rotates a feeder disc between two positions (20 and 160 degrees). Each rotation drops approximately 35g of dry kibble through the gate. The servo is powered from an isolated external 5V supply and detaches after each dispense to prevent overheating and stalling at the end stops. A 470-1000 uF electrolytic capacitor smooths the supply voltage during rotation.",
  },
  {
    q: "What protects the pump from running away?",
    a: "The pump is limited to 3 seconds per command in firmware. After 3 seconds at full duty, the ESP32 ramps the PWM signal on the XY-MOS MOSFET switch down to zero over 600ms (soft-stop), which reduces voltage spikes. A 1N4007 flyback diode across the motor terminals absorbs any remaining back-EMF. The firmware ignores duplicate pump commands while a cycle is already running.",
  },
  {
    q: "What happens if the station loses Wi-Fi or power?",
    a: "The MQTT broker holds a last-will message that immediately flags the station as offline. The web dashboard detects missing telemetry after approximately 6 seconds and displays a clear offline indicator. The ESP32 automatically retries Wi-Fi and broker connections using non-blocking timers, so the watchdog timer never triggers a reset. Food and water already dispensed remain available to the cat.",
  },
  {
    q: "How do I calibrate the load cell scale?",
    a: "Set CALIBRATION_FACTOR to 1 in the firmware and upload. With the scale empty, let it tare automatically. Place an object of known weight (for example 500g). Read the displayed value from Serial Monitor. Divide that reading by the known weight in grams to get your factor. Upload the new factor and verify with a second known weight. Use the Zero Scale (tare) button in the dashboard after placing the empty bowl.",
  },
  {
    q: "Are the materials safe for contact with cat food and water?",
    a: "You are responsible for using food-grade plastics, non-toxic silicone tubing, and sanitary food storage containers for all parts that contact food or water. The electronics and breadboard must be kept away from water and out of reach of the cat. Route tubing so a leak cannot reach the wiring. The structural frame can be built from cardboard, plywood, or food-safe plastic.",
  },
  {
    q: "Why does the hardware use a separate 5V power supply?",
    a: "The pump and servo draw far more current than the ESP32 can supply from its pins or from a weak USB port. Early testing showed the ESP32 resetting whenever the 5V parts activated, caused by power dips. The dual-rail design uses a separate 5V supply (phone charger, approximately 2A) for the servo and pump, with only the grounds shared between the two supplies. The ESP32 is never powered from both USB and VIN simultaneously.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="py-24 md:py-32 bg-[#0B0F0B] border-t border-white/[0.04] transition-colors duration-200"
    >
      <div className="section-container">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="inline-block text-[12px] font-semibold tracking-[0.05em] uppercase text-[#D4F66C] mb-3">
            Technical FAQ
          </span>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold tracking-tight text-white leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-[15px] md:text-[16px] text-[#8FA391] mt-3">
            Essential specifications on electrical isolation, servo mechanics, and MQTT cloud telemetry.
          </p>
        </div>

        <div className="max-w-3xl mx-auto divide-y divide-white/[0.08]">
          {faqItems.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className="py-0">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-start justify-between gap-4 py-5 text-left group"
                  aria-expanded={isOpen}
                >
                  <span className="text-[15px] font-medium text-white group-hover:text-[#D4F66C] transition-colors">
                    {item.q}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 mt-0.5 text-[#8FA391] group-hover:text-[#D4F66C] transition-colors"
                  >
                    <ChevronDownIcon className="w-4 h-4" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="text-[14px] leading-relaxed text-[#8FA391] pb-6">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
