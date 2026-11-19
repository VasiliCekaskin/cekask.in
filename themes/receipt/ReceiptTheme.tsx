import { mailHref } from "@/components/mailto";
import { getContent, profile } from "@/content";
import type { Locale } from "@/i18n/config";
import styles from "./ReceiptTheme.module.css";

/** "Receipt": Vasili as a till receipt, with a barcode. */
export function ReceiptTheme({ locale }: { locale: Locale }) {
  const { offers, contact, ui, mottos } = getContent(locale);
  const t = mottos.receipt;
  const mailto = mailHref(contact.mailSubject);

  return (
    <section className={`container ${styles.counter}`} aria-labelledby="receipt-title">
      <div className={styles.shadow}>
      <div className={styles.receipt}>
        <header className={styles.center}>
          <h1 id="receipt-title" className={styles.store}>
            {t.store}
          </h1>
          <p>{profile.name}</p>
          <p>{t.address}</p>
        </header>

        <p className={styles.rule} aria-hidden="true" />
        <div className={styles.meta}>
          {t.meta.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
        <p className={styles.rule} aria-hidden="true" />

        <ul className={styles.items}>
          {t.items.map((i) => (
            <li key={i.label}>
              <span>{i.label}</span>
              <span className={styles.dots} aria-hidden="true" />
              <span>{i.price}</span>
            </li>
          ))}
        </ul>

        <p className={styles.rule} aria-hidden="true" />
        <h2 className={styles.sub}>{t.extrasTitle}</h2>
        <ul className={styles.items}>
          {offers.items.map((o) => (
            <li key={o.title}>
              <span>{o.title}</span>
              <span className={styles.dots} aria-hidden="true" />
              <span>{o.price ?? ui.onRequest}</span>
            </li>
          ))}
          <li className={styles.discount}>
            <span>{t.discount.label}</span>
            <span className={styles.dots} aria-hidden="true" />
            <span>{t.discount.price}</span>
          </li>
        </ul>
        <p className={styles.small}>{t.charity}</p>

        <p className={styles.ruleDouble} aria-hidden="true" />
        <p className={styles.total}>
          <span>{t.totalLabel}</span>
          <span>{t.total}</span>
        </p>
        <p className={styles.ruleDouble} aria-hidden="true" />
        <p className={styles.center}>{t.payment}</p>

        <div className={styles.barcode} aria-hidden="true" />
        <p className={`${styles.center} ${styles.small}`}>{profile.email}</p>

        <div className={styles.center}>
          {t.thanks.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>

        {mailto && (
          <a href={mailto} className={styles.redeem}>
            {t.redeem} →
          </a>
        )}
      </div>
      </div>
    </section>
  );
}
