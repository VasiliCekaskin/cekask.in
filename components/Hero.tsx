import { getContent, profile } from "@/content";
import type { Locale } from "@/i18n/config";
import { AvailabilityFlag } from "./AvailabilityFlag";
import { Emphasis } from "./Emphasis";
import { ArrowUpRightIcon } from "./icons";
import { IntroVideo, showVideoSlot } from "./IntroVideo";
import { mailHref } from "./mailto";
import styles from "./Hero.module.css";

export function Hero({ locale }: { locale: Locale }) {
  const { site, facts, contact, ui } = getContent(locale);
  const mailto = mailHref(contact.mailSubject);
  const hasVideo = showVideoSlot;

  return (
    <section
      className={`container ${styles.hero} ${hasVideo ? styles.withVideo : ""}`}
      aria-labelledby="intro-title"
    >
      <div className={styles.text}>
        <AvailabilityFlag show={profile.openToWork} text={site.availability} />

        <h1 id="intro-title" className={styles.title}>
          <Emphasis text={site.headline} />
        </h1>
        <p className={styles.intro}>{site.intro}</p>

        <div className={styles.actions}>
          {mailto && (
            <a href={mailto} className="button">
              {contact.button}
            </a>
          )}
          <a href="#offers" className="quiet-link">
            {ui.seeOffers}
          </a>
        </div>
      </div>

      {hasVideo && (
        <div className={styles.media}>
          <IntroVideo locale={locale} />
        </div>
      )}

      <dl className={styles.facts} aria-label={ui.factsLabel}>
        {facts.map((fact) => (
          <div key={fact.value} className={styles.fact}>
            <dt>{fact.value}</dt>
            <dd>
              {fact.label}
              {fact.link?.url && (
                <>
                  {" · "}
                  <a href={fact.link.url} target="_blank" rel="noopener noreferrer" className={styles.factLink}>
                    {fact.link.label}
                    <ArrowUpRightIcon size={12} />
                    <span className="visually-hidden">{ui.newTab}</span>
                  </a>
                </>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
