import Image from "next/image";
import Link from "next/link";
import { getContent, profile } from "@/content";
import type { Locale } from "@/i18n/config";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SocialLinks } from "./SocialLinks";
import styles from "./SiteHeader.module.css";

export function SiteHeader({ locale }: { locale: Locale }) {
  const { ui } = getContent(locale);
  const home = `/${locale}`;

  // Absolute paths so the links also work from the legal pages.
  const navItems = [
    { label: ui.nav.projects, href: `${home}#projects` },
    { label: ui.nav.about, href: `${home}#about` },
    { label: ui.nav.experience, href: `${home}#experience` },
    { label: ui.nav.contact, href: `${home}#contact` },
  ];

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href={home} className={styles.brand}>
          <span className={styles.mark}>
            {/* Decorative: the name next to it is the link text. */}
            <Image src={profile.avatar} alt="" width={800} height={800} sizes="80px" priority />
          </span>
          {profile.name}
        </Link>

        <nav aria-label={ui.nav.label} className={styles.nav}>
          <ul role="list" className={styles.navList}>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.navLink}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.tools}>
          <LanguageSwitcher locale={locale} label={ui.languageSwitcher} />
          <SocialLinks locale={locale} />
        </div>
      </div>
    </header>
  );
}
