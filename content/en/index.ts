import type { Content } from "../types";
import { contact } from "./contact";
import { facts, offers, video } from "./offers";
import { site } from "./site";
import { ui } from "./ui";

export const content: Content = { site, facts, video, offers, contact, ui };
