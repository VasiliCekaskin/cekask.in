import type { ExperienceEntry } from "../types";

/** Newest first. */
export const experience: ExperienceEntry[] = [
  {
    organization: "Qualitypool / Qualitytech",
    role: "Software Developer",
    // TODO: once the end date is confirmed, change to e.g. "Jan 2024 – Dec 2026".
    period: "Since January 2024",
    summary:
      "Production software for the financial services industry — applications used by mortgage intermediaries and financial professionals, and the AWS infrastructure behind them.",
    responsibilities: [
      "Built a greenfield customer self-disclosure application with Next.js, AWS Fargate, DynamoDB, and Cognito.",
      "Designed and deployed AWS microservices with the CDK, including containerized services, scheduled jobs, document synchronization, and reporting.",
      "Integrated external financial services APIs and other third-party systems to automate business processes.",
      "Developed and maintained secure authentication and authorization workflows.",
      "Worked across networking, storage, access management, monitoring, and security services on AWS.",
      "Migrated frontend applications between major framework and component library versions.",
      "Turned stakeholder requirements into working software, and mentored a junior developer.",
    ],
  },
  {
    organization: "Coding classes for children",
    role: "Programming Tutor",
    period: "Ongoing, part-time",
    summary:
      "Teaching programming and problem-solving to children in small groups. Explaining a loop to a child is a surprisingly good test of whether you understand it yourself.",
  },
  {
    organization: "InVision AG",
    role: "Application Developer (Fachinformatiker für Anwendungsentwicklung), vocational training",
    period: "2019 – 2022",
    summary:
      "Three years of professional software development training — where I learned to build software as part of a team, in a professional environment.",
  },
  {
    organization: "Vocational training",
    role: "Industrial Mechanic",
    period: "2015 – 2018",
    summary:
      "Before software, I trained to build and maintain machines — which still shapes how I think about things that have to hold up in daily use.",
    compact: true,
  },
];
