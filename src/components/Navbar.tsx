"use client";

import { useState } from "react";
import Link from "next/link";
import { PawIcon, MenuIcon, CloseIcon, SunIcon, MoonIcon } from "./Icons";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/lib/auth-context";

const navLinks = [
  { label: "Features", href: "/#hero-features" },
  { label: "Architecture", href: "/#why-cat-care" },
  { label: "Specs", href: "/#hero-features" },
  { label: "FAQ", href: "/#faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, openAuthModal, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F0B]/85 backdrop-blur-md border-b border-white/[0.06] transition-colors duration-200">
      <div className="section-container flex items-center justify-between h-16">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-[#131A14] border border-white/[0.08] flex items-center justify-center text-[#D4F66C] shadow-[0_0_12px_rgba(212,246,108,0.15)] transition-transform group-hover:scale-105">
            <PawIcon className="w-4 h-4 text-[#D4F66C]" />
          </div>
          <span className="text-[16px] font-bold tracking-tight text-white">
            PawStation
          </span>
        </Link>

        {/* Centered Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link, idx) => (
            <a
              key={`${link.label}-${idx}`}
              href={link.href}
              className="text-[13px] font-medium text-[#8FA391] hover:text-white transition-colors"
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
            className="p-2 rounded-full border border-white/[0.08] bg-[#131A14] text-[#8FA391] hover:text-white hover:bg-[#1A251C] transition-all active:scale-[0.95]"
          >
            {theme === "dark" ? (
              <SunIcon className="w-4 h-4 text-[#D4F66C]" />
            ) : (
              <MoonIcon className="w-4 h-4 text-[#8FA391]" />
            )}
          </button>

          {/* Primary Action Button */}
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-[#D4F66C] text-[#0C120C] text-[13px] font-bold tracking-tight shadow-[0_0_18px_rgba(212,246,108,0.25)] hover:bg-[#C6EC57] transition-all active:scale-[0.98]"
              >
                Dashboard
              </Link>
              <button
                onClick={signOut}
                className="text-[12px] font-medium text-[#8FA391] hover:text-white px-2 py-1.5 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal("login")}
              className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-[#D4F66C] text-[#0C120C] text-[13px] font-bold tracking-tight shadow-[0_0_18px_rgba(212,246,108,0.25)] hover:bg-[#C6EC57] transition-all active:scale-[0.98]"
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
            className="p-2 rounded-full border border-white/[0.08] bg-[#131A14] text-[#8FA391]"
          >
            {theme === "dark" ? (
              <SunIcon className="w-4 h-4 text-[#D4F66C]" />
            ) : (
              <MoonIcon className="w-4 h-4 text-[#8FA391]" />
            )}
          </button>

          <button
            onClick={() => setOpen(!open)}
            className="p-2 -mr-2 text-white"
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
        <div className="md:hidden bg-[#0B0F0B] border-t border-white/[0.08]">
          <div className="section-container py-4 flex flex-col gap-3">
            {navLinks.map((link, idx) => (
              <a
                key={`m-${link.label}-${idx}`}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-[15px] font-medium text-white py-2"
              >
                {link.label}
              </a>
            ))}

            {user ? (
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/[0.08]">
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#D4F66C] text-[#0C120C] text-[13px] font-bold text-center"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setOpen(false);
                  }}
                  className="text-[13px] font-medium text-[#8FA391] py-2 text-center"
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
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#D4F66C] text-[#0C120C] text-[13px] font-bold text-center mt-2"
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
