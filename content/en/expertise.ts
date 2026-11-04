import type { Capability } from "../types";

export const capabilities: Capability[] = [
  {
    title: "Full-stack engineering",
    description:
      "Typed, maintainable applications from the database to the interface — APIs, background jobs, integrations, and responsive UIs built from well-structured components.",
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
    title: "Cloud & infrastructure",
    description:
      "AWS infrastructure defined as code: containers, serverless functions, data stores, identity, and the monitoring and security around them.",
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
    title: "Product & architecture",
    description:
      "Deciding what to build and how it should be shaped — trade-offs, data models, access rules, and keeping a codebase easy to change a year from now.",
    tools: [
      "Software architecture",
      "Authentication & authorization",
      "Row Level Security",
      "Testing",
      "Code review",
      "Refactoring",
      "Security-conscious design",
      "Stakeholder communication",
    ],
  },
  {
    title: "AI-assisted engineering",
    description:
      "Coding agents are part of how I work every day. I use them to move faster, and I review what they produce the same way I'd review a colleague's pull request.",
    tools: ["Claude Code", "OpenAI Codex", "OpenCode", "Agent workflows"],
  },
];
