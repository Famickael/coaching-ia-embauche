import React, { useEffect, useRef, useState } from "react";
import { T, TY, RAD, GRAD_AI, Btn, Chip, Input, IconTile, I } from "./ui.jsx";
import { askAssistant, CONTEXT_SUGGESTIONS } from "./lib/assistant.js";
import { PHRASES } from "./content/legal.js";

const REMOTE = !!import.meta.env.VITE_LLM_ENDPOINT;

/* Assistant conversationnel réutilisable : fil de messages, saisie, suggestions cliquables,
   relances possibles (« un exemple ? », « pourquoi ? »…). Aucune note, aucune déduction émotionnelle. */
export default function Assistant({ context = "warmup", poste, title = "Posez directement votre question", intro, placeholder = "Votre question…", inputLabel = "Votre question à l'assistant", id = "assistant", maxHeight = 360 }) {
  const [msgs, setMsgs] = useState(() => intro ? [{ role: "assistant", content: intro, suggestions: CONTEXT_SUGGESTIONS[context] || [] }] : []);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const memory = useRef({});
  const threadRef = useRef(null);
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);
  useEffect(() => { const el = threadRef.current; if (el) el.scrollTop = el.scrollHeight; }, [msgs, typing]);

  async function send(q) {
    const question = (q ?? text).trim();
    if (!question || typing) return;
    setText("");
    const history = [...msgs.map(({ role, content }) => ({ role, content })), { role: "user", content: question }];
    setMsgs(m => [...m, { role: "user", content: question }]);
    setTyping(true);
    const t0 = performance.now();
    const r = await askAssistant(history, { context, poste, memory: memory.current });
    const wait = Math.max(0, 450 - (performance.now() - t0)); // laisse le temps de voir l'indicateur
    await new Promise(res => setTimeout(res, wait));
    if (!alive.current) return;
    memory.current = r.memory || memory.current;
    setMsgs(m => [...m, { role: "assistant", content: r.text, suggestions: r.suggestions || [] }]);
    setTyping(false);
  }

  const lastAssistant = [...msgs].reverse().find(m => m.role === "assistant");
  const chips = typing ? [] : msgs.length === 0 ? (CONTEXT_SUGGESTIONS[context] || []) : msgs[msgs.length - 1].role === "assistant" ? lastAssistant.suggestions || [] : [];

  const bubble = mine => ({
    maxWidth: "88%", padding: "8px 12px", ...TY.body, whiteSpace: "pre-line", overflowWrap: "anywhere",
    borderRadius: mine ? `${RAD.md}px ${RAD.md}px ${RAD.xs}px ${RAD.md}px` : `${RAD.md}px ${RAD.md}px ${RAD.md}px ${RAD.xs}px`,
    background: mine ? T.primary : T.violetBg, color: mine ? T.surface : T.navy,
  });
  return (
    <section aria-labelledby={`${id}-title`} style={{ border: `1px solid ${T.line}`, borderRadius: RAD.md, background: T.surface, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: T.violetBg }}>
        <IconTile icon={I.chat} c={T.surface} bg={GRAD_AI} round />
        <div style={{ minWidth: 0, display: "grid", gap: 2 }}>
          <h2 id={`${id}-title`} style={{ ...TY.h3, color: T.navy, margin: 0 }}>{title}</h2>
          <div style={{ ...TY.caption, color: T.violet }}>Assistant automatique · ce n'est pas une personne</div>
        </div>
      </div>

      <div ref={threadRef} role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversation avec l'assistant"
        style={{ maxHeight, overflowY: "auto", padding: msgs.length || typing ? "16px 16px 4px" : 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={bubble(m.role === "user")}>
              <span className="rp-sr">{m.role === "user" ? "Vous : " : "Assistant : "}</span>{m.content}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex" }}>
            <div role="status" style={{ ...bubble(false), display: "inline-flex", alignItems: "center", gap: 8, ...TY.small, color: T.violet }}>
              <span className="rp-dots" aria-hidden><i /><i /><i /></span> L'assistant écrit…
            </div>
          </div>
        )}
      </div>

      {chips.length > 0 && (
        <div style={{ padding: "12px 16px 0", display: "flex", flexWrap: "wrap", gap: 8 }} aria-label="Suggestions de questions">
          {chips.map(c => <Chip key={c} tone="ai" check={false} onClick={() => send(c)}>{c}</Chip>)}
        </div>
      )}

      <div style={{ padding: "12px 16px 0", ...TY.body, color: T.body }}>{PHRASES.assistantChat} {PHRASES.noPersonal}</div>
      <form onSubmit={e => { e.preventDefault(); send(); }} style={{ display: "flex", gap: 8, padding: 16 }}>
        <label htmlFor={`${id}-input`} className="rp-sr">{inputLabel}</label>
        <Input id={`${id}-input`} value={text} onChange={e => setText(e.target.value)} placeholder={placeholder} autoComplete="off" maxLength={400} style={{ flex: 1, minWidth: 0 }} />
        <Btn kind="ai" type="submit" disabled={!text.trim() || typing} aria-label="Envoyer la question" icon={I.send} style={{ width: 48, padding: 0 }} />
      </form>
    </section>
  );
}
