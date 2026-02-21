"use client";

import { useEffect, useState } from "react";

const COLORS = [
  "#FF0000", // red (outermost, radius 150)
  "#FF7F00", // orange
  "#FFFF00", // yellow
  "#00FF00", // green
  "#0000FF", // blue
  "#4B0082", // indigo
  "#9400D3", // violet (innermost, radius 90)
];

const OUTER_RADIUS = 150;
const RADIUS_STEP = 10;
const STROKE_WIDTH = 8;
const CX = 160;
const CY = 160;

function describeArc(cx: number, cy: number, r: number): string {
  const startX = cx - r;
  const startY = cy;
  const endX = cx + r;
  const endY = cy;
  return `M ${startX} ${startY} A ${r} ${r} 0 0 1 ${endX} ${endY}`;
}

export default function RainbowArc() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setVisible(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const viewBoxWidth = CX * 2 + STROKE_WIDTH;
  const viewBoxHeight = CY + STROKE_WIDTH;

  return (
    <svg
      data-testid="rainbow-arc"
      role="img"
      aria-label="Decorative rainbow"
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      width={viewBoxWidth}
      height={viewBoxHeight}
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
