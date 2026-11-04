import type { ExternalLink } from "@/content/types";
import { ArrowUpRightIcon } from "./icons";

/** Renders only links that have a URL, so placeholders never show up. */
type Props = {
  links: ExternalLink[];
  /** Screen reader suffix, e.g. " (opens in a new tab)". */
  newTab: string;
  className?: string;
};

export function ProjectLinks({ links, newTab, className }: Props) {
  const available = links.filter((link) => link.url);
  if (available.length === 0) return null;

  return (
    <ul role="list" className={className}>
      {available.map((link) => (
        <li key={link.url}>
          <a href={link.url!} className="text-link" target="_blank" rel="noopener noreferrer">
            {link.label}
            <ArrowUpRightIcon />
            <span className="visually-hidden">{newTab}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
