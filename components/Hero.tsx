import { getContent, profile } from "@/content";
import type { Locale } from "@/i18n/config";
import { AvailabilityFlag } from "./AvailabilityFlag";
import { Emphasis } from "./Emphasis";
import { ArrowUpRightIcon } from "./icons";
import { mailHref } from "./mailto";
import { PokeFace } from "./PokeFace";
import { Stickers } from "./Stickers";
import styles from "./Hero.module.css";

const FACT_COLORS = ["var(--pop-3)", "var(--pop-4)", "var(--pop-1)"];

export function Hero({ locale }: { locale: Locale }) {
  const { site, facts, contact, ui, fun } = getContent(locale);
  const mailto = mailHref(contact.mailSubject);

  return (
    <section className={`container ${styles.hero}`} aria-labelledby="intro-title">
      <div className={styles.text}>
        <AvailabilityFlag show={profile.openToWork} text={site.availability} />

        <h1 id="intro-title" className={styles.title}>
          <Emphasis text={site.headline} />
        </h1>
        <p className={styles.intro}>{site.intro}</p>

        <div className={styles.actions}>
          {mailto && (
            <a href={mailto} className="button">
              {contact.button} <span aria-hidden="true">✉️</span>
            </a>
          )}
          <a href="#offers" className="button button-secondary">
            {ui.seeOffers}
          </a>
        </div>
        <p className={styles.dragHint}>{fun.dragHint}</p>
      </div>

      <div className={styles.art}>
        <PokeFace faces={profile.faces} alt={fun.faceAlt} hint={fun.faceHint} lines={fun.faceLines} />
        <Stickers words={fun.stickers} />
      </div>

      <dl className={styles.facts} aria-label={ui.factsLabel}>
        {facts.map((fact, i) => (
          <div
            key={fact.value}
            className={styles.fact}
            style={{ "--c": FACT_COLORS[i % FACT_COLORS.length] } as React.CSSProperties}
          >
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
