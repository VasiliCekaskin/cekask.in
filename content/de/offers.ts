import type { Fact, OffersText, VideoText } from "../types";

export const facts: Fact[] = [
  { value: "7 Jahre", label: "Softwareentwicklung, inkl. Ausbildung" },
  { value: "Finanzen & Versicherung", label: "AWS-Anwendungen in Produktion" },
  {
    value: "TrackDemos",
    label: "Eigenes Produkt: Web-App und (bald) Mobile",
    link: { label: "trackdemos.com", url: "https://trackdemos.com" },
  },
];

export const video: VideoText = {
  figure: "Abb. 1",
  title: "Kurz vorgestellt",
  caption: "Eine Minute über mich, meine Arbeit und was ich mitbringe.",
  label: "Vorstellungsvideo von Vasili Cekaskin",
  fallback: "Ihr Browser kann dieses Video nicht abspielen.",
  photoAlt: "Vasili Cekaskin lächelnd auf einer Terrasse am Meer bei Sonnenuntergang",
};

/**
 * Nebenbei angebotene Leistungen (Einzelunternehmen).
 * TODO: prüfen, ob der Preis als Endpreis gilt (Kleinunternehmerregelung)
 * oder "zzgl. MwSt." dazugehört.
 */
export const offers: OffersText = {
  title: "Beratung und Leistungen",
  intro:
    "Neben meiner Festanstellung übernehme ich kleine, klar umrissene Aufträge. Das Erstgespräch ist kostenlos.",
  availability: {
    headline: "Freie Kapazität für Beratung",
    detail: "Erstgespräch kostenlos",
  },
  button: "Beratung anfragen",
  mailSubject: "Beratungsanfrage",
  items: [
    {
      title: "Individuelle Software für Unternehmen",
      price: "1.000–5.000\u202f€",
      text: "Kleine, klar umrissene B2B-Lösungen: eine interne Anwendung, eine Automatisierung oder eine KI-Integration in Ihre bestehenden Abläufe. Läuft auf einer Cloud-Infrastruktur, die ich aufsetze, oder fügt sich in Ihre eigene ein.",
      outcome: "Laufende Software in Produktion, inklusive Code und Dokumentation",
      format: "Pro Projekt, Festpreis nach dem Erstgespräch",
    },
    {
      title: "Landingpage oder Website",
      price: "ab 129\u202f€",
      text: "Von der einfachen Landingpage (129\u202f€: Sie schicken mir 3 bis 10 Bilder und einen Satz zu Ihrem Unternehmen) bis zur vollständigen Website mit Content-Management-System (bis etwa 1.000\u202f€). Ich hoste und pflege sie für Sie, oder Sie bekommen sie zum selbst Hosten übergeben.",
      outcome: "Fertige Website, bei mir gehostet oder mit Anleitung zum Hosting übergeben",
      format: "Hosting und Wartung (DSGVO- und Sicherheitsupdates) als monatlicher Vertrag möglich",
    },
    {
      title: "Technische Beratung",
      text: "Architektur, Cloud, Tool-Auswahl oder ein festgefahrenes Projekt: eine zweite Meinung von jemandem, der es täglich baut.",
      outcome: "Klare Empfehlung, schriftlich zusammengefasst",
      format: "Stundenweise, per Video",
    },
  ],
};
