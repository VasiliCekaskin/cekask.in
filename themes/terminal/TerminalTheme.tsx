"use client";

import { useEffect, useRef, useState } from "react";
import type { Offer, ProText, TerminalText } from "@/content/types";
import { spinMotto } from "@/lib/motto";
import styles from "./TerminalTheme.module.css";

type Line = { kind: "in" | "out" | "head" | "err"; text: string; href?: string };

type Props = {
  /** Page heading for screen readers (the terminal has no visible one). */
  title: string;
  text: TerminalText;
  cv: Pick<ProText, "skills" | "experience">;
  offers: Offer[];
  onRequest: string;
  charity: string;
  email: string | null;
  mailSubject: string;
  links: { label: string; url: string }[];
};

/** "Terminal": the portfolio as an interactive shell. */
export function TerminalTheme({ title, text, cv, offers, onRequest, charity, email, mailSubject, links }: Props) {
  const [lines, setLines] = useState<Line[]>(() => [
    ...text.boot.map((t) => ({ kind: "out" as const, text: t })),
    { kind: "in", text: "whoami" },
    ...text.whoami.map((t) => ({ kind: "out" as const, text: t })),
  ]);
  const [input, setInput] = useState("");
  const history = useRef<string[]>([]);
  const historyPos = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const mailto = email ? `mailto:${email}?subject=${encodeURIComponent(mailSubject)}` : null;

  useEffect(() => {
    // Scroll inside the terminal only, never the page.
    const el = screenRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const out = (...t: string[]): Line[] => t.map((x) => ({ kind: "out", text: x }));

  const commands: Record<string, () => Line[]> = {
    help: () => text.help.map((h) => ({ kind: "out", text: `${h.cmd.padEnd(12)} ${h.desc}` })),
    whoami: () => out(...text.whoami),
    ls: () => out(text.ls),
    skills: () => cv.skills.flatMap((g) => [{ kind: "head", text: `# ${g.group}` }, ...out(`  ${g.items.join(", ")}`)]),
    experience: () =>
      cv.experience.flatMap((e) => [
        { kind: "head", text: `[${e.period}] ${e.title}` },
        ...out(`  ${e.place}`, ...e.points.map((p) => `  - ${p}`)),
      ]),
    offers: () => [
      { kind: "head", text: text.offersHead },
      ...offers.flatMap((o, i) => out(`${i + 1}. ${o.title} .... ${o.price ?? onRequest}`, `   ${o.text}`)),
    ],
    charity: () => out(charity),
    contact: () => [
      { kind: "head", text: text.contactHead },
      ...(email && mailto ? [{ kind: "out" as const, text: email, href: mailto }] : []),
      ...links.map((l) => ({ kind: "out" as const, text: `${l.label}: ${l.url}`, href: l.url })),
    ],
    hire: () => {
      if (mailto) setTimeout(() => (window.location.href = mailto), 600);
      return out(text.hire);
    },
    game: () => out(text.game),
    spin: () => {
      setTimeout(spinMotto, 500);
      return out(text.spin);
    },
  };
  // Aliases in both languages.
  const aliases: Record<string, string> = {
    about: "whoami",
    "cat about.txt": "whoami",
    "cat ueber-mich.txt": "whoami",
    "cat skills.txt": "skills",
    "cat experience.txt": "experience",
    "cat werdegang.txt": "experience",
    werdegang: "experience",
    "ls offers": "offers",
    "ls angebote": "offers",
    angebote: "offers",
    "cat charity.txt": "charity",
    "cat contact.txt": "contact",
    "cat kontakt.txt": "contact",
    kontakt: "contact",
    "hire vasili": "hire",
    "hau-den-vasili": "game",
  };

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    history.current.push(raw);
    historyPos.current = history.current.length;
    if (cmd === "clear") {
      setLines([]);
      return;
    }
    const name = aliases[cmd] ?? cmd;
    let result: Line[];
    if (commands[name]) result = commands[name]();
    else if (cmd.startsWith("sudo")) result = out(text.sudo);
    else result = [{ kind: "err", text: text.notFound.replace("{cmd}", cmd) }];
    setLines((prev) => [...prev, { kind: "in", text: raw }, ...result]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(input);
      setInput("");
    } else if (e.key === "ArrowUp" && history.current.length) {
      e.preventDefault();
      historyPos.current = Math.max(0, historyPos.current - 1);
      setInput(history.current[historyPos.current] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      historyPos.current = Math.min(history.current.length, historyPos.current + 1);
      setInput(history.current[historyPos.current] ?? "");
    }
  };

  const prompt = `${text.user}:~$`;

  return (
    <section className={`container ${styles.wrap}`} aria-labelledby="term-title">
      <h1 id="term-title" className="visually-hidden">
        {title}
      </h1>
      <div className={styles.window} onClick={() => inputRef.current?.focus()}>
        <div className={styles.bar} aria-hidden="true">
          <span />
          <span />
          <span />
          <p>{prompt.replace(":~$", "")} — zsh</p>
        </div>
        <div className={styles.screen} ref={screenRef} role="log" aria-live="polite">
          {lines.map((l, i) => (
            <p key={i} className={styles[l.kind]}>
              {l.kind === "in" && <span className={styles.prompt}>{prompt} </span>}
              {l.href ? (
                <a href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                  {l.text}
                </a>
              ) : (
                l.text
              )}
            </p>
          ))}
          <div className={styles.inputRow}>
            <label htmlFor="term-input" className={styles.prompt}>
              {prompt}
            </label>
            <input
              id="term-input"
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label={text.inputLabel}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      <nav className={styles.chips} aria-label={text.chipsLabel}>
        {text.help
          .filter((h) => h.cmd !== "clear")
          .map((h) => (
            <button key={h.cmd} type="button" onClick={() => run(h.cmd)}>
              {h.cmd}
            </button>
          ))}
      </nav>
    </section>
  );
}
