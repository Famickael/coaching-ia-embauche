import React, { useEffect, useRef, useState } from "react";
import { T, GRAD_ACCROCHE, TY, W, HEADER_H, HEADER_H_M } from "../ui.jsx";
import { useReducedMotion } from "../motion.jsx";

/* ─── Grande phrase qui se colore mot par mot au fil du défilement ─── */
/* Deux phrases, une ou deux lignes à l'écran : la mécanique de coloration reste la même (mots-clés en dégradé). */
export const PHRASE = [["Un"], ["entretien,"], ["ça"], ["se"], ["prépare"], ["à", 1], ["voix", 1], ["haute.", 1], ["Entraînez-vous"], ["ici,"], ["en", 1], ["toute", 1], ["confiance.", 1]];

export const PHRASE_SUB = "Répétez, écoutez-vous, recommencez. Votre coach vous aide quand vous le décidez.";

export function Phrase() {
  const reduced = useReducedMotion();
  const sec = useRef(null);
  const [lit, setLit] = useState(reduced ? PHRASE.length + 1 : 0);
  const litRef = useRef(lit);
  useEffect(() => {
    if (reduced) { setLit(PHRASE.length + 1); return; }
    let raf = 0;
    const upd = () => {
      raf = 0;
      const el = sec.current; if (!el) return;
      const hh = window.innerWidth <= 760 ? HEADER_H_M : HEADER_H;
      const r = el.getBoundingClientRect(), range = r.height - (window.innerHeight - hh);
      // la coloration commence quand la phrase arrive au centre et finit avant la fin de la section
      const p = range > 0 ? Math.min(1, Math.max(0, (hh - r.top + window.innerHeight * 0.35) / (range + window.innerHeight * 0.1))) : 1;
      const n = Math.round(p * (PHRASE.length + 1));
      if (n !== litRef.current) { litRef.current = n; setLit(n); } // nouveau rendu seulement au changement de mot (PERF-06)
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(upd); };
    upd();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, [reduced]);

  const text = (
    <div className="rs-pad" style={{ maxWidth: W.page, width: "100%", margin: "0 auto", padding: "0 24px" }}>
      <p className="rs-sr">{PHRASE.map(w => w[0]).join(" ")} {PHRASE_SUB}</p>
      <div aria-hidden style={{ maxWidth: W.wide, display: "grid", gap: 24 }}>
        <div className="rs-phrase-t" style={{ ...TY.display, color: T.navy }}>
          {PHRASE.map(([w, key], i) => {
            const on = i < lit;
            return (
              <React.Fragment key={i}>
                <span className="rs-w" style={on && key
                  ? { background: GRAD_ACCROCHE, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", paddingBottom: ".08em" }
                  : { color: on ? T.navy : T.lineStrong }}>{w}</span>{i < PHRASE.length - 1 ? " " : ""}
              </React.Fragment>
            );
          })}
        </div>
        <div className="ty-lead rs-w" style={{ ...TY.lead, color: lit > PHRASE.length ? T.body : T.lineStrong, maxWidth: 560 }}>{PHRASE_SUB}</div>
      </div>
    </div>
  );
  if (reduced) return <section className="rs-section" style={{ paddingTop: 80 }}>{text}</section>;
  return (
    <section ref={sec} className="rs-phrase" style={{ height: "180vh" }}>
      <div className="rs-phrase-in">{text}</div>
    </section>
  );
}
