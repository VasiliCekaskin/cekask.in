import type { UiText } from "../types";

export const ui: UiText = {
  skipLink: "Skip to content",
  nav: {
    label: "Main",
    projects: "Projects",
    about: "About",
    experience: "Experience",
    contact: "Contact",
  },
  languageSwitcher: "Language",
  newTab: " (opens in a new tab)",

  hero: {
    explore: "Explore my work",
    contact: "Get in touch",
    asideLabel: "At a glance",
    basedIn: "Based in",
    experience: "Experience",
    focus: "Focus",
    languages: "Languages",
  },

  projects: {
    label: "Selected work",
    title: "Things I've designed, built, and shipped.",
    intro:
      "An independent product I own end to end, a smaller tool for real users, and the kind of work I do in a professional team.",
    featured: "Featured",
    myRole: "My role",
    highlights: "What made it interesting",
    technology: "Technology",
    technologyOf: (name) => `${name} technology`,
    casesTitle: "Professional work, anonymized",
    casesNote:
      "Built as part of a team at Qualitypool for the financial services industry. Proprietary, so described here without internal details.",
  },

  trackDemosVisual: {
    heading: "My demos",
    count: "3 unreleased",
    demos: [
      { title: "Late night idea", meta: "v4 · rough mix", access: "Friends" },
      { title: "Hook, take 2", meta: "voice memo", access: "Only me" },
      { title: "Untitled 07", meta: "v1 · beat sketch", access: "3 people" },
    ],
    playerMeta: "Shared with 2 friends",
    caption: "Illustration of the concept, not a screenshot.",
  },

  about: {
    label: "About",
    title: "I like software that's well built all the way down — and useful at the top.",
    howIWork: "How I work",
  },

  experience: {
    label: "Experience",
    title: "Where I've learned the craft.",
    intro:
      "Seven years of professional software development, including my training — most recently building production applications and cloud infrastructure in fintech.",
    at: " at ",
  },

  expertise: {
    label: "Expertise",
    title: "What I bring to a team.",
    intro:
      "Grouped by what it's for rather than by buzzword, with the tools I use for each underneath.",
    toolsOf: (capability) => `${capability} tools`,
  },

  contact: { label: "Contact" },

  footer: {
    note: "No cookies, no tracking — just the page.",
    legalLabel: "Legal",
    impressum: "Legal notice",
    datenschutz: "Privacy",
  },

  legal: {
    impressumTitle: "Legal notice",
    datenschutzTitle: "Privacy policy",
    draftNotice:
      "Draft: this page is incomplete and has not been legally reviewed. Highlighted details still need to be filled in.",
  },
};
