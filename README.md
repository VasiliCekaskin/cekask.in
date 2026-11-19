# cekask.in

Personal portfolio of Vasili Cekaskin. Next.js 16 (App Router), TypeScript,
plain CSS Modules. Fully static, with no database, no tracking, no cookies, and fonts
served from the site itself. Loud, colorful and playable on purpose.

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
| `content/profile.ts` | Facts that are the same in every language: name, domain, photo, the cartoon faces, email, social links, and the two green flags |
| `content/legal.ts` | Address, hosting provider, and other details for the legal pages |
| `content/<locale>/site.ts` | Role, headline, intro, job-search flag text, SEO title and description |
| `content/<locale>/offers.ts` | The three facts under the intro and the side services (Einzelunternehmen) with prices |
| `content/<locale>/mottos.ts` | Texts of every motto and of the spin and recommended buttons |
| `content/<locale>/fun.ts` | All the playful text: face speech bubbles, stickers, ticker, the "don't press" surprise, the game, peek-a-boo |
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
- **Faces:** the big grinning faces (hero, surprise, game, peek-a-boo,
  contact) are placeholder cartoons in `public/faces/` (`grin`, `wink`,
  `shock`). To use real pictures, drop roughly square images (transparent
  PNGs look best) into `public/faces/` and point `profile.faces` at them.
- **Game ad:** record your ad, put it in `public/` (e.g. `ad.mp4`) and set
  `profile.adVideo = { src: "/ad.mp4" }`. It autoplays in the ad break.
- Keep every offer to one line per field.
- When you change text in one language, change the other one too.

## Mottos

The home page has several complete mottos: different concept, texts,
look and fonts. The 🎰 button in the header spins to the next one (every
motto comes up once before any repeats). Every page load starts with the
professional CV, which is also what search engines see first.

| Motto | Folder | What it is |
|---|---|---|
| Voll professionell | `themes/pro` | Plain, printable CV with photo; "Print / save as PDF" |
| ✨ Klartext (recommended) | `themes/clarity` | Big and shiny, only the essentials: who, three numbers, four core skills, one button |
| Voll vibecoded | `themes/vibe` | The loud sticker app: poke-the-face, stickers, "don't press", Whack-a-Vasili with paywall + ad, peek-a-boo |
| Terminal | `themes/terminal` | Interactive shell (`help`, `skills`, `offers`, `hire`, `spin` …), with tap-able command chips |
| Der Tagesvasili | `themes/paper` | Tabloid front page with classifieds (the services), weather, horoscope |
| Kassenbon | `themes/receipt` | Vasili as a till receipt, with a barcode |
| Charakterbogen | `themes/rpg` | RPG character sheet: level, attribute bars, inventory, services as quests |
| Steckbrief | `themes/wanted` | Western "wanted" poster; reward: one job interview |
| Chat | `themes/chat` | Messenger conversation with quick-reply questions |
| Rezept | `themes/recipe` | Cookbook recipe for a strong dev team, on a checkered tablecloth |
| Bordkarte | `themes/boarding` | Boarding pass, flight VC 007 from DUS to your team |

The shiny ✨ "Recommended" button in the header jumps straight to Klartext.
The RPG attribute values are playful self-ratings; adjust them in
`content/<locale>/mottos.ts`.

How it fits together:

- `components/MottoStage.tsx` gets every motto pre-rendered from the server
  and mounts only the active one. It sets `html[data-motto]`.
- `lib/motto.ts` holds the current motto (in memory only).
- `app/globals.css` defines the design tokens per motto, so the shared
  header and footer change with it. The base tokens are the professional
  look, also used by the legal pages and the 404.
- Texts live in `content/<locale>/mottos.ts`; the vibecoded toys' texts in
  `content/<locale>/fun.ts`. Services, prices and the email come from the
  shared content, so they're the same in every motto.
- Adding a motto: add its id to `MottoId` in `content/types.ts` and to
  `MOTTOS` in `lib/motto.ts`, its texts to both `mottos.ts` files, its
  tokens to `globals.css`, a component in `themes/<id>/`, and an entry in
  `app/[locale]/page.tsx`.
- Konami code (↑ ↑ ↓ ↓ ← → ← → B A) toggles party mode in every motto.
- Motion respects `prefers-reduced-motion`.
- Link previews: `app/[locale]/opengraph-image.tsx` renders a 1200×630 card
  per language at build time, using static font copies in `assets/og-fonts`.
- Fonts live in `app/fonts` (SIL Open Font License) and load with
  `next/font/local`, so no font provider is contacted.

## Cookie banner

`components/ConsentBanner.tsx` + `lib/consent.ts`. The site sets no cookies;
the only optional storage is game progress in `localStorage`
(`whack-a-vasili-best`, `office-eggs`), written only after consent and deleted
when consent is withdrawn. Decline and Accept look the same, nothing is
pre-ticked, the banner never blocks the page, and "Cookie settings" in the
footer (and on the privacy page) reopens the choice. Anything new that stores
data on the device must go through `hasStorageConsent()` and be listed in
`OPTIONAL_KEYS` and the privacy policy.

## DIY with AI

The guides at https://diywithai.cekask.in are linked from the header, the
footer, the in-game computer and the CV's projects (`DIY_URL` in
`content/profile.ts`). That site has no legal pages of its own: its footer
links to this site's Impressum and Datenschutz, which cover both domains
(`legal.sites` in `content/legal.ts`). Update them when DIY with AI starts
processing anything new.

## Legal pages

`/<locale>/impressum` and `/<locale>/datenschutz` are **not legal advice**
and have not been reviewed by a lawyer. Details live in `content/legal.ts`,
the texts in `content/<locale>/legal.tsx`; `showDraftNotice: true` puts a
draft banner on both pages.
