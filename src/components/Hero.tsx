"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";
import { PawIcon, PawOutlineIcon, ScaleIcon, KibbleIcon, WaterDropIcon } from "./Icons";
import { useAuth } from "@/lib/auth-context";
import InverseCorner from "./InverseCorner";
import ThemeTogglePill from "./ThemeTogglePill";

// Reusable iOS Fluid Timing & Spring Physics
const IOS_EASE = [0.16, 1, 0.3, 1] as const;

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Ecosystem", href: "/#ecosystem" },
  { label: "Architecture", href: "/#blueprint" },
  { label: "FAQ", href: "/#faq" },
];

export default function Hero() {
  const { user, openAuthModal } = useAuth();
  const heroRef = useRef<HTMLElement>(null);

  // iOS Fluid Scroll Physics (Spring-Damped Scroll Parallax)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 26,
    restDelta: 0.001,
  });

  const heroScale = useTransform(smoothProgress, [0, 1], [1, 0.975]);
  const heroY = useTransform(smoothProgress, [0, 1], [0, 36]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.9], [1, 0.88]);
  const sculptureScrollY = useTransform(smoothProgress, [0, 1], [0, 48]);

  // Subtle Tactile Mouse Parallax on the 3D sculpture
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 20 });
  const rotateX = useTransform(springY, [-0.5, 0.5], ["4deg", "-4deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-5deg", "5deg"]);

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
    <section ref={heroRef} className="relative w-full bg-[var(--frame-bg)] text-white select-none">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP BAR WITH INTEGRATED CREAM NAV TAB (FULL-WIDTH 100VW)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative w-full px-6 sm:px-10 lg:px-14 pt-4 sm:pt-5 pb-0 flex items-center justify-between z-20">
        {/* Brand Left: Clean White Logo */}
        <Link href="/" className="flex items-center gap-3 group" aria-label="PawStation Home">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-black shadow-[0_2px_10px_rgba(255,255,255,0.18)] transition-transform duration-300 group-hover:scale-105">
            <PawIcon className="w-4 h-4 text-black fill-current" />
          </div>
          <span className="text-[17px] font-bold tracking-tight uppercase text-white font-sans">
            PawStation
          </span>
        </Link>

        {/* Center: Interlocking Cream Nav Tongue (Desktop) */}
        <div className="hidden lg:flex items-end relative -mb-[1px]">
          {/* Left Inverted Concave Fillet Curve */}
          <div className="absolute -left-[20px] bottom-0 text-[var(--panel-bg)]">
            <InverseCorner type="top-left-tab" size={20} />
          </div>

          {/* Raised Cream Tab */}
          <div className="bg-[var(--panel-bg)] pt-2.5 px-6 rounded-t-[22px] flex items-center justify-center shadow-sm">
            <div className="px-5 py-1.5 rounded-full border border-black/10 dark:border-white/10 flex items-center gap-7 text-[13px] font-medium text-[var(--panel-text)] bg-[var(--panel-bg)]">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="hover:opacity-60 transition-opacity"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Right Inverted Concave Fillet Curve */}
          <div className="absolute -right-[20px] bottom-0 text-[var(--panel-bg)]">
            <InverseCorner type="top-right-tab" size={20} />
          </div>
        </div>

        {/* Right Controls: High-Contrast "Get Started" Button (with > icon) */}
        <div className="flex items-center">
          {user ? (
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2.5 px-5 py-2 sm:py-2.5 rounded-full bg-white text-black hover:bg-[#F2EFE9] text-[13px] font-semibold tracking-tight shadow-[0_2px_14px_rgba(255,255,255,0.18)] transition-all duration-200 active:scale-[0.98]"
            >
              <span>Get Started</span>
              <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold transition-transform duration-200 group-hover:translate-x-0.5">
                ›
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal("signup")}
              className="group inline-flex items-center gap-2.5 px-5 py-2 sm:py-2.5 rounded-full bg-white text-black hover:bg-[#F2EFE9] text-[13px] font-semibold tracking-tight shadow-[0_2px_14px_rgba(255,255,255,0.18)] transition-all duration-200 active:scale-[0.98]"
            >
              <span>Get Started</span>
              <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold transition-transform duration-200 group-hover:translate-x-0.5">
                ›
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CREAM HERO PANEL (INTERLOCKING CANVAS WITH iOS PHYSICS)
      ───────────────────────────────────────────────────────────── */}
      <motion.div
        style={{
          scale: heroScale,
          y: heroY,
          opacity: heroOpacity,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative mx-2 sm:mx-4 lg:mx-6 mt-2 bg-[var(--panel-bg)] text-[var(--panel-text)] rounded-[32px] sm:rounded-[38px] overflow-hidden min-h-[82vh] lg:min-h-[86vh] flex flex-col justify-between pt-10 sm:pt-14 pb-8 sm:pb-12 px-6 sm:px-12 lg:px-16 transition-colors duration-200"
      >
        {/* Soft Warm Cream Ambient Glow Behind Right Visual */}
        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[700px] h-[550px] bg-[radial-gradient(ellipse_at_center,rgba(240,215,170,0.35)_0%,rgba(240,215,170,0.1)_40%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(74,114,184,0.12)_0%,transparent_70%)] blur-[90px] pointer-events-none" />

        {/* Hero Content Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
          {/* Left Column: Bold Headline & Fluid Reveal */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: IOS_EASE }}
            className="lg:col-span-6 flex flex-col items-start text-left z-20"
          >
            {/* Headline with tight tracking and inline paw chip */}
            <h1 className="text-[clamp(2.7rem,7.5vw,5.4rem)] font-extrabold tracking-[-0.04em] leading-[1.02] text-[var(--panel-text)] mb-6 sm:mb-8">
              There is a
              <br />
              <span className="inline-flex items-center gap-2 sm:gap-3.5">
                <span className="inline-flex items-center justify-center w-11 h-11 sm:w-15 sm:h-15 rounded-2xl bg-[#EDE7DA] dark:bg-white/[0.08] border border-black/10 dark:border-white/10 text-black dark:text-white shadow-sm">
                  <PawOutlineIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                </span>
                <span>Better Way</span>
              </span>
              <br />
              to Nourish.
            </h1>

            {/* High-Contrast "Get Started" Link with thin underline */}
            <div className="w-full max-w-sm mb-5">
              <button
                type="button"
                onClick={() => user ? (window.location.href = "/dashboard") : openAuthModal("signup")}
                className="group inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--panel-text)] hover:opacity-70 transition-opacity mb-2"
              >
                <span className="w-4 h-4 rounded-full bg-[var(--panel-text)] text-[var(--panel-bg)] flex items-center justify-center text-[9px] font-bold transition-transform group-hover:scale-110">
                  ›
                </span>
                <span>Get Started</span>
              </button>
              <div className="w-full h-[1px] bg-black/15 dark:bg-white/15" />
            </div>

            {/* Small Muted Description */}
            <p className="text-[12px] sm:text-[13px] leading-relaxed text-[var(--panel-muted)] max-w-sm font-normal">
              PawStation is an open-hardware feline workstation that automates controlled micro-portion kibble dispensing, fresh water replenishment, and gram-level health telemetry to avoid costly vet emergencies.
            </p>
          </motion.div>

          {/* Right Column: Large Device Visual with iOS-Style Parallax */}
          <div className="lg:col-span-6 relative flex justify-center items-center lg:-mr-8 select-none">
            <motion.div
              style={{
                rotateX,
                rotateY,
                y: sculptureScrollY,
                transformStyle: "preserve-3d",
              }}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease: IOS_EASE, delay: 0.1 }}
              className="relative w-full max-w-[560px] lg:max-w-[680px] aspect-[4/3] flex items-center justify-center"
            >
              {/* High-Resolution PawStation 3D Hardware Sculpture */}
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src="/pawstation-hero-3d.jpg"
                  alt="PawStation 3D Hardware Architecture"
                  width={680}
                  height={680}
                  priority
                  className="object-contain mix-blend-multiply dark:mix-blend-normal transition-opacity duration-300"
                />
              </div>

              {/* Floating Glass Label 1: Telemetry Live (Top-Left) */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: [0, -4, 0] }}
                transition={{
                  opacity: { duration: 0.8, delay: 0.3 },
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.2 },
                }}
                className="absolute top-2 left-4 sm:left-6 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-[#1C1C20]/80 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-lg flex items-center gap-2 text-[11px] font-mono font-medium text-[var(--panel-text)] pointer-events-none"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>Telemetry Live · PWST-MKII</span>
              </motion.div>

              {/* Floating Glass Label 2: Kibble 85% (Bottom-Left) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: [0, -5, 0] }}
                transition={{
                  opacity: { duration: 0.8, delay: 0.4 },
                  y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
                }}
                className="absolute bottom-6 left-2 sm:left-4 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-[#1C1C20]/80 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-lg flex items-center gap-2 text-[11px] font-medium text-[var(--panel-text)] pointer-events-none"
              >
                <KibbleIcon className="w-3.5 h-3.5 text-amber-500" />
                <span>Kibble: 85% Full</span>
              </motion.div>

              {/* Floating Glass Label 3: Water 720ml (Bottom-Right) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: [0, -6, 0] }}
                transition={{
                  opacity: { duration: 0.8, delay: 0.5 },
                  y: { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
                }}
                className="absolute bottom-14 right-2 sm:right-6 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-[#1C1C20]/80 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-lg flex items-center gap-2 text-[11px] font-medium text-[var(--panel-text)] pointer-events-none"
              >
                <WaterDropIcon className="w-3.5 h-3.5 text-sky-500" />
                <span>Fresh Water: 720ml</span>
              </motion.div>

              {/* Floating Glass Label 4: Tare Scale (Top-Right) */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: [0, -4, 0] }}
                transition={{
                  opacity: { duration: 0.8, delay: 0.6 },
                  y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 },
                }}
                className="absolute top-8 right-4 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-[#1C1C20]/80 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-lg flex items-center gap-2 text-[11px] font-mono text-[var(--panel-text)] pointer-events-none"
              >
                <ScaleIcon className="w-3.5 h-3.5 text-[#10B981]" />
                <span>±0.1g HX711 Tare</span>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. DOCKED BOTTOM-RIGHT NOTCH (HOUSES THE SINGLE DARK MODE TOGGLE)
        ───────────────────────────────────────────────────────────── */}
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
      </motion.div>
    </section>
  );
}
