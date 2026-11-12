"use client";

import { useState } from "react";
import Link from "next/link";
import { PawIcon, MenuIcon, CloseIcon, SunIcon, MoonIcon } from "./Icons";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/lib/auth-context";

const navLinks = [
  { label: "Hardware Architecture", href: "/#why-cat-care" },
  { label: "Technical FAQ", href: "/#faq" },
  { label: "Support", href: "/#support-contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, openAuthModal, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-md border-b border-black/[0.06] dark:border-white/[0.08] transition-colors duration-200">
      <div className="section-container flex items-center justify-between h-14">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <PawIcon className="w-6 h-6 text-accent-amber transition-transform group-hover:scale-105" />
          <span className="text-[15px] font-semibold tracking-tight text-[#18181B] dark:text-[#F4F4F5]">
            PawStation
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link, idx) => (
            <a
              key={`${link.label}-${idx}`}
              href={link.href}
              className="text-[13px] font-medium text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] transition-colors"
            >
              {link.label}
            </a>
          ))}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            className="p-2 rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#2C2C2E] text-[#18181B] dark:text-[#F4F4F5] hover:bg-gray-100 dark:hover:bg-[#3A3A3C] transition-all active:scale-[0.95]"
          >
            {theme === "dark" ? (
              <SunIcon className="w-4 h-4 text-accent-amber" />
            ) : (
              <MoonIcon className="w-4 h-4 text-[#71717A]" />
            )}
          </button>

          {/* Primary Action Button */}
          {user ? (
            <div className="flex items-center gap-2.5">
              <Link
                href="/dashboard"
                className="apple-button bg-[#18181B] text-white hover:bg-[#27272A] dark:bg-white dark:text-[#18181B] dark:hover:bg-gray-100"
              >
                Dashboard
              </Link>
              <button
                onClick={signOut}
                className="text-[12px] font-medium text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] px-2 py-1.5 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal("login")}
              className="apple-button bg-[#18181B] text-white hover:bg-[#27272A] dark:bg-white dark:text-[#18181B] dark:hover:bg-gray-100"
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
            className="p-2 rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#2C2C2E] text-[#18181B] dark:text-[#F4F4F5]"
          >
            {theme === "dark" ? (
              <SunIcon className="w-4 h-4 text-accent-amber" />
            ) : (
              <MoonIcon className="w-4 h-4 text-[#71717A]" />
            )}
          </button>

          <button
            onClick={() => setOpen(!open)}
            className="p-2 -mr-2 text-[#18181B] dark:text-[#F4F4F5]"
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
        <div className="md:hidden bg-white dark:bg-[#1C1C1E] border-t border-black/[0.06] dark:border-white/[0.08]">
          <div className="section-container py-4 flex flex-col gap-3">
            {navLinks.map((link, idx) => (
              <a
                key={`m-${link.label}-${idx}`}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-[15px] font-medium text-[#18181B] dark:text-[#F4F4F5] py-2"
              >
                {link.label}
              </a>
            ))}

            {user ? (
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="apple-button bg-[#18181B] text-white text-center dark:bg-white dark:text-[#18181B]"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setOpen(false);
                  }}
                  className="text-[13px] font-medium text-[#71717A] dark:text-[#A1A1AA] py-2 text-center"
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
                className="apple-button bg-[#18181B] text-white text-center mt-2 dark:bg-white dark:text-[#18181B]"
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
