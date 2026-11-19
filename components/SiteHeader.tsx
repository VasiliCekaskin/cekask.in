import { getContent, profile } from "@/content";
import type { Locale } from "@/i18n/config";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { AllMottosButton, BrandLink } from "./OverviewLink";
import { SpinButton } from "./SpinButton";
import styles from "./SiteHeader.module.css";

export function SiteHeader({ locale }: { locale: Locale }) {
  const { ui, site, mottos } = getContent(locale);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <BrandLink locale={locale} className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            V
          </span>
          <span className={styles.name}>
            {profile.name}
            <span className={styles.role}>{site.role}</span>
          </span>
        </BrandLink>
        <div className={styles.tools}>
          <AllMottosButton locale={locale} label={mottos.overview.all} />
          <SpinButton locale={locale} text={mottos.spin} names={mottos.names} />
          <span className={styles.divider} aria-hidden="true" />
          <LanguageSwitcher locale={locale} label={ui.languageSwitcher} />
        </div>
      </div>
    </header>
  );
}
