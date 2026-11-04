import Link from "next/link";
import { getContent, profile } from "@/content";
import type { Locale } from "@/i18n/config";
import { SocialLinks } from "./SocialLinks";
import styles from "./SiteFooter.module.css";

export function SiteFooter({ locale }: { locale: Locale }) {
  const { ui } = getContent(locale);

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.copy}>
          © {new Date().getFullYear()} {profile.name}
          <span className={styles.note}>{ui.footer.note}</span>
        </p>
        <nav aria-label={ui.footer.legalLabel} className={styles.legal}>
          <Link href={`/${locale}/impressum`}>{ui.footer.impressum}</Link>
          <Link href={`/${locale}/datenschutz`}>{ui.footer.datenschutz}</Link>
        </nav>
        <SocialLinks locale={locale} />
      </div>
    </footer>
  );
}
