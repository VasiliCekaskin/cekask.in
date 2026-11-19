"use client";

import type { MottoId } from "@/content/types";
import styles from "./RollButton.module.css";
import { useSpin } from "./useSpin";

type Props = {
  label: string;
  hint: string;
  announce: string;
  names: Record<MottoId, string>;
};

/** The big call to action on the overview: roll one random motto. */
export function RollButton({ label, hint, announce, names }: Props) {
  const { rolling, spin, announced } = useSpin(names, announce);

  return (
    <>
      <button type="button" className={styles.button} onClick={spin} data-rolling={rolling !== null}>
        <span className={styles.icon} aria-hidden="true">
          🎰
        </span>
        <span className={styles.text}>
          <span className={styles.label}>{label}</span>
          <span className={styles.hint} aria-hidden={rolling !== null}>
            {rolling ? names[rolling] : hint}
          </span>
        </span>
      </button>
      <span className="visually-hidden" aria-live="polite">
        {announced}
      </span>
    </>
  );
}
