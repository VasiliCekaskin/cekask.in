import { getContent } from "@/content";
import type { Locale } from "@/i18n/config";
import { Section } from "./Section";
import styles from "./Expertise.module.css";

export function Expertise({ locale }: { locale: Locale }) {
  const { capabilities, ui } = getContent(locale);

  return (
    <Section
      id="expertise"
      index="04"
      label={ui.expertise.label}
      title={ui.expertise.title}
      intro={ui.expertise.intro}
    >
      <ul role="list" className={styles.grid}>
        {capabilities.map((capability, i) => (
          <li key={capability.title} className={styles.item}>
            <span className={`label ${styles.index}`} aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className={styles.title}>{capability.title}</h3>
            <p className={styles.description}>{capability.description}</p>
            <ul role="list" className="tool-list" aria-label={ui.expertise.toolsOf(capability.title)}>
              {capability.tools.map((tool) => (
                <li key={tool}>{tool}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </Section>
  );
}
