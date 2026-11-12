"use client";

interface FilletCornerProps {
  type: "concave-tl" | "concave-tr" | "concave-bl" | "concave-br";
  className?: string;
  fillColor?: string;
}

/**
 * Pixel-perfect inverted corner fillet (concave curve)
 * Used to join tabs and cutouts seamlessly into the chassis.
 */
export default function FilletCorner({
  type,
  className = "w-5 h-5",
  fillColor = "#161618",
}: FilletCornerProps) {
  // SVG paths for each orientation:
  // concave-tl: fills bottom-left, scoops top-right
  // concave-tr: fills bottom-right, scoops top-left
  // concave-bl: fills top-left, scoops bottom-right
  // concave-br: fills top-right, scoops bottom-left
  const paths: Record<string, string> = {
    "concave-tl": "M0,0 C0,13.255 10.745,24 24,24 L0,24 Z",
    "concave-tr": "M24,0 C24,13.255 13.255,24 0,24 L24,24 Z",
    "concave-bl": "M0,24 C0,10.745 10.745,0 24,0 L0,0 Z",
    "concave-br": "M24,24 C24,10.745 13.255,0 0,0 L24,0 Z",
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className={`block pointer-events-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={paths[type]} fill={fillColor} />
    </svg>
  );
}
