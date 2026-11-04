import { getContent } from "@/content";
import type { Locale } from "@/i18n/config";
import { Section } from "./Section";
import styles from "./Experience.module.css";

export function Experience({ locale }: { locale: Locale }) {
  const { experience, ui } = getContent(locale);

  return (
    <Section
      id="experience"
      index="03"
      label={ui.experience.label}
      title={ui.experience.title}
      intro={ui.experience.intro}
    >
      <ol role="list" className={styles.list}>
        {experience.map((entry) => (
          <li
            key={`${entry.organization}-${entry.role}`}
            className={`${styles.entry} ${entry.compact ? styles.compact : ""}`}
          >
            <p className={`label ${styles.period}`}>{entry.period}</p>
            <div className={styles.body}>
              <h3 className={styles.role}>
                {entry.role}
                <span className="visually-hidden">{ui.experience.at}</span>
                <span className={styles.org}>{entry.organization}</span>
              </h3>
              <p className={styles.summary}>{entry.summary}</p>
              {entry.responsibilities && (
                <ul className={styles.responsibilities}>
                  {entry.responsibilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
