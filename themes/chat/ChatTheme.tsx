"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ChatText, Offer } from "@/content/types";
import styles from "./ChatTheme.module.css";

type Msg = { from: "me" | "you"; text: string; href?: string };
type Question = ChatText["questions"][number];

type Props = {
  name: string;
  avatar: string;
  text: ChatText;
  offers: Offer[];
  onRequest: string;
  charity: string;
  email: string | null;
  contactHref: string | null;
  hireHref: string | null;
};

/** "Chat": the portfolio as a messenger conversation with quick replies. */
export function ChatTheme({ name, avatar, text, offers, onRequest, charity, email, contactHref, hireHref }: Props) {
  const [msgs, setMsgs] = useState<Msg[]>(() => text.greeting.map((t) => ({ from: "me", text: t })));
  const [asked, setAsked] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, typing]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const answer = (q: Question): Msg[] => {
    const base: Msg[] = q.a.map((t) => ({ from: "me", text: t }));
    switch (q.id) {
      case "offers":
        return [...base, ...offers.map((o) => ({ from: "me" as const, text: `${o.title}: ${o.price ?? onRequest}` }))];
      case "charity":
        return [{ from: "me", text: charity }];
      case "contact":
        return email && contactHref ? [...base, { from: "me", text: email, href: contactHref }] : base;
      case "hire":
        return email && hireHref ? [...base, { from: "me", text: `✉️ ${email}`, href: hireHref }] : base;
      default:
        return base;
    }
  };

  const ask = (q: Question) => {
    if (typing) return;
    setAsked((a) => [...a, q.id]);
    setMsgs((m) => [...m, { from: "you", text: q.q }]);
    setTyping(true);
    const replies = answer(q);
    replies.forEach((r, i) => {
      timers.current.push(
        setTimeout(() => {
          setMsgs((m) => [...m, r]);
          if (i === replies.length - 1) setTyping(false);
        }, 700 + i * 650),
      );
    });
  };

  const open = text.questions.filter((q) => !asked.includes(q.id));

  return (
    <section className={`container ${styles.wrap}`} aria-labelledby="chat-name">
      <div className={styles.phone}>
        <header className={styles.top}>
          <Image src={avatar} alt="" width={48} height={48} unoptimized className={styles.avatar} />
          <div>
            <h1 id="chat-name" className={styles.name}>
              {name}
            </h1>
            <p className={styles.status}>{typing ? text.typing : text.status}</p>
          </div>
        </header>

        <div className={styles.thread} ref={scrollRef} role="log" aria-live="polite">
          {msgs.map((m, i) => (
            <p key={i} className={`${styles.bubble} ${m.from === "me" ? styles.me : styles.you}`}>
              {m.href ? <a href={m.href}>{m.text}</a> : m.text}
            </p>
          ))}
          {typing && (
            <p className={`${styles.bubble} ${styles.me} ${styles.dots}`} aria-label={text.typing}>
              <span />
              <span />
              <span />
            </p>
          )}
        </div>

        <nav className={styles.replies} aria-label={text.repliesLabel}>
          {open.map((q) => (
            <button key={q.id} type="button" onClick={() => ask(q)} disabled={typing}>
              {q.q}
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
