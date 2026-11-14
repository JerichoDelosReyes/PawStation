"use client";

import { useState, useRef, useEffect, memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PawIcon, CatIcon, CloseIcon, SunIcon, MoonIcon } from "./Icons";
import InverseCorner from "./InverseCorner";
import ThemeTogglePill from "./ThemeTogglePill";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "./ThemeProvider";
import type { StationStatus } from "@/lib/mqtt";

interface ConsoleNavbarProps {
  stationStatus?: StationStatus;
  catName?: string;
  catBreed?: string;
  stationName?: string;
  onOpenEditProfile?: () => void;
}

function ConsoleNavbar({
  stationStatus = "connecting",
  catName = "Whiskers",
  catBreed = "Domestic Longhair",
  stationName = "PawStation Unit 1",
  onOpenEditProfile,
}: ConsoleNavbarProps) {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const isOnline = stationStatus === "online";
  const isConnecting = stationStatus === "connecting";

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    }

    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen]);

  const handleEditClick = () => {
    setProfileOpen(false);
    onOpenEditProfile?.();
  };

  const handleSignOutAndReturnHome = async () => {
    setProfileOpen(false);
    if (user) {
      await signOut();
    }
    router.push("/");
  };

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. MOBILE HEADER BAR (< lg)
      ───────────────────────────────────────────────────────────── */}
      <div className="lg:hidden w-full bg-[var(--frame-bg)] text-white px-4 py-2.5 flex items-center justify-between z-40 relative border-b border-white/10 select-none">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group" aria-label="PawStation Home">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-black shadow-sm transition-transform group-hover:scale-105">
            <PawIcon className="w-3.5 h-3.5 text-black fill-current" />
          </div>
          <span className="text-[13px] font-bold tracking-tight uppercase text-white font-sans">
            PawStation
          </span>
        </Link>

        {/* Cat Profile Trigger Pill on Mobile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all active:scale-95"
            aria-expanded={profileOpen}
            aria-label="Open Cat Profile Menu"
          >
            <div className="w-5 h-5 rounded-full bg-accent-amber/20 text-accent-amber flex items-center justify-center">
              <CatIcon className="w-3 h-3 fill-current" />
            </div>
            <span className="text-[12px] font-semibold text-white max-w-[100px] truncate">
              {catName}
            </span>
            <span className="relative flex h-1.5 w-1.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isOnline
                    ? "bg-emerald-400"
                    : isConnecting
                    ? "bg-amber-400"
                    : "bg-rose-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                  isOnline
                    ? "bg-emerald-500"
                    : isConnecting
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
              />
            </span>
          </button>

          {/* Mobile Profile Dropdown Window */}
          {profileOpen && (
            <div
              ref={dropdownRef}
              className="absolute right-0 top-[42px] z-50 w-72 rounded-2xl bg-white dark:bg-[#161B26] text-neutral-900 dark:text-white border border-black/10 dark:border-white/10 shadow-2xl p-4 transition-all"
            >
              {/* Cat Profile Content */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-accent-amber/15 text-accent-amber flex items-center justify-center shrink-0 border border-accent-amber/25 shadow-inner">
                  <CatIcon className="w-6 h-6 fill-current" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[14px] font-bold text-neutral-900 dark:text-white truncate">
                      {catName}
                    </h3>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-[11.5px] font-medium text-neutral-500 dark:text-neutral-400 truncate">
                    {catBreed}
                  </p>
                  <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
                    {stationName}
                  </p>
                </div>
              </div>

              {/* Edit Profile Button */}
              <button
                type="button"
                onClick={handleEditClick}
                className="w-full py-1.5 px-3 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/15 text-neutral-800 dark:text-neutral-200 text-[11.5px] font-semibold text-center transition-colors mb-3"
              >
                Edit Profile
              </button>

              {/* Device and Account details (Mobile) */}
              <div className="bg-[#FAF8F5] dark:bg-[#121620] rounded-xl p-2.5 border border-black/[0.04] dark:border-white/[0.06] mb-3 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 dark:text-neutral-500 font-medium">Device</span>
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium truncate max-w-[140px]">
                    {stationName}
                  </span>
                </div>
                {user?.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 dark:text-neutral-500 font-medium">Account</span>
                    <span className="text-neutral-700 dark:text-neutral-300 font-medium truncate max-w-[140px]">
                      {user.email}
                    </span>
                  </div>
                )}
              </div>

              {/* Appearance / Theme Selector (Mobile) */}
              <div className="border-t border-black/[0.06] dark:border-white/[0.08] pt-2.5 pb-2.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-semibold text-neutral-800 dark:text-neutral-200">
                    Appearance
                  </span>
                  <span className="text-[10.5px] font-medium text-neutral-400 dark:text-neutral-500 capitalize">
                    {theme} mode
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11.5px] font-semibold transition-all duration-200 ${
                      !isDark
                        ? "bg-white text-neutral-900 shadow-sm border border-black/[0.04]"
                        : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                    }`}
                  >
                    <SunIcon className={`w-3.5 h-3.5 ${!isDark ? "text-amber-500" : ""}`} />
                    <span>Light</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11.5px] font-semibold transition-all duration-200 ${
                      isDark
                        ? "bg-[#1E2433] text-white shadow-sm border border-white/10"
                        : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                    }`}
                  >
                    <MoonIcon className={`w-3.5 h-3.5 ${isDark ? "text-sky-400" : ""}`} />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              {/* Return to Home & Sign Out (Combined) */}
              <div className="border-t border-black/[0.06] dark:border-white/[0.08] pt-2 space-y-1">
                {user ? (
                  <button
                    type="button"
                    onClick={handleSignOutAndReturnHome}
                    className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-rose-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      <span>Sign Out &amp; Return Home</span>
                    </span>
                    <span className="text-[11px]">→</span>
                  </button>
                ) : (
                  <Link
                    href="/"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/[0.08] transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-neutral-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                      <span>Return to Home</span>
                    </span>
                    <span className="text-[11px] text-neutral-400">→</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. DOCKED TOP-LEFT NOTCH (BRAND LOGO - LG+)
      ───────────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex absolute top-0 left-0 z-30 items-start select-none">
        <div className="bg-[var(--frame-bg)] h-[56px] px-6 rounded-br-[24px] sm:rounded-br-[28px] flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group" aria-label="PawStation Home">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-black shadow-sm transition-transform duration-200 group-hover:scale-105">
              <PawIcon className="w-4 h-4 text-black fill-current" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold tracking-tight uppercase text-white font-sans leading-none">
                PawStation
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/10 leading-none">
                Console
              </span>
            </div>
          </Link>
        </div>
        {/* Inverted Fillet Curve to Right of Notch */}
        <div className="text-[var(--frame-bg)]">
          <InverseCorner type="top-left-right" size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
      {/* Inverted Fillet Curve Below Logo Notch */}
      <div className="hidden lg:block absolute left-0 top-[56px] z-30 text-[var(--frame-bg)]">
        <InverseCorner type="top-left-bottom" size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. DOCKED TOP-RIGHT NOTCH (CAT PROFILE WINDOW TRIGGER - LG+)
      ───────────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex absolute top-0 right-0 z-30 items-start select-none">
        {/* Inverted Fillet Curve to Left of Notch */}
        <div className="text-[var(--frame-bg)]">
          <InverseCorner type="top-right-left" size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="bg-[var(--frame-bg)] h-[56px] pl-4 pr-5 rounded-bl-[24px] sm:rounded-bl-[28px] flex items-center relative">
          {/* Profile Window Trigger Button */}
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="group flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all active:scale-[0.98] cursor-pointer"
            aria-expanded={profileOpen}
            aria-label="Cat Profile Menu"
          >
            {/* Cat Avatar Micro Badge */}
            <div className="w-6 h-6 rounded-full bg-accent-amber/20 text-accent-amber flex items-center justify-center border border-accent-amber/30 group-hover:scale-105 transition-transform">
              <CatIcon className="w-3.5 h-3.5 fill-current" />
            </div>

            {/* Cat Name */}
            <span className="text-[13px] font-semibold text-white tracking-tight">
              {catName}
            </span>

            {/* Station Status Pulse Dot */}
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isOnline
                    ? "bg-emerald-400"
                    : isConnecting
                    ? "bg-amber-400"
                    : "bg-rose-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isOnline
                    ? "bg-emerald-500"
                    : isConnecting
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
              />
            </span>

            {/* Rotating Dropdown Indicator */}
            <svg
              className={`w-3.5 h-3.5 text-neutral-300 transition-transform duration-200 ${
                profileOpen ? "rotate-180" : ""
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* ─────────────────────────────────────────────────────────
              CAT PROFILE WINDOW POPOVER (DESKTOP)
          ───────────────────────────────────────────────────────── */}
          {profileOpen && (
            <div
              ref={dropdownRef}
              className="absolute right-0 top-[60px] z-50 w-80 rounded-2xl bg-white dark:bg-[#161B26] text-neutral-900 dark:text-white border border-black/10 dark:border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_56px_rgba(0,0,0,0.6)] backdrop-blur-2xl p-5 overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-150"
            >
              {/* Window Header / Close Button */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-accent-amber">
                    Cat Station Profile
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <button
                  type="button"
                  onClick={() => setProfileOpen(false)}
                  className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"
                  aria-label="Close Profile Menu"
                >
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Profile Card Header */}
              <div className="flex items-start gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-xl bg-accent-amber/15 text-accent-amber flex items-center justify-center shrink-0 border border-accent-amber/25 shadow-inner">
                  <CatIcon className="w-7 h-7 fill-current" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[16px] font-bold text-neutral-900 dark:text-white tracking-tight truncate">
                    {catName}
                  </h4>
                  <p className="text-[12.5px] font-medium text-neutral-500 dark:text-neutral-400 truncate">
                    {catBreed}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                      <span className="w-1 h-1 rounded-full bg-emerald-500" />
                      Station Synced
                    </span>
                  </div>
                </div>
              </div>

              {/* Device and Account details */}
              <div className="bg-[#FAF8F5] dark:bg-[#121620] rounded-xl p-3 border border-black/[0.04] dark:border-white/[0.06] mb-3.5 space-y-1.5 text-[11.5px]">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 dark:text-neutral-500 font-medium">Device</span>
                  <span className="text-neutral-800 dark:text-neutral-200 font-medium">
                    {stationName}
                  </span>
                </div>
                {user?.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 dark:text-neutral-500 font-medium">Account</span>
                    <span className="text-neutral-800 dark:text-neutral-200 font-medium truncate max-w-[170px]">
                      {user.email}
                    </span>
                  </div>
                )}
              </div>

              {/* Edit Profile Action */}
              <button
                type="button"
                onClick={handleEditClick}
                className="w-full py-2 px-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-[12px] font-semibold text-center shadow-sm transition-all active:scale-[0.98] mb-3.5"
              >
                Edit Cat &amp; Station Profile
              </button>

              {/* Appearance / Theme Selector */}
              <div className="border-t border-black/[0.06] dark:border-white/[0.08] pt-3.5 pb-3">
                <div className="flex items-center justify-between mb-2.5">
                  <div>
                    <span className="text-[12px] font-semibold text-neutral-800 dark:text-neutral-200 block">
                      Appearance
                    </span>
                    <span className="text-[10.5px] text-neutral-400 dark:text-neutral-500">
                      Light or dark console
                    </span>
                  </div>
                  <span className="text-[10.5px] font-medium text-neutral-400 dark:text-neutral-500 capitalize">
                    {theme} mode
                  </span>
                </div>

                {/* macOS-style Dual Segmented Pill Switch */}
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-[12px] font-semibold transition-all duration-200 ${
                      !isDark
                        ? "bg-white text-neutral-900 shadow-sm border border-black/[0.04]"
                        : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                    }`}
                  >
                    <SunIcon className={`w-3.5 h-3.5 ${!isDark ? "text-amber-500" : ""}`} />
                    <span>Light</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-[12px] font-semibold transition-all duration-200 ${
                      isDark
                        ? "bg-[#1E2433] text-white shadow-sm border border-white/10"
                        : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                    }`}
                  >
                    <MoonIcon className={`w-3.5 h-3.5 ${isDark ? "text-sky-400" : ""}`} />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              {/* Navigation & Sign Out (Combined) */}
              <div className="border-t border-black/[0.06] dark:border-white/[0.08] pt-3 space-y-1">
                {user ? (
                  <button
                    type="button"
                    onClick={handleSignOutAndReturnHome}
                    className="group flex items-center justify-between w-full px-3 py-2 rounded-xl text-[12.5px] font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-rose-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      <span>Sign Out &amp; Return Home</span>
                    </span>
                    <span className="text-[11px] text-rose-400/80 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </button>
                ) : (
                  <Link
                    href="/"
                    onClick={() => setProfileOpen(false)}
                    className="group flex items-center justify-between w-full px-3 py-2 rounded-xl text-[12.5px] font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/[0.08] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-white transition-colors"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                      <span>Return to Home</span>
                    </span>
                    <span className="text-[11px] text-neutral-400 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Inverted Fillet Curve Below Right Notch */}
      <div className="hidden lg:block absolute right-0 top-[56px] z-30 text-[var(--frame-bg)]">
        <InverseCorner type="top-right-bottom" size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
    </>
  );
}

export default memo(ConsoleNavbar);
