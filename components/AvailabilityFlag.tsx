import styles from "./AvailabilityFlag.module.css";

type Props = {
  show: boolean;
  text: { headline: string; detail: string };
  className?: string;
};

/**
 * A green status line, like the indicator lamp on a machine: a lit dot,
 * the status, and a quieter detail. Renders nothing when `show` is false.
 */
export function AvailabilityFlag({ show, text, className }: Props) {
  if (!show) return null;

  return (
    <p className={`${styles.flag} ${className ?? ""}`}>
      <span className={styles.lamp} aria-hidden="true" />
      <span className={styles.status}>{text.headline}</span>
      <span className={styles.detail}>{text.detail}</span>
    </p>
  );
}
