import { getContent, profile } from "@/content";
import type { Locale } from "@/i18n/config";
import { AvailabilityFlag } from "./AvailabilityFlag";
import { mailHref } from "./mailto";
import styles from "./Offers.module.css";

/** The side services as a numbered price list, not a grid of cards. */
export function Offers({ locale }: { locale: Locale }) {
  const { offers, ui } = getContent(locale);
  const mailto = mailHref(offers.mailSubject);

  return (
    <section id="offers" className={styles.section} aria-labelledby="offers-title">
      <div className="container rail">
        <p className="rail-label" aria-hidden="true">
          {ui.sections.offers}
        </p>

        <div>
          <header className={styles.head}>
            <div className={styles.headText}>
              <h2 id="offers-title" className={styles.title}>
                {offers.title}
              </h2>
              <p className={styles.intro}>{offers.intro}</p>
            </div>
            <div className={styles.headAction}>
              <AvailabilityFlag show={profile.hasCapacity} text={offers.availability} />
              {mailto && (
                <a href={mailto} className="quiet-link">
                  {offers.button}
                </a>
              )}
            </div>
          </header>

          <ol className={styles.list} aria-label={ui.offersList}>
            {offers.items.map((offer, i) => (
              <li key={offer.title} className={styles.item}>
                <span className={styles.num} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className={styles.body}>
                  <h3 className={styles.itemTitle}>{offer.title}</h3>
                  <p className={styles.text}>{offer.text}</p>
                  <p className={styles.outcome}>
                    <span className={styles.outcomeLabel}>{ui.outcome}</span> {offer.outcome}
                  </p>
                </div>
                <div className={styles.terms}>
                  <p className={offer.price ? styles.price : styles.priceMuted}>
                    {offer.price ?? ui.onRequest}
                  </p>
                  <p className={styles.format}>{offer.format}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
