import React, { useEffect, useRef, useState } from "react";
import { T, GRAD_SOFT, FD, FB, FM, RAD, Btn, Icon, I } from "./ui.jsx";
import { startGaze } from "./lib/gaze.js";

const MAX_SEC = 180;

function pickMime(audioOnly) {
  const list = audioOnly
    ? ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]
    : ["video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
  return list.find(m => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || "";
}

/* Enregistreur : caméra + micro, ou micro seul.
   onDone({ blob, duration, gaze, audioOnly }) est appelé quand la personne valide sa prise. */
export default function Recorder({ question, onDone, onCancel, trackGaze = true, setModal, validateLabel = "Valider cette prise" }) {
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
        ? "L'accès a été refusé. Autorisez la caméra ou le micro dans les réglages du navigateur, ou choisissez l'enregistrement du son seul."
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

  return (
    <div>
      {question && (
        <div style={{ background: GRAD_SOFT, borderRadius: RAD.md, padding: "16px 20px", marginBottom: 14 }}>
          <div style={{ font: `700 11px ${FB}`, color: T.primary, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Question</div>
          <div style={{ font: `700 19px/1.4 ${FD}`, color: T.navy }}>« {question} »</div>
        </div>
      )}

      <div style={{ position: "relative", borderRadius: RAD.lg, overflow: "hidden", aspectRatio: "16/9", background: `radial-gradient(circle at 50% 38%, ${T.primaryDk}, ${T.navy})` }}>
        <video ref={liveRef} muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", display: (phase === "live" || phase === "recording") && !audioOnly ? "block" : "none" }} />

        {phase === "done" && result && (audioOnly
          ? <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}><audio src={result.url} controls style={{ width: "80%" }} /></div>
          : <video src={result.url} controls playsInline style={{ width: "100%", height: "100%", objectFit: "cover", background: "#000" }} />)}

        {(phase === "idle" || phase === "error") && (
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: 24 }}>
            <div style={{ textAlign: "center", color: "rgba(255,255,255,.9)", maxWidth: 420 }}>
              <div style={{ font: `700 16px ${FD}`, color: "#fff", marginBottom: 6 }}>{phase === "error" ? "Caméra ou micro indisponible" : "Prêt·e quand vous l'êtes"}</div>
              <div style={{ font: `400 13px/1.5 ${FB}`, marginBottom: 16 }}>{phase === "error" ? error : "L'aperçu reste sur votre appareil. Vous pouvez aussi enregistrer uniquement votre voix."}</div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <Btn kind="objective" onClick={() => open(false)}>Activer la caméra</Btn>
                <Btn kind="ghostDark" onClick={() => open(true)} icon={I.mic}>Son seulement</Btn>
              </div>
            </div>
          </div>
        )}

        {(phase === "live" || phase === "recording") && audioOnly && (
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#fff" }}>
            <div style={{ textAlign: "center" }}><Icon d={I.mic} s={40} c="#fff" /><div style={{ font: `600 13px ${FB}`, marginTop: 8 }}>Enregistrement du son seul</div></div>
          </div>
        )}

        {phase === "recording" && (
          <div style={{ position: "absolute", top: 14, left: 14, display: "flex", alignItems: "center", gap: 7, background: "rgba(0,0,0,.5)", padding: "6px 12px", borderRadius: RAD.pill }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: T.error, animation: "blink 1.1s infinite" }} />
            <span style={{ color: "#fff", font: `700 13px ${FM}` }}>{mm}:{ss}</span>
            <span style={{ color: "rgba(255,255,255,.6)", font: `500 11px ${FM}` }}>/ 03:00</span>
          </div>
        )}
        {(phase === "live" || phase === "recording") && (
          <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(65,199,122,.92)", padding: "6px 12px", borderRadius: RAD.pill, color: "#fff", font: `700 11px ${FB}`, display: "flex", alignItems: "center", gap: 6 }}>
            <Icon d={I.lock} s={13} c="#fff" /> Traitement local
          </div>
        )}
      </div>

      {setModal && (
        <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
          <button onClick={() => setModal("lifecycle")} style={{ display: "inline-flex", alignItems: "center", gap: 8, font: `600 12.5px ${FB}`, color: T.primary, background: GRAD_SOFT, border: "none", borderRadius: RAD.pill, padding: "9px 16px", cursor: "pointer" }}>
            <Icon d={I.shield} s={15} c={T.primary} /> Que devient ma vidéo ?
          </button>
        </div>
      )}

      <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        {onCancel ? <button onClick={() => { stop(); stopStream(); onCancel(); }} style={{ font: `500 14px ${FB}`, color: T.muted, background: "none", border: "none", cursor: "pointer" }}>← Retour</button> : <span />}
        <div style={{ display: "flex", gap: 10 }}>
          {phase === "live" && <Btn kind="objective" onClick={start}><span style={{ width: 9, height: 9, borderRadius: "50%", background: "#fff", display: "inline-block" }} /> Démarrer l'enregistrement</Btn>}
          {phase === "recording" && <Btn kind="secondary" onClick={stop}>■ Arrêter</Btn>}
          {phase === "done" && <Btn kind="secondary" onClick={redo} icon={I.redo}>Refaire</Btn>}
          {phase === "done" && <Btn kind="ai" onClick={() => onDone({ ...result, audioOnly })} iconRight={I.arrow}>{validateLabel}</Btn>}
        </div>
      </div>
    </div>
  );
}
