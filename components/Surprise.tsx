"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { confetti } from "@/lib/confetti";
import styles from "./Surprise.module.css";

type Props = {
  face: string;
  faceAlt: string;
  text: {
    label: string;
    title: string;
    text: string;
    button: string;
    reveals: string[];
    sub: string;
    close: string;
  };
};

/**
 * "Don't press this button." Pressing it slams a giant grinning face onto
 * the screen with "Ha! You didn't expect that." and confetti. Each press
 * after that gets a different line. Uses a native <dialog>, so Esc and focus
 * handling come for free.
 */
export function Surprise({ face, faceAlt, text }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [presses, setPresses] = useState(0);

  const open = () => {
    setPresses((n) => n + 1);
    dialog.current?.showModal();
    confetti(undefined, 220);
  };

  const close = () => dialog.current?.close();

  // Close on a click on the backdrop (outside the content box).
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onClick = (e: MouseEvent) => {
      if (e.target === el) el.close();
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, []);

  const reveal = text.reveals[Math.max(0, presses - 1) % text.reveals.length];

  return (
    <section className={`container ${styles.section}`} aria-labelledby="surprise-title">
      <div className={styles.panel}>
        <p className="tag">{text.label}</p>
        <h2 id="surprise-title" className={styles.title}>
          {text.title}
        </h2>
        <p className={styles.text}>{text.text}</p>
        <button type="button" className={styles.bigRed} onClick={open}>
          <span className={styles.cap}>{text.button}</span>
        </button>
      </div>

      <dialog ref={dialog} className={styles.dialog} aria-labelledby="surprise-reveal">
        {/* Re-mount on every press so the zoom animation replays. */}
        <div key={presses} className={styles.reveal}>
          <p id="surprise-reveal" className={styles.ha}>
            {reveal}
          </p>
          <Image src={face} alt={faceAlt} width={400} height={400} unoptimized className={styles.face} />
          <p className={styles.sub}>{text.sub}</p>
          <button type="button" className="button" onClick={close} autoFocus>
            {text.close}
          </button>
        </div>
      </dialog>
    </section>
  );
}
