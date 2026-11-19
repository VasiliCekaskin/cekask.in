import Image from "next/image";
import { AvailabilityFlag } from "@/components/AvailabilityFlag";
import { Emphasis } from "@/components/Emphasis";
import { GoToMotto } from "@/components/GoToMotto";
import { mailHref } from "@/components/mailto";
import { OfficeGame } from "@/components/office/OfficeGame";
import { OpenApp } from "@/components/office/OpenApp";
import { WhackGame } from "@/components/WhackGame";
import { RollButton } from "@/components/RollButton";
import { DIY_URL, getContent, profile } from "@/content";
import type { MottoId } from "@/content/types";
import type { Locale } from "@/i18n/config";
import { MOTTOS, RECOMMENDED } from "@/lib/motto-ids";
import styles from "./Overview.module.css";

/** App icon and color of each motto on the in-game computer. */
const APP_LOOK: Record<MottoId, { icon: string; color: string }> = {
  pro: { icon: "💼", color: "#3c5a47" },
  clarity: { icon: "✨", color: "#2a2350" },
  vibe: { icon: "🌈", color: "#ff3ea5" },
  terminal: { icon: "⌨️", color: "#0d120c" },
  paper: { icon: "📰", color: "#8a7b5c" },
  receipt: { icon: "🧾", color: "#5f6a72" },
  rpg: { icon: "🎲", color: "#3b2d6b" },
  wanted: { icon: "🤠", color: "#7a4f2a" },
  chat: { icon: "💬", color: "#1f7aec" },
  recipe: { icon: "🥘", color: "#b5402f" },
  boarding: { icon: "✈️", color: "#0f3b6e" },
  ai: { icon: "🤖", color: "#2b2b2b" },
};

/**
 * The home page's first view: a walkable office (see OfficeGame). Its start
 * screen and the in-game computer are rendered here on the server, so the
 * introduction and every motto are in the page even before the game loads.
 */
export function Overview({ locale }: { locale: Locale }) {
  const { site, facts, contact, mottos, fun, ui } = getContent(locale);
  const t = mottos.game;
  const mailto = mailHref(contact.mailSubject);
  const rpg = mottos.rpg;

  const intro = (
    <>
      <h1 id="intro-title" className={styles.title}>
        <Emphasis text={site.headline} />
      </h1>
      <p className={styles.intro}>{site.intro}</p>
      <AvailabilityFlag show={profile.openToWork} text={site.availability} />
    </>
  );

  const computer = (
    <div className={styles.os}>
      <aside className={styles.profile} aria-labelledby="os-name">
        <div className={styles.who}>
          <span className={styles.avatar}>
            <Image src={profile.portrait.src} alt="" width={profile.portrait.width} height={profile.portrait.height} sizes="6rem" />
          </span>
          <div>
            <p id="os-name" className={styles.name}>
              {profile.name}
            </p>
            <p className={styles.role}>
              {rpg.level} · {site.role}
            </p>
          </div>
        </div>
        <AvailabilityFlag show={profile.openToWork} text={site.availability} />

        <dl className={styles.facts}>
          {facts.map((f) => (
            <div key={f.value}>
              <dt>{f.value}</dt>
              <dd>{f.label}</dd>
            </div>
          ))}
        </dl>

        <h2 className={styles.h2}>{t.statsTitle}</h2>
        <ul role="list" className={styles.stats}>
          {rpg.stats.map((s) => (
            <li key={s.label}>
              <span>{s.label}</span>
              <span className={styles.bar} aria-hidden="true">
                <span style={{ width: `${s.value}%` }} />
              </span>
              <span className={styles.value}>{s.value}</span>
            </li>
          ))}
        </ul>

        <h2 className={styles.h2}>{t.skillsTitle}</h2>
        <ul role="list" className={styles.tags}>
          {mottos.pro.skills.flatMap((g) => g.items).map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>

        {mailto && (
          <a href={mailto} className={styles.contact}>
            {t.contact}
          </a>
        )}
      </aside>

      <section className={styles.apps} aria-labelledby="os-apps">
        <div className={styles.appsHead}>
          <h2 id="os-apps" className={styles.appsTitle}>
            {t.mottosTitle}
          </h2>
          <p className={styles.appsHint}>{t.mottosHint}</p>
        </div>
        <ul role="list" className={styles.grid}>
          {MOTTOS.map((id) => (
            <li key={id}>
              <GoToMotto motto={id} className={styles.app}>
                <span className={styles.icon} style={{ background: APP_LOOK[id].color }} aria-hidden="true">
                  {APP_LOOK[id].icon}
                </span>
                <span className={styles.appName}>{mottos.names[id].replace(/^✨\s*/, "")}</span>
                {id === RECOMMENDED && <span className={styles.badge}>{mottos.recommend.label}</span>}
                <span className={styles.appBlurb}>{mottos.blurbs[id]}</span>
              </GoToMotto>
            </li>
          ))}
          <li>
            <OpenApp app="whack" fallback="vibe" className={styles.app}>
              <span className={styles.icon} style={{ background: "#ffe14d" }} aria-hidden="true">
                🔨
              </span>
              <span className={styles.appName}>{fun.game.title}</span>
              <span className={styles.appBlurb}>{t.whackBlurb}</span>
            </OpenApp>
          </li>
          <li>
            <a href={`${DIY_URL}/${locale}`} target="_blank" rel="noopener" className={styles.app}>
              <span className={styles.icon} style={{ background: "#2f5bea" }} aria-hidden="true">
                🛠️
              </span>
              <span className={styles.appName}>
                {ui.footer.diy}
                <span aria-hidden="true"> ↗</span>
              </span>
              <span className={styles.appBlurb}>{t.diyBlurb}</span>
              <span className="visually-hidden">{ui.newTab}</span>
            </a>
          </li>
        </ul>
        <div className={styles.roll}>
          <RollButton
            label={mottos.overview.roll}
            hint={mottos.overview.rollHint}
            announce={mottos.spin.announce}
            names={mottos.names}
          />
        </div>
      </section>
    </div>
  );

  // Shown on the 3D monitor.
  const screen = {
    lines: [profile.name, `${rpg.level} · ${site.role}`],
    stats: rpg.stats,
    footer: `${MOTTOS.length} ${t.mottosTitle}: ${MOTTOS.slice(0, 3).map((id) => mottos.names[id].replace(/^✨\s*/, "")).join(", ")} …`,
  };

  return (
    <OfficeGame
      text={t}
      locale={locale}
      screen={screen}
      portraitSrc={profile.portrait.src}
      mailto={mailto}
      contactLabel={t.contact}
      intro={intro}
      computer={computer}
      whack={<WhackGame faces={profile.faces} adVideo={profile.adVideo} email={profile.email} text={fun.game} />}
      appNames={{ ...mottos.names, whack: fun.game.title }}
    />
  );
}
