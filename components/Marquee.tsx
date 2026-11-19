import styles from "./Marquee.module.css";

/** A tilted ticker tape running across the page. Decorative, pure CSS. */
export function Marquee({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  // Two copies side by side so the loop is seamless.
  const run = (copy: number) => (
    <ul role="list" className={styles.run} aria-hidden={copy > 0 ? "true" : undefined}>
      {items.map((item) => (
        <li key={item}>
          {item}
          <span className={styles.star} aria-hidden="true">
            ✦
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`${styles.tape} ${reverse ? styles.reverse : ""}`}>
      <div className={styles.track}>
        {run(0)}
        {run(1)}
      </div>
    </div>
  );
}
