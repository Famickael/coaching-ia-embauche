import React from "react";
import { ON, TY, W, Btn, I } from "./ui.jsx";

/* Écran d'attente du cadre caméra (ARC-11, UI-09), commun à l'enregistreur et à l'échauffement : titre, texte,
   « Activer la caméra » en white sur GRAD_NIGHT (référentiel 5.1), voix seule en ghostDark. */
export default function StageIdle({ title, text, onCamera, onVoice, voiceLabel = "Voix seule", pad = 24 }) {
  return (
    <div className="rs-on-dark" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: pad }}>
      <div style={{ textAlign: "center", color: ON.text, maxWidth: W.narrow, display: "grid", gap: 8 }}>
        <div style={{ ...TY.h3, color: ON.text }}>{title}</div>
        <div style={{ ...TY.small, color: ON.text }}>{text}</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 8 }}>
          <Btn kind="white" onClick={onCamera} icon={I.video}>Activer la caméra</Btn>
          <Btn kind="ghostDark" onClick={onVoice} icon={I.mic}>{voiceLabel}</Btn>
        </div>
      </div>
    </div>
  );
}
