"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

const IOS_EASE = [0.16, 1, 0.3, 1] as const;

export default function CtaSection() {
  const { user, openAuthModal } = useAuth();

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

            {/* High-Contrast Pill CTA (with > icon) */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => user ? (window.location.href = "/dashboard") : openAuthModal("signup")}
              className="group inline-flex items-center justify-center gap-3 px-8 py-3.5 sm:px-9 sm:py-4 rounded-full bg-white text-black text-[14px] font-bold tracking-tight shadow-[0_4px_20px_rgba(255,255,255,0.2)] hover:bg-[#F2EFE9] transition-colors"
            >
              <span>Get Started</span>
              <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold transition-transform duration-200 group-hover:translate-x-0.5">
                ›
              </span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
