import type { ReactNode } from "react";
import styles from "./Section.module.css";

type SectionProps = {
  id: string;
  /** Running number shown in the margin, e.g. "01". */
  index: string;
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
  /** Let the body use the full width instead of the content column. */
  wide?: boolean;
};

/**
 * Editorial section frame: a numbered label in the left margin on wide
 * screens, stacked above the heading on small ones.
 */
export function Section({
  id,
  index,
  label,
  title,
  intro,
  children,
  wide = false,
}: SectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`${styles.section} ${wide ? styles.wide : ""}`}
    >
      <div className={`container ${styles.grid}`}>
        <p className={`label ${styles.margin}`}>
          <span className={styles.index}>{index}</span>
          {label}
        </p>
        <div className={styles.head}>
          <h2 id={headingId} className={styles.title}>
            {title}
          </h2>
          {intro && <p className={styles.intro}>{intro}</p>}
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </section>
  );
}
