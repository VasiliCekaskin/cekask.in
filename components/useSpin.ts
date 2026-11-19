"use client";

import { useEffect, useRef, useState } from "react";
import type { MottoId } from "@/content/types";
import { MOTTOS, spinMotto } from "@/lib/motto";

/**
 * The slot-machine roll shared by the header button and the big button on
 * the overview: flicks through the motto names for a moment, then lands on
 * a new motto and scrolls to the top.
 */
export function useSpin(names: Record<MottoId, string>, announce: string) {
  const [rolling, setRolling] = useState<MottoId | null>(null);
  const [announced, setAnnounced] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  const land = () => {
    const next = spinMotto();
    setRolling(null);
    setAnnounced(`${announce} ${names[next]}`);
    window.scrollTo({ top: 0 });
  };

  const spin = () => {
    if (rolling) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      land();
      return;
    }
    let i = Math.floor(Math.random() * MOTTOS.length);
    let steps = 0;
    setRolling(MOTTOS[i % MOTTOS.length]);
    timer.current = setInterval(() => {
      i += 1;
      steps += 1;
      setRolling(MOTTOS[i % MOTTOS.length]);
      if (steps >= 9) {
        if (timer.current) clearInterval(timer.current);
        land();
      }
    }, 70);
  };

  return { rolling, spin, announced };
}
