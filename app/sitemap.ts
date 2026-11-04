import type { MetadataRoute } from "next";
import { profile } from "@/content";
import { alternatesFor, locales } from "@/i18n/config";

const pages = [
  { path: "", changeFrequency: "monthly", priority: 1 },
  { path: "/impressum", changeFrequency: "yearly", priority: 0.1 },
  { path: "/datenschutz", changeFrequency: "yearly", priority: 0.1 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.flatMap(({ path, changeFrequency, priority }) =>
    locales.map((locale) => ({
      url: `${profile.url}/${locale}${path}`,
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(
          Object.entries(alternatesFor(locale, path).languages).map(([lang, href]) => [
            lang,
            `${profile.url}${href}`,
          ]),
        ),
      },
    })),
  );
}
