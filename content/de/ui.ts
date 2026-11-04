import type { UiText } from "../types";

export const ui: UiText = {
  skipLink: "Zum Inhalt springen",
  nav: {
    label: "Hauptnavigation",
    projects: "Projekte",
    about: "Über mich",
    experience: "Erfahrung",
    contact: "Kontakt",
  },
  languageSwitcher: "Sprache",
  newTab: " (öffnet in einem neuen Tab)",

  hero: {
    explore: "Meine Arbeit ansehen",
    contact: "Kontakt aufnehmen",
    asideLabel: "Auf einen Blick",
    basedIn: "Standort",
    experience: "Erfahrung",
    focus: "Schwerpunkt",
    languages: "Sprachen",
  },

  projects: {
    label: "Ausgewählte Arbeiten",
    title: "Was ich entworfen, gebaut und ausgeliefert habe.",
    intro:
      "Ein eigenes Produkt, das ich von Anfang bis Ende verantworte, ein kleineres Tool für echte Nutzer und die Art von Arbeit, die ich im professionellen Team mache.",
    featured: "Im Fokus",
    myRole: "Meine Rolle",
    highlights: "Was es spannend gemacht hat",
    technology: "Technologie",
    technologyOf: (name) => `Technologie von ${name}`,
    casesTitle: "Berufliche Projekte, anonymisiert",
    casesNote:
      "Im Team bei Qualitypool für die Finanzdienstleistungsbranche entstanden. Die Software ist proprietär, deshalb beschreibe ich sie hier ohne interne Details.",
  },

  trackDemosVisual: {
    heading: "Meine Demos",
    count: "3 unveröffentlicht",
    demos: [
      { title: "Idee, spät nachts", meta: "v4 · Rohmix", access: "Freunde" },
      { title: "Hook, Take 2", meta: "Sprachmemo", access: "Nur ich" },
      { title: "Ohne Titel 07", meta: "v1 · Beat-Skizze", access: "3 Personen" },
    ],
    playerMeta: "Mit 2 Freunden geteilt",
    caption: "Illustration des Konzepts, kein Screenshot.",
  },

  about: {
    label: "Über mich",
    title: "Ich mag Software, die bis ins Fundament gut gebaut ist — und oben nützlich.",
    howIWork: "Wie ich arbeite",
  },

  experience: {
    label: "Erfahrung",
    title: "Wo ich mein Handwerk gelernt habe.",
    intro:
      "Sieben Jahre professionelle Softwareentwicklung, inklusive Ausbildung — zuletzt mit Anwendungen und Cloud-Infrastruktur für die Finanzbranche, die in Produktion laufen.",
    at: " bei ",
  },

  expertise: {
    label: "Kompetenzen",
    title: "Was ich in ein Team einbringe.",
    intro:
      "Gruppiert danach, wofür es gut ist — nicht nach Schlagworten —, mit den Werkzeugen, die ich dafür nutze.",
    toolsOf: (capability) => `Werkzeuge für ${capability}`,
  },

  contact: { label: "Kontakt" },

  footer: {
    note: "Keine Cookies, kein Tracking — nur die Seite.",
    legalLabel: "Rechtliches",
    impressum: "Impressum",
    datenschutz: "Datenschutz",
  },

  legal: {
    impressumTitle: "Impressum",
    datenschutzTitle: "Datenschutzerklärung",
    draftNotice:
      "Entwurf: Diese Seite ist noch nicht vollständig und rechtlich nicht geprüft. Markierte Angaben müssen ergänzt werden.",
  },
};
