import { getContent, profile } from "@/content";
import type { Locale } from "@/i18n/config";
import { AvailabilityFlag } from "./AvailabilityFlag";
import { mailHref } from "./mailto";
import styles from "./Offers.module.css";

const CARD_COLORS = ["var(--pop-3)", "var(--pop-2)", "var(--pop-5)"];
const EMOJI = ["🛠️", "🌐", "🧠"];

/** The side services as chunky, tilted price cards. */
export function Offers({ locale }: { locale: Locale }) {
  const { offers, ui } = getContent(locale);
  const mailto = mailHref(offers.mailSubject);
  const charityMailto = mailHref(offers.charity.mailSubject);

  return (
    <section id="offers" className={styles.section} aria-labelledby="offers-title">
      <div className="container">
        <header className={styles.head}>
          <div className={styles.headText}>
            <p className="tag">{ui.sections.offers}</p>
            <h2 id="offers-title" className={styles.title}>
              {offers.title}
            </h2>
            <p className={styles.intro}>{offers.intro}</p>
          </div>
          <div className={styles.headAction}>
            <AvailabilityFlag show={profile.hasCapacity} text={offers.availability} />
            {mailto && (
              <a href={mailto} className="button button-secondary">
                {offers.button} →
              </a>
            )}
          </div>
        </header>

        <ol className={styles.list} aria-label={ui.offersList}>
          {offers.items.map((offer, i) => (
            <li
              key={offer.title}
              className={styles.item}
              style={{ "--c": CARD_COLORS[i % CARD_COLORS.length] } as React.CSSProperties}
            >
              <div className={styles.top}>
                <span className={styles.emoji} aria-hidden="true">
                  {EMOJI[i % EMOJI.length]}
                </span>
                <p className={offer.price ? styles.price : styles.priceMuted}>{offer.price ?? ui.onRequest}</p>
              </div>
              <h3 className={styles.itemTitle}>{offer.title}</h3>
              <p className={styles.text}>{offer.text}</p>
              <p className={styles.outcome}>
                <span className={styles.outcomeLabel}>{ui.outcome}</span> {offer.outcome}
              </p>
              <p className={styles.format}>{offer.format}</p>
            </li>
          ))}
        </ol>

        <aside className={styles.charity} aria-labelledby="charity-title">
          <span className={styles.heart} aria-hidden="true">
            💛
          </span>
          <div className={styles.charityText}>
            <h3 id="charity-title" className={styles.charityTitle}>
              {offers.charity.title}
            </h3>
            <p>{offers.charity.text}</p>
          </div>
          {charityMailto && (
            <a href={charityMailto} className="button">
              {offers.charity.button} →
            </a>
          )}
        </aside>
      </div>
    </section>
  );
}
