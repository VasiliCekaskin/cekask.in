import { getContent, profile } from "@/content";
import type { Locale } from "@/i18n/config";
import { CyberBackdrop } from "./CyberBackdrop";
import { ArrowDownIcon } from "./icons";
import styles from "./Hero.module.css";

export function Hero({ locale }: { locale: Locale }) {
  const { site, ui } = getContent(locale);
  const [firstName, ...rest] = profile.name.split(" ");

  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <CyberBackdrop />
      <div className={`container ${styles.grid}`}>
        <div className={styles.main}>
          <p className="label">{site.role}</p>

          <h1 id="hero-heading" className={styles.name}>
            <span className={styles.glitch}>
              {firstName}
              <span className={styles.glitchLayer} aria-hidden="true">
                {firstName}
              </span>
              <span className={styles.glitchLayer} aria-hidden="true">
                {firstName}
              </span>
            </span>{" "}
            <span className={styles.lastName}>{rest.join(" ")}</span>
          </h1>

          <p className={styles.tagline}>{site.tagline}</p>
          <p className={styles.intro}>{site.intro}</p>

          <div className={styles.actions}>
            <a href="#projects" className={styles.primary}>
              {ui.hero.explore}
              <ArrowDownIcon />
            </a>
            <a href="#contact" className={styles.secondary}>
              {ui.hero.contact}
            </a>
          </div>
        </div>

        <aside className={styles.aside} aria-label={ui.hero.asideLabel}>
          {profile.openToWork && (
            <div className={styles.status}>
              <p className={styles.statusHeadline}>
                <span className={styles.dot} aria-hidden="true" />
                {site.availability.headline}
              </p>
              <p>{site.availability.detail}</p>
              <p className={styles.statusSecondary}>{site.availability.secondary}</p>
            </div>
          )}

          <dl className={styles.facts}>
            <div>
              <dt className="label">{ui.hero.basedIn}</dt>
              <dd>{site.location}</dd>
            </div>
            <div>
              <dt className="label">{ui.hero.experience}</dt>
              <dd>{site.experience}</dd>
            </div>
            <div>
              <dt className="label">{ui.hero.focus}</dt>
              <dd>{site.focus}</dd>
            </div>
            <div>
              <dt className="label">{ui.hero.languages}</dt>
              <dd>{site.languages.join(", ")}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
