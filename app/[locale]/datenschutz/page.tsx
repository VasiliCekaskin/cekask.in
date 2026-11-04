import type { Metadata } from "next";
import type { ComponentType } from "react";
import { LegalPage } from "@/components/LegalPage";
import { getContent, profile } from "@/content";
import { DatenschutzText as German } from "@/content/de/legal";
import { DatenschutzText as English } from "@/content/en/legal";
import type { Locale } from "@/i18n/config";
import { pageMetadata } from "@/i18n/metadata";
import { getLocale, type LocaleParams } from "@/i18n/params";

type Props = { params: LocaleParams };

const texts: Record<Locale, ComponentType> = { de: German, en: English };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await getLocale(params);
  const { site, ui } = getContent(locale);
  const title = ui.legal.datenschutzTitle;
  return {
    title,
    ...pageMetadata(locale, {
      path: "/datenschutz",
      title: `${title} — ${profile.name}`,
      description: site.seo.description,
    }),
  };
}

export default async function DatenschutzPage({ params }: Props) {
  const locale = await getLocale(params);
  const Text = texts[locale];

  return (
    <LegalPage locale={locale} title={getContent(locale).ui.legal.datenschutzTitle}>
      <Text />
    </LegalPage>
  );
}
