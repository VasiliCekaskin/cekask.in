"use client";

import type { ReactNode } from "react";
import type { MottoId } from "@/content/types";
import { setMotto } from "@/lib/motto";
import { useComputer, type AppId } from "./ComputerContext";

/**
 * Opens an app in the in-game computer. Without the game, falls back to
 * switching the page to `fallback` (e.g. the whack game lives in "vibe").
 */
export function OpenApp({ app, fallback, className, children }: { app: AppId; fallback: MottoId; className?: string; children: ReactNode }) {
  const computer = useComputer();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (computer) return computer.open(app);
        setMotto(fallback);
        window.scrollTo({ top: 0 });
      }}
    >
      {children}
    </button>
  );
}
