import { getContent, profile } from "@/content";
import type { Locale } from "@/i18n/config";
import { AvailabilityFlag } from "./AvailabilityFlag";
import { mailHref } from "./mailto";
import styles from "./Contact.module.css";

/** The address itself is the call to action. */
export function Contact({ locale }: { locale: Locale }) {
  const { contact, site, ui } = getContent(locale);
  const mailto = mailHref(contact.mailSubject);

  return (
    <section id="contact" className={`container rail ${styles.contact}`} aria-labelledby="contact-title">
      <p className="rail-label" aria-hidden="true">
        {ui.sections.contact}
      </p>

      <div className={styles.body}>
        <AvailabilityFlag show={profile.openToWork} text={site.availability} />
        <h2 id="contact-title" className={styles.title}>
          {contact.title}
        </h2>
        <p className={styles.text}>{contact.text}</p>
        {mailto && (
          <a href={mailto} className={styles.email}>
            {profile.email}
            <span className={styles.arrow} aria-hidden="true">
              →
            </span>
            <span className="visually-hidden"> ({contact.button})</span>
          </a>
        )}
        {contact.note && <p className={styles.note}>{contact.note}</p>}
      </div>
    </section>
  );
}
