"use client";

import { createContext, useEffect, type ReactNode } from "react";
import type { MottoId } from "@/content/types";
import { useMotto } from "@/lib/motto";
import styles from "./MottoStage.module.css";

/** Every rendered motto, so the overview's in-game computer can show them as apps. */
export const StagesContext = createContext<Record<MottoId, ReactNode> | null>(null);

/**
 * Shows the home page: the overview until a motto is rolled or picked, then
 * that motto. Everything is rendered on the server and handed in here; only
 * the active view is mounted. It also sets html[data-motto], which switches
 * the design tokens for header and footer (unset on the overview).
 */
export function MottoStage({ overview, stages }: { overview: ReactNode; stages: Record<MottoId, ReactNode> }) {
  const motto = useMotto();

  useEffect(() => {
    if (motto) document.documentElement.dataset.motto = motto;
    else delete document.documentElement.dataset.motto;
    return () => {
      delete document.documentElement.dataset.motto;
    };
  }, [motto]);

  return (
    <div key={motto ?? "overview"} className={motto ? styles.stage : undefined}>
      {motto ? stages[motto] : <StagesContext.Provider value={stages}>{overview}</StagesContext.Provider>}
    </div>
  );
}
