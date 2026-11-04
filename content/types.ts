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

export type Project = {
  slug: string;
  name: string;
  /** Short line under the title. */
  tagline: string;
  /** What kind of project this is, e.g. "Independent product". */
  kind: string;
  /** One or more paragraphs describing what it does and why it exists. */
  description: string[];
  /** What Vasili personally did on it. */
  role: string;
  highlights?: string[];
  stack: string[];
  links: ExternalLink[];
};

export type CaseStudy = {
  title: string;
  summary: string;
  stack: string[];
};

export type ExperienceEntry = {
  organization: string;
  role: string;
  /** Free-form so it can say "2019 – 2022", "Since January 2024", etc. */
  period: string;
  summary: string;
  responsibilities?: string[];
  /** Rendered smaller — for earlier, less relevant positions. */
  compact?: boolean;
};

export type Capability = {
  title: string;
  description: string;
  tools: string[];
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
  /** Set to false to hide the availability notice entirely. */
  openToWork: boolean;
  email: string | null;
  social: {
    github: ExternalLink;
    linkedin: ExternalLink;
  };
};

/** Translatable text for the hero, availability notice, and SEO. */
export type SiteText = {
  role: string;
  tagline: string;
  intro: string;
  location: string;
  experience: string;
  focus: string;
  languages: string[];
  availability: {
    headline: string;
    detail: string;
    secondary: string;
  };
  seo: {
    title: string;
    description: string;
  };
};

export type AboutText = {
  portraitAlt: string;
  paragraphs: string[];
  principles: { title: string; text: string }[];
};

export type ContactText = {
  title: string;
  intro: string;
  audiences: { title: string; text: string }[];
};

/** Interface labels: navigation, headings, buttons, screen reader text. */
export type UiText = {
  skipLink: string;
  nav: {
    label: string;
    projects: string;
    about: string;
    experience: string;
    contact: string;
  };
  languageSwitcher: string;
  /** Appended (visually hidden) to links that open in a new tab. */
  newTab: string;
  hero: {
    explore: string;
    contact: string;
    asideLabel: string;
    basedIn: string;
    experience: string;
    focus: string;
    languages: string;
  };
  projects: {
    label: string;
    title: string;
    intro: string;
    featured: string;
    myRole: string;
    highlights: string;
    technology: string;
    technologyOf: (name: string) => string;
    casesTitle: string;
    casesNote: string;
  };
  /** Made-up example content for the drawn TrackDemos illustration. */
  trackDemosVisual: {
    heading: string;
    count: string;
    demos: { title: string; meta: string; access: string }[];
    playerMeta: string;
    caption: string;
  };
  about: { label: string; title: string; howIWork: string };
  experience: { label: string; title: string; intro: string; at: string };
  expertise: {
    label: string;
    title: string;
    intro: string;
    toolsOf: (capability: string) => string;
  };
  contact: { label: string };
  footer: {
    note: string;
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
  featuredProject: Project;
  projects: Project[];
  caseStudies: CaseStudy[];
  moreWork: ExternalLink;
  experience: ExperienceEntry[];
  capabilities: Capability[];
  about: AboutText;
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
