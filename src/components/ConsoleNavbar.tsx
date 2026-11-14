"use client";

import Link from "next/link";
import { PawIcon } from "./Icons";
import InverseCorner from "./InverseCorner";
import ThemeTogglePill from "./ThemeTogglePill";
import { useAuth } from "@/lib/auth-context";
import type { StationStatus } from "@/lib/mqtt";

interface ConsoleNavbarProps {
  stationStatus?: StationStatus;
  catName?: string;
  onOpenEditProfile?: () => void;
}

export default function ConsoleNavbar({
  stationStatus = "connecting",
  catName,
  onOpenEditProfile,
}: ConsoleNavbarProps) {
  const { user, signOut, openAuthModal } = useAuth();

  const isOnline = stationStatus === "online";
  const isConnecting = stationStatus === "connecting";

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. ALL-BLACK MOBILE HEADER BAR (< lg)
      ───────────────────────────────────────────────────────────── */}
      <div className="lg:hidden w-full bg-[var(--frame-bg)] text-white px-3.5 py-2.5 flex items-center justify-between z-40 relative border-b border-white/10 select-none">
        {/* Brand + Station pulse */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2" aria-label="PawStation Home">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-black shadow-sm">
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

          {/* Quick status dot */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-neutral-300">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOnline
                  ? "bg-emerald-400 animate-pulse"
                  : isConnecting
                  ? "bg-amber-400 animate-pulse"
                  : "bg-rose-400"
              }`}
            />
            <span>{isOnline ? "Live" : isConnecting ? "Syncing" : "Offline"}</span>
          </span>
        </div>

        {/* Right side: Dark Mode toggle + Home pill */}
        <div className="flex items-center gap-2">
          <ThemeTogglePill />
          <Link
            href="/"
            className="px-2.5 py-1 rounded-full bg-white text-black text-[11px] font-semibold hover:bg-[#F2EFE9] transition-colors"
          >
            Home
          </Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. DOCKED TOP-LEFT NOTCH (BRAND LOGO + STATION TELEMETRY - LG+)
      ───────────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex absolute top-0 left-0 z-30 items-start select-none">
        <div className="bg-[var(--frame-bg)] h-[56px] px-6 rounded-br-[24px] sm:rounded-br-[28px] flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group" aria-label="PawStation Home">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-black shadow-sm transition-transform duration-200 group-hover:scale-105">
              <PawIcon className="w-4 h-4 text-black fill-current" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold tracking-tight uppercase text-white font-sans leading-none">
                  PawStation
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/10 leading-none">
                  CONSOLE v2.4
                </span>
              </div>
              {/* Live Station Pulse */}
              <div className="flex items-center gap-1.5 mt-1 leading-none">
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
                <span className="text-[10px] font-medium text-neutral-400 font-mono">
                  {isOnline
                    ? "ESP32 LIVE · 24-BIT ACTIVE"
                    : isConnecting
                    ? "BROKER CONNECTING..."
                    : "STATION OFFLINE"}
                </span>
              </div>
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
          3. DOCKED TOP-RIGHT NOTCH (THEME TOGGLE + ACTIONS - LG+)
      ───────────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex absolute top-0 right-0 z-30 items-start select-none">
        {/* Inverted Fillet Curve to Left of Notch */}
        <div className="text-[var(--frame-bg)]">
          <InverseCorner type="top-right-left" size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="bg-[var(--frame-bg)] h-[56px] px-6 rounded-bl-[24px] sm:rounded-bl-[28px] flex items-center gap-3">
          {/* Theme Toggle Pill docked right in the notch! */}
          <ThemeTogglePill />

          <div className="h-4 w-[1px] bg-white/20 mx-1" />

          {/* Return to Home Pill */}
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-black hover:bg-[#F2EFE9] text-[12px] font-semibold tracking-tight shadow-sm transition-all duration-200 active:scale-[0.98]"
          >
            <span className="text-[12px] transition-transform duration-200 group-hover:-translate-x-0.5">
              ←
            </span>
            <span>Return to Home</span>
          </Link>

          {/* User Sign Out / Auth */}
          {user ? (
            <button
              type="button"
              onClick={signOut}
              className="text-[11.5px] font-medium text-neutral-400 hover:text-white px-2 py-1 transition-colors"
            >
              Sign Out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="text-[11.5px] font-medium text-neutral-400 hover:text-white px-2 py-1 transition-colors"
            >
              Log In
            </button>
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
