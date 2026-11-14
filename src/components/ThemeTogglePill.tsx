"use client";

import { useTheme } from "./ThemeProvider";
import { MoonIcon, SunIcon } from "./Icons";

interface ThemeTogglePillProps {
  className?: string;
  compact?: boolean;
  showLabel?: boolean;
  useIcons?: boolean;
  variant?: "dark-notch" | "adaptive";
}

export default function ThemeTogglePill({
  className = "",
  compact = false,
  showLabel,
  useIcons,
  variant = "dark-notch",
}: ThemeTogglePillProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const renderLabel = showLabel !== undefined ? showLabel : !compact;
  const renderIcons = useIcons !== undefined ? useIcons : compact;

  const isAdaptive = variant === "adaptive";

  return (
    <div
      role="group"
      aria-label="Theme toggle"
      className={`inline-flex items-center gap-2 select-none ${className}`}
    >
      {renderLabel && (
        <span
          className={`text-[12px] font-medium font-sans tracking-tight ${
            isAdaptive ? "text-neutral-700 dark:text-neutral-300" : "text-white/90"
          }`}
        >
          Dark mode:
        </span>
      )}

      {/* Pill Capsule */}
      <div
        className={`relative inline-flex items-center p-0.5 rounded-full ${
          isAdaptive
            ? "border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/10"
            : "border border-white/25 bg-white/10"
        }`}
      >
        <button
          type="button"
          onClick={() => setTheme("dark")}
          aria-label="Dark mode"
          title="Dark mode"
          className={`rounded-full text-[11px] font-semibold transition-all duration-150 flex items-center justify-center ${
            renderIcons ? "p-1.5" : "px-3 py-0.5"
          } ${
            isDark
              ? isAdaptive
                ? "bg-neutral-900 text-white dark:bg-white dark:text-black shadow-sm"
                : "bg-white text-black shadow-sm"
              : isAdaptive
              ? "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              : "text-white/70 hover:text-white"
          }`}
        >
          {renderIcons ? <MoonIcon className="w-3.5 h-3.5" /> : "On"}
        </button>
        <button
          type="button"
          onClick={() => setTheme("light")}
          aria-label="Light mode"
          title="Light mode"
          className={`rounded-full text-[11px] font-semibold transition-all duration-150 flex items-center justify-center ${
            renderIcons ? "p-1.5" : "px-3 py-0.5"
          } ${
            !isDark
              ? isAdaptive
                ? "bg-neutral-900 text-white dark:bg-white dark:text-black shadow-sm"
                : "bg-white text-black shadow-sm"
              : isAdaptive
              ? "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              : "text-white/70 hover:text-white"
          }`}
        >
          {renderIcons ? <SunIcon className="w-3.5 h-3.5" /> : "Off"}
        </button>
      </div>
    </div>
  );
}
