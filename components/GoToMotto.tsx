"use client";

import type { ReactNode } from "react";
import type { MottoId } from "@/content/types";
import { setMotto } from "@/lib/motto";

/** A button that switches the home page to another motto. */
export function GoToMotto({ motto, className, children }: { motto: MottoId; className?: string; children: ReactNode }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        setMotto(motto);
        window.scrollTo({ top: 0 });
      }}
    >
      {children}
    </button>
  );
}
