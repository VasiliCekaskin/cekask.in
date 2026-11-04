# cekask.in

Personal portfolio of Vasili Cekaskin. Next.js 16 (App Router), TypeScript,
plain CSS Modules. Fully static, with no database, no client-side state,
no tracking, and fonts served from the site itself.

## Run

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # production build (all routes prerendered as static)
pnpm start        # serve the production build
pnpm lint
npx tsc --noEmit  # typecheck
```

## Languages

The site is available in English and German. Every page lives under
`/en/…` and `/de/…` and is prerendered as static HTML.

- `proxy.ts` redirects URLs without a language prefix (like `/` or
  `/impressum`) to the visitor's browser language — German if the browser
  prefers it, English otherwise. No cookie is set: the language switcher
  links to explicit `/en` or `/de` URLs, so a choice sticks naturally.
- Locales are defined in `i18n/config.ts`. Adding one means adding it there
  and creating a matching `content/<locale>/` folder; TypeScript flags any
  text that's missing.
- Unknown URLs get a bilingual 404 (`app/global-not-found.tsx`).

## Editing content

All personal facts live in `content/`. Components only render what's there.

| File | What it holds |
|---|---|
| `content/profile.ts` | Facts that are the same in every language: name, domain, photos, email, social links, availability on/off |
| `content/legal.ts` | Address, hosting provider, and other details for the legal pages |
| `content/<locale>/site.ts` | Role, intro, location, availability text, SEO title and description |
| `content/<locale>/projects.ts` | Featured project (TrackDemos), smaller projects, anonymized professional case studies |
| `content/<locale>/experience.ts` | Work history, newest first |
| `content/<locale>/expertise.ts` | The four capability groups and their tools |
| `content/<locale>/about.ts` | About paragraphs, portrait alt text, "How I work" principles |
| `content/<locale>/contact.ts` | Contact heading and the two "Hiring / Independent projects" notes |
| `content/<locale>/ui.ts` | Interface labels: navigation, section headings, buttons, screen reader text |
| `content/<locale>/legal.tsx` | Impressum and privacy policy text (German is binding, English is a translation) |

Conventions:

- **`null` hides things.** A link with `url: null` is never rendered, so a
  missing profile URL can't show up as a broken link.
- **`TODO` comments** mark facts that still need confirming.
- To hide the availability notice, set `profile.openToWork = false`.
- When you change text in one language, change the other one too.

## Design notes

- Tokens (colors, type scale, spacing) are CSS custom properties at the top
  of `app/globals.css`. The site uses one dark neon palette, matching the
  hero: cyan (`--accent`), magenta (`--accent-2`), and violet in between.
- The `.inverse` class turns an element into a raised neon panel and swaps in
  its palette for everything inside (used by the featured TrackDemos panel).
- Link previews: `app/[locale]/opengraph-image.tsx` renders a 1200×630 card
  per language at build time, using static font copies in `assets/og-fonts`.
- Typography: Newsreader (display serif), Geist (text), Geist Mono (labels).
  The font files live in `app/fonts` (SIL Open Font License) and are loaded
  with `next/font/local`, so no font provider is contacted at build or run time.
- The waveform motif (`components/Waveform.tsx`) is deterministic SVG, so
  it renders identically on the server and costs no client JavaScript.
- The hero background (`components/CyberBackdrop.tsx`) is an animated neon
  city drawn with CSS and SVG — no JavaScript. It holds a still frame when
  the visitor's system asks for reduced motion.
- The TrackDemos visual is a drawn illustration, captioned as such.
  Replace it with a real screenshot via `next/image` when one is available.

## Legal pages

`/<locale>/impressum` and `/<locale>/datenschutz` are **not legal advice**
and have not been reviewed by a lawyer. Details live in `content/legal.ts`,
the texts in `content/<locale>/legal.tsx`; `showDraftNotice: true` puts a
draft banner on both pages.
