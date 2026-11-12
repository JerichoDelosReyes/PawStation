"use client";

interface InverseCornerProps {
  type: "top-left-tab" | "top-right-tab" | "notch-left" | "notch-top";
  size?: number;
  className?: string;
}

/**
 * Mathematically exact concave inverse corner fillets.
 * Uses currentColor to perfectly sync with CSS variables (--panel-bg / --frame-bg).
 *
 * 1. top-left-tab: Attached to left side of raised nav tab (fill = panelColor)
 * 2. top-right-tab: Attached to right side of raised nav tab (fill = panelColor)
 * 3. notch-left: Attached to left side of dark bottom-right notch (fill = frameColor)
 * 4. notch-top: Attached to top side of dark bottom-right notch (fill = frameColor)
 */
export default function InverseCorner({
  type,
  size = 24,
  className = "",
}: InverseCornerProps) {
  const r = size;

  switch (type) {
    // Left side of the raised cream nav tab (fills bottom-right quadrant with currentColor)
    case "top-left-tab":
      return (
        <svg
          width={r}
          height={r}
          viewBox={`0 0 ${r} ${r}`}
          className={`block pointer-events-none select-none ${className}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={`M 0,${r} A ${r},${r} 0 0 0 ${r},0 L ${r},${r} Z`} fill="currentColor" />
        </svg>
      );

    // Right side of the raised cream nav tab (fills bottom-left quadrant with currentColor)
    case "top-right-tab":
      return (
        <svg
          width={r}
          height={r}
          viewBox={`0 0 ${r} ${r}`}
          className={`block pointer-events-none select-none ${className}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={`M 0,0 A ${r},${r} 0 0 0 ${r},${r} L 0,${r} Z`} fill="currentColor" />
        </svg>
      );

    // Left side of the dark bottom-right notch (fills bottom-right quadrant with currentColor)
    case "notch-left":
      return (
        <svg
          width={r}
          height={r}
          viewBox={`0 0 ${r} ${r}`}
          className={`block pointer-events-none select-none ${className}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={`M 0,${r} A ${r},${r} 0 0 0 ${r},0 L ${r},${r} Z`} fill="currentColor" />
        </svg>
      );

    // Top side of the dark bottom-right notch (fills bottom-right quadrant with currentColor)
    case "notch-top":
      return (
        <svg
          width={r}
          height={r}
          viewBox={`0 0 ${r} ${r}`}
          className={`block pointer-events-none select-none ${className}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={`M 0,${r} A ${r},${r} 0 0 0 ${r},0 L ${r},${r} Z`} fill="currentColor" />
        </svg>
      );

    default:
      return null;
  }
}
