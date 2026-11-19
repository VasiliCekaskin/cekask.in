"use client";

import { useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import type { GameText, MottoId, OfficeEgg } from "@/content/types";
import { confetti } from "@/lib/confetti";
import { sounds } from "./sounds";
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

type Phase = "loading" | "intro" | "play" | "paused" | "computer" | "door" | "talk";

const EGGS_KEY = "office-eggs";

function readEggs(): OfficeEgg[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(EGGS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

type Props = {
  text: GameText;
  locale: string;
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
export function OfficeGame({ text, locale, screen, portraitSrc, mailto, contactLabel, intro, computer, whack, appNames }: Props) {
  const stages = useContext(StagesContext);
  const [app, setApp] = useState<AppId | null>(null);
  const appBody = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<OfficeApi | null>(null);
  const [phase, setPhaseState] = useState<Phase>("loading");
  const phaseRef = useRef<Phase>("loading");
  const [prompt, setPrompt] = useState<Interactable | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string; sub?: string } | null>(null);
  // Easter eggs found so far (remembered in this browser) and coffees had.
  const [eggs, setEggs] = useState<OfficeEgg[]>(readEggs);
  const eggsRef = useRef(eggs);
  const coffees = useRef(0);
  // The shower conversation: which lines, how far along, how many visits.
  const [talk, setTalk] = useState<{ lines: string[]; at: number } | null>(null);
  const visits = useRef(0);
  const heardShower = useRef(false);
  const inBath = useRef(false);
  // The motto the office currently wears, and one to announce when back in the office.
  const lookRef = useRef<AppId | null>(null);
  const pendingLook = useRef<AppId | null>(null);
  const totalEggs = Object.keys(text.eggs).length;
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

  const show = useCallback((line: string, sub?: string, ms = 3800) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text: line, sub });
    toastTimer.current = setTimeout(() => setToast(null), ms);
  }, []);

  /** Using an easter egg: its line, a sound, and the tally when it's a new find. */
  const triggerEgg = useCallback(
    (egg: OfficeEgg, state?: { lightsOn?: boolean }) => {
      const lines = text.eggs[egg];
      let line = egg === "light" ? lines[state?.lightsOn ? 1 : 0] : lines[Math.floor(Math.random() * lines.length)];

      if (egg === "coffee") {
        coffees.current += 1;
        if (coffees.current === 5) {
          api.current?.setBoost(1.6);
          line = text.coffeeRush;
        }
      }
      ({ duck: sounds.quack, guitar: sounds.guitar, cat: sounds.purr, rack: sounds.alarm, light: sounds.click } as Partial<
        Record<OfficeEgg, () => void>
      >)[egg]?.();

      if (eggsRef.current.includes(egg)) {
        show(line);
        return;
      }
      // Merge with what's stored, so finds in another tab aren't lost.
      const next = [...new Set([...readEggs(), ...eggsRef.current, egg])];
      eggsRef.current = next;
      setEggs(next);
      try {
        localStorage.setItem(EGGS_KEY, JSON.stringify(next));
      } catch {}
      sounds.found();
      show(line, text.eggFound.replace("{n}", String(next.length)).replace("{total}", String(totalEggs)));
      if (next.length === totalEggs) {
        setTimeout(() => {
          confetti(undefined, 320);
          show(text.allFound, undefined, 6000);
        }, 2600);
      }
    },
    [show, text, totalEggs],
  );

  // Keep the latest handlers for the scene callbacks without re-creating it.
  const startTalk = useCallback(() => {
    visits.current += 1;
    const lines = visits.current === 1 ? text.shower.lines : [text.shower.again[(visits.current - 2) % text.shower.again.length]];
    setTalk({ lines, at: 0 });
    setPhase("talk");
    api.current?.setTalking(true);
  }, [setPhase, text]);

  const handlers = useRef({ triggerEgg, setPhase, startTalk, show });
  useEffect(() => {
    handlers.current = { triggerEgg, setPhase, startTalk, show };
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
      glow: text.glow,
      calendarNote: text.calendarNote,
      note: text.note,
      locale,
    };

    Promise.all([import("three"), import("./office")])
      .then(([THREE, { createOffice }]) => {
        if (cancelled || !host.current) return;
        api.current = createOffice(THREE, host.current, texts, portraitSrc, {
          onPrompt: setPrompt,
          onLockLost: () => {
            if (phaseRef.current === "play") handlers.current.setPhase("paused");
          },
          onInteract: (target, state) => {
            const { triggerEgg, setPhase, startTalk, show } = handlers.current;
            if (target === "computer") setPhase("computer");
            else if (target === "door") setPhase("door");
            else if (target === "bathroom") {
              if (state?.open && !heardShower.current) {
                heardShower.current = true;
                show(text.shower.heard);
              }
            } else if (target === "shower") startTalk();
            else triggerEgg(target, state);
          },
          onRoom: (room) => {
            inBath.current = room === "bathroom";
            sounds.shower(inBath.current && phaseRef.current === "play");
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
      sounds.shower(false);
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
    // The game fills the screen under the header; make sure all of it is in view.
    window.scrollTo({ top: 0 });
    api.current?.lock();
    if (touch) goLandscape(section.current);
  };

  const back = () => {
    setApp(null);
    if (failed) setPhase("intro");
    else {
      play();
      if (pendingLook.current) {
        show(text.themed.replace("{name}", appNames[pendingLook.current].replace(/^✨\s*/, "")));
        pendingLook.current = null;
      }
    }
  };

  const endTalk = () => {
    setTalk(null);
    api.current?.setTalking(false);
    play();
    triggerEgg("shower");
  };

  // Esc closes the computer or the door dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (phaseRef.current === "talk") endTalk();
      else if (phaseRef.current === "computer" && app) setApp(null);
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
  // Opening a motto also restyles the office (see lookRef); the toast says so on return.
  const openApp = useCallback((id: AppId) => {
    setApp(id);
    api.current?.setTheme(id === "whack" ? "vibe" : id);
    if (id !== lookRef.current) pendingLook.current = id;
    lookRef.current = id;
  }, []);
  const computerApi = useMemo(() => ({ open: openApp }), [openApp]);

  const openAsPage = (id: MottoId) => {
    setApp(null);
    setMotto(id);
    window.scrollTo({ top: 0 });
  };

  // The shower only runs (audibly) while playing in the bathroom.
  useEffect(() => {
    sounds.shower(inBath.current && (phase === "play" || phase === "talk"));
  }, [phase]);

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
          {toast.sub && <span className={styles.toastSub}>{toast.sub}</span>}
        </p>
      )}

      {showHud && (
        <p className={styles.eggs} aria-label={`${text.eggsLabel}: ${eggs.length}/${totalEggs}`}>
          🥚 {eggs.length}/{totalEggs}
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

      {phase === "talk" && talk && (
        <div className={styles.talkWrap}>
          <div className={styles.talk} role="dialog" aria-modal="true" aria-label={text.shower.name}>
            <span className={styles.talkFace} aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={portraitSrc} alt="" />
            </span>
            <div className={styles.talkBody}>
              <p className={styles.talkName}>🚿 {text.shower.name}</p>
              <p key={talk.at} className={styles.talkLine}>
                {talk.lines[talk.at]}
              </p>
              <div className={styles.startRow}>
                {talk.at < talk.lines.length - 1 ? (
                  <button type="button" className={styles.enter} onClick={() => setTalk({ ...talk, at: talk.at + 1 })} autoFocus>
                    {text.shower.next} →
                  </button>
                ) : (
                  <>
                    {mailto && (
                      <a href={mailto} className={styles.enter}>
                        {text.shower.invite}
                      </a>
                    )}
                    <button type="button" className={styles.skip} onClick={endTalk} autoFocus>
                      {text.shower.leave}
                    </button>
                  </>
                )}
              </div>
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
