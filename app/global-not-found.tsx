import type { Metadata } from "next";
import Link from "next/link";
import { fontVariables } from "./font-faces";
import "./globals.css";
import styles from "./global-not-found.module.css";

export const metadata: Metadata = {
  title: "404 — Vasili Cekaskin",
};

/**
 * Shown for any URL that matches no route. It renders outside the localized
 * layouts, so it speaks both languages and links to both homepages.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <main className={`container ${styles.page}`}>
          <p className="label">404</p>
          <h1 className={styles.title}>
            This page doesn&apos;t exist — maybe it never left the demo stage.
          </h1>
          <p className={styles.title} lang="de">
            Diese Seite gibt es nicht — vielleicht hat sie das Demo-Stadium nie verlassen.
          </p>
          <ul role="list" className={styles.links}>
            <li>
              <Link href="/en" className="text-link" hrefLang="en">
                Back to the homepage
              </Link>
            </li>
            <li>
              <Link href="/de" className="text-link" hrefLang="de" lang="de">
                Zur Startseite
              </Link>
            </li>
          </ul>
        </main>
      </body>
    </html>
  );
}
