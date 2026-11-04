import type { CSSProperties } from "react";
import styles from "./CyberBackdrop.module.css";

/** Small seeded PRNG so the city looks the same on every render. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NEON = ["#2de2e6", "#ff3ea5", "#f9c80e", "#9b5cff"];
const WIDTH = 1440;
const HEIGHT = 260;

type Rect = { x: number; y: number; w: number; h: number };
type Tower = Rect & { antenna: number; pattern: number };
type Light = Rect & { color: string; delay: number };

/**
 * Lit windows come from a few repeating SVG patterns (cheap), plus a small
 * number of individual windows that flicker.
 */
const WINDOW_PATTERNS: { size: [number, number]; lights: [number, number, string][] }[] = [
  {
    size: [40, 27],
    lights: [
      [6, 4, NEON[0]],
      [22, 13, NEON[1]],
      [30, 22, NEON[2]],
    ],
  },
  {
    size: [32, 18],
    lights: [
      [14, 4, NEON[3]],
      [4, 13, NEON[0]],
    ],
  },
  {
    size: [56, 36],
    lights: [
      [8, 6, NEON[1]],
      [16, 6, NEON[1]],
      [40, 24, NEON[0]],
      [24, 28, NEON[2]],
    ],
  },
];

function buildCity(seed: number, minHeight: number, maxHeight: number) {
  const random = mulberry32(seed);
  const towers: Tower[] = [];
  const flickers: Light[] = [];
  const signs: Light[] = [];

  for (let x = -20; x < WIDTH; ) {
    const w = 34 + Math.round(random() * 70);
    const h = minHeight + Math.round(random() * (maxHeight - minHeight));
    const y = HEIGHT - h;
    towers.push({
      x,
      y,
      w,
      h,
      antenna: random() > 0.75 ? 10 + random() * 30 : 0,
      pattern: Math.floor(random() * WINDOW_PATTERNS.length),
    });

    if (random() > 0.35) {
      flickers.push({
        x: x + 6 + Math.round(random() * (w - 14)),
        y: y + 10 + Math.round(random() * (h - 20)),
        w: 3,
        h: 4,
        color: NEON[Math.floor(random() * NEON.length)],
        delay: Math.round(random() * 5000),
      });
    }

    // The occasional vertical neon sign on a taller tower.
    if (h > maxHeight * 0.6 && random() > 0.55) {
      signs.push({
        x: x + w - 8,
        y: y + 14 + random() * 30,
        w: 4,
        h: 34 + random() * 40,
        color: NEON[Math.floor(random() * 2)],
        delay: Math.round(random() * 4000),
      });
    }

    x += w + Math.round(random() * 6);
  }

  return { towers, flickers, signs };
}

const far = buildCity(7, 70, 190);
const near = buildCity(23, 40, 140);

/** Falling light streaks, spread across the width. */
const streams = (() => {
  const random = mulberry32(91);
  return Array.from({ length: 28 }, (_, i) => ({
    left: `${(i / 28) * 100 + random() * 3}%`,
    duration: `${(2.4 + random() * 4).toFixed(2)}s`,
    delay: `${(-random() * 6).toFixed(2)}s`,
    color: NEON[i % 2],
    opacity: (0.25 + random() * 0.5).toFixed(2),
  }));
})();

function City({
  city,
  id,
  className,
}: {
  city: ReturnType<typeof buildCity>;
  id: string;
  className: string;
}) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        {WINDOW_PATTERNS.map((pattern, i) => (
          <pattern
            key={i}
            id={`${id}-windows-${i}`}
            width={pattern.size[0]}
            height={pattern.size[1]}
            patternUnits="userSpaceOnUse"
          >
            {pattern.lights.map(([x, y, color]) => (
              <rect key={`${x}-${y}`} x={x} y={y} width={3} height={4} fill={color} />
            ))}
          </pattern>
        ))}
      </defs>

      {city.towers.map((t) => (
        <g key={t.x}>
          {t.antenna > 0 && (
            <line
              x1={t.x + t.w / 2}
              x2={t.x + t.w / 2}
              y1={t.y}
              y2={t.y - t.antenna}
              className={styles.antenna}
            />
          )}
          <rect x={t.x} y={t.y} width={t.w} height={t.h} className={styles.tower} />
          <rect
            x={t.x + 3}
            y={t.y + 6}
            width={t.w - 6}
            height={t.h - 10}
            fill={`url(#${id}-windows-${t.pattern})`}
            className={styles.window}
          />
        </g>
      ))}
      {city.flickers.map((w) => (
        <rect
          key={`${w.x}-${w.y}`}
          x={w.x}
          y={w.y}
          width={w.w}
          height={w.h}
          fill={w.color}
          className={styles.flicker}
          style={{ animationDelay: `${w.delay}ms` }}
        />
      ))}
      {city.signs.map((s) => (
        <rect
          key={`${s.x}-${s.y}`}
          x={s.x}
          y={s.y}
          width={s.w}
          height={s.h}
          rx={1.5}
          fill={s.color}
          className={styles.sign}
          style={{ animationDelay: `${s.delay}ms`, color: s.color }}
        />
      ))}
    </svg>
  );
}

/**
 * Animated cyberpunk night city behind the hero: neon skyline, a grid floor
 * rushing toward the viewer, falling data streams, scanlines, and a HUD
 * frame. Pure CSS and SVG — no JavaScript — and fully decorative.
 * Everything stands still for people who prefer reduced motion.
 */
export function CyberBackdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <div className={styles.sky} />
      <div className={styles.sunClip}>
        <div className={styles.sun} />
      </div>
      <City city={far} id="city-far" className={styles.cityFar} />
      <City city={near} id="city-near" className={styles.cityNear} />
      <div className={styles.horizon} />
      <div className={styles.floor}>
        <div className={styles.grid} />
      </div>
      <div className={styles.streams}>
        {streams.map((s, i) => (
          <span
            key={i}
            className={styles.stream}
            style={
              {
                left: s.left,
                "--duration": s.duration,
                "--delay": s.delay,
                "--color": s.color,
                opacity: s.opacity,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className={styles.scrim} />
      <div className={styles.scanlines} />
      <div className={styles.scanbar} />
      <div className={`container ${styles.hud}`}>
        <span className={`${styles.corner} ${styles.tl}`} />
        <span className={`${styles.corner} ${styles.tr}`} />
        <span className={`${styles.corner} ${styles.bl}`} />
        <span className={`${styles.corner} ${styles.br}`} />
        <span className={styles.readoutTop}>
          SYS.ONLINE <span className={styles.blink}>▮</span>
        </span>
        <span className={styles.readoutBottom}>51.2277°N 6.7735°E · NODE_DUS · 2026</span>
      </div>
    </div>
  );
}
