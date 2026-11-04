import type { CaseStudy, ExternalLink, Project } from "../types";

/** The featured project — gets the large editorial layout. */
export const featuredProject: Project = {
  slug: "trackdemos",
  name: "TrackDemos",
  tagline: "A private Spotify for unfinished music.",
  kind: "Independent product",
  description: [
    "Most music never gets released, and a lot of it shouldn't be — yet. TrackDemos gives musicians a place to upload demos, sketches, and rough mixes, keep them organized, and share them only with the people they trust.",
    "Sharing starts private: every song has simple visibility controls, discovery happens through friends, and listening is designed for the phone in your pocket. It runs as a web app and a companion mobile app on one shared backend.",
  ],
  role: "I own it end to end: product direction, interface design, architecture, and implementation across web, mobile, backend, and infrastructure.",
  highlights: [
    "Privacy as a product feature — access rules that stay understandable to people who just want to send a song to three friends.",
    "Audio upload, storage, and playback built on S3, with subscription plans billed through Stripe.",
    "Started as an experiment in AI-assisted development and became a long-running study of how coding agents fit into a real engineering workflow — and where human judgment stays essential.",
    "Learning from real listeners: the hardest problems were usability and honest feedback, not the code.",
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
  links: [{ label: "Visit trackdemos.com", url: "https://trackdemos.com" }],
};

/** Smaller projects shown next to each other below the featured one. */
export const projects: Project[] = [
  {
    slug: "email-form-responder",
    name: "Email Form Responder",
    tagline: "Form handling and automatic replies for Framer sites.",
    kind: "Framer plugin",
    description: [
      "A plugin for Framer that takes care of what happens after someone submits a form: handling the submission and sending an automated email response, without the site owner wiring up their own backend.",
    ],
    role: "Designed and built as a small, reusable SaaS-style product.",
    stack: ["Supabase", "Email service integration", "TypeScript"],
    // TODO: add a public link (Framer Marketplace page or repository) if one exists.
    links: [],
  },
];

/**
 * Anonymized professional work. Described at the level of "what problem and
 * which kind of solution" — no internal names, endpoints, or business details.
 */
export const caseStudies: CaseStudy[] = [
  {
    title: "A greenfield customer self-disclosure application",
    summary:
      "A new application that lets customers of financial intermediaries provide their own information securely. Built from scratch, from the data model to deployment.",
    stack: ["Next.js", "AWS Fargate", "DynamoDB", "Cognito"],
  },
  {
    title: "Cloud-native services on AWS",
    summary:
      "Containerized services and scheduled jobs for document synchronization, reporting, and integrations with external financial services APIs — defined end to end as infrastructure as code.",
    stack: ["AWS CDK", "ECS / Fargate", "Docker", "S3", "CloudWatch"],
  },
  {
    title: "Secure sign-in and access control",
    summary:
      "Authentication and authorization flows for applications used by financial professionals, where getting permissions right matters more than shipping fast.",
    stack: ["Cognito", "IAM"],
  },
  {
    title: "Modernizing a production frontend",
    summary:
      "Migrating a live frontend across major framework and component library versions while keeping it running for the people who depend on it every day.",
    stack: ["Next.js", "React", "TypeScript"],
  },
];

/** Shown as a quiet "more on GitHub" line under the projects. */
export const moreWork: ExternalLink = {
  label: "Older experiments and side projects on GitHub",
  url: "https://github.com/VasiliCekaskin?tab=repositories",
};
