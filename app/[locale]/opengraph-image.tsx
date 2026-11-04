import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getContent, profile } from "@/content";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getLocale, type LocaleParams } from "@/i18n/params";

/*
 * The link preview card for social networks and messengers — the same neon
 * night city as the hero. Rendered once per locale at build time.
 */

const size = { width: 1200, height: 630 };
const HORIZON = 410;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateImageMetadata({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "en";
  const { site } = getContent(locale);
  return [
    {
      id: "card",
      alt: `${profile.name} — ${site.role}. ${site.intro}`,
      size,
      contentType: "image/png",
    },
  ];
}

/** Same seeded PRNG as the hero, so the skyline is stable between builds. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The whole backdrop as one SVG: sky, sun, skyline, grid floor. */
function backdropSvg() {
  const random = mulberry32(7);
  const neon = ["#2de2e6", "#ff3ea5", "#f9c80e", "#9b5cff"];
  const parts: string[] = [];

  // Sky and glows.
  parts.push(`
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#07060f"/>
        <stop offset="0.45" stop-color="#120a26"/>
        <stop offset="${HORIZON / size.height}" stop-color="#2a0b3a"/>
        <stop offset="1" stop-color="#07060f"/>
      </linearGradient>
      <radialGradient id="glow" cx="0.72" cy="${HORIZON / size.height}" r="0.55">
        <stop offset="0" stop-color="#ff3ea5" stop-opacity="0.45"/>
        <stop offset="1" stop-color="#ff3ea5" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f9c80e"/>
        <stop offset="0.5" stop-color="#ff6b3d"/>
        <stop offset="1" stop-color="#ff3ea5"/>
      </linearGradient>
      <linearGradient id="scrim" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#07060f" stop-opacity="0.9"/>
        <stop offset="0.45" stop-color="#07060f" stop-opacity="0.55"/>
        <stop offset="0.7" stop-color="#07060f" stop-opacity="0"/>
      </linearGradient>
      <clipPath id="above"><rect width="${size.width}" height="${HORIZON}"/></clipPath>
    </defs>
    <rect width="${size.width}" height="${size.height}" fill="url(#sky)"/>
    <rect width="${size.width}" height="${size.height}" fill="url(#glow)"/>
  `);

  // Striped sun, sunk into the horizon.
  const sunX = 860;
  const sunR = 150;
  parts.push(`<g clip-path="url(#above)"><circle cx="${sunX}" cy="${HORIZON + 30}" r="${sunR}" fill="url(#sun)" opacity="0.9"/>`);
  for (let i = 0; i < 5; i++) {
    const y = HORIZON - 70 + i * 18;
    parts.push(`<rect x="${sunX - sunR}" y="${y}" width="${sunR * 2}" height="${3 + i * 1.6}" fill="#1f0a33"/>`);
  }
  parts.push(`</g>`);

  // Two layers of towers with a few lit windows.
  for (const [layer, min, max, fill, opacity] of [
    [0, 60, 200, "#140d2a", 0.7],
    [1, 30, 130, "#0b0817", 1],
  ] as const) {
    for (let x = layer === 0 ? 380 : 420; x < size.width; ) {
      const w = 30 + Math.round(random() * 60);
      const h = min + Math.round(random() * (max - min));
      const y = HORIZON - h;
      parts.push(
        `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#9b5cff" stroke-opacity="0.35" opacity="${opacity}"/>`,
      );
      for (let wy = y + 10; wy < HORIZON - 8; wy += 11) {
        for (let wx = x + 6; wx < x + w - 6; wx += 9) {
          if (random() > 0.12) continue;
          const color = neon[Math.floor(random() * neon.length)];
          parts.push(`<rect x="${wx}" y="${wy}" width="3" height="4" fill="${color}" opacity="${opacity}"/>`);
        }
      }
      if (layer === 1 && h > 90 && random() > 0.5) {
        const color = neon[Math.floor(random() * 2)];
        parts.push(
          `<rect x="${x + w - 8}" y="${y + 12}" width="4" height="${30 + random() * 30}" rx="1.5" fill="${color}"/>`,
        );
      }
      x += w + Math.round(random() * 5);
    }
  }

  // Horizon line.
  parts.push(`<rect x="0" y="${HORIZON - 1}" width="${size.width}" height="2" fill="#ff3ea5"/>`);
  parts.push(`<rect x="0" y="${HORIZON - 4}" width="${size.width}" height="8" fill="#ff3ea5" opacity="0.18"/>`);

  // Grid floor: lines converging on a vanishing point, rows closing in.
  const vx = 760;
  for (let i = -24; i <= 24; i++) {
    const bottomX = vx + i * 120;
    parts.push(
      `<line x1="${vx + i * 6}" y1="${HORIZON}" x2="${bottomX}" y2="${size.height}" stroke="#2de2e6" stroke-opacity="0.45" stroke-width="1.2"/>`,
    );
  }
  for (let i = 1; i <= 9; i++) {
    const y = HORIZON + (size.height - HORIZON) * Math.pow(i / 9, 1.9);
    parts.push(
      `<line x1="0" y1="${y}" x2="${size.width}" y2="${y}" stroke="#ff3ea5" stroke-opacity="${0.15 + i * 0.05}" stroke-width="1.2"/>`,
    );
  }

  // Darken behind the text.
  parts.push(`<rect width="${size.width}" height="${size.height}" fill="url(#scrim)"/>`);

  // HUD corners.
  const c = 22;
  for (const [x, y, dx, dy] of [
    [32, 32, 1, 1],
    [size.width - 32, 32, -1, 1],
    [32, size.height - 32, 1, -1],
    [size.width - 32, size.height - 32, -1, -1],
  ]) {
    parts.push(
      `<path d="M${x} ${y + dy * c}V${y}H${x + dx * c}" fill="none" stroke="#2de2e6" stroke-opacity="0.7" stroke-width="1.5"/>`,
    );
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}" viewBox="0 0 ${size.width} ${size.height}">${parts.join("")}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export default async function OpenGraphImage({ params }: { params: LocaleParams }) {
  const locale = await getLocale(params);
  const { site } = getContent(locale);
  const [firstName, ...rest] = profile.name.split(" ");

  const [geist, geistSemiBold, geistMono, serif, serifItalic, avatar] = await Promise.all([
    // ImageResponse can't read woff2, so these are static TTF/WOFF copies of
    // the site's fonts. The avatar is the same file as the header photo.
    readFile(join(process.cwd(), "assets/og-fonts/Geist-Regular.ttf")),
    readFile(join(process.cwd(), "assets/og-fonts/Geist-SemiBold.ttf")),
    readFile(join(process.cwd(), "assets/og-fonts/GeistMono-Regular.ttf")),
    readFile(join(process.cwd(), "assets/og-fonts/Newsreader-Medium.woff")),
    readFile(join(process.cwd(), "assets/og-fonts/Newsreader-Italic.woff")),
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
          position: "relative",
          background: "#07060f",
          color: "#f4f1ff",
          fontFamily: "Geist",
        }}
      >
        <img src={backdropSvg()} width={size.width} height={size.height} alt="" style={{ position: "absolute", inset: 0 }} />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "64px 72px 56px",
          }}
        >
          {/* Avatar + role */}
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div
              style={{
                display: "flex",
                position: "relative",
                width: 92,
                height: 92,
                borderRadius: 46,
                overflow: "hidden",
                background: "#ffffff",
                border: "3px solid #2de2e6",
                boxShadow: "0 0 28px rgba(45, 226, 230, 0.6)",
              }}
            >
              {/* Same face crop as the header avatar (300×300 of 800×800). */}
              <img
                src={avatarSrc}
                alt=""
                width={230}
                height={230}
                style={{ position: "absolute", left: -85, top: -3 }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div
                style={{
                  fontFamily: "Geist Mono",
                  fontSize: 22,
                  letterSpacing: 4,
                  color: "#2de2e6",
                }}
              >
                {site.role.toUpperCase()}
              </div>
              <div style={{ fontFamily: "Geist Mono", fontSize: 18, letterSpacing: 3, color: "#a59ec6" }}>
                {site.location.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Name */}
          <div
            style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginTop: 8 }}
          >
            <div
              style={{
                fontFamily: "Newsreader",
                fontSize: 120,
                lineHeight: 0.95,
                letterSpacing: -3,
                color: "#ffffff",
                textShadow: "0 0 30px rgba(45, 226, 230, 0.45)",
              }}
            >
              {firstName}
            </div>
            <div
              style={{
                fontFamily: "Newsreader Italic",
                fontSize: 120,
                lineHeight: 1,
                letterSpacing: -3,
                paddingRight: 12,
                backgroundImage: "linear-gradient(90deg, #2de2e6, #9b5cff 55%, #ff3ea5)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {rest.join(" ")}
            </div>
          </div>

          {/* Availability + domain */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 22px",
                borderRadius: 14,
                border: "1.5px solid rgba(45, 226, 230, 0.55)",
                background: "rgba(18, 12, 38, 0.75)",
                fontFamily: "Geist SemiBold",
                fontSize: 24,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  background: "#39ff9c",
                  boxShadow: "0 0 12px #39ff9c",
                }}
              />
              {site.availability.headline}
            </div>
            <div style={{ fontFamily: "Geist Mono", fontSize: 26, letterSpacing: 2, color: "#ff3ea5" }}>
              {new URL(profile.url).host}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: geist, weight: 400, style: "normal" },
        { name: "Geist SemiBold", data: geistSemiBold, weight: 600, style: "normal" },
        { name: "Geist Mono", data: geistMono, weight: 400, style: "normal" },
        { name: "Newsreader", data: serif, weight: 500, style: "normal" },
        { name: "Newsreader Italic", data: serifItalic, weight: 400, style: "italic" },
      ],
    },
  );
}
