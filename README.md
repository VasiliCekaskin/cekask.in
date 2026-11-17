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
| `content/profile.ts` | Facts that are the same in every language: name, domain, photos, email, social links, the two green flags, and the intro video |
| `content/legal.ts` | Address, hosting provider, and other details for the legal pages |
| `content/<locale>/site.ts` | Role, headline, intro, job-search flag text, SEO title and description |
| `content/<locale>/offers.ts` | The three facts under the intro, the video caption, and the side services (Einzelunternehmen) with prices |
| `content/<locale>/contact.ts` | Contact block for job offers: heading, one sentence, button label, email subject, note |
| `content/<locale>/ui.ts` | Interface labels and screen reader text |
| `content/<locale>/legal.tsx` | Impressum and privacy policy text (German is binding, English is a translation) |

Conventions:

- **`null` hides things.** A link with `url: null` is never rendered, so a
  missing profile URL can't show up as a broken link.
- **`TODO` comments** mark facts that still need confirming.
- The page leads with the job search. `profile.openToWork = false` hides the
  "open to a new role" flag (also on the link preview card);
  `profile.hasCapacity = false` hides the consulting flag on the services.
- **Intro video:** put an MP4 (H.264/AAC, ideally under ~20 MB) and a poster
  image in `public/`, then set `profile.introVideo`, e.g.
  `{ src: "/intro.mp4", poster: "/intro-poster.jpg", width: 1920, height: 1080, captions: { de: "/intro.de.vtt" } }`.
  While it's `null` the video block is hidden. It's self-hosted, so no third
  party is contacted, and nothing downloads until the visitor presses play.
- Keep every offer to one line per field. The page is meant to fit in about
  two screens.
- When you change text in one language, change the other one too.

## Design notes

The page should read like something set by hand, not a template:

- **Short on purpose:** intro (video on the right when set) with three facts,
  the side services, one contact block. Nothing else.
- **Palette:** warm paper with a faint static grain, soft ink, one muted sage
  accent, and green only for the status lamps. A quiet dark variant follows
  the system setting. Tokens live at the top of `app/globals.css`.
- **Typography:** Newsreader for headings and small italic notes, Geist for
  text. In the headline, `*words in asterisks*` are set in sage italics.
- **Editorial details:** section labels sit in a margin column (`.rail`);
  the services are a numbered price list rather than cards; the email
  address itself is the contact button; the footer carries a colophon with
  a "last updated" date. Update that date when you change content.
- **Technical-drawing nod:** the intro video sits inside corner marks with a
  numbered caption ("Abb. 1"), a quiet reference to the Industriemechaniker
  background.
- **No animations.** Hovers only fade color or nudge an arrow by 3px.
- Link previews: `app/[locale]/opengraph-image.tsx` renders a 1200×630 card
  per language at build time, using static font copies in `assets/og-fonts`.
- Fonts live in `app/fonts` (SIL Open Font License) and load with
  `next/font/local`, so no font provider is contacted.

## Legal pages

`/<locale>/impressum` and `/<locale>/datenschutz` are **not legal advice**
and have not been reviewed by a lawyer. Details live in `content/legal.ts`,
the texts in `content/<locale>/legal.tsx`; `showDraftNotice: true` puts a
draft banner on both pages.
