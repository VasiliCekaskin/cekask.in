"use client";

import { useEffect } from "react";
import { confetti } from "@/lib/confetti";

const CODE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

/**
 * Easter egg: ↑ ↑ ↓ ↓ ← → ← → B A toggles party mode (the whole page cycles
 * through hues) with a confetti burst. Renders nothing.
 */
export function KonamiParty() {
  useEffect(() => {
    let pos = 0;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = key === CODE[pos] ? pos + 1 : key === CODE[0] ? 1 : 0;
      if (pos === CODE.length) {
        pos = 0;
        const on = document.documentElement.classList.toggle("party");
        if (on) confetti(undefined, 300);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}
