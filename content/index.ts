import type { Locale } from "@/i18n/config";
import { content as de } from "./de";
import { content as en } from "./en";
import type { Content } from "./types";

const contentByLocale: Record<Locale, Content> = { en, de };

/** All translatable text for one language. */
export function getContent(locale: Locale): Content {
  return contentByLocale[locale];
}

export { DIY_URL, profile } from "./profile";
export { legal } from "./legal";
