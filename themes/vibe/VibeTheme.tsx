import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { Offers } from "@/components/Offers";
import { Peekaboo } from "@/components/Peekaboo";
import { Surprise } from "@/components/Surprise";
import { WhackGame } from "@/components/WhackGame";
import { getContent, profile } from "@/content";
import type { Locale } from "@/i18n/config";

/** "Totally vibecoded": the loud sticker app with the game, ad and surprise. */
export function VibeTheme({ locale }: { locale: Locale }) {
  const { fun } = getContent(locale);

  return (
    <>
      <Hero locale={locale} />
      <Marquee items={fun.marquee} />
      <Surprise face={profile.faces.grin} faceAlt={fun.faceAlt} text={fun.surprise} />
      <Offers locale={locale} />
      <WhackGame faces={profile.faces} adVideo={profile.adVideo} email={profile.email} text={fun.game} />
      <Marquee items={fun.marquee} reverse />
      <Contact locale={locale} />
      <Peekaboo face={profile.faces.wink} text={fun.peek.text} label={fun.peek.label} />
    </>
  );
}
