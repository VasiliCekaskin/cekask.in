import Image from "next/image";
import { AvailabilityFlag } from "@/components/AvailabilityFlag";
import { mailHref } from "@/components/mailto";
import { getContent, profile } from "@/content";
import type { Locale } from "@/i18n/config";
import styles from "./ProTheme.module.css";

/** "Totally professional": a plain, printable CV on white. No jokes. */
export function ProTheme({ locale }: { locale: Locale }) {
  const { site, facts, offers, contact, ui, mottos } = getContent(locale);
  const t = mottos.pro;
  const mailto = mailHref(contact.mailSubject);
  const links = [profile.social.linkedin, profile.social.github].filter((l) => l.url);

  return (
    <article className={`container ${styles.cv}`} aria-labelledby="cv-name">
      <header className={styles.head}>
        <div className={styles.identity}>
          <div className={styles.photo}>
            <Image
              src={profile.portrait.src}
              alt={t.photoAlt}
              width={profile.portrait.width}
              height={profile.portrait.height}
              // Large source: the photo is zoomed in on the face.
              sizes="36rem"
              priority
            />
          </div>
          <div className={styles.headText}>
            <p className={styles.eyebrow}>{t.eyebrow}</p>
            <h1 id="cv-name" className={styles.name}>
              {profile.name}
            </h1>
            <p className={styles.role}>
              {site.role} · {site.location}
            </p>
          </div>
        </div>

        <div className={styles.headBar}>
          <AvailabilityFlag show={profile.openToWork} text={site.availability} />
          {mailto && (
            <a href={mailto} className="button">
              {contact.button}
            </a>
          )}
        </div>

        <dl className={styles.facts}>
          {facts.map((f) => (
            <div key={f.value} className={styles.fact}>
              <dt className={styles.factValue}>{f.value}</dt>
              <dd className={styles.factLabel}>{f.label}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className={styles.grid}>
        <div className={styles.main}>
          <section aria-labelledby="cv-profile" className={styles.section}>
            <h2 id="cv-profile" className={styles.h2}>
              {t.summaryTitle}
            </h2>
            <div>
              {t.summary.map((p, i) => (
                <p key={p} className={i === 0 ? styles.lead : styles.p}>
                  {p}
                </p>
              ))}
            </div>
          </section>

          <section aria-labelledby="cv-experience" className={styles.section}>
            <h2 id="cv-experience" className={styles.h2}>
              {t.experienceTitle}
            </h2>
            <ol className={styles.timeline}>
              {t.experience.map((e) => (
                <li key={e.title} className={styles.entry}>
                  <p className={styles.period}>{e.period}</p>
                  <h3 className={styles.h3}>{e.title}</h3>
                  <p className={styles.place}>{e.place}</p>
                  {e.points.length > 0 && (
                    <ul className={styles.points}>
                      {e.points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="cv-projects" className={styles.section}>
            <h2 id="cv-projects" className={styles.h2}>
              {t.projectsTitle}
            </h2>
            <div className={styles.projects}>
              {t.projects.map((p) => (
                <div key={p.name} className={styles.project}>
                  <h3 className={styles.h3}>
                    {p.url ? (
                      <a href={p.url} target="_blank" rel="noopener noreferrer">
                        {p.name}
                        <span aria-hidden="true"> ↗</span>
                        <span className="visually-hidden">{ui.newTab}</span>
                      </a>
                    ) : (
                      p.name
                    )}
                  </h3>
                  <p className={styles.p}>{p.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="cv-side" className={styles.section}>
            <h2 id="cv-side" className={styles.h2}>
              {t.sideTitle}
            </h2>
            <div>
              <table className={styles.table}>
                <tbody>
                  {offers.items.map((o) => (
                    <tr key={o.title}>
                      <th scope="row">
                        {o.title}
                        <span className={styles.tableNote}>{o.format}</span>
                      </th>
                      <td>{o.price ?? ui.onRequest}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className={styles.note}>{offers.charity.text}</p>
            </div>
          </section>
        </div>

        <aside className={styles.side}>
          <section aria-labelledby="cv-contact">
            <h2 id="cv-contact" className={styles.sideH2}>
              {t.contactTitle}
            </h2>
            <ul className={styles.list}>
              {profile.email && (
                <li>
                  <a href={`mailto:${profile.email}`}>{profile.email}</a>
                </li>
              )}
              {links.map((l) => (
                <li key={l.label}>
                  <a href={l.url!} target="_blank" rel="noopener noreferrer">
                    {l.label}
                    <span className="visually-hidden">{ui.newTab}</span>
                  </a>
                </li>
              ))}
              <li>{site.location}</li>
            </ul>
          </section>

          <section aria-labelledby="cv-skills">
            <h2 id="cv-skills" className={styles.sideH2}>
              {t.skillsTitle}
            </h2>
            {t.skills.map((g) => (
              <div key={g.group} className={styles.skillGroup}>
                <h3 className={styles.h4}>{g.group}</h3>
                <ul className={styles.tags}>
                  {g.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section aria-labelledby="cv-languages">
            <h2 id="cv-languages" className={styles.sideH2}>
              {t.languagesTitle}
            </h2>
            <ul className={styles.tags}>
              {t.languages.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </article>
  );
}
