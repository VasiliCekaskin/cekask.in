import { getContent, profile } from "@/content";
import type { Locale } from "@/i18n/config";
import { GitHubIcon, LinkedInIcon } from "./icons";
import styles from "./SocialLinks.module.css";

const icons = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
};

/** Icon links for every social profile that has a URL configured. */
export function SocialLinks({ locale, className }: { locale: Locale; className?: string }) {
  const { ui } = getContent(locale);
  const links = (Object.keys(icons) as (keyof typeof icons)[])
    .map((key) => ({ key, Icon: icons[key], ...profile.social[key] }))
    .filter((link) => link.url);

  if (links.length === 0) return null;

  return (
    <ul role="list" className={`${styles.list} ${className ?? ""}`}>
      {links.map(({ key, Icon, label, url }) => (
        <li key={key}>
          <a
            href={url!}
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label}${ui.newTab}`}
          >
            <Icon />
          </a>
        </li>
      ))}
    </ul>
  );
}
