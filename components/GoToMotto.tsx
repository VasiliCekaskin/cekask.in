"use client";

import type { ReactNode } from "react";
import type { MottoId } from "@/content/types";
import { setMotto } from "@/lib/motto";
import { useComputer } from "./office/ComputerContext";

/** A button that switches the home page to another motto. */
export function GoToMotto({ motto, className, children }: { motto: MottoId; className?: string; children: ReactNode }) {
  const computer = useComputer();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        // Inside the game's computer: open it as an app there.
        if (computer) return computer.open(motto);
        setMotto(motto);
        window.scrollTo({ top: 0 });
      }}
    >
      {children}
    </button>
  );
}
