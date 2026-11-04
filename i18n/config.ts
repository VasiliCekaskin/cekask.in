/**
 * Supported languages. Every page exists once per locale under `/<locale>`,
 * and a bare URL like `/` is redirected by `proxy.ts` based on the browser's
 * Accept-Language header, falling back to `defaultLocale`.
 */
export const locales = ["en", "de"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** How each language names itself, for the language switcher. */
export const localeNames: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
};

/** Open Graph locale codes. */
export const ogLocales: Record<Locale, string> = {
  en: "en_US",
  de: "de_DE",
};

/**
 * Picks the best supported locale from an Accept-Language header, e.g.
 * "de-DE,de;q=0.9,en;q=0.8" → "de". Only the language part is compared.
 */
export function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return {
        language: tag.trim().toLowerCase().split("-")[0],
        quality: q ? Number(q.slice(2)) : 1,
      };
    })
    .filter((entry) => entry.quality > 0)
    .sort((a, b) => b.quality - a.quality);

  for (const { language } of ranked) {
    if (isLocale(language)) return language;
  }
  return defaultLocale;
}

/**
 * `alternates` metadata for a path that exists in every locale, so search
 * engines link the language versions together (hreflang).
 */
export function alternatesFor(locale: Locale, path = "") {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, `/${l}${path}`])),
      "x-default": `/${defaultLocale}${path}`,
    },
  };
}
