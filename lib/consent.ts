"use client";

import { useSyncExternalStore } from "react";

/**
 * The visitor's privacy choice (cookie banner).
 *
 * This site sets no cookies and loads no trackers. The only optional thing it
 * stores on the device is game progress (best score, found easter eggs), and
 * only after consent (§ 25 Abs. 1 TDDDG, Art. 6 Abs. 1 lit. a DSGVO).
 * Remembering the choice itself is strictly necessary (§ 25 Abs. 2 Nr. 2 TDDDG).
 *
 * Without consent, games keep their progress in memory until the page is closed.
 */
export const CONSENT_KEY = "cekask-consent";
export const CONSENT_VERSION = 1;

/** Keys written only with consent. Removed when consent is withdrawn. */
export const OPTIONAL_KEYS = ["whack-a-vasili-best", "office-eggs"] as const;

export type Consent = {
  version: typeof CONSENT_VERSION;
  /** Game progress may be saved in localStorage. */
  storage: boolean;
  /** ISO timestamp of the decision. */
  decidedAt: string;
};

const SETTINGS_EVENT = "cekask:consent-settings";
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedValue: Consent | null = null;
/** Fallback when storage is blocked, so the banner doesn't come back on every page this visit. */
let memoryConsent: Consent | null = null;

function readRaw(): string | null {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

/** Accepts anything and returns a valid, current consent, or null (ask again). */
export function parseConsent(raw: string | null): Consent | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (value?.version !== CONSENT_VERSION || typeof value.storage !== "boolean") return null;
    return { version: CONSENT_VERSION, storage: value.storage, decidedAt: String(value.decidedAt ?? "") };
  } catch {
    return null;
  }
}

function snapshot(): Consent | null {
  const raw = readRaw();
  if (raw === null && memoryConsent) return memoryConsent;
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = parseConsent(raw);
  }
  return cachedValue;
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === CONSENT_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** `undefined` while rendering on the server / before hydration, `null` = not decided yet. */
export function useConsent(): Consent | null | undefined {
  return useSyncExternalStore(subscribe, snapshot, () => undefined);
}

/** True only if the visitor agreed to saving game progress. */
export function hasStorageConsent(): boolean {
  if (typeof window === "undefined") return false;
  return snapshot()?.storage === true;
}

export function saveConsent(storage: boolean) {
  const value: Consent = { version: CONSENT_VERSION, storage, decidedAt: new Date().toISOString() };
  memoryConsent = value;
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(value));
    if (!storage) OPTIONAL_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Storage blocked: the choice holds for this visit only.
  }
  emit();
}

/** Opens the settings dialog (footer link, privacy page). */
export function openConsentSettings() {
  window.dispatchEvent(new Event(SETTINGS_EVENT));
}

export function onOpenConsentSettings(handler: () => void) {
  window.addEventListener(SETTINGS_EVENT, handler);
  return () => window.removeEventListener(SETTINGS_EVENT, handler);
}
