import Image from "next/image";
import { mailHref } from "@/components/mailto";
import { getContent, profile } from "@/content";
import type { Locale } from "@/i18n/config";
import styles from "./RpgTheme.module.css";

/** "Character sheet": Vasili as a role-playing-game hero. */
export function RpgTheme({ locale }: { locale: Locale }) {
  const { offers, contact, ui, mottos } = getContent(locale);
  const t = mottos.rpg;
  const mailto = mailHref(contact.mailSubject);
  const charityMail = mailHref(offers.charity.mailSubject);

  return (
    <section className={`container ${styles.wrap}`} aria-labelledby="rpg-name">
      <div className={styles.sheet}>
        <header className={styles.head}>
          <div className={styles.portrait}>
            <Image src={profile.faces.grin} alt="" width={200} height={200} unoptimized />
            <span className={styles.level}>{t.level}</span>
          </div>
          <div className={styles.identity}>
            <p className={styles.kicker}>{t.sheet}</p>
            <h1 id="rpg-name" className={styles.name}>
              {profile.name}
            </h1>
            <p>{t.charClass}</p>
            <div className={styles.xp}>
              <span className={styles.xpFill} />
            </div>
            <p className={styles.small}>{t.xp}</p>
          </div>
        </header>

        <div className={styles.grid}>
          <section className={styles.panel} aria-labelledby="rpg-stats">
            <h2 id="rpg-stats" className={styles.h2}>
              {t.statsTitle}
            </h2>
            <ul className={styles.stats}>
              {t.stats.map((s) => (
                <li key={s.label}>
                  <span>{s.label}</span>
                  <span className={styles.bar} role="img" aria-label={`${s.value} / 100`}>
                    <span style={{ width: `${s.value}%` }} />
                  </span>
                  <span className={styles.value}>{s.value}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.panel} aria-labelledby="rpg-inventory">
            <h2 id="rpg-inventory" className={styles.h2}>
              {t.inventoryTitle}
            </h2>
            <ul className={styles.inventory}>
              {t.inventory.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </section>

          <section className={`${styles.panel} ${styles.wide}`} aria-labelledby="rpg-quests">
            <h2 id="rpg-quests" className={styles.h2}>
              {t.questsTitle}
            </h2>
            <ol className={styles.quests}>
              {offers.items.map((o) => (
                <li key={o.title}>
                  <p className={styles.questTitle}>📜 {o.title}</p>
                  <p className={styles.small}>{o.text}</p>
                  <p className={styles.reward}>
                    {t.reward}: <strong>{o.price ?? ui.onRequest}</strong>
                  </p>
                </li>
              ))}
              <li>
                <p className={styles.questTitle}>💛 {t.sideQuest}: {offers.charity.title}</p>
                <p className={styles.small}>{offers.charity.text}</p>
                {charityMail && (
                  <a href={charityMail} className={styles.reward}>
                    {offers.charity.button} →
                  </a>
                )}
              </li>
            </ol>
          </section>

          <section className={`${styles.panel} ${styles.wide} ${styles.special}`} aria-labelledby="rpg-special">
            <h2 id="rpg-special" className={styles.h2}>
              {t.specialTitle}
            </h2>
            <p>⭐ {t.special}</p>
          </section>
        </div>

        {mailto && (
          <a href={mailto} className={styles.cta}>
            ▶ {t.cta}
          </a>
        )}
      </div>
    </section>
  );
}
