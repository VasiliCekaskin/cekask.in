import type { Content } from "../types";
import { about } from "./about";
import { contact } from "./contact";
import { experience } from "./experience";
import { capabilities } from "./expertise";
import { caseStudies, featuredProject, moreWork, projects } from "./projects";
import { site } from "./site";
import { ui } from "./ui";

export const content: Content = {
  site,
  featuredProject,
  projects,
  caseStudies,
  moreWork,
  experience,
  capabilities,
  about,
  contact,
  ui,
};
