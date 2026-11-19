import Image from "next/image";
import { getContent, profile } from "@/content";
import type { Locale } from "@/i18n/config";
import { AvailabilityFlag } from "./AvailabilityFlag";
import { ConfettiLink } from "./ConfettiLink";
import { mailHref } from "./mailto";
import styles from "./Contact.module.css";

/** The grand finale: a huge email button with confetti. */
export function Contact({ locale }: { locale: Locale }) {
  const { contact, site } = getContent(locale);
  const mailto = mailHref(contact.mailSubject);

  return (
    <section id="contact" className={`container ${styles.contact}`} aria-labelledby="contact-title">
      <div className={styles.card}>
        <Image src={profile.faces.wink} alt="" width={240} height={240} unoptimized className={styles.face} />
        <div className={styles.body}>
          <AvailabilityFlag show={profile.openToWork} text={site.availability} />
          <h2 id="contact-title" className={styles.title}>
            {contact.title}
          </h2>
          <p className={styles.text}>{contact.text}</p>
          {mailto && (
            <ConfettiLink href={mailto} className={styles.email}>
              <span>{profile.email}</span>
              <span className={styles.arrow} aria-hidden="true">
                ✉️
              </span>
              <span className="visually-hidden"> ({contact.button})</span>
            </ConfettiLink>
          )}
          {contact.note && <p className={styles.note}>{contact.note}</p>}
        </div>
      </div>
    </section>
  );
}
