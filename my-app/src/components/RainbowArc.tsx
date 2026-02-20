'use client';

import { useEffect, useState } from 'react';

const COLORS = [
  { color: '#FF0000', label: 'red' },
  { color: '#FF7F00', label: 'orange' },
  { color: '#FFFF00', label: 'yellow' },
  { color: '#00FF00', label: 'green' },
  { color: '#0000FF', label: 'blue' },
  { color: '#4B0082', label: 'indigo' },
  { color: '#9400D3', label: 'violet' },
];

const CENTER_X = 160;
const CENTER_Y = 160;
const OUTER_RADIUS = 150;
const RADIUS_STEP = 10;
const STROKE_WIDTH = 8;

function arcPath(cx: number, cy: number, r: number): string {
  const startX = cx - r;
  const endX = cx + r;
  return `M ${startX},${cy} A ${r},${r} 0 0,1 ${endX},${cy}`;
}

export default function RainbowArc() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  return (
    <svg
      data-testid="rainbow-arc"
      role="img"
      aria-label="Decorative rainbow"
      viewBox="0 0 320 165"
      width="320"
      height="165"
      style={{
        display: 'block',
        margin: '0 auto',
        opacity: visible ? 1 : 0,
        transition: 'opacity 1s ease-in-out',
      }}
    >
      {COLORS.map((item, index) => {
        const radius = OUTER_RADIUS - index * RADIUS_STEP;
        return (
          <path
            key={item.label}
            d={arcPath(CENTER_X, CENTER_Y, radius)}
            stroke={item.color}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
        );
      })}
    </svg>
  );
}
