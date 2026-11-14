"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { PawIcon, CatIcon, CloseIcon } from "./Icons";
import InverseCorner from "./InverseCorner";
import ThemeTogglePill from "./ThemeTogglePill";
import { useAuth } from "@/lib/auth-context";
import type { StationStatus } from "@/lib/mqtt";

interface ConsoleNavbarProps {
  stationStatus?: StationStatus;
  catName?: string;
  catBreed?: string;
  stationName?: string;
  onOpenEditProfile?: () => void;
}

export default function ConsoleNavbar({
  stationStatus = "connecting",
  catName = "Whiskers",
  catBreed = "Domestic Longhair",
  stationName = "PawStation Unit 1",
  onOpenEditProfile,
}: ConsoleNavbarProps) {
  const { user, signOut, openAuthModal } = useAuth();
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

  const handleSignOut = () => {
    setProfileOpen(false);
    signOut();
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
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-bold tracking-tight uppercase text-white font-sans">
              PawStation
            </span>
            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-white/10 text-neutral-300">
              Console
            </span>
          </div>
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
                  <p className="text-[11.5px] text-neutral-500 dark:text-neutral-400 truncate">
                    {catBreed}
                  </p>
                  <p className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
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

              {user?.email && (
                <div className="text-[10.5px] font-mono text-neutral-400 dark:text-neutral-500 border-t border-black/[0.06] dark:border-white/[0.08] pt-2 mb-2 truncate">
                  Owner: {user.email}
                </div>
              )}

              {/* Theme Toggle in Profile Window */}
              <div className="flex items-center justify-between border-t border-black/[0.06] dark:border-white/[0.08] py-2">
                <span className="text-[11.5px] font-medium text-neutral-600 dark:text-neutral-300">
                  Theme
                </span>
                <ThemeTogglePill variant="adaptive" compact={false} showLabel={false} />
              </div>

              {/* Return to Home & Sign Out */}
              <div className="border-t border-black/[0.06] dark:border-white/[0.08] pt-2 space-y-1">
                <Link
                  href="/"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/[0.08] transition-colors"
                >
                  <span>Return to Home</span>
                  <span className="text-[11px] text-neutral-400">←</span>
                </Link>

                {user ? (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                  >
                    <span>Sign Out</span>
                    <span className="text-[11px]">→</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      openAuthModal("login");
                    }}
                    className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors"
                  >
                    <span>Log In</span>
                    <span className="text-[11px]">→</span>
                  </button>
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
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/10 leading-none">
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
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-medium border border-emerald-500/20">
                      <span className="w-1 h-1 rounded-full bg-emerald-500" />
                      Station Synced
                    </span>
                  </div>
                </div>
              </div>

              {/* Device and Account details */}
              <div className="bg-[#FAF8F5] dark:bg-[#121620] rounded-xl p-3 border border-black/[0.04] dark:border-white/[0.06] mb-4 space-y-1 text-[11.5px]">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 dark:text-neutral-500">Device</span>
                  <span className="font-mono text-neutral-700 dark:text-neutral-300 font-medium">
                    {stationName}
                  </span>
                </div>
                {user?.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 dark:text-neutral-500">Account</span>
                    <span className="font-mono text-neutral-700 dark:text-neutral-300 truncate max-w-[170px]">
                      {user.email}
                    </span>
                  </div>
                )}
              </div>

              {/* Edit Profile Action */}
              <button
                type="button"
                onClick={handleEditClick}
                className="w-full py-2 px-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-[12px] font-semibold text-center shadow-sm transition-all active:scale-[0.98] mb-4"
              >
                Edit Cat &amp; Station Profile
              </button>

              {/* Theme Toggle Section */}
              <div className="flex items-center justify-between border-t border-black/[0.06] dark:border-white/[0.08] pt-3.5 pb-3">
                <div className="flex flex-col">
                  <span className="text-[12.5px] font-medium text-neutral-800 dark:text-neutral-200">
                    Appearance
                  </span>
                  <span className="text-[10.5px] text-neutral-400 dark:text-neutral-500">
                    Light or dark console
                  </span>
                </div>
                <ThemeTogglePill variant="adaptive" compact={false} showLabel={false} />
              </div>

              {/* Navigation & Sign Out */}
              <div className="border-t border-black/[0.06] dark:border-white/[0.08] pt-3 space-y-1">
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

                {user ? (
                  <button
                    type="button"
                    onClick={handleSignOut}
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
                      <span>Sign Out</span>
                    </span>
                    <span className="text-[11px] text-rose-400/80 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      openAuthModal("login");
                    }}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-[12.5px] font-medium text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors"
                  >
                    <span>Log In</span>
                    <span className="text-[11px]">→</span>
                  </button>
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
