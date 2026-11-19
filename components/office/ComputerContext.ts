"use client";

import { createContext, useContext } from "react";
import type { MottoId } from "@/content/types";

/** Everything the in-game computer can open: a motto, or the whack game. */
export type AppId = MottoId | "whack";

/**
 * Set while the in-game computer is showing. Buttons that would switch the
 * whole page to a motto (GoToMotto, the roll button) open it as an app in
 * the computer instead. Null everywhere else, and when the game can't run.
 */
export const ComputerContext = createContext<{ open: (app: AppId) => void } | null>(null);

export const useComputer = () => useContext(ComputerContext);
