import type { Fact, OffersText } from "../types";

export const facts: Fact[] = [
  { value: "7 years", label: "Software engineering, incl. training" },
  { value: "Finance & insurance", label: "AWS applications in production" },
  {
    value: "TrackDemos",
    label: "My own product: web app and (soon) mobile",
    link: { label: "trackdemos.com", url: "https://trackdemos.com" },
  },
];

/**
 * Services offered on the side (sole proprietorship).
 * TODO: confirm whether the price is final (small-business VAT rule) or
 * needs "plus VAT".
 */
export const offers: OffersText = {
  title: "Consulting and services",
  intro:
    "Alongside my full-time job I take on small, clearly scoped work. The first conversation is free.",
  availability: {
    headline: "Capacity for consulting",
    detail: "First consultation free",
  },
  button: "Ask for a consultation",
  mailSubject: "Consulting request",
  items: [
    {
      title: "Custom software for businesses",
      price: "€1,000–5,000",
      text: "Small, clearly scoped B2B tools: an internal app, an automation, or an AI integration into your existing processes. Runs on cloud infrastructure I set up, or fits into your own.",
      outcome: "Working software in production, with code and documentation handed over",
      format: "Per project, fixed price after the first call",
    },
    {
      title: "Landing page or website",
      price: "from €129",
      text: "From a simple landing page (€129: you send me 3 to 10 pictures and one sentence about your company) up to a full website with a content management system (up to about €1,000). I can host and maintain it for you, or hand it over for you to host yourself.",
      outcome: "A finished website, either running on my hosting or handed over with hosting instructions",
      format: "Hosting and maintenance (GDPR and security updates) available as a monthly contract",
    },
    {
      title: "Technical advice",
      text: "Architecture, cloud, tool choices, or a stuck project: a second opinion from someone who builds this every day.",
      outcome: "A clear recommendation, summarized in writing",
      format: "By the hour, on video",
    },
  ],
  charity: {
    title: "Got something for a good cause?",
    text: "Hey, I know my way around. If you have something for a charity, contact me: when I have time, I'm open to building something like that for free.",
    button: "Tell me about your project",
    mailSubject: "Charity project",
  },
};
