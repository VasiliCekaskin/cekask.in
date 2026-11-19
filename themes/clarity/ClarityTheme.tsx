import Image from "next/image";
import { mailHref } from "@/components/mailto";
import { getContent, profile } from "@/content";
import type { Locale } from "@/i18n/config";
import { GoToMotto } from "@/components/GoToMotto";
import styles from "./ClarityTheme.module.css";

/**
 * "Clarity", the recommended motto: big and shiny, with only what matters.
 * Who, what, three numbers, four skills, one button.
 */
export function ClarityTheme({ locale }: { locale: Locale }) {
  const { site, facts, contact, mottos } = getContent(locale);
  const t = mottos.clarity;
  const mailto = mailHref(contact.mailSubject);

  return (
    <section className={styles.stage} aria-labelledby="clarity-name">
      <div className={styles.glow} aria-hidden="true" />
      <div className={`container ${styles.inner}`}>
        <div className={styles.card}>
          <div className={styles.photoRing}>
            <div className={styles.photoClip}>
            <Image
              src={profile.portrait.src}
              alt={mottos.pro.photoAlt}
              width={profile.portrait.width}
              height={profile.portrait.height}
              sizes="36rem"
              className={styles.photo}
            />
            </div>
          </div>

          <p className={styles.badge}>✨ {t.badge}</p>
          <h1 id="clarity-name" className={styles.name}>
            {profile.name}
          </h1>
          <p className={styles.headline}>{t.headline}</p>
          <p className={styles.sub}>{t.sub}</p>

          <dl className={styles.facts}>
            {facts.map((f) => (
              <div key={f.value}>
                <dt>{f.value}</dt>
                <dd>{f.label}</dd>
              </div>
            ))}
          </dl>

          <h2 className="visually-hidden">{t.skillsTitle}</h2>
          <ul className={styles.skills} aria-label={t.skillsTitle}>
            {t.skills.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>

          <div className={styles.actions}>
            {mailto && (
              <a href={mailto} className={styles.cta}>
                {t.cta} →
              </a>
            )}
            <GoToMotto motto="pro" className={styles.secondary}>
              {t.secondary}
            </GoToMotto>
          </div>

          {profile.openToWork && (
            <p className={styles.status}>
              <span className={styles.lamp} aria-hidden="true" />
              {site.availability.headline} · {site.availability.detail}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
