import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { plain } from "@/components/Emphasis";
import { getContent, profile } from "@/content";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getLocale, type LocaleParams } from "@/i18n/params";

/*
 * The link preview card for social networks and messengers, in the same
 * calm paper palette as the site. Rendered once per locale at build time.
 */

const size = { width: 1200, height: 630 };

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

export default async function OpenGraphImage({ params }: { params: LocaleParams }) {
  const locale = await getLocale(params);
  const { site } = getContent(locale);

  const [geist, geistSemiBold, serif, avatar] = await Promise.all([
    // ImageResponse can't read woff2, so these are static TTF/WOFF copies of
    // the site's fonts. The avatar is profile.avatar.
    readFile(join(process.cwd(), "assets/og-fonts/Geist-Regular.ttf")),
    readFile(join(process.cwd(), "assets/og-fonts/Geist-SemiBold.ttf")),
    readFile(join(process.cwd(), "assets/og-fonts/Newsreader-Medium.woff")),
    readFile(join(process.cwd(), "public/vasili-2.png")),
  ]);
  const avatarSrc = `data:image/png;base64,${avatar.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px 64px",
          background: "#f6f4ef",
          color: "#23271f",
          fontFamily: "Geist",
        }}
      >
        {/* Avatar, name, role */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              display: "flex",
              position: "relative",
              width: 84,
              height: 84,
              borderRadius: 42,
              overflow: "hidden",
              background: "#ffffff",
              border: "1px solid #e2ded5",
            }}
          >
            {/* Face crop: 300×300 of the 800×800 avatar. */}
            <img src={avatarSrc} alt="" width={224} height={224} style={{ position: "absolute", left: -82, top: -3 }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ fontFamily: "Geist SemiBold", fontSize: 30 }}>{profile.name}</div>
            <div style={{ fontSize: 24, color: "#646b60" }}>
              {`${site.role} · ${site.location}`}
            </div>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            maxWidth: 980,
            fontFamily: "Newsreader",
            fontSize: 58,
            lineHeight: 1.12,
            letterSpacing: -1,
          }}
        >
          {plain(site.headline)}
        </div>

        {/* Availability + domain */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {profile.openToWork ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 24px 12px 20px",
                borderRadius: 999,
                border: "1.5px solid #c4dbc8",
                background: "#e5efe6",
                color: "#24563a",
                fontFamily: "Geist SemiBold",
                fontSize: 24,
              }}
            >
              <div style={{ width: 14, height: 14, borderRadius: 7, background: "#3d8b5a" }} />
              {site.availability.headline}
            </div>
          ) : (
            <div style={{ display: "flex" }} />
          )}
          <div style={{ fontSize: 24, color: "#646b60" }}>{new URL(profile.url).host}</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: geist, weight: 400, style: "normal" },
        { name: "Geist SemiBold", data: geistSemiBold, weight: 600, style: "normal" },
        { name: "Newsreader", data: serif, weight: 500, style: "normal" },
      ],
    },
  );
}
