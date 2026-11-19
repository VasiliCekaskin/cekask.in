"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { confetti } from "@/lib/confetti";
import styles from "./Peekaboo.module.css";

/**
 * Once the visitor has scrolled a bit, a face sneaks up from the bottom
 * corner for a few seconds. Click it and it says hi (with confetti) and
 * leaves for good. Shows at most once every 25 seconds.
 */
export function Peekaboo({ face, text, label }: { face: string; text: string; label: string }) {
  const [shown, setShown] = useState(false);
  const [caught, setCaught] = useState(false);
  const done = useRef(false);
  const lastShown = useRef(0);

  useEffect(() => {
    let hide: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      if (done.current || window.scrollY < 700) return;
      const now = Date.now();
      if (now - lastShown.current < 25000) return;
      lastShown.current = now;
      setShown(true);
      hide = setTimeout(() => {
        if (!done.current) setShown(false);
      }, 4500);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(hide);
    };
  }, []);

  const catchMe = (e: React.MouseEvent<HTMLButtonElement>) => {
    done.current = true;
    setCaught(true);
    const r = e.currentTarget.getBoundingClientRect();
    confetti({ x: r.left + r.width / 2, y: r.top }, 90);
    setTimeout(() => setShown(false), 2200);
  };

  return (
    <div className={styles.peek} data-shown={shown}>
      <p className={styles.bubble} data-shown={caught} aria-live="polite">
        {caught ? text : ""}
      </p>
      <button type="button" className={styles.face} onClick={catchMe} aria-label={label} tabIndex={shown ? 0 : -1}>
        <Image src={face} alt="" width={160} height={160} unoptimized />
      </button>
    </div>
  );
}
