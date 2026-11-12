"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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
    targetX: 270,
    targetY: 435,
    category: "Sensor",
  },
  {
    id: "feeder",
    code: "02",
    title: "SG90 Servo Chute",
    spec: "35g Controlled Dispense",
    subtext: "Angled food-grade delivery chute metered by an auto-detaching SG90 micro-servo with anti-jam shutoff.",
    icon: KibbleIcon,
    targetX: 512,
    targetY: 315,
    category: "Mechanical",
  },
  {
    id: "lids",
    code: "03",
    title: "Birch Service Lids",
    spec: "Dual Turned Knobs",
    subtext: "Twin 12mm Baltic birch plywood access lids with turned wooden handles for separate kibble and water replenishment.",
    icon: ShieldIcon,
    targetX: 585,
    targetY: 118,
    category: "Mechanical",
  },
  {
    id: "water_window",
    code: "04",
    title: "Sight-Glass & Spout",
    spec: "Slender Level Slit",
    subtext: "Optical water level sight-glass with graduated height ticks and downward dispensing spout nozzle.",
    icon: WaterDropIcon,
    targetX: 642,
    targetY: 235,
    category: "Fluidics",
  },
  {
    id: "alcove",
    code: "05",
    title: "Arched Water Alcove",
    spec: "PWM Soft-Stop Dish",
    subtext: "Recessed splash-containment chamber with glazed ceramic bowl directly below the 600ms soft-stop pump outlet.",
    icon: WaterDropIcon,
    targetX: 642,
    targetY: 435,
    category: "Fluidics",
  },
  {
    id: "controller",
    code: "06",
    title: "ESP32 & 5V Rail",
    spec: "HiveMQ TLS · Dual-Rail",
    subtext: "Side-mounted convective louvered box with isolated 5V power bank avoiding microcontroller brownout resets.",
    icon: SignalIcon,
    targetX: 742,
    targetY: 285,
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

  const rotateX = useTransform(springY, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-6deg", "6deg"]);

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
    <div className="relative w-full max-w-[660px] lg:max-w-[700px] mx-auto select-none py-1">
      {/* 3D Parallax Tilt Viewport (Technical header texts removed per user request) */}
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
        {/* Realistic Studio SVG Canvas matching the physical prototype */}
        <div className="relative w-full aspect-[900/620] bg-gradient-to-b from-[#FAFBFD] via-[#F4F7FB] to-[#E9EFF7] dark:from-[#0B111B] dark:via-[#0E1726] dark:to-[#121E33] rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-white/[0.06]">
          <svg
            viewBox="0 0 900 620"
            className="w-full h-full drop-shadow-sm"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Natural Warm Baltic Birch Face */}
              <linearGradient id="birchFace" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F9F4EB" />
                <stop offset="40%" stopColor="#F1E5D4" />
                <stop offset="80%" stopColor="#E4D3BC" />
                <stop offset="100%" stopColor="#D9C4AA" />
              </linearGradient>

              {/* Birch Wood Shadow Face */}
              <linearGradient id="birchDark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DEC9B0" />
                <stop offset="100%" stopColor="#CBB499" />
              </linearGradient>

              {/* Realistic Multi-Ply Laser/CNC Cut Plywood Edge */}
              <linearGradient id="plyEdgeDark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B39371" />
                <stop offset="25%" stopColor="#876846" />
                <stop offset="50%" stopColor="#C4A786" />
                <stop offset="75%" stopColor="#7E5F3F" />
                <stop offset="100%" stopColor="#A88661" />
              </linearGradient>

              {/* White Cabinet Front Face (Clean Studio Satin) */}
              <linearGradient id="whiteCabFront" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="60%" stopColor="#FAFCFF" />
                <stop offset="100%" stopColor="#F1F5F9" />
              </linearGradient>

              {/* White Cabinet Side Face (3D Perspective Shade) */}
              <linearGradient id="whiteCabSide" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#E2E8F0" />
                <stop offset="50%" stopColor="#D8E2EC" />
                <stop offset="100%" stopColor="#CBD5E1" />
              </linearGradient>

              {/* Cat Fur Gradients - Domestic Slate Grey */}
              <linearGradient id="catBody" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8899AC" />
                <stop offset="35%" stopColor="#6C7F94" />
                <stop offset="70%" stopColor="#55667B" />
                <stop offset="100%" stopColor="#435264" />
              </linearGradient>

              <linearGradient id="catSpineHighlight" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#9AB0C6" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#8194A8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#5A6D81" stopOpacity="0" />
              </linearGradient>

              {/* Water Window Liquid Column */}
              <linearGradient id="waterColumn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="50%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>

              {/* Ceramic Bowls Gloss */}
              <linearGradient id="ceramicBowl" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="70%" stopColor="#F8FAFC" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>

              {/* Turned Wooden Knob Radial Highlight */}
              <radialGradient id="woodenKnob" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#FAF4EB" />
                <stop offset="45%" stopColor="#DFC8AE" />
                <stop offset="90%" stopColor="#B39371" />
                <stop offset="100%" stopColor="#876846" />
              </radialGradient>

              {/* Soft Studio Floor Ambient Occlusion Shadow */}
              <radialGradient id="groundStudioShadow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(28,41,66,0.18)" />
                <stop offset="60%" stopColor="rgba(28,41,66,0.08)" />
                <stop offset="100%" stopColor="rgba(28,41,66,0)" />
              </radialGradient>
            </defs>

            {/* 1. STUDIO GROUND SHADOWS */}
            <ellipse cx="460" cy="535" rx="400" ry="50" fill="url(#groundStudioShadow)" />
            <ellipse cx="290" cy="515" rx="220" ry="32" fill="rgba(28,41,66,0.10)" />
            <ellipse cx="640" cy="495" rx="170" ry="30" fill="rgba(28,41,66,0.12)" />

            {/* 2. MAIN TOWER BIRCH PLYWOOD BASE PLATE */}
            <g id="tower-birch-base">
              {/* Top Face of Cabinet Base */}
              <polygon points="460,420 715,465 780,442 525,400" fill="url(#birchFace)" stroke="#D5C4A9" strokeWidth="1" />
              {/* Exposed Front Ply Edge */}
              <polygon points="460,420 715,465 715,476 460,431" fill="url(#plyEdgeDark)" stroke="#876846" strokeWidth="0.8" />
              {/* Exposed Right Ply Edge */}
              <polygon points="715,465 780,442 780,453 715,476" fill="url(#plyEdgeDark)" stroke="#876846" strokeWidth="0.8" />
            </g>

            {/* 3. BIRCH PLYWOOD DOUBLE-DECK SCALE PLATFORM & SLED */}
            <g id="birch-scale-assembly">
              {/* Base Floor Sled (Resting flat on table with center cutout) */}
              <polygon points="45,502 470,425 532,460 108,548" fill="#E4D3BD" stroke="#CBB499" strokeWidth="1.2" />
              {/* Sled Front Edge */}
              <polygon points="108,548 532,460 532,472 108,560" fill="url(#plyEdgeDark)" stroke="#876846" strokeWidth="0.8" />
              {/* Sled Left Edge */}
              <polygon points="45,502 108,548 108,560 45,514" fill="url(#plyEdgeDark)" stroke="#876846" strokeWidth="0.8" />

              {/* Inner Cutout Hole on Sled */}
              <polygon points="118,515 435,452 462,468 142,534" fill="#EEF3F8" className="dark:fill-[#0A101C]" stroke="#CBD5E1" strokeWidth="0.8" />

              {/* Suspended Weighing Deck (Hovering on load-cell mounts) */}
              <polygon points="85,455 450,388 495,420 130,495" fill="url(#birchFace)" stroke="#D5C4A9" strokeWidth="1.5" />
              {/* Front Ply Edge */}
              <polygon points="130,495 495,420 495,433 130,508" fill="url(#plyEdgeDark)" stroke="#876846" strokeWidth="1" />
              {/* Left Ply Edge */}
              <polygon points="85,455 130,495 130,508 85,468" fill="url(#plyEdgeDark)" stroke="#876846" strokeWidth="1" />

              {/* Realistic Laser/Plywood Edge Pinstripes */}
              <line x1="130" y1="499" x2="495" y2="424" stroke="#5D4329" strokeWidth="0.75" />
              <line x1="130" y1="504" x2="495" y2="429" stroke="#F9F4EB" strokeWidth="0.75" />

              {/* Bold Black Paw Print Silkscreen on Weighing Deck */}
              <g transform="translate(285, 436) rotate(-11) scale(0.92)">
                {/* Large Metacarpal Pad */}
                <path
                  d="M 22 28 C 9 28, 3 19, 7 9 C 11 1, 22 0, 32 0 C 42 0, 53 1, 57 9 C 61 19, 55 28, 42 28 Z"
                  fill="#1E293B"
                />
                {/* 4 Distinct Toe Bean Pads */}
                <ellipse cx="5" cy="-8" rx="6.5" ry="9" fill="#1E293B" transform="rotate(-22 5 -8)" />
                <ellipse cx="23" cy="-16" rx="6.5" ry="10" fill="#1E293B" transform="rotate(-7 23 -16)" />
                <ellipse cx="41" cy="-16" rx="6.5" ry="10" fill="#1E293B" transform="rotate(7 41 -16)" />
                <ellipse cx="59" cy="-8" rx="6.5" ry="9" fill="#1E293B" transform="rotate(22 59 -8)" />
              </g>

              {/* Cantilevered Birch Plywood Bracket for Food Bowl */}
              <polygon points="405,408 505,390 522,408 422,425" fill="url(#birchFace)" stroke="#D5C4A9" strokeWidth="1" />
              <polygon points="422,425 522,408 522,417 422,434" fill="url(#plyEdgeDark)" />

              {/* White Ceramic Food Bowl */}
              <ellipse cx="468" cy="406" rx="36" ry="18" fill="url(#ceramicBowl)" stroke="#CBD5E1" strokeWidth="1.5" />
              <ellipse cx="468" cy="404" rx="30" ry="14" fill="#F1F5F9" />
              {/* Crunchy Kibble Nuggets in Bowl */}
              <g fill="#A66F33">
                <ellipse cx="458" cy="404" rx="5.5" ry="3.2" fill="#8C5824" />
                <ellipse cx="466" cy="405" rx="6" ry="3.5" fill="#C28847" />
                <ellipse cx="476" cy="403" rx="5.2" ry="3.2" fill="#75441A" />
                <ellipse cx="463" cy="409" rx="5.5" ry="3.2" fill="#D49B58" />
                <ellipse cx="472" cy="408" rx="5" ry="3" fill="#A66F33" />
                <ellipse cx="478" cy="407" rx="4.5" ry="2.8" fill="#8C5824" />
              </g>
            </g>

            {/* 4. THE DOMESTIC GREY CAT STANDING ON PLATFORM EATING (True to physical photo) */}
            <g id="grey-cat-eating">
              {/* Subtle Cat Contact Shadows on Birch Board */}
              <ellipse cx="258" cy="442" rx="14" ry="7" fill="rgba(28,41,66,0.3)" />
              <ellipse cx="294" cy="452" rx="15" ry="8" fill="rgba(28,41,66,0.3)" />
              <ellipse cx="368" cy="446" rx="14" ry="7" fill="rgba(28,41,66,0.3)" />
              <ellipse cx="400" cy="442" rx="15" ry="8" fill="rgba(28,41,66,0.3)" />

              {/* Graceful Curved Tail trailing behind */}
              <path
                d="M 215 385 C 190 392, 160 380, 150 355 C 142 332, 162 315, 185 325"
                stroke="#3F4E5F"
                strokeWidth="13"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 215 385 C 190 392, 160 380, 150 355 C 142 332, 162 315, 185 325"
                stroke="#64748B"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
              />

              {/* Hind Haunches & Thigh Contours */}
              <path
                d="M 205 378 C 188 348, 218 305, 268 296 C 328 286, 378 316, 420 368 C 400 410, 350 430, 290 430 C 248 430, 216 412, 205 378 Z"
                fill="url(#catBody)"
              />

              {/* Spine Soft Studio Rim Light Highlight */}
              <path
                d="M 248 315 C 298 305, 350 325, 385 365 C 352 385, 302 380, 260 360 Z"
                fill="url(#catSpineHighlight)"
              />

              {/* Rear Legs & Paws planted on wood */}
              <ellipse cx="258" cy="438" rx="13" ry="7" fill="#435264" />
              <ellipse cx="294" cy="448" rx="14" ry="8" fill="#55667B" />

              {/* Front Legs & Paws */}
              <ellipse cx="368" cy="442" rx="13" ry="7" fill="#435264" />
              <ellipse cx="400" cy="438" rx="14" ry="8" fill="#64748B" />

              {/* Neck & Cat Head Lowered Eating inside the food bowl */}
              <ellipse cx="426" cy="365" rx="26" ry="24" fill="#55667B" />
              <circle cx="445" cy="385" r="24" fill="#64748B" />
              <ellipse cx="462" cy="396" rx="15" ry="11" fill="#435264" />

              {/* Perked Feline Ears in 3D Perspective */}
              {/* Left / Near Ear */}
              <polygon points="426,360 418,328 442,348" fill="#435264" />
              <polygon points="425,357 421,334 438,348" fill="#F4B8B8" opacity="0.65" />
              {/* Right / Far Ear */}
              <polygon points="448,354 458,324 466,352" fill="#55667B" />
              <polygon points="450,352 457,332 463,350" fill="#F4B8B8" opacity="0.65" />
            </g>

            {/* 5. MAIN DUAL-BAY CABINET TOWER (Clean White Body) */}
            <g id="dual-bay-cabinet-tower">
              {/* Front White Face (Dual Bays) */}
              <polygon points="465,115 710,160 710,465 465,420" fill="url(#whiteCabFront)" stroke="#CBD5E1" strokeWidth="1.5" />
              {/* Receding Right Side Face */}
              <polygon points="710,160 772,140 772,442 710,465" fill="url(#whiteCabSide)" stroke="#CBD5E1" strokeWidth="1.5" />

              {/* Vertical Division Seam between Kibble Bay & Water Bay */}
              <line x1="588" y1="138" x2="588" y2="442" stroke="#CBD5E1" strokeWidth="1.2" />

              {/* Top Service Lids (Baltic Birch with Layered Edges) */}
              {/* Left Lid (Kibble Reservoir) */}
              <polygon points="452,110 584,134 648,118 518,96" fill="url(#birchFace)" stroke="#D5C4A9" strokeWidth="1.2" />
              <polygon points="452,110 584,134 584,142 452,118" fill="url(#plyEdgeDark)" />
              {/* Right Lid (Water Reservoir) */}
              <polygon points="588,135 706,156 770,138 652,119" fill="url(#birchFace)" stroke="#D5C4A9" strokeWidth="1.2" />
              <polygon points="588,135 706,156 706,164 588,143" fill="url(#plyEdgeDark)" />
              <polygon points="706,156 770,138 770,146 706,164" fill="url(#plyEdgeDark)" />

              {/* Turned Wooden Lid Knobs */}
              {/* Left Knob */}
              <ellipse cx="538" cy="114" rx="8.5" ry="4.8" fill="url(#woodenKnob)" stroke="#876846" strokeWidth="0.8" />
              {/* Right Knob */}
              <ellipse cx="658" cy="136" rx="8.5" ry="4.8" fill="url(#woodenKnob)" stroke="#876846" strokeWidth="0.8" />

              {/* LEFT BAY: Food Chute Assembly */}
              <g id="feeder-chute-assembly">
                {/* Chute Hood Opening */}
                <path d="M 488 290 C 488 268, 526 268, 526 290 L 526 320 L 488 320 Z" fill="#E2E8F0" />
                {/* 3D Angled Delivery Chute Funnel */}
                <polygon points="488,290 526,290 516,340 478,340" fill="#FDFBF7" stroke="#D5C4A9" strokeWidth="1.2" />
                <polygon points="478,340 516,340 512,352 474,352" fill="#EADCC9" stroke="#876846" strokeWidth="1" />

                {/* Status Indicator LED (Emerald Green as in physical photo) */}
                <circle cx="572" cy="348" r="3.2" fill="#22C55E" />
                <circle cx="572" cy="348" r="7" fill="#22C55E" fillOpacity="0.25" className="animate-pulse" />
              </g>

              {/* RIGHT BAY: Water Reservoir Sight-Glass, Spout & Lower Alcove */}
              <g id="water-bay-assembly">
                {/* Slender Vertical Sight-Glass Slot Window */}
                <rect x="635" y="195" width="14" height="110" rx="7" fill="#0B111B" stroke="#CBD5E1" strokeWidth="1" />
                <rect x="637" y="235" width="10" height="68" rx="5" fill="url(#waterColumn)" />
                {/* Level Measurement Ticks */}
                <line x1="636" y1="245" x2="641" y2="245" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.85" />
                <line x1="636" y1="265" x2="641" y2="265" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.85" />
                <line x1="636" y1="285" x2="641" y2="285" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.85" />

                {/* Downward Curved Off-White Dispensing Spout */}
                <path
                  d="M 642 332 C 642 355, 630 364, 626 374"
                  stroke="#F8FAFC"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Arched Lower Water Alcove Chamber */}
                <path
                  d="M 602 460 L 602 385 C 602 362, 684 362, 684 385 L 684 460 Z"
                  fill="#E2E8F0"
                  stroke="#CBD5E1"
                  strokeWidth="1.2"
                />
                {/* Glazed Ceramic Water Bowl inside Alcove */}
                <ellipse cx="642" cy="446" rx="36" ry="18" fill="url(#ceramicBowl)" stroke="#CBD5E1" strokeWidth="1.5" />
                <ellipse cx="642" cy="444" rx="30" ry="14" fill="#38BDF8" fillOpacity="0.45" stroke="#38BDF8" strokeWidth="1" />
              </g>

              {/* 6. SIDE ELECTRONICS BOX & EXTERNAL POWER BANK (Right Exterior Wall) */}
              <g id="electronics-and-external-power">
                {/* Convective Louvered Electronics Box attached to right wall */}
                <polygon points="710,235 760,220 760,358 710,372" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
                {/* 5 Horizontal Ventilation Grille Slits */}
                <line x1="722" y1="255" x2="748" y2="247" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="722" y1="267" x2="748" y2="259" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="722" y1="279" x2="748" y2="271" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="722" y1="291" x2="748" y2="283" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="722" y1="303" x2="748" y2="295" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" />

                {/* Flexible Black USB Power Cable */}
                <path
                  d="M 740 370 C 740 430, 775 470, 765 505 C 760 518, 775 528, 792 522"
                  stroke="#0F172A"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Slim External Black Power Bank resting flat on table */}
                <polygon points="745,510 820,485 850,505 775,530" fill="#1E293B" stroke="#0F172A" strokeWidth="1.2" />
                <polygon points="775,530 850,505 850,518 775,543" fill="#0F172A" />
                <polygon points="745,510 775,530 775,543 745,523" fill="#0F172A" />
                {/* Front Port Accents & Battery Dots */}
                <circle cx="782" cy="534" r="1.5" fill="#38BDF8" />
                <circle cx="789" cy="531" r="1.5" fill="#38BDF8" />
                <circle cx="796" cy="528" r="1.5" fill="#38BDF8" />
                <circle cx="803" cy="525" r="1.5" fill="#38BDF8" />
              </g>
            </g>

            {/* Interactive Target Pulse Halo for the active component */}
            <circle
              cx={activeCallout.targetX}
              cy={activeCallout.targetY}
              r="15"
              fill="#38BDF8"
              fillOpacity="0.25"
              className="animate-ping"
            />
            <circle
              cx={activeCallout.targetX}
              cy={activeCallout.targetY}
              r="7.5"
              fill="#38BDF8"
              stroke="#FFFFFF"
              strokeWidth="2.5"
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
