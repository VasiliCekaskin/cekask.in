"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { UiText } from "@/content/types";
import { onOpenConsentSettings, openConsentSettings, saveConsent, useConsent } from "@/lib/consent";
import styles from "./ConsentBanner.module.css";

type Props = { locale: string; text: UiText["consent"] };

/**
 * Cookie banner + settings. GDPR/TDDDG rules it follows:
 * - nothing optional is stored before a choice,
 * - "Decline" is as easy and as visible as "Accept",
 * - no pre-ticked boxes,
 * - the banner doesn't block the page, so imprint and privacy stay reachable,
 * - the choice can be changed any time (footer link, privacy page).
 */
export function ConsentBanner({ locale, text }: Props) {
  const consent = useConsent();
  const [open, setOpen] = useState(false);
  const [storage, setStorage] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(
    () =>
      onOpenConsentSettings(() => {
        setStorage(consent?.storage === true);
        setOpen(true);
      }),
    [consent],
  );

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const decide = (value: boolean) => {
    saveConsent(value);
    setOpen(false);
  };

  const links = (
    <p className={styles.links}>
      <Link href={`/${locale}/datenschutz`}>{text.privacy}</Link>
      <Link href={`/${locale}/impressum`}>{text.imprint}</Link>
    </p>
  );

  return (
    <>
      {consent === null && !open && (
        <section className={styles.banner} aria-label={text.label}>
          <div className={styles.body}>
            <h2 className={styles.title}>{text.title}</h2>
            <p className={styles.text}>{text.text}</p>
            {links}
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.choice} onClick={() => decide(false)}>
              {text.reject}
            </button>
            <button type="button" className={styles.choice} onClick={() => decide(true)}>
              {text.accept}
            </button>
            <button type="button" className={styles.more} onClick={openConsentSettings}>
              {text.settings}
            </button>
          </div>
        </section>
      )}

      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby="consent-title"
        onClose={() => setOpen(false)}
      >
        <form
          method="dialog"
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            decide(storage);
          }}
        >
          <div className={styles.dialogHead}>
            <h2 id="consent-title" className={styles.title}>
              {text.settingsTitle}
            </h2>
            <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label={text.close}>
              ×
            </button>
          </div>
          <p className={styles.text}>{text.settingsText}</p>

          <div className={styles.option}>
            <div>
              <p className={styles.optionName}>{text.necessary.name}</p>
              <p className={styles.optionText}>{text.necessary.text}</p>
            </div>
            <span className={styles.always}>{text.necessary.always}</span>
          </div>

          <label className={styles.option}>
            <span>
              <span className={styles.optionName}>{text.storage.name}</span>
              <span className={styles.optionText}>{text.storage.text}</span>
            </span>
            <input
              type="checkbox"
              role="switch"
              className={styles.switch}
              checked={storage}
              onChange={(e) => setStorage(e.target.checked)}
            />
          </label>

          <div className={styles.actions}>
            <button type="button" className={styles.choice} onClick={() => decide(false)}>
              {text.reject}
            </button>
            <button type="button" className={styles.choice} onClick={() => decide(true)}>
              {text.accept}
            </button>
            <button type="submit" className={styles.more}>
              {text.save}
            </button>
          </div>
          {links}
        </form>
      </dialog>
    </>
  );
}

/** Footer / privacy-page button that reopens the settings. */
export function ConsentSettingsButton({ label, className }: { label: string; className?: string }) {
  return (
    <button type="button" className={`${styles.link} ${className ?? ""}`} onClick={openConsentSettings}>
      {label}
    </button>
  );
}
