import { mailHref } from "@/components/mailto";
import { getContent } from "@/content";
import type { Locale } from "@/i18n/config";
import styles from "./RecipeTheme.module.css";

/** "Recipe": a cookbook page for a strong dev team. */
export function RecipeTheme({ locale }: { locale: Locale }) {
  const { offers, contact, ui, mottos } = getContent(locale);
  const t = mottos.recipe;
  const mailto = mailHref(contact.mailSubject);

  return (
    <article className={`container ${styles.wrap}`} aria-labelledby="recipe-title">
      <div className={styles.card}>
        <header className={styles.head}>
          <p className={styles.kicker}>{t.kicker}</p>
          <h1 id="recipe-title" className={styles.title}>
            {t.title}
          </h1>
          <ul className={styles.meta}>
            {t.meta.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </header>

        <div className={styles.grid}>
          <section aria-labelledby="recipe-ingredients">
            <h2 id="recipe-ingredients" className={styles.h2}>
              {t.ingredientsTitle}
            </h2>
            <ul className={styles.ingredients}>
              {t.ingredients.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="recipe-steps">
            <h2 id="recipe-steps" className={styles.h2}>
              {t.stepsTitle}
            </h2>
            <ol className={styles.steps}>
              {t.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </section>
        </div>

        <aside className={styles.tip}>
          <h2 className={styles.h2}>👨‍🍳 {t.tipTitle}</h2>
          <p>{t.tip}</p>
          {mailto && (
            <a href={mailto} className="button">
              {t.cta}
            </a>
          )}
        </aside>

        <section aria-labelledby="recipe-sides">
          <h2 id="recipe-sides" className={styles.h2}>
            {t.sidesTitle}
          </h2>
          <ul className={styles.sides}>
            {offers.items.map((o) => (
              <li key={o.title}>
                <span>{o.title}</span>
                <span className={styles.price}>{o.price ?? ui.onRequest}</span>
              </li>
            ))}
            <li>
              <span>{offers.charity.title}</span>
              <span className={styles.price}>💛</span>
            </li>
          </ul>
        </section>
      </div>
    </article>
  );
}
