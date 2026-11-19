import type { Content } from "../types";
import { contact } from "./contact";
import { facts, offers } from "./offers";
import { fun } from "./fun";
import { mottos } from "./mottos";
import { site } from "./site";
import { ui } from "./ui";

export const content: Content = { site, facts, fun, offers, contact, ui, mottos };
