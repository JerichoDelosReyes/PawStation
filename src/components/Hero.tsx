"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform, useScroll, AnimatePresence } from "framer-motion";
import { PawIcon, PawOutlineIcon, ScaleIcon, KibbleIcon, WaterDropIcon, SignalIcon, MenuIcon, CloseIcon } from "./Icons";
import { useAuth } from "@/lib/auth-context";
import InverseCorner from "./InverseCorner";
import ThemeTogglePill from "./ThemeTogglePill";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Materials", href: "/#materials" },
  { label: "Architecture", href: "/#blueprint" },
  { label: "FAQ", href: "/#faq" },
];

const IOS_EASE = [0.16, 1, 0.3, 1] as const;

function MagneticHeroButton({
  children,
  onClick,
  className,
  isAnchor = false,
  href,
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<any>) => void;
  className?: string;
  isAnchor?: boolean;
  href?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 340, damping: 28, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 340, damping: 28, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    // Micro-magnetic pull for a refined, precision-engineered feel (max ±6px)
    const pullX = Math.max(-6, Math.min(6, deltaX * 0.12));
    const pullY = Math.max(-5, Math.min(5, deltaY * 0.12));
    x.set(pullX);
    y.set(pullY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (isAnchor) {
    return (
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="flex-1 sm:flex-initial"
      >
        <motion.a
          href={href}
          onClick={onClick}
          style={{ x: springX, y: springY }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className={className}
        >
          {children}
        </motion.a>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="flex-1 sm:flex-initial"
    >
      <motion.button
        type="button"
        onClick={onClick}
        style={{ x: springX, y: springY }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className={className}
      >
        {children}
      </motion.button>
    </div>
  );
}

export default function Hero() {
  const { user, openAuthModal, signOut } = useAuth();
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive hover activation with a micro-buffer (60ms) to feel instant yet avoid jitter
  const handleHotspotEnter = (id: string) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Snappy 60ms buffer: feels instantaneous while debouncing sub-frame jitter
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveHotspot(id);
    }, 60);
  };

  const handleHotspotLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    // Snappy 80ms grace period on boundary exit
    leaveTimeoutRef.current = setTimeout(() => {
      setActiveHotspot(null);
    }, 80);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    };
  }, []);
  const [activeNav, setActiveNav] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, label: string) => {
    setActiveNav(label);
    if (href.startsWith("/#") || href.startsWith("#")) {
      const targetId = href.replace("/#", "").replace("#", "");
      const elem = document.getElementById(targetId);
      if (elem) {
        e.preventDefault();
        window.history.pushState(null, "", `#${targetId}`);
        const yOffset = -24;
        const y = elem.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  };

  // Apple-grade scroll parallax & depth as the user descends the landing page
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroScale = useTransform(heroScroll, [0, 1], [1, 0.982]);
  const heroOpacity = useTransform(heroScroll, [0, 0.85, 1], [1, 0.96, 0.8]);
  const figureParallaxY = useTransform(heroScroll, [0, 1], [0, 48]);
  const textParallaxY = useTransform(heroScroll, [0, 1], [0, -22]);

  // Subtle 3D mouse parallax with zero layout reflows (window metrics)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 90, damping: 24 });
  const springY = useSpring(mouseY, { stiffness: 90, damping: 24 });
  const rotateX = useTransform(springY, [-0.5, 0.5], ["2deg", "-2deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-3deg", "3deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window === "undefined") return;
    const xPct = e.clientX / window.innerWidth - 0.5;
    const yPct = e.clientY / window.innerHeight - 0.5;
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
      className="relative w-full min-h-[100dvh] lg:h-[100dvh] bg-[var(--frame-bg)] text-white select-none p-2 sm:p-3 lg:p-4 flex flex-col justify-between overflow-x-hidden lg:overflow-hidden"
    >
      {/* ─────────────────────────────────────────────────────────────
          ALL-BLACK MOBILE HEADER BAR (< lg)
      ───────────────────────────────────────────────────────────── */}
      <div className="lg:hidden w-full bg-[var(--frame-bg)] pb-2 flex flex-col z-40 relative">
        <div className="w-full flex items-center justify-between px-2 py-1">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 group" aria-label="PawStation Home">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-black shadow-sm">
              <PawIcon className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-[14px] font-bold tracking-tight uppercase text-white font-sans">
              PawStation
            </span>
          </Link>

          {/* Right Action: Quick CTA + Hamburger */}
          <div className="flex items-center gap-2">
            {user ? (
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-full bg-white text-black text-[11px] font-semibold flex items-center gap-1 shadow-sm"
              >
                <span>Dashboard</span>
                <span className="text-[9px] font-bold">›</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="px-3.5 py-1.5 rounded-full bg-white text-black text-[11.5px] font-semibold flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
              >
                <span>Log In</span>
                <span className="text-[9px] font-bold">›</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white border border-white/10 transition-all cursor-pointer"
            >
              {mobileMenuOpen ? <CloseIcon className="w-4 h-4" /> : <MenuIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-full left-2 right-2 z-50 mt-1 px-3 py-3 bg-[#161618]/95 backdrop-blur-2xl rounded-2xl border border-white/15 flex flex-col gap-1 shadow-2xl"
            >
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    handleNavClick(e, link.href, link.label);
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-xl text-[14px] font-medium text-neutral-200 hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          UNIFIED HERO CARD (CHASSIS + SEAMLESS INTEGRATED HEADER + BODY)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative w-full flex-1 flex flex-col min-h-0">
        {/* ── UNIFIED CREAM CANVAS WITH DOCKED CORNER NOTCHES ─────── */}
        <motion.div
          style={{
            scale: heroScale,
            opacity: heroOpacity,
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full flex-1 min-h-0 bg-[var(--panel-bg)] text-[var(--panel-text)] rounded-[20px] sm:rounded-[28px] lg:rounded-none lg:rounded-bl-[38px] flex flex-col justify-start lg:justify-between transition-colors duration-200 overflow-visible lg:overflow-hidden origin-bottom"
        >
          {/* ─────────────────────────────────────────────────────────
              1. DOCKED TOP-LEFT NOTCH (BRAND LOGO - DESKTOP ONLY)
          ───────────────────────────────────────────────────────── */}
          <div className="hidden lg:flex absolute top-0 left-0 z-30 items-start">
            <div className="bg-[var(--frame-bg)] pt-2 pb-2 pl-3.5 pr-4 sm:pt-3 sm:pb-3 sm:pl-7 sm:pr-8 rounded-br-[20px] sm:rounded-br-[28px] flex items-center">
              <Link href="/" className="flex items-center gap-2 sm:gap-3 group" aria-label="PawStation Home">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white flex items-center justify-center text-black shadow-sm transition-transform duration-200 group-hover:scale-105">
                  <PawIcon className="w-3 h-3 sm:w-4 sm:h-4 text-black fill-current" />
                </div>
                <span className="text-[14px] sm:text-[17px] font-bold tracking-tight uppercase text-white font-sans">
                  PawStation
                </span>
              </Link>
            </div>
            {/* Inverted Fillet Curve to Right of Notch */}
            <div className="text-[var(--frame-bg)]">
              <InverseCorner type="top-left-right" size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          {/* Inverted Fillet Curve Below Logo Notch */}
          <div className="hidden lg:block absolute left-0 top-[40px] sm:top-[56px] z-30 text-[var(--frame-bg)]">
            <InverseCorner type="top-left-bottom" size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          {/* ─────────────────────────────────────────────────────────
              2. DOCKED TOP-RIGHT NOTCH (GET STARTED CTA - DESKTOP ONLY)
          ───────────────────────────────────────────────────────── */}
          <div className="hidden lg:flex absolute top-0 right-0 z-30 items-start">
            {/* Inverted Fillet Curve to Left of Notch */}
            <div className="text-[var(--frame-bg)]">
              <InverseCorner type="top-right-left" size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="bg-[var(--frame-bg)] pt-2 pb-2 pl-4 pr-3.5 sm:pt-3 sm:pb-3 sm:pl-8 sm:pr-6 rounded-bl-[20px] sm:rounded-bl-[28px] flex items-center">
              {user ? (
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <Link
                    href="/dashboard"
                    className="group inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white text-black hover:bg-[#F2EFE9] text-[11.5px] sm:text-[13px] font-semibold tracking-tight shadow-sm transition-all duration-200 active:scale-[0.98]"
                  >
                    <span>Dashboard</span>
                    <span className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-black text-white flex items-center justify-center text-[9px] font-bold">
                      ›
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={signOut}
                    className="text-[11px] sm:text-[12px] font-medium text-neutral-400 hover:text-white px-1 sm:px-1.5 py-1 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal("login")}
                  className="group inline-flex items-center gap-1.5 sm:gap-2.5 px-3.5 sm:px-6 py-1.5 sm:py-2 rounded-full bg-white text-black hover:bg-[#F2EFE9] text-[11.5px] sm:text-[13px] font-semibold tracking-tight shadow-sm transition-all duration-200 active:scale-[0.98]"
                >
                  <span>Log In</span>
                  <span className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-black text-white flex items-center justify-center text-[8.5px] sm:text-[10px] font-bold transition-transform duration-200 group-hover:translate-x-0.5">
                    ›
                  </span>
                </button>
              )}
            </div>
          </div>
          {/* Inverted Fillet Curve Below CTA Notch */}
          <div className="hidden lg:block absolute right-0 top-[40px] sm:top-[56px] z-30 text-[var(--frame-bg)]">
            <InverseCorner type="top-right-bottom" size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          {/* ─────────────────────────────────────────────────────────
              3. TOP-CENTER NAVIGATION PILL (RESPONSIVE LG+ TO AVOID NOTCH COLLISION)
          ───────────────────────────────────────────────────────── */}
          <div className="relative z-20 w-full flex items-center justify-center pt-3 sm:pt-4 px-4 flex-shrink-0 pointer-events-none">
            <nav
              aria-label="Main navigation"
              className="hidden lg:flex items-center gap-1.5 xl:gap-2 px-3 xl:px-4 py-1.5 xl:py-2 rounded-full border border-black/15 dark:border-white/20 bg-white/45 dark:bg-black/30 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-[13px] xl:text-[14px] font-medium text-neutral-800 dark:text-neutral-200 transition-all pointer-events-auto"
            >
              {navLinks.map((link) => {
                const isActive = activeNav === link.label;
                return (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href, link.label)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.91 }}
                    transition={{ type: "spring", stiffness: 450, damping: 24 }}
                    className={`relative px-3.5 xl:px-4 py-1.5 rounded-full transition-colors duration-200 whitespace-nowrap tracking-tight select-none ${
                      isActive
                        ? "text-neutral-950 dark:text-white font-semibold"
                        : "text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="hero-nav-active-pill"
                        className="absolute inset-0 rounded-full bg-black/10 dark:bg-white/15 shadow-sm -z-10"
                        transition={{ type: "spring", stiffness: 420, damping: 30 }}
                      />
                    )}
                    {link.label}
                  </motion.a>
                );
              })}
            </nav>
          </div>

          {/* ─────────────────────────────────────────────────────────
              4. HERO CONTENT: CENTER-ALIGNED CLEAN TYPOGRAPHY + ELEVATED 3D FIGURE
          ───────────────────────────────────────────────────────── */}
          <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-8 xl:gap-12 w-full max-w-[1720px] mx-auto px-5 sm:px-10 lg:px-14 pt-6 sm:pt-8 lg:pt-0 pb-8 sm:pb-10 lg:pb-0 min-h-0 items-center">
            {/* Left Column: Center-Aligned on Mobile, Left-Aligned on Desktop */}
            <motion.div
              style={{ y: textParallaxY }}
              className="lg:col-span-5 xl:col-span-5 flex flex-col items-center text-center lg:items-start lg:text-left z-20 self-center pb-1 sm:pb-4"
            >
              {/* Responsive Headline with Fluid Scaling */}
              <h1 className="text-center lg:text-left text-[clamp(2.35rem,6.8vw,3.6rem)] sm:text-[clamp(3.2rem,5.2vw,4.8rem)] lg:text-[clamp(3.5rem,5.6vw,5.6rem)] xl:text-[clamp(3.9rem,6.2vw,6.4rem)] font-normal tracking-[-0.035em] leading-[1.0] text-neutral-900 dark:text-neutral-100 mb-5 sm:mb-6">
                There is a
                <br />
                <span className="inline-flex items-center justify-center gap-2.5 sm:gap-4 my-1 sm:my-1.5">
                  <span className="inline-flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 lg:w-[4.4rem] lg:h-[4.4rem] xl:w-[5.2rem] xl:h-[5.2rem] rounded-xl sm:rounded-2xl lg:rounded-[22px] bg-black/[0.03] dark:bg-white/[0.06] border border-black/15 dark:border-white/20 text-neutral-800 dark:text-neutral-200 shadow-sm flex-shrink-0">
                    <PawOutlineIcon className="w-5 h-5 sm:w-7 sm:h-7 lg:w-9 lg:h-9 xl:w-10 xl:h-10" />
                  </span>
                  <span>Better Way</span>
                </span>
                <br />
                to Nourish.
              </h1>

              {/* Innovative Unified Hardware Capsule Dock (Fluid Responsive & Magnetic) */}
              <div className="w-full sm:w-auto max-w-md sm:max-w-none mb-5 sm:mb-6 flex justify-center lg:justify-start">
                <div className="flex flex-row items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.07] border border-black/10 dark:border-white/15 backdrop-blur-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
                  {/* Primary Action Button: Get Started / Dashboard */}
                  <MagneticHeroButton
                    onClick={() => user ? (window.location.href = "/dashboard") : openAuthModal("signup")}
                    className="group relative flex items-center justify-center gap-1.5 min-[380px]:gap-2 sm:gap-2.5 px-3.5 min-[380px]:px-4.5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[12px] min-[380px]:text-[13px] sm:text-[14px] font-semibold tracking-tight shadow-[0_2px_10px_rgba(0,0,0,0.2)] dark:shadow-[0_2px_12px_rgba(255,255,255,0.2)] hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors w-full sm:w-auto cursor-pointer whitespace-nowrap"
                  >
                    <span>{user ? "Go to Dashboard" : "Get Started"}</span>
                    <span className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-white/20 dark:bg-black/15 flex items-center justify-center text-[9px] sm:text-[10px] font-bold transition-transform duration-200 group-hover:translate-x-0.5">
                      ›
                    </span>
                  </MagneticHeroButton>

                  {/* Secondary Action Button: Explore Features */}
                  <MagneticHeroButton
                    isAnchor
                    href="#features"
                    onClick={(e) => handleNavClick(e, "#features", "Features")}
                    className="group relative flex items-center justify-center gap-1.5 min-[380px]:gap-2 px-3 min-[380px]:px-4 sm:px-5.5 py-2.5 sm:py-3 rounded-full hover:bg-black/[0.06] dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 text-[12px] min-[380px]:text-[13px] sm:text-[14px] font-medium tracking-tight transition-colors w-full sm:w-auto cursor-pointer whitespace-nowrap"
                  >
                    <span>Explore Features</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-1 opacity-60 group-hover:opacity-100 text-[12px] sm:text-[14px]">
                      →
                    </span>
                  </MagneticHeroButton>
                </div>
              </div>

              {/* Clean Readable Description */}
              <p className="text-[13.5px] sm:text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-md sm:max-w-lg font-normal text-center lg:text-left">
                PawStation is an open-hardware feline workstation that automates controlled micro-portion kibble dispensing, fresh water replenishment, and gram-level health telemetry to avoid costly vet emergencies.
              </p>
            </motion.div>

            {/* Right Column: Giant, Showy 3D Hardware Sculpture with Hotspots */}
            <motion.div
              style={{ y: figureParallaxY }}
              className="lg:col-span-7 xl:col-span-7 relative flex justify-center lg:justify-end items-center select-none w-full self-center lg:translate-x-6 xl:translate-x-12 mt-4 sm:mt-6 lg:mt-0"
            >
              {/* Contextual Telemetry Flyout (Placed outside scaled 3D canvas so it is always horizontally centered and never clipped) */}
              <AnimatePresence>
                {activeHotspot && (
                  <div className="absolute -top-6 sm:-top-8 lg:top-auto lg:-bottom-12 xl:-bottom-14 inset-x-0 flex justify-center px-3 sm:px-4 pointer-events-none z-50">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="px-4 py-2.5 rounded-xl bg-black/95 dark:bg-white text-white dark:text-black text-[11px] sm:text-[12px] font-medium shadow-2xl backdrop-blur-md border border-white/20 dark:border-black/10 max-w-sm text-center leading-snug font-sans pointer-events-none"
                    >
                      {activeHotspot === "scale" && "HX711 24-bit strain gauge with digital low-pass filtering on suspended birch plate."}
                      {activeHotspot === "kibble" && "SG90 anti-jam reverse rotation servo disengages PWM hold duty after dispensing 35g."}
                      {activeHotspot === "water" && "PWM soft-stop pump ramps motor down over 600ms to completely eliminate splash."}
                      {activeHotspot === "power" && "Dual-rail isolated power bank design prevents ESP32 resets during motor draw."}
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              <motion.div
                style={{
                  rotateX,
                  rotateY,
                  transformStyle: "preserve-3d",
                }}
                className="relative w-full max-w-[480px] sm:max-w-[640px] lg:max-w-[1050px] xl:max-w-[1250px] 2xl:max-w-[1380px] aspect-[2872/1656] flex items-center justify-center scale-100 lg:scale-[1.38] xl:scale-[1.48] transform-gpu origin-center lg:origin-right"
              >
                {/* Seamless High-Resolution PawStation 3D Hardware Sculpture */}
                <div className="relative w-full h-full flex items-center justify-center">
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
                <button
                  type="button"
                  aria-label="Scale Tare Platform Hotspot"
                  onClick={() => setActiveHotspot(activeHotspot === "scale" ? null : "scale")}
                  onMouseEnter={() => handleHotspotEnter("scale")}
                  onMouseLeave={handleHotspotLeave}
                  className="absolute top-[65%] left-[28%] -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group p-3 -m-3 rounded-full flex items-center justify-center focus:outline-none"
                >
                  <span className="absolute inset-1.5 rounded-full bg-emerald-500/30 animate-ping pointer-events-none" />
                  <span
                    className={`relative block w-3.5 h-3.5 rounded-full border-2 border-white dark:border-black transition-transform duration-150 pointer-events-none ${
                      activeHotspot === "scale"
                        ? "scale-125 bg-emerald-400 shadow-[0_0_12px_#10B981]"
                        : "bg-emerald-500 group-hover:scale-125"
                    }`}
                  />
                </button>

                {/* Hotspot 2: Kibble Chute Servo */}
                <button
                  type="button"
                  aria-label="Kibble Chute Hotspot"
                  onClick={() => setActiveHotspot(activeHotspot === "kibble" ? null : "kibble")}
                  onMouseEnter={() => handleHotspotEnter("kibble")}
                  onMouseLeave={handleHotspotLeave}
                  className="absolute top-[52%] left-[54%] -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group p-3 -m-3 rounded-full flex items-center justify-center focus:outline-none"
                >
                  <span className="absolute inset-1.5 rounded-full bg-amber-500/30 animate-ping pointer-events-none" />
                  <span
                    className={`relative block w-3.5 h-3.5 rounded-full border-2 border-white dark:border-black transition-transform duration-150 pointer-events-none ${
                      activeHotspot === "kibble"
                        ? "scale-125 bg-amber-400 shadow-[0_0_12px_#F59E0B]"
                        : "bg-amber-500 group-hover:scale-125"
                    }`}
                  />
                </button>

                {/* Hotspot 3: Water Alcove Soft-Stop */}
                <button
                  type="button"
                  aria-label="Water Alcove Hotspot"
                  onClick={() => setActiveHotspot(activeHotspot === "water" ? null : "water")}
                  onMouseEnter={() => handleHotspotEnter("water")}
                  onMouseLeave={handleHotspotLeave}
                  className="absolute top-[68%] left-[68%] -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group p-3 -m-3 rounded-full flex items-center justify-center focus:outline-none"
                >
                  <span className="absolute inset-1.5 rounded-full bg-sky-500/30 animate-ping pointer-events-none" />
                  <span
                    className={`relative block w-3.5 h-3.5 rounded-full border-2 border-white dark:border-black transition-transform duration-150 pointer-events-none ${
                      activeHotspot === "water"
                        ? "scale-125 bg-sky-400 shadow-[0_0_12px_#0EA5E9]"
                        : "bg-sky-500 group-hover:scale-125"
                    }`}
                  />
                </button>

                {/* Hotspot 4: Isolated 5V Power Unit */}
                <button
                  type="button"
                  aria-label="Power Unit Hotspot"
                  onClick={() => setActiveHotspot(activeHotspot === "power" ? null : "power")}
                  onMouseEnter={() => handleHotspotEnter("power")}
                  onMouseLeave={handleHotspotLeave}
                  className="absolute top-[52%] left-[82%] -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group p-3 -m-3 rounded-full flex items-center justify-center focus:outline-none"
                >
                  <span className="absolute inset-1.5 rounded-full bg-indigo-500/30 animate-ping pointer-events-none" />
                  <span
                    className={`relative block w-3.5 h-3.5 rounded-full border-2 border-white dark:border-black transition-transform duration-150 pointer-events-none ${
                      activeHotspot === "power"
                        ? "scale-125 bg-indigo-400 shadow-[0_0_12px_#6366F1]"
                        : "bg-indigo-500 group-hover:scale-125"
                    }`}
                  />
                </button>

                {/* ── FLOATING GLASS LABELS WITH INDEPENDENT BOBBING ─────────── */}
                {/* Floating Glass Label 1: Birch Tare Scale (Top-Left of Cat) */}
                <div
                  className="animate-float absolute top-[22%] sm:top-[30%] left-[3%] sm:left-[7%] lg:left-[8%] z-30"
                >
                  <button
                    type="button"
                    onClick={() => setActiveHotspot(activeHotspot === "scale" ? null : "scale")}
                    onMouseEnter={() => handleHotspotEnter("scale")}
                    onMouseLeave={handleHotspotLeave}
                    className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/95 dark:bg-[#1C1F2E]/95 border shadow-md flex items-center gap-1.5 sm:gap-2.5 text-[9.5px] sm:text-[11px] text-[var(--panel-text)] cursor-pointer transition-all duration-150 transform-gpu select-none focus:outline-none ${
                      activeHotspot === "scale"
                        ? "border-emerald-500 ring-2 ring-emerald-500/30 scale-105 shadow-emerald-500/20"
                        : "border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0 pointer-events-none" />
                    <ScaleIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500 flex-shrink-0 pointer-events-none" />
                    <div className="flex flex-col text-left leading-none pointer-events-none">
                      <span className="font-semibold tracking-tight text-neutral-900 dark:text-white">Tare Scale · ±0.1g</span>
                      <span className="text-[8.5px] sm:text-[9.5px] font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">4.2 kg Presence Active</span>
                    </div>
                  </button>
                </div>

                {/* Floating Glass Label 2: Kibble Chute (Top-Center) */}
                <div
                  className="animate-float-delayed hidden sm:block absolute -top-[4%] sm:-top-[2%] left-[36%] sm:left-[42%] lg:left-[44%] z-30"
                >
                  <button
                    type="button"
                    onClick={() => setActiveHotspot(activeHotspot === "kibble" ? null : "kibble")}
                    onMouseEnter={() => handleHotspotEnter("kibble")}
                    onMouseLeave={handleHotspotLeave}
                    className={`px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-[#1C1F2E]/95 border shadow-md flex items-center gap-2.5 text-[11px] text-[var(--panel-text)] cursor-pointer transition-all duration-150 transform-gpu select-none focus:outline-none ${
                      activeHotspot === "kibble"
                        ? "border-amber-500 ring-2 ring-amber-500/30 scale-105 shadow-amber-500/20"
                        : "border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20"
                    }`}
                  >
                    <KibbleIcon className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 pointer-events-none" />
                    <div className="flex flex-col text-left leading-none pointer-events-none">
                      <span className="font-semibold tracking-tight text-neutral-900 dark:text-white">Micro-Portion Chute</span>
                      <span className="text-[9.5px] font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">35g · 85% Full</span>
                    </div>
                  </button>
                </div>

                {/* Floating Glass Label 3: Water Alcove (Bottom-Center) */}
                <div
                  className="animate-float absolute bottom-[8%] sm:bottom-[12%] left-[30%] sm:left-[46%] lg:left-[48%] z-30"
                >
                  <button
                    type="button"
                    onClick={() => setActiveHotspot(activeHotspot === "water" ? null : "water")}
                    onMouseEnter={() => handleHotspotEnter("water")}
                    onMouseLeave={handleHotspotLeave}
                    className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/95 dark:bg-[#1C1F2E]/95 border shadow-md flex items-center gap-1.5 sm:gap-2.5 text-[9.5px] sm:text-[11px] text-[var(--panel-text)] cursor-pointer transition-all duration-150 transform-gpu select-none focus:outline-none ${
                      activeHotspot === "water"
                        ? "border-sky-500 ring-2 ring-sky-500/30 scale-105 shadow-sky-500/20"
                        : "border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20"
                    }`}
                  >
                    <WaterDropIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-500 flex-shrink-0 pointer-events-none" />
                    <div className="flex flex-col text-left leading-none pointer-events-none">
                      <span className="font-semibold tracking-tight text-neutral-900 dark:text-white">Soft-Stop Alcove</span>
                      <span className="text-[8.5px] sm:text-[9.5px] font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">720ml Fresh Water</span>
                    </div>
                  </button>
                </div>

                {/* Floating Glass Label 4: Telemetry & Power (Bottom-Right) */}
                <div
                  className="animate-float-delayed hidden sm:block absolute bottom-[3%] sm:bottom-[5%] right-[2%] sm:right-[4%] lg:right-[5%] z-30"
                >
                  <button
                    type="button"
                    onClick={() => setActiveHotspot(activeHotspot === "power" ? null : "power")}
                    onMouseEnter={() => handleHotspotEnter("power")}
                    onMouseLeave={handleHotspotLeave}
                    className={`px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-[#1C1F2E]/95 border shadow-md flex items-center gap-2.5 text-[11px] text-[var(--panel-text)] cursor-pointer transition-all duration-150 transform-gpu select-none focus:outline-none ${
                      activeHotspot === "power"
                        ? "border-indigo-500 ring-2 ring-indigo-500/30 scale-105 shadow-indigo-500/20"
                        : "border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse flex-shrink-0 pointer-events-none" />
                    <SignalIcon className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 pointer-events-none" />
                    <div className="flex flex-col text-left leading-none pointer-events-none">
                      <span className="font-semibold tracking-tight text-neutral-900 dark:text-white">ESP32-S3 Telemetry</span>
                      <span className="text-[9.5px] font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">Dual-Rail 5V Isolation</span>
                    </div>
                  </button>
                </div>


              </motion.div>
            </motion.div>
          </div>

          {/* ─────────────────────────────────────────────────────────
              5. DOCKED BOTTOM-RIGHT NOTCH (THEME TOGGLE PILL)
          ───────────────────────────────────────────────────────── */}
          <div className="absolute bottom-0 right-0 z-30 flex items-end">
            {/* Top Inverted Concave Curve */}
            <div className="absolute -top-[20px] sm:-top-[24px] right-0 text-[var(--frame-bg)]">
              <InverseCorner type="notch-top" size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            {/* Left Inverted Concave Curve */}
            <div className="absolute bottom-0 -left-[20px] sm:-left-[24px] text-[var(--frame-bg)]">
              <InverseCorner type="notch-left" size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            {/* The Single Global Dark Mode Pill Cutout */}
            <div className="bg-[var(--frame-bg)] pt-2 pb-2 pl-3.5 pr-4 sm:pt-2.5 sm:pb-2.5 sm:pl-4 sm:pr-5 rounded-tl-[20px] sm:rounded-tl-[24px] flex items-center">
              <ThemeTogglePill />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
