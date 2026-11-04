import type { UiText } from "@/content/types";
import { Waveform } from "./Waveform";
import styles from "./TrackDemosVisual.module.css";

// Waveform shapes for the made-up demos, in order.
const seeds = [3, 19, 42];

/**
 * An abstract composition of the TrackDemos idea — private demos, each with
 * its own visibility. Deliberately drawn, not a screenshot.
 */
export function TrackDemosVisual({ text }: { text: UiText["trackDemosVisual"] }) {
  const demos = text.demos.map((demo, i) => ({ ...demo, seed: seeds[i % seeds.length] }));

  return (
    <figure className={styles.figure}>
      <div className={styles.device} aria-hidden="true">
        <div className={styles.top}>
          <span className={styles.heading}>{text.heading}</span>
          <span className={styles.count}>{text.count}</span>
        </div>

        <ul className={styles.list}>
          {demos.map((demo, i) => (
            <li key={demo.title} className={`${styles.row} ${i === 0 ? styles.active : ""}`}>
              <span className={styles.art} data-variant={i} />
              <span className={styles.text}>
                <span className={styles.title}>{demo.title}</span>
                <span className={styles.meta}>{demo.meta}</span>
              </span>
              <span className={styles.pill}>
                <svg viewBox="0 0 16 16" width="10" height="10">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor" />
                  <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.6" fill="none" />
                </svg>
                {demo.access}
              </span>
              <span className={styles.rowWave}>
                <Waveform bars={48} progress={i === 0 ? 0.55 : 0} seed={demo.seed} />
              </span>
            </li>
          ))}
        </ul>

        <div className={styles.player}>
          <span className={styles.play}>
            <svg viewBox="0 0 16 16" width="12" height="12">
              <rect x="4" y="3" width="2.6" height="10" rx="1" fill="currentColor" />
              <rect x="9.4" y="3" width="2.6" height="10" rx="1" fill="currentColor" />
            </svg>
          </span>
          <span className={styles.playerText}>
            <span className={styles.title}>{demos[0]?.title}</span>
            <span className={styles.meta}>{text.playerMeta}</span>
          </span>
          <span className={styles.time}>1:12</span>
        </div>
      </div>
      <figcaption className={styles.caption}>{text.caption}</figcaption>
    </figure>
  );
}
