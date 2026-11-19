import Image from "next/image";
import { AvailabilityFlag } from "@/components/AvailabilityFlag";
import { Emphasis } from "@/components/Emphasis";
import { GoToMotto } from "@/components/GoToMotto";
import { RollButton } from "@/components/RollButton";
import { getContent, profile } from "@/content";
import type { MottoId } from "@/content/types";
import type { Locale } from "@/i18n/config";
import { MOTTOS, RECOMMENDED } from "@/lib/motto-ids";
import styles from "./Overview.module.css";

/**
 * The home page's first view: a short introduction, one big "roll" button,
 * and a preview card for every motto.
 */
export function Overview({ locale }: { locale: Locale }) {
  const { site, mottos } = getContent(locale);
  const t = mottos.overview;

  return (
    <div className={styles.overview}>
      <section className={`container ${styles.hero}`} aria-labelledby="intro-title">
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>
            {t.eyebrow} · {profile.name}
          </p>
          <h1 id="intro-title" className={styles.title}>
            <Emphasis text={site.headline} />
          </h1>
          <p className={styles.intro}>{site.intro}</p>
          <AvailabilityFlag show={profile.openToWork} text={site.availability} />

          <div className={styles.actions}>
            <RollButton label={t.roll} hint={t.rollHint} announce={mottos.spin.announce} names={mottos.names} />
            <GoToMotto motto={RECOMMENDED} className={styles.recommend}>
              <span aria-hidden="true">✨</span> {mottos.recommend.label}: {mottos.names[RECOMMENDED].replace(/^✨\s*/, "")}
            </GoToMotto>
          </div>
        </div>

        <div className={styles.photo}>
          <Image
            src={profile.portrait.src}
            alt={mottos.pro.photoAlt}
            width={profile.portrait.width}
            height={profile.portrait.height}
            sizes="(min-width: 56rem) 24rem, 16rem"
            priority
          />
        </div>
      </section>

      <section className={`container ${styles.mottos}`} aria-labelledby="mottos-title">
        <div className={styles.mottosHead}>
          <h2 id="mottos-title" className={styles.h2}>
            {t.gridTitle}
          </h2>
          <p className={styles.sub}>{t.gridSub}</p>
        </div>

        <ul role="list" className={styles.grid}>
          {MOTTOS.map((id) => (
            <li key={id}>
              <GoToMotto motto={id} className={styles.card}>
                <span className={styles.preview} data-preview={id} aria-hidden="true">
                  <Preview id={id} name={mottos.names[id]} />
                </span>
                <span className={styles.cardText}>
                  <span className={styles.cardName}>
                    {mottos.names[id]}
                    {id === RECOMMENDED && <span className={styles.badge}>{mottos.recommend.label}</span>}
                  </span>
                  <span className={styles.cardBlurb}>{mottos.blurbs[id]}</span>
                  <span className={styles.cardOpen}>
                    {t.open} <span aria-hidden="true">→</span>
                  </span>
                </span>
              </GoToMotto>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/** A tiny decorative sketch of each motto, in its colors and fonts. */
function Preview({ id, name }: { id: MottoId; name: string }) {
  switch (id) {
    case "pro":
      return (
        <span className={styles.pv}>
          <span className={styles.pvAvatar} />
          <span className={styles.pvTitle}>Vasili Cekaskin</span>
          <span className={styles.pvLine} />
          <span className={styles.pvLine} data-short />
          <span className={styles.pvPill} />
        </span>
      );
    case "clarity":
      return (
        <span className={styles.pv}>
          <span className={styles.pvRing} />
          <span className={styles.pvGradient}>Vasili</span>
          <span className={styles.pvLine} data-short />
        </span>
      );
    case "vibe":
      return (
        <span className={styles.pv}>
          <span className={styles.pvSticker}>hi! 👋</span>
          <span className={styles.pvTitle}>Vasili</span>
          <span className={styles.pvSticker} data-alt>
            vibecoded
          </span>
        </span>
      );
    case "terminal":
      return (
        <span className={styles.pv}>
          <span className={styles.pvMono}>$ whoami</span>
          <span className={styles.pvMono} data-dim>
            vasili, software engineer
          </span>
          <span className={styles.pvMono}>
            $ hire<span className={styles.pvCursor} />
          </span>
        </span>
      );
    case "paper":
      return (
        <span className={styles.pv}>
          <span className={styles.pvMasthead}>{name}</span>
          <span className={styles.pvColumns}>
            <span />
            <span />
            <span />
          </span>
        </span>
      );
    case "receipt":
      return (
        <span className={styles.pv}>
          <span className={styles.pvSlip}>
            <span>*** VASILI ***</span>
            <span className={styles.pvDash} />
            <span className={styles.pvRow}>
              <span>7 J.</span>
              <span>✓</span>
            </span>
            <span className={styles.pvRow}>
              <span>AWS</span>
              <span>✓</span>
            </span>
            <span className={styles.pvDash} />
            <span className={styles.pvRow}>
              <b>TOTAL</b>
              <b>HIRE</b>
            </span>
          </span>
        </span>
      );
    case "rpg":
      return (
        <span className={styles.pv}>
          <span className={styles.pvMono}>LVL 7 · DEV</span>
          <span className={styles.pvBar} />
          <span className={styles.pvBar} data-hp />
        </span>
      );
    case "wanted":
      return (
        <span className={styles.pv}>
          <span className={styles.pvWanted}>WANTED</span>
          <span className={styles.pvAvatar} data-square />
        </span>
      );
    case "chat":
      return (
        <span className={styles.pv}>
          <span className={styles.pvBubble}>👋 Hallo!</span>
          <span className={styles.pvBubble} data-me>
            Hi Vasili
          </span>
          <span className={styles.pvBubble}>
            <span className={styles.pvDots}>
              <span />
              <span />
              <span />
            </span>
          </span>
        </span>
      );
    case "recipe":
      return (
        <span className={styles.pv}>
          <span className={styles.pvCard}>
            <span className={styles.pvTitle}>🥘 {name}</span>
            <span className={styles.pvLine} />
            <span className={styles.pvLine} data-short />
          </span>
        </span>
      );
    case "boarding":
      return (
        <span className={styles.pv}>
          <span className={styles.pvTicket}>
            <span>DUS</span>
            <span aria-hidden="true">✈</span>
            <span>JOB</span>
          </span>
        </span>
      );
  }
}
