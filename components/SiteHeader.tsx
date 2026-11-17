import Link from "next/link";
import { getContent, profile } from "@/content";
import type { Locale } from "@/i18n/config";
import { LanguageSwitcher } from "./LanguageSwitcher";
import styles from "./SiteHeader.module.css";

export function SiteHeader({ locale }: { locale: Locale }) {
  const { ui, site } = getContent(locale);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href={`/${locale}`} className={styles.brand}>
          <span className={styles.name}>
            {profile.name}
            <span className={styles.role}>{site.role}</span>
          </span>
        </Link>
        <LanguageSwitcher locale={locale} label={ui.languageSwitcher} />
      </div>
    </header>
  );
}
