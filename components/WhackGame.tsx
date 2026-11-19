"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { confetti } from "@/lib/confetti";
import { AdBreak } from "./AdBreak";
import styles from "./WhackGame.module.css";

type GameText = {
  label: string;
  title: string;
  intro: string;
  start: string;
  again: string;
  score: string;
  best: string;
  time: string;
  bugLabel: string;
  faceLabel: string;
  holeLabel: string;
  results: { min: number; text: string }[];
  paywall: {
    title: string;
    text: string;
    contact: string;
    contactSubject: string;
    contactThanks: string;
    ad: string;
  };
  ad: React.ComponentProps<typeof AdBreak>["text"];
};

type Props = {
  faces: { grin: string; wink: string; shock: string };
  adVideo: { src: string; poster?: string } | null;
  email: string | null;
  text: GameText;
};

type Cell = null | "face" | "bug";

const HOLES = 9;
const ROUND_SECONDS = 20;
const BEST_KEY = "whack-a-vasili-best";

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

// The best score lives in localStorage; components subscribe to changes.
const bestListeners = new Set<() => void>();
function subscribeBest(listener: () => void) {
  bestListeners.add(listener);
  return () => bestListeners.delete(listener);
}

function saveBest(score: number) {
  try {
    localStorage.setItem(BEST_KEY, String(score));
  } catch {
    // Private mode or blocked storage: the best score just isn't remembered.
  }
  bestListeners.forEach((l) => l());
}

const emptyBoard = (): Cell[] => Array(HOLES).fill(null);

/** Wall-clock milliseconds; only ever called from handlers and timers. */
const now = () => Date.now();

/**
 * Whack-a-Vasili: faces pop out of nine holes for 20 seconds. A face is +1,
 * a bug is −2. The best score is remembered in this browser only.
 *
 * The first round is free. After that, another round costs either an email
 * to Vasili (clicking the mailto link unlocks it) or watching an "ad"
 * (AdBreak, locked for two seconds).
 */
export function WhackGame({ faces, adVideo, email, text }: Props) {
  const face = faces.grin;
  const [cells, setCellsState] = useState<Cell[]>(emptyBoard);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [state, setState] = useState<"idle" | "playing" | "over">("idle");
  const [pops, setPops] = useState<{ id: number; cell: number; text: string }[]>([]);
  const best = useSyncExternalStore(subscribeBest, readBest, () => 0);
  const scoreRef = useRef(0);
  const popId = useRef(0);
  const endsAt = useRef(0);
  const [credits, setCredits] = useState(1);
  const [thanks, setThanks] = useState(false);
  const [adCount, setAdCount] = useState(0);
  const [adOpen, setAdOpen] = useState(false);
  const contactHref = email
    ? `mailto:${email}?subject=${encodeURIComponent(text.paywall.contactSubject)}`
    : null;
  // Mirror of `cells` for the timers, which run outside React renders.
  const cellsRef = useRef<Cell[]>(emptyBoard());

  const setBoard = (next: Cell[]) => {
    cellsRef.current = next;
    setCellsState(next);
  };
  const setCell = (i: number, value: Cell) => {
    const next = [...cellsRef.current];
    next[i] = value;
    setBoard(next);
  };

  useEffect(() => {
    if (state !== "playing") return;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const later = (fn: () => void, ms: number) => {
      const t = setTimeout(() => {
        timers.delete(t);
        fn();
      }, ms);
      timers.add(t);
    };
    const put = (i: number, value: Cell) => {
      const next = [...cellsRef.current];
      next[i] = value;
      cellsRef.current = next;
      setCellsState(next);
    };

    // Spawn loop: a face (or sometimes a bug) pops out of a random empty
    // hole and ducks back down after a moment.
    const spawn = () => {
      const empty = cellsRef.current.map((c, i) => (c ? -1 : i)).filter((i) => i >= 0);
      if (empty.length) {
        const i = empty[Math.floor(Math.random() * empty.length)];
        put(i, Math.random() < 0.22 ? "bug" : "face");
        later(() => put(i, null), 650 + Math.random() * 450);
      }
      later(spawn, 380 + Math.random() * 380);
    };
    spawn();

    // Countdown; ends the round at zero.
    const tick = setInterval(() => {
      const left = Math.max(0, Math.ceil((endsAt.current - now()) / 1000));
      setTimeLeft(left);
      if (left > 0) return;
      clearInterval(tick);
      timers.forEach(clearTimeout);
      timers.clear();
      cellsRef.current = emptyBoard();
      setCellsState(cellsRef.current);
      setState("over");
      const final = scoreRef.current;
      if (final > readBest()) {
        saveBest(final);
        if (final > 0) confetti(undefined, 200);
      }
    }, 250);

    return () => {
      clearInterval(tick);
      timers.forEach(clearTimeout);
    };
  }, [state]);

  const start = () => {
    if (credits < 1) return;
    setCredits((c) => c - 1);
    setThanks(false);
    endsAt.current = now() + ROUND_SECONDS * 1000;
    scoreRef.current = 0;
    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    setBoard(emptyBoard());
    setPops([]);
    setState("playing");
  };

  const hit = (i: number) => {
    const cell = cellsRef.current[i];
    if (state !== "playing" || !cell) return;
    const delta = cell === "face" ? 1 : -2;
    scoreRef.current += delta;
    setScore(scoreRef.current);
    setCell(i, null);
    const id = ++popId.current;
    setPops((p) => [...p, { id, cell: i, text: delta > 0 ? "+1" : "−2 🐛" }]);
    setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 650);
  };

  const unlockByEmail = () => {
    setCredits(1);
    setThanks(true);
  };

  const watchAd = () => {
    setAdCount((n) => n + 1);
    setAdOpen(true);
  };

  const adDone = () => {
    setAdOpen(false);
    setCredits(1);
  };

  const paywalled = state === "over" && credits < 1;

  const verdict = [...text.results].reverse().find((r) => score >= r.min)?.text;

  return (
    <section id="game" className={`container ${styles.section}`} aria-labelledby="game-title">
      <div className={styles.layout}>
        <div className={styles.copy}>
          <p className="tag">{text.label}</p>
          <h2 id="game-title" className={styles.title}>
            {text.title}
          </h2>
          <p className={styles.intro}>{text.intro}</p>

          <dl className={styles.hud}>
            <div>
              <dt>{text.score}</dt>
              <dd>{score}</dd>
            </div>
            <div>
              <dt>{text.time}</dt>
              <dd>{timeLeft}s</dd>
            </div>
            <div>
              <dt>{text.best}</dt>
              <dd>{best}</dd>
            </div>
          </dl>

          <p className={styles.verdict} aria-live="polite">
            {state === "over" ? verdict : ""}
          </p>

          {paywalled ? (
            <div className={styles.paywall}>
              <p className={styles.paywallTitle}>{text.paywall.title}</p>
              <p className={styles.paywallText}>{text.paywall.text}</p>
              <div className={styles.paywallActions}>
                {contactHref && (
                  <a href={contactHref} className="button" onClick={unlockByEmail}>
                    ✉️ {text.paywall.contact}
                  </a>
                )}
                <button type="button" className="button button-secondary" onClick={watchAd}>
                  📺 {text.paywall.ad}
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="button" onClick={start} disabled={state === "playing"}>
              {state === "over" ? text.again : text.start} <span aria-hidden="true">🔨</span>
            </button>
          )}
          {thanks && !paywalled && state !== "playing" && (
            <p className={styles.thanks}>{text.paywall.contactThanks}</p>
          )}
        </div>

        <div className={styles.board} data-state={state}>
          {cells.map((cell, i) => (
            <button
              key={i}
              type="button"
              className={styles.hole}
              onPointerDown={() => hit(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  hit(i);
                }
              }}
              disabled={state !== "playing"}
              aria-label={cell === "face" ? text.faceLabel : cell === "bug" ? text.bugLabel : text.holeLabel}
            >
              <span className={styles.critter} data-up={cell !== null}>
                {cell === "bug" ? (
                  <span className={styles.bug} aria-hidden="true">
                    🐛
                  </span>
                ) : (
                  <Image src={face} alt="" width={120} height={120} unoptimized className={styles.face} />
                )}
              </span>
              {pops
                .filter((p) => p.cell === i)
                .map((p) => (
                  <span key={p.id} className={styles.pop} aria-hidden="true">
                    {p.text}
                  </span>
                ))}
            </button>
          ))}
        </div>
      </div>

      <AdBreak
        key={adCount}
        open={adOpen}
        onDone={adDone}
        onAbort={() => setAdOpen(false)}
        faces={faces}
        video={adVideo}
        email={email}
        text={text.ad}
      />
    </section>
  );
}
