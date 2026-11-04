import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./config";

export type LocaleParams = Promise<{ locale: string }>;

/** Reads the `[locale]` route param, 404ing on anything unsupported. */
export async function getLocale(params: LocaleParams): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}
