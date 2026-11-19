"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { confetti } from "@/lib/confetti";
import styles from "./PokeFace.module.css";

type Props = {
  faces: { grin: string; wink: string; shock: string };
  alt: string;
  hint: string;
  lines: string[];
};

/**
 * The big grinning face. Every poke wobbles it, flips the expression for a
 * moment and cycles a cheeky speech bubble. Every fifth poke: confetti.
 */
export function PokeFace({ faces, alt, hint, lines }: Props) {
  const [pokes, setPokes] = useState(0);
  const [face, setFace] = useState<keyof Props["faces"]>("grin");
  const [wobbleKey, setWobbleKey] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const poke = (event: React.MouseEvent<HTMLButtonElement>) => {
    const next = pokes + 1;
    setPokes(next);
    setWobbleKey((k) => k + 1);
    setFace(next % 3 === 0 ? "shock" : "wink");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setFace("grin"), 700);
    if (next % 5 === 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      confetti({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 3 });
    }
  };

  const line = pokes > 0 ? lines[(pokes - 1) % lines.length] : null;

  return (
    <div className={styles.wrap}>
      <div className={styles.blob} aria-hidden="true" />
      <button type="button" className={styles.face} onClick={poke} aria-label={`${alt}. ${hint}`}>
        <span key={wobbleKey} className={pokes > 0 ? styles.wobble : undefined}>
          {(["grin", "wink", "shock"] as const).map((key) => (
            <Image
              key={key}
              src={faces[key]}
              alt=""
              width={400}
              height={400}
              unoptimized
              priority={key === "grin"}
              className={styles.img}
              data-shown={face === key}
            />
          ))}
        </span>
      </button>

      <p className={styles.hint} aria-hidden="true">
        {hint} ☝️
      </p>

      <p className={styles.bubble} data-shown={line !== null} aria-live="polite">
        {line}
      </p>

      {pokes > 0 && (
        <p className={styles.counter} aria-hidden="true">
          ×{pokes}
        </p>
      )}
    </div>
  );
}
