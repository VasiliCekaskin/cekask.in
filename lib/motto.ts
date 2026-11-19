"use client";

import { useSyncExternalStore } from "react";
import type { MottoId } from "@/content/types";
import { MOTTOS } from "./motto-ids";

export { MOTTOS, RECOMMENDED } from "./motto-ids";

/**
 * Which motto the home page shows. `null` is the overview: every page load
 * starts there (an introduction plus a preview of every motto). Rolling or
 * picking a card switches to a motto. Kept in memory only, so it survives
 * client-side navigation but not a reload.
 */
let current: MottoId | null = null;
let bag: MottoId[] = [];
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((l) => l());
}

/** The active motto, or null while the overview is shown. */
export function useMotto(): MottoId | null {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
}

/**
 * Moves to a different motto. Draws from a shuffled bag, so every motto
 * comes up once before any repeats.
 */
export function spinMotto(): MottoId {
  const next = drawMotto(current);
  current = next;
  emit();
  return next;
}

/** Draws the next motto from the shuffled bag without switching to it. */
export function drawMotto(not: MottoId | null): MottoId {
  if (bag.length === 0) {
    bag = MOTTOS.filter((m) => m !== not).sort(() => Math.random() - 0.5);
  }
  let next = bag.shift()!;
  if (next === not && bag.length) next = bag.shift()!;
  return next;
}

/** Jumps straight to one motto (a preview card, the "recommended" shortcut). */
export function setMotto(id: MottoId) {
  if (id === current) return;
  current = id;
  bag = bag.filter((m) => m !== id);
  emit();
}

/** Back to the overview. */
export function showOverview() {
  if (current === null) return;
  current = null;
  emit();
}
