"use client";

import { PawIcon } from "./Icons";

const items = [
  "Precision Load Cell",
  "Automated Kibble Dispensing",
  "Silent Water Pump",
  "Isolated 5V Rail",
  "ESP32 Microcontroller",
  "HiveMQ Cloud TLS",
];

export default function TickerBand() {
  const repeated = [...items, ...items, ...items, ...items];

  return (
    <div className="w-full relative bg-[#0B111B] py-4 md:py-5 lg:py-5 overflow-hidden select-none border-t border-[#D8E4F2] dark:border-white/[0.08] transition-colors duration-200 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.2)]">
      <div className="flex animate-ticker whitespace-nowrap items-center">
        {repeated.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3.5 md:gap-5 mx-4 md:mx-7 text-white text-base md:text-lg lg:text-xl font-semibold tracking-wide shrink-0 font-sans"
          >
            <span>{item}</span>
            <PawIcon className="w-5 h-5 md:w-6 md:h-6 text-periwinkle opacity-90 shrink-0" />
          </span>
        ))}
      </div>
    </div>
  );
}
