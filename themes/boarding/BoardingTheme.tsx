import { mailHref } from "@/components/mailto";
import { getContent, profile } from "@/content";
import type { Locale } from "@/i18n/config";
import styles from "./BoardingTheme.module.css";

/** "Boarding pass": flight VC 007 from Düsseldorf to your team. */
export function BoardingTheme({ locale }: { locale: Locale }) {
  const { offers, contact, ui, mottos } = getContent(locale);
  const t = mottos.boarding;
  const mailto = mailHref(contact.mailSubject);

  return (
    <section className={`container ${styles.wrap}`} aria-labelledby="boarding-title">
      <div className={styles.pass}>
        <div className={styles.main}>
          <header className={styles.head}>
            <p className={styles.airline}>✈ {t.airline}</p>
            <h1 id="boarding-title" className={styles.passLabel}>
              {t.pass}
            </h1>
          </header>

          <div className={styles.route}>
            <div>
              <p className={styles.code}>{t.from.code}</p>
              <p className={styles.city}>{t.from.city}</p>
            </div>
            <div className={styles.plane} aria-hidden="true">
              <span>✈</span>
            </div>
            <div className={styles.to}>
              <p className={styles.code}>{t.to.code}</p>
              <p className={styles.city}>{t.to.city}</p>
            </div>
          </div>

          <dl className={styles.fields}>
            <div className={styles.passenger}>
              <dt>{t.passengerLabel}</dt>
              <dd>{profile.name.toUpperCase()}</dd>
            </div>
            {t.fields.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>

          <div className={styles.lists}>
            <section>
              <h2 className={styles.h2}>{t.baggageTitle}</h2>
              <ul>
                {t.baggage.map((b) => (
                  <li key={b}>🧳 {b}</li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className={styles.h2}>{t.extrasTitle}</h2>
              <ul>
                {offers.items.map((o) => (
                  <li key={o.title}>
                    {o.title} · <strong>{o.price ?? ui.onRequest}</strong>
                  </li>
                ))}
                <li>💛 {offers.charity.title}</li>
              </ul>
            </section>
          </div>
        </div>

        <div className={styles.stub}>
          <p className={styles.stubRoute}>
            {t.from.code} → {t.to.code}
          </p>
          <p className={styles.stubName}>{profile.name}</p>
          <div className={styles.barcode} aria-hidden="true" />
          {mailto && (
            <a href={mailto} className={styles.cta}>
              {t.cta}
            </a>
          )}
          <p className={styles.notice}>{t.notice}</p>
        </div>
      </div>
    </section>
  );
}
