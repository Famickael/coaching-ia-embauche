import React, { useEffect, useRef, useState } from "react";
import { T, TY, GAP, Btn, Modal, Toggle, CheckTile, I, RadioGroup } from "./ui.jsx";
import { loadA11y, saveA11y, resetA11y, applyA11y, FONT_LABELS } from "./lib/a11y.js";

/* Options d'accessibilité : fenêtre de réglages (ouverte depuis l'en-tête et le menu mobile),
   et règle de lecture qui suit le pointeur ou le doigt. Ouverture depuis n'importe où : openA11y(). */
const EV = "rp-a11y-open";
export const openA11y = () => window.dispatchEvent(new CustomEvent(EV));

export function useA11y() {
  const [s, setS] = useState(loadA11y);
  useEffect(() => {
    const on = e => setS(e.detail);
    window.addEventListener("rp-a11y", on);
    return () => window.removeEventListener("rp-a11y", on);
  }, []);
  return s;
}

export default function A11yLayer() {
  const [open, setOpen] = useState(false);
  const s = useA11y();
  useEffect(() => {
    const on = () => setOpen(true);
    window.addEventListener(EV, on);
    return () => window.removeEventListener(EV, on);
  }, []);
  // « auto » suit le système en direct
  useEffect(() => {
    if (!window.matchMedia) return;
    const m = window.matchMedia("(prefers-color-scheme: dark)");
    const on = () => applyA11y(loadA11y());
    m.addEventListener?.("change", on);
    return () => m.removeEventListener?.("change", on);
  }, []);
  return (<>
    {open && <A11yDialog s={s} close={() => setOpen(false)} />}
    {s.ruler && <ReadingRuler />}
  </>);
}

function A11yDialog({ s, close }) {
  const set = patch => { const n = { ...s, ...patch }; saveA11y(n); applyA11y(n); };
  const opt = (k, title, text) => (
    <CheckTile on={!!s[k]} onToggle={() => set({ [k]: !s[k] })}>
      <span style={{ ...TY.bodyStrong, color: T.navy }}>{title}</span>
      <span style={{ ...TY.small, color: T.body }}>{text}</span>
    </CheckTile>
  );
  const group = (id, label, children) => (
    <div style={{ display: "grid", gap: 8 }}>
      <span id={id} style={{ ...TY.label, color: T.navy }}>{label}</span>
      <RadioGroup aria-labelledby={id} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{children}</RadioGroup>
    </div>
  );
  return (
    <Modal close={close} title="Options d'accessibilité" sub="Vos réglages restent sur cet appareil." width="read"
      footer={
        <div className="rp-actions" style={{ display: "flex", justifyContent: "space-between", gap: GAP.actions, flexWrap: "wrap" }}>
          <Btn kind="ghost" size="sm" icon={I.redo} onClick={() => applyA11y(resetA11y())}>Réinitialiser</Btn>
          <Btn kind="primary" size="sm" onClick={close}>Fermer</Btn>
        </div>
      }>
      <div style={{ display: "grid", gap: GAP.grid }}>
        {group("a11y-size", "Taille du texte", FONT_LABELS.map((l, i) => <Toggle key={l} on={s.size === i} onClick={() => set({ size: i })}>{l}</Toggle>))}
        {group("a11y-theme", "Thème", [["auto", "Automatique"], ["light", "Clair"], ["dark", "Sombre"]].map(([v, l]) => <Toggle key={v} on={s.theme === v} onClick={() => set({ theme: v })}>{l}</Toggle>))}
        <div role="group" aria-label="Lecture et affichage" style={{ display: "grid", gap: GAP.stack }}>
          {opt("contrast", "Contraste renforcé", "Textes et bordures plus marqués.")}
          {opt("readable", "Police lisible", "Une police conçue pour faciliter la lecture, utile en cas de dyslexie.")}
          {opt("spacing", "Texte espacé", "Plus d'espace entre les lettres, les mots et les lignes. Texte aligné à gauche.")}
          {opt("links", "Liens toujours soulignés", "Les liens se repèrent sans la couleur.")}
          {opt("focusRing", "Focus renforcé", "Un contour plus épais autour de l'élément sélectionné au clavier.")}
          {opt("ruler", "Règle de lecture", "Une bande qui suit le pointeur ou le doigt, pour lire ligne par ligne.")}
        </div>
        <div role="group" aria-label="Mouvement et attention" style={{ display: "grid", gap: GAP.stack }}>
          {opt("motion", "Réduire les animations", "Plus de défilement animé ni de transition. Le réglage de votre appareil est aussi respecté.")}
          {opt("focus", "Mode concentration", "Masque les éléments décoratifs : halos, photos décoratives, cartes animées, défilements automatiques.")}
        </div>
      </div>
    </Modal>
  );
}

/* Règle de lecture : une bande claire, le reste de l'écran légèrement voilé. Suit la souris, le doigt ou le focus. */
function ReadingRuler() {
  const top = useRef(null), bottom = useRef(null);
  useEffect(() => {
    const place = y => {
      const h = 48;
      if (top.current) top.current.style.height = `${Math.max(0, y - h / 2)}px`;
      if (bottom.current) bottom.current.style.top = `${y + h / 2}px`;
    };
    place(window.innerHeight / 2);
    const mv = e => place(e.touches ? e.touches[0].clientY : e.clientY);
    const fc = e => { const r = e.target?.getBoundingClientRect?.(); if (r) place(r.top + r.height / 2); };
    window.addEventListener("pointermove", mv, { passive: true });
    window.addEventListener("touchmove", mv, { passive: true });
    document.addEventListener("focusin", fc);
    return () => { window.removeEventListener("pointermove", mv); window.removeEventListener("touchmove", mv); document.removeEventListener("focusin", fc); };
  }, []);
  return (<>
    <div ref={top} aria-hidden className="rp-ruler" style={{ top: 0 }} />
    <div ref={bottom} aria-hidden className="rp-ruler" style={{ bottom: 0 }} />
  </>);
}
