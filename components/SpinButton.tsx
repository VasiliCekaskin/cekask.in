"use client";

import { usePathname } from "next/navigation";
import type { MottoId } from "@/content/types";
import { useMotto } from "@/lib/motto";
import styles from "./SpinButton.module.css";
import { useSpin } from "./useSpin";

type Props = {
  locale: string;
  text: { label: string; spinning: string; announce: string };
  names: Record<MottoId, string>;
};

/**
 * The slot-machine button in the header: rolls to a random motto. Shows the
 * current motto under its label. Only on the home page; icon-only on phones.
 */
export function SpinButton({ locale, text, names }: Props) {
  const pathname = usePathname();
  const motto = useMotto();
  const { rolling, spin, announced } = useSpin(names, text.announce);

  if (pathname !== `/${locale}`) return null;

  const shown = rolling ?? motto;

  return (
    <>
      <button
        type="button"
        className={styles.button}
        onClick={spin}
        data-rolling={rolling !== null}
        aria-label={motto ? `${text.label} (${names[motto]})` : text.label}
      >
        <span className={styles.icon} aria-hidden="true">
          🎰
        </span>
        <span className={styles.text} aria-hidden="true">
          {shown ? (
            <>
              <span className={styles.small}>{rolling ? text.spinning : text.label}</span>
              <span className={styles.name}>{names[shown]}</span>
            </>
          ) : (
            <span className={styles.single}>{text.label}</span>
          )}
        </span>
      </button>
      <span className="visually-hidden" aria-live="polite">
        {announced}
      </span>
    </>
  );
}
