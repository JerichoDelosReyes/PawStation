"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

const IOS_EASE = [0.16, 1, 0.3, 1] as const;

interface MaterialItem {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
}

// Row 1: Electronics & Sensors
const ROW_ONE_MATERIALS: MaterialItem[] = [
  {
    id: "esp32",
    name: "ESP32",
    subtitle: "Espressif ESP32 DevKit",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
      </svg>
    ),
  },
  {
    id: "hx711",
    name: "HX711",
    subtitle: "24-bit Load Cell Amplifier",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M7 12h3l2-4 2 8 2-4h1" />
      </svg>
    ),
  },
  {
    id: "load-cell",
    name: "Load Cell",
    subtitle: "10 kg Aluminum Bar",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="10" rx="2" />
        <circle cx="6" cy="12" r="1.5" fill="#94A3B8" />
        <circle cx="18" cy="12" r="1.5" fill="#94A3B8" />
        <path d="M10 10v4M14 10v4" />
      </svg>
    ),
  },
  {
    id: "xy-mos",
    name: "XY-MOS",
    subtitle: "Dual MOSFET Switch Module",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    id: "moisture-sensor",
    name: "Moisture Sensor",
    subtitle: "LM393 Comparator Board",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.5c0 0-6 7.5-6 11.5a6 6 0 0 0 12 0c0-4-6-11.5-6-11.5z" />
        <path d="M10 13v4M14 13v4" />
      </svg>
    ),
  },
  {
    id: "capacitor",
    name: "Capacitor",
    subtitle: "470-1000 µF Electrolytic",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h7M15 12h7" />
        <path d="M9 5v14M15 5v14" />
        <path d="M5 8h2M6 7v2" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "diode",
    name: "Diode",
    subtitle: "1N4007 Flyback Diode",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h6M16 12h6" />
        <path d="M8 6l8 6-8 6V6z" fill="#F43F5E" fillOpacity="0.2" />
        <path d="M16 6v12" />
      </svg>
    ),
  },
];

// Row 2: Actuation, Power & Structure
const ROW_TWO_MATERIALS: MaterialItem[] = [
  {
    id: "water-pump",
    name: "Water Pump",
    subtitle: "3-5V Submersible Micro Pump",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="8" width="14" height="12" rx="3" />
        <path d="M12 3v5M9 3h6" />
        <circle cx="12" cy="14" r="2.5" />
      </svg>
    ),
  },
  {
    id: "servo-motor",
    name: "Servo Motor",
    subtitle: "SG90 Micro Servo",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="6" width="16" height="12" rx="2" />
        <circle cx="15" cy="12" r="3" />
        <path d="M2 9v6M22 9v6" />
      </svg>
    ),
  },
  {
    id: "5v-supply",
    name: "5V Supply",
    subtitle: "Phone Charger / Power Bank",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#84CC16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="16" height="12" rx="2" />
        <path d="M19 10h2v4h-2" />
        <path d="M8 12h4M10 10v4" />
      </svg>
    ),
  },
  {
    id: "breadboard",
    name: "Breadboard",
    subtitle: "Solderless, 830-Point",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <circle cx="6" cy="8" r="0.8" fill="#CBD5E1" />
        <circle cx="10" cy="8" r="0.8" fill="#CBD5E1" />
        <circle cx="14" cy="8" r="0.8" fill="#CBD5E1" />
        <circle cx="18" cy="8" r="0.8" fill="#CBD5E1" />
        <circle cx="6" cy="16" r="0.8" fill="#CBD5E1" />
        <circle cx="10" cy="16" r="0.8" fill="#CBD5E1" />
        <circle cx="14" cy="16" r="0.8" fill="#CBD5E1" />
        <circle cx="18" cy="16" r="0.8" fill="#CBD5E1" />
        <line x1="2" y1="12" x2="22" y2="12" strokeDasharray="2 2" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: "jumper-wires",
    name: "Jumper Wires",
    subtitle: "Male and Female Dupont",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 18c3-8 5-12 8-12s5 4 8 12" />
        <circle cx="4" cy="18" r="1.5" fill="#EAB308" />
        <circle cx="20" cy="18" r="1.5" fill="#EAB308" />
      </svg>
    ),
  },
  {
    id: "usb-cable",
    name: "USB Cable",
    subtitle: "Data-Capable USB Cable",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="19" r="2" />
        <path d="M12 17V7M9 7h6M9 3h6v4H9z" />
        <path d="M6 10l6-3 6 3" />
      </svg>
    ),
  },
  {
    id: "frame",
    name: "Frame",
    subtitle: "Cardboard, Bottles and Tubing",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
      </svg>
    ),
  },
];

interface ScrollableMaterialRowProps {
  items: MaterialItem[];
  direction: "left" | "right";
  speed?: number;
  ariaLabel: string;
}

function ScrollableMaterialRow({
  items,
  direction,
  speed = 0.75,
  ariaLabel,
}: ScrollableMaterialRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstSetRef = useRef<HTMLDivElement>(null);
  const singleSetWidthRef = useRef<number>(0);
  const hasInitializedRef = useRef<boolean>(false);

  const isPausedRef = useRef<boolean>(false);
  const isHoveredRef = useRef<boolean>(false);
  const isPointerDownRef = useRef<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const startScrollLeftRef = useRef<number>(0);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isGrabbing, setIsGrabbing] = useState(false);

  // Wrap check: keeps scrollLeft centered between [1 * singleWidth, 3 * singleWidth]
  const checkBoundaryWrap = useCallback((container: HTMLDivElement) => {
    const singleWidth = singleSetWidthRef.current;
    if (singleWidth <= 0) return;

    while (container.scrollLeft >= singleWidth * 3) {
      container.scrollLeft -= singleWidth;
    }
    while (container.scrollLeft <= singleWidth * 1) {
      container.scrollLeft += singleWidth;
    }
  }, []);

  // Measure single set width and initialize position
  useEffect(() => {
    if (!firstSetRef.current || !containerRef.current) return;

    const updateDimensions = () => {
      if (!firstSetRef.current || !containerRef.current) return;
      const w = firstSetRef.current.offsetWidth;
      if (w > 0) {
        singleSetWidthRef.current = w;
        if (!hasInitializedRef.current) {
          // Initialize at 1.5x width (Row 1) or 2.2x width (Row 2) so generous runway exists both ways
          containerRef.current.scrollLeft = direction === "right" ? w * 2.2 : w * 1.5;
          hasInitializedRef.current = true;
          setIsReady(true);
        }
      }
    };

    updateDimensions();

    const observer = new ResizeObserver(updateDimensions);
    observer.observe(firstSetRef.current);

    return () => {
      observer.disconnect();
    };
  }, [direction]);

  const scheduleResume = useCallback(() => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      if (!isHoveredRef.current && !isPointerDownRef.current) {
        isPausedRef.current = false;
      }
    }, 1400);
  }, []);

  // Auto-scroll loop using requestAnimationFrame
  useEffect(() => {
    let animId: number;
    let lastTime: number | null = null;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    const step = (time: number) => {
      if (lastTime === null) lastTime = time;
      const delta = Math.min(time - lastTime, 64);
      lastTime = time;

      const container = containerRef.current;
      if (!isPausedRef.current && container && singleSetWidthRef.current > 0) {
        const px = (speed * delta) / 16.67;
        if (direction === "left") {
          container.scrollLeft += px;
        } else {
          container.scrollLeft -= px;
        }
        checkBoundaryWrap(container);
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animId);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, [direction, speed, checkBoundaryWrap]);

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    isPausedRef.current = true;
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    if (!isPointerDownRef.current) {
      scheduleResume();
    }
  };

  const handleWheel = () => {
    isPausedRef.current = true;
    scheduleResume();
  };

  const handleTouchStart = () => {
    isPausedRef.current = true;
  };

  const handleTouchEnd = () => {
    scheduleResume();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const container = containerRef.current;
    if (!container) return;

    isPointerDownRef.current = true;
    isDraggingRef.current = false;
    startXRef.current = e.clientX;
    startScrollLeftRef.current = container.scrollLeft;
    isPausedRef.current = true;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    const container = containerRef.current;
    if (!container) return;

    const dx = e.clientX - startXRef.current;
    if (!isDraggingRef.current && Math.abs(dx) > 3) {
      isDraggingRef.current = true;
      setIsGrabbing(true);
      try {
        container.setPointerCapture(e.pointerId);
      } catch {
        // Fallback
      }
    }

    if (isDraggingRef.current) {
      container.scrollLeft = startScrollLeftRef.current - dx;
      checkBoundaryWrap(container);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    setIsGrabbing(false);

    const container = containerRef.current;
    if (container) {
      try {
        if (container.hasPointerCapture(e.pointerId)) {
          container.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Fallback
      }
    }

    isDraggingRef.current = false;
    scheduleResume();
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    checkBoundaryWrap(container);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      isPausedRef.current = true;
      container.scrollBy({ left: -320, behavior: "smooth" });
      scheduleResume();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      isPausedRef.current = true;
      container.scrollBy({ left: 320, behavior: "smooth" });
      scheduleResume();
    }
  };

  const handleNavClick = (navDir: "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;
    isPausedRef.current = true;
    const delta = navDir === "left" ? -320 : 320;
    container.scrollBy({ left: delta, behavior: "smooth" });
    scheduleResume();
  };

  return (
    <div className="group/row relative w-full">
      {/* Subtle Left Arrow (Visible on Desktop Hover) */}
      <button
        type="button"
        onClick={() => handleNavClick("left")}
        aria-label={`Scroll ${ariaLabel} left`}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1A1A1E]/85 hover:bg-[#26262C] border border-white/20 text-white flex items-center justify-center shadow-xl backdrop-blur-md opacity-0 group-hover/row:opacity-100 focus:opacity-100 transition-all duration-200 hover:scale-105 active:scale-95 select-none hidden sm:flex"
      >
        <span className="text-lg leading-none font-semibold">‹</span>
      </button>

      {/* Main Horizontally Scrollable Container */}
      <div
        ref={containerRef}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        className={`relative w-full overflow-x-auto overflow-y-hidden py-3 no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overscroll-x-contain select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-white/20 transition-opacity duration-300 ${
          isReady ? "opacity-100" : "opacity-0"
        } ${isGrabbing ? "cursor-grabbing" : "cursor-grab"}`}
      >
        <div className="flex w-max">
          {Array.from({ length: 6 }).map((_, setIdx) => (
            <div
              key={setIdx}
              ref={setIdx === 0 ? firstSetRef : undefined}
              className="flex gap-5 sm:gap-6 pr-5 sm:pr-6 shrink-0"
            >
              {items.map((item) => (
                <div
                  key={`${setIdx}-${item.id}`}
                  className="relative w-[240px] sm:w-[280px] h-[130px] sm:h-[140px] rounded-[24px] bg-[#18181B] border border-white/10 hover:border-white/30 hover:scale-[1.03] active:scale-[0.98] hover:shadow-lg hover:shadow-black/40 hover:z-20 transition-all duration-200 flex flex-col justify-center items-center px-6 shadow-sm shrink-0 select-none will-change-transform"
                >
                  <div className="opacity-95 hover:opacity-100 transition-opacity flex items-center gap-3 pointer-events-none">
                    {item.icon}
                    <span className="text-[20px] sm:text-[22px] font-bold tracking-tight font-sans text-white">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#6B7280] mt-2 text-center pointer-events-none">
                    {item.subtitle}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Subtle Right Arrow (Visible on Desktop Hover) */}
      <button
        type="button"
        onClick={() => handleNavClick("right")}
        aria-label={`Scroll ${ariaLabel} right`}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1A1A1E]/85 hover:bg-[#26262C] border border-white/20 text-white flex items-center justify-center shadow-xl backdrop-blur-md opacity-0 group-hover/row:opacity-100 focus:opacity-100 transition-all duration-200 hover:scale-105 active:scale-95 select-none hidden sm:flex"
      >
        <span className="text-lg leading-none font-semibold">›</span>
      </button>
    </div>
  );
}

export default function EcosystemBand() {
  const { openAuthModal } = useAuth();

  return (
    <section
      id="ecosystem"
      className="relative pt-16 sm:pt-20 pb-20 sm:pb-28 px-6 sm:px-12 lg:px-16 bg-[#161618] text-white overflow-hidden select-none"
    >
      <div id="materials" className="absolute -top-24" />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.85, ease: IOS_EASE }}
        className="max-w-7xl mx-auto"
      >
        {/* Large "Our Materials" Title on Left */}
        <h2 className="text-[clamp(2.8rem,5.5vw,4.5rem)] font-extrabold tracking-[-0.035em] text-white leading-none mb-6">
          Our Materials
        </h2>

        {/* Full-Width Hairline Divider Beneath Headline */}
        <div className="w-full h-[1px] bg-white/15 mb-10 sm:mb-12" />

        {/* Right-Offset Column (Starts ~1/3 across) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 mb-12 sm:mb-14">
          <div className="lg:col-span-4" />
          <div className="lg:col-span-8 max-w-xl">
            <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#9CA3AF] mb-5 font-normal">
              PawStation is built from low-cost, easy-to-find parts. An ESP32 reads the scale and the water sensor, turns the feeder, runs the pump, and reports everything to this website over Wi-Fi. No special equipment needed, just a handful of modules and a bit of wiring.
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => openAuthModal("signup")}
                className="group inline-flex items-center gap-2.5 text-[14px] font-semibold text-white hover:opacity-85 transition-opacity"
              >
                <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-bold transition-transform duration-200 group-hover:scale-110">
                  ›
                </span>
                <span>Get Started</span>
              </button>

              <div className="inline-flex items-center gap-2 text-[12px] font-mono text-[#6B7280]">
                <span>←</span>
                <span>Scroll or drag horizontally</span>
                <span>→</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────
          TWO-ROW INFINITE HORIZONTAL SCROLLABLE MARQUEE (100VW)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden flex flex-col gap-2 sm:gap-3 py-2 sm:py-4">
        {/* Soft edge fade masks for seamless entry/exit */}
        <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-[#161618] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-[#161618] to-transparent z-10 pointer-events-none" />

        {/* Row 1: Sensors & Core Electronics (Drifting Left, Freely Scrollable) */}
        <ScrollableMaterialRow
          items={ROW_ONE_MATERIALS}
          direction="left"
          speed={0.75}
          ariaLabel="Sensors and Core Electronics"
        />

        {/* Row 2: Actuation, Power & Structure (Drifting Right, Freely Scrollable) */}
        <ScrollableMaterialRow
          items={ROW_TWO_MATERIALS}
          direction="right"
          speed={0.75}
          ariaLabel="Actuation, Power and Structure"
        />
      </div>
    </section>
  );
}
