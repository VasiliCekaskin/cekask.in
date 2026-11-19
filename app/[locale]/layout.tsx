import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ConsentBanner } from "@/components/ConsentBanner";
import { KonamiParty } from "@/components/KonamiParty";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getContent, profile } from "@/content";
import { locales } from "@/i18n/config";
import { pageMetadata } from "@/i18n/metadata";
import { getLocale, type LocaleParams } from "@/i18n/params";
import { fontVariables } from "../font-faces";
import "../globals.css";

type Props = {
  children: ReactNode;
  params: LocaleParams;
};

// Prerender every locale; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await getLocale(params);
  const { seo } = getContent(locale).site;

  return {
    metadataBase: new URL(profile.url),
    title: {
      default: seo.title,
      template: `%s — ${profile.name}`,
    },
    description: seo.description,
    authors: [{ name: profile.name, url: profile.url }],
    creator: profile.name,
    ...pageMetadata(locale, { title: seo.title, description: seo.description }),
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default async function LocaleLayout({ children, params }: Props) {
  const locale = await getLocale(params);
  const { ui } = getContent(locale);

  return (
    <html lang={locale} className={fontVariables}>
      <body>
        <a className="skip-link" href="#main">
          {ui.skipLink}
        </a>
        <SiteHeader locale={locale} />
        <main id="main">{children}</main>
        <SiteFooter locale={locale} />
        <KonamiParty />
        <ConsentBanner locale={locale} text={ui.consent} />
      </body>
    </html>
  );
}
