import React, { useEffect, useState } from "react";
import { T, SH } from "../ui.jsx";

/* ─── Héros ─── */

export function useTicker(n, ms, paused) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI(k => (k + 1) % n), ms);
    return () => clearInterval(t);
  }, [n, ms, paused]);
  return [i, setI];
}

/* Lignes d'encart qui apparaissent l'une après l'autre, du bas vers le haut, à chaque arrivée de la scène. */
export const lineStyle = (k, n) => ({ animationDelay: `${0.9 + (n - 1 - k) * 0.28}s` });

export const Pin = ({ ap, s = 14 }) => (
  <span aria-hidden style={{ display: "block", width: s, height: s, borderRadius: "50%", boxSizing: "border-box", background: ap ? T.accent : T.surface, border: ap ? `2px solid ${T.surface}` : `3px solid ${T.violet}`, boxShadow: SH.xs }} />
);
