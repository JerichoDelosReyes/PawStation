"use client";

import { motion } from "framer-motion";
import { ScaleIcon, WaterDropIcon, KibbleIcon, SignalIcon } from "./Icons";

export default function IsometricStation() {
  return (
    <div className="relative w-full max-w-[560px] lg:max-w-[620px] mx-auto flex items-center justify-center select-none py-4">
      {/* Ambient background soft glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(74,114,184,0.18)_0%,transparent_70%)] blur-[60px] pointer-events-none" />

      {/* Main 3D Isometric SVG */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 w-full"
      >
        <svg
          viewBox="0 0 680 540"
          className="w-full h-auto drop-shadow-[0_12px_32px_rgba(28,41,66,0.12)] dark:drop-shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients for Chassis */}
            <linearGradient id="chassisTop" x1="160" y1="260" x2="520" y2="440" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F8FAFC" className="dark:stop-color-[#1E2B42]" />
              <stop offset="100%" stopColor="#E2ECF7" className="dark:stop-color-[#131C2D]" />
            </linearGradient>
            <linearGradient id="chassisLeft" x1="100" y1="360" x2="340" y2="480" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#CBDDF0" className="dark:stop-color-[#0F1725]" />
              <stop offset="100%" stopColor="#BACFE6" className="dark:stop-color-[#0B111B]" />
            </linearGradient>
            <linearGradient id="chassisRight" x1="340" y1="480" x2="580" y2="360" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#DCE8F5" className="dark:stop-color-[#152136]" />
              <stop offset="100%" stopColor="#C9DCF0" className="dark:stop-color-[#111A2B]" />
            </linearGradient>

            {/* Load Cell Disc Gradients */}
            <radialGradient id="scalePlatter" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" className="dark:stop-color-[#2A3B57]" />
              <stop offset="70%" stopColor="#D8E4F2" className="dark:stop-color-[#172338]" />
              <stop offset="100%" stopColor="#BACFE6" className="dark:stop-color-[#0F1725]" />
            </radialGradient>

            {/* Water Reservoir Gradients */}
            <linearGradient id="waterFluid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="acrylicGlass" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <stop offset="20%" stopColor="#E0F2FE" stopOpacity="0.2" />
              <stop offset="80%" stopColor="#BAE6FD" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.4" />
            </linearGradient>

            {/* Hopper Cylinder Gradient */}
            <linearGradient id="hopperGlass" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
              <stop offset="25%" stopColor="#F1F5F9" stopOpacity="0.2" />
              <stop offset="80%" stopColor="#E2E8F0" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="hopperCap" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#608BD6" />
              <stop offset="100%" stopColor="#4A72B8" />
            </linearGradient>

            {/* Stainless Steel Spout */}
            <linearGradient id="steelSpout" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="50%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>

            {/* Ground Shadow Filter */}
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="12" />
            </filter>
          </defs>

          {/* 1. Ground Drop Shadow */}
          <ellipse
            cx="340"
            cy="470"
            rx="250"
            ry="45"
            fill="rgba(28, 41, 66, 0.18)"
            className="dark:fill-black/60"
            filter="url(#softShadow)"
          />

          {/* 2. Main Hardware Chassis Base (Isometric Slab) */}
          {/* Bottom thickness sides */}
          <path
            d="M 120 375 L 340 480 L 340 500 L 120 395 Z"
            fill="url(#chassisLeft)"
            stroke="#BACFE6"
            strokeWidth="1"
            className="dark:stroke-white/[0.08]"
          />
          <path
            d="M 340 480 L 560 375 L 560 395 L 340 500 Z"
            fill="url(#chassisRight)"
            stroke="#BACFE6"
            strokeWidth="1"
            className="dark:stroke-white/[0.08]"
          />
          {/* Top surface */}
          <path
            d="M 340 270 L 560 375 L 340 480 L 120 375 Z"
            fill="url(#chassisTop)"
            stroke="#BACFE6"
            strokeWidth="1.5"
            className="dark:stroke-white/[0.12]"
          />

          {/* Subtle perimeter bevel accent */}
          <path
            d="M 340 276 L 550 375 L 340 474 L 130 375 Z"
            fill="none"
            stroke="#4A72B8"
            strokeOpacity="0.25"
            strokeWidth="1"
          />

          {/* 3. Integrated OLED Screen on Front Bevel (340, 485) */}
          <g transform="translate(290, 474) skewY(15) scale(0.9, 0.7)">
            <rect
              x="0"
              y="0"
              width="100"
              height="24"
              rx="4"
              fill="#0B111B"
              stroke="#38BDF8"
              strokeWidth="0.8"
              strokeOpacity="0.6"
            />
            {/* OLED glowing readout */}
            <text
              x="8"
              y="12"
              fill="#38BDF8"
              fontSize="7"
              fontFamily="monospace"
              fontWeight="bold"
              letterSpacing="0.5"
            >
              3.82 kg
            </text>
            <text
              x="8"
              y="19"
              fill="#94A3B8"
              fontSize="4.5"
              fontFamily="monospace"
              letterSpacing="0.3"
            >
              STABLE · 24-BIT
            </text>
            <circle cx="88" cy="12" r="2" fill="#38BDF8" className="animate-pulse" />
          </g>

          {/* 4. Left Scale Platform (HX711 Mount + Ceramic Kibble Bowl) */}
          <g id="scale-platter">
            {/* Load cell metal disc base */}
            <ellipse cx="240" cy="390" rx="65" ry="32" fill="url(#scalePlatter)" stroke="#4A72B8" strokeWidth="1.2" strokeOpacity="0.4" />
            <ellipse cx="240" cy="388" rx="58" ry="28" fill="none" stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="3 2" />

            {/* Ceramic Feeding Bowl */}
            <ellipse cx="240" cy="384" rx="46" ry="22" fill="#FFFFFF" className="dark:fill-[#1E2B42]" stroke="#CBD5E1" strokeWidth="1.5" />
            <ellipse cx="240" cy="382" rx="40" ry="18" fill="#F1F5F9" className="dark:fill-[#152136]" />

            {/* Dispensed Kibble Pellets in Bowl */}
            <g id="bowl-kibble">
              <ellipse cx="230" cy="381" rx="5" ry="3.5" fill="#C28847" />
              <ellipse cx="238" cy="383" rx="5.5" ry="3.5" fill="#D99B5A" />
              <ellipse cx="246" cy="380" rx="5" ry="3" fill="#A66F33" />
              <ellipse cx="234" cy="385" rx="4.5" ry="3" fill="#D99B5A" />
              <ellipse cx="243" cy="385" rx="5" ry="3.5" fill="#C28847" />
              <ellipse cx="251" cy="382" rx="4" ry="2.8" fill="#A66F33" />
              <ellipse cx="225" cy="383" rx="4" ry="2.8" fill="#A66F33" />
            </g>
          </g>

          {/* 5. Right Fresh Water Station (Ceramic Water Bowl + Ripples) */}
          <g id="water-bowl">
            {/* Bowl base disc */}
            <ellipse cx="440" cy="390" rx="65" ry="32" fill="url(#scalePlatter)" stroke="#38BDF8" strokeWidth="1.2" strokeOpacity="0.4" />

            {/* Ceramic Hydration Bowl */}
            <ellipse cx="440" cy="384" rx="46" ry="22" fill="#FFFFFF" className="dark:fill-[#1E2B42]" stroke="#CBD5E1" strokeWidth="1.5" />
            <ellipse cx="440" cy="382" rx="40" ry="18" fill="#E0F2FE" className="dark:fill-[#0F2338]" />

            {/* Glowing Water Level in bowl */}
            <ellipse cx="440" cy="382" rx="36" ry="15" fill="#38BDF8" fillOpacity="0.45" stroke="#38BDF8" strokeWidth="0.8" />
            {/* Water Ripple rings */}
            <ellipse cx="440" cy="382" rx="26" ry="10" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.8" />
            <ellipse cx="440" cy="382" rx="14" ry="5.5" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.9" />
          </g>

          {/* 6. Food Hopper Tower (Back-Left Pillar) */}
          <g id="kibble-hopper">
            {/* Lower Dispense Funnel / Chute */}
            <path
              d="M 215 270 L 265 270 L 248 315 L 232 315 Z"
              fill="#BACFE6"
              className="dark:fill-[#172338]"
              stroke="#94A3B8"
              strokeWidth="1"
            />
            {/* Dispense Opening */}
            <ellipse cx="240" cy="315" rx="8" ry="3.5" fill="#0B111B" />
            {/* Kibble dropping from chute */}
            <ellipse cx="240" cy="330" rx="3.5" ry="2.5" fill="#D99B5A" />
            <ellipse cx="239" cy="344" rx="3.8" ry="2.6" fill="#C28847" />

            {/* Cylindrical Acrylic Hopper Body */}
            {/* Back wall */}
            <path
              d="M 195 150 A 45 18 0 0 1 285 150 L 285 270 A 45 18 0 0 1 195 270 Z"
              fill="#F8FAFC"
              className="dark:fill-[#131C2D]"
              fillOpacity="0.2"
            />
            {/* Kibble Pellets layered inside cylinder */}
            <g id="hopper-pellets" opacity="0.9">
              {/* Dense layer of kibble */}
              <ellipse cx="240" cy="265" rx="40" ry="14" fill="#C28847" />
              <ellipse cx="225" cy="255" rx="7" ry="5" fill="#D99B5A" />
              <ellipse cx="240" cy="253" rx="7.5" ry="5" fill="#A66F33" />
              <ellipse cx="255" cy="254" rx="7" ry="4.8" fill="#C28847" />
              <ellipse cx="218" cy="245" rx="6.5" ry="4.5" fill="#A66F33" />
              <ellipse cx="232" cy="242" rx="7" ry="5" fill="#D99B5A" />
              <ellipse cx="248" cy="243" rx="7.5" ry="4.8" fill="#C28847" />
              <ellipse cx="262" cy="245" rx="6.5" ry="4.5" fill="#D99B5A" />
              <ellipse cx="225" cy="232" rx="7" ry="4.8" fill="#C28847" />
              <ellipse cx="240" cy="230" rx="7.5" ry="5" fill="#A66F33" />
              <ellipse cx="255" cy="231" rx="7" ry="4.8" fill="#D99B5A" />
              <ellipse cx="232" cy="220" rx="7" ry="4.5" fill="#D99B5A" />
              <ellipse cx="248" cy="221" rx="7.2" ry="4.8" fill="#C28847" />
              <ellipse cx="240" cy="212" rx="7" ry="4.5" fill="#A66F33" />
            </g>

            {/* Front transparent cylinder wall */}
            <path
              d="M 195 150 L 195 270 A 45 18 0 0 0 285 270 L 285 150 A 45 18 0 0 1 195 150 Z"
              fill="url(#hopperGlass)"
              stroke="#BACFE6"
              strokeWidth="1.2"
              className="dark:stroke-white/[0.15]"
            />
            {/* Vertical specular shine */}
            <path d="M 210 155 L 210 265" stroke="#FFFFFF" strokeWidth="2.5" strokeOpacity="0.6" strokeLinecap="round" />
            <path d="M 216 158 L 216 262" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.4" strokeLinecap="round" />

            {/* Top Hopper Rim & Cap */}
            <ellipse cx="240" cy="150" rx="45" ry="18" fill="url(#hopperCap)" stroke="#3C5F9C" strokeWidth="1.5" />
            <ellipse cx="240" cy="146" rx="42" ry="16" fill="#608BD6" />
            {/* Lid handle knob */}
            <ellipse cx="240" cy="142" rx="14" ry="6" fill="#F8FAFC" stroke="#BACFE6" strokeWidth="1" />
          </g>

          {/* 7. Hydration Column Tower (Back-Right Pillar) */}
          <g id="water-reservoir">
            {/* Acrylic Tank Body */}
            <path
              d="M 395 130 A 45 18 0 0 1 485 130 L 485 270 A 45 18 0 0 1 395 270 Z"
              fill="#F8FAFC"
              className="dark:fill-[#131C2D]"
              fillOpacity="0.15"
            />

            {/* Glowing Water Column (Fluid level ~80%) */}
            <path
              d="M 395 160 L 395 270 A 45 18 0 0 0 485 270 L 485 160 A 45 18 0 0 1 395 160 Z"
              fill="url(#waterFluid)"
            />
            {/* Water Surface Meniscus */}
            <ellipse cx="440" cy="160" rx="45" ry="17" fill="#60A5FA" stroke="#93C5FD" strokeWidth="1.2" />

            {/* Front Acrylic Glass Wall */}
            <path
              d="M 395 130 L 395 270 A 45 18 0 0 0 485 270 L 485 130 A 45 18 0 0 1 395 130 Z"
              fill="url(#acrylicGlass)"
              stroke="#7DD3FC"
              strokeWidth="1.2"
              strokeOpacity="0.7"
            />
            {/* Vertical specular glare */}
            <path d="M 410 135 L 410 265" stroke="#FFFFFF" strokeWidth="2.5" strokeOpacity="0.7" strokeLinecap="round" />
            <path d="M 416 138 L 416 262" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.4" strokeLinecap="round" />

            {/* Graduation measurement ticks */}
            <line x1="470" y1="170" x2="480" y2="170" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.8" />
            <text x="454" y="172" fill="#FFFFFF" fontSize="6" fontFamily="monospace" opacity="0.8">750</text>
            <line x1="470" y1="200" x2="480" y2="200" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.8" />
            <text x="454" y="202" fill="#FFFFFF" fontSize="6" fontFamily="monospace" opacity="0.8">500</text>
            <line x1="470" y1="230" x2="480" y2="230" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.8" />
            <text x="454" y="232" fill="#FFFFFF" fontSize="6" fontFamily="monospace" opacity="0.8">250</text>

            {/* Top Reservoir Cap */}
            <ellipse cx="440" cy="130" rx="45" ry="18" fill="url(#hopperCap)" stroke="#3C5F9C" strokeWidth="1.5" />
            <ellipse cx="440" cy="126" rx="42" ry="16" fill="#608BD6" />

            {/* Stainless Steel Gooseneck Water Spout */}
            <path
              d="M 440 270 C 440 310, 440 330, 440 345"
              stroke="url(#steelSpout)"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <ellipse cx="440" cy="345" rx="3.5" ry="2" fill="#64748B" />
            {/* Water drop falling into bowl */}
            <path
              d="M 440 352 Q 442 357 440 361 Q 438 357 440 352 Z"
              fill="#38BDF8"
              className="animate-pulse"
            />
          </g>

          {/* 8. ESP32 Controller Bay & Status Bridge (Center) */}
          <g id="esp32-bridge">
            {/* Central interconnect bridge between towers */}
            <path
              d="M 285 240 L 395 240 L 395 275 L 285 275 Z"
              fill="#CBDDF0"
              className="dark:fill-[#131C2D]"
              stroke="#BACFE6"
              strokeWidth="1"
            />
            {/* PCB Trace accents */}
            <path
              d="M 310 255 H 345 V 265 H 370"
              stroke="#4A72B8"
              strokeWidth="1.2"
              fill="none"
              strokeDasharray="4 2"
              opacity="0.8"
            />
            {/* Pulsing ESP32 Status LED */}
            <circle cx="340" cy="255" r="4" fill="#38BDF8" className="animate-pulse" />
            <circle cx="340" cy="255" r="8" fill="#38BDF8" fillOpacity="0.25" className="animate-ping" />
            {/* Tactile manual buttons */}
            <rect x="315" y="260" width="8" height="6" rx="1.5" fill="#4A72B8" stroke="#3C5F9C" strokeWidth="0.8" />
            <rect x="357" y="260" width="8" height="6" rx="1.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="0.8" />
          </g>

          {/* 9. Cute Companion Cat (Curled beside station on right side) */}
          <g id="companion-cat" transform="translate(480, 360)">
            {/* Cat soft shadow */}
            <ellipse cx="65" cy="72" rx="45" ry="16" fill="rgba(28, 41, 66, 0.15)" className="dark:fill-black/50" />

            {/* Curled Fluffy Cat Body */}
            <ellipse cx="65" cy="50" rx="38" ry="26" fill="#FDFBF7" stroke="#E2E8F0" strokeWidth="1.2" />

            {/* Calico / Ginger Patches on Back */}
            <path
              d="M 50 32 C 65 30, 85 36, 92 50 C 85 58, 68 54, 52 46 Z"
              fill="#D97706"
              opacity="0.9"
            />
            <path
              d="M 38 48 C 42 38, 55 42, 58 54 C 48 58, 36 56, 38 48 Z"
              fill="#334155"
              opacity="0.85"
            />

            {/* Sleeping / Relaxed Cat Head */}
            <circle cx="35" cy="38" r="19" fill="#FDFBF7" stroke="#E2E8F0" strokeWidth="1" />

            {/* Cat Ears */}
            <polygon points="24,24 16,6 34,18" fill="#D97706" />
            <polygon points="23,22 18,10 31,18" fill="#F4B8B8" />

            <polygon points="38,20 48,6 48,24" fill="#FDFBF7" />
            <polygon points="40,19 46,10 47,22" fill="#F4B8B8" />

            {/* Peaceful Sleeping Eyes (Curved happy lines) */}
            <path
              d="M 24 37 Q 27 41 30 37"
              stroke="#334155"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 36 37 Q 39 41 42 37"
              stroke="#334155"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Nose & Whiskers */}
            <polygon points="32,42 34,42 33,44" fill="#F4B8B8" />
            <line x1="26" y1="42" x2="15" y2="40" stroke="#94A3B8" strokeWidth="0.8" strokeLinecap="round" />
            <line x1="26" y1="44" x2="16" y2="45" stroke="#94A3B8" strokeWidth="0.8" strokeLinecap="round" />
            <line x1="39" y1="42" x2="50" y2="40" stroke="#94A3B8" strokeWidth="0.8" strokeLinecap="round" />
            <line x1="39" y1="44" x2="49" y2="45" stroke="#94A3B8" strokeWidth="0.8" strokeLinecap="round" />

            {/* Front Paws resting comfortably */}
            <ellipse cx="28" cy="58" rx="8" ry="5.5" fill="#FDFBF7" stroke="#E2E8F0" strokeWidth="0.8" />
            <ellipse cx="42" cy="58" rx="8" ry="5.5" fill="#FDFBF7" stroke="#E2E8F0" strokeWidth="0.8" />

            {/* Curled Tail wrapping around body */}
            <path
              d="M 98 52 C 108 55, 110 68, 98 72 C 86 75, 75 70, 70 68"
              stroke="#D97706"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />
            {/* White tail tip */}
            <path
              d="M 95 72 C 88 74, 80 72, 75 70"
              stroke="#FDFBF7"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        </svg>
      </motion.div>
    </div>
  );
}
