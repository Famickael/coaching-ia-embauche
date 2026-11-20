import React, { useEffect, useRef, useState } from "react";
import { T, GRAD_SOFT, FD, FB, RAD, Btn, Icon, I } from "./ui.jsx";
import { loadSegmenter, startBackground, BG_COLOR } from "./lib/background.js";

/* Aperçu en direct pour l'échauffement : caméra ou voix seule.
   Rien n'est enregistré (aucun MediaRecorder) : l'image et le son ne quittent pas cet écran.
   En vidéo, le fond peut être flouté ou remplacé par une couleur unie (calcul local). */
export default function WarmupStage({ setModal }) {
  const videoRef = useRef(null), canvasRef = useRef(null), streamRef = useRef(null);
  const stopBgRef = useRef(null), modeRef = useRef("none"), audioRef = useRef(null);
  const [phase, setPhase] = useState("idle"); // idle | video | audio | error
  const [error, setError] = useState("");
  const [bg, setBg] = useState("none"); // none | blur | color
  const [bgState, setBgState] = useState("idle"); // idle | loading | ready | unavailable
  const [hearing, setHearing] = useState(false);

  useEffect(() => () => { stopAll(); }, []); // eslint-disable-line

  function stopBg() { stopBgRef.current?.(); stopBgRef.current = null; }
  function stopAudio() {
    const a = audioRef.current; audioRef.current = null;
    if (a) { cancelAnimationFrame(a.raf); a.ctx.close().catch(() => {}); }
    setHearing(false);
  }
  function stopAll() {
    stopBg(); stopAudio();
    streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null;
  }

  // Indicateur « le micro vous entend » : simple présence de son, aucune mesure conservée.
  function watchAudio(stream) {
    stopAudio();
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC || !stream.getAudioTracks().length) return;
      const ctx = new AC();
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser(); an.fftSize = 512;
      src.connect(an);
      const buf = new Uint8Array(an.fftSize);
      const a = { ctx, raf: 0 };
      let on = false, last = 0;
      const tick = () => {
        an.getByteTimeDomainData(buf);
        let peak = 0; for (let i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i] - 128));
        const now = performance.now();
        if (peak > 10) last = now;
        const next = now - last < 400;
        if (next !== on) { on = next; setHearing(next); }
        a.raf = requestAnimationFrame(tick);
      };
      a.raf = requestAnimationFrame(tick);
      audioRef.current = a;
      ctx.resume?.().catch(() => {});
    } catch { /* indicateur facultatif */ }
  }

  async function open(audioOnly) {
    setError("");
    stopAll();
    try {
      const stream = await navigator.mediaDevices.getUserMedia(audioOnly
        ? { audio: { echoCancellation: true, noiseSuppression: true } }
        : { audio: { echoCancellation: true, noiseSuppression: true }, video: { width: { ideal: 640 }, height: { ideal: 360 }, facingMode: "user" } });
      streamRef.current = stream;
      setPhase(audioOnly ? "audio" : "video");
      watchAudio(stream);
      if (!audioOnly) setTimeout(() => {
        const v = videoRef.current;
        if (v) { v.srcObject = stream; v.play().catch(() => {}); }
        if (modeRef.current !== "none") applyBg(modeRef.current);
      }, 0);
    } catch (e) {
      setError(e?.name === "NotAllowedError"
        ? "L'accès a été refusé. Autorisez la caméra ou le micro dans les réglages du navigateur, ou passez en voix seule."
        : "Aucune caméra ou aucun micro n'est disponible sur cet appareil. Vous pouvez faire l'échauffement sans aperçu.");
      setPhase("error");
    }
  }

  async function applyBg(mode) {
    modeRef.current = mode;
    setBg(mode);
    if (mode === "none") { stopBg(); return; }
    if (stopBgRef.current) return; // déjà en cours : le mode est lu à chaque image
    setBgState(s => (s === "ready" ? s : "loading"));
    try {
      const seg = await loadSegmenter();
      if (modeRef.current === "none" || !videoRef.current || !canvasRef.current || !streamRef.current) { setBgState("ready"); return; }
      stopBgRef.current = startBackground(seg, videoRef.current, canvasRef.current, () => modeRef.current);
      setBgState("ready");
    } catch (e) {
      console.warn("[fond] modèle indisponible", e);
      modeRef.current = "none"; setBg("none"); setBgState("unavailable");
    }
  }

  const live = phase === "video" || phase === "audio";
  const showCanvas = phase === "video" && bg !== "none" && bgState === "ready";
  const opt = (id, label) => {
    const on = bg === id, dis = bgState === "unavailable" && id !== "none";
    return (
      <button key={id} type="button" role="radio" aria-checked={on} disabled={dis} onClick={() => applyBg(id)}
        style={{ font: `600 12.5px ${FB}`, padding: "7px 12px", borderRadius: RAD.pill, cursor: dis ? "not-allowed" : "pointer", opacity: dis ? 0.5 : 1,
          border: `1.5px solid ${on ? T.primary : T.line}`, background: on ? T.primary : "#fff", color: on ? "#fff" : T.primary, display: "inline-flex", alignItems: "center", gap: 6 }}>
        {id === "color" && <span aria-hidden style={{ width: 12, height: 12, borderRadius: 3, background: BG_COLOR, border: `1px solid ${on ? "#fff" : T.line}` }} />}
        {label}
      </button>
    );
  };

  return (
    <div>
      <div style={{ position: "relative", borderRadius: RAD.lg, overflow: "hidden", aspectRatio: "16/9", background: `radial-gradient(circle at 50% 38%, ${T.primaryDk}, ${T.navy})` }}>
        <video ref={videoRef} muted playsInline aria-label="Aperçu de votre caméra, non enregistré"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", display: phase === "video" && !showCanvas ? "block" : "none" }} />
        <canvas ref={canvasRef} aria-label="Aperçu avec fond modifié, non enregistré"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", display: showCanvas ? "block" : "none" }} />

        {(phase === "idle" || phase === "error") && (
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: 20 }}>
            <div style={{ textAlign: "center", color: "rgba(255,255,255,.9)", maxWidth: 420 }}>
              <div style={{ font: `700 16px ${FD}`, color: "#fff", marginBottom: 6 }}>{phase === "error" ? "Caméra ou micro indisponible" : "Un aperçu, rien de plus"}</div>
              <div style={{ font: `400 13px/1.5 ${FB}`, marginBottom: 14 }}>{phase === "error" ? error : "Activez la caméra pour vous voir pendant que vous parlez, ou restez en voix seule. Rien n'est enregistré."}</div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <Btn kind="blue" onClick={() => open(false)}>Activer la caméra</Btn>
                <Btn kind="ghostDark" onClick={() => open(true)}><Icon d={I.mic} s={16} c="#fff" /> Voix seule</Btn>
              </div>
            </div>
          </div>
        )}

        {phase === "audio" && (
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#fff", padding: 16 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 76, height: 76, borderRadius: "50%", margin: "0 auto", display: "grid", placeItems: "center", background: "rgba(255,255,255,.12)", boxShadow: hearing ? "0 0 0 10px rgba(127,214,207,.25)" : "none", transition: "box-shadow .2s" }}>
                <Icon d={I.mic} s={34} c="#fff" />
              </div>
              <div style={{ font: `600 13px ${FB}`, marginTop: 12 }}>Voix seule · rien n'est enregistré</div>
            </div>
          </div>
        )}

        {live && (
          <>
            <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(65,199,122,.92)", padding: "6px 11px", borderRadius: RAD.pill, color: "#fff", font: `700 11px ${FB}`, display: "flex", alignItems: "center", gap: 6 }}>
              <Icon d={I.lock} s={13} c="#fff" /> Non enregistré
            </div>
            <div aria-live="polite" style={{ position: "absolute", left: 12, bottom: 12, background: "rgba(0,0,0,.5)", padding: "6px 11px", borderRadius: RAD.pill, color: "#fff", font: `600 11.5px ${FB}`, display: "flex", alignItems: "center", gap: 7 }}>
              <span aria-hidden style={{ width: 9, height: 9, borderRadius: "50%", background: hearing ? T.accentLt : "rgba(255,255,255,.4)", transition: "background .15s" }} />
              {hearing ? "Le micro vous entend" : "Micro actif"}
            </div>
          </>
        )}
      </div>

      {live && (
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
          {phase === "video" ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <span id="bg-label" style={{ font: `600 12.5px ${FB}`, color: T.navy }}>Fond :</span>
              <div role="radiogroup" aria-labelledby="bg-label" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {opt("none", "Aucun")}{opt("blur", "Flou")}{opt("color", "Couleur unie")}
              </div>
            </div>
          ) : <span style={{ font: `400 12.5px ${FB}`, color: T.muted }}>Idéal pour préparer un entretien téléphonique.</span>}
          <Btn kind="secondary" size="sm" onClick={() => open(phase === "video")}>
            <Icon d={phase === "video" ? I.mic : I.video} s={15} c={T.primary} /> {phase === "video" ? "Passer en voix seule" : "Passer en vidéo"}
          </Btn>
        </div>
      )}
      {phase === "video" && (bgState === "loading" || bgState === "unavailable") && (
        <div role="status" style={{ marginTop: 8, font: `400 12.5px ${FB}`, color: bgState === "unavailable" ? T.errorDk : T.muted }}>
          {bgState === "loading" ? "Préparation du fond sur votre appareil…" : "Le changement de fond n'est pas disponible sur cet appareil."}
        </div>
      )}
      {setModal && (
        <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
          <button type="button" onClick={() => setModal("lifecycle")} style={{ display: "inline-flex", alignItems: "center", gap: 8, font: `600 12.5px ${FB}`, color: T.primary, background: GRAD_SOFT, border: "none", borderRadius: RAD.pill, padding: "9px 16px", cursor: "pointer" }}>
            <Icon d={I.shield} s={15} c={T.primary} /> Que devient ma vidéo ?
          </button>
        </div>
      )}
    </div>
  );
}

