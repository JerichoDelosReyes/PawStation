"use client";

import { useState } from "react";
import Link from "next/link";
import { PawIcon, MenuIcon, CloseIcon } from "./Icons";
import { useAuth } from "@/lib/auth-context";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Ecosystem", href: "/#ecosystem" },
  { label: "Architecture", href: "/#blueprint" },
  { label: "FAQ", href: "/#faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, openAuthModal, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 md:px-8 pt-3 sm:pt-4 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-5 rounded-full bg-white/80 dark:bg-[#141417]/85 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.1] shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] pointer-events-auto transition-colors duration-200">
        {/* Brand Left: Clean White Logo */}
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="PawStation Home">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-black shadow-sm transition-transform group-hover:scale-105">
            <PawIcon className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="text-[14px] font-bold tracking-tight uppercase text-black dark:text-white">
            PawStation
          </span>
        </Link>

        {/* Centered Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[13px] font-medium text-[#4A4A4F] dark:text-[#A1A1AA] hover:text-black dark:hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Action Area */}
        <div className="hidden md:flex items-center gap-3">
          {/* Primary High-Contrast Pill CTA (with > icon) */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-[12px] font-semibold tracking-tight shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
              >
                <span>Dashboard</span>
                <span className="w-4 h-4 rounded-full bg-white dark:bg-black text-black dark:text-white flex items-center justify-center text-[9px] font-bold">
                  ›
                </span>
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="text-[12px] font-medium text-[#666666] dark:text-[#A1A1AA] hover:text-black dark:hover:text-white px-2 py-1 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal("signup")}
              className="group inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-[12px] font-semibold tracking-tight shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <span>Get Started</span>
              <span className="w-4 h-4 rounded-full bg-white dark:bg-black text-black dark:text-white flex items-center justify-center text-[9px] font-bold transition-transform duration-200 group-hover:translate-x-0.5">
                ›
              </span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          {user ? (
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-[11px] font-semibold"
            >
              App
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal("signup")}
              className="px-3.5 py-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-[11px] font-semibold flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <span>›</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation menu"
            className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center text-black dark:text-white"
          >
            {open ? <CloseIcon className="w-4 h-4" /> : <MenuIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden mt-2 p-5 rounded-3xl bg-white/95 dark:bg-[#141417]/95 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.1] shadow-2xl pointer-events-auto">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-[14px] font-medium text-black dark:text-white py-1.5 border-b border-black/[0.04] dark:border-white/[0.06]"
              >
                {link.label}
              </a>
            ))}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openAuthModal("signup");
                }}
                className="w-full py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-[13px] font-semibold flex items-center justify-center gap-2"
              >
                <span>Get Started</span>
                <span>›</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
