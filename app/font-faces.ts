import localFont from "next/font/local";

// Font files are checked into app/fonts (SIL Open Font License) and served
// from this domain. Neither the build nor visitors contact a font provider.
const newsreader = localFont({
  variable: "--font-newsreader",
  src: [
    { path: "./fonts/Newsreader-Variable.woff2", weight: "200 800", style: "normal" },
    { path: "./fonts/Newsreader-Italic-Variable.woff2", weight: "200 800", style: "italic" },
  ],
  fallback: ["Iowan Old Style", "Georgia", "serif"],
});

const geist = localFont({
  variable: "--font-geist",
  src: "./fonts/Geist-Variable.woff2",
  weight: "100 900",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

const geistMono = localFont({
  variable: "--font-geist-mono",
  src: "./fonts/GeistMono-Variable.woff2",
  weight: "100 900",
  fallback: ["ui-monospace", "SF Mono", "Menlo", "monospace"],
});

/** Class names that define the font CSS variables; put on <html>. */
export const fontVariables = `${newsreader.variable} ${geist.variable} ${geistMono.variable}`;
