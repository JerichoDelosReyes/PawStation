"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform, useScroll, AnimatePresence } from "framer-motion";
import { PawIcon, PawOutlineIcon, ScaleIcon, KibbleIcon, WaterDropIcon, SignalIcon } from "./Icons";
import { useAuth } from "@/lib/auth-context";
import InverseCorner from "./InverseCorner";
import ThemeTogglePill from "./ThemeTogglePill";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Materials", href: "/#materials" },
  { label: "Architecture", href: "/#blueprint" },
  { label: "FAQ", href: "/#faq" },
];

export default function Hero() {
  const { user, openAuthModal } = useAuth();
  const heroRef = useRef<HTMLElement>(null);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  // Scroll physics
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 26,
    restDelta: 0.001,
  });

  const heroScale = useTransform(smoothProgress, [0, 1], [1, 0.98]);
  const heroY = useTransform(smoothProgress, [0, 1], [0, 30]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.9], [1, 0.92]);
  const sculptureScrollY = useTransform(smoothProgress, [0, 1], [0, 36]);

  // Subtle 3D mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 20 });
  const rotateX = useTransform(springY, [-0.5, 0.5], ["3deg", "-3deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-4deg", "4deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      ref={heroRef}
      className="relative w-full min-h-[100dvh] lg:h-[100dvh] bg-[var(--frame-bg)] text-white select-none p-2 sm:p-3 lg:p-4 flex flex-col justify-between overflow-hidden"
    >
      {/* ─────────────────────────────────────────────────────────────
          UNIFIED HERO CARD (CHASSIS + SEAMLESS INTEGRATED HEADER + BODY)
      ───────────────────────────────────────────────────────────── */}
      <motion.div
        style={{
          scale: heroScale,
          y: heroY,
          opacity: heroOpacity,
        }}
        className="relative w-full flex-1 flex flex-col min-h-0"
      >
        {/* ── UNIFIED CREAM CANVAS WITH DOCKED CORNER NOTCHES ─────── */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full flex-1 min-h-0 bg-[var(--panel-bg)] text-[var(--panel-text)] rounded-[26px] sm:rounded-[38px] overflow-hidden flex flex-col justify-between transition-colors duration-200"
        >
          {/* ─────────────────────────────────────────────────────────
              1. DOCKED TOP-LEFT NOTCH (BRAND LOGO)
          ───────────────────────────────────────────────────────── */}
          <div className="absolute top-0 left-0 z-30 flex items-start">
            <div className="bg-[var(--frame-bg)] pt-2.5 sm:pt-3.5 pb-2.5 sm:pb-3.5 pl-4 sm:pl-7 pr-5 sm:pr-8 rounded-br-[24px] sm:rounded-br-[28px] flex items-center shadow-sm">
              <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group" aria-label="PawStation Home">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white flex items-center justify-center text-black shadow-sm transition-transform duration-200 group-hover:scale-105">
                  <PawIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black fill-current" />
                </div>
                <span className="text-[15px] sm:text-[17px] font-bold tracking-tight uppercase text-white font-sans">
                  PawStation
                </span>
              </Link>
            </div>
            {/* Inverted Fillet Curve to Right of Notch */}
            <div className="text-[var(--frame-bg)]">
              <InverseCorner type="top-left-right" size={24} />
            </div>
          </div>
          {/* Inverted Fillet Curve Below Logo Notch */}
          <div className="absolute left-0 top-[49px] sm:top-[60px] z-30 text-[var(--frame-bg)]">
            <InverseCorner type="top-left-bottom" size={24} />
          </div>

          {/* ─────────────────────────────────────────────────────────
              2. DOCKED TOP-RIGHT NOTCH (GET STARTED CTA)
          ───────────────────────────────────────────────────────── */}
          <div className="absolute top-0 right-0 z-30 flex items-start">
            {/* Inverted Fillet Curve to Left of Notch */}
            <div className="text-[var(--frame-bg)]">
              <InverseCorner type="top-right-left" size={24} />
            </div>
            <div className="bg-[var(--frame-bg)] pt-2.5 sm:pt-3.5 pb-2.5 sm:pb-3.5 pl-5 sm:pl-8 pr-4 sm:pr-6 rounded-bl-[24px] sm:rounded-bl-[28px] flex items-center shadow-sm">
              {user ? (
                <div className="flex items-center gap-2.5">
                  <Link
                    href="/dashboard"
                    className="group inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white text-black hover:bg-[#F2EFE9] text-[12px] sm:text-[13px] font-semibold tracking-tight shadow-sm transition-all duration-200 active:scale-[0.98]"
                  >
                    <span>Dashboard</span>
                    <span className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-black text-white flex items-center justify-center text-[9px] font-bold">
                      ›
                    </span>
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal("signup")}
                  className="group inline-flex items-center gap-2 sm:gap-2.5 px-4.5 sm:px-6 py-1.5 sm:py-2 rounded-full bg-white text-black hover:bg-[#F2EFE9] text-[12px] sm:text-[13px] font-semibold tracking-tight shadow-sm transition-all duration-200 active:scale-[0.98]"
                >
                  <span>Get Started</span>
                  <span className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-black text-white flex items-center justify-center text-[9px] sm:text-[10px] font-bold transition-transform duration-200 group-hover:translate-x-0.5">
                    ›
                  </span>
                </button>
              )}
            </div>
          </div>
          {/* Inverted Fillet Curve Below CTA Notch */}
          <div className="absolute right-0 top-[49px] sm:top-[60px] z-30 text-[var(--frame-bg)]">
            <InverseCorner type="top-right-bottom" size={24} />
          </div>

          {/* ─────────────────────────────────────────────────────────
              3. TOP-CENTER NAVIGATION PILL
          ───────────────────────────────────────────────────────── */}
          <div className="relative z-20 w-full flex items-center justify-center pt-3 sm:pt-4 px-4 flex-shrink-0">
            <nav
              aria-label="Main navigation"
              className="hidden md:flex items-center gap-8 xl:gap-12 px-10 sm:px-14 xl:px-18 py-2.5 sm:py-3 rounded-full border border-black/15 dark:border-white/20 bg-white/40 dark:bg-black/25 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-[14px] font-medium text-neutral-800 dark:text-neutral-200 transition-all"
            >
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="hover:opacity-60 transition-opacity whitespace-nowrap tracking-tight px-1.5"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* ─────────────────────────────────────────────────────────
              4. HERO CONTENT: BOTTOM-ALIGNED CLEAN TYPOGRAPHY + ELEVATED 3D FIGURE
          ───────────────────────────────────────────────────────── */}
          <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 pt-2 sm:pt-4 pb-6 sm:pb-8 lg:pb-12 min-h-0">
            {/* Left Column: Bottom-Aligned, Clean & Non-Bold Typography */}
            <div className="lg:col-span-5 xl:col-span-5 flex flex-col items-start text-left z-20 self-end pb-2 sm:pb-4">
              {/* Headline matching Reference Screenshot (Non-Bold / Regular Weight) */}
              <h1 className="text-[clamp(3.1rem,5.2vw,5.2rem)] xl:text-[clamp(3.5rem,5.6vw,5.8rem)] font-normal tracking-[-0.035em] leading-[1.0] text-neutral-900 dark:text-neutral-100 mb-6 sm:mb-7">
                There is a
                <br />
                <span className="inline-flex items-center gap-3.5 sm:gap-4 my-1.5">
                  <span className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 lg:w-[4.4rem] lg:h-[4.4rem] rounded-2xl sm:rounded-[22px] bg-black/[0.03] dark:bg-white/[0.06] border border-black/15 dark:border-white/20 text-neutral-800 dark:text-neutral-200 shadow-sm flex-shrink-0">
                    <PawOutlineIcon className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9" />
                  </span>
                  <span>Better Way</span>
                </span>
                <br />
                to Nourish.
              </h1>

              {/* High-Contrast CTA Link with Full Underline Spanning Width */}
              <div className="w-full max-w-md sm:max-w-lg mb-2.5">
                <button
                  type="button"
                  onClick={() => user ? (window.location.href = "/dashboard") : openAuthModal("signup")}
                  className="group inline-flex items-center gap-2.5 text-[14.5px] sm:text-[15.5px] font-normal text-neutral-800 dark:text-neutral-200 hover:opacity-75 transition-opacity mb-2.5"
                >
                  <span className="w-5 h-5 min-w-[20px] min-h-[20px] rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-[10px] font-bold shrink-0 transition-transform group-hover:translate-x-0.5">
                    ›
                  </span>
                  <span>Get Started</span>
                </button>
                <div className="w-full h-[1px] bg-black/15 dark:bg-white/15" />
              </div>

              {/* Clean Readable Description */}
              <p className="text-[13.5px] sm:text-[14.5px] leading-relaxed text-neutral-500 dark:text-neutral-400 max-w-md sm:max-w-lg font-normal mt-3">
                PawStation is an open-hardware feline workstation that automates controlled micro-portion kibble dispensing, fresh water replenishment, and gram-level health telemetry to avoid costly vet emergencies.
              </p>
            </div>

            {/* Right Column: Giant, Showy 3D Hardware Sculpture with Hotspots */}
            <div className="lg:col-span-7 xl:col-span-7 relative flex justify-center lg:justify-end items-center select-none w-full self-center lg:-translate-y-4 xl:-translate-y-6 lg:translate-x-6 xl:translate-x-12">
              <motion.div
                style={{
                  rotateX,
                  rotateY,
                  y: sculptureScrollY,
                  transformStyle: "preserve-3d",
                }}
                className="relative w-full max-w-[660px] sm:max-w-[820px] lg:max-w-[1050px] xl:max-w-[1250px] 2xl:max-w-[1380px] aspect-[2872/1656] flex items-center justify-center scale-115 sm:scale-125 lg:scale-[1.4] xl:scale-[1.48] transform-gpu origin-center lg:origin-right"
              >
                {/* Seamless High-Resolution PawStation 3D Hardware Sculpture */}
                <div
                  className="relative w-full h-full flex items-center justify-center"
                  style={{
                    maskImage: "radial-gradient(ellipse 98% 96% at 50% 50%, black 92%, transparent 100%)",
                    WebkitMaskImage: "radial-gradient(ellipse 98% 96% at 50% 50%, black 92%, transparent 100%)",
                  }}
                >
                  {/* Light Mode Figure */}
                  <Image
                    src="/hero-figure-light.webp"
                    alt="PawStation 3D Hardware Architecture - Light Mode"
                    width={2872}
                    height={1656}
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 1260px"
                    className="w-full h-full object-contain pointer-events-none select-none transition-opacity duration-500 ease-in-out dark:opacity-0 opacity-100"
                  />

                  {/* Dark Mode Figure */}
                  <Image
                    src="/hero-figure-dark.webp"
                    alt="PawStation 3D Hardware Architecture - Dark Mode"
                    width={2872}
                    height={1656}
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 1260px"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none transition-opacity duration-500 ease-in-out dark:opacity-100 opacity-0"
                  />
                </div>

                {/* ── INTERACTIVE HOTSPOT PINS ON HARDWARE ─────────────────── */}
                {/* Hotspot 1: Scale Tare Platform (Under the Cat) */}
                <div
                  className="absolute top-[65%] left-[28%] -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                  onMouseEnter={() => setActiveHotspot("scale")}
                  onMouseLeave={() => setActiveHotspot(null)}
                >
                  <span className="absolute -inset-1.5 rounded-full bg-emerald-500/30 animate-ping pointer-events-none" />
                  <span
                    className={`relative block w-3.5 h-3.5 rounded-full border-2 border-white dark:border-black transition-transform duration-200 ${
                      activeHotspot === "scale"
                        ? "scale-125 bg-emerald-400 shadow-[0_0_12px_#10B981]"
                        : "bg-emerald-500 group-hover:scale-125"
                    }`}
                  />
                </div>

                {/* Hotspot 2: Kibble Chute Servo */}
                <div
                  className="absolute top-[52%] left-[54%] -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                  onMouseEnter={() => setActiveHotspot("kibble")}
                  onMouseLeave={() => setActiveHotspot(null)}
                >
                  <span className="absolute -inset-1.5 rounded-full bg-amber-500/30 animate-ping pointer-events-none" />
                  <span
                    className={`relative block w-3.5 h-3.5 rounded-full border-2 border-white dark:border-black transition-transform duration-200 ${
                      activeHotspot === "kibble"
                        ? "scale-125 bg-amber-400 shadow-[0_0_12px_#F59E0B]"
                        : "bg-amber-500 group-hover:scale-125"
                    }`}
                  />
                </div>

                {/* Hotspot 3: Water Alcove Soft-Stop */}
                <div
                  className="absolute top-[68%] left-[68%] -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                  onMouseEnter={() => setActiveHotspot("water")}
                  onMouseLeave={() => setActiveHotspot(null)}
                >
                  <span className="absolute -inset-1.5 rounded-full bg-sky-500/30 animate-ping pointer-events-none" />
                  <span
                    className={`relative block w-3.5 h-3.5 rounded-full border-2 border-white dark:border-black transition-transform duration-200 ${
                      activeHotspot === "water"
                        ? "scale-125 bg-sky-400 shadow-[0_0_12px_#0EA5E9]"
                        : "bg-sky-500 group-hover:scale-125"
                    }`}
                  />
                </div>

                {/* Hotspot 4: Isolated 5V Power Unit */}
                <div
                  className="absolute top-[52%] left-[82%] -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                  onMouseEnter={() => setActiveHotspot("power")}
                  onMouseLeave={() => setActiveHotspot(null)}
                >
                  <span className="absolute -inset-1.5 rounded-full bg-indigo-500/30 animate-ping pointer-events-none" />
                  <span
                    className={`relative block w-3.5 h-3.5 rounded-full border-2 border-white dark:border-black transition-transform duration-200 ${
                      activeHotspot === "power"
                        ? "scale-125 bg-indigo-400 shadow-[0_0_12px_#6366F1]"
                        : "bg-indigo-500 group-hover:scale-125"
                    }`}
                  />
                </div>

                {/* ── FLOATING GLASS LABELS WITH INDEPENDENT BOBBING ─────────── */}
                {/* Floating Glass Label 1: Birch Tare Scale (Top-Left of Cat) */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    duration: 4.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  onMouseEnter={() => setActiveHotspot("scale")}
                  onMouseLeave={() => setActiveHotspot(null)}
                  className={`absolute top-[4%] sm:top-[6%] left-0 sm:left-[2%] lg:left-[1%] px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-[#1C1F2E]/95 backdrop-blur-md border shadow-lg flex items-center gap-2.5 text-[11px] text-[var(--panel-text)] cursor-pointer transition-all duration-300 z-30 ${
                    activeHotspot === "scale"
                      ? "border-emerald-500 ring-2 ring-emerald-500/30 scale-105 shadow-emerald-500/20"
                      : "border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                  <ScaleIcon className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <div className="flex flex-col text-left leading-none">
                    <span className="font-semibold tracking-tight text-neutral-900 dark:text-white">Tare Scale · ±0.1g</span>
                    <span className="text-[9.5px] font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">4.2 kg Presence Active</span>
                  </div>
                </motion.div>

                {/* Floating Glass Label 2: Kibble Chute (Top-Center) */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 4.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.3,
                  }}
                  onMouseEnter={() => setActiveHotspot("kibble")}
                  onMouseLeave={() => setActiveHotspot(null)}
                  className={`hidden sm:flex absolute -top-[4%] sm:-top-[2%] left-[36%] sm:left-[42%] lg:left-[44%] px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-[#1C1F2E]/95 backdrop-blur-md border shadow-lg items-center gap-2.5 text-[11px] text-[var(--panel-text)] cursor-pointer transition-all duration-300 z-30 ${
                    activeHotspot === "kibble"
                      ? "border-amber-500 ring-2 ring-amber-500/30 scale-105 shadow-amber-500/20"
                      : "border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20"
                  }`}
                >
                  <KibbleIcon className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <div className="flex flex-col text-left leading-none">
                    <span className="font-semibold tracking-tight text-neutral-900 dark:text-white">Micro-Portion Chute</span>
                    <span className="text-[9.5px] font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">35g · 85% Full</span>
                  </div>
                </motion.div>

                {/* Floating Glass Label 3: Water Alcove (Bottom-Center) */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    duration: 5.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.6,
                  }}
                  onMouseEnter={() => setActiveHotspot("water")}
                  onMouseLeave={() => setActiveHotspot(null)}
                  className={`absolute bottom-[10%] sm:bottom-[12%] left-[38%] sm:left-[46%] lg:left-[48%] px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-[#1C1F2E]/95 backdrop-blur-md border shadow-lg flex items-center gap-2.5 text-[11px] text-[var(--panel-text)] cursor-pointer transition-all duration-300 z-30 ${
                    activeHotspot === "water"
                      ? "border-sky-500 ring-2 ring-sky-500/30 scale-105 shadow-sky-500/20"
                      : "border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20"
                  }`}
                >
                  <WaterDropIcon className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                  <div className="flex flex-col text-left leading-none">
                    <span className="font-semibold tracking-tight text-neutral-900 dark:text-white">Soft-Stop Alcove</span>
                    <span className="text-[9.5px] font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">720ml Fresh Water</span>
                  </div>
                </motion.div>

                {/* Floating Glass Label 4: Telemetry & Power (Bottom-Right) */}
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 4.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.9,
                  }}
                  onMouseEnter={() => setActiveHotspot("power")}
                  onMouseLeave={() => setActiveHotspot(null)}
                  className={`hidden sm:flex absolute bottom-[3%] sm:bottom-[5%] right-[2%] sm:right-[4%] lg:right-[5%] px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-[#1C1F2E]/95 backdrop-blur-md border shadow-lg items-center gap-2.5 text-[11px] text-[var(--panel-text)] cursor-pointer transition-all duration-300 z-30 ${
                    activeHotspot === "power"
                      ? "border-indigo-500 ring-2 ring-indigo-500/30 scale-105 shadow-indigo-500/20"
                      : "border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse flex-shrink-0" />
                  <SignalIcon className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                  <div className="flex flex-col text-left leading-none">
                    <span className="font-semibold tracking-tight text-neutral-900 dark:text-white">ESP32-S3 Telemetry</span>
                    <span className="text-[9.5px] font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">Dual-Rail 5V Isolation</span>
                  </div>
                </motion.div>

                {/* Hover Details Flyout (Contextual Telemetry Card) */}
                <AnimatePresence>
                  {activeHotspot && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-black/90 dark:bg-white/95 text-white dark:text-black text-[11px] shadow-2xl backdrop-blur-md border border-white/20 dark:border-black/10 pointer-events-none z-40 max-w-xs text-center whitespace-normal font-sans"
                    >
                      {activeHotspot === "scale" && "HX711 24-bit strain gauge with digital low-pass filtering on suspended birch plate."}
                      {activeHotspot === "kibble" && "SG90 anti-jam reverse rotation servo disengages PWM hold duty after dispensing 35g."}
                      {activeHotspot === "water" && "PWM soft-stop pump ramps motor down over 600ms to completely eliminate splash."}
                      {activeHotspot === "power" && "Dual-rail isolated power bank design prevents ESP32 resets during motor draw."}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────
              5. DOCKED BOTTOM-RIGHT NOTCH (THEME TOGGLE PILL)
          ───────────────────────────────────────────────────────── */}
          <div className="absolute bottom-0 right-0 z-30 flex items-end">
            {/* Top Inverted Concave Curve */}
            <div className="absolute -top-[24px] right-0 text-[var(--frame-bg)]">
              <InverseCorner type="notch-top" size={24} />
            </div>

            {/* Left Inverted Concave Curve */}
            <div className="absolute bottom-0 -left-[24px] text-[var(--frame-bg)]">
              <InverseCorner type="notch-left" size={24} />
            </div>

            {/* The Single Global Dark Mode Pill Cutout */}
            <div className="bg-[var(--frame-bg)] pt-2.5 pb-2.5 pl-4 pr-5 rounded-tl-[24px] flex items-center shadow-md">
              <ThemeTogglePill />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
