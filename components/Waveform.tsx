import styles from "./Waveform.module.css";

type WaveformProps = {
  /** Number of bars. */
  bars?: number;
  /** Fraction (0–1) drawn as "already played". */
  progress?: number;
  /** Changes the shape; same seed always draws the same waveform. */
  seed?: number;
  className?: string;
};

/** Small deterministic PRNG so the server always renders identical markup. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function heights(count: number, seed: number) {
  const random = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => {
    // A slow swell plus noise reads more like music than pure noise does.
    const swell = 0.55 + 0.45 * Math.sin((i / count) * Math.PI * 2.4 + seed);
    const value = 0.18 + 0.82 * swell * (0.45 + 0.55 * random());
    return Math.round(Math.min(1, value) * 100) / 100;
  });
}

/**
 * Decorative audio waveform — a quiet nod to music, used in
 * the TrackDemos illustration. Hidden from assistive technology.
 */
export function Waveform({ bars = 96, progress = 0.4, seed = 7, className }: WaveformProps) {
  const values = heights(bars, seed);
  const gap = 2;
  const width = 4;
  const total = bars * (width + gap) - gap;

  return (
    <svg
      className={`${styles.waveform} ${className ?? ""}`}
      viewBox={`0 0 ${total} 100`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {values.map((value, i) => {
        const height = Math.max(6, value * 100);
        return (
          <rect
            key={i}
            x={i * (width + gap)}
            y={(100 - height) / 2}
            width={width}
            height={height}
            rx={2}
            className={i / bars < progress ? styles.played : styles.unplayed}
          />
        );
      })}
    </svg>
  );
}
