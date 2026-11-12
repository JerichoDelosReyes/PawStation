"use client";

import { useState } from "react";
import Link from "next/link";
import { PawIcon, CloseIcon } from "./Icons";

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
            className="p-1 rounded-lg hover:bg-white/10 text-[#9CA3AF] hover:text-white"
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

  return (
    <>
      <footer className="py-16 px-6 sm:px-10 lg:px-14 bg-[#111113] text-white border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-black">
              <PawIcon className="w-3.5 h-3.5" />
            </div>
            <span className="text-[14px] font-bold tracking-tight uppercase">PawStation</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-[13px] text-[#9CA3AF]">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#ecosystem" className="hover:text-white transition-colors">
              Ecosystem
            </a>
            <a href="#blueprint" className="hover:text-white transition-colors">
              Blueprint
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
            <button
              type="button"
              onClick={() => setPrivacyOpen(true)}
              className="hover:text-white transition-colors"
            >
              Privacy
            </button>
            <button
              type="button"
              onClick={() => setTermsOpen(true)}
              className="hover:text-white transition-colors"
            >
              Terms
            </button>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 text-[12px] font-mono text-[#6B7280]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span>MQTTS 8883 Nominal</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-white/5 text-center text-[12px] text-[#6B7280]">
          © {new Date().getFullYear()} PawStation. Open Hardware Feline Care Workstation.
        </div>
      </footer>

      {/* Privacy Modal */}
      <Modal title="Privacy Policy" isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)}>
        <p>
          PawStation stores your cat feeding and weight metrics locally on your private Supabase database.
          No video feeds or biometric information are shared with third parties.
        </p>
      </Modal>

      {/* Terms Modal */}
      <Modal title="Terms of Service" isOpen={termsOpen} onClose={() => setTermsOpen(false)}>
        <p>
          PawStation is an open hardware and software project. Hardware implementations must follow food-grade
          safety standards for materials in contact with kibble and water.
        </p>
      </Modal>
    </>
  );
}
