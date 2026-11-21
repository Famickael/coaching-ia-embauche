/* Page d'accueil (ARC-10) : héros, phrase, strate « un seul dispositif », outils, parti pris, portes d'entrée, bandeau final.
   Un fichier par section dans ce dossier. */
import React, { useEffect, useRef } from "react";
import { W } from "../ui.jsx";
import { useReducedMotion } from "../motion.jsx";
import { Hero } from "./Hero.jsx";
import { Strate } from "./Strate.jsx";
import { Phrase } from "./Phrase.jsx";
import { Features, ForWho, NotDo } from "./Features.jsx";
import { FinalBand } from "./FinalBand.jsx";

/* Page d'accueil : héros (accroche qui change, scènes en boucle), strate épinglée en quatre étapes,
   parti pris, portes d'entrée, bandeau final. Le détail par public est sur la page Solutions. */

export default function Home({ go, openSpace }) {
  return (
    <main className="rs-home" style={{ position: "relative", isolation: "isolate" }}>
      <MouseGlow />
      <Hero go={go} />
      <Phrase />
      <Strate />
      <div className="rs-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: "0 24px" }}>
        <Features />
        <NotDo />
        <ForWho go={go} />
        <FinalBand openSpace={openSpace} go={go} />
      </div>
    </main>
  );
}

/* Fond de l'accueil : un seul calque fixe derrière toutes les sections (aucun fond de section), donc sans rupture
   entre le héros, la phrase et la strate. Dégradé violet et bleu qui suit la souris ; sur tactile, lente dérive autonome
   (CSS), léger déplacement au défilement et au doigt, avec lissage. Il s'efface en douceur avant le pied de page (--fy).
   Fixe en mouvement réduit, masqué en mode concentration. Aucun capteur d'orientation. */
export function MouseGlow() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let px = 0.72, py = 0.18, x = px, y = py, sy = 0, raf = 0;
    /* Position du pied de page mémorisée (PERF-05) : relue au redimensionnement seulement, pas à chaque image. */
    let footTop = null;
    const measure = () => { const f = document.querySelector("footer"); footTop = f ? f.getBoundingClientRect().top + window.scrollY : null; };
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => { measure(); paint(); }) : null;
    ro?.observe(document.body);
    const paint = () => {
      el.style.setProperty("--fy", `${Math.round(footTop != null ? footTop - window.scrollY : window.innerHeight * 2)}px`);
      el.style.setProperty("--mx", `${(x * 100).toFixed(2)}%`); el.style.setProperty("--my", `${((y + sy) * 100).toFixed(2)}%`);
    };
    const target = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      return reduced ? 0 : (window.scrollY / max - 0.5) * 0.24;   // défilement : le dégradé glisse doucement
    };
    let ts = target(); sy = ts;
    const tick = () => {
      x += (px - x) * 0.08; y += (py - y) * 0.08; sy += (ts - sy) * 0.08;
      paint();
      raf = Math.abs(px - x) + Math.abs(py - y) + Math.abs(ts - sy) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    paint();
    const onScroll = () => { ts = target(); if (reduced) paint(); else kick(); };
    const onResize = () => { measure(); paint(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    if (reduced) return () => { ro?.disconnect(); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize); };
    const mv = e => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX / window.innerWidth; py = e.clientY / window.innerHeight; kick();
    };
    /* Doigt : amplitude réduite de moitié autour de la position de repos. */
    const tm = e => {
      const t = e.touches[0]; if (!t) return;
      px = 0.72 + (t.clientX / window.innerWidth - 0.72) * 0.5; py = 0.18 + (t.clientY / window.innerHeight - 0.18) * 0.5; kick();
    };
    window.addEventListener("pointermove", mv, { passive: true });
    /* Téléphone (sous 760 px) : pas de suivi du doigt, seule la dérive au défilement reste (PERF-05). */
    if (window.innerWidth > 760) window.addEventListener("touchmove", tm, { passive: true });
    return () => {
      ro?.disconnect();
      window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", mv); window.removeEventListener("touchmove", tm); cancelAnimationFrame(raf);
    };
  }, [reduced]);
  return <div ref={ref} aria-hidden className="rs-glow rp-deco"><i /></div>;
}
