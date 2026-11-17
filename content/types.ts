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

export type IntroVideo = {
  /** MP4 (H.264 + AAC) in /public, e.g. "/intro.mp4". */
  src: string;
  /** Still image shown before playback, e.g. "/intro-poster.jpg". */
  poster: string;
  /** Pixel size of the video, so the page reserves the right box. */
  width: number;
  height: number;
  /** Optional WebVTT subtitles per language, e.g. { de: "/intro.de.vtt" }. */
  captions: Partial<Record<"de" | "en", string>>;
};

/** Facts that are the same in every language. */
export type Profile = {
  name: string;
  /** Production origin, used for canonical URLs, sitemap, and Open Graph. */
  url: string;
  /** Small round portrait in the header, from /public. */
  avatar: string;
  /** Larger portrait in the About section, from /public. */
  portrait: { src: string; width: number; height: number };
  /** Green "open to new roles" flag at the top. False hides it everywhere. */
  openToWork: boolean;
  /** Green "capacity for consultation" flag on the services. False hides it. */
  hasCapacity: boolean;
  /**
   * The intro video, self-hosted from /public so no third party is contacted.
   * `null` hides the video block until the file exists.
   */
  introVideo: IntroVideo | null;
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
};

export type VideoText = {
  /** Figure number in the caption, e.g. "Abb. 1". */
  figure: string;
  title: string;
  /** One line under the video. */
  caption: string;
  /** Accessible name for the player. */
  label: string;
  fallback: string;
  /** Alt text for the portrait shown until the video exists. */
  photoAlt: string;
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
  };
  legal: {
    impressumTitle: string;
    datenschutzTitle: string;
    draftNotice: string;
  };
};

/** Everything a page needs in one language. Both locales must match it. */
export type Content = {
  site: SiteText;
  facts: Fact[];
  video: VideoText;
  offers: OffersText;
  contact: ContactText;
  ui: UiText;
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
  lastUpdated: string | null;
};
