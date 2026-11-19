"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./AdBreak.module.css";

const LOCK_SECONDS = 2;
const SLIDE_MS = 900;

type AdText = {
  badge: string;
  wait: string;
  continue: string;
  slides: string[];
  cta: string;
  fine: string;
};

type Props = {
  open: boolean;
  /** Watched to the end: grant the extra round. */
  onDone: () => void;
  /** Closed while still locked: no extra round. */
  onAbort: () => void;
  faces: { grin: string; wink: string; shock: string };
  video: { src: string; poster?: string } | null;
  email: string | null;
  text: AdText;
};

/**
 * A fake "commercial" for Vasili, shown when someone buys another game
 * round with an ad. The continue button stays locked for two seconds.
 * Plays `video` when set; otherwise an animated slideshow of slogans.
 */
export function AdBreak({ open, onDone, onAbort, faces, video, email, text }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [left, setLeft] = useState(LOCK_SECONDS);
  const [slide, setSlide] = useState(0);

  // Open/close the native dialog and run the lock countdown and slides.
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (!open) {
      if (el.open) el.close();
      return;
    }
    el.showModal();
    const startedAt = performance.now();
    const tick = setInterval(() => {
      const elapsed = performance.now() - startedAt;
      setLeft(Math.max(0, Math.ceil(LOCK_SECONDS - elapsed / 1000)));
      setSlide(Math.floor(elapsed / SLIDE_MS));
    }, 100);
    return () => clearInterval(tick);
  }, [open]);

  // Esc is blocked while the ad is locked. Browsers still let a repeated Esc
  // through; closing early just means no extra round (onAbort).
  const locked = left > 0;
  const onCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    if (locked) e.preventDefault();
  };
  const onClose = () => {
    if (!open) return;
    if (locked) onAbort();
    else onDone();
  };

  const faceList = [faces.grin, faces.wink, faces.shock];
  const line = text.slides[slide % text.slides.length];

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-label={text.badge}
      onCancel={onCancel}
      onClose={onClose}
    >
      <div className={styles.top}>
        <span className={styles.badge}>{text.badge}</span>
        <span className={styles.timer} aria-live="polite">
          {locked ? `${text.wait} ${left}s` : ""}
        </span>
      </div>

      {video ? (
        <video
          className={styles.video}
          src={video.src}
          poster={video.poster}
          autoPlay
          playsInline
          controls={false}
        />
      ) : (
        <div className={styles.stage}>
          <div className={styles.rays} aria-hidden="true" />
          <Image
            key={`face-${slide % faceList.length}`}
            src={faceList[slide % faceList.length]}
            alt=""
            width={300}
            height={300}
            unoptimized
            className={styles.face}
          />
          <p key={`line-${slide}`} className={styles.slogan}>
            {line}
          </p>
          <p className={styles.burst} aria-hidden="true">
            NEW!
          </p>
        </div>
      )}

      <div className={styles.bottom}>
        {email && (
          <p className={styles.cta}>
            {text.cta} <strong>{email}</strong>
          </p>
        )}
        <p className={styles.fine}>{text.fine}</p>
        <button type="button" className="button" onClick={onDone} disabled={locked}>
          {locked ? `${text.wait} ${left}s` : `${text.continue} 🔨`}
        </button>
      </div>
    </dialog>
  );
}
