import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { plain } from "@/components/Emphasis";
import { getContent, profile } from "@/content";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getLocale, type LocaleParams } from "@/i18n/params";

/*
 * The link preview card for social networks and messengers: a miniature of
 * the home page's first screen (header, availability flag, headline, button,
 * portrait in its corner-mark frame, facts). Rendered once per locale at
 * build time.
 */

const size = { width: 1200, height: 630 };

/* The site's dark tokens from app/globals.css. Swap for the light set
 * (bg #f6f4ef, ink #23271f, …) to render a light card instead. */
const c = {
  bg: "#171916",
  surfaceSunk: "#131512",
  ink: "#e8e6e0",
  ink2: "#bcc0b6",
  ink3: "#969b8f",
  line: "#2d312b",
  lineStrong: "#454a42",
  accent: "#9dbfa6",
  accentInk: "#171916",
  green: "#78c493",
  greenInk: "#b5e0c2",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateImageMetadata({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "en";
  const { site } = getContent(locale);
  return [
    {
      id: "card",
      alt: `${profile.name} — ${plain(site.headline)}`,
      size,
      contentType: "image/png",
    },
  ];
}

/** Corner marks around the photo, as on the site. */
function Corner({ top, left }: { top: boolean; left: boolean }) {
  const len = 16;
  return (
    <div
      style={{
        position: "absolute",
        width: len,
        height: len,
        [top ? "top" : "bottom"]: 0,
        [left ? "left" : "right"]: 0,
        [top ? "borderTop" : "borderBottom"]: `1.5px solid ${c.ink3}`,
        [left ? "borderLeft" : "borderRight"]: `1.5px solid ${c.ink3}`,
      }}
    />
  );
}

export default async function OpenGraphImage({ params }: { params: LocaleParams }) {
  const locale = await getLocale(params);
  const { site, facts, contact } = getContent(locale);

  const [geist, geistSemiBold, serif, serifItalic, portrait] = await Promise.all([
    // ImageResponse can't read woff2, so these are static TTF/WOFF copies of
    // the site's fonts. The photo is profile.portrait.
    readFile(join(process.cwd(), "assets/og-fonts/Geist-Regular.ttf")),
    readFile(join(process.cwd(), "assets/og-fonts/Geist-SemiBold.ttf")),
    readFile(join(process.cwd(), "assets/og-fonts/Newsreader-Medium.woff")),
    readFile(join(process.cwd(), "assets/og-fonts/Newsreader-Italic.woff")),
    readFile(join(process.cwd(), "public", profile.portrait.src)),
  ]);
  const portraitSrc = `data:image/png;base64,${portrait.toString("base64")}`;

  // The headline with its *emphasis* in italic sage, split into words so
  // satori can wrap it like running text.
  const words = site.headline
    .replace(/\u00AD/g, "") // soft hyphens are for the web page only
    .split(/\*(.+?)\*/g)
    .flatMap((part, i) =>
      part
        .split(" ")
        .filter(Boolean)
        .map((word) => ({ word, em: i % 2 === 1 })),
    );

  // Long headlines (German) get a smaller size so the button stays clear of the facts.
  const headlineSize = plain(site.headline).length > 85 ? 44 : 54;

  const photoH = 384;
  const photoW = Math.round((photoH * profile.portrait.width) / profile.portrait.height);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: c.bg,
          color: c.ink,
          fontFamily: "Geist",
        }}
      >
        {/* Site header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 76,
            padding: "0 64px",
            borderBottom: `1px solid ${c.line}`,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "Geist SemiBold", fontSize: 19 }}>{profile.name}</div>
            <div style={{ fontSize: 17, color: c.ink3 }}>{site.role}</div>
          </div>
          <div style={{ fontSize: 18, color: c.ink3 }}>{new URL(profile.url).host}</div>
        </div>

        {/* Hero */}
        <div style={{ display: "flex", flex: 1, padding: "34px 64px 0", gap: 56 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingTop: 18 }}>
            {profile.openToWork && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 19 }}>
                <div style={{ width: 11, height: 11, borderRadius: 6, background: c.green }} />
                <div style={{ fontFamily: "Geist SemiBold", color: c.greenInk }}>
                  {site.availability.headline}
                </div>
                <div style={{ width: 22, height: 1, background: c.lineStrong }} />
                <div style={{ color: c.ink3 }}>{site.availability.detail}</div>
              </div>
            )}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                marginTop: 26,
                fontFamily: "Newsreader",
                fontSize: headlineSize,
                lineHeight: 1.12,
                letterSpacing: -0.8,
              }}
            >
              {words.map(({ word, em }, i) => (
                <span
                  key={i}
                  style={{
                    marginRight: Math.round(headlineSize * 0.24),
                    ...(em ? { fontFamily: "Newsreader Italic", color: c.accent } : {}),
                  }}
                >
                  {word}
                </span>
              ))}
            </div>

            <div style={{ display: "flex", marginTop: 34 }}>
              <div
                style={{
                  display: "flex",
                  padding: "14px 30px",
                  borderRadius: 999,
                  background: c.accent,
                  color: c.accentInk,
                  fontFamily: "Geist SemiBold",
                  fontSize: 20,
                }}
              >
                {contact.button}
              </div>
            </div>
          </div>

          {/* Portrait in its corner-mark frame */}
          <div
            style={{
              display: "flex",
              position: "relative",
              padding: 10,
              width: photoW + 20,
              height: photoH + 20,
            }}
          >
            <Corner top left />
            <Corner top left={false} />
            <Corner top={false} left />
            <Corner top={false} left={false} />
            <img
              src={portraitSrc}
              alt=""
              width={photoW}
              height={photoH}
              style={{ borderRadius: 4, background: c.surfaceSunk }}
            />
          </div>
        </div>

        {/* Facts */}
        <div style={{ display: "flex", margin: "0 64px", borderTop: `1px solid ${c.line}` }}>
          {facts.map((fact) => (
            <div
              key={fact.value}
              style={{ display: "flex", flexDirection: "column", flex: 1, padding: "16px 0 28px", gap: 2 }}
            >
              <div style={{ fontFamily: "Newsreader", fontSize: 23 }}>{fact.value}</div>
              <div style={{ fontSize: 16, color: c.ink3 }}>{fact.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: geist, weight: 400, style: "normal" },
        { name: "Geist SemiBold", data: geistSemiBold, weight: 600, style: "normal" },
        { name: "Newsreader", data: serif, weight: 500, style: "normal" },
        { name: "Newsreader Italic", data: serifItalic, weight: 400, style: "italic" },
      ],
    },
  );
}
