"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { PawIcon, CloseIcon } from "./Icons";

const IOS_EASE = [0.16, 1, 0.3, 1] as const;

/* Bespoke SVG social icons matching the reference design */
function FacebookIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}


function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function LinkedInIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="4.5" />
      <path d="M7 10.5v6.5" />
      <circle cx="7" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
      <path d="M11 17v-4.2a2.3 2.3 0 0 1 4.6 0V17" />
      <path d="M11 12.8V10.5" />
    </svg>
  );
}

interface ModalProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

function Modal({ title, children, isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#161619] rounded-2xl border border-white/10 max-w-xl w-full p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <h3 className="text-[16px] font-bold text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-[#9CA3AF] hover:text-white transition-colors"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="text-[13px] text-[#9CA3AF] leading-relaxed space-y-3">{children}</div>
      </div>
    </div>
  );
}

export default function Footer() {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  // Subtle scroll parallax on the cat footprints
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"],
  });
  const footprintY = useTransform(scrollYProgress, [0, 1], [-30, 20]);

  return (
    <>
      <footer ref={footerRef} className="relative w-full bg-black text-white py-16 sm:py-20 lg:py-24 px-6 border-t border-white/[0.06] overflow-hidden">
        {/* Subtle Low-Opacity Cat Footprints Ambient Background with Scroll Drift */}
        <motion.div
          style={{ y: footprintY }}
          className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-[0.065]"
        >
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="cat-footprint-pattern"
                width="220"
                height="220"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(-15)"
              >
                {/* Walking Track 1: Left Paw (Enlarged) */}
                <g transform="translate(45, 150) rotate(-16) scale(1.15)" fill="currentColor">
                  <ellipse cx="7" cy="5.5" rx="2.2" ry="2.8" />
                  <ellipse cx="12" cy="4" rx="2" ry="2.5" />
                  <ellipse cx="17" cy="5.5" rx="2.2" ry="2.8" />
                  <ellipse cx="4.5" cy="10" rx="2" ry="2.5" />
                  <ellipse cx="19.5" cy="10" rx="2" ry="2.5" />
                  <path d="M12 22c-4 0-7-3.5-7-6.5 0-2 1.5-3.5 3-4.5 1-.7 2.5-1 4-1s3 .3 4 1c1.5 1 3 2.5 3 4.5 0 3-3 6.5-7 6.5z" />
                </g>
                {/* Walking Track 1: Right Paw (Enlarged) */}
                <g transform="translate(145, 55) rotate(18) scale(1.15)" fill="currentColor">
                  <ellipse cx="7" cy="5.5" rx="2.2" ry="2.8" />
                  <ellipse cx="12" cy="4" rx="2" ry="2.5" />
                  <ellipse cx="17" cy="5.5" rx="2.2" ry="2.8" />
                  <ellipse cx="4.5" cy="10" rx="2" ry="2.5" />
                  <ellipse cx="19.5" cy="10" rx="2" ry="2.5" />
                  <path d="M12 22c-4 0-7-3.5-7-6.5 0-2 1.5-3.5 3-4.5 1-.7 2.5-1 4-1s3 .3 4 1c1.5 1 3 2.5 3 4.5 0 3-3 6.5-7 6.5z" />
                </g>
                {/* Walking Track 2: Secondary Paws (Enlarged) */}
                <g transform="translate(190, 175) rotate(-32) scale(0.85)" fill="currentColor">
                  <ellipse cx="7" cy="5.5" rx="2.2" ry="2.8" />
                  <ellipse cx="12" cy="4" rx="2" ry="2.5" />
                  <ellipse cx="17" cy="5.5" rx="2.2" ry="2.8" />
                  <ellipse cx="4.5" cy="10" rx="2" ry="2.5" />
                  <ellipse cx="19.5" cy="10" rx="2" ry="2.5" />
                  <path d="M12 22c-4 0-7-3.5-7-6.5 0-2 1.5-3.5 3-4.5 1-.7 2.5-1 4-1s3 .3 4 1c1.5 1 3 2.5 3 4.5 0 3-3 6.5-7 6.5z" />
                </g>
                <g transform="translate(25, 30) rotate(-8) scale(0.85)" fill="currentColor">
                  <ellipse cx="7" cy="5.5" rx="2.2" ry="2.8" />
                  <ellipse cx="12" cy="4" rx="2" ry="2.5" />
                  <ellipse cx="17" cy="5.5" rx="2.2" ry="2.8" />
                  <ellipse cx="4.5" cy="10" rx="2" ry="2.5" />
                  <ellipse cx="19.5" cy="10" rx="2" ry="2.5" />
                  <path d="M12 22c-4 0-7-3.5-7-6.5 0-2 1.5-3.5 3-4.5 1-.7 2.5-1 4-1s3 .3 4 1c1.5 1 3 2.5 3 4.5 0 3-3 6.5-7 6.5z" />
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cat-footprint-pattern)" className="text-white" />
          </svg>
        </motion.div>

        {/* Foreground Content with Scroll Entrance */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: IOS_EASE }}
          className="relative z-10 max-w-4xl mx-auto flex flex-col items-center justify-center text-center"
        >
          {/* Row 1: White Brand Logo Badge & Name */}
          <Link
            href="/"
            className="inline-flex items-center gap-3 group transition-transform duration-200 hover:scale-[1.02]"
            aria-label="PawStation Home"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white flex items-center justify-center text-black shadow-[0_2px_14px_rgba(255,255,255,0.18)] transition-transform duration-200 group-hover:scale-105">
              <PawIcon className="w-5 h-5 fill-black" />
            </div>
            <span className="text-[18px] sm:text-[19px] font-bold tracking-tight text-white">
              PawStation
            </span>
          </Link>

          {/* Row 2: Navigation Links */}
          <nav className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-x-7 sm:gap-x-9 gap-y-3 text-[14px] sm:text-[15px] font-medium text-white/80">
            <Link
              href="/"
              className="hover:text-white transition-colors duration-200"
            >
              Homepage
            </Link>
            <a
              href="/#features"
              className="hover:text-white transition-colors duration-200"
            >
              Features
            </a>
            <a
              href="/#materials"
              className="hover:text-white transition-colors duration-200"
            >
              Materials
            </a>
            <a
              href="/#blueprint"
              className="hover:text-white transition-colors duration-200"
            >
              Architecture
            </a>
            <a
              href="/#faq"
              className="hover:text-white transition-colors duration-200"
            >
              FAQ
            </a>
            <button
              type="button"
              onClick={() => setPrivacyOpen(true)}
              className="hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Privacy
            </button>
            <button
              type="button"
              onClick={() => setTermsOpen(true)}
              className="hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Terms
            </button>
          </nav>

          {/* Row 3: Social Media Icons */}
          <div className="mt-8 sm:mt-10 flex items-center justify-center gap-7 sm:gap-8 text-white/80">
            <a
              href="https://www.facebook.com/jerZer0"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-200 hover:scale-110 transform"
              aria-label="Facebook"
            >
              <FacebookIcon className="w-5 h-5" />
            </a>
            <a
              href="https://www.instagram.com/jdrmtl_/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-200 hover:scale-110 transform"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/jerichodelosreyes/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-200 hover:scale-110 transform"
              aria-label="LinkedIn"
            >
              <LinkedInIcon className="w-5 h-5" />
            </a>
          </div>
        </motion.div>
      </footer>

      {/* Privacy Policy Modal */}
      <Modal title="Privacy Policy" isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)}>
        <p>
          PawStation stores your cat feeding and weight metrics locally on your private database.
          No video feeds or biometric information are shared with third parties.
        </p>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal title="Terms of Service" isOpen={termsOpen} onClose={() => setTermsOpen(false)}>
        <p>
          PawStation is an open hardware and software project. Hardware implementations must follow food-grade
          safety standards for materials in contact with kibble and water.
        </p>
      </Modal>
    </>
  );
}
