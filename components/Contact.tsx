import { getContent, profile } from "@/content";
import type { Locale } from "@/i18n/config";
import { ArrowUpRightIcon, GitHubIcon, LinkedInIcon, MailIcon } from "./icons";
import styles from "./Contact.module.css";

export function Contact({ locale }: { locale: Locale }) {
  const { contact, ui } = getContent(locale);
  const profiles = [
    { ...profile.social.github, Icon: GitHubIcon },
    { ...profile.social.linkedin, Icon: LinkedInIcon },
  ].filter((profile) => profile.url);

  return (
    <section id="contact" aria-labelledby="contact-heading" className={styles.section}>
      {/* The hero's grid floor again, closing the page. */}
      <div className={styles.floor} aria-hidden="true">
        <div className={styles.grid} />
      </div>
      <div className={`container ${styles.inner}`}>
        <p className="label">
          <span className={styles.index}>05</span> {ui.contact.label}
        </p>

        <h2 id="contact-heading" className={styles.title}>
          {contact.title}
        </h2>
        <p className={styles.intro}>{contact.intro}</p>

        <div className={styles.channels}>
          {profile.email && (
            <a href={`mailto:${profile.email}`} className={styles.email}>
              <MailIcon size={22} />
              {profile.email}
            </a>
          )}

          {profiles.length > 0 && (
            <ul role="list" className={styles.profiles}>
              {profiles.map(({ label, url, Icon }) => (
                <li key={label}>
                  <a href={url!} className="text-link" target="_blank" rel="noopener noreferrer">
                    <Icon size={16} />
                    {label}
                    <ArrowUpRightIcon />
                    <span className="visually-hidden">{ui.newTab}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.audiences}>
          {contact.audiences.map((audience) => (
            <div key={audience.title} className={styles.audience}>
              <h3 className={styles.audienceTitle}>{audience.title}</h3>
              <p>{audience.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
