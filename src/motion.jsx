/* Outils de mouvement : apparition au défilement et respect de « réduire les animations ».
   IntersectionObserver uniquement, aucun écouteur de défilement. */
import React, { useEffect, useRef, useState } from "react";

const hasIO = () => typeof window !== "undefined" && "IntersectionObserver" in window;

export function useReducedMotion() {
  const q = "(prefers-reduced-motion: reduce)";
  const [r, setR] = useState(() => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(q).matches);
  useEffect(() => {
    if (!window.matchMedia) return;
    const m = window.matchMedia(q), on = () => setR(m.matches);
    m.addEventListener ? m.addEventListener("change", on) : m.addListener(on);
    return () => (m.removeEventListener ? m.removeEventListener("change", on) : m.removeListener(on));
  }, []);
  return r || !hasIO();
}

/* Renvoie [ref, visible]. Par défaut, ne se déclenche qu'une fois. */
export function useInView({ rootMargin = "0px 0px -10% 0px", threshold = 0.15, once = true } = {}) {
  const ref = useRef(null);
  const [v, setV] = useState(!hasIO());
  useEffect(() => {
    const el = ref.current;
    if (!el || !hasIO()) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setV(true); if (once) io.disconnect(); }
      else if (!once) setV(false);
    }, { rootMargin, threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, threshold, once]);
  return [ref, v];
}

/* Bloc qui apparaît (fondu et léger glissement) quand il entre dans l'écran. */
export function Reveal({ children, delay = 0, style, className = "" }) {
  const [ref, v] = useInView();
  return <div ref={ref} className={`rv ${v ? "is-in" : ""} ${className}`} style={{ transitionDelay: v ? `${delay}ms` : "0ms", ...style }}>{children}</div>;
}

/* Compteur qui monte de 0 à la valeur cible, une fois, après un délai. */
export function useCount(target, start, delay, reduced) {
  const [n, setN] = useState(reduced ? target : 0);
  useEffect(() => {
    if (!start) return;
    if (reduced) { setN(target); return; }
    let raf, t0;
    const step = t => { t0 = t0 || t; const k = Math.min(1, (t - t0) / 600); setN(Math.round(target * k)); if (k < 1) raf = requestAnimationFrame(step); };
    const to = setTimeout(() => { raf = requestAnimationFrame(step); }, delay);
    return () => { clearTimeout(to); cancelAnimationFrame(raf); };
  }, [start, reduced, target, delay]);
  return n;
}

/* Défile jusqu'à une section de la page (routes du type #/solutions/coachs). */
export function useSectionScroll(section) {
  useEffect(() => {
    if (!section) return;
    const t = setTimeout(() => document.getElementById(section)?.scrollIntoView({ block: "start" }), 60);
    return () => clearTimeout(t);
  }, [section]);
}
