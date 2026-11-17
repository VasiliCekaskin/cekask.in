import { profile } from "@/content";

/** Email link with a prefilled subject, or null when no email is configured. */
export function mailHref(subject: string): string | null {
  if (!profile.email) return null;
  return `mailto:${profile.email}?subject=${encodeURIComponent(subject)}`;
}
