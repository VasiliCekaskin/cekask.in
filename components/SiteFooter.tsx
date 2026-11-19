import Link from "next/link";
import { DIY_URL, getContent, profile } from "@/content";
import type { Locale } from "@/i18n/config";
import { ConsentSettingsButton } from "./ConsentBanner";
import { SocialLinks } from "./SocialLinks";
import styles from "./SiteFooter.module.css";

export function SiteFooter({ locale }: { locale: Locale }) {
  const { ui } = getContent(locale);

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <p>
            © {new Date().getFullYear()} {profile.name}. {ui.footer.note}
          </p>
          <p className={styles.colophon}>{ui.footer.colophon}</p>
        </div>
        <nav aria-label={ui.footer.legalLabel} className={styles.legal}>
          <Link href={`/${locale}/impressum`}>{ui.footer.impressum}</Link>
          <Link href={`/${locale}/datenschutz`}>{ui.footer.datenschutz}</Link>
          <ConsentSettingsButton label={ui.footer.consentSettings} />
          <a href={`${DIY_URL}/${locale}`} target="_blank" rel="noopener">
            {ui.footer.diy}
            <span aria-hidden="true">&nbsp;↗</span>
            <span className="visually-hidden">{ui.newTab}</span>
          </a>
          <SocialLinks locale={locale} />
        </nav>
      </div>
    </footer>
  );
}
