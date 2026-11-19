"use client";

import { useRef } from "react";
import styles from "./Stickers.module.css";

// Starting spots (percent of the box) and tilt for each sticker.
const SPOTS = [
  { x: 2, y: 8, r: -12, c: "var(--pop-3)" },
  { x: 68, y: 2, r: 9, c: "var(--pop-4)" },
  { x: 76, y: 44, r: -6, c: "var(--pop-2)" },
  { x: 0, y: 62, r: 7, c: "var(--pop-5)" },
  { x: 60, y: 84, r: -4, c: "var(--pop-1)" },
  { x: 10, y: 88, r: 11, c: "var(--surface)" },
];

/**
 * Decorative stickers you can drag around with mouse or finger. Pure play:
 * hidden from screen readers, and positions aren't saved.
 */
export function Stickers({ words }: { words: string[] }) {
  return (
    <div className={styles.board} aria-hidden="true">
      {words.slice(0, SPOTS.length).map((word, i) => (
        <Sticker key={word} word={word} spot={SPOTS[i]} delay={i * -0.7} />
      ))}
    </div>
  );
}

function Sticker({ word, spot, delay }: { word: string; spot: (typeof SPOTS)[number]; delay: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const drag = useRef({ active: false, startX: 0, startY: 0, x: 0, y: 0 });

  const onDown = (e: React.PointerEvent<HTMLSpanElement>) => {
    const d = drag.current;
    d.active = true;
    d.startX = e.clientX - d.x;
    d.startY = e.clientY - d.y;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.dataset.dragging = "true";
  };

  const onMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    const d = drag.current;
    if (!d.active || !ref.current) return;
    d.x = e.clientX - d.startX;
    d.y = e.clientY - d.startY;
    ref.current.style.translate = `${d.x}px ${d.y}px`;
  };

  const onUp = (e: React.PointerEvent<HTMLSpanElement>) => {
    drag.current.active = false;
    delete e.currentTarget.dataset.dragging;
  };

  return (
    <span
      ref={ref}
      className={styles.sticker}
      style={
        {
          left: `${spot.x}%`,
          top: `${spot.y}%`,
          "--r": `${spot.r}deg`,
          "--c": spot.c,
          animationDelay: `${delay}s`,
        } as React.CSSProperties
      }
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      {word}
    </span>
  );
}
