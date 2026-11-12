"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CalloutAnnotation {
  id: string;
  code: string;
  title: string;
  spec: string;
  pinX: number; // Percent on SVG canvas
  pinY: number;
  labelX: number;
  labelY: number;
  side: "left" | "right";
  category: "Mechanical" | "Sensor" | "Electrical" | "Fluidics";
}

const CALLOUTS: CalloutAnnotation[] = [
  {
    id: "scale",
    code: "01",
    title: "Birch Scale Sled & HX711",
    spec: "Double-deck birch plywood sled with suspended weighing deck, central paw mark, and 24-bit differential ADC (±0.1g resolution).",
    pinX: 38,
    pinY: 76,
    labelX: 14,
    labelY: 82,
    side: "left",
    category: "Sensor",
  },
  {
    id: "feeder",
    code: "02",
    title: "Angled Food Chute & SG90",
    spec: "Food-grade delivery chute metered by a detached SG90 micro-servo (35g portions, 600ms rotation cycle with anti-jam cutoff).",
    pinX: 62,
    pinY: 53,
    labelX: 18,
    labelY: 42,
    side: "left",
    category: "Mechanical",
  },
  {
    id: "lids",
    code: "03",
    title: "Dual-Bay Birch Lids & Knobs",
    spec: "Twin 12mm birch plywood service lids with turned wooden grip handles for rapid top-loading of dry kibble and water reservoir.",
    pinX: 74,
    pinY: 20,
    labelX: 84,
    labelY: 15,
    side: "right",
    category: "Mechanical",
  },
  {
    id: "water_window",
    code: "04",
    title: "Optical Sight-Glass Window",
    spec: "Slender acrylic inspection slit displaying real-time water column height with graduation marks and downward stainless spout.",
    pinX: 81,
    pinY: 42,
    labelX: 86,
    labelY: 38,
    side: "right",
    category: "Fluidics",
  },
  {
    id: "alcove",
    code: "05",
    title: "Arched Water Dish Alcove",
    spec: "Recessed splash-containment chamber housing the white ceramic water dish directly beneath the PWM soft-stop pump outlet.",
    pinX: 80,
    pinY: 71,
    labelX: 86,
    labelY: 66,
    side: "right",
    category: "Fluidics",
  },
  {
    id: "controller",
    code: "06",
    title: "ESP32 Controller & Louvers",
    spec: "Side-mounted electronics enclosure with convective ventilation louvers, HiveMQ Cloud TLS 8884 radio, and isolated ground bus.",
    pinX: 92,
    pinY: 48,
    labelX: 86,
    labelY: 88,
    side: "right",
    category: "Electrical",
  },
  {
    id: "power",
    code: "07",
    title: "5V Isolated DC Power Bank",
    spec: "Dedicated high-current 5V lithium cell powering servo and pump independently to eliminate microcontroller brownouts.",
    pinX: 94,
    pinY: 86,
    labelX: 52,
    labelY: 94,
    side: "right",
    category: "Electrical",
  },
];

export default function Prototype3DSchematic() {
  const [activeCalloutId, setActiveCalloutId] = useState<string>("scale");
  const activeCallout = CALLOUTS.find((c) => c.id === activeCalloutId) || CALLOUTS[0];

  return (
    <div className="w-full max-w-[660px] mx-auto select-none">
      {/* Schematic CAD Viewport Card */}
      <div className="relative rounded-2xl bg-white dark:bg-[#0D1524] border border-[#CBD5E1] dark:border-white/[0.12] shadow-[0_12px_40px_rgba(28,41,66,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden transition-colors">
        
        {/* CAD Blueprint Top Navigation Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#F1F5F9] dark:bg-[#131D30] border-b border-[#CBD5E1] dark:border-white/[0.1] text-[11px] font-mono">
          <div className="flex items-center gap-2 text-navy dark:text-white">
            <span className="w-2 h-2 rounded-full bg-periwinkle animate-pulse" />
            <span className="font-semibold tracking-wider">SCHEMATIC · PROTO-01</span>
            <span className="text-[#94A3B8] dark:text-[#64748B]">|</span>
            <span className="text-navy-muted dark:text-navy-lightMuted hidden sm:inline">
              AXONOMETRIC 30 DEG
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-navy-muted dark:text-navy-lightMuted">
            <span className="px-2 py-0.5 rounded bg-white dark:bg-[#0B111B] border border-[#CBD5E1] dark:border-white/[0.08] text-[10px]">
              SCALE 1:5
            </span>
            <span className="px-2 py-0.5 rounded bg-periwinkle/10 text-periwinkle dark:text-sky-400 font-semibold text-[10px]">
              PROTOTYPE ANATOMY
            </span>
          </div>
        </div>

        {/* Interactive 3D SVG Canvas */}
        <div className="relative w-full aspect-[820/640] bg-gradient-to-b from-[#F8FAFC] to-[#EFF4FA] dark:from-[#0B111B] dark:to-[#0E1726] flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          
          {/* Subtle Isometric Grid Background */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 dark:opacity-15" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="isoGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 0 20 L 40 20 M 20 0 L 20 40" stroke="#4A72B8" strokeWidth="0.5" strokeDasharray="2 3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#isoGrid)" />
          </svg>

          {/* Master 3D Vector Schematic */}
          <svg
            viewBox="0 0 820 640"
            className="w-full h-full drop-shadow-xl"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Birch Plywood Top Grain Shading */}
              <linearGradient id="birchTop" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#EFE6D7" />
                <stop offset="60%" stopColor="#E5DAC5" />
                <stop offset="100%" stopColor="#D5C4A9" />
              </linearGradient>

              {/* Multi-ply Edge Lamination */}
              <linearGradient id="plyEdge" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C4B094" />
                <stop offset="25%" stopColor="#AF9777" />
                <stop offset="50%" stopColor="#C8B59A" />
                <stop offset="75%" stopColor="#9C8465" />
                <stop offset="100%" stopColor="#8C7456" />
              </linearGradient>

              {/* White Cabinet Shading */}
              <linearGradient id="cabBody" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#E6EDF5" />
              </linearGradient>

              {/* Grey Domestic Cat Shading */}
              <linearGradient id="catCoat" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7E8E9F" />
                <stop offset="50%" stopColor="#5E7084" />
                <stop offset="100%" stopColor="#455468" />
              </linearGradient>

              {/* Water Volume Shading */}
              <linearGradient id="waterFlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.8" />
              </linearGradient>

              {/* Highlighting Glow Filter */}
              <filter id="activeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38BDF8" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* Ambient Ground Shadow */}
            <ellipse cx="440" cy="550" rx="350" ry="48" fill="rgba(28,41,66,0.14)" className="dark:fill-black/60" />

            {/* Coordinate Dimension Axes (3D Schematic Annotation) */}
            <g id="dimension-guides" opacity="0.4" stroke="#4A72B8" strokeWidth="1" strokeDasharray="3 3">
              <line x1="70" y1="530" x2="520" y2="445" />
              <line x1="520" y1="445" x2="780" y2="535" />
              <line x1="720" y1="120" x2="720" y2="480" />
            </g>

            {/* 1. DOUBLE-DECK BIRCH PLYWOOD SCALE PLATFORM */}
            <g
              id="part-scale"
              className="cursor-pointer transition-all duration-200"
              onClick={() => setActiveCalloutId("scale")}
              filter={activeCalloutId === "scale" ? "url(#activeGlow)" : undefined}
            >
              {/* Lower Base Floor Plate (resting on table with interior cutout) */}
              <polygon points="65,525 470,445 530,478 125,562" fill="#D9C9B1" stroke="#B8A183" strokeWidth="1.5" />
              <polygon points="125,562 530,478 530,490 125,574" fill="url(#plyEdge)" />
              <polygon points="65,525 125,562 125,574 65,537" fill="url(#plyEdge)" />

              {/* Lower Sled Center Cutout */}
              <polygon points="135,532 435,472 455,488 155,548" fill="#E6EEF8" className="dark:fill-[#080E18]" />

              {/* Load Cell Stand-off Spacers */}
              <rect x="140" y="495" width="16" height="10" rx="2" fill="#64748B" />
              <rect x="430" y="438" width="16" height="10" rx="2" fill="#64748B" />
              <rect x="475" y="460" width="16" height="10" rx="2" fill="#64748B" />
              <rect x="175" y="522" width="16" height="10" rx="2" fill="#64748B" />

              {/* Suspended Top Weighing Platform (Elevated 6mm birch plate) */}
              <polygon points="105,475 465,405 510,438 150,512" fill="url(#birchTop)" stroke="#CBB59A" strokeWidth="1.2" />
              <polygon points="150,512 510,438 510,450 150,524" fill="url(#plyEdge)" />
              <polygon points="105,475 150,512 150,524 105,487" fill="url(#plyEdge)" />

              {/* Iconic Center Black Paw Print */}
              <g transform="translate(290, 452) rotate(-10) scale(0.9)">
                <path
                  d="M 22 28 C 10 28, 4 20, 8 10 C 12 2, 22 0, 32 0 C 42 0, 52 2, 56 10 C 60 20, 54 28, 42 28 Z"
                  fill="#1E293B"
                />
                <ellipse cx="6" cy="-6" rx="6" ry="8" fill="#1E293B" transform="rotate(-20 6 -6)" />
                <ellipse cx="23" cy="-14" rx="6" ry="9" fill="#1E293B" transform="rotate(-6 23 -14)" />
                <ellipse cx="41" cy="-14" rx="6" ry="9" fill="#1E293B" transform="rotate(6 41 -14)" />
                <ellipse cx="58" cy="-6" rx="6" ry="8" fill="#1E293B" transform="rotate(20 58 -6)" />
              </g>

              {/* Raised Wooden Stand for Ceramic Bowl */}
              <polygon points="405,425 500,408 515,422 420,439" fill="url(#birchTop)" stroke="#CBB59A" strokeWidth="1" />
              <polygon points="420,439 515,422 515,430 420,447" fill="url(#plyEdge)" />

              {/* White Ceramic Food Bowl */}
              <ellipse cx="462" cy="419" rx="34" ry="17" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
              <ellipse cx="462" cy="417" rx="28" ry="13" fill="#E2E8F0" />
              {/* Kibble Pellets */}
              <g fill="#A66F33">
                <ellipse cx="454" cy="417" rx="5" ry="3" />
                <ellipse cx="462" cy="418" rx="5" ry="3.2" fill="#C28847" />
                <ellipse cx="470" cy="416" rx="4.8" ry="3" fill="#8C5824" />
                <ellipse cx="459" cy="421" rx="5" ry="3" fill="#C28847" />
                <ellipse cx="466" cy="420" rx="4.5" ry="2.8" />
              </g>
            </g>

            {/* 2. THE GREY CAT EATING FROM CERAMIC BOWL (Realistic 3D Isometric View) */}
            <g id="grey-cat-body">
              {/* Cat Torso & Flank */}
              <path
                d="M 220 405 C 200 375, 230 325, 280 315 C 340 305, 390 335, 430 385 C 410 425, 360 445, 300 445 C 260 445, 230 430, 220 405 Z"
                fill="url(#catCoat)"
              />
              {/* Cat Flank Highlight */}
              <path
                d="M 260 335 C 310 325, 360 345, 390 385 C 360 405, 310 400, 270 380 Z"
                fill="#94A3B8"
                opacity="0.3"
              />

              {/* Four Paws on Birch Weighing Platform */}
              <ellipse cx="270" cy="450" rx="14" ry="8" fill="#475569" />
              <ellipse cx="300" cy="460" rx="14" ry="8" fill="#5E7084" />
              <ellipse cx="370" cy="455" rx="13" ry="7" fill="#475569" />
              <ellipse cx="400" cy="450" rx="14" ry="8" fill="#5E7084" />

              {/* Lowered Head Eating from Dish */}
              <circle cx="438" cy="398" r="28" fill="#5E7084" />
              <ellipse cx="454" cy="408" rx="16" ry="12" fill="#475569" />

              {/* Ears in True 3D Perspective */}
              <polygon points="424,378 418,348 442,368" fill="#475569" />
              <polygon points="423,375 422,355 437,368" fill="#F4B8B8" opacity="0.6" />
              <polygon points="444,373 454,345 462,371" fill="#475569" />
              <polygon points="446,371 453,353 458,370" fill="#F4B8B8" opacity="0.6" />

              {/* Curved Tail */}
              <path
                d="M 225 405 C 200 410, 175 400, 170 375 C 165 350, 185 335, 205 345"
                stroke="#475569"
                strokeWidth="13"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 225 405 C 200 410, 175 400, 170 375 C 165 350, 185 335, 205 345"
                stroke="#5E7084"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
              />
            </g>

            {/* 3. DUAL-BAY CABINET ENCLOSURE */}
            <g id="dual-bay-tower">
              {/* White Cabinet Front Face */}
              <polygon points="460,135 700,180 700,495 460,435" fill="url(#cabBody)" stroke="#CBD5E1" strokeWidth="1.5" />
              {/* White Cabinet Right Face */}
              <polygon points="700,180 760,160 760,470 700,495" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5" />

              {/* Solid Birch Top Cover with Twin Lids */}
              <g
                id="part-lids"
                className="cursor-pointer"
                onClick={() => setActiveCalloutId("lids")}
                filter={activeCalloutId === "lids" ? "url(#activeGlow)" : undefined}
              >
                <polygon points="445,130 685,175 755,155 515,113" fill="url(#birchTop)" stroke="#CBB59A" strokeWidth="1.5" />
                <polygon points="445,130 685,175 685,185 445,140" fill="url(#plyEdge)" />
                <polygon points="685,175 755,155 755,165 685,185" fill="url(#plyEdge)" />

                {/* Turned Wooden Knobs */}
                <ellipse cx="525" cy="135" rx="10" ry="6" fill="#D5C4A9" stroke="#A98F72" strokeWidth="1" />
                <ellipse cx="635" cy="155" rx="10" ry="6" fill="#D5C4A9" stroke="#A98F72" strokeWidth="1" />
              </g>

              {/* Bay Division Seam */}
              <line x1="575" y1="157" x2="575" y2="365" stroke="#CBD5E1" strokeWidth="1.5" />

              {/* Left Bay: Angled Food Chute */}
              <g
                id="part-feeder"
                className="cursor-pointer"
                onClick={() => setActiveCalloutId("feeder")}
                filter={activeCalloutId === "feeder" ? "url(#activeGlow)" : undefined}
              >
                {/* Chute Cutout */}
                <path d="M 475 315 C 475 290, 515 290, 515 315 L 515 345 L 475 345 Z" fill="#E2E8F0" />
                {/* Angled Dispense Funnel */}
                <polygon points="475,315 515,315 505,365 465,365" fill="#F5EFE6" stroke="#D5C4A9" strokeWidth="1.2" />
                <polygon points="465,365 505,365 500,380 460,380" fill="#E5DC handle" fillOpacity="0.95" stroke="#CBB59A" strokeWidth="1" />

                {/* SG90 Servo Status Pulse Indicator */}
                <circle cx="558" cy="355" r="3.5" fill="#38BDF8" className="animate-pulse" />
                <circle cx="558" cy="355" r="7" fill="#38BDF8" fillOpacity="0.3" />
              </g>

              {/* Right Bay: Sight-Glass Water Window */}
              <g
                id="part-water_window"
                className="cursor-pointer"
                onClick={() => setActiveCalloutId("water_window")}
                filter={activeCalloutId === "water_window" ? "url(#activeGlow)" : undefined}
              >
                {/* Sight-Glass Frame */}
                <rect x="625" y="210" width="14" height="110" rx="7" fill="#0B111B" stroke="#CBD5E1" strokeWidth="1" />
                {/* Water Column with graduation lines */}
                <rect x="627" y="250" width="10" height="68" rx="5" fill="url(#waterFlow)" />
                <line x1="626" y1="260" x2="631" y2="260" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.8" />
                <line x1="626" y1="280" x2="631" y2="280" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.8" />
                <line x1="626" y1="300" x2="631" y2="300" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.8" />

                {/* Stainless Curved Spout */}
                <path
                  d="M 632 345 C 632 370, 620 380, 615 390"
                  stroke="#E2E8F0"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>

              {/* Right Bay: Arched Water Bowl Alcove */}
              <g
                id="part-alcove"
                className="cursor-pointer"
                onClick={() => setActiveCalloutId("alcove")}
                filter={activeCalloutId === "alcove" ? "url(#activeGlow)" : undefined}
              >
                <path
                  d="M 588 485 L 588 400 C 588 375, 675 375, 675 400 L 675 485 Z"
                  fill="#D8E2EC"
                  stroke="#CBD5E1"
                  strokeWidth="1.2"
                />
                {/* Ceramic Water Bowl */}
                <ellipse cx="632" cy="460" rx="36" ry="18" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                <ellipse cx="632" cy="458" rx="30" ry="14" fill="#38BDF8" fillOpacity="0.4" stroke="#38BDF8" strokeWidth="1" />
                {/* Meniscus Ripple */}
                <ellipse cx="632" cy="458" rx="16" ry="7" fill="none" stroke="#38BDF8" strokeWidth="0.8" opacity="0.7" />
              </g>

              {/* 4. ESP32 Controller Side Enclosure */}
              <g
                id="part-controller"
                className="cursor-pointer"
                onClick={() => setActiveCalloutId("controller")}
                filter={activeCalloutId === "controller" ? "url(#activeGlow)" : undefined}
              >
                <polygon points="700,255 750,240 750,380 700,395" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
                {/* Precision Ventilation Louvers */}
                <line x1="712" y1="275" x2="738" y2="267" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                <line x1="712" y1="287" x2="738" y2="279" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                <line x1="712" y1="299" x2="738" y2="291" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                <line x1="712" y1="311" x2="738" y2="303" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

                {/* DC Cable Routing Harness */}
                <path
                  d="M 730 390 C 730 445, 755 485, 740 525"
                  stroke="#0F172A"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>

              {/* 5. 5V Isolated DC Power Bank */}
              <g
                id="part-power"
                className="cursor-pointer"
                onClick={() => setActiveCalloutId("power")}
                filter={activeCalloutId === "power" ? "url(#activeGlow)" : undefined}
              >
                <polygon points="685,520 755,495 785,515 715,540" fill="#1E293B" stroke="#0F172A" strokeWidth="1.2" />
                <polygon points="715,540 785,515 785,530 715,555" fill="#0F172A" />
                <polygon points="685,520 715,540 715,555 685,535" fill="#0F172A" />
                {/* 4 Blue Battery Status LEDs */}
                <circle cx="725" cy="542" r="1.5" fill="#38BDF8" />
                <circle cx="732" cy="539" r="1.5" fill="#38BDF8" />
                <circle cx="739" cy="536" r="1.5" fill="#38BDF8" />
                <circle cx="746" cy="533" r="1.5" fill="#38BDF8" />
              </g>
            </g>

            {/* Interactive Technical Pin Markers with Pulsing Rings */}
            {CALLOUTS.map((c) => {
              const isActive = activeCalloutId === c.id;
              // Map percentage coordinates to 820x640 viewBox
              const cx = (c.pinX / 100) * 820;
              const cy = (c.pinY / 100) * 640;

              return (
                <g
                  key={c.id}
                  className="cursor-pointer group"
                  onClick={() => setActiveCalloutId(c.id)}
                >
                  {/* Outer Pulsing Indicator Ring */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isActive ? 14 : 9}
                    fill="#38BDF8"
                    fillOpacity={isActive ? 0.35 : 0.2}
                    className="transition-all duration-300"
                  />
                  {/* Pin Center Core */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isActive ? 7 : 5}
                    fill={isActive ? "#38BDF8" : "#4A72B8"}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    className="transition-all duration-300 group-hover:scale-125"
                  />
                  {/* Numerical Code Badge */}
                  <text
                    x={cx}
                    y={cy - 12}
                    textAnchor="middle"
                    fill={isActive ? "#38BDF8" : "#64748B"}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    [{c.code}]
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Component Specification Drawer */}
        <div className="p-4 sm:p-5 bg-white dark:bg-[#0D1524] border-t border-[#CBD5E1] dark:border-white/[0.1] transition-colors">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCallout.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col sm:flex-row sm:items-start justify-between gap-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[11px] font-bold text-periwinkle dark:text-sky-400 bg-periwinkle/10 px-2 py-0.5 rounded">
                    [{activeCallout.code}] {activeCallout.category.toUpperCase()}
                  </span>
                  <h4 className="text-[14px] sm:text-[15px] font-bold text-navy dark:text-white">
                    {activeCallout.title}
                  </h4>
                </div>
                <p className="text-[12px] sm:text-[13px] leading-relaxed text-navy-muted dark:text-navy-lightMuted">
                  {activeCallout.spec}
                </p>
              </div>

              {/* Callout Quick Switcher Dots */}
              <div className="flex sm:flex-col items-center gap-1.5 shrink-0 pt-1">
                <span className="text-[10px] font-mono text-navy-muted dark:text-navy-lightMuted hidden sm:block">
                  ANATOMY
                </span>
                <div className="flex items-center gap-1.5">
                  {CALLOUTS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveCalloutId(item.id)}
                      className={`w-6 h-6 rounded flex items-center justify-center font-mono text-[10px] font-semibold transition-all ${
                        activeCalloutId === item.id
                          ? "bg-periwinkle text-white scale-110 shadow-sm"
                          : "bg-[#F1F5F9] dark:bg-[#1E2B42] text-navy-muted dark:text-navy-lightMuted hover:bg-[#E2E8F0]"
                      }`}
                      aria-label={item.title}
                    >
                      {item.code}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Hardware Architecture Specs Ticker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#0B111B] border-t border-[#CBD5E1] dark:border-white/[0.08] text-[11px] font-mono text-navy-muted dark:text-navy-lightMuted">
          <div>SCALE: <span className="text-navy dark:text-white font-semibold">HX711 24-BIT</span></div>
          <div>SERVO: <span className="text-navy dark:text-white font-semibold">SG90 35G</span></div>
          <div>PUMP: <span className="text-navy dark:text-white font-semibold">PWM SOFT-STOP</span></div>
          <div>POWER: <span className="text-navy dark:text-white font-semibold">DUAL-RAIL 5V</span></div>
        </div>

      </div>
    </div>
  );
}
