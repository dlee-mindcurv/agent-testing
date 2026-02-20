"use client";

import { useEffect, useState } from "react";

const COLORS = [
  "#FF0000", // red
  "#FF7F00", // orange
  "#FFFF00", // yellow
  "#00FF00", // green
  "#0000FF", // blue
  "#4B0082", // indigo
  "#9400D3", // violet
];

const OUTER_RADIUS = 150;
const RADIUS_STEP = 10;
const STROKE_WIDTH = 8;
const CX = 160;
const CY = 165;

function describeArc(cx: number, cy: number, r: number): string {
  const startX = cx - r;
  const startY = cy;
  const endX = cx + r;
  const endY = cy;
  // SVG arc: large-arc-flag=0, sweep-flag=1 (clockwise, but going upward because start is left)
  return `M ${startX},${startY} A ${r},${r} 0 0,1 ${endX},${endY}`;
}

export default function RainbowArc() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setVisible(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <svg
      data-testid="rainbow-arc"
      role="img"
      aria-label="Decorative rainbow"
      viewBox="0 0 320 175"
      width="320"
      height="175"
      style={{
        display: "block",
        margin: "0 auto",
        opacity: visible ? 1 : 0,
        transition: "opacity 1s ease",
      }}
    >
      {COLORS.map((color, index) => {
        const radius = OUTER_RADIUS - index * RADIUS_STEP;
        return (
          <path
            key={color}
            d={describeArc(CX, CY, radius)}
            stroke={color}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
        );
      })}
    </svg>
  );
}
