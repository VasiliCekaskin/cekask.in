import Image from "next/image";
import { mailHref } from "@/components/mailto";
import { getContent, profile } from "@/content";
import type { Locale } from "@/i18n/config";
import styles from "./PaperTheme.module.css";

/** "The Daily Vasili": a tabloid front page. */
export function PaperTheme({ locale }: { locale: Locale }) {
  const { facts, offers, contact, ui, mottos } = getContent(locale);
  const t = mottos.paper;
  const mailto = mailHref(contact.mailSubject);
  const offersMail = mailHref(offers.mailSubject);
  const charityMail = mailHref(offers.charity.mailSubject);

  return (
    <article className={`container ${styles.paper}`} aria-labelledby="paper-headline">
      <header className={styles.masthead}>
        <p className={styles.mastName}>{t.masthead}</p>
        <p className={styles.tagline}>{t.tagline}</p>
        <p className={styles.dateline}>{t.dateline}</p>
      </header>

      <div className={styles.front}>
        <div className={styles.lead}>
          <p className={styles.kicker}>{t.kicker}</p>
          <h1 id="paper-headline" className={styles.headline}>
            {t.headline}
          </h1>
          <p className={styles.subhead}>{t.subhead}</p>

          <figure className={styles.figure}>
            <Image
              src={profile.portrait.src}
              alt={mottos.pro.photoAlt}
              width={profile.portrait.width}
              height={profile.portrait.height}
              sizes="(min-width: 52rem) 40vw, 100vw"
            />
            <figcaption>{t.photoCaption}</figcaption>
          </figure>

          <div className={styles.columns}>
            {t.article.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <blockquote className={styles.quote}>
              <p>{t.quote}</p>
              <footer>— {t.quoteBy}</footer>
            </blockquote>
          </div>
        </div>

        <aside className={styles.sidebar}>
          <section className={styles.box}>
            <h2 className={styles.boxTitle}>{t.factsTitle}</h2>
            <dl className={styles.facts}>
              {facts.map((f) => (
                <div key={f.value}>
                  <dt>{f.value}</dt>
                  <dd>{f.label}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={`${styles.box} ${styles.classifieds}`}>
            <h2 className={styles.boxTitle}>{t.classifiedsTitle}</h2>
            {offers.items.map((o) => (
              <div key={o.title} className={styles.ad}>
                <p className={styles.adTitle}>{o.title}</p>
                <p>{o.text}</p>
                <p className={styles.adPrice}>{o.price ?? ui.onRequest}</p>
              </div>
            ))}
            {offersMail && (
              <a href={offersMail} className={styles.boxLink}>
                {t.classifiedsCta} →
              </a>
            )}
          </section>

          <section className={styles.box}>
            <h2 className={styles.boxTitle}>{t.weatherTitle}</h2>
            <p>☀️ {t.weather}</p>
          </section>

          <section className={styles.box}>
            <h2 className={styles.boxTitle}>{t.horoscopeTitle}</h2>
            <p>♒ {t.horoscope}</p>
          </section>

          <section className={`${styles.box} ${styles.appeal}`}>
            <h2 className={styles.boxTitle}>{t.charityTitle}</h2>
            <p className={styles.adTitle}>{offers.charity.title}</p>
            <p>{offers.charity.text}</p>
            {charityMail && (
              <a href={charityMail} className={styles.boxLink}>
                {offers.charity.button} →
              </a>
            )}
          </section>
        </aside>
      </div>

      <footer className={styles.letters}>
        <h2 className={styles.boxTitle}>{t.lettersTitle}</h2>
        <p>{t.letters}</p>
        {mailto && profile.email && (
          <a href={mailto} className={styles.email}>
            {profile.email}
          </a>
        )}
      </footer>
    </article>
  );
}
