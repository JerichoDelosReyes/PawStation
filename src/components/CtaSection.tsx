"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

const IOS_EASE = [0.16, 1, 0.3, 1] as const;

export default function CtaSection() {
  const { user, openAuthModal } = useAuth();
  const triggerRef = useRef<HTMLDivElement>(null);

  // Magnetic button displacement coordinates
  const magnetX = useMotionValue(0);
  const magnetY = useMotionValue(0);

  // Physics spring for organic magnetic pull and rebound
  const springX = useSpring(magnetX, { stiffness: 220, damping: 18, mass: 0.18 });
  const springY = useSpring(magnetY, { stiffness: 220, damping: 18, mass: 0.18 });

  // Optional subtle inner icon/text parallax offset
  const textX = useSpring(magnetX, { stiffness: 300, damping: 24, mass: 0.1 });
  const textY = useSpring(magnetY, { stiffness: 300, damping: 24, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;

    // Magnetic pull factor - button smoothly tracks cursor position up to max 32px
    const maxOffset = 32;
    const pullX = Math.max(-maxOffset, Math.min(maxOffset, deltaX * 0.38));
    const pullY = Math.max(-maxOffset, Math.min(maxOffset, deltaY * 0.38));

    magnetX.set(pullX);
    magnetY.set(pullY);
  };

  const handleMouseLeave = () => {
    magnetX.set(0);
    magnetY.set(0);
  };

  return (
    <section className="py-24 sm:py-32 px-6 sm:px-10 lg:px-14 bg-[#111113] text-white border-t border-white/[0.08]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 36, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.85, ease: IOS_EASE }}
          className="p-10 sm:p-16 rounded-[36px] bg-[#161619] border border-white/10 text-center relative overflow-hidden shadow-2xl"
        >
          <div className="max-w-2xl mx-auto">
            {/* Headline */}
            <h2 className="text-[clamp(2.2rem,5vw,3.6rem)] font-extrabold tracking-tight text-white leading-[1.08] mb-6">
              Ready to experience true feeding clarity?
            </h2>

            {/* Subtitle */}
            <p className="text-[15px] sm:text-[16px] text-[#9CA3AF] max-w-lg mx-auto mb-10 leading-relaxed">
              Join thousands of cat parents who monitor feline health and automate daily meals with PawStation.
            </p>

            {/* Magnetic Button Interaction Zone */}
            <div
              ref={triggerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="inline-block p-8 -m-8 select-none"
            >
              <motion.button
                type="button"
                style={{ x: springX, y: springY }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => user ? (window.location.href = "/dashboard") : openAuthModal("signup")}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 sm:px-9 sm:py-4 rounded-full bg-white text-black text-[14px] font-bold tracking-tight shadow-[0_4px_24px_rgba(255,255,255,0.22)] hover:shadow-[0_8px_32px_rgba(255,255,255,0.35)] hover:bg-[#F2EFE9] transition-all cursor-pointer"
              >
                <motion.span style={{ x: textX, y: textY }} className="inline-flex items-center gap-3">
                  <span>{user ? "Go to Dashboard" : "Get Started"}</span>
                  <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold transition-transform duration-200 group-hover:translate-x-0.5">
                    ›
                  </span>
                </motion.span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
