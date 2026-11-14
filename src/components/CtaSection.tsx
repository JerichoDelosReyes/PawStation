"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useScroll, useTransform } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { PawIcon } from "./Icons";

const IOS_EASE = [0.16, 1, 0.3, 1] as const;

export default function CtaSection() {
  const { user, openAuthModal } = useAuth();
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  // Subtle scroll parallax on the CTA container
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const ctaParallaxY = useTransform(scrollYProgress, [0, 1], [24, -24]);
  const ambientGlowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.15, 0.45, 0.15]);

  // Refined, subtle magnetic button displacement coordinates
  const magnetX = useMotionValue(0);
  const magnetY = useMotionValue(0);

  // Taut, premium spring physics for a controlled, Apple-grade magnetic response
  const springX = useSpring(magnetX, { stiffness: 320, damping: 26, mass: 0.12 });
  const springY = useSpring(magnetY, { stiffness: 320, damping: 26, mass: 0.12 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;

    // Subtle magnetic pull - restrained to max 10px with gentle 15% sensitivity
    const maxOffset = 10;
    const pullX = Math.max(-maxOffset, Math.min(maxOffset, deltaX * 0.15));
    const pullY = Math.max(-maxOffset, Math.min(maxOffset, deltaY * 0.15));

    magnetX.set(pullX);
    magnetY.set(pullY);
  };

  const handleMouseLeave = () => {
    magnetX.set(0);
    magnetY.set(0);
  };

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-32 px-6 sm:px-10 lg:px-14 bg-[#111113] text-white border-t border-white/[0.08] overflow-hidden">
      {/* Dynamic ambient scroll illumination */}
      <motion.div
        style={{ opacity: ambientGlowOpacity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-emerald-500/20 via-sky-500/20 to-amber-500/20 blur-[100px] pointer-events-none rounded-full"
      />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          style={{ y: ctaParallaxY }}
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.85, ease: IOS_EASE }}
          className="p-10 sm:p-16 lg:p-20 rounded-[32px] sm:rounded-[40px] bg-[#161619] border border-white/[0.08] ring-1 ring-white/[0.04] text-center relative overflow-hidden shadow-2xl"
        >
          {/* Top-Left PawStation Logo (Illuminates to white when "Get Started" is hovered) */}
          <div
            className={`absolute top-6 left-6 sm:top-8 sm:left-8 transition-all duration-300 pointer-events-none ${
              isButtonHovered ? "opacity-100" : "opacity-35"
            }`}
          >
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                isButtonHovered
                  ? "bg-white text-black border-white shadow-[0_0_18px_rgba(255,255,255,0.35)]"
                  : "bg-white/10 text-white border-white/15"
              }`}
            >
              <PawIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current transition-colors duration-300" />
            </div>
          </div>

          <div className="max-w-2xl mx-auto flex flex-col items-center pt-6 sm:pt-4">
            {/* Headline */}
            <h2 className="text-[clamp(2.3rem,5vw,3.8rem)] font-extrabold tracking-[-0.035em] text-white leading-[1.08] mb-5">
              Ready to experience
              <br />
              true feeding clarity?
            </h2>

            {/* Subtitle */}
            <p className="text-[15px] sm:text-[17px] text-[#9CA3AF] max-w-lg mx-auto mb-9 sm:mb-10 leading-relaxed font-normal">
              Join thousands of cat parents who monitor feline health and automate daily meals with PawStation.
            </p>

            {/* Polished Magnetic Button Interaction Zone */}
            <div
              ref={triggerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="inline-block p-4 -m-4 select-none"
            >
              <motion.button
                type="button"
                style={{ x: springX, y: springY }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => {
                  setIsButtonHovered(false);
                  handleMouseLeave();
                }}
                onClick={() => user ? (window.location.href = "/dashboard") : openAuthModal("signup")}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 sm:px-9 sm:py-4 rounded-full bg-white text-black text-[14px] sm:text-[15px] font-semibold tracking-tight shadow-[0_2px_14px_rgba(255,255,255,0.15)] hover:bg-[#F2EFE9] transition-all cursor-pointer"
              >
                <span>{user ? "Go to Dashboard" : "Get Started"}</span>
                <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold transition-transform duration-200 group-hover:translate-x-0.5">
                  ›
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
