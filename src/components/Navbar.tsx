"use client";

import { useState } from "react";
import Link from "next/link";
import { PawIcon, MenuIcon, CloseIcon, SunIcon, MoonIcon } from "./Icons";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/lib/auth-context";

const navLinks = [
  { label: "Features", href: "/#why-cat-care" },
  { label: "Architecture", href: "/#why-cat-care" },
  { label: "Specs", href: "/#why-cat-care" },
  { label: "FAQ", href: "/#faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, openAuthModal, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-canvas-light/85 dark:bg-canvas-dark/85 backdrop-blur-md border-b border-[#D8E4F2] dark:border-white/[0.08] transition-colors duration-200">
      <div className="section-container flex items-center justify-between h-16">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-white dark:bg-navy-card border border-[#D8E4F2] dark:border-white/[0.08] flex items-center justify-center text-periwinkle shadow-[0_2px_8px_rgba(74,114,184,0.15)] transition-transform group-hover:scale-105">
            <PawIcon className="w-4 h-4 text-periwinkle" />
          </div>
          <span className="text-[16px] font-bold tracking-tight text-navy dark:text-white">
            PawStation
          </span>
        </Link>

        {/* Centered Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link, idx) => (
            <a
              key={`${link.label}-${idx}`}
              href={link.href}
              className="text-[13px] font-medium text-navy-muted dark:text-navy-lightMuted hover:text-navy dark:hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side controls */}
        <div className="hidden md:flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            className="p-2 rounded-full border border-[#D8E4F2] dark:border-white/[0.08] bg-white dark:bg-navy-card text-navy-muted dark:text-navy-lightMuted hover:text-navy dark:hover:text-white hover:bg-canvas-light dark:hover:bg-[#1A263D] transition-all active:scale-[0.95]"
          >
            {theme === "dark" ? (
              <SunIcon className="w-4 h-4 text-periwinkle" />
            ) : (
              <MoonIcon className="w-4 h-4 text-navy-muted" />
            )}
          </button>

          {/* Primary Action Button */}
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-periwinkle hover:bg-periwinkle-hover text-white text-[13px] font-semibold tracking-tight shadow-[0_2px_12px_rgba(74,114,184,0.25)] transition-all active:scale-[0.98]"
              >
                Dashboard
              </Link>
              <button
                onClick={signOut}
                className="text-[12px] font-medium text-navy-muted dark:text-navy-lightMuted hover:text-navy dark:hover:text-white px-2 py-1.5 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal("login")}
              className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-periwinkle hover:bg-periwinkle-hover text-white text-[13px] font-semibold tracking-tight shadow-[0_2px_12px_rgba(74,114,184,0.25)] transition-all active:scale-[0.98]"
            >
              Log In
            </button>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            className="p-2 rounded-full border border-[#D8E4F2] dark:border-white/[0.08] bg-white dark:bg-navy-card text-navy-muted dark:text-navy-lightMuted"
          >
            {theme === "dark" ? (
              <SunIcon className="w-4 h-4 text-periwinkle" />
            ) : (
              <MoonIcon className="w-4 h-4 text-navy-muted" />
            )}
          </button>

          <button
            onClick={() => setOpen(!open)}
            className="p-2 -mr-2 text-navy dark:text-white"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? (
              <CloseIcon className="w-5 h-5" />
            ) : (
              <MenuIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-canvas-light dark:bg-canvas-dark border-t border-[#D8E4F2] dark:border-white/[0.08]">
          <div className="section-container py-4 flex flex-col gap-3">
            {navLinks.map((link, idx) => (
              <a
                key={`m-${link.label}-${idx}`}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-[15px] font-medium text-navy dark:text-white py-2"
              >
                {link.label}
              </a>
            ))}

            {user ? (
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-[#D8E4F2] dark:border-white/[0.08]">
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-periwinkle hover:bg-periwinkle-hover text-white text-[13px] font-semibold text-center"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setOpen(false);
                  }}
                  className="text-[13px] font-medium text-navy-muted dark:text-navy-lightMuted py-2 text-center"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setOpen(false);
                  openAuthModal("login");
                }}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-periwinkle hover:bg-periwinkle-hover text-white text-[13px] font-semibold text-center mt-2"
              >
                Log In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
