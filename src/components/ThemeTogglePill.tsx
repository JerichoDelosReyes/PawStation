"use client";

import { useTheme } from "./ThemeProvider";

interface ThemeTogglePillProps {
  className?: string;
}

export default function ThemeTogglePill({ className = "" }: ThemeTogglePillProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      role="group"
      aria-label="Theme toggle"
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
    >
      <span className="text-[12px] font-medium text-white/90 font-sans tracking-tight">
        Dark mode:
      </span>

      {/* Pill Capsule (Exact Fynsec switch) */}
      <div className="relative inline-flex items-center p-0.5 rounded-full border border-white/25 bg-white/10">
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`px-3 py-0.5 rounded-full text-[11px] font-semibold transition-all duration-150 ${
            isDark ? "bg-white text-black shadow-sm" : "text-white/70 hover:text-white"
          }`}
        >
          On
        </button>
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`px-3 py-0.5 rounded-full text-[11px] font-semibold transition-all duration-150 ${
            !isDark ? "bg-white text-black shadow-sm" : "text-white/70 hover:text-white"
          }`}
        >
          Off
        </button>
      </div>
    </div>
  );
}
