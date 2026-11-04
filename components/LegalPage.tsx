import type { ReactNode } from "react";
import { getContent, legal } from "@/content";
import type { Locale } from "@/i18n/config";
import styles from "./LegalPage.module.css";

type Props = { locale: Locale; title: string; children: ReactNode };

export function LegalPage({ locale, title, children }: Props) {
  return (
    <article className={`container ${styles.page}`}>
      <h1 className={styles.title}>{title}</h1>
      {legal.showDraftNotice && (
        <p className={styles.draft} role="note">
          {getContent(locale).ui.legal.draftNotice}
        </p>
      )}
      <div className={styles.prose}>{children}</div>
    </article>
  );
}

/**
 * Prints a value, or a clearly marked placeholder when it hasn't been
 * provided yet.
 */
export function Value({ value, missing }: { value: string | null; missing: string }) {
  if (value) return <>{value}</>;
  return <mark className={styles.missing}>[{missing}]</mark>;
}
