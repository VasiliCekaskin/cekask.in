import { Fragment } from "react";

/** Renders text, setting *words in asterisks* as <em>. */
export function Emphasis({ text }: { text: string }) {
  return text.split(/\*(.+?)\*/g).map((part, i) =>
    i % 2 === 1 ? <em key={i}>{part}</em> : <Fragment key={i}>{part}</Fragment>,
  );
}

/** The same text with the asterisks removed, for plain-text uses. */
export function plain(text: string) {
  return text.replace(/\*(.+?)\*/g, "$1");
}
