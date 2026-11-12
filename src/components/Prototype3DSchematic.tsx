"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ScaleIcon, WaterDropIcon, KibbleIcon, SignalIcon, ShieldIcon } from "./Icons";

interface CalloutAnnotation {
  id: string;
  code: string;
  title: string;
  spec: string;
  subtext: string;
  icon: typeof ScaleIcon;
  targetX: number;
  targetY: number;
  category: "Mechanical" | "Sensor" | "Electrical" | "Fluidics";
}

const CALLOUTS: CalloutAnnotation[] = [
  {
    id: "scale",
    code: "01",
    title: "Birch Scale & HX711",
    spec: "24-Bit ADC · ±0.1g Sled",
    subtext: "Double-deck Baltic birch plywood sled with elevated suspended weighing plate and non-slip silkscreen paw mark.",
    icon: ScaleIcon,
    targetX: 300,
    targetY: 450,
    category: "Sensor",
  },
  {
    id: "feeder",
    code: "02",
    title: "SG90 Servo Chute",
    spec: "35g Controlled Dispense",
    subtext: "Angled food-grade delivery chute metered by an auto-detaching SG90 micro-servo with anti-jam shutoff.",
    icon: KibbleIcon,
    targetX: 495,
    targetY: 340,
    category: "Mechanical",
  },
  {
    id: "lids",
    code: "03",
    title: "Birch Service Lids",
    spec: "Dual Turned Knobs",
    subtext: "Twin 12mm birch plywood access lids with turned wooden handles for separate kibble and water replenishment.",
    icon: ShieldIcon,
    targetX: 580,
    targetY: 135,
    category: "Mechanical",
  },
  {
    id: "water_window",
    code: "04",
    title: "Sight-Glass & Spout",
    spec: "Slender Level Slit",
    subtext: "Optical water level sight-glass with graduated height ticks and downward stainless dispensing spout.",
    icon: WaterDropIcon,
    targetX: 632,
    targetY: 260,
    category: "Fluidics",
  },
  {
    id: "alcove",
    code: "05",
    title: "Arched Water Alcove",
    spec: "PWM Soft-Stop Dish",
    subtext: "Recessed splash-containment chamber with glazed ceramic bowl directly below the 600ms soft-stop pump outlet.",
    icon: WaterDropIcon,
    targetX: 635,
    targetY: 450,
    category: "Fluidics",
  },
  {
    id: "controller",
    code: "06",
    title: "ESP32 & 5V Rail",
    spec: "HiveMQ TLS · Dual-Rail",
    subtext: "Side-mounted convective louvered box with isolated 5V power bank avoiding microcontroller brownout resets.",
    icon: SignalIcon,
    targetX: 745,
    targetY: 515,
    category: "Electrical",
  },
];

export default function Prototype3DSchematic() {
  const [activeId, setActiveId] = useState<string>("scale");
  const containerRef = useRef<HTMLDivElement>(null);

  // 3D Parallax Tilt with framer-motion springs
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 180, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 180, damping: 22 });

  const rotateX = useTransform(springY, [-0.5, 0.5], ["6deg", "-6deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const activeCallout = CALLOUTS.find((c) => c.id === activeId) || CALLOUTS[0];

  return (
    <div className="relative w-full max-w-[640px] lg:max-w-[680px] mx-auto select-none py-1">
      {/* Blueprint Header */}
      <div className="flex items-center justify-between gap-3 mb-2 px-1 relative z-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 dark:bg-[#131D30]/95 backdrop-blur-md border border-[#CBD5E1] dark:border-white/[0.1] text-[11px] font-mono text-navy dark:text-white shadow-sm">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span className="font-semibold text-periwinkle dark:text-sky-400 uppercase tracking-wider">
            3D AXONOMETRIC SCHEMATIC
          </span>
          <span className="text-[#94A3B8] dark:text-[#64748B]">|</span>
          <span className="text-navy-muted dark:text-navy-lightMuted hidden sm:inline">
            PROTOTYPE ANATOMY
          </span>
        </div>

        <div className="text-[11px] font-mono text-navy-muted dark:text-navy-lightMuted hidden sm:block">
          Interactive 3D Viewport
        </div>
      </div>

      {/* 3D Parallax Tilt Viewport */}
      <motion.div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative rounded-2xl overflow-hidden bg-white dark:bg-[#0D1524] border border-[#CBD5E1] dark:border-white/[0.12] shadow-[0_16px_48px_rgba(28,41,66,0.12)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.65)] p-3 sm:p-4 transition-colors"
      >
        {/* Isometric SVG Canvas */}
        <div className="relative w-full aspect-[800/620] bg-gradient-to-b from-[#F8FAFC] to-[#EEF4FB] dark:from-[#0B111B] dark:to-[#0E1726] rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-white/[0.06]">
          
          {/* Subtle Isometric Background Grid */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 dark:opacity-15" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 0 20 L 40 20 M 20 0 L 20 40" stroke="#4A72B8" strokeWidth="0.5" strokeDasharray="2 3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cadGrid)" />
          </svg>

          <svg
            viewBox="0 0 800 620"
            className="w-full h-full drop-shadow-md"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Natural Birch Wood Faces */}
              <linearGradient id="birchFace" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F5ECE0" />
                <stop offset="45%" stopColor="#EADCC9" />
                <stop offset="100%" stopColor="#DEC9B0" />
              </linearGradient>

              {/* Realistic Baltic Birch Edge Plies */}
              <linearGradient id="plyEdgeDark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B39371" />
                <stop offset="25%" stopColor="#8C6E4E" />
                <stop offset="50%" stopColor="#B39371" />
                <stop offset="75%" stopColor="#8C6E4E" />
                <stop offset="100%" stopColor="#A88764" />
              </linearGradient>

              {/* 3D Cat Shading */}
              <linearGradient id="catGreyTop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#94A3B8" />
                <stop offset="50%" stopColor="#64748B" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>

              {/* White Enclosure Surfaces */}
              <linearGradient id="cabFront" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#F1F5F9" />
              </linearGradient>
              <linearGradient id="cabSide" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#E2E8F0" />
                <stop offset="100%" stopColor="#CBD5E1" />
              </linearGradient>

              {/* Blue Inspection Window Gradient */}
              <linearGradient id="waterWindow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.95" />
              </linearGradient>
            </defs>

            {/* Isometric Dimension Guides */}
            <g opacity="0.25" stroke="#4A72B8" strokeWidth="0.8" strokeDasharray="3 3">
              <line x1="70" y1="510" x2="490" y2="430" />
              <line x1="490" y1="430" x2="770" y2="500" />
              <line x1="710" y1="120" x2="710" y2="480" />
            </g>

            {/* Ground Contact Shadow */}
            <ellipse cx="440" cy="540" rx="340" ry="46" fill="rgba(28,41,66,0.14)" className="dark:fill-black/60" />

            {/* 1. BIRCH PLYWOOD DOUBLE-DECK SCALE PLATFORM */}
            <g id="birch-scale-assembly">
              {/* Bottom Base Frame (Flat on table with inner cutout) */}
              <polygon points="70,510 490,430 550,465 130,555" fill="#DFC9B0" stroke="#C5AC8F" strokeWidth="1.2" />
              <polygon points="130,555 550,465 550,477 130,567" fill="url(#plyEdgeDark)" stroke="#8C6E4E" strokeWidth="0.8" />
              <polygon points="70,510 130,555 130,567 70,522" fill="url(#plyEdgeDark)" stroke="#8C6E4E" strokeWidth="0.8" />

              {/* Inner Cutout Hole on Base Sled */}
              <polygon points="140,522 455,458 480,474 165,540" fill="#E6EEF8" className="dark:fill-[#080E18]" stroke="#CBD5E1" strokeWidth="0.8" />

              {/* Suspended Weighing Plate (Elevated on HX711 load cell mount) */}
              <polygon points="110,460 480,390 525,422 155,498" fill="url(#birchFace)" stroke="#D5C4A9" strokeWidth="1.5" />
              <polygon points="155,498 525,422 525,436 155,512" fill="url(#plyEdgeDark)" stroke="#8C6E4E" strokeWidth="1" />
              <polygon points="110,460 155,498 155,512 110,474" fill="url(#plyEdgeDark)" stroke="#8C6E4E" strokeWidth="1" />

              {/* Multi-ply edge pinstripes */}
              <line x1="155" y1="503" x2="525" y2="427" stroke="#654A2E" strokeWidth="0.75" />
              <line x1="155" y1="507" x2="525" y2="431" stroke="#F5ECE0" strokeWidth="0.75" />

              {/* Prominent Large Black Paw Print Silkscreen on Weighing Plate */}
              <g transform="translate(295, 442) rotate(-11) scale(0.92)">
                <path
                  d="M 22 29 C 9 29, 3 20, 7 10 C 11 2, 22 0, 32 0 C 42 0, 53 2, 57 10 C 61 20, 55 29, 42 29 Z"
                  fill="#1E293B"
                />
                <ellipse cx="5" cy="-7" rx="6.5" ry="9" fill="#1E293B" transform="rotate(-22 5 -7)" />
                <ellipse cx="23" cy="-15" rx="6.5" ry="10" fill="#1E293B" transform="rotate(-7 23 -15)" />
                <ellipse cx="41" cy="-15" rx="6.5" ry="10" fill="#1E293B" transform="rotate(7 41 -15)" />
                <ellipse cx="59" cy="-7" rx="6.5" ry="9" fill="#1E293B" transform="rotate(22 59 -7)" />
              </g>

              {/* Raised Birch Pedestal for Food Bowl */}
              <polygon points="410,412 510,395 528,412 428,429" fill="url(#birchFace)" stroke="#D5C4A9" strokeWidth="1" />
              <polygon points="428,429 528,412 528,422 428,439" fill="url(#plyEdgeDark)" />

              {/* White Ceramic Food Bowl */}
              <ellipse cx="470" cy="406" rx="36" ry="18" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
              <ellipse cx="470" cy="404" rx="30" ry="14" fill="#F1F5F9" />
              {/* Kibble Pellets */}
              <g fill="#A66F33">
                <ellipse cx="460" cy="404" rx="5.5" ry="3.2" />
                <ellipse cx="468" cy="405" rx="6" ry="3.5" fill="#C28847" />
                <ellipse cx="478" cy="403" rx="5.2" ry="3.2" fill="#8C5824" />
                <ellipse cx="465" cy="409" rx="5.5" ry="3.2" fill="#C28847" />
                <ellipse cx="473" cy="408" rx="5" ry="3" />
              </g>
            </g>

            {/* 2. THE SLEEK SOLID GREY CAT STANDING ON PLATFORM EATING */}
            <g id="grey-cat-eating">
              <path
                d="M 235 395 C 215 365, 245 315, 295 305 C 355 295, 405 325, 445 375 C 425 415, 375 435, 315 435 C 275 435, 245 420, 235 395 Z"
                fill="url(#catGreyTop)"
              />
              <path
                d="M 275 325 C 325 315, 375 335, 405 375 C 375 395, 325 390, 285 370 Z"
                fill="#CBD5E1"
                opacity="0.3"
              />

              {/* Four Paws Firmly Planted on Birch Platform */}
              <ellipse cx="285" cy="440" rx="14" ry="8" fill="#475569" />
              <ellipse cx="315" cy="450" rx="14" ry="8" fill="#64748B" />
              <ellipse cx="385" cy="445" rx="13" ry="7" fill="#475569" />
              <ellipse cx="415" cy="440" rx="14" ry="8" fill="#64748B" />

              {/* Cat Head Lowered Eating */}
              <circle cx="450" cy="390" r="28" fill="#64748B" />
              <ellipse cx="465" cy="400" rx="16" ry="12" fill="#475569" />

              {/* Ears in True 3D Perspective */}
              <polygon points="435,370 430,340 453,360" fill="#475569" />
              <polygon points="434,367 433,347 448,360" fill="#F4B8B8" opacity="0.6" />
              <polygon points="455,365 465,337 473,363" fill="#475569" />
              <polygon points="457,363 464,345 469,362" fill="#F4B8B8" opacity="0.6" />

              {/* Sleek Curved Tail */}
              <path
                d="M 240 395 C 215 400, 190 390, 185 365 C 180 340, 200 325, 220 335"
                stroke="#475569"
                strokeWidth="12"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 240 395 C 215 400, 190 390, 185 365 C 180 340, 200 325, 220 335"
                stroke="#64748B"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
              />
            </g>

            {/* 3. DUAL-BAY WHITE VERTICAL CABINET */}
            <g id="dual-bay-cabinet">
              <polygon points="470,120 710,165 710,480 470,420" fill="url(#cabFront)" stroke="#CBD5E1" strokeWidth="1.5" />
              <polygon points="710,165 770,145 770,455 710,480" fill="url(#cabSide)" stroke="#CBD5E1" strokeWidth="1.5" />

              {/* Birch Top Cover with Turned Handles */}
              <polygon points="455,115 695,160 765,140 525,98" fill="url(#birchFace)" stroke="#D5C4A9" strokeWidth="1.5" />
              <polygon points="455,115 695,160 695,170 455,125" fill="url(#plyEdgeDark)" />
              <polygon points="695,160 765,140 765,150 695,170" fill="url(#plyEdgeDark)" />

              {/* Wooden Turn Knobs */}
              <ellipse cx="535" cy="120" rx="9" ry="5" fill="#DFC9B0" stroke="#8C6E4E" strokeWidth="1" />
              <ellipse cx="645" cy="140" rx="9" ry="5" fill="#DFC9B0" stroke="#8C6E4E" strokeWidth="1" />

              {/* Left Bay: Kibble Dispensing Chute */}
              <g id="feeder-chute">
                <line x1="585" y1="142" x2="585" y2="350" stroke="#CBD5E1" strokeWidth="1.2" />
                <path d="M 485 300 C 485 275, 525 275, 525 300 L 525 330 L 485 330 Z" fill="#E2E8F0" />
                <polygon points="485,300 525,300 515,350 475,350" fill="#FBF7F0" stroke="#D5C4A9" strokeWidth="1.2" />
                <polygon points="475,350 515,350 510,365 470,365" fill="#EADCC9" stroke="#8C6E4E" strokeWidth="1" />
                
                {/* SG90 Status LED */}
                <circle cx="568" cy="340" r="3" fill="#38BDF8" className="animate-pulse" />
                <circle cx="568" cy="340" r="6" fill="#38BDF8" fillOpacity="0.3" />
              </g>

              {/* Right Bay: Water Sight-Glass Window & Alcove */}
              <g id="water-reservoir-and-alcove">
                <rect x="635" y="195" width="14" height="110" rx="7" fill="#0B111B" stroke="#CBD5E1" strokeWidth="1" />
                <rect x="637" y="235" width="10" height="68" rx="5" fill="url(#waterWindow)" />
                <line x1="636" y1="245" x2="641" y2="245" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.8" />
                <line x1="636" y1="265" x2="641" y2="265" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.8" />
                <line x1="636" y1="285" x2="641" y2="285" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.8" />

                {/* Downward Curved Spout */}
                <path
                  d="M 642 330 C 642 355, 630 365, 625 375"
                  stroke="#F1F5F9"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Arched Water Alcove */}
                <path
                  d="M 598 470 L 598 385 C 598 360, 685 360, 685 385 L 685 470 Z"
                  fill="#E2E8F0"
                  stroke="#CBD5E1"
                  strokeWidth="1"
                />
                <ellipse cx="642" cy="445" rx="36" ry="18" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                <ellipse cx="642" cy="443" rx="30" ry="14" fill="#38BDF8" fillOpacity="0.4" stroke="#38BDF8" strokeWidth="1" />
              </g>

              {/* 4. ESP32 Electronics Bay & 5V Power Bank */}
              <g id="electronics-and-power">
                <polygon points="710,240 760,225 760,365 710,380" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
                <line x1="722" y1="260" x2="748" y2="252" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="722" y1="272" x2="748" y2="264" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="722" y1="284" x2="748" y2="276" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="722" y1="296" x2="748" y2="288" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

                {/* DC Cable Harness */}
                <path
                  d="M 742 375 C 742 435, 770 475, 755 512"
                  stroke="#0F172A"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* 5V Power Bank */}
                <polygon points="700,505 770,480 800,500 730,525" fill="#1E293B" stroke="#0F172A" strokeWidth="1.2" />
                <polygon points="730,525 800,500 800,515 730,540" fill="#0F172A" />
                <polygon points="700,505 730,525 730,540 700,520" fill="#0F172A" />
                <circle cx="738" cy="530" r="1.5" fill="#38BDF8" />
                <circle cx="745" cy="527" r="1.5" fill="#38BDF8" />
                <circle cx="752" cy="524" r="1.5" fill="#38BDF8" />
                <circle cx="759" cy="521" r="1.5" fill="#38BDF8" />
              </g>
            </g>

            {/* Interactive Target Pulse Halo for the active component */}
            <circle
              cx={activeCallout.targetX}
              cy={activeCallout.targetY}
              r="14"
              fill="#38BDF8"
              fillOpacity="0.25"
              className="animate-ping"
            />
            <circle
              cx={activeCallout.targetX}
              cy={activeCallout.targetY}
              r="7"
              fill="#38BDF8"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Technical Callout Badge Cards Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-3 pt-3 border-t border-[#CBD5E1] dark:border-white/[0.08]">
          {CALLOUTS.map((ann) => {
            const isSelected = activeId === ann.id;
            const Icon = ann.icon;

            return (
              <button
                key={ann.id}
                type="button"
                onClick={() => setActiveId(ann.id)}
                onMouseEnter={() => setActiveId(ann.id)}
                className={`flex flex-col items-start p-2 rounded-xl border transition-all text-left ${
                  isSelected
                    ? "bg-[#EFF6FF] dark:bg-[#131E33] border-periwinkle dark:border-sky-500/60 shadow-sm ring-1 ring-periwinkle/30"
                    : "bg-white/80 dark:bg-navy-card/60 border-[#CBD5E1] dark:border-white/[0.08] hover:border-periwinkle/40"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-mono font-bold text-periwinkle dark:text-sky-400">
                    [{ann.code}]
                  </span>
                  <Icon className={`w-3 h-3 ${isSelected ? "text-periwinkle dark:text-sky-400" : "text-navy-muted dark:text-navy-lightMuted"}`} />
                </div>
                <div className="text-[11px] font-bold text-navy dark:text-white leading-tight truncate w-full">
                  {ann.title}
                </div>
                <div className="text-[10px] text-navy-muted dark:text-navy-lightMuted font-mono mt-0.5 truncate w-full">
                  {ann.spec}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Annotation Subtext Drawer */}
        <div className="mt-2.5 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B111B] border border-[#CBD5E1] dark:border-white/[0.08] flex items-center justify-between gap-3 text-[12px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
            <span className="text-navy dark:text-white font-semibold">
              {activeCallout.title}:{" "}
              <span className="text-navy-muted dark:text-navy-lightMuted font-normal">
                {activeCallout.subtext}
              </span>
            </span>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
