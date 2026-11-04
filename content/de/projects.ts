import type { CaseStudy, ExternalLink, Project } from "../types";

/** Das Hauptprojekt — bekommt das große Layout. */
export const featuredProject: Project = {
  slug: "trackdemos",
  name: "TrackDemos",
  tagline: "Ein privates Spotify für unfertige Musik.",
  kind: "Eigenes Produkt",
  description: [
    "Die meiste Musik wird nie veröffentlicht, und vieles davon sollte es auch nicht — noch nicht. TrackDemos gibt Musikerinnen und Musikern einen Ort, um Demos, Skizzen und Rohmixe hochzuladen, zu ordnen und nur mit den Menschen zu teilen, denen sie vertrauen.",
    "Teilen beginnt privat: Jeder Song hat einfache Sichtbarkeitseinstellungen, entdeckt wird über Freunde, und das Hören ist für das Handy in der Hosentasche gemacht. TrackDemos läuft als Web-App und als begleitende Mobile-App auf einem gemeinsamen Backend.",
  ],
  role: "Ich verantworte es komplett: Produktrichtung, Interface-Design, Architektur und Umsetzung über Web, Mobile, Backend und Infrastruktur.",
  highlights: [
    "Privatsphäre als Produktfeature — Zugriffsregeln, die auch verständlich bleiben, wenn man einfach nur einen Song an drei Freunde schicken will.",
    "Audio-Upload, Speicherung und Wiedergabe auf Basis von S3, mit Abo-Modellen, die über Stripe abgerechnet werden.",
    "Begonnen als Experiment mit KI-gestützter Entwicklung, daraus wurde eine lange Studie darüber, wie Coding-Agents in einen echten Engineering-Workflow passen — und wo menschliches Urteilsvermögen unverzichtbar bleibt.",
    "Lernen von echten Hörern: Die schwierigsten Probleme waren Usability und ehrliches Feedback, nicht der Code.",
  ],
  stack: [
    "Next.js",
    "React",
    "TypeScript",
    "React Native / Expo",
    "Supabase",
    "PostgreSQL",
    "AWS S3",
    "Stripe",
  ],
  links: [{ label: "trackdemos.com besuchen", url: "https://trackdemos.com" }],
};

/** Kleinere Projekte unter dem Hauptprojekt. */
export const projects: Project[] = [
  {
    slug: "email-form-responder",
    name: "Email Form Responder",
    tagline: "Formularverarbeitung und automatische Antworten für Framer-Websites.",
    kind: "Framer-Plugin",
    description: [
      "Ein Plugin für Framer, das sich darum kümmert, was nach dem Absenden eines Formulars passiert: Es verarbeitet die Einsendung und verschickt eine automatische E-Mail-Antwort, ohne dass die Betreiber der Website ein eigenes Backend aufsetzen müssen.",
    ],
    role: "Konzipiert und gebaut als kleines, wiederverwendbares Produkt im SaaS-Stil.",
    stack: ["Supabase", "E-Mail-Service-Integration", "TypeScript"],
    // TODO: einen öffentlichen Link ergänzen (Framer Marketplace oder Repository), falls vorhanden.
    links: [],
  },
];

/**
 * Anonymisierte berufliche Arbeit — beschrieben auf der Ebene "welches
 * Problem, welche Art von Lösung", ohne interne Namen oder Details.
 */
export const caseStudies: CaseStudy[] = [
  {
    title: "Eine neue Anwendung zur Selbstauskunft für Kunden",
    summary:
      "Eine neu entwickelte Anwendung, mit der Kunden von Finanzvermittlern ihre eigenen Angaben sicher übermitteln. Von Grund auf gebaut, vom Datenmodell bis zum Deployment.",
    stack: ["Next.js", "AWS Fargate", "DynamoDB", "Cognito"],
  },
  {
    title: "Cloud-native Services auf AWS",
    summary:
      "Containerisierte Services und geplante Jobs für Dokumentensynchronisierung, Reporting und Integrationen mit externen APIs von Finanzdienstleistern — vollständig als Infrastructure as Code definiert.",
    stack: ["AWS CDK", "ECS / Fargate", "Docker", "S3", "CloudWatch"],
  },
  {
    title: "Sichere Anmeldung und Zugriffskontrolle",
    summary:
      "Authentifizierungs- und Autorisierungsabläufe für Anwendungen, die von Finanzprofis genutzt werden — wo korrekte Berechtigungen wichtiger sind als schnelles Ausliefern.",
    stack: ["Cognito", "IAM"],
  },
  {
    title: "Modernisierung eines produktiven Frontends",
    summary:
      "Migration eines laufenden Frontends über größere Versionssprünge von Framework und Komponentenbibliothek hinweg — ohne Ausfall für die Menschen, die täglich damit arbeiten.",
    stack: ["Next.js", "React", "TypeScript"],
  },
];

/** Dezenter Hinweis auf weitere Projekte auf GitHub. */
export const moreWork: ExternalLink = {
  label: "Ältere Experimente und Nebenprojekte auf GitHub",
  url: "https://github.com/VasiliCekaskin?tab=repositories",
};
