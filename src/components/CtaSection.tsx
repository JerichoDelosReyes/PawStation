"use client";

import { motion } from "framer-motion";
import { CheckIcon } from "./Icons";
import { useAuth } from "@/lib/auth-context";

export default function CtaSection() {
  const { openAuthModal } = useAuth();

  return (
    <section className="py-20 md:py-28 bg-[#0B0F0B] relative overflow-hidden transition-colors duration-200">
      <div className="section-container max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-[32px] bg-[#121813] border border-white/[0.08] relative overflow-hidden p-8 sm:p-12 md:p-16 lg:p-20 text-center shadow-[0_24px_64px_rgba(0,0,0,0.5)]"
        >
          {/* Central ambient lime glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(212,246,108,0.18)_0%,transparent_70%)] blur-[50px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            {/* Centered pill tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-[12px] font-medium text-[#D4F66C] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4F66C]" />
              <span>Zero setup required &middot; Works in your browser instantly</span>
            </div>

            {/* Bold Headline */}
            <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] font-bold tracking-tight text-white leading-[1.12] mb-5 text-balance">
              Ready to experience true feeding clarity?
            </h2>

            {/* Subtitle */}
            <p className="text-[15px] md:text-[17px] text-[#8FA391] max-w-xl mx-auto mb-9 leading-relaxed">
              Join thousands of cat parents who monitor health and automate
              daily meals with PawStation.
            </p>

            {/* Glowing Lime Button */}
            <button
              onClick={() => openAuthModal("signup")}
              className="inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-4 bg-[#D4F66C] text-[#0C120C] hover:bg-[#C6EC57] text-[15px] font-bold tracking-tight shadow-[0_0_28px_rgba(212,246,108,0.35)] transition-all active:scale-[0.98]"
            >
              <span>Launch Workspace Now</span>
              <svg
                className="w-4 h-4 stroke-[2.5]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>

            {/* Value checklist below */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mt-12 pt-8 border-t border-white/[0.08] text-[13px] text-[#8FA391]">
              <div className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-[#D4F66C]" />
                <span>Free &amp; Open Hardware</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-[#D4F66C]" />
                <span>100% Offline Capable</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
