import type { Capability } from "../types";

export const capabilities: Capability[] = [
  {
    title: "Full-Stack-Entwicklung",
    description:
      "Typisierte, wartbare Anwendungen von der Datenbank bis zur Oberfläche — APIs, Hintergrundjobs, Integrationen und responsive Interfaces aus sauber strukturierten Komponenten.",
    tools: [
      "TypeScript",
      "React",
      "Next.js (App Router)",
      "Node.js",
      "Fastify",
      "Ruby",
      "REST",
      "GraphQL",
      "PostgreSQL",
      "Supabase",
      "Mantine",
      "Chakra UI",
      "Stripe",
    ],
  },
  {
    title: "Cloud & Infrastruktur",
    description:
      "AWS-Infrastruktur als Code: Container, Serverless-Funktionen, Datenspeicher, Identitäten sowie das Monitoring und die Sicherheit drumherum.",
    tools: [
      "AWS CDK",
      "ECS / Fargate",
      "Lambda",
      "API Gateway",
      "AppSync",
      "Cognito",
      "DynamoDB",
      "RDS",
      "S3",
      "CloudFront",
      "Route 53",
      "IAM",
      "KMS",
      "WAF",
      "CloudWatch",
      "Docker",
      "GitHub Actions",
    ],
  },
  {
    title: "Produkt & Architektur",
    description:
      "Entscheiden, was gebaut wird und wie — Abwägungen, Datenmodelle, Zugriffsregeln und eine Codebasis, die sich auch in einem Jahr noch leicht ändern lässt.",
    tools: [
      "Softwarearchitektur",
      "Authentifizierung & Autorisierung",
      "Row Level Security",
      "Testing",
      "Code-Reviews",
      "Refactoring",
      "Sicherheitsbewusstes Design",
      "Kommunikation mit Stakeholdern",
    ],
  },
  {
    title: "KI-gestützte Entwicklung",
    description:
      "Coding-Agents gehören zu meinem Arbeitsalltag. Ich nutze sie, um schneller voranzukommen, und prüfe ihre Ergebnisse so, wie ich den Pull Request einer Kollegin oder eines Kollegen prüfen würde.",
    tools: ["Claude Code", "OpenAI Codex", "OpenCode", "Agent-Workflows"],
  },
];
