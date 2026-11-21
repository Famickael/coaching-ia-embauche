import React, { useEffect, useRef, useState } from "react";
import { T, ON, TY, RAD, SH, PAD, GAP, MO, TONE, ringOf, Card, Tag, Bare, Notice, Quote, TimeChip, I } from "./ui.jsx";
import { loadVideoUrl } from "./lib/store.js";
import { fmt } from "./lib/analysis.js";

export const toneOf = d => (d.type === "appui" ? T.accent : T.violet);

/* Charge l'URL locale de la vidéo d'une réponse. */
export function useVideoUrl(take) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let u = null, alive = true;
    if (take?.hasVideo) loadVideoUrl(take.id).then(x => { if (alive) { u = x; setUrl(x); } else if (x) URL.revokeObjectURL(x); });
    return () => { alive = false; if (u) URL.revokeObjectURL(u); };
  }, [take?.id]);
  return url;
}

/* Marqueurs : repères de l'assistant + remarques du coach. */
export function markersOf(take) {
  const dims = (take.analysis?.dimensions || []).map(d => ({ id: d.id, t: d.t, kind: "ia", type: d.type, color: toneOf(d), label: d.titre }));
  const notes = (take.report?.notes || []).map(n => ({ id: n.id, t: n.t, kind: "note", color: T.primary, label: n.text }));
  return [...dims, ...notes].sort((a, b) => a.t - b.t);
}

/* Repère de lecture (référentiel 5.10) : appui rond plein, à explorer rond évidé, note du coach carré.
   La forme distingue autant que la couleur. */
export const Mark = ({ kind, s = 12 }) => (
  <span aria-hidden style={{
    display: "block", width: s, height: s, boxSizing: "border-box", flexShrink: 0,
    borderRadius: kind === "note" ? RAD.xs / 2 : "50%",
    background: kind === "explore" ? T.surface : kind === "note" ? T.primary : T.accent,
    border: kind === "explore" ? `3px solid ${T.violet}` : `2px solid ${T.surface}`, boxShadow: SH.xs,
  }} />
);
const kindOf = m => (m.kind === "note" ? "note" : m.type === "appui" ? "appui" : "explore");

/* Lecteur avec barre de repères cliquables (repère et moment de la vidéo liés). */
export function Player({ take, url, markers, active, onActive, playerRef }) {
  const local = useRef(null);
  const ref = playerRef || local;
  const [cur, setCur] = useState(0);
  const dur = Math.max(take.duration || 1, 1);

  useEffect(() => {
    const v = ref.current; if (!v) return;
    const on = () => {
      setCur(v.currentTime);
      const m = [...markers].reverse().find(x => v.currentTime >= x.t - 0.3);
      if (m && onActive && !v.paused) onActive(m.id);
    };
    v.addEventListener("timeupdate", on);
    return () => v.removeEventListener("timeupdate", on);
  }, [markers, url]);

  const seek = (t, id) => {
    if (id && onActive) onActive(id);
    const v = ref.current; if (!v) return;
    v.currentTime = Math.max(0, Math.min(t, dur - 0.1));
    v.play().catch(() => {});
  };

  const isAudio = take.mime?.startsWith("audio");
  return (
    <Card pad="none">
      <div style={{ background: T.videoBg, aspectRatio: isAudio ? "auto" : "16/9", display: "grid", placeItems: "center", padding: isAudio ? 24 : 0 }}>
        {url
          ? (isAudio
            ? <audio ref={ref} src={url} controls style={{ width: "90%" }} />
            : <video ref={ref} src={url} controls playsInline style={{ width: "100%", height: "100%", objectFit: "contain" }} />)
          : <div style={{ ...TY.small, color: ON.text, padding: 32 }}>Vidéo non disponible sur cet appareil.</div>}
      </div>
      <div style={{ padding: "16px 16px 16px", display: "grid", gap: 8 }}>
        <div style={{ position: "relative", height: 44 }}>
          <Bare aria-label="Se placer dans la vidéo" onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * dur); }}
            style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, display: "flex", alignItems: "center" }}>
            <span style={{ position: "relative", display: "block", width: "100%", height: 8, background: T.lineLt, borderRadius: RAD.pill }}>
              <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${Math.min(100, (cur / dur) * 100)}%`, background: T.primary, borderRadius: RAD.pill }} />
            </span>
          </Bare>
          {markers.map(m => (
            <Bare key={m.id} title={`${fmt(m.t)} · ${m.label}`} aria-label={`${fmt(m.t)} · ${m.label}`} onClick={() => seek(m.t, m.id)}
              style={{ position: "absolute", left: `${Math.min(100, (m.t / dur) * 100)}%`, top: 0, width: 32, height: 44, transform: `translate(-50%, ${m.kind === "note" ? -8 : 0}px)`, display: "grid", placeItems: "center" }}>
              <span style={{ borderRadius: m.kind === "note" ? RAD.xs : "50%", boxShadow: active === m.id ? ringOf(m.kind === "note" ? T.primaryBg : m.type === "appui" ? T.accentBg : T.violetBg) : "none" }}>
                <Mark kind={kindOf(m)} s={m.kind === "note" ? 12 : 16} />
              </span>
            </Bare>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", ...TY.time, color: T.muted }}><span>{fmt(cur)}</span><span>{fmt(dur)}</span></div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", ...TY.caption, color: T.body, marginTop: 4 }}>
          <Legend kind="appui" t="Point d'appui" /><Legend kind="explore" t="À explorer" /><Legend kind="note" t="Remarque du coach" />
        </div>
      </div>
    </Card>
  );
}
const Legend = ({ kind, t }) => <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Mark kind={kind} s={12} />{t}</span>;

/* Carte d'un repère de l'assistant (avec le commentaire du coach s'il existe). Cliquable : rendue en bouton. */
export function DimCard({ d, comment, active, onClick }) {
  const ap = d.type === "appui";
  const tone = ap ? TONE.appui : TONE.ai;
  const body = (
    <>
      <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <TimeChip t={d.t} tone={ap ? "appui" : "ai"} />
        <span style={{ ...TY.h3, color: T.navy, flex: 1, minWidth: 120 }}>{d.titre}</span>
        <Tag tone={ap ? "appui" : "ai"} icon={ap ? I.check : I.search}>{ap ? "Point d'appui" : "À explorer"}</Tag>
      </span>
      <span style={{ display: "block", ...TY.body, color: T.navy }}>{d.observation}</span>
      <span style={{ display: "block", ...TY.small, color: T.body, background: T.bg, borderRadius: RAD.sm, padding: "8px 12px" }}>{d.conseil}</span>
      {comment && <Quote><strong>Votre coach :</strong> {comment}</Quote>}
    </>
  );
  const st = {
    display: "grid", gap: 8, width: "100%", textAlign: "left", background: active ? tone.bg : T.surface, border: `1.5px solid ${active ? tone.fg : T.line}`,
    borderRadius: RAD.md, padding: PAD.sm, transition: `border-color ${MO.fast}, background-color ${MO.fast}`,
  };
  if (onClick) return <Bare onClick={onClick} aria-pressed={!!active} style={st}>{body}</Bare>;
  return <div style={st}>{body}</div>;
}

/* Rapport en lecture : mode "simple" (texte) ou "video" (relecture avec repères). */
export function ReportBody({ take, mode, counselorName }) {
  const A = take.analysis;
  const url = useVideoUrl(mode === "video" ? take : null);
  const markers = markersOf(take);
  const [active, setActive] = useState(null);
  const playerRef = useRef(null);
  const rep = take.report;
  const seekTo = (t, id) => { setActive(id); const v = playerRef.current; if (v) { v.currentTime = t; v.play().catch(() => {}); } };

  const intro = rep && (
    <Card level={2} style={{ borderLeft: `3px solid ${T.primary}`, display: "grid", gap: 8 }}>
      <div style={{ ...TY.label, color: T.primary }}>Le message de {counselorName || "votre coach"} · votre coach</div>
      <div style={{ ...TY.bodyLg, color: T.navy, whiteSpace: "pre-wrap" }}>{rep.intro || "Votre coach a regardé votre réponse."}</div>
    </Card>
  );
  const notes = rep?.notes?.length > 0 && (
    <Card>
      <h3 style={{ ...TY.h4, color: T.navy, margin: "0 0 8px" }}>Remarques de votre coach</h3>
      {rep.notes.slice().sort((a, b) => a.t - b.t).map(n => {
        const row = <><TimeChip t={n.t} tone="primary" /><span style={{ ...TY.body, color: T.navy }}>{n.text}</span></>;
        const st = { display: "flex", gap: 12, alignItems: "flex-start", width: "100%", padding: "8px 0", borderTop: `1px solid ${T.lineLt}` };
        return mode === "video"
          ? <Bare key={n.id} onClick={() => seekTo(n.t, n.id)} style={st}>{row}</Bare>
          : <div key={n.id} style={st}>{row}</div>;
      })}
    </Card>
  );
  const synth = <Notice tone="info" icon={I.sparkle} style={{ ...TY.bodyLg }}><strong>En résumé.</strong> {A.synthese}</Notice>;

  if (mode !== "video") {
    return (
      <div style={{ display: "grid", gap: GAP.stack }}>
        {intro}{synth}
        {A.dimensions.map(d => <DimCard key={d.id} d={d} comment={rep?.comments?.[d.id]} />)}
        {notes}
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gap: GAP.stack }}>
      {intro}
      <div className="rp-split">
        <div style={{ display: "grid", gap: GAP.stack }}>
          <Player take={take} url={url} markers={markers} active={active} onActive={setActive} playerRef={playerRef} />
          {synth}
          {notes}
        </div>
        <div style={{ display: "grid", gap: GAP.stack }}>
          {A.dimensions.map(d => <DimCard key={d.id} d={d} comment={rep?.comments?.[d.id]} active={active === d.id} onClick={() => seekTo(d.t, d.id)} />)}
        </div>
      </div>
    </div>
  );
}
