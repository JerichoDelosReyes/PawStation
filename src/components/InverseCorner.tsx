"use client";

export type InverseCornerType =
  // Quadrant-based
  | "top-left"
  | "top-right"
  | "bottom-right"
  | "bottom-left"
  | "concave-tl"
  | "concave-tr"
  | "concave-br"
  | "concave-bl"
  // Top-left notch semantic aliases
  | "top-left-right"
  | "top-left-bottom"
  | "top-left-notch-right"
  | "top-left-notch-bottom"
  | "notch-tl-right"
  | "notch-tl-bottom"
  // Top-right notch semantic aliases
  | "top-right-left"
  | "top-right-bottom"
  | "top-right-notch-left"
  | "top-right-notch-bottom"
  | "notch-tr-left"
  | "notch-tr-bottom"
  // Bottom-right notch semantic aliases
  | "notch-top"
  | "notch-left"
  | "notch-br-top"
  | "notch-br-left"
  | "bottom-right-notch-top"
  | "bottom-right-notch-left"
  // Legacy aliases
  | "top-left-tab"
  | "top-right-tab"
  // Header dark notch tab edges
  | "header-logo-right"
  | "header-cta-left";

interface InverseCornerProps {
  type: InverseCornerType;
  size?: number;
  className?: string;
}

/**
 * Mathematically exact concave inverse corner fillets.
 * Uses currentColor to perfectly sync with CSS variables (--panel-bg / --frame-bg).
 *
 * 1. top-left (concave-tl): fills top-left (0,0) quadrant with currentColor.
 *    Used by: Top-left notch right edge (notch-to-top-canvas) & bottom edge (notch-to-left-canvas).
 *
 * 2. top-right (concave-tr): fills top-right (r,0) quadrant with currentColor.
 *    Used by: Top-right notch left edge (notch-to-top-canvas) & bottom edge (notch-to-right-canvas).
 *
 * 3. bottom-right (concave-br): fills bottom-right (r,r) quadrant with currentColor.
 *    Used by: Bottom-right notch top edge (notch-top) & left edge (notch-left).
 *
 * 4. bottom-left (concave-bl): fills bottom-left (0,r) quadrant with currentColor.
 */
export default function InverseCorner({
  type,
  size = 24,
  className = "",
}: InverseCornerProps) {
  const r = size;

  // Determine which quadrant corner to fill
  let quadrant: "tl" | "tr" | "br" | "bl" = "br";

  switch (type) {
    case "top-left":
    case "concave-tl":
    case "top-left-right":
    case "top-left-bottom":
    case "top-left-notch-right":
    case "top-left-notch-bottom":
    case "notch-tl-right":
    case "notch-tl-bottom":
      quadrant = "tl";
      break;

    case "top-right":
    case "concave-tr":
    case "top-right-left":
    case "top-right-bottom":
    case "top-right-notch-left":
    case "top-right-notch-bottom":
    case "notch-tr-left":
    case "notch-tr-bottom":
      quadrant = "tr";
      break;

    case "bottom-right":
    case "concave-br":
    case "notch-top":
    case "notch-left":
    case "notch-br-top":
    case "notch-br-left":
    case "bottom-right-notch-top":
    case "bottom-right-notch-left":
    case "top-left-tab":
    case "header-logo-right":
      quadrant = "br";
      break;

    case "bottom-left":
    case "concave-bl":
    case "top-right-tab":
    case "header-cta-left":
      quadrant = "bl";
      break;
  }

  // Exact geometric paths
  let pathD = "";
  switch (quadrant) {
    case "tl":
      // Fills (0,0) corner, concave circular scoop from (r,0) to (0,r) around center (r,r)
      pathD = `M 0,0 L ${r},0 A ${r},${r} 0 0 0 0,${r} Z`;
      break;
    case "tr":
      // Fills (r,0) corner, concave circular scoop from (r,r) to (0,0) around center (0,r)
      pathD = `M ${r},0 L ${r},${r} A ${r},${r} 0 0 0 0,0 Z`;
      break;
    case "br":
      // Fills (r,r) corner, concave circular scoop from (0,r) to (r,0) around center (0,0)
      pathD = `M 0,${r} A ${r},${r} 0 0 0 ${r},0 L ${r},${r} Z`;
      break;
    case "bl":
      // Fills (0,r) corner, concave circular scoop from (0,0) to (r,r) around center (r,0)
      pathD = `M 0,0 A ${r},${r} 0 0 0 ${r},${r} L 0,${r} Z`;
      break;
  }

  return (
    <svg
      width={r}
      height={r}
      viewBox={`0 0 ${r} ${r}`}
      className={`block pointer-events-none select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={pathD} fill="currentColor" />
    </svg>
  );
}
