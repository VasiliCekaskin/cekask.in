"use client";

import type { ReactNode } from "react";
import { confetti } from "@/lib/confetti";

/** A normal link that also throws confetti from where it was clicked. */
export function ConfettiLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        confetti({ x: r.left + r.width / 2, y: r.top + r.height / 2 }, 160);
      }}
    >
      {children}
    </a>
  );
}
