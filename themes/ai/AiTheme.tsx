"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { AiText } from "@/content/types";
import styles from "./AiTheme.module.css";

type Message =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "bot"; text: string; shown: number; thinking: boolean };

type Props = {
  /** Page heading for screen readers (the chat has no visible one). */
  title: string;
  text: AiText;
  email: string | null;
  mailto: string | null;
  links: { label: string; url: string }[];
};

/** Splits a question into lower-case words (letters and digits, any script). */
function words(question: string) {
  return question.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

/**
 * Very simple "AI": the first rule with a matching word wins. Short rule
 * words (under 4 letters, like "hi" or "aws") must match a whole word;
 * longer ones also match as a prefix ("gehalt" matches "gehaltsvorstellung").
 */
function pickReply(question: string, text: AiText, last: string | null) {
  const tokens = words(question);
  const rule = text.rules.find((r) =>
    r.words.some((w) => tokens.some((t) => t === w || (w.length >= 4 && t.startsWith(w)))),
  );
  const pool = rule?.replies ?? text.fallback;
  const fresh = pool.filter((r) => r !== last);
  const choices = fresh.length ? fresh : pool;
  return choices[Math.floor(Math.random() * choices.length)];
}

/** "AI assistant": a chatbot that agrees, enthusiastically, that you should hire Vasili. */
export function AiTheme({ title, text, email, mailto, links }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const nextId = useRef(0);
  const lastReply = useRef<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const busy = messages.some((m) => m.role === "bot" && (m.thinking || m.shown < m.text.length));

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    // Keep the newest message in view, inside the chat only.
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const ask = (question: string, refocus = false) => {
    const q = question.trim();
    if (!q || busy) return;

    const answer = pickReply(q, text, lastReply.current);
    lastReply.current = answer;
    const botId = nextId.current + 1;
    nextId.current += 2;
    const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setMessages((m) => [
      ...m,
      { id: botId - 1, role: "user", text: q },
      { id: botId, role: "bot", text: answer, shown: instant ? answer.length : 0, thinking: !instant },
    ]);
    setInput("");
    // The message box moves from the welcome screen to the bottom after the
    // first question; keep typing there. (Not for suggestion taps, so phones
    // don't pop up the keyboard.)
    if (refocus) requestAnimationFrame(() => inputRef.current?.focus());
    if (instant) return;

    // "Think" for a moment, then stream the answer a few characters at a time.
    const update = (patch: { thinking: boolean; shown: number }) =>
      setMessages((all) => all.map((m) => (m.id === botId && m.role === "bot" ? { ...m, ...patch } : m)));

    later(() => {
      let shown = 0;
      const tick = () => {
        shown = Math.min(answer.length, shown + 3);
        update({ thinking: false, shown });
        if (shown < answer.length) later(tick, 18);
      };
      tick();
    }, 650 + Math.random() * 500);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    ask(input, true);
  };

  const newChat = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setMessages([]);
    setInput("");
    inputRef.current?.focus();
  };

  const empty = messages.length === 0;

  const composer = (
    <form className={styles.composer} onSubmit={onSubmit}>
      <label htmlFor="ai-input" className="visually-hidden">
        {text.inputLabel}
      </label>
      <textarea
        id="ai-input"
        ref={inputRef}
        className={styles.input}
        rows={1}
        value={input}
        placeholder={text.placeholder}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            ask(input, true);
          }
        }}
      />
      <button type="submit" className={styles.send} disabled={!input.trim() || busy} aria-label={text.send}>
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M10 15.5V4.5M5 9.5l5-5 5 5" />
        </svg>
      </button>
    </form>
  );

  return (
    <section className={styles.app} aria-labelledby="ai-title">
      <h1 id="ai-title" className="visually-hidden">
        {title}
      </h1>

      <div className={styles.bar}>
        <button type="button" className={styles.iconButton} onClick={newChat} aria-label={text.newChat} title={text.newChat}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M11.5 3.5H5a1.5 1.5 0 0 0-1.5 1.5v10A1.5 1.5 0 0 0 5 16.5h10a1.5 1.5 0 0 0 1.5-1.5V8.5" />
            <path d="M14.8 2.7l2.5 2.5-6.6 6.6-3.2.7.7-3.2z" />
          </svg>
        </button>
        <p className={styles.model} title={text.modelNote}>
          {text.model} <span aria-hidden="true">⌄</span>
          <span className="visually-hidden"> — {text.modelNote}</span>
        </p>
      </div>

      <div ref={scrollRef} className={styles.scroll}>
        {empty ? (
          <div className={styles.welcome}>
            <span className={styles.logo} aria-hidden="true">
              ✦
            </span>
            <h2 className={styles.greeting}>{text.greeting}</h2>
            {composer}
            <ul role="list" className={styles.suggestions}>
              {text.suggestions.map((s) => (
                <li key={s}>
                  <button type="button" className={styles.suggestion} onClick={() => ask(s)}>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ol className={styles.thread} aria-live="polite">
            {messages.map((m) =>
              m.role === "user" ? (
                <li key={m.id} className={styles.user}>
                  {m.text}
                </li>
              ) : (
                <li key={m.id} className={styles.bot}>
                  <span className={styles.avatar} aria-hidden="true">
                    ✦
                  </span>
                  <div className={styles.botBody}>
                    <span className="visually-hidden">{text.bot}: </span>
                    {m.thinking ? (
                      <p className={styles.thinking}>{text.thinking}</p>
                    ) : (
                      <p className={styles.answer}>
                        {m.text.slice(0, m.shown)}
                        {m.shown < m.text.length && <span className={styles.caret} aria-hidden="true" />}
                      </p>
                    )}
                    {!m.thinking && m.shown >= m.text.length && (
                      <div className={styles.contact}>
                        <p className={styles.contactIntro}>{text.contactIntro}</p>
                        <ul role="list" className={styles.contactList}>
                          {email && (
                            <li>
                              <span aria-hidden="true">📧</span> <a href={`mailto:${email}`}>{email}</a>
                            </li>
                          )}
                          {links.map((l) => (
                            <li key={l.label}>
                              <span aria-hidden="true">🔗</span>{" "}
                              <a href={l.url} target="_blank" rel="noopener noreferrer">
                                {l.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                        {mailto && (
                          <a href={mailto} className={styles.cta}>
                            {text.mailButton}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ),
            )}
          </ol>
        )}
      </div>

      {!empty && <div className={styles.dock}>{composer}</div>}
      <p className={styles.disclaimer}>{text.disclaimer}</p>
    </section>
  );
}
