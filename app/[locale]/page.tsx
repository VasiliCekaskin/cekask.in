import { MottoStage } from "@/components/MottoStage";
import { getContent, profile } from "@/content";
import { getLocale, type LocaleParams } from "@/i18n/params";
import { BoardingTheme } from "@/themes/boarding/BoardingTheme";
import { ChatTheme } from "@/themes/chat/ChatTheme";
import { ClarityTheme } from "@/themes/clarity/ClarityTheme";
import { PaperTheme } from "@/themes/paper/PaperTheme";
import { ProTheme } from "@/themes/pro/ProTheme";
import { ReceiptTheme } from "@/themes/receipt/ReceiptTheme";
import { RecipeTheme } from "@/themes/recipe/RecipeTheme";
import { RpgTheme } from "@/themes/rpg/RpgTheme";
import { TerminalTheme } from "@/themes/terminal/TerminalTheme";
import { VibeTheme } from "@/themes/vibe/VibeTheme";
import { WantedTheme } from "@/themes/wanted/WantedTheme";
import { Overview } from "@/themes/overview/Overview";
import { AiTheme } from "@/themes/ai/AiTheme";
import { mailHref } from "@/components/mailto";

export default async function HomePage({ params }: { params: LocaleParams }) {
  const locale = await getLocale(params);
  const { site, offers, contact, ui, mottos } = getContent(locale);
  const links = [profile.social.linkedin, profile.social.github]
    .filter((l) => l.url)
    .map((l) => ({ label: l.label, url: l.url! }));

  // Structured data so search engines understand who this page is about
  // and what is offered.
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
    makesOffer: offers.items.map((offer) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: offer.title, description: offer.text },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* The overview first; every motto is a whole page, rolled or picked from there. */}
      <MottoStage
        overview={<Overview locale={locale} />}
        stages={{
          pro: <ProTheme locale={locale} />,
          vibe: <VibeTheme locale={locale} />,
          terminal: (
            <TerminalTheme
              title={`${profile.name} — ${site.role}`}
              text={mottos.terminal}
              cv={mottos.pro}
              offers={offers.items}
              onRequest={ui.onRequest}
              charity={offers.charity.text}
              email={profile.email}
              mailSubject={contact.mailSubject}
              links={links}
            />
          ),
          paper: <PaperTheme locale={locale} />,
          receipt: <ReceiptTheme locale={locale} />,
          clarity: <ClarityTheme locale={locale} />,
          rpg: <RpgTheme locale={locale} />,
          wanted: <WantedTheme locale={locale} />,
          chat: (
            <ChatTheme
              name={profile.name}
              avatar={profile.faces.grin}
              text={mottos.chat}
              offers={offers.items}
              onRequest={ui.onRequest}
              charity={offers.charity.text}
              email={profile.email}
              contactHref={mailHref(contact.mailSubject)}
              hireHref={mailHref(contact.mailSubject)}
            />
          ),
          recipe: <RecipeTheme locale={locale} />,
          boarding: <BoardingTheme locale={locale} />,
          ai: (
            <AiTheme
              title={`${profile.name} — ${site.role}`}
              text={mottos.ai}
              email={profile.email}
              mailto={mailHref(contact.mailSubject)}
              links={links}
            />
          ),
        }}
      />
    </>
  );
}
