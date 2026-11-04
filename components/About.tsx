import Image from "next/image";
import { getContent, profile } from "@/content";
import type { Locale } from "@/i18n/config";
import { Section } from "./Section";
import styles from "./About.module.css";

export function About({ locale }: { locale: Locale }) {
  const { about, ui } = getContent(locale);

  return (
    <Section
      id="about"
      index="02"
      label={ui.about.label}
      title={ui.about.title}
    >
      <div className={styles.grid}>
        <div className={styles.prose}>
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className={styles.aside}>
          <Image
            className={styles.portrait}
            src={profile.portrait.src}
            alt={about.portraitAlt}
            width={profile.portrait.width}
            height={profile.portrait.height}
            sizes="20rem"
          />

          <div className={styles.principles}>
            <h3 className="label">{ui.about.howIWork}</h3>
            <ul role="list" className={styles.list}>
              {about.principles.map((principle) => (
                <li key={principle.title}>
                  <p className={styles.principleTitle}>{principle.title}</p>
                  <p className={styles.principleText}>{principle.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
