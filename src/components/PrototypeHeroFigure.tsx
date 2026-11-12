"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ScaleIcon, WaterDropIcon, KibbleIcon, SignalIcon, CheckIcon } from "./Icons";

interface Hotspot {
  id: string;
  x: string;
  y: string;
  title: string;
  subtitle: string;
  icon: typeof ScaleIcon;
}

const hotspots: Hotspot[] = [
  {
    id: "scale",
    x: "34%",
    y: "74%",
    title: "Birch Scale Platform",
    subtitle: "HX711 24-bit strain gauge with floating suspended weighing plate",
    icon: ScaleIcon,
  },
  {
    id: "feeder",
    x: "58%",
    y: "48%",
    title: "Kibble Chute & Servo Gate",
    subtitle: "SG90 servo disengages PWM hold duty after dispensing 35g",
    icon: KibbleIcon,
  },
  {
    id: "water",
    x: "75%",
    y: "64%",
    title: "Slender Water Alcove",
    subtitle: "PWM soft-stop pump ramps motor down over 600ms to eliminate splash",
    icon: WaterDropIcon,
  },
  {
    id: "power",
    x: "91%",
    y: "86%",
    title: "Isolated 5V Power Bank",
    subtitle: "Dual-rail power design prevents ESP32 resets during motor draw",
    icon: SignalIcon,
  },
];

export default function PrototypeHeroFigure() {
  const [activeTab, setActiveTab] = useState<"photo" | "schematic">("photo");
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  return (
    <div className="relative w-full max-w-[580px] lg:max-w-[620px] mx-auto select-none py-2">
      {/* Ambient background soft blue glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(74,114,184,0.18)_0%,transparent_70%)] blur-[60px] pointer-events-none" />

      {/* Top Interactive Mode Switcher Pill */}
      <div className="flex items-center justify-between gap-3 mb-3 relative z-20 px-1">
        {/* View Mode Toggle */}
        <div className="inline-flex items-center p-1 rounded-full bg-white/90 dark:bg-navy-card/90 backdrop-blur-md border border-[#D8E4F2] dark:border-white/[0.1] shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("photo")}
            className={`px-3.5 py-1 rounded-full text-[12px] font-semibold tracking-tight transition-all ${
              activeTab === "photo"
                ? "bg-periwinkle text-white shadow-[0_2px_8px_rgba(74,114,184,0.3)]"
                : "text-navy-muted dark:text-navy-lightMuted hover:text-navy dark:hover:text-white"
            }`}
          >
            Physical Prototype
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("schematic")}
            className={`px-3.5 py-1 rounded-full text-[12px] font-semibold tracking-tight transition-all ${
              activeTab === "schematic"
                ? "bg-periwinkle text-white shadow-[0_2px_8px_rgba(74,114,184,0.3)]"
                : "text-navy-muted dark:text-navy-lightMuted hover:text-navy dark:hover:text-white"
            }`}
          >
            3D Schematic
          </button>
        </div>

        {/* Prototype Hardware Badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-navy-card/90 backdrop-blur-md border border-[#D8E4F2] dark:border-white/[0.1] text-[11px] font-mono text-navy dark:text-white shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          <span>Hardware v1.2 Bench Prototype</span>
        </div>
      </div>

      {/* Main Display Container */}
      <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-navy-card border border-[#D8E4F2] dark:border-white/[0.1] shadow-[0_12px_36px_rgba(28,41,66,0.12)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
        <AnimatePresence mode="wait">
          {activeTab === "photo" ? (
            /* TAB 1: Real Photo of Physical Prototype with Interactive Hotspots */
            <motion.div
              key="photo-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative w-full aspect-[1645/1284] bg-white dark:bg-[#101726]"
            >
              <Image
                src="/prototype.png"
                alt="PawStation physical hardware prototype with grey cat and birch plywood scale"
                width={1645}
                height={1284}
                priority
                className="w-full h-full object-cover select-none pointer-events-none"
              />

              {/* Interactive Hotspot Markers */}
              {hotspots.map((spot) => {
                const isSelected = activeHotspot === spot.id;
                const IconComponent = spot.icon;

                return (
                  <div
                    key={spot.id}
                    className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: spot.x, top: spot.y }}
                  >
                    {/* Pulsing Target Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setActiveHotspot(isSelected ? null : spot.id)
                      }
                      onMouseEnter={() => setActiveHotspot(spot.id)}
                      className="group relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center focus:outline-none"
                      aria-label={spot.title}
                    >
                      <span className="absolute inset-0 rounded-full bg-sky-500/30 animate-ping" />
                      <span className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-periwinkle border-2 border-white shadow-md flex items-center justify-center text-white transition-transform group-hover:scale-110">
                        <IconComponent className="w-3.5 h-3.5" />
                      </span>
                    </button>

                    {/* Popover Card */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.18 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 sm:w-64 bg-white/95 dark:bg-navy-dark/95 backdrop-blur-md rounded-xl p-3 border border-[#D8E4F2] dark:border-white/[0.12] shadow-xl z-40 text-left pointer-events-none"
                        >
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-periwinkle mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                            <span>{spot.title}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-navy dark:text-[#E2E8F0]">
                            {spot.subtitle}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* Bottom Quick Hint Bar */}
              <div className="absolute bottom-2 left-3 right-3 z-20 flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px]">
                <span className="font-medium text-white/90">
                  Tap pulsing pins to inspect hardware anatomy
                </span>
                <span className="font-mono text-sky-400 font-semibold">
                  Scale &middot; Feeder &middot; Water &middot; ESP32
                </span>
              </div>
            </motion.div>
          ) : (
            /* TAB 2: Bespoke 3D Schematic Vector Directly Matching the Physical Prototype */
            <motion.div
              key="schematic-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative w-full aspect-[1645/1284] bg-[#F8FAFC] dark:bg-[#0B111B] flex items-center justify-center p-2"
            >
              <svg
                viewBox="0 0 800 620"
                className="w-full h-full drop-shadow-md select-none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Natural Birch Wood Gradient */}
                  <linearGradient id="birchWood" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#EDE2D1" />
                    <stop offset="50%" stopColor="#E2D4BE" />
                    <stop offset="100%" stopColor="#D5C4A9" />
                  </linearGradient>
                  {/* Birch Ply Layered Edge */}
                  <linearGradient id="plywoodEdge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#CBB59B" />
                    <stop offset="50%" stopColor="#B89F82" />
                    <stop offset="100%" stopColor="#A98F72" />
                  </linearGradient>
                  {/* Grey Domestic Cat Shading */}
                  <linearGradient id="catGrey" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7B8B9E" />
                    <stop offset="50%" stopColor="#5E6F83" />
                    <stop offset="100%" stopColor="#475569" />
                  </linearGradient>
                  {/* White Cabinet Panel Gradient */}
                  <linearGradient id="cabinetWhite" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#EEF2F6" />
                  </linearGradient>
                </defs>

                {/* Ground Shadow */}
                <ellipse cx="430" cy="530" rx="330" ry="45" fill="rgba(28,41,66,0.12)" className="dark:fill-black/50" />

                {/* 1. BIRCH PLYWOOD SCALE PLATFORM (Double-Deck) */}
                <g id="birch-scale-structure">
                  {/* Base Floor Plate (Lying flat on table with inner cutout) */}
                  <polygon points="80,510 490,430 540,460 130,545" fill="#D8C7AF" stroke="#B89F82" strokeWidth="1.5" />
                  <polygon points="130,545 540,460 540,470 130,555" fill="url(#plywoodEdge)" />
                  <polygon points="80,510 130,545 130,555 80,520" fill="url(#plywoodEdge)" />

                  {/* Inner Cutout on Base Plate */}
                  <polygon points="140,515 450,455 470,470 160,530" fill="#EAEFF5" className="dark:fill-[#080D15]" />

                  {/* Floating Suspended Top Weighing Plate (Elevated) */}
                  <polygon points="120,460 480,390 520,420 160,495" fill="url(#birchWood)" stroke="#CBB59B" strokeWidth="1.2" />
                  {/* Front & Side Ply Edge */}
                  <polygon points="160,495 520,420 520,432 160,507" fill="url(#plywoodEdge)" />
                  <polygon points="120,460 160,495 160,507 120,472" fill="url(#plywoodEdge)" />

                  {/* Prominent Large Black Paw Print in center of scale platform */}
                  <g transform="translate(300, 440) rotate(-10) scale(0.85)">
                    {/* Main Metacarpal Pad */}
                    <path
                      d="M 22 28 C 10 28, 4 20, 8 10 C 12 2, 22 0, 32 0 C 42 0, 52 2, 56 10 C 60 20, 54 28, 42 28 Z"
                      fill="#1E293B"
                    />
                    {/* 4 Toe Pads */}
                    <ellipse cx="6" cy="-6" rx="6" ry="8" fill="#1E293B" transform="rotate(-20 6 -6)" />
                    <ellipse cx="23" cy="-14" rx="6" ry="9" fill="#1E293B" transform="rotate(-6 23 -14)" />
                    <ellipse cx="41" cy="-14" rx="6" ry="9" fill="#1E293B" transform="rotate(6 41 -14)" />
                    <ellipse cx="58" cy="-6" rx="6" ry="8" fill="#1E293B" transform="rotate(20 58 -6)" />
                  </g>

                  {/* Raised Wooden Pedestal for Food Bowl */}
                  <polygon points="410,412 510,395 525,410 425,427" fill="url(#birchWood)" stroke="#CBB59B" strokeWidth="1" />
                  <polygon points="425,427 525,410 525,418 425,435" fill="url(#plywoodEdge)" />

                  {/* White Ceramic Food Bowl */}
                  <ellipse cx="468" cy="406" rx="34" ry="17" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                  <ellipse cx="468" cy="404" rx="28" ry="13" fill="#E2E8F0" />
                  {/* Kibble Pellets */}
                  <g fill="#A66F33">
                    <ellipse cx="460" cy="404" rx="5" ry="3" />
                    <ellipse cx="468" cy="405" rx="5" ry="3.2" fill="#C28847" />
                    <ellipse cx="476" cy="403" rx="4.8" ry="3" fill="#8C5824" />
                    <ellipse cx="465" cy="408" rx="5" ry="3" fill="#C28847" />
                    <ellipse cx="472" cy="407" rx="4.5" ry="2.8" />
                  </g>
                </g>

                {/* 2. THE GREY CAT STANDING ON PLATFORM EATING */}
                <g id="grey-cat-eating">
                  {/* Cat Body & Torso */}
                  <path
                    d="M 230 390 C 210 360, 240 310, 290 300 C 350 290, 400 320, 440 370 C 420 410, 370 430, 310 430 C 270 430, 240 415, 230 390 Z"
                    fill="url(#catGrey)"
                  />
                  {/* Cat Flank Highlight */}
                  <path
                    d="M 270 320 C 320 310, 370 330, 400 370 C 370 390, 320 385, 280 365 Z"
                    fill="#94A3B8"
                    opacity="0.3"
                  />

                  {/* Paws on wooden platform */}
                  {/* Hind Paws */}
                  <ellipse cx="280" cy="435" rx="14" ry="8" fill="#475569" />
                  <ellipse cx="310" cy="445" rx="14" ry="8" fill="#5E6F83" />
                  {/* Front Paws near pedestal */}
                  <ellipse cx="380" cy="440" rx="13" ry="7" fill="#475569" />
                  <ellipse cx="410" cy="435" rx="14" ry="8" fill="#5E6F83" />

                  {/* Cat Head Lowered Towards Bowl */}
                  <circle cx="445" cy="385" r="28" fill="#5E6F83" />
                  {/* Snout & Cheeks Eating */}
                  <ellipse cx="460" cy="395" rx="16" ry="12" fill="#475569" />

                  {/* Ears */}
                  <polygon points="430,365 425,335 448,355" fill="#475569" />
                  <polygon points="429,362 428,342 443,355" fill="#F4B8B8" opacity="0.6" />
                  <polygon points="450,360 460,332 468,358" fill="#475569" />
                  <polygon points="452,358 459,340 464,357" fill="#F4B8B8" opacity="0.6" />

                  {/* Curved Tail */}
                  <path
                    d="M 235 390 C 210 395, 185 385, 180 360 C 175 335, 195 320, 215 330"
                    stroke="#475569"
                    strokeWidth="12"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 235 390 C 210 395, 185 385, 180 360 C 175 335, 195 320, 215 330"
                    stroke="#5E6F83"
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="none"
                  />
                </g>

                {/* 3. WHITE DUAL-BAY CABINET ENCLOSURE */}
                <g id="dual-bay-cabinet">
                  {/* Main White Cabinet Body */}
                  <polygon points="470,120 710,165 710,480 470,420" fill="url(#cabinetWhite)" stroke="#CBD5E1" strokeWidth="1.5" />
                  {/* Right Flank */}
                  <polygon points="710,165 770,145 770,455 710,480" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5" />

                  {/* Birch Plywood Top Cover Lid with dual wooden knobs */}
                  <polygon points="455,115 695,160 765,140 525,98" fill="url(#birchWood)" stroke="#CBB59B" strokeWidth="1.5" />
                  <polygon points="455,115 695,160 695,170 455,125" fill="url(#plywoodEdge)" />
                  <polygon points="695,160 765,140 765,150 695,170" fill="url(#plywoodEdge)" />

                  {/* Wooden Turn-Knobs on Top Lids */}
                  <ellipse cx="535" cy="120" rx="9" ry="5" fill="#D5C4A9" stroke="#A98F72" strokeWidth="1" />
                  <ellipse cx="645" cy="140" rx="9" ry="5" fill="#D5C4A9" stroke="#A98F72" strokeWidth="1" />

                  {/* Left Compartment: Food Dispense Chute */}
                  <g id="left-feeder-bay">
                    {/* Division line between bays */}
                    <line x1="585" y1="142" x2="585" y2="350" stroke="#CBD5E1" strokeWidth="1.2" />

                    {/* Arched Chute Opening */}
                    <path
                      d="M 485 300 C 485 275, 525 275, 525 300 L 525 330 L 485 330 Z"
                      fill="#E2E8F0"
                    />
                    {/* Angled Cream Chute Funnel extending out */}
                    <polygon points="485,300 525,300 515,350 475,350" fill="#F3EDE2" stroke="#D5C4A9" strokeWidth="1.2" />
                    <polygon points="475,350 515,350 510,365 470,365" fill="#E5DC handle" fillOpacity="0.9" stroke="#CBB59B" strokeWidth="1" />

                    {/* Blue Status LED Indicator */}
                    <circle cx="568" cy="340" r="3" fill="#38BDF8" className="animate-pulse" />
                    <circle cx="568" cy="340" r="6" fill="#38BDF8" fillOpacity="0.3" />
                  </g>

                  {/* Right Compartment: Water Reservoir & Alcove */}
                  <g id="right-water-bay">
                    {/* Vertical Pill-shaped Slender Water Window */}
                    <rect x="635" y="195" width="14" height="110" rx="7" fill="#0B111B" stroke="#CBD5E1" strokeWidth="1" />
                    {/* Water Level inside Slender Window */}
                    <rect x="637" y="235" width="10" height="68" rx="5" fill="#38BDF8" fillOpacity="0.9" />

                    {/* Downward Curved Water Dispensing Spout */}
                    <path
                      d="M 642 330 C 642 355, 630 365, 625 375"
                      stroke="#F3EDE2"
                      strokeWidth="8"
                      strokeLinecap="round"
                      fill="none"
                    />

                    {/* Arched Water Alcove Cutout */}
                    <path
                      d="M 598 470 L 598 385 C 598 360, 685 360, 685 385 L 685 470 Z"
                      fill="#E2E8F0"
                      stroke="#CBD5E1"
                      strokeWidth="1"
                    />
                    {/* White Ceramic Water Bowl in Alcove */}
                    <ellipse cx="642" cy="445" rx="36" ry="18" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                    <ellipse cx="642" cy="443" rx="30" ry="14" fill="#38BDF8" fillOpacity="0.4" stroke="#38BDF8" strokeWidth="1" />
                  </g>

                  {/* 4. External Electronics Side Box */}
                  <g id="electronics-sidebox">
                    <polygon points="710,240 760,225 760,365 710,380" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
                    {/* Horizontal Ventilation Louvers */}
                    <line x1="722" y1="260" x2="748" y2="252" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="722" y1="272" x2="748" y2="264" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="722" y1="284" x2="748" y2="276" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="722" y1="296" x2="748" y2="288" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

                    {/* Black DC Power Cable */}
                    <path
                      d="M 740 375 C 740 430, 765 470, 750 510"
                      stroke="#0F172A"
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                    />

                    {/* External Black 5V Power Bank on Table */}
                    <polygon points="695,505 765,480 795,500 725,525" fill="#1E293B" stroke="#0F172A" strokeWidth="1.2" />
                    <polygon points="725,525 795,500 795,515 725,540" fill="#0F172A" />
                    <polygon points="695,505 725,525 725,540 695,520" fill="#0F172A" />
                    {/* USB Ports on Power Bank */}
                    <rect x="735" y="527" width="8" height="4" rx="1" fill="#38BDF8" />
                  </g>
                </g>
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Feature Bullet Strip Below Prototype */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-[#D8E4F2] dark:border-white/[0.08] text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-navy dark:text-white">
          <CheckIcon className="w-3.5 h-3.5 text-periwinkle shrink-0" />
          <span>Birch Ply Scale</span>
        </div>
        <div className="flex items-center gap-1.5 text-navy dark:text-white">
          <CheckIcon className="w-3.5 h-3.5 text-periwinkle shrink-0" />
          <span>35g Servo Chute</span>
        </div>
        <div className="flex items-center gap-1.5 text-navy dark:text-white">
          <CheckIcon className="w-3.5 h-3.5 text-periwinkle shrink-0" />
          <span>Soft-Stop Pump</span>
        </div>
        <div className="flex items-center gap-1.5 text-navy dark:text-white">
          <CheckIcon className="w-3.5 h-3.5 text-periwinkle shrink-0" />
          <span>Dual-Rail 5V Power</span>
        </div>
      </div>
    </div>
  );
}
