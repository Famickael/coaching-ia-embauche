import React, { useEffect, useRef, useState } from "react";
import { T, ON, TY, RAD, W, MO, GRAD_NIGHT, ringOf, Btn, Chip, Icon, I } from "./ui.jsx";
import { loadSegmenter, startBackground, BG_COLOR } from "./lib/background.js";
import { PHRASES } from "./content/legal.js";

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
    const dis = bgState === "unavailable" && id !== "none";
    return (
      <Chip key={id} role="radio" check={false} on={bg === id} disabled={dis} onClick={() => applyBg(id)}>
        {id === "color" && <span aria-hidden style={{ width: 12, height: 12, borderRadius: 2, background: BG_COLOR, border: `1px solid ${T.lineStrong}` }} />}
        {label}
      </Chip>
    );
  };
  const pill = { position: "absolute", display: "flex", alignItems: "center", gap: 8, height: 32, padding: "0 12px", borderRadius: RAD.pill, color: ON.text, ...TY.tag };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ position: "relative", borderRadius: RAD.lg, overflow: "hidden", aspectRatio: "16/9", background: GRAD_NIGHT }}>
        <video ref={videoRef} muted playsInline aria-label="Aperçu de votre caméra, non enregistré"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", display: phase === "video" && !showCanvas ? "block" : "none" }} />
        <canvas ref={canvasRef} aria-label="Aperçu avec fond modifié, non enregistré"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", display: showCanvas ? "block" : "none" }} />

        {(phase === "idle" || phase === "error") && (
          <div className="rs-on-dark" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: 20 }}>
            <div style={{ textAlign: "center", color: ON.text, maxWidth: W.narrow, display: "grid", gap: 8 }}>
              <div style={{ ...TY.h3, color: ON.text }}>{phase === "error" ? "Caméra ou micro introuvable" : "Voulez-vous vous voir ?"}</div>
              <div style={{ ...TY.small, color: ON.text }}>{phase === "error" ? error : "Activez la caméra pour vous voir pendant que vous parlez. Ou restez en voix seule."}</div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 8 }}>
                <Btn kind="white" onClick={() => open(false)} icon={I.video}>Activer la caméra</Btn>
                <Btn kind="ghostDark" onClick={() => open(true)} icon={I.mic}>Rester en voix seule</Btn>
              </div>
            </div>
          </div>
        )}

        {phase === "audio" && (
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: ON.text, padding: 16 }}>
            <div style={{ textAlign: "center", display: "grid", justifyItems: "center", gap: 12 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", display: "grid", placeItems: "center", background: ON.chip, boxShadow: hearing ? ringOf(ON.line) : "none", transition: `box-shadow ${MO.base}` }}>
                <Icon d={I.mic} s={40} />
              </div>
              <div style={{ ...TY.label }}>Voix seule · rien n'est enregistré</div>
            </div>
          </div>
        )}

        {live && (
          <>
            <div style={{ ...pill, top: 12, right: 12, background: T.successDk }}>
              <Icon d={I.lock} s={12} /> Non enregistré
            </div>
            <div aria-live="polite" style={{ ...pill, left: 12, bottom: 12, background: ON.scrim }}>
              <span aria-hidden style={{ width: 8, height: 8, borderRadius: "50%", background: hearing ? T.accentLt : ON.line, transition: `background-color ${MO.fast}` }} />
              {hearing ? "Le micro vous entend" : "Micro actif"}
            </div>
          </>
        )}
      </div>

      {live && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
          {phase === "video" ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <span id="bg-label" style={{ ...TY.label, color: T.navy }}>Arrière-plan :</span>
              <div role="radiogroup" aria-labelledby="bg-label" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {opt("none", "Normal")}{opt("blur", "Flou")}{opt("color", "Couleur unie")}
              </div>
            </div>
          ) : <span style={{ ...TY.small, color: T.muted }}>Idéal pour préparer un entretien téléphonique.</span>}
          <Btn kind="secondary" size="sm" onClick={() => open(phase === "video")} icon={phase === "video" ? I.mic : I.video}>
            {phase === "video" ? "Passer en voix seule" : "Passer en vidéo"}
          </Btn>
        </div>
      )}
      {phase === "video" && (bgState === "loading" || bgState === "unavailable") && (
        <div role="status" style={{ ...TY.small, color: bgState === "unavailable" ? T.errorDk : T.muted }}>
          {bgState === "loading" ? "Préparation de l'arrière-plan sur votre appareil…" : "Votre appareil ne permet pas de changer l'arrière-plan."}
        </div>
      )}
      {setModal && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, flexWrap: "wrap", ...TY.caption, color: T.muted }}>
          <Icon d={I.lock} s={16} /> {PHRASES.warmup}
          <Btn kind="ghost" size="sm" icon={I.shield} onClick={() => setModal("video")}>Que devient ma vidéo ?</Btn>
        </div>
      )}
    </div>
  );
}
