import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Experience } from "@/components/Experience";
import { Expertise } from "@/components/Expertise";
import { Hero } from "@/components/Hero";
import { Projects } from "@/components/Projects";
import { getContent, profile } from "@/content";
import { getLocale, type LocaleParams } from "@/i18n/params";

export default async function HomePage({ params }: { params: LocaleParams }) {
  const locale = await getLocale(params);
  const { site } = getContent(locale);

  // Structured data so search engines understand who this page is about.
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url: `${profile.url}/${locale}`,
    jobTitle: site.role,
    image: new URL(profile.portrait.src, profile.url).href,
    description: site.seo.description,
    email: profile.email ? `mailto:${profile.email}` : undefined,
    address: {
      "@type": "PostalAddress",
      addressRegion: "Nordrhein-Westfalen",
      addressCountry: "DE",
    },
    knowsLanguage: ["de", "en", "ru"],
    sameAs: Object.values(profile.social)
      .map((link) => link.url)
      .filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Hero locale={locale} />
      <Projects locale={locale} />
      <About locale={locale} />
      <Experience locale={locale} />
      <Expertise locale={locale} />
      <Contact locale={locale} />
    </>
  );
}
