import type { UiText } from "../types";

export const ui: UiText = {
  skipLink: "Skip to content",
  languageSwitcher: "Language",
  newTab: " (opens in a new tab)",
  seeOffers: "Consulting and services",
  factsLabel: "At a glance",
  outcome: "Outcome",
  sections: { offers: "On the side", contact: "Contact" },
  offersList: "Services",
  onRequest: "on request",

  footer: {
    note: "No cookies, no tracking.",
    colophon: "Built in Ratingen · Last updated November 2026",
    legalLabel: "Legal",
    impressum: "Legal notice",
    datenschutz: "Privacy",
    consentSettings: "Cookie settings",
    diy: "DIY with AI",
  },

  diyNav: { label: "DIY with AI Guides", short: "Guides" },
  mailNav: { label: "Email me", short: "Email", subject: "Contact via cekask.in" },

  consent: {
    label: "Cookie notice",
    title: "A quick word on privacy",
    text: "This website sets no cookies and uses no tracking. With your consent, it only remembers your game progress (best score, found easter eggs) in your browser. Without consent everything works the same; your progress is just gone once you close the page.",
    accept: "Accept",
    reject: "Decline",
    settings: "Settings",
    settingsTitle: "Cookie settings",
    settingsText: "You decide what is stored in your browser. You can change your choice at any time via “Cookie settings” at the bottom of every page.",
    necessary: {
      name: "Necessary",
      text: "Only stores your choice in your browser, so the notice doesn't appear on every visit. No cookies, nothing shared.",
      always: "Always on",
    },
    storage: {
      name: "Save game progress",
      text: "Remembers your Whack-a-Vasili best score and the easter eggs found in the office, locally in your browser (localStorage). None of it is sent to me or anyone else.",
    },
    save: "Save choice",
    close: "Close",
    privacy: "Privacy policy",
    imprint: "Legal notice",
  },

  legal: {
    impressumTitle: "Legal notice",
    datenschutzTitle: "Privacy policy",
    draftNotice:
      "Draft: this page is incomplete and has not been legally reviewed. Highlighted details still need to be filled in.",
  },
};
