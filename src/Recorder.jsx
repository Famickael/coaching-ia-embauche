import React, { useEffect, useRef, useState } from "react";
import { T, ON, TY, RAD, W, GAP, GRAD_NIGHT, Btn, Back, Icon, I } from "./ui.jsx";
import { startGaze } from "./lib/gaze.js";
import { PHRASES } from "./content/legal.js";

const MAX_SEC = 180;

function pickMime(audioOnly) {
  const list = audioOnly
    ? ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]
    : ["video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
  return list.find(m => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || "";
}

/* Enregistreur : caméra + micro, ou micro seul.
   onDone({ blob, duration, gaze, audioOnly }) est appelé quand la personne valide sa prise. */
export default function Recorder({ question, onDone, onCancel, trackGaze = true, setModal, validateLabel = "Garder cette réponse" }) {
  const liveRef = useRef(null), streamRef = useRef(null), recRef = useRef(null), chunks = useRef([]);
  const gazeRef = useRef(null), t0 = useRef(0);
  const [phase, setPhase] = useState("idle"); // idle | live | recording | done | error
  const [audioOnly, setAudioOnly] = useState(false);
  const [sec, setSec] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => () => { stopStream(); if (result?.url) URL.revokeObjectURL(result.url); }, []); // eslint-disable-line

  function stopStream() { streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null; }

  async function open(audio) {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia(audio
        ? { audio: { echoCancellation: true, noiseSuppression: true } }
        : { audio: { echoCancellation: true, noiseSuppression: true }, video: { width: { ideal: 640 }, height: { ideal: 360 }, facingMode: "user" } });
      streamRef.current = stream;
      setAudioOnly(audio);
      setPhase("live");
      setTimeout(() => { if (liveRef.current && !audio) { liveRef.current.srcObject = stream; liveRef.current.play().catch(() => {}); } }, 0);
    } catch (e) {
      setError(e?.name === "NotAllowedError"
        ? "L'accès a été refusé. Autorisez la caméra ou le micro dans les réglages du navigateur, ou choisissez « Voix seule »."
        : "Aucune caméra ou aucun micro n'est disponible sur cet appareil.");
      setPhase("error");
    }
  }

  function start() {
    chunks.current = [];
    const mimeType = pickMime(audioOnly);
    const rec = new MediaRecorder(streamRef.current, { mimeType: mimeType || undefined, videoBitsPerSecond: 600_000, audioBitsPerSecond: 64_000 });
    rec.ondataavailable = e => e.data.size && chunks.current.push(e.data);
    rec.onstop = () => {
      const duration = (performance.now() - t0.current) / 1000;
      const blob = new Blob(chunks.current, { type: rec.mimeType || mimeType || (audioOnly ? "audio/webm" : "video/webm") });
      const gaze = gazeRef.current ? gazeRef.current.stop() : null;
      gazeRef.current = null;
      setResult({ blob, duration, gaze, url: URL.createObjectURL(blob) });
      setPhase("done");
      stopStream();
    };
    rec.start(1000);
    recRef.current = rec;
    t0.current = performance.now();
    setSec(0);
    if (trackGaze && !audioOnly && liveRef.current) gazeRef.current = startGaze(liveRef.current, t0.current);
    setPhase("recording");
  }

  function stop() { if (recRef.current?.state === "recording") recRef.current.stop(); }

  useEffect(() => {
    if (phase !== "recording") return;
    const i = setInterval(() => setSec(s => { if (s + 1 >= MAX_SEC) stop(); return s + 1; }), 1000);
    return () => clearInterval(i);
  }, [phase]);

  function redo() {
    if (result?.url) URL.revokeObjectURL(result.url);
    setResult(null);
    open(audioOnly);
  }

  const mm = String(Math.floor(sec / 60)).padStart(2, "0"), ss = String(sec % 60).padStart(2, "0");

  const pill = { position: "absolute", top: 12, display: "flex", alignItems: "center", gap: 8, height: 32, padding: "0 12px", borderRadius: RAD.pill, color: ON.text };
  return (
    <div style={{ display: "grid", gap: 16 }}>
      {question && (
        <div style={{ background: T.primaryBg, borderRadius: RAD.md, padding: "16px 20px", display: "grid", gap: 8 }}>
          <div style={{ ...TY.overline, color: T.primary }}>Question</div>
          <div style={{ ...TY.h2, color: T.navy }}>« {question} »</div>
        </div>
      )}

      <div style={{ position: "relative", borderRadius: RAD.lg, overflow: "hidden", aspectRatio: "16/9", background: GRAD_NIGHT }}>
        <video ref={liveRef} muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", display: (phase === "live" || phase === "recording") && !audioOnly ? "block" : "none" }} />

        {phase === "done" && result && (audioOnly
          ? <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}><audio src={result.url} controls style={{ width: "80%" }} /></div>
          : <video src={result.url} controls playsInline style={{ width: "100%", height: "100%", objectFit: "cover", background: T.videoBg }} />)}

        {(phase === "idle" || phase === "error") && (
          <div className="rs-on-dark" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: 24 }}>
            <div style={{ textAlign: "center", color: ON.text, maxWidth: W.narrow, display: "grid", gap: 8 }}>
              <div style={{ ...TY.h3, color: ON.text }}>{phase === "error" ? "Caméra ou micro introuvable" : "Quand vous voulez"}</div>
              <div style={{ ...TY.small, color: ON.text }}>{phase === "error" ? error : "L'image reste sur votre appareil. Vous pouvez aussi répondre en voix seule."}</div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 8 }}>
                <Btn kind="objective" onClick={() => open(false)} icon={I.video}>Activer la caméra</Btn>
                <Btn kind="ghostDark" onClick={() => open(true)} icon={I.mic}>Voix seule</Btn>
              </div>
            </div>
          </div>
        )}

        {(phase === "live" || phase === "recording") && audioOnly && (
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: ON.text }}>
            <div style={{ textAlign: "center", display: "grid", justifyItems: "center", gap: 8 }}><Icon d={I.mic} s={40} /><div style={{ ...TY.label }}>Voix seule</div></div>
          </div>
        )}

        {phase === "recording" && (
          <div style={{ ...pill, left: 12, background: ON.scrim }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.error, animation: "blink 1.1s infinite" }} />
            <span style={{ ...TY.time, color: ON.text }}>{mm}:{ss}</span>
            <span style={{ ...TY.time, color: ON.text, opacity: 0.8 }}>/ 03:00</span>
          </div>
        )}
        {(phase === "live" || phase === "recording") && (
          <div style={{ ...pill, right: 12, background: T.successDk, ...TY.tag }}>
            <Icon d={I.lock} s={12} /> Reste sur cet appareil
          </div>
        )}
      </div>

      {setModal && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, flexWrap: "wrap", ...TY.caption, color: T.muted }}>
          <Icon d={I.lock} s={16} /> {PHRASES.camera}
          <Btn kind="ghost" size="sm" icon={I.shield} onClick={() => setModal("video")}>Que devient ma vidéo ?</Btn>
        </div>
      )}

      <div className="rp-actions" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: GAP.actions }}>
        {onCancel ? <Back onClick={() => { stop(); stopStream(); onCancel(); }} /> : <span />}
        {phase === "live" && <Btn kind="objective" onClick={start} icon={I.rec}>Démarrer l'enregistrement</Btn>}
        {phase === "recording" && <Btn kind="secondary" onClick={stop} icon={I.stop}>Arrêter l'enregistrement</Btn>}
        {phase === "done" && (
          <div className="rp-actions" style={{ display: "flex", gap: GAP.actions, flexWrap: "wrap" }}>
            <Btn kind="secondary" onClick={redo} icon={I.redo}>Recommencer</Btn>
            <Btn kind="ai" onClick={() => onDone({ ...result, audioOnly })} iconRight={I.arrow}>{validateLabel}</Btn>
          </div>
        )}
      </div>
    </div>
  );
}
