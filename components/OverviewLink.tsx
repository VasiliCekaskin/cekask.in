"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { showOverview, useMotto } from "@/lib/motto";
import styles from "./OverviewLink.module.css";

/**
 * The brand link: goes to the home page and always lands on the overview,
 * even when you're already on the home page looking at a motto.
 */
export function BrandLink({ locale, className, children }: { locale: string; className?: string; children: ReactNode }) {
  const pathname = usePathname();

  return (
    <Link
      href={`/${locale}`}
      className={className}
      onClick={(event) => {
        showOverview();
        // Already home: no navigation, just back to the top of the overview.
        if (pathname === `/${locale}`) {
          event.preventDefault();
          window.scrollTo({ top: 0 });
        }
      }}
    >
      {children}
    </Link>
  );
}

/** "All mottos": back to the overview. Home page only, while a motto is shown. */
export function AllMottosButton({ locale, label }: { locale: string; label: string }) {
  const pathname = usePathname();
  const motto = useMotto();

  if (pathname !== `/${locale}` || motto === null) return null;

  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => {
        showOverview();
        window.scrollTo({ top: 0 });
      }}
    >
      <svg className={styles.icon} viewBox="0 0 16 16" aria-hidden="true">
        <rect x="1.5" y="1.5" width="5" height="5" rx="1.2" />
        <rect x="9.5" y="1.5" width="5" height="5" rx="1.2" />
        <rect x="1.5" y="9.5" width="5" height="5" rx="1.2" />
        <rect x="9.5" y="9.5" width="5" height="5" rx="1.2" />
      </svg>
      <span className={styles.label}>{label}</span>
    </button>
  );
}
