import Image from "next/image";
import { mailHref } from "@/components/mailto";
import { getContent, profile } from "@/content";
import type { Locale } from "@/i18n/config";
import styles from "./WantedTheme.module.css";

/** "Wanted": an old western wanted poster. */
export function WantedTheme({ locale }: { locale: Locale }) {
  const { offers, contact, ui, mottos } = getContent(locale);
  const t = mottos.wanted;
  const mailto = mailHref(contact.mailSubject);

  return (
    <section className={`container ${styles.wall}`} aria-labelledby="wanted-title">
      <div className={styles.poster}>
        <span className={styles.nail} aria-hidden="true" />
        <h1 id="wanted-title" className={styles.wanted}>
          {t.wanted}
        </h1>
        <p className={styles.by}>{t.by}</p>

        <figure className={styles.photo}>
          <Image
            src={profile.portrait.src}
            alt={t.photoAlt}
            width={profile.portrait.width}
            height={profile.portrait.height}
            sizes="36rem"
          />
        </figure>

        <p className={styles.name}>{profile.name}</p>
        <p className={styles.alias}>{t.alias}</p>

        <div className={styles.charges}>
          <h2 className={styles.h2}>{t.chargesTitle}</h2>
          <ul>
            {t.charges.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>

        <p className={styles.reward}>{t.reward}</p>
        <p className={styles.rewardText}>{t.rewardText}</p>
        <p className={styles.lastSeen}>{t.lastSeen}</p>

        <div className={styles.sightings}>
          <h2 className={styles.h2}>{t.sightingsTitle}</h2>
          <ul>
            {offers.items.map((o) => (
              <li key={o.title}>
                {o.title} — <strong>{o.price ?? ui.onRequest}</strong>
              </li>
            ))}
            <li>{offers.charity.title}</li>
          </ul>
        </div>

        {mailto && (
          <p className={styles.tips}>
            {t.tips}{" "}
            <a href={mailto} className={styles.email}>
              {profile.email}
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
