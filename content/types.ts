/**
 * Shapes for everything in `content/`. Components only ever read these
 * types, so editing copy never requires touching a component.
 *
 * Convention for unknown facts: use `null`. Components skip anything that is
 * `null`, so a missing URL never renders as a broken link.
 */

export type ExternalLink = {
  label: string;
  /** `null` = not provided yet; the link is hidden until it is set. */
  url: string | null;
};

/** Facts that are the same in every language. */
export type Profile = {
  name: string;
  /** Production origin, used for canonical URLs, sitemap, and Open Graph. */
  url: string;
  /** Larger portrait in the About section, from /public. */
  portrait: { src: string; width: number; height: number };
  /** Green "open to new roles" flag at the top. False hides it everywhere. */
  openToWork: boolean;
  /** Green "capacity for consultation" flag on the services. False hides it. */
  hasCapacity: boolean;
  /**
   * The big cheeky faces used all over the page (hero, surprise, game,
   * peek-a-boo). Placeholders live in /public/faces; drop in your own
   * images (PNG/JPG/SVG, roughly square, transparent background looks best)
   * and point these paths at them.
   */
  faces: { grin: string; wink: string; shock: string };
  /**
   * The "ad" shown in Whack-a-Vasili when someone wants another round.
   * `null` shows the built-in animated fake commercial; set it to your own
   * MP4 in /public (e.g. { src: "/ad.mp4" }) to play that instead.
   */
  adVideo: { src: string; poster?: string } | null;
  email: string | null;
  social: {
    github: ExternalLink;
    linkedin: ExternalLink;
  };
};

/** Translatable text for the intro, availability flag, and SEO. */
export type SiteText = {
  role: string;
  location: string;
  /** The one big sentence at the top. Wrap words in *asterisks* to set them in italics. */
  headline: string;
  intro: string;
  /** The job-search flag at the top. */
  availability: { headline: string; detail: string };
  seo: { title: string; description: string };
};

/** One product offered by the Einzelunternehmen. Keep each field to one line. */
export type Offer = {
  title: string;
  /** Fixed price, shown prominently. Omit when the price depends on scope. */
  price?: string;
  text: string;
  /** What the client holds in their hands afterwards. */
  outcome: string;
  /** Duration or format, e.g. "ca. 1 Woche". */
  format: string;
};

export type OffersText = {
  title: string;
  intro: string;
  /** The consultation flag on the services section. */
  availability: { headline: string; detail: string };
  button: string;
  mailSubject: string;
  items: Offer[];
  /** Box under the services: pro-bono work for good causes. */
  charity: { title: string; text: string; button: string; mailSubject: string };
};

/** Short proof points under the intro. */
export type Fact = {
  value: string;
  label: string;
  link?: ExternalLink;
};

export type ContactText = {
  title: string;
  text: string;
  button: string;
  /** Subject line prefilled in the email. */
  mailSubject: string;
  /** Quiet extra line under the button. `null` hides it. */
  note: string | null;
};

/** Interface labels: navigation, buttons, screen reader text. */
export type UiText = {
  skipLink: string;
  languageSwitcher: string;
  /** Appended (visually hidden) to links that open in a new tab. */
  newTab: string;
  seeOffers: string;
  factsLabel: string;
  outcome: string;
  /** Margin labels for the sections. */
  sections: { offers: string; contact: string };
  /** Accessible label for the list of services. */
  offersList: string;
  /** Shown in the services price column when there is no fixed price. */
  onRequest: string;
  footer: {
    note: string;
    /** Small print about how the page was made. */
    colophon: string;
    legalLabel: string;
    impressum: string;
    datenschutz: string;
    /** Reopens the cookie settings. */
    consentSettings: string;
    /** Link to the DIY with AI guides on the subdomain. */
    diy: string;
  };
  /** Header link to the DIY with AI guides (full label, and the short one on phones). */
  diyNav: { label: string; short: string };
  /** Header email button: opens the mail app with a prefilled subject. */
  mailNav: { label: string; short: string; subject: string };
  /** Cookie banner and settings dialog (components/ConsentBanner.tsx). */
  consent: {
    label: string;
    title: string;
    text: string;
    accept: string;
    reject: string;
    settings: string;
    settingsTitle: string;
    settingsText: string;
    necessary: { name: string; text: string; always: string };
    storage: { name: string; text: string };
    save: string;
    close: string;
    privacy: string;
    imprint: string;
  };
  legal: {
    impressumTitle: string;
    datenschutzTitle: string;
    draftNotice: string;
  };
};

/** All the playful bits: the clickable face, stickers, surprise, game. */
export type FunText = {
  /** Alt text for the big face. */
  faceAlt: string;
  /** Tiny label next to the face. */
  faceHint: string;
  /** Speech bubbles cycled when someone pokes the face. */
  faceLines: string[];
  /** Words on the draggable stickers in the hero. */
  stickers: string[];
  dragHint: string;
  /** Scrolling ticker between the sections. */
  marquee: string[];
  surprise: {
    label: string;
    title: string;
    text: string;
    button: string;
    /** Headline of the reveal; the first one is "Ha! You didn't expect that". */
    reveals: string[];
    sub: string;
    close: string;
  };
  game: {
    label: string;
    title: string;
    intro: string;
    start: string;
    again: string;
    score: string;
    best: string;
    time: string;
    hitFace: string;
    bugLabel: string;
    faceLabel: string;
    holeLabel: string;
    /** End-of-round verdicts, picked by the highest `min` the score reaches. */
    results: { min: number; text: string }[];
    /** After a round: pay for another one with an email or an ad. */
    paywall: {
      title: string;
      text: string;
      contact: string;
      contactSubject: string;
      contactThanks: string;
      ad: string;
    };
    ad: {
      badge: string;
      /** "Continue in" — followed by the seconds left. */
      wait: string;
      continue: string;
      /** Lines of the fake commercial, shown one after another. */
      slides: string[];
      cta: string;
      fine: string;
    };
  };
  peek: { text: string; label: string };
};

/** The mottos the "spin" button cycles through. Each is a whole different page. */
export type MottoId =
  | "pro"
  | "clarity"
  | "vibe"
  | "terminal"
  | "paper"
  | "receipt"
  | "rpg"
  | "wanted"
  | "chat"
  | "recipe"
  | "boarding"
  | "ai";

/** The recommended motto: big, shiny, only the essentials. */
export type ClarityText = {
  badge: string;
  headline: string;
  sub: string;
  skillsTitle: string;
  /** Keep it to the four that matter most. */
  skills: string[];
  cta: string;
  secondary: string;
};

export type RpgText = {
  sheet: string;
  charClass: string;
  level: string;
  xp: string;
  statsTitle: string;
  stats: { label: string; value: number }[];
  inventoryTitle: string;
  inventory: string[];
  questsTitle: string;
  reward: string;
  sideQuest: string;
  specialTitle: string;
  special: string;
  cta: string;
};

export type WantedText = {
  wanted: string;
  by: string;
  alias: string;
  chargesTitle: string;
  charges: string[];
  reward: string;
  rewardText: string;
  lastSeen: string;
  sightingsTitle: string;
  tips: string;
  photoAlt: string;
};

export type ChatText = {
  status: string;
  typing: string;
  greeting: string[];
  /** Quick replies; the answer to "offers", "charity" and "contact" is built from shared content. */
  questions: { id: "about" | "skills" | "offers" | "charity" | "contact" | "hire"; q: string; a: string[] }[];
  repliesLabel: string;
};

/** "AI assistant": a chatbot that agrees, enthusiastically, that you should hire Vasili. */
export type AiText = {
  /** Assistant name, shown in the top bar and next to answers. */
  bot: string;
  /** Fake model picker label, e.g. "Vasili 7.0". */
  model: string;
  modelNote: string;
  newChat: string;
  greeting: string;
  placeholder: string;
  inputLabel: string;
  send: string;
  suggestions: string[];
  thinking: string;
  disclaimer: string;
  /** Under every answer, above the contact card. */
  contactIntro: string;
  mailButton: string;
  /**
   * Keyword rules, checked in order; the first rule with a word contained in
   * the (lower-cased) question wins and one of its replies is picked at random.
   */
  rules: { words: string[]; replies: string[] }[];
  fallback: string[];
};

/** Everything in the office game the player can use. */
export type OfficeThing =
  | "computer"
  | "door"
  | "coffee"
  | "whiteboard"
  | "portrait"
  | "plant"
  | "duck"
  | "rack"
  | "wrench"
  | "guitar"
  | "light"
  | "cat"
  | "calendar"
  | "trash"
  | "note"
  | "trophy"
  | "bathroom"
  | "shower";

/** The ones that count as easter eggs (everything but the computer and the door). */
export type OfficeEgg = Exclude<OfficeThing, "computer" | "door" | "bathroom">;

export type GameText = {
  /** Start screen */
  place: string;
  enter: string;
  controlsKeys: string;
  controlsTouch: string;
  /** Opens the computer without playing (keyboard, screen readers, no WebGL). */
  skip: string;
  loading: string;
  paused: string;
  resume: string;
  /** "Press E" / "Tap" prompts per object, e.g. "Computer benutzen". */
  use: string;
  prompts: Record<OfficeThing, string>;
  /**
   * What each easter egg says when used; one line is picked at random.
   * `light` is special: [lights off, lights on].
   */
  eggs: Record<OfficeEgg, string[]>;
  /** "Easter egg {n}/{total}" toast; and the line when all are found. */
  eggFound: string;
  eggsLabel: string;
  allFound: string;
  /** After the 5th coffee: the player walks faster. */
  coffeeRush: string;
  /** Toast after a motto restyled the office, e.g. "The office now wears: {name}". */
  themed: string;
  /** Glows on the back wall when the lights are off. */
  glow: string;
  /** Circled on the wall calendar, under today's date. */
  calendarNote: string;
  /** The sticky note hidden under the desk. */
  note: string;
  /** The bathroom: Vasili in the shower, only his head showing, talks to you. */
  shower: {
    /** Toast when the bathroom door opens for the first time. */
    heard: string;
    name: string;
    lines: string[];
    /** Second visit onwards. */
    again: string[];
    next: string;
    invite: string;
    leave: string;
  };
  door: string;
  /** Lines drawn on the in-game whiteboard and name plate. */
  board: string[];
  plate: string;
  /** The in-game computer */
  os: string;
  screenHint: string;
  close: string;
  statsTitle: string;
  skillsTitle: string;
  mottosTitle: string;
  mottosHint: string;
  contact: string;
  exit: string;
  /** App window: back to the app grid, open the motto as a normal page. */
  apps: string;
  openPage: string;
  whackBlurb: string;
  /** The DIY with AI app on the in-game computer (opens the subdomain). */
  diyBlurb: string;
  /** Phones: the game is played in landscape. */
  rotate: string;
  rotateHint: string;
  pause: string;
};

export type RecipeText = {
  kicker: string;
  title: string;
  meta: string[];
  ingredientsTitle: string;
  ingredients: string[];
  stepsTitle: string;
  steps: string[];
  tipTitle: string;
  tip: string;
  sidesTitle: string;
  cta: string;
};

export type BoardingText = {
  airline: string;
  pass: string;
  passengerLabel: string;
  from: { code: string; city: string };
  to: { code: string; city: string };
  fields: { label: string; value: string }[];
  baggageTitle: string;
  baggage: string[];
  extrasTitle: string;
  cta: string;
  notice: string;
};

export type ProText = {
  eyebrow: string;
  summaryTitle: string;
  summary: string[];
  contactTitle: string;
  skillsTitle: string;
  skills: { group: string; items: string[] }[];
  experienceTitle: string;
  experience: { period: string; title: string; place: string; points: string[] }[];
  projectsTitle: string;
  projects: { name: string; url: string | null; text: string }[];
  sideTitle: string;
  languagesTitle: string;
  languages: string[];
  photoAlt: string;
};

export type TerminalText = {
  /** Shown in the prompt, e.g. "guest@vasili". */
  user: string;
  boot: string[];
  inputLabel: string;
  chipsLabel: string;
  help: { cmd: string; desc: string }[];
  whoami: string[];
  ls: string;
  notFound: string;
  sudo: string;
  game: string;
  hire: string;
  spin: string;
  offersHead: string;
  contactHead: string;
};

export type PaperText = {
  masthead: string;
  tagline: string;
  dateline: string;
  kicker: string;
  headline: string;
  subhead: string;
  photoCaption: string;
  article: string[];
  quote: string;
  quoteBy: string;
  factsTitle: string;
  classifiedsTitle: string;
  classifiedsCta: string;
  weatherTitle: string;
  weather: string;
  horoscopeTitle: string;
  horoscope: string;
  charityTitle: string;
  lettersTitle: string;
  letters: string;
};

export type ReceiptText = {
  store: string;
  address: string;
  meta: string[];
  items: { label: string; price: string }[];
  extrasTitle: string;
  discount: { label: string; price: string };
  totalLabel: string;
  total: string;
  payment: string;
  thanks: string[];
  redeem: string;
  charity: string;
};

export type MottosText = {
  spin: { label: string; spinning: string; announce: string };
  /** The shiny shortcut to the recommended motto. */
  recommend: { label: string; hint: string };
  names: Record<MottoId, string>;
  /** The home page overview: introduction plus a preview card per motto. */
  /** Roll button and the header's "back to overview" button. */
  overview: {
    /** Big call to action: roll a random motto. */
    roll: string;
    rollHint: string;
    /** Header button back to the overview. */
    all: string;
  };
  /** One line per motto, shown on its app in the in-game computer. */
  blurbs: Record<MottoId, string>;
  /** The home page game: walk through Vasili's office, use the computer. */
  game: GameText;
  pro: ProText;
  terminal: TerminalText;
  paper: PaperText;
  receipt: ReceiptText;
  clarity: ClarityText;
  rpg: RpgText;
  wanted: WantedText;
  chat: ChatText;
  recipe: RecipeText;
  boarding: BoardingText;
  ai: AiText;
};

/** Everything a page needs in one language. Both locales must match it. */
export type Content = {
  site: SiteText;
  facts: Fact[];
  fun: FunText;
  offers: OffersText;
  contact: ContactText;
  ui: UiText;
  mottos: MottosText;
};

export type LegalConfig = {
  showDraftNotice: boolean;
  name: string;
  street: string | null;
  postalCodeAndCity: string | null;
  email: string | null;
  phone: string | null;
  vatId: string | null;
  hosting: {
    provider: string | null;
    address: string | null;
    privacyPolicyUrl: string | null;
  };
  supervisoryAuthority: { name: string; url: string };
  /**
   * Every website these legal pages cover. The subdomains link here for
   * their imprint and privacy policy instead of having their own.
   */
  sites: { domain: string; name: string; url: string }[];
  lastUpdated: string | null;
};
