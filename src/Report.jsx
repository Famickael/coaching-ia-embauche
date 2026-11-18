import React, { useEffect, useRef, useState } from "react";
import { T, FD, FB, FM, RAD, SH, Card, Tag, Icon, I } from "./ui.jsx";
import { loadVideoUrl } from "./lib/store.js";
import { fmt } from "./lib/analysis.js";

export const toneOf = d => (d.type === "appui" ? T.orange : T.violet);

/* Charge l'URL locale de la vidéo d'une prise. */
export function useVideoUrl(take) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let u = null, alive = true;
    if (take?.hasVideo) loadVideoUrl(take.id).then(x => { if (alive) { u = x; setUrl(x); } else if (x) URL.revokeObjectURL(x); });
    return () => { alive = false; if (u) URL.revokeObjectURL(u); };
  }, [take?.id]);
  return url;
}

/* Marqueurs : observations de l'assistant + notes horodatées du coach. */
export function markersOf(take) {
  const dims = (take.analysis?.dimensions || []).map(d => ({ id: d.id, t: d.t, kind: "ia", color: toneOf(d), label: d.titre }));
  const notes = (take.report?.notes || []).map(n => ({ id: n.id, t: n.t, kind: "note", color: T.primary, label: n.text }));
  return [...dims, ...notes].sort((a, b) => a.t - b.t);
}

/* Lecteur avec barre de repères cliquables (repère ↔ moment de la vidéo). */
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
    <Card pad={0} style={{ overflow: "hidden" }}>
      <div style={{ background: "#000", aspectRatio: isAudio ? "auto" : "16/9", display: "grid", placeItems: "center", padding: isAudio ? 24 : 0 }}>
        {url
          ? (isAudio
            ? <audio ref={ref} src={url} controls style={{ width: "90%" }} />
            : <video ref={ref} src={url} controls playsInline style={{ width: "100%", height: "100%", objectFit: "contain" }} />)
          : <div style={{ color: "rgba(255,255,255,.7)", font: `500 13px ${FB}`, padding: 30 }}>Vidéo non disponible sur cet appareil.</div>}
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <div onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * dur); }}
          style={{ position: "relative", height: 8, background: T.lineLt, borderRadius: RAD.pill, marginBottom: 6, cursor: "pointer" }}>
          <div style={{ position: "absolute", inset: 0, width: `${Math.min(100, (cur / dur) * 100)}%`, background: T.primary, borderRadius: RAD.pill }} />
          {markers.map(m => (
            <div key={m.id} title={`${fmt(m.t)} · ${m.label}`} onClick={e => { e.stopPropagation(); seek(m.t, m.id); }}
              style={{ position: "absolute", left: `${Math.min(100, (m.t / dur) * 100)}%`, top: m.kind === "note" ? -9 : -4, width: m.kind === "note" ? 12 : 16, height: m.kind === "note" ? 12 : 16, marginLeft: m.kind === "note" ? -6 : -8, borderRadius: m.kind === "note" ? 3 : "50%", cursor: "pointer", background: m.color, border: "2px solid #fff", boxShadow: active === m.id ? `0 0 0 4px ${m.color}44` : SH.xs }} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", font: `500 11px ${FM}`, color: T.muted, marginBottom: 10 }}><span>{fmt(cur)}</span><span>{fmt(dur)}</span></div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", font: `400 12px ${FB}`, color: T.body }}>
          <Dot c={T.orange} t="Point d'appui" /><Dot c={T.violet} t="À explorer" /><Dot c={T.primary} t="Note du coach" square />
        </div>
      </div>
    </Card>
  );
}
const Dot = ({ c, t, square }) => <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: square ? 2 : "50%", background: c }} />{t}</span>;

/* Carte d'une observation de l'assistant (avec le commentaire du coach s'il existe). */
export function DimCard({ d, comment, active, onClick, compact }) {
  const c = toneOf(d);
  return (
    <div onClick={onClick} style={{
      background: active ? `${c}10` : "#fff", border: `1.5px solid ${active ? c : T.line}`, borderRadius: RAD.md,
      padding: compact ? 14 : 18, marginBottom: 10, cursor: onClick ? "pointer" : "default", transition: "all .2s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, flexWrap: "wrap" }}>
        <span style={{ minWidth: 36, height: 22, padding: "0 7px", borderRadius: RAD.pill, background: c, color: "#fff", display: "grid", placeItems: "center", font: `700 11px ${FM}` }}>{fmt(d.t)}</span>
        <span style={{ font: `700 15px ${FD}`, color: T.navy, flex: 1 }}>{d.titre}</span>
        <Tag tone={d.type === "appui" ? "orange" : "ai"}>{d.type === "appui" ? "Point d'appui" : "À explorer"}</Tag>
      </div>
      <div style={{ font: `500 14px/1.55 ${FB}`, color: T.navy, marginBottom: 8 }}>{d.observation}</div>
      <div style={{ font: `400 13px/1.55 ${FB}`, color: T.body, background: T.bg, borderRadius: RAD.sm, padding: "9px 12px" }}>{d.conseil}</div>
      {comment && (
        <div style={{ marginTop: 8, display: "flex", gap: 8, font: `400 13px/1.55 ${FB}`, color: T.navy, background: `${T.primary}0D`, borderLeft: `3px solid ${T.primary}`, borderRadius: RAD.xs, padding: "9px 12px" }}>
          <Icon d={I.note} s={15} c={T.primary} /><span><strong>Votre coach :</strong> {comment}</span>
        </div>
      )}
    </div>
  );
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
    <Card style={{ marginBottom: 14, borderLeft: `4px solid ${T.primary}` }}>
      <div style={{ font: `700 13px ${FB}`, color: T.primary, marginBottom: 6 }}>Le mot de {counselorName || "votre coach"}</div>
      <div style={{ font: `400 15px/1.65 ${FB}`, color: T.navy, whiteSpace: "pre-wrap" }}>{rep.intro || "Votre coach a relu votre prise."}</div>
    </Card>
  );
  const notes = rep?.notes?.length > 0 && (
    <Card style={{ marginTop: 4 }}>
      <div style={{ font: `700 14px ${FD}`, color: T.navy, marginBottom: 10 }}>Notes horodatées</div>
      {rep.notes.slice().sort((a, b) => a.t - b.t).map(n => (
        <div key={n.id} onClick={mode === "video" ? () => seekTo(n.t, n.id) : undefined} style={{ display: "flex", gap: 10, padding: "8px 0", borderTop: `1px solid ${T.lineLt}`, cursor: mode === "video" ? "pointer" : "default" }}>
          <span style={{ minWidth: 40, height: 22, borderRadius: RAD.pill, background: T.primary, color: "#fff", display: "grid", placeItems: "center", font: `700 11px ${FM}` }}>{fmt(n.t)}</span>
          <span style={{ font: `400 14px/1.5 ${FB}`, color: T.navy }}>{n.text}</span>
        </div>
      ))}
    </Card>
  );
  const synth = <div style={{ background: `${T.primary}0D`, borderRadius: RAD.md, padding: 16, marginBottom: 14, font: `400 14.5px/1.6 ${FB}`, color: T.navy }}><strong>En deux mots.</strong> {A.synthese}</div>;

  if (mode !== "video") {
    return (
      <div>
        {intro}{synth}
        {A.dimensions.map(d => <DimCard key={d.id} d={d} comment={rep?.comments?.[d.id]} />)}
        {notes}
      </div>
    );
  }
  return (
    <div>
      {intro}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1fr)", gap: 16 }}>
        <div>
          <Player take={take} url={url} markers={markers} active={active} onActive={setActive} playerRef={playerRef} />
          <div style={{ marginTop: 12 }}>{synth}</div>
          {notes}
        </div>
        <div>
          {A.dimensions.map(d => <DimCard key={d.id} d={d} compact comment={rep?.comments?.[d.id]} active={active === d.id} onClick={() => seekTo(d.t, d.id)} />)}
        </div>
      </div>
    </div>
  );
}
