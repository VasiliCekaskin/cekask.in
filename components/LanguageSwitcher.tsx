"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeNames, locales, type Locale } from "@/i18n/config";
import styles from "./LanguageSwitcher.module.css";

/**
 * Links to the current page in every language. A client component only
 * because it needs the current path.
 */
export function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname() ?? `/${locale}`;
  const rest = pathname.split("/").slice(2).join("/");

  return (
    <nav aria-label={label}>
      <ul role="list" className={styles.list}>
        {locales.map((target) => (
          <li key={target}>
            <Link
              href={`/${target}${rest ? `/${rest}` : ""}`}
              hrefLang={target}
              lang={target}
              className={styles.link}
              aria-current={target === locale ? "true" : undefined}
            >
              <span aria-hidden="true">{target.toUpperCase()}</span>
              <span className="visually-hidden">{localeNames[target]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
