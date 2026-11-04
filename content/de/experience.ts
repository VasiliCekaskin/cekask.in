import type { ExperienceEntry } from "../types";

/** Neueste zuerst. */
export const experience: ExperienceEntry[] = [
  {
    organization: "Qualitypool / Qualitytech",
    role: "Softwareentwickler",
    // TODO: sobald das Enddatum feststeht, z. B. "Jan. 2024 – Dez. 2026".
    period: "Seit Januar 2024",
    summary:
      "Produktive Software für die Finanzdienstleistungsbranche — Anwendungen für Baufinanzierungsvermittler und Finanzprofis sowie die AWS-Infrastruktur dahinter.",
    responsibilities: [
      "Eine neue Anwendung zur Selbstauskunft für Kunden mit Next.js, AWS Fargate, DynamoDB und Cognito gebaut.",
      "AWS-Microservices mit dem CDK entworfen und ausgerollt, darunter containerisierte Services, geplante Jobs, Dokumentensynchronisierung und Reporting.",
      "Externe APIs von Finanzdienstleistern und weitere Drittsysteme angebunden, um Geschäftsprozesse zu automatisieren.",
      "Sichere Authentifizierungs- und Autorisierungsabläufe entwickelt und gepflegt.",
      "Mit AWS-Diensten für Netzwerk, Speicher, Zugriffsverwaltung, Monitoring und Sicherheit gearbeitet.",
      "Frontend-Anwendungen über größere Versionen von Framework und Komponentenbibliothek migriert.",
      "Anforderungen von Stakeholdern in funktionierende Software übersetzt und einen Junior-Entwickler betreut.",
    ],
  },
  {
    organization: "Programmierkurse für Kinder",
    role: "Programmierlehrer",
    period: "Laufend, nebenberuflich",
    summary:
      "Ich bringe Kindern in kleinen Gruppen Programmieren und Problemlösen bei. Einem Kind eine Schleife zu erklären, ist ein erstaunlich guter Test dafür, ob man sie selbst verstanden hat.",
  },
  {
    organization: "InVision AG",
    role: "Ausbildung zum Fachinformatiker für Anwendungsentwicklung",
    period: "2019 – 2022",
    summary:
      "Drei Jahre Ausbildung in professioneller Softwareentwicklung — hier habe ich gelernt, Software im Team und in einem professionellen Umfeld zu bauen.",
  },
  {
    organization: "Berufsausbildung",
    role: "Industriemechaniker",
    period: "2015 – 2018",
    summary:
      "Vor der Software habe ich gelernt, Maschinen zu bauen und instand zu halten — das prägt bis heute, wie ich über Dinge denke, die im Alltag halten müssen.",
    compact: true,
  },
];
