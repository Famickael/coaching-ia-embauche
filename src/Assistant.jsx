import React, { useEffect, useRef, useState } from "react";
import { T, GRAD_AI, GRAD_AI_SOFT, FD, FB, RAD, Icon, I } from "./ui.jsx";
import { askAssistant, CONTEXT_SUGGESTIONS } from "./lib/assistant.js";

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

  return (
    <section aria-labelledby={`${id}-title`} style={{ border: `1px solid ${T.violet}33`, borderRadius: RAD.md, background: "#fff", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: GRAD_AI_SOFT, borderBottom: `1px solid ${T.violet}1f` }}>
        <div aria-hidden style={{ width: 30, height: 30, borderRadius: "50%", background: GRAD_AI, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon d={I.chat} s={16} c="#fff" /></div>
        <div style={{ minWidth: 0 }}>
          <h2 id={`${id}-title`} style={{ font: `800 15.5px ${FD}`, color: T.navy, margin: 0 }}>{title}</h2>
          <div style={{ font: `500 11.5px ${FB}`, color: T.violet }}>Assistant · fonctionnement du site et préparation d'entretien</div>
        </div>
      </div>

      <div ref={threadRef} role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversation avec l'assistant"
        style={{ maxHeight, overflowY: "auto", padding: msgs.length || typing ? "14px 14px 4px" : 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "88%", padding: "10px 13px", font: `400 14px/1.55 ${FB}`, whiteSpace: "pre-line", overflowWrap: "anywhere",
              borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: m.role === "user" ? T.primary : `${T.violet}0d`, color: m.role === "user" ? "#fff" : T.navy,
              border: m.role === "user" ? "none" : `1px solid ${T.violet}1f`,
            }}>
              <span className="rp-sr">{m.role === "user" ? "Vous : " : "Assistant : "}</span>{m.content}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex" }}>
            <div role="status" style={{ padding: "10px 14px", borderRadius: "14px 14px 14px 4px", background: `${T.violet}0d`, border: `1px solid ${T.violet}1f`, display: "inline-flex", alignItems: "center", gap: 8, font: `500 12.5px ${FB}`, color: T.violet }}>
              <span className="rp-dots" aria-hidden><i /><i /><i /></span> L'assistant écrit…
            </div>
          </div>
        )}
      </div>

      {chips.length > 0 && (
        <div style={{ padding: "10px 14px 0", display: "flex", flexWrap: "wrap", gap: 6 }} aria-label="Suggestions de questions">
          {chips.map(c => (
            <button key={c} type="button" onClick={() => send(c)}
              style={{ font: `600 12.5px/1.3 ${FB}`, color: T.violet, background: "#fff", border: `1.5px solid ${T.violet}55`, borderRadius: RAD.pill, padding: "7px 12px", cursor: "pointer", textAlign: "left", maxWidth: "100%" }}>
              {c}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={e => { e.preventDefault(); send(); }} style={{ display: "flex", gap: 8, padding: 14 }}>
        <label htmlFor={`${id}-input`} className="rp-sr">{inputLabel}</label>
        <input id={`${id}-input`} value={text} onChange={e => setText(e.target.value)} placeholder={placeholder} autoComplete="off" maxLength={400}
          style={{ flex: 1, minWidth: 0, height: 46, padding: "0 14px", borderRadius: RAD.md, border: `1.5px solid ${T.line}`, font: `400 15px ${FB}`, color: T.navy, background: T.bg }} />
        <button type="submit" disabled={!text.trim() || typing} aria-label="Envoyer la question"
          style={{ width: 46, height: 46, flexShrink: 0, borderRadius: RAD.md, border: "none", background: GRAD_AI, display: "grid", placeItems: "center", cursor: !text.trim() || typing ? "not-allowed" : "pointer", opacity: !text.trim() || typing ? 0.5 : 1 }}>
          <Icon d={I.send} s={17} c="#fff" />
        </button>
      </form>
      <div style={{ padding: "0 14px 12px", font: `400 11.5px/1.45 ${FB}`, color: T.muted }}>
        {REMOTE ? "Vos questions sont transmises au service de l'assistant, sans aucune image ni son." : "Les réponses sont préparées sur cet appareil : vos questions n'en sortent pas."} Ne saisissez pas d'informations personnelles.
      </div>
    </section>
  );
}
