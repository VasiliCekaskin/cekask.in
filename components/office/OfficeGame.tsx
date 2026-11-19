"use client";

import { useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import type { GameText, MottoId } from "@/content/types";
import { StagesContext } from "@/components/MottoStage";
import { setMotto } from "@/lib/motto";
import { ComputerContext, type AppId } from "./ComputerContext";
import type { Interactable, OfficeApi, OfficeTexts } from "./office";
import styles from "./OfficeGame.module.css";

const COARSE = "(pointer: coarse)";
const PORTRAIT = "(orientation: portrait)";
const subscribeMedia = (query: string) => (cb: () => void) => {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const subscribeCoarse = subscribeMedia(COARSE);
const subscribePortrait = subscribeMedia(PORTRAIT);

type LockableOrientation = ScreenOrientation & { lock?: (o: "landscape") => Promise<void> };

/** Phones: fullscreen and landscape where the browser allows it (Android); iOS ignores both. */
function goLandscape(el: HTMLElement | null) {
  if (!el || document.fullscreenElement) return;
  el.requestFullscreen?.({ navigationUI: "hide" })
    .then(() => (screen.orientation as LockableOrientation | undefined)?.lock?.("landscape"))
    .catch(() => {});
}

function leaveFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
}

type Phase = "loading" | "intro" | "play" | "paused" | "computer" | "door";

type Props = {
  text: GameText;
  /** What the in-game monitor shows. */
  screen: { lines: string[]; stats: { label: string; value: number }[]; footer: string };
  portraitSrc: string;
  mailto: string | null;
  contactLabel: string;
  /** Start screen content (headline, intro, availability), rendered on the server. */
  intro: ReactNode;
  /** The computer's contents (stats and motto apps), rendered on the server. */
  computer: ReactNode;
  /** The whack-a-Vasili game, as an app on the computer. */
  whack: ReactNode;
  /** Window titles for every app. */
  appNames: Record<AppId, string>;
};

/**
 * The home page as a small first-person game: step into Vasili's office,
 * walk to the computer, open a motto from there. The 3D scene loads after
 * the page; "skip" opens the computer straight away (keyboard, screen
 * readers, no WebGL).
 */
export function OfficeGame({ text, screen, portraitSrc, mailto, contactLabel, intro, computer, whack, appNames }: Props) {
  const stages = useContext(StagesContext);
  const [app, setApp] = useState<AppId | null>(null);
  const appBody = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<OfficeApi | null>(null);
  const [phase, setPhaseState] = useState<Phase>("loading");
  const phaseRef = useRef<Phase>("loading");
  const [prompt, setPrompt] = useState<Interactable | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const touch = useSyncExternalStore(subscribeCoarse, () => window.matchMedia(COARSE).matches, () => false);
  const portrait = useSyncExternalStore(subscribePortrait, () => window.matchMedia(PORTRAIT).matches, () => false);
  const section = useRef<HTMLElement>(null);
  const [failed, setFailed] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setPhase = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
    if (p === "intro") leaveFullscreen();
  }, []);

  const say = useCallback((lines: string[]) => {
    const line = lines[Math.floor(Math.random() * lines.length)];
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text: line });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  // Keep the latest handlers for the scene callbacks without re-creating it.
  const handlers = useRef({ say, setPhase, text });
  useEffect(() => {
    handlers.current = { say, setPhase, text };
  });

  useEffect(() => {
    let cancelled = false;
    const texts: OfficeTexts = {
      board: text.board,
      plate: text.plate,
      os: text.os,
      screenHint: text.screenHint,
      statsLines: screen.lines,
      stats: screen.stats,
      footer: screen.footer,
    };

    Promise.all([import("three"), import("./office")])
      .then(([THREE, { createOffice }]) => {
        if (cancelled || !host.current) return;
        api.current = createOffice(THREE, host.current, texts, portraitSrc, {
          onPrompt: setPrompt,
          onLockLost: () => {
            if (phaseRef.current === "play") handlers.current.setPhase("paused");
          },
          onInteract: (target) => {
            const { say, setPhase, text } = handlers.current;
            if (target === "computer") setPhase("computer");
            else if (target === "door") setPhase("door");
            else if (target === "whiteboard") say(text.whiteboard);
            else say(text[target]);
          },
        });
        if (phaseRef.current === "loading") handlers.current.setPhase("intro");
      })
      .catch(() => {
        setFailed(true);
        if (phaseRef.current === "loading") handlers.current.setPhase("intro");
      });

    // Leaving fullscreen (back gesture) pauses, like Esc on a desktop.
    const onFullscreen = () => {
      if (!document.fullscreenElement && phaseRef.current === "play") handlers.current.setPhase("paused");
    };
    document.addEventListener("fullscreenchange", onFullscreen);

    return () => {
      cancelled = true;
      document.removeEventListener("fullscreenchange", onFullscreen);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      api.current?.dispose();
      api.current = null;
      leaveFullscreen();
    };
    // The scene is built once; texts come from the server and don't change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const play = () => {
    if (failed) {
      setPhase("computer");
      return;
    }
    setPhase("play");
    api.current?.lock();
    if (touch) goLandscape(section.current);
  };

  const back = () => {
    setApp(null);
    if (failed) setPhase("intro");
    else play();
  };

  // Esc closes the computer or the door dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (phaseRef.current === "computer" && app) setApp(null);
      else if (phaseRef.current === "computer" || phaseRef.current === "door") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // An open motto app themes the page (html[data-motto]), like the full page
  // would; the whack game uses the vibecoded colors. Reset when it closes.
  useEffect(() => {
    if (!app) return;
    document.documentElement.dataset.motto = app === "whack" ? "vibe" : app;
    appBody.current?.scrollTo({ top: 0 });
    return () => {
      delete document.documentElement.dataset.motto;
    };
  }, [app]);

  // Inside the game, apps open in the computer. Without the game (no WebGL)
  // the context is left out, so the buttons switch the whole page as before.
  const computerApi = useMemo(() => ({ open: (id: AppId) => setApp(id) }), []);

  const openAsPage = (id: MottoId) => {
    setApp(null);
    setMotto(id);
    window.scrollTo({ top: 0 });
  };

  // On phones the game takes the whole screen once you step in, and only
  // runs in landscape; upright, it waits behind a "please rotate" card.
  const immersive = touch && phase !== "loading" && phase !== "intro";
  // The computer and dialogs are plain HTML and work upright too.
  const needRotate = immersive && portrait && (phase === "play" || phase === "paused");

  // Movement and input only while actually playing.
  useEffect(() => {
    api.current?.setActive(phase === "play" && !needRotate);
  }, [phase, needRotate]);

  const showHud = phase === "play" && !needRotate;

  return (
    <section
      ref={section}
      className={styles.game}
      aria-labelledby="intro-title"
      data-phase={phase}
      data-immersive={immersive}
    >
      <div ref={host} className={styles.canvas} />

      {showHud && (
        <>
          <span className={styles.crosshair} data-active={prompt !== null} aria-hidden="true" />
          {prompt && (
            <p className={styles.prompt}>
              {!touch && <kbd>{text.use}</kbd>} {text.prompts[prompt]}
            </p>
          )}
          {touch && prompt && (
            <button type="button" className={styles.useButton} onClick={() => api.current?.interact()}>
              {text.prompts[prompt]}
            </button>
          )}
          <p className={styles.keys} aria-hidden="true">
            {touch ? text.controlsTouch : text.controlsKeys}
          </p>
          {touch && (
            <button type="button" className={styles.pause} onClick={() => setPhase("paused")} aria-label={text.pause}>
              ❚❚
            </button>
          )}
        </>
      )}

      {needRotate && (
        <div className={styles.overlay}>
          <div className={`${styles.card} ${styles.small} ${styles.rotate}`}>
            <span className={styles.phone} aria-hidden="true">
              📱
            </span>
            <p className={styles.dialogTitle}>{text.rotate}</p>
            <p className={styles.controls}>{text.rotateHint}</p>
            <button type="button" className={styles.skip} onClick={() => setPhase("computer")}>
              {text.skip}
            </button>
          </div>
        </div>
      )}

      {toast && phase === "play" && (
        <p key={toast.id} className={styles.toast} role="status">
          {toast.text}
        </p>
      )}

      {(phase === "loading" || phase === "intro") && (
        <div className={styles.overlay}>
          <div className={styles.card}>
            <p className={styles.place}>🏢 {text.place}</p>
            {intro}
            <div className={styles.startRow}>
              <button type="button" className={styles.enter} onClick={play} disabled={phase === "loading"}>
                {phase === "loading" ? text.loading : `${text.enter} →`}
              </button>
              <button type="button" className={styles.skip} onClick={() => setPhase("computer")}>
                {text.skip}
              </button>
            </div>
            {!failed && <p className={styles.controls}>{touch ? text.controlsTouch : text.controlsKeys}</p>}
          </div>
        </div>
      )}

      {phase === "paused" && !needRotate && (
        <div className={styles.overlay}>
          <div className={`${styles.card} ${styles.small}`}>
            <p className={styles.dialogTitle}>{text.paused}</p>
            <div className={styles.startRow}>
              <button type="button" className={styles.enter} onClick={play} autoFocus>
                {text.resume} →
              </button>
              <button type="button" className={styles.skip} onClick={() => setPhase("computer")}>
                {text.skip}
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === "door" && (
        <div className={styles.overlay}>
          <div className={`${styles.card} ${styles.small}`} role="dialog" aria-modal="true" aria-label={text.prompts.door}>
            <p className={styles.dialogTitle}>🚪 {text.door}</p>
            <div className={styles.startRow}>
              {mailto && (
                <a href={mailto} className={styles.enter}>
                  {contactLabel}
                </a>
              )}
              <button type="button" className={styles.skip} onClick={back} autoFocus>
                {text.exit}
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === "computer" && (
        <div className={styles.overlay} data-computer>
          <div className={styles.monitor} role="dialog" aria-modal="true" aria-label={text.os}>
            <div className={styles.titlebar}>
              <span className={styles.lights} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              {app ? (
                <>
                  <button type="button" className={styles.tool} onClick={() => setApp(null)}>
                    ← {text.apps}
                  </button>
                  <p className={styles.appTitle}>{appNames[app]}</p>
                  {app !== "whack" && (
                    <button type="button" className={styles.tool} onClick={() => openAsPage(app)}>
                      {text.openPage} ↗
                    </button>
                  )}
                </>
              ) : (
                <p>{text.os}</p>
              )}
              <button type="button" className={styles.close} onClick={back} autoFocus>
                {failed ? text.close : text.exit} ✕
              </button>
            </div>
            {app ? (
              <div ref={appBody} className={styles.appBody} data-app={app}>
                {app === "whack" ? <div className={styles.whack}>{whack}</div> : stages?.[app]}
              </div>
            ) : (
              <div className={styles.desktop}>
                {failed ? computer : <ComputerContext.Provider value={computerApi}>{computer}</ComputerContext.Provider>}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
