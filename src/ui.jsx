import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  T, ON, GLOW, GRAD, GRAD_MAIN, GRAD_COACH, GRAD_AI, GRAD_SOFT, GRAD_PAGE, FD, FB, FM, TY, PAD, PAD_MOBILE, GAP, W, RAD, SH, MO, Z,
  TONE, HEADER_H, HEADER_H_M, TY_MOBILE, GRAD_AI_BORDER, FONT_STACKS, MASK, GRAD_LOGO, FADE_FOOT,
} from "./tokens.js";
import { Reveal } from "./motion.jsx";
import { clock } from "./lib/format.js";

/* Composants de base de La Répét' (référentiel UI/UX v3, docs/design-system.md).
   Les jetons viennent de src/tokens.js et sont réexportés ici : les écrans n'importent que depuis ui.jsx.
   Aucune valeur de couleur n'est écrite dans ce fichier (règle X2 de tests/design-lint.mjs). */
export * from "./tokens.js";

/* ─── LOGOS ───
   Logo officiel découpé en masques (canal alpha des images fournies : tracé, anticrénelage et barre du « t » conservés).
   Les couleurs viennent des jetons : symbole en GRAD_LOGO (bleu clair vers violet), points et mot-symbole en navy,
   accents des « é » en violet. En thème sombre, les mêmes jetons donnent la variante claire, sans image à part. */
const LOGO_BUBBLES = "data:image/png;base64,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";
const LOGO_DOTS = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAACrCAQAAACJMRvhAAAFUUlEQVR42u2dz2tcVRiGn3NufjTRNrYomuJO20KDIAgFN1KQ4kbFZReu/AvEhbgUdCH+Aa6qCxdd6Eaoq6ogWgUraIpooVTUVkub2qptmtp07n1dJE3mzkzScZLMPXfmfWc3Odzc8z33/c73nXtnJggrJUWHwEAsAzEQy0AMxDIQA7EMxEAsA7EMxEAGTsFA0pIMxCnL6cNAEk4fVcQw+I6hHWIZiIH4jL2G2CFV6N6B3w6wQ+wQR9gOsUMsAzEQy0AMxDIQA7EMxDIQA7EMxEAsAzEQy0AMxDIQq29AQtuxRxzoroPnW7iD6hAnv2TCuJSiCgczFSAaMH+E+gJZPfVB8kf/l9WR1Vh6UXcf4rRlIOmnrVH3IQOUsqJj5E7d9NOqzofHJV7Uu1N/+qzQLZBAWh/VH+DaLnY70GrqqitPWZk5rKjhKsvVg1WJAhAMJB1lgJyyapWyggPU70LHDvGibhmIgWxJSWgglal9e0IGUqUatYnfjmEAEmuUohZc9jplWdUCCb4kKi0nnbKcsiwDMRBrE3rikHw/HJe79vXPMxAIqKtxsLFHfOJmPyC0uqinjqP5/NZ7LKk8rptRSc2931VWpOh5+hPM8DCLnOXMGkFcem+a/ezgKj9xeZ1gR/bxCBnn+JHFhJCoLq8DOq4rmtd1/aF3tFsodBg1qVd0Vv/ohv7SD3pJox3GBKE9el+XdF3zmtMxPS4U05hnv/9hL9MOynRYl9WsL7SvDUnQgzqist7WPR3O4EnNlkad0/OKHQEPPJCRHnAEzei0pMZy+Arlkt5TLCHJhF5WQ7ny5XG5Cl3T4dJlEBW0Ux9Luq1iZZx0So+m4ZB+lr0ZvWysZ4hD7EUrjxUsVUfPchCa3ivYxXNkTXOKwHZeZBw1bQiJFzhEg6zpGyfEXp4hiSc0+wkk76m2KgjMEFuqooL7ebqp1gqIx5gphX4p/DPsb4IkMp5grG3cOAdIYtO/Do3hGLvaeoqCwO6WzdD7mFzpLVbRTTJdqsImmGrDAYEpqr4vmZWBpPlAtQjc4gKh5dKJiPMtRe2fXOvQ5t3g99LRFrhC6NDOXarcIXkZSJ6oPwTMsljyiAhc5LOma1pEvmO25SoX8D2niSuzCxR8w01GSkjEAl+RxJ379FOWgE84SaRBgRA5BYGjfNkUaAE3Oco8I8vjCnIicxzhdovjPuIDIjn58tEaRE5yPJGLcqXgmkq6LTyoX0qdwzFNd+hDJvSmFptGzes1ZR16nz36tHS0n/XUGo1m31/Z63fI3EraJ79ygsgEo1zjFO/yBhc6jGrwNb+RsY3bnOdz3uIIeVsiClzhBP8yzhgLnOFDXuXbYd3L2sjW4ii72UmDOebW3RDczjTbmOciC+vueT3EA8BVLqCed21HSwlxiICUN7rjmpvmoVRBxTW34Mt/6RVHYIq/hxXI6n2Ou90RudOLdDfq7vdXnLJqc4FoKxKBtZGC3ECScccWxW71oDsc5f/pji35ug2vIckVk5aBWAZiIFYdgBi/qyw7xDKQvvbnBpJYf24gw+ALA0nMFwaSrPeqBRLtPfchtSt7dw7uglmHZqPVIdG/tlbxsuKU5U59PVX1DP64HWK58CSQ/A8L2CF2iNUbkLFaJyaXvYkBkYFYW76GhIGdmR1iucoyEMtADKT2s5wYjEXdd0m6Bb/hD5AOS5VVm0tqWNaQzcaRGUhayrcqdsPXGMZkXLZJQELHr/+y7BAb2KuPHWKHWAZiGYiBWAZiIJaBGIhlIAZiGYhlIAZiGYiBWAZiIJaBGIhlIJaBGIhlIAZiGYiBWAZiIJaBWMB/+Yt8ZdFiEXQAAAAASUVORK5CYII=";
const LOGO_ACCENTS = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAXwAAAC9CAQAAAAaLQ7kAAAFPklEQVR42u3bT4icZx3A8e/MTqymSW0jilqK/8BSgygIvVghWETEU1sigiQ5iEjQQ7U9VcEIQiktGBGMiqAItqUqoqAgFUVBGhBBq5BKiqCWSo3Fxogk2Zl5PWSz2d3uhN46Np8P5LK7h+R5v/m9z/NMMhqCK8/YEiB8ED4IH4QPwgfhg/BB+CB8ED4IH4QPwgfhg/BB+CB8ED4IH+GD8EH4IHwQPggfhA/CB+GD8EH4IHwQPggfhA/CB+GD8EH4IHyED8IH4YPwQfggfBA+CB+ED8IH4YPwQfggfBA+CB+ED8IH4YPwET4IH4QPwgfhg/BB+CB8ED4IH4QPwgfhg/BB+CB8ED4IH4QPwkf4IHwQPggfXhImV/iff7T2a9jwtaEabfoKL3Q1/29WbeT5LrC7t7Vn7Z042vR+HDVqaNypft8ZC7Vh9zDvtd3YzkaN1tes9TUcNzTviU4uw1+Piee17eR6TYe7oz2NN4V/8YGOmnV1P+ou4W/K/uYO956ursabwh81rsbNWu0LPSn8ZbWzg93TjoXfHxp1ql/0d1uiDdm/oSN94DI/M2/U7/ptc3v8ZX2IN3e4lVZbWbCPnXe2b/adBuGvr8ruPtF7m7b9hcmoefVMD3Tc4XZZvaXP9KamCyf+vEm/7hv9p0lTy1VNmrav27uq+cJ7wqEz3df3l2VUuM7cale3d2vnFo6EeSs93gOdbEX269P89R3qjZfJftq0BzvWuWV5Qwp/8yOc9PYOtXqZaT/qZEf6WSvNLNhaQyt9tPdvucnZOOunTfpVX2p1wU8I/0U29Mo+1U1rtxDbZT/u2Y724ybLcURbioJmfbCPtathYfgr/akjPVnLcyKyx99oZ3e0v9UFqzI0atoPerCpQ+2Gwfm6DnZD822vAmpo1j/6bI8t15qZ+Jes9M4+3XzLHfRGs37S/T3XyDZnw/7+tm5pvnDan+9cX+uHjZdrVAj/0iPc08FubFgwuWaNerz7O9lE9uujYta+PtmrF+7vZ13Vw3292bJtDYV/adP3vj608IU9b6W/dbTHXGFuaGfohu7spmYLsp829Gj39szynYiEf3F2vbV7um7B63ho1HMd67sNDrUb7Gh/ty7c5swbOtHn+vMyVib8C67p4+1tuu28H6qzPdJXO7f2CSQX/pHC3va3q2HbiobmDR3rN8t5EeBWp0a9on19eGH2Q3W8o/3LNmfDmg1d26He1WzB8Jx1vq/00LKumPBraFd39ara9pU9NO5En++ET2o3hT/qQAeaLLi9P1c90n2dXtaLX1udUbs73LsXvLBr3F+6t1/6pHbLNucdfaTrFsz7aS/reF/sn8t2iWnibwz/lu7sfONtwh6qM327h11hblmXa7qtvZ3ddhxMm/TXHuiPy3wiutLDn/Tm7u7ay/zEo33ZJ7XPC39fB9q14LsrPdvd/XTtdCT8JX2E9e/+sPaItj6o0/28b3Wqsbuc5x1dn+6/ra4f/i/9z4Shp3qo7y04MS3Pi/6KH2Q7ur7d68lvXo6zPdU52W9jV9f38uZduK2/GP6F+E/3dEv/H8+F/0IOcrz0jnbC58qcZyB8ED4IH4QPwgfhg/BB+CB8ED4IH4QPwgfhg/BB+CB8ED4IH+GD8EH4IHwQPggfhA/CB+GD8EH4IHwQPggfhA/CB+GD8EH4IHyED8IH4YPwQfggfBA+CB+ED8IH4YPwQfggfBA+CB+ED8LnRTBZ9t/gaPCQMPFB+CB8ED4IH4QPwgfhg/BB+CB8ED4IH4QPwgfhg/BB+CB8hA/ChyvB/wA+mRtgiUkdLQAAAABJRU5ErkJggg==";
const LOGO_LETTERS = "data:image/png;base64,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";
const LOGO_SYM_RATIO = "200 / 171", LOGO_WORD_RATIO = "380 / 189";

/* Une couche du logo : la forme vient du masque, la couleur du fond (jeton ou dégradé). */
function LogoLayer({ src, bg }) {
  const m = `url("${src}")`;
  return <span aria-hidden className="rp-logo-layer" style={{ position: "absolute", inset: 0, background: bg, WebkitMaskImage: m, maskImage: m, WebkitMaskSize: "100% 100%", maskSize: "100% 100%", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat" }} />;
}

/* Symbole bulles La Répét'. white : tout en blanc, sur un dégradé de marque sombre. */
function RepetMark({ s = 36, white = false, height }) {
  return (
    <span aria-hidden className="rp-logo-sym" style={{ position: "relative", display: "block", flexShrink: 0, aspectRatio: LOGO_SYM_RATIO, ...(height ? { height } : { width: s }) }}>
      <LogoLayer src={LOGO_BUBBLES} bg={white ? ON.text : GRAD_LOGO} />
      <LogoLayer src={LOGO_DOTS} bg={white ? ON.text : T.navy} />
    </span>
  );
}

/* Mot-symbole « La Répét' » : lettres en navy, accents en violet (blanc sur un dégradé de marque sombre). */
function RepetWord({ height, dark = false }) {
  return (
    <span role="img" aria-label="La Répét'" className="rp-logo-word" style={{ position: "relative", display: "block", flexShrink: 0, height, aspectRatio: LOGO_WORD_RATIO }}>
      <LogoLayer src={LOGO_LETTERS} bg={dark ? ON.text : T.navy} />
      <LogoLayer src={LOGO_ACCENTS} bg={dark ? ON.text : T.violet} />
    </span>
  );
}

/* Logo complet La Répét' : symbole + mot-symbole. Tailles calculées à partir de s (exception X1). */
function RepetLogo({ s = 22, dark = false, tagline = true }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: s * 0.5 }}>
      <RepetMark height={s * 2.1} white={dark} />
      <div style={{ display: "flex", flexDirection: "column", gap: tagline ? 2 : 0 }}>
        <RepetWord height={s * 2.0} dark={dark} />
        {tagline && <div style={{ font: `400 ${s * 0.44}px ${FB}`, color: dark ? ON.text : T.muted }}>S'entraîner à l'entretien</div>}
      </div>
    </div>
  );
}

/* Emplacement du logo de l'organisme qui déploie l'outil (marque blanche).
   Tant qu'aucune image n'est fournie (ORG_LOGO_URL), un nom dans un cadre en pointillés
   signale l'emplacement (rendu validé par le propriétaire). */
const ORG_NAME = "Famickael";
const ORG_LOGO_URL = null;
function OrgLogo({ s = 10, dark = false }) {
  if (ORG_LOGO_URL) return <img src={ORG_LOGO_URL} alt={ORG_NAME} style={{ height: s * 3.2, width: "auto", display: "block" }} />;
  return (
    <div aria-label={ORG_NAME} role="img" style={{ height: s * 3.2, padding: "0 12px", border: `1.5px dashed ${dark ? ON.line : T.faint}`, borderRadius: RAD.sm, display: "inline-flex", alignItems: "center", flexShrink: 0 }}>
      <span aria-hidden style={{ font: `700 ${s * 1.4}px ${FD}`, color: dark ? ON.text : T.primary, letterSpacing: "-.01em" }}>{ORG_NAME}</span>
    </div>
  );
}

/* Halo lumineux décoratif. Dégradé radial plutôt qu'un flou (filter: blur coûte cher au défilement sur iPhone). */
function Halo({ style }) {
  const { background, ...rest } = style || {};
  return <div aria-hidden className="rp-deco" style={{ position: "absolute", borderRadius: "50%", pointerEvents: "none", background: `radial-gradient(closest-side, ${background}, transparent)`, ...rest }} />;
}

/* Blocage du défilement de la page (menu mobile, fenêtres) : html porte overflow-y:scroll, donc bloquer
   seulement body ne suffit pas. Compteur pour les ouvertures imbriquées ; renvoie la fonction de déblocage. */
let scrollLocks = 0;
function lockScroll() {
  scrollLocks += 1;
  document.documentElement.classList.add("rp-lock");
  let done = false;
  return () => { if (done) return; done = true; scrollLocks = Math.max(0, scrollLocks - 1); if (!scrollLocks) document.documentElement.classList.remove("rp-lock"); };
}

/* Chemin d'une image du dossier public/ (le site est servi sous un sous-dossier). */
const img = p => `${import.meta.env.BASE_URL}img/${p}`;

/* ─── ICÔNES ─── */

/* Icône au trait (référentiel 5.10) : décorative par défaut (aria-hidden), title facultatif. */
function Icon({ d, s = 20, c = "currentColor", sw = 2, title }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden={title ? undefined : true} role={title ? "img" : undefined} focusable="false" style={{ flexShrink: 0 }}>
      {title && <title>{title}</title>}{d}
    </svg>
  );
}
const I = {
  lock: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  sparkle: <><path d="M12 3v18M3 12h18" /><path d="M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" /></>,
  play: <polygon points="6 3 20 12 6 21 6 3" />,
  stop: <rect x="6" y="6" width="12" height="12" rx="1" />,
  rec: <circle cx="12" cy="12" r="6" />,
  check: <polyline points="20 6 9 17 4 12" />,
  arrow: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
  arrowUp: <><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></>,
  arrowL: <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>,
  redo: <><polyline points="1 4 1 10 7 10" /><path d="M3.5 15a9 9 0 1 0 2.1-9.4L1 10" /></>,
  user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  send: <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>,
  trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></>,
  copy: <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
  plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
  pause: <><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></>,
  print: <><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></>,
  note: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
  search: <><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></>,
  ban: <><circle cx="12" cy="12" r="9" /><line x1="5.6" y1="5.6" x2="18.4" y2="18.4" /></>,
  mic: <><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0M12 17v5" /></>,
  info: <><circle cx="12" cy="12" r="9" /><line x1="12" y1="11" x2="12" y2="16.5" /><line x1="12" y1="7.6" x2="12.01" y2="7.6" /></>,
  shuffle: <><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" /></>,
  video: <><rect x="2" y="6" width="14" height="12" rx="2" /><polygon points="22 8 16 12 22 16 22 8" /></>,
  chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12z" />,
  close: <><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></>,
  bulb: <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" /></>,
  menu: <><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></>,
  chevron: <polyline points="6 9 12 15 18 9" />,
  chevronR: <polyline points="9 6 15 12 9 18" />,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>,
  building: <><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" /></>,
  users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" /></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="22 6 12 13 2 6" /></>,
  server: <><rect x="2" y="3" width="20" height="8" rx="2" /><rect x="2" y="13" width="20" height="8" rx="2" /><line x1="6" y1="7" x2="6.01" y2="7" /><line x1="6" y1="17" x2="6.01" y2="17" /></>,
  scale: <><path d="M12 3v18M5 21h14" /><path d="M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  layers: <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>,
  quote: <><path d="M7 7h4v4c0 3-2 5-4 6M15 7h4v4c0 3-2 5-4 6" /></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z" />,
  monitor: <><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><polygon points="16 8 14 14 8 16 10 10 16 8" /></>,
  a11y: <><circle cx="12" cy="4.5" r="2" /><path d="M5 8.5l7 1.5 7-1.5M12 10v4.5M9 21l3-6.5 3 6.5" /></>,
  volume: <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" /></>,
  volumeOff: <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="22" y1="9" x2="16" y2="15" /><line x1="16" y1="9" x2="22" y2="15" /></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
  more: <><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></>,
  list: <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>,
};
/* Ancien nom des icônes des pages publiques, conservé comme alias de I (même objet). */
const SI = I;

/* ─── TEXTE ─── */

/* Texte typé : <Txt v="h1" as="h2">. Le style vient de TY[v], la balise de as ; la classe ty-{v} applique la taille mobile. */
function Txt({ v = "body", as: As = "p", color, style, className, children, ...rest }) {
  return <As className={[`ty-${v}`, className].filter(Boolean).join(" ")} style={{ ...TY[v], color, margin: 0, ...style }} {...rest}>{children}</As>;
}

/* Surtitre (TY.overline), 4 mots au plus. */
const Eyebrow = ({ children, c = T.primary, style }) => <div style={{ ...TY.overline, color: c, ...style }}>{children}</div>;

/* ─── BOUTONS ─── */

/* Bouton nu : un vrai <button> sans style, pour les éléments cliquables qui ne sont pas des boutons visuels
   (option, repère, onglet, case). Les écrans n'écrivent jamais <button> eux-mêmes (règle K1). */
const Bare = React.forwardRef(function Bare({ type = "button", style, children, ...rest }, ref) {
  return <button ref={ref} type={type} style={{ background: "none", border: "none", padding: 0, margin: 0, cursor: "pointer", color: "inherit", ...TY.inherit, textAlign: "inherit", ...style }} {...rest}>{children}</button>;
});

const BTN_SIZE = {
  sm: { h: 40, px: 16, ty: TY.btnSm, ic: 16 },
  md: { h: 48, px: 24, ty: TY.btn, ic: 16 },
  lg: { h: 56, px: 32, ty: TY.btnLg, ic: 20 },
};
/* Bouton (référentiel 5.1). kind : objective (une seule action principale par écran), ai, primary, secondary,
   ghost, danger, white, ghostDark. Icônes par icon (à gauche) et iconRight (flèche de progression). as="span" :
   aspect de bouton sans interaction (à l'intérieur d'une carte cliquable). */
const Btn = React.forwardRef(function Btn({ children, onClick, kind = "primary", size = "md", disabled, full, icon, iconRight, as, type, className, style, ...rest }, ref) {
  const [hov, setHov] = useState(false);
  const h = hov && !disabled;
  const sh = SH.btn[kind];
  const k = {
    primary: { background: h ? T.primaryDk : T.primary, color: T.surface, border: "none" },
    objective: { background: h ? T.accentDk : T.accent, color: T.surface, border: "none" },
    ai: { background: GRAD_AI, color: T.surface, border: "none" },
    white: { background: T.surface, color: h ? T.primaryDk : T.primary, border: "none" },
    secondary: { background: T.surface, color: T.primary, border: `1.5px solid ${h ? T.primary : T.primaryLt}` },
    ghost: { background: h ? T.primaryBg : "transparent", color: T.primary, border: "none" },
    danger: { background: h ? T.errorBg : "transparent", color: T.errorDk, border: "none" },
    dangerSolid: { background: T.errorDk, color: T.surface, border: "none" }, // confirmation d'une suppression (A11Y-17)
    ghostDark: { background: ON.chip, color: ON.text, border: `1px solid ${ON.line}` },
  }[kind] || {};
  const sz = BTN_SIZE[size] || BTN_SIZE.md;
  const st = {
    ...sz.ty, lineHeight: 1.25, minHeight: sz.h, padding: `8px ${sz.px}px`, borderRadius: RAD.md, cursor: disabled ? "not-allowed" : "pointer",
    transition: `background-color ${MO.fast} ${MO.ease}, border-color ${MO.fast} ${MO.ease}, color ${MO.fast} ${MO.ease}, box-shadow ${MO.base} ${MO.ease}, transform ${MO.base} ${MO.ease}`,
    width: full ? "100%" : "auto", transform: h && sh ? "translateY(-1px)" : "none", boxShadow: sh ? sh[h ? 1 : 0] : "none",
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, textAlign: "center", flexShrink: 0, maxWidth: "100%", textDecoration: "none",
    ...k, ...(disabled ? { background: T.line, color: T.muted, border: "none", boxShadow: "none", transform: "none" } : {}), ...style,
  };
  const content = <>{icon && <Icon d={icon} s={sz.ic} />}{children}{iconRight && <Icon d={iconRight} s={sz.ic} />}</>;
  const cls = [`rp-btn rp-btn-${size}`, className].filter(Boolean).join(" ");
  if (as === "span") return <span className={cls} style={st} aria-hidden={rest["aria-hidden"]}>{content}</span>;
  return (
    <button ref={ref} type={type} onClick={disabled ? undefined : onClick} disabled={disabled} className={cls}
      onMouseEnter={() => !disabled && setHov(true)} onMouseLeave={() => setHov(false)} style={st} {...rest}>
      {content}
    </button>
  );
});

/* Bouton icône seul (référentiel 5.1) : 44 × 44, rond, aria-label obligatoire.
   variant : outline (bordure, fond blanc), plain (transparent), dark (sur fond sombre). */
const IconBtn = React.forwardRef(function IconBtn({ icon, label, onClick, variant = "plain", tone = "primary", size = 20, className, style, ...rest }, ref) {
  const color = variant === "dark" ? ON.text : tone === "muted" ? T.muted : T.primary;
  return (
    <button ref={ref} type="button" aria-label={label} title={label} onClick={onClick}
      className={[`rp-icbtn rp-icbtn-${variant}`, className].filter(Boolean).join(" ")} style={{ color, ...style }} {...rest}>
      <Icon d={icon} s={size} />
    </button>
  );
});

/* Bouton flottant de l'assistant (56 × 56, dégradé IA) : aria-label obligatoire. */
const Fab = React.forwardRef(function Fab({ icon, label, className, ...rest }, ref) {
  return <button ref={ref} type="button" aria-label={label} title={label} className={["rp-ai-fab", className].filter(Boolean).join(" ")} {...rest}><Icon d={icon} s={24} /></button>;
});

/* Lien (référentiel 5.2) : souligné, primary, taille héritée. href → <a>, sinon bouton. */
function Link({ href, onClick, onDark, children, style, className, ...rest }) {
  const st = { ...TY.link, color: onDark ? ON.text : T.primary, ...style };
  const cls = ["rp-link", className].filter(Boolean).join(" ");
  if (href) return <a href={href} onClick={onClick} className={cls} style={st} {...rest}>{children}</a>;
  return <Bare onClick={onClick} className={cls} style={st} {...rest}>{children}</Bare>;
}

/* Retour (référentiel 5.2) : TY.body en muted, flèche à gauche, zone tactile 44. */
const Back = ({ onClick, children = "Retour" }) => (
  <Bare onClick={onClick} className="rp-back" style={{ ...TY.body, color: T.muted, minHeight: 44, display: "inline-flex", alignItems: "center", gap: 8 }}>
    <Icon d={I.arrowL} s={16} />{children}
  </Bare>
);

/* ─── ÉTIQUETTES, CARTES, MESSAGES ─── */

/* Étiquette (référentiel 5.4) : hauteur 24, non cliquable. */
function Tag({ children, tone = "primary", icon }) {
  const t = TONE[tone] || TONE.primary;
  return (
    <span style={{ ...TY.tag, color: t.fg, background: t.bg, minHeight: 24, padding: "2px 12px", borderRadius: RAD.pill, display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "normal", maxWidth: "100%" }}>
      {icon && <Icon d={icon} s={12} />}{children}
    </span>
  );
}

/* Carte (référentiel 5.5). pad : none | sm | md | lg (mobile : classes rp-pad-*). level 2 : carte principale.
   topbar : true (bénéficiaire), "coach", "ai". Cliquable (onClick) : rendue en <button>. */
function Card({ children, style, pad = "md", level = 1, hover, onClick, topbar, className, label, as }) {
  const [h, setH] = useState(false);
  const lift = (hover || onClick) && h;
  const st = {
    position: "relative", display: "block", width: onClick ? "100%" : undefined, textAlign: onClick ? "left" : undefined,
    background: T.surface, border: `1px solid ${T.line}`, borderRadius: pad === "sm" ? RAD.md : RAD.lg, padding: PAD[pad] ?? 0,
    boxShadow: lift ? SH.lg : level === 2 ? SH.sm : SH.xs, transition: `box-shadow ${MO.base} ${MO.ease}, transform ${MO.base} ${MO.ease}, border-color ${MO.fast}`,
    transform: lift ? "translateY(-2px)" : "none", cursor: onClick ? "pointer" : undefined,
    overflow: pad === "none" ? "hidden" : undefined, color: "inherit", ...TY.inherit, ...style,
  };
  /* Bordure haute en dégradé : pseudo-élément qui épouse l'arrondi (référentiel 5.5). */
  const tb = topbar && `rp-tb rp-tb-${topbar === "coach" ? "coach" : topbar === "ai" ? "ai" : "main"}`;
  const cls = [pad !== "none" && `rp-pad-${pad}`, tb, className].filter(Boolean).join(" ");
  const bar = null;
  const hv = { onMouseEnter: () => setH(true), onMouseLeave: () => setH(false) };
  if (onClick) return <button type="button" onClick={onClick} aria-label={label} className={cls} style={st} {...hv}>{bar}{children}</button>;
  const As = as || "div";
  return <As className={cls || undefined} style={st} {...(hover ? hv : {})}>{bar}{children}</As>;
}

/* Message (référentiel 5.8). tone : info, success, warning, error, ai. */
const NOTICE = {
  info: { bg: T.primaryBg, ic: T.primary, fg: T.navy, icon: I.info },
  success: { bg: T.successBg, ic: T.successDk, fg: T.navy, icon: I.check, role: "status" },
  warning: { bg: T.warningBg, ic: T.warningDk, fg: T.warningDk, icon: I.info, role: "status" },
  error: { bg: T.errorBg, ic: T.errorDk, fg: T.errorDk, icon: I.ban, role: "alert" },
  ai: { bg: T.violetBg, ic: T.violet, fg: T.navy, icon: I.sparkle },
};
function Notice({ tone = "info", icon, children, style, role, ...rest }) {
  const n = NOTICE[tone] || NOTICE.info;
  return (
    <div role={role === undefined ? n.role : role || undefined} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: n.bg, borderRadius: RAD.md, padding: PAD.notice, ...TY.small, color: n.fg, ...style }} {...rest}>
      <span style={{ display: "inline-flex", marginTop: 2, color: n.ic }}><Icon d={icon || n.icon} s={16} /></span>
      <div style={{ minWidth: 0, flex: 1 }}>{children}</div>
    </div>
  );
}

/* Commentaire du coach (référentiel 5.8, cas nommé) : fond primaryBg, filet gauche 3 px primary.
   size="lg" : message d'introduction du coach en tête du rapport (UI-08). */
const Quote = ({ children, icon = I.note, style, size }) => (
  <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: T.primaryBg, borderLeft: `3px solid ${T.primary}`, borderRadius: RAD.xs, padding: size === "lg" ? "16px 20px" : "8px 12px", ...(size === "lg" ? TY.bodyLg : TY.small), color: T.navy, ...style }}>
    {icon && <span style={{ display: "inline-flex", marginTop: 2, color: T.primary }}><Icon d={icon} s={16} /></span>}
    <div style={{ minWidth: 0, flex: 1 }}>{children}</div>
  </div>
);

/* Pastille d'icône (référentiel 5.10) : 40, RAD.sm, fond primaryBg. */
const IconTile = ({ icon, c = T.primary, bg = T.primaryBg, s = 40, round }) => (
  <div aria-hidden style={{ width: s, height: s, borderRadius: round ? "50%" : RAD.sm, background: bg, display: "grid", placeItems: "center", flexShrink: 0, color: c }}>
    <Icon d={icon} s={s >= 48 ? 24 : 20} />
  </div>
);

/* État vide (référentiel 5.9). */
const Empty = ({ icon = I.info, title, text, action }) => (
  <Card pad="lg" style={{ textAlign: "center", display: "grid", justifyItems: "center", gap: 8 }}>
    <IconTile icon={icon} s={48} />
    {title && <Txt v="h3" as="h3" color={T.navy} style={{ marginTop: 8 }}>{title}</Txt>}
    {text && <Txt v="body" color={T.body} style={{ maxWidth: 480 }}>{text}</Txt>}
    {action && <div style={{ marginTop: 8 }}>{action}</div>}
  </Card>
);

/* Rond de confirmation (référentiel 5.10) : 56, fond successBg, coche 28 successDk. */
const ConfirmMark = () => (
  <div aria-hidden style={{ width: 56, height: 56, borderRadius: "50%", background: T.successBg, display: "grid", placeItems: "center", color: T.successDk, flexShrink: 0 }}><Icon d={I.check} s={28} /></div>
);
/* Écran de confirmation : rond, titre, texte, actions, centrés. */
function Confirm({ title, as = "h1", children, actions, width = W.form, level = 2 }) {
  return (
    <Card pad="lg" level={level} style={{ maxWidth: width, margin: "0 auto", textAlign: "center", display: "grid", justifyItems: "center", gap: 16 }}>
      <ConfirmMark />
      <div style={{ display: "grid", gap: 8, justifyItems: "center" }}>
        <Txt v="h1" as={as} color={T.navy}>{title}</Txt>
        {children && <div style={{ ...TY.body, color: T.body, maxWidth: 440 }}>{children}</div>}
      </div>
      {actions && <div className="rp-actions" style={{ display: "flex", gap: GAP.actions, justifyContent: "center", flexWrap: "wrap", marginTop: 8 }}>{actions}</div>}
    </Card>
  );
}

/* Pastille horaire (référentiel 5.10) : hauteur 24, TY.time, fond de la couleur du rôle, texte blanc.
   Cliquable : zone tactile 44 par un padding transparent. */
const fmtTime = clock; // src/lib/format.js
const TIME_BG = { appui: T.accent, ai: T.violet, primary: T.primary };
function TimeChip({ t, tone = "primary", onClick, label }) {
  const chip = (
    <span style={{ ...TY.time, height: 24, minWidth: 40, padding: "0 8px", borderRadius: RAD.pill, background: TIME_BG[tone] || T.primary, color: T.surface, display: "inline-grid", placeItems: "center", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
      {typeof t === "number" ? fmtTime(t) : t}
    </span>
  );
  if (!onClick) return chip;
  return <Bare onClick={onClick} aria-label={label} style={{ minHeight: 44, display: "inline-flex", alignItems: "center", flexShrink: 0 }}>{chip}</Bare>;
}

/* ─── CHAMPS ─── */

/* Champ (référentiel 5.3) : libellé, aide reliée, message d'erreur annoncé. */
function Field({ id, label, hint, error, children, srLabel }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "grid", gap: 4 }}>
        <label htmlFor={id} className={srLabel ? "rp-sr" : undefined} style={{ ...TY.label, color: T.navy }}>{label}</label>
        {hint && <span id={`${id}-h`} style={{ ...TY.caption, color: T.muted }}>{hint}</span>}
      </div>
      {children}
      {error && <span id={`${id}-e`} role="alert" style={{ ...TY.small, color: T.errorDk, display: "flex", gap: 8, alignItems: "flex-start" }}><span style={{ display: "inline-flex", marginTop: 2 }}><Icon d={I.ban} s={16} /></span>{error}</span>}
    </div>
  );
}
const describedBy = (id, hint, error, extra) => [hint && `${id}-h`, error && `${id}-e`, extra].filter(Boolean).join(" ") || undefined;
/* Champ de saisie : variant="code" (code d'accès), icon (loupe à gauche), invalid. */
const Input = React.forwardRef(function Input({ id, hint, error, invalid, variant, icon, className, style, "aria-describedby": db, ...rest }, ref) {
  const cls = ["rs-input", variant === "code" && "rs-input-code", icon && "rs-input-icon", className].filter(Boolean).join(" ");
  const el = <input ref={ref} id={id} className={cls} aria-invalid={error || invalid ? "true" : undefined} aria-describedby={describedBy(id, hint, error, db)} style={icon ? undefined : style} {...rest} />;
  if (!icon) return el;
  return (
    <div style={{ position: "relative", ...style }}>
      <span aria-hidden style={{ position: "absolute", left: 16, top: 0, bottom: 0, display: "flex", alignItems: "center", pointerEvents: "none", color: T.muted }}><Icon d={icon} s={16} /></span>
      {el}
    </div>
  );
});
const Textarea = ({ id, hint, error, invalid, className, ...rest }) => (
  <textarea id={id} className={["rs-input", className].filter(Boolean).join(" ")} aria-invalid={error || invalid ? "true" : undefined} aria-describedby={describedBy(id, hint, error)} {...rest} />
);
/* Liste déroulante : flèche en icône (couleur primary, suit le thème sombre, UI-12). */
const Select = ({ id, hint, error, options, placeholder, ...rest }) => (
  <div style={{ position: "relative" }}>
    <select id={id} className="rs-input" aria-invalid={error ? "true" : undefined} aria-describedby={describedBy(id, hint, error)} {...rest}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
    <span aria-hidden style={{ position: "absolute", right: 16, top: 0, bottom: 0, display: "flex", alignItems: "center", pointerEvents: "none", color: T.primary }}><Icon d={I.chevron} s={16} /></span>
  </div>
);
const Checkbox = ({ id, checked, onChange, children, error }) => (
  <div style={{ display: "grid", gap: 8 }}>
    <label className="rs-check" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} aria-invalid={error ? "true" : undefined} aria-describedby={error ? `${id}-e` : undefined} />
      <span>{children}</span>
    </label>
    {error && <span id={`${id}-e`} role="alert" style={{ ...TY.small, color: T.errorDk }}>{error}</span>}
  </div>
);

/* Case de choix en tuile (consentement, sélection de questions) : role="checkbox", état sélectionné de 1.6.
   mark : contenu de la case (coche par défaut, ou numéro d'ordre). */
function CheckTile({ on, onToggle, children, mark, label, after, style }) {
  return (
    <div className={`rp-tile ${on ? "on" : ""}`} style={{ position: "relative", minWidth: 0, ...style }}>
      <Bare role="checkbox" aria-checked={on} aria-label={label} onClick={onToggle} className="rp-tile-btn"
        style={{ display: "flex", gap: 12, alignItems: "flex-start", width: "100%", padding: after ? "16px 48px 16px 16px" : 16, borderRadius: RAD.md, textAlign: "left" }}>
        <span aria-hidden className="rp-tile-box" style={{ ...TY.label, width: 24, height: 24, borderRadius: RAD.xs, flexShrink: 0, display: "grid", placeItems: "center" }}>
          {on && (mark ?? <Icon d={I.check} s={16} />)}
        </span>
        <span style={{ flex: 1, minWidth: 0, display: "grid", gap: 4 }}>{children}</span>
      </Bare>
      {after && <span style={{ position: "absolute", top: 4, right: 4 }}>{after}</span>}
    </div>
  );
}

/* Puce (filtre, choix) : aria-pressed par défaut, ou role radio / checkbox (aria-checked) avec coche.
   tone="ai" : suggestion de l'assistant. */
function Chip({ pressed, on, onClick, role, tone, children, disabled, check, ...rest }) {
  const sel = !!(pressed ?? on);
  const aria = role ? { role, "aria-checked": sel } : { "aria-pressed": sel ? "true" : "false" };
  return (
    <button type="button" className={`rs-chip${tone === "ai" ? " rs-chip-ai" : ""}`} onClick={onClick} disabled={disabled} {...aria} {...rest}>
      {(check ?? !!role) && sel && <Icon d={I.check} s={16} />}{children}
    </button>
  );
}

/* Choix exclusif en ligne (référentiel 5.3) : hauteur 48, role="radio" dans un role="radiogroup". */
const Toggle = ({ on, onClick, children }) => (
  <button type="button" role="radio" aria-checked={on} onClick={onClick} className="rp-toggle">{children}</button>
);

/* ─── STRUCTURE ─── */

/* Rail d'étapes (référentiel 5.10). Mobile : seul le libellé de l'étape en cours, précédé de « Étape n sur N ». */
function Rail({ step, steps }) {
  return (
    <ol aria-label="Étapes" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, listStyle: "none", margin: 0, padding: 0 }}>
      {steps.map((s, i) => {
        const done = i < step, now = i === step;
        return (
          <li key={i} aria-current={now ? "step" : undefined} className={now ? undefined : "rp-rail-other"} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span aria-hidden style={{ ...TY.time, width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center",
              background: done ? T.successDk : now ? T.accent : T.surface, border: done || now ? "none" : `1.5px solid ${T.lineStrong}`, color: done || now ? T.surface : T.muted }}>
              {done ? <Icon d={I.check} s={16} sw={3} /> : i + 1}
            </span>
            <span style={{ ...(now ? TY.label : TY.small), ...(now ? TY.strong : {}), color: now ? T.accent : done ? T.successDk : T.muted }}>
              {now && <span className="rp-show-m">{`Étape ${i + 1} sur ${steps.length} · `}</span>}{s}{done && <span className="rp-sr"> (terminée)</span>}
            </span>
            {i < steps.length - 1 && <span aria-hidden className="rp-hide-m" style={{ width: 24, height: 2, background: done ? T.successDk : T.line, marginLeft: 4 }} />}
          </li>
        );
      })}
    </ol>
  );
}

/* En-tête dégradé (référentiel 5.7) : en haut de la carte principale (Card pad="none"). */
function GradHead({ tag, title, sub, action, soft, as: As = "h1" }) {
  return (
    <div className="rp-pad-lg" style={{ position: "relative", overflow: "hidden", padding: PAD.lg, background: soft ? GRAD_SOFT : GRAD }}>
      {!soft && <Halo style={{ width: 220, height: 220, background: ON.glow, bottom: -120, right: -32 }} />}
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: 8, minWidth: 0 }}>
          {tag && <div style={{ marginBottom: 4 }}><span style={{ ...TY.tag, color: soft ? T.primary : ON.text, background: soft ? T.surface : ON.chip, height: 24, padding: "0 12px", borderRadius: RAD.pill, display: "inline-flex", alignItems: "center" }}>{tag}</span></div>}
          <As className="ty-h1" style={{ ...TY.h1, color: soft ? T.navy : ON.text, margin: 0, overflowWrap: "anywhere" }}>{title}</As>
          {sub && <p style={{ ...TY.body, color: soft ? T.body : ON.text, margin: 0, maxWidth: 520 }}>{sub}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

/* Fenêtre modale (référentiel 5.6), implémentation unique.
   head : "grad" | "soft" | "none" ; width : "form" | "read". Focus envoyé dans la modale, retenu, rendu à la fermeture. */
function Modal({ open = true, close, title, sub, icon, head = "none", width = "form", footer, children, label }) {
  const panel = useRef(null);
  const tid = useId().replace(/:/g, "");
  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement;
    const unlock = lockScroll();
    /* Fond inerte (A11Y-16) : page et en-tête ne reçoivent ni clic ni focus tant que la fenêtre est ouverte. */
    const behind = [...document.querySelectorAll(".rp-view, header.rp-header")].filter(el => !el.inert);
    behind.forEach(el => { el.inert = true; });
    const focusables = () => [...(panel.current?.querySelectorAll("a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex='-1'])") || [])];
    const first = focusables().find(el => !el.classList.contains("rp-modal-close")) || focusables()[0];
    first?.focus();
    const key = e => {
      if (e.key === "Escape") { e.stopPropagation(); close(); }
      if (e.key === "Tab") {
        const f = focusables(); if (!f.length) return;
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("keydown", key); behind.forEach(el => { el.inert = false; }); unlock(); prevFocus?.focus?.(); };
  }, [open]); // eslint-disable-line
  if (!open) return null;
  const dark = head === "grad";
  /* Rendue dans <body> : jamais prise dans un parent qui crée un contexte (en-tête collant avec flou), donc toujours centrée. */
  return createPortal(
    <div className="rp-modal" onClick={e => { if (e.target === e.currentTarget) close(); }}
      style={{ position: "fixed", inset: 0, zIndex: Z.modal, background: T.overlay, backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={title ? tid : undefined} aria-label={title ? undefined : label} className="up"
        style={{ background: T.surface, borderRadius: RAD.lg, boxShadow: SH.lg, width: "100%", maxWidth: W[width] || W.form, maxHeight: "86vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div className={dark ? "rp-pad-lg rs-on-dark" : "rp-pad-lg"} style={{ position: "relative", overflow: "hidden", padding: title ? PAD.lg : `${PAD.sm}px ${PAD.sm}px 0`, background: head === "grad" ? GRAD : head === "soft" ? GRAD_SOFT : T.surface, flexShrink: 0, borderBottom: title && head === "none" ? `1px solid ${T.line}` : "none" }}>
          {dark && <Halo style={{ width: 200, height: 200, background: ON.glow, bottom: -112, right: -20 }} />}
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: title ? "space-between" : "flex-end", gap: 12 }}>
            {title && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                {icon && <IconTile icon={icon} c={dark ? ON.text : T.primary} bg={dark ? ON.chip : T.surface} />}
                <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
                  <h2 id={tid} style={{ ...TY.h2, color: dark ? ON.text : T.navy, margin: 0 }}>{title}</h2>
                  {sub && <div style={{ ...TY.small, color: dark ? ON.text : T.body }}>{sub}</div>}
                </div>
              </div>
            )}
            <IconBtn icon={I.close} label="Fermer" onClick={close} variant={dark ? "dark" : "plain"} tone="muted" className="rp-modal-close" />
          </div>
        </div>
        <div className="rp-pad-lg" style={{ padding: PAD.lg, overflowY: "auto" }}>{children}</div>
        {footer && <div className="rp-pad-lg" style={{ padding: `${PAD.sm}px ${PAD.lg}px`, borderTop: `1px solid ${T.line}`, flexShrink: 0 }}>{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

/* Confirmation d'une action destructive (A11Y-17) : fenêtre du site, bouton destructif plein, à la place de window.confirm. */
function ConfirmDialog({ title, children, confirmLabel = "Supprimer", onConfirm, onCancel }) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal close={onCancel} title={title} footer={
      <div className="rp-actions" style={{ display: "flex", justifyContent: "flex-end", gap: GAP.actions, flexWrap: "wrap" }}>
        <Btn kind="secondary" onClick={onCancel}>Annuler</Btn>
        <Btn kind="dangerSolid" icon={I.trash} disabled={busy} onClick={async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } }}>{confirmLabel}</Btn>
      </div>}>
      <div style={{ ...TY.bodyLg, color: T.body, display: "grid", gap: 12 }}>{children}</div>
    </Modal>
  );
}

/* Groupe de choix exclusifs (A11Y-10, motif ARIA radiogroup) : un seul arrêt de tabulation (le choix courant, sinon le
   premier), flèches, Début et Fin pour se déplacer et choisir. Les enfants sont des Chip ou Toggle de rôle radio. */
function RadioGroup({ children, style, className, ...rest }) {
  const ref = useRef(null);
  const radios = () => [...(ref.current?.querySelectorAll('[role="radio"]:not([disabled])') || [])];
  useEffect(() => {
    const rs = radios();
    const cur = rs.find(r => r.getAttribute("aria-checked") === "true") || rs[0];
    rs.forEach(r => { r.tabIndex = r === cur ? 0 : -1; });
  });
  const onKeyDown = e => {
    const rs = radios(), i = rs.indexOf(document.activeElement);
    if (i < 0) return;
    const to = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: rs.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    const r = rs[(to + rs.length) % rs.length];
    r.focus(); r.click();
  };
  return <div ref={ref} role="radiogroup" className={className} style={style} onKeyDown={onKeyDown} {...rest}>{children}</div>;
}

/* Menu d'actions secondaires (UI-02) : bouton « Autres actions » qui ouvre une liste de boutons ; Échap ou un clic
   ailleurs ferme, le focus revient au bouton. items : [{ label, icon, onClick, danger }]. */
function Menu({ label = "Autres actions", items }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null), btn = useRef(null);
  const id = useId().replace(/:/g, "");
  useEffect(() => {
    if (!open) return;
    const out = e => { if (!wrapRef.current?.contains(e.target)) setOpen(false); };
    const key = e => { if (e.key === "Escape") { setOpen(false); btn.current?.focus(); } };
    document.addEventListener("pointerdown", out); document.addEventListener("keydown", key);
    requestAnimationFrame(() => wrapRef.current?.querySelector(".rp-menuitem")?.focus());
    return () => { document.removeEventListener("pointerdown", out); document.removeEventListener("keydown", key); };
  }, [open]);
  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-block" }}>
      <Btn ref={btn} kind="ghost" size="sm" icon={I.more} aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)}>{label}</Btn>
      {open && (
        <div id={id} style={{ position: "absolute", left: 0, bottom: "calc(100% + 8px)", zIndex: 30, minWidth: 240, background: T.surface, border: `1px solid ${T.line}`, borderRadius: RAD.md, boxShadow: SH.lg, padding: 4, display: "grid", gap: 2 }}>
          {items.filter(Boolean).map(it => (
            <Bare key={it.label} className="rp-menuitem" onClick={() => { setOpen(false); btn.current?.focus(); it.onClick(); }}
              style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 44, padding: "0 12px", borderRadius: RAD.sm, ...TY.bodyStrong, color: it.danger ? T.errorDk : T.navy, textAlign: "left" }}>
              {it.icon && <Icon d={it.icon} s={16} />}{it.label}
            </Bare>
          ))}
        </div>
      )}
    </div>
  );
}

/* Logo animé d'attente (bulles qui se rapprochent, points qui « tapent ») avec un libellé d'état.
   full : plein écran (connexion à un espace) ; sinon dans le bloc. role="status", aria-live ; statique en mouvement réduit. */
function BrandLoader({ label, full = false, size = 72 }) {
  const gid = useId().replace(/:/g, "");
  const box = (
    <div role="status" aria-live="polite" style={{ display: "grid", justifyItems: "center", gap: 16, textAlign: "center" }}>
      <svg viewBox="0 0 204 172" width={size} aria-hidden="true" focusable="false" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id={`${gid}g`} gradientUnits="userSpaceOnUse" x1="0" y1="172" x2="204" y2="0"><stop offset="0" style={{ stopColor: T.blue }} /><stop offset="1" style={{ stopColor: T.violet }} /></linearGradient>
        </defs>
        <g className="rp-bl-r"><path fill={`url(#${gid}g)`} d="M88 16H150A50 50 0 0 1 200 66V86A50 50 0 0 1 150 136H122V122H134A30 30 0 0 0 134 62H88Z" /></g>
        <g className="rp-bl-l"><path fill={`url(#${gid}g)`} d="M88 44H54A50 50 0 0 0 38 141.4L40 166L67 144H112A6 6 0 0 0 118 138V122H82A30 30 0 0 1 82 62H88Z" /></g>
        {[88, 108, 128].map((cx, k) => <circle key={cx} className={`rp-bl-d rp-bl-d${k + 1}`} cx={cx} cy="92" r="6.5" fill={T.navy} />)}
      </svg>
      {label && <div style={{ ...TY.h3, color: T.navy }}>{label}</div>}
    </div>
  );
  if (!full) return box;
  return createPortal(<div className="rp-bl-full">{box}</div>, document.body);
}

/* ─── PAGES PUBLIQUES ─── */

/* Section éditoriale : surtitre, titre TY.xl, chapeau, contenu. */
const Section = ({ id, eyebrow, title, sub, children, first }) => (
  <section id={id} className="rs-section" style={{ paddingTop: first ? GAP.block + 16 : GAP.section, scrollMarginTop: GAP.section }}>
    <Reveal>
      <div style={{ display: "grid", gap: 12, maxWidth: W.read }}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="ty-xl" style={{ ...TY.xl, color: T.navy, margin: 0 }}>{title}</h2>
        {sub && <p className="ty-lead" style={{ ...TY.lead, color: T.body, margin: 0 }}>{sub}</p>}
      </div>
    </Reveal>
    <div style={{ marginTop: GAP.block }}>{children}</div>
  </section>
);
/* En-tête des pages secondaires : surtitre, titre, chapeau, visuel facultatif. */
function PageHero({ eyebrow, title, lead, children, aside }) {
  return (
    <section style={{ background: GRAD_PAGE, borderBottom: `1px solid ${T.line}` }}>
      <div className="rs-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: "64px 24px" }}>
        <div className={aside ? "rs-split" : undefined} style={aside ? { alignItems: "start" } : undefined}>
          <div className="up" style={{ display: "grid", gap: 16, maxWidth: W.read }}>
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <h1 className="ty-xl" style={{ ...TY.pageTitle, color: T.navy, margin: 0 }}>{title}</h1>
            {lead && <p className="ty-lead" style={{ ...TY.lead, color: T.body, margin: 0 }}>{lead}</p>}
            {children}
          </div>
          {aside}
        </div>
      </div>
    </section>
  );
}

/* Accordéon : bouton aria-expanded relié à son panneau, ouvrable au clavier (Entrée, Espace). */
function Accordion({ items, idPrefix }) {
  const [open, setOpen] = useState(null);
  const base = useId().replace(/:/g, "");
  return (
    <div style={{ borderTop: `1px solid ${T.line}` }}>
      {items.map(([q, a], i) => {
        const id = `${idPrefix || base}-${i}`, on = open === i;
        return (
          <div key={q} className="rs-acc">
            <h3 style={{ margin: 0 }}>
              <button type="button" id={`${id}-b`} className="rs-acc-btn" aria-expanded={on} aria-controls={`${id}-p`} onClick={() => setOpen(on ? null : i)}>
                <span>{q}</span><Icon d={I.chevron} s={20} c={T.primary} />
              </button>
            </h3>
            <div id={`${id}-p`} role="region" aria-labelledby={`${id}-b`} hidden={!on} className="rs-acc-panel">
              {(Array.isArray(a) ? a : [a]).map((p, k) => <p key={k}>{p}</p>)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* Onglets accessibles : flèches gauche et droite, Début et Fin ; un seul onglet dans l'ordre de tabulation. */
function Tabs({ tabs, label, idPrefix = "tab" }) {
  const [cur, setCur] = useState(0);
  const refs = useRef([]);
  const key = e => {
    const n = tabs.length;
    const k = { ArrowRight: (cur + 1) % n, ArrowLeft: (cur - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
    if (k === undefined) return;
    e.preventDefault(); setCur(k); refs.current[k]?.focus();
  };
  return (
    <div>
      <div role="tablist" aria-label={label} className="rs-chips rs-scroll" onKeyDown={key}>
        {tabs.map(([t], i) => (
          <button key={t} ref={el => (refs.current[i] = el)} type="button" role="tab" id={`${idPrefix}-t${i}`} aria-controls={`${idPrefix}-p${i}`}
            aria-selected={cur === i} tabIndex={cur === i ? 0 : -1} className="rs-chip" onClick={() => setCur(i)}>{t}</button>
        ))}
      </div>
      {tabs.map(([t, panel], i) => (
        <div key={t} role="tabpanel" id={`${idPrefix}-p${i}`} aria-labelledby={`${idPrefix}-t${i}`} hidden={cur !== i} tabIndex={0} style={{ marginTop: GAP.grid }}>{panel}</div>
      ))}
    </div>
  );
}

/* Barre de progression de lecture : un seul écouteur passif, mise à jour par requestAnimationFrame. */
function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    let raf = 0;
    const upd = () => {
      raf = 0;
      const d = document.documentElement, max = d.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (ref.current) ref.current.style.transform = `scaleX(${p})`;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(upd); };
    upd();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} className="rs-progress" aria-hidden />;
}

/* ─── STYLES GLOBAUX ─── */

const F = k => TY[k].font; // police d'un niveau, pour les règles CSS ci-dessous
/* Polices auto-hébergées (public/fonts, sous-ensemble latin, licence OFL) : aucun appel à un service tiers. */
const FONT_DIR = `${import.meta.env.BASE_URL}fonts/`;
const FONT_FACES = [["Manrope", "manrope", [700, 800]], ["Inter", "inter", [400, 600, 700]], ["JetBrains Mono", "jetbrains-mono", [500, 700]], ["Atkinson Hyperlegible", "atkinson-hyperlegible", [400, 700]]]
  .flatMap(([fam, file, ws]) => ws.map(w => `@font-face{font-family:'${fam}';font-style:normal;font-weight:${w};font-display:swap;src:url('${FONT_DIR}${file}-latin-${w}-normal.woff2') format('woff2')}`)).join("\n");
const GStyle = () => (
  <style>{`
    ${FONT_FACES}
    :root{--ff-d:${FONT_STACKS.display};--ff-b:${FONT_STACKS.body};--fs:1}
    html[data-font=lisible]{--ff-d:${FONT_STACKS.lisible};--ff-b:${FONT_STACKS.lisible}}
    *{box-sizing:border-box} body{margin:0;background:${T.bg};color:${T.navy}}
    html{overflow-y:scroll;scrollbar-gutter:stable}
    html.rp-lock,html.rp-lock body{overflow:hidden!important;overscroll-behavior:none}
    /* Menu mobile ouvert : boutons flottants retirés (rien de cliquable derrière le panneau) */
    html.rp-menu-open .rp-totop,html.rp-menu-open .rp-ai-fab,html.rp-menu-open .rp-ai-bubble,html.rp-account-open .rp-totop,html.rp-account-open .rp-ai-fab,html.rp-account-open .rp-ai-bubble{display:none!important}
    /* Panneau « Mon compte » : à droite sur grand écran, plein écran sur mobile */
    .rp-account-ov{position:fixed;inset:0;z-index:${Z.modal};background:${T.overlay};display:flex;justify-content:flex-end;animation:rpFade ${MO.base} ${MO.ease} both}
    @keyframes rpFade{from{opacity:0}to{opacity:1}}
    .rp-account{width:min(400px,100vw);height:100%;background:${T.surface};box-shadow:${SH.lg};display:flex;flex-direction:column;animation:rpAiIn ${MO.enter} ${MO.ease} both}
    ::selection{background:${T.lavender};color:${T.surface}}
    img{max-width:100%}
    @keyframes up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}
    .up{animation:up ${MO.enter} ${MO.ease} both}
    /* Focus clavier (référentiel 1.6) : contour 2 px primary, décalage 2 px ; blanc sur fond sombre */
    a:focus-visible,button:focus-visible,summary:focus-visible,[role=button]:focus-visible,[role=tab]:focus-visible,[role=checkbox]:focus-visible,[role=radio]:focus-visible,[role=option]:focus-visible,[tabindex]:focus-visible{outline:2px solid ${T.primary};outline-offset:2px}
    .rs-on-dark :focus-visible{outline-color:${ON.text}}
    .rp-skip{position:fixed;left:16px;top:-80px;z-index:${Z.modal + 10};background:${T.surface};color:${T.primary};padding:12px 16px;border-radius:${RAD.md}px;box-shadow:${SH.lg};font-weight:700;text-decoration:underline}
    .rp-skip:focus{top:12px}
    main h1[tabindex="-1"]:focus:not(:focus-visible),main[tabindex="-1"]:focus:not(:focus-visible){outline:none}
    .rp-sr,.rs-sr{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
    .rp-show-m{display:none}
    .rp-dots{display:inline-flex;gap:4px}
    .rp-dots i{width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.3;animation:rpDot 1.2s infinite}
    .rp-dots i:nth-child(2){animation-delay:.2s}
    .rp-dots i:nth-child(3){animation-delay:.4s}
    @keyframes rpDot{0%,80%,100%{opacity:.25;transform:none}40%{opacity:1;transform:translateY(-2px)}}
    .rp-opt:hover{background:${T.lineLt}}
    .rp-sel{position:-webkit-sticky;position:sticky;bottom:12px;z-index:3}
    .rp-app{min-height:100vh;min-height:100svh}
    /* Liens, retour, boutons icône */
    .rp-link{text-underline-offset:3px;transition:color ${MO.fast}}
    .rp-link:hover{color:${T.primaryDk}!important}
    .rs-on-dark .rp-link:hover{color:${ON.text}!important}
    .rp-back:hover{color:${T.primary}!important}
    .rp-menuitem:hover,.rp-menuitem:focus-visible{background:${T.primaryBg}}
    /* Assistant de préparation d'entretien : panneau latéral, bouton flottant, bulle */
    .rp-ai-panel{position:fixed;right:16px;top:${HEADER_H + 16}px;bottom:16px;width:min(400px,calc(100vw - 32px));z-index:${Z.nav + 2};display:flex;flex-direction:column;border:2px solid transparent;border-radius:${RAD.lg}px;background:linear-gradient(${T.surface},${T.surface}) padding-box,${GRAD_AI_BORDER} border-box;background-size:100% 100%,300% 300%;background-position:0 0,0 50%;box-shadow:${SH.lg};overflow:hidden}
    .rp-ai-panel[hidden]{display:none}
    .rp-ai-panel.is-in{animation:rpAiIn ${MO.enter} ${MO.ease} both,rpAiBorder 1.4s ${MO.ease} both}
    @keyframes rpAiIn{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:none}}
    @keyframes rpAiBorder{from{background-position:0 0,100% 50%}to{background-position:0 0,0 50%}}
    .rp-ai-fab{position:fixed;right:16px;bottom:16px;z-index:${Z.nav};width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;display:grid;place-items:center;color:${T.surface};background:${GRAD_AI};box-shadow:${SH.btn.ai[0]};transition:box-shadow ${MO.base} ${MO.ease},transform ${MO.base} ${MO.ease}}
    .rp-ai-fab:hover{box-shadow:${SH.btn.ai[1]};transform:translateY(-1px)}
    .rp-ai-bubble{position:fixed;right:84px;bottom:16px;z-index:${Z.nav};max-width:min(240px,calc(100vw - 100px));display:flex;align-items:center;gap:4px;padding:4px 4px 4px 16px;border:2px solid transparent;border-radius:${RAD.md}px;background:linear-gradient(${T.surface},${T.surface}) padding-box,${GRAD_AI_BORDER} border-box;box-shadow:${SH.lg};animation:rpAiIn ${MO.enter} ${MO.ease} both}
    .rp-has-fab{padding-bottom:96px!important}
    /* Grand écran : le contenu se décale pour rester visible à côté du panneau ouvert (insertion en un clic) */
    @media (min-width:1180px){html.rp-asst-open .rp-view{padding-right:432px}}
    /* Changement de page (référentiel 7) : seul le contenu change, l'en-tête reste en place */
    .rp-header{view-transition-name:rp-header}
    .rp-view{view-transition-name:rp-page}
    ::view-transition-old(root),::view-transition-new(root){animation:none}
    ::view-transition-old(rp-page){animation:rpPageOut ${MO.pageOut} ${MO.soft} both}
    ::view-transition-new(rp-page){animation:rpPageIn ${MO.pageIn} ${MO.soft} ${MO.pageOut} both}
    @keyframes rpPageOut{to{opacity:0}}
    @keyframes rpPageIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
    .rp-leave{opacity:0;transition:opacity ${MO.pageOut} ${MO.soft}}
    .rp-enter{animation:rpPageIn ${MO.pageIn} ${MO.soft} both}
    @media (prefers-reduced-motion: reduce){::view-transition-old(rp-page),::view-transition-new(rp-page){animation:none}}
    html[data-motion=reduce]::view-transition-old(rp-page),html[data-motion=reduce]::view-transition-new(rp-page){animation:none}
    /* Navigation à deux niveaux */
    .rp-navitem{position:relative;display:flex;align-items:center}
    .rp-subbtn{width:28px;height:44px;display:inline-grid;place-items:center;color:${T.body}}
    .rp-subbtn:hover,.rp-subbtn[aria-expanded=true]{color:${T.primary}}
    .rp-subbtn svg{transition:transform ${MO.base} ${MO.ease}}
    .rp-subbtn[aria-expanded=true] svg,.rp-rot svg{transform:rotate(180deg)}
    .rp-submenu{position:absolute;left:-12px;top:100%;min-width:240px;padding:8px;background:${T.surface};border:1px solid ${T.line};border-radius:${RAD.md}px;box-shadow:${SH.lg};z-index:${Z.nav + 1};animation:rsMenu ${MO.base} ${MO.ease} both}
    .rp-submenu[hidden]{display:none}
    .rp-subitem{display:flex;align-items:center;min-height:44px;padding:0 12px;border-radius:${RAD.sm}px;color:${T.navy};text-decoration:none;font:${F("body")}}
    .rp-subitem:hover,.rp-subitem:focus-visible{background:${T.primaryBg};color:${T.primary}}
    /* Logo en masques : couleurs gardées à l'impression */
    .rp-logo-layer{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    /* Logo animé d'attente */
    .rp-bl-l{animation:rpBlL 1.3s ${MO.soft} both}
    .rp-bl-r{animation:rpBlR 1.3s ${MO.soft} both}
    .rp-bl-d{animation:rpBlD 1s ease-in-out 1.2s infinite both}
    .rp-bl-d2{animation-delay:1.35s}.rp-bl-d3{animation-delay:1.5s}
    @keyframes rpBlL{from{opacity:0;transform:translate(-22px,10px)}to{opacity:1;transform:none}}
    @keyframes rpBlR{from{opacity:0;transform:translate(22px,-10px)}to{opacity:1;transform:none}}
    @keyframes rpBlD{0%,60%,100%{opacity:.35;transform:none}30%{opacity:1;transform:translateY(-5px)}}
    .rp-bl-full{position:fixed;inset:0;z-index:${Z.modal + 2};display:grid;place-items:center;background:${T.bg};animation:up ${MO.base} ${MO.ease} both}
    .rp-totop{position:fixed;right:22px;z-index:${Z.nav};box-shadow:${SH.sm}}
    /* Bordure haute en dégradé des cartes : bleu vers violet (personne accompagnée), vert (coach), IA */
    .rp-tb::before{content:"";position:absolute;inset:-1px;border-radius:inherit;padding-top:5px;background:var(--tb);-webkit-mask:${MASK} content-box,${MASK};-webkit-mask-composite:xor;mask:${MASK} content-box,${MASK};mask-composite:exclude;pointer-events:none;z-index:1}
    .rp-tb-main{--tb:${GRAD_MAIN}} .rp-tb-coach{--tb:${GRAD_COACH}} .rp-tb-ai{--tb:${GRAD_AI}}
    /* Recruteur oral : indicateur discret (barres qui pulsent pendant la lecture, immobiles sinon) */
    .rp-voice{display:inline-flex;align-items:center;gap:2px;height:16px}
    .rp-voice i{display:block;width:3px;height:6px;border-radius:2px;background:${T.primary};opacity:.5}
    .rp-voice.on i{opacity:1;animation:rpVoice 1s ease-in-out infinite}
    .rp-voice.on i:nth-child(2){animation-delay:.15s}.rp-voice.on i:nth-child(3){animation-delay:.3s}.rp-voice.on i:nth-child(4){animation-delay:.45s}
    @keyframes rpVoice{0%,100%{height:6px}50%{height:16px}}
    .rp-trustlink:hover{color:${T.primary}!important;text-decoration:underline!important}
    .rp-icbtn{width:44px;height:44px;border-radius:50%;display:inline-grid;place-items:center;cursor:pointer;flex-shrink:0;padding:0;transition:background-color ${MO.fast},border-color ${MO.fast}}
    .rp-icbtn-outline{border:1px solid ${T.line};background:${T.surface}}
    .rp-icbtn-outline:hover{border-color:${T.primary}}
    .rp-icbtn-plain{border:none;background:transparent}
    .rp-icbtn-plain:hover,.rp-icbtn-plain[aria-expanded=true]{background:${T.primaryBg}}
    .rp-icbtn-dark{border:1px solid ${ON.line};background:${ON.chip}}
    .rp-icbtn:disabled{cursor:not-allowed;background:${T.line};color:${T.muted}!important;border-color:${T.line}}
    /* Tuiles à cocher et bascules (état sélectionné de 1.6) */
    .rp-tile-btn{border:1.5px solid ${T.line}!important;background:${T.surface}!important;box-shadow:${SH.xs};transition:border-color ${MO.fast},background-color ${MO.fast}}
    .rp-tile-btn:hover{border-color:${T.primary}!important}
    .rp-tile.on .rp-tile-btn{border-color:${T.primary}!important;background:${T.primaryBg}!important;box-shadow:none}
    .rp-tile-box{background:${T.surface};border:1.5px solid ${T.lineStrong};color:${T.surface}}
    .rp-tile.on .rp-tile-box{background:${T.primary};border-color:${T.primary}}
    .rp-toggle{height:48px;padding:0 16px;border-radius:${RAD.md}px;cursor:pointer;font:${F("label")};border:1.5px solid ${T.lineStrong};background:${T.surface};color:${T.body};transition:border-color ${MO.fast},background-color ${MO.fast},color ${MO.fast}}
    .rp-toggle:hover{border-color:${T.primary}}
    .rp-toggle[aria-checked=true]{background:${T.primaryBg};border-color:${T.primary};color:${T.primary}}
    /* Mouvement */
    .rv{opacity:0;transform:translateY(12px);transition:opacity ${MO.reveal} ${MO.soft},transform ${MO.reveal} ${MO.soft}}
    .rv.is-in{opacity:1;transform:none}
    .strike{position:relative;display:inline-block}
    .strike::after{content:"";position:absolute;left:-2px;right:-2px;top:50%;height:2px;background:${T.error};transform:scaleX(0);transform-origin:left;transition:transform .4s ease .2s}
    .is-in .strike::after{transform:scaleX(1)}
    .is-in .strike{opacity:.7;transition:opacity .3s ease .6s}
    .navlink{white-space:nowrap;font:${F("bodyStrong")};color:${T.body};background:none;border:none;cursor:pointer;padding:8px 4px;text-decoration:none;text-underline-offset:6px;text-decoration-thickness:2px}
    .navlink:hover{color:${T.primary}}
    .navlink.on{color:${T.primary};text-decoration:underline}
    /* En-tête */
    .rs-progress{position:absolute;left:0;right:0;bottom:-1px;height:3px;background:${T.primary};transform-origin:0 50%;transform:scaleX(0);pointer-events:none}
    .rs-menu{position:fixed;left:0;right:0;bottom:0;top:${HEADER_H}px;z-index:${Z.nav - 1};background:${T.bg};overflow-y:auto;padding:24px 24px 48px;display:flex;flex-direction:column;gap:8px;animation:rsMenu ${MO.base} ${MO.ease} both}
    @keyframes rsMenu{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
    .rs-menu a.rs-mlink{display:flex;align-items:center;justify-content:space-between;min-height:56px;padding:0 4px;border-bottom:1px solid ${T.line};text-decoration:none;color:${T.navy};font:${F("h2")}}
    .rs-menu a.rs-mlink[aria-current=page]{color:${T.primary}}
    .rs-burger{display:none!important}
    @media (max-width:1023px){ .rs-links,.rs-demo{display:none!important} .rs-burger{display:inline-grid!important} }
    /* Texte agrandi ou espacé : la navigation complète ne tient plus sous 1280 px, le menu repliable prend le relais */
    @media (max-width:1279px){ html[data-textsize=lg] .rs-links,html[data-textsize=lg] .rs-demo{display:none!important} html[data-textsize=lg] .rs-burger{display:inline-grid!important} }
    /* Titres et paragraphes : un mot long passe à la ligne plutôt que de faire déborder la page (texte agrandi, 320 px) */
    h1,h2,h3,h4,p,li,dt,dd,label,blockquote{overflow-wrap:anywhere}
    /* Puces */
    .rs-chip{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:8px 16px;border-radius:${RAD.pill}px;border:1.5px solid ${T.line};background:${T.surface};color:${T.body};cursor:pointer;font:${F("btnSm")};text-align:left;transition:background-color ${MO.fast},border-color ${MO.fast},color ${MO.fast}}
    .rs-chip:hover{border-color:${T.primary};color:${T.primary}}
    .rs-chip[aria-pressed=true],.rs-chip[aria-selected=true],.rs-chip[aria-checked=true]{background:${T.primaryBg};border-color:${T.primary};color:${T.primary}}
    .rs-chip:disabled{cursor:not-allowed;background:${T.line};border-color:${T.line};color:${T.muted}}
    .rs-chip-ai{color:${T.violet};border-color:${T.violet};max-width:100%}
    .rs-chip-ai:hover{background:${T.violetBg};border-color:${T.violet};color:${T.violet}}
    .rs-card-btn{display:block;width:100%;text-align:left;background:${T.surface};border:1px solid ${T.line};border-radius:${RAD.lg}px;padding:0;cursor:pointer;box-shadow:${SH.xs};overflow:hidden;color:inherit;font:inherit;transition:box-shadow ${MO.base} ${MO.ease},transform ${MO.base} ${MO.ease},border-color ${MO.fast}}
    .rs-card-btn:hover{box-shadow:${SH.lg};transform:translateY(-2px)}
    /* Accordéon */
    .rs-acc{border-bottom:1px solid ${T.line}}
    .rs-acc-btn{width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:56px;padding:16px 0;background:none;border:none;cursor:pointer;text-align:left;color:${T.navy};font:${F("h3")}}
    .rs-acc-btn:hover{color:${T.primary}}
    .rs-acc-btn svg{transition:transform ${MO.base} ${MO.ease};flex-shrink:0}
    .rs-acc-btn[aria-expanded=true] svg{transform:rotate(180deg)}
    .rs-acc-panel{padding:0 0 20px;color:${T.body};font:${F("body")};max-width:${W.read}px}
    .rs-acc-panel p{margin:0 0 12px}.rs-acc-panel p:last-child{margin:0}
    /* Champs (référentiel 5.3) */
    .rs-input{width:100%;height:48px;padding:0 16px;border-radius:${RAD.md}px;border:1.5px solid ${T.lineStrong};background:${T.surface};color:${T.navy};font:${F("input")};transition:border-color ${MO.fast},box-shadow ${MO.fast}}
    .rs-input-icon{padding-left:40px}
    .rs-input-code{height:56px;font:${F("code")};letter-spacing:.25em;text-align:center;text-transform:uppercase}
    textarea.rs-input{height:auto;min-height:96px;padding:12px 16px;resize:vertical}
    select.rs-input{appearance:none;-webkit-appearance:none;padding-right:40px}
    .rs-input::placeholder{color:${T.muted}}
    .rs-input:focus{outline:none;border-color:${T.primary}!important;box-shadow:${SH.ring}!important}
    .rs-input[aria-invalid=true]{border-color:${T.errorDk}}
    .rs-input:disabled{background:${T.lineLt}}
    .rs-check{display:flex;gap:12px;align-items:flex-start;cursor:pointer;color:${T.body};font:${F("body")}}
    .rs-check input{width:20px;height:20px;margin:2px 0 0;flex-shrink:0;accent-color:${T.primary};cursor:pointer}
    /* Héros */
    .rs-hero{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:64px;align-items:center}
    .rs-rot{display:grid}
    .rs-rot>span{grid-area:1/1;opacity:0;transform:translateY(.2em);transition:opacity ${MO.fade} ${MO.soft},transform ${MO.fade} ${MO.soft};padding-bottom:.08em}
    .rs-rot>span.on{opacity:1;transform:none}
    .rs-stage{position:relative;width:100%;max-width:${W.narrow}px;margin:0 auto}
    .rs-scene{position:absolute;inset:0;opacity:0;visibility:hidden;transition:opacity ${MO.fade} ${MO.soft},visibility 0s linear ${MO.fade}}
    .rs-scene.on{position:relative;opacity:1;visibility:visible;transition:opacity ${MO.fade} ${MO.soft},visibility 0s}
    .rs-pop{opacity:0;transform:translateY(12px);transition:opacity ${MO.reveal} ${MO.soft},transform ${MO.reveal} ${MO.soft}}
    .on .rs-pop{opacity:1;transform:none}
    .on .rs-pop.d1{transition-delay:.5s}.on .rs-pop.d2{transition-delay:1s}
    .rs-bubble{left:-32px}
    .rs-dot{width:44px;height:44px;border:none;background:none;padding:0;cursor:pointer;display:inline-grid;place-items:center;color:${T.primary}}
    .rs-dot i{display:block;height:8px;width:8px;border-radius:4px;background:${T.faint};transition:width ${MO.reveal} ${MO.soft},background-color ${MO.reveal} ${MO.soft}}
    .rs-dot[aria-current=true] i{width:24px;background:${T.primary}}
    /* Strate épinglée */
    .rs-strate{position:relative}
    .rs-panel{position:-webkit-sticky;position:sticky;top:${HEADER_H}px;height:calc(100vh - ${HEADER_H}px);height:calc(100svh - ${HEADER_H}px);display:flex;flex-direction:column;justify-content:center;padding:24px 0;overflow:hidden}
    .rs-pgrid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:64px;align-items:center;min-height:0}
    .rs-step{display:flex;gap:16px;width:100%;text-align:left;background:none;border:none;padding:12px 0;cursor:pointer;color:inherit;font:inherit}
    .rs-step-bar{position:relative;width:3px;border-radius:2px;background:${T.line};flex-shrink:0;overflow:hidden}
    .rs-step-bar i{position:absolute;left:0;right:0;top:0;height:100%;background:${T.primary};transform-origin:50% 0;transform:scaleY(0)}
    .rs-step-d{display:grid;grid-template-rows:0fr;transition:grid-template-rows ${MO.slow} ${MO.soft},opacity ${MO.slow} ${MO.soft};opacity:0}
    .rs-step-d>div{overflow:hidden}
    .rs-step.on .rs-step-d{grid-template-rows:1fr;opacity:1}
    .rs-vis{position:absolute;inset:0;opacity:0;transform:translateY(12px);transition:opacity ${MO.slow} ${MO.soft},transform ${MO.slow} ${MO.soft};pointer-events:none}
    .rs-vis.on{opacity:1;transform:none}
    .rs-tabs-m{display:none}
    .rs-vcard{position:absolute;inset:0;background:${T.surface};border-radius:${RAD.xl}px;border:1px solid ${T.line};box-shadow:${SH.glow};overflow:hidden;transform-origin:50% 0;transition:transform ${MO.slow} ${MO.soft},opacity ${MO.slow} ${MO.soft},box-shadow ${MO.slow} ${MO.soft}}
    .rs-vcard.on{transform:none;opacity:1}
    .rs-vcard.past{transform:translateY(-20px) scale(.92);opacity:.6;box-shadow:${SH.sm}}
    .rs-vcard.next{transform:translateY(110%) rotate(2deg);opacity:0;pointer-events:none}
    /* Lignes d'encart du héros : du bas vers le haut, en fondu, à chaque arrivée de la scène */
    .rs-hl{background:${T.accentBg};border-radius:4px;padding:0 4px}
    .rs-line{opacity:0}
    .on .rs-line{animation:rsUp .45s ${MO.soft} both}
    /* Fond de l'accueil qui suit la souris */
    .rs-glow{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden;-webkit-mask:${FADE_FOOT};mask:${FADE_FOOT}}
    .rs-glow>i{position:absolute;inset:-12%;background:radial-gradient(48vmax circle at var(--mx,72%) var(--my,18%),${GLOW.violet},transparent 70%),radial-gradient(56vmax circle at calc(100% - var(--mx,72%)) calc(100% - var(--my,18%)),${GLOW.blue},transparent 70%);animation:rsDrift 26s ${MO.soft} infinite alternate}
    @keyframes rsDrift{0%{transform:translate3d(0,0,0)}33%{transform:translate3d(-5%,3%,0)}66%{transform:translate3d(4%,-3%,0)}100%{transform:translate3d(-2%,5%,0)}}
    .rs-in{opacity:0;transform:translateY(12px);transition:opacity ${MO.reveal} ${MO.soft},transform ${MO.reveal} ${MO.soft}}
    .on .rs-in{opacity:1;transform:none}
    .rs-knob{left:4px;transition:left .25s ease .6s}
    .on .rs-knob{left:20px}
    .rs-track{background:${T.lineStrong};transition:background-color .25s ease .6s}
    .on .rs-track{background:${T.accent}}
    .rs-swap{transition:opacity .3s ease .7s}
    .rs-onl,.on .rs-off{opacity:0}
    .on .rs-onl{opacity:1}
    /* Carte de chronologie (retour descriptif) */
    @keyframes rsMask{from{transform:scaleX(1)}to{transform:scaleX(0)}}
    @keyframes rsHead{0%{left:0;opacity:1}92%{left:100%;opacity:1}100%{left:100%;opacity:0}}
    @keyframes rsPop{from{transform:translateX(-50%) scale(0)}to{transform:translateX(-50%) scale(1)}}
    @keyframes rsUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
    .rs-tl .rs-tl-mask{transform-origin:right;transform:scaleX(1)}
    .rs-tl .rs-tl-head{opacity:0}
    .rs-tl .rs-tl-pin{transform:translateX(-50%) scale(0)}
    .rs-tl .rs-tl-row,.rs-tl .rs-tl-facts{opacity:0}
    .rs-tl.play .rs-tl-mask{animation:rsMask 2s linear .2s both}
    .rs-tl.play .rs-tl-head{animation:rsHead 2.2s linear .2s both}
    .rs-tl.play .rs-tl-pin{animation:rsPop .24s cubic-bezier(.34,1.56,.64,1) both}
    .rs-tl.play .rs-tl-row{animation:rsUp .3s ${MO.ease} both}
    .rs-tl.play .rs-tl-facts{animation:rsUp .3s ${MO.ease} 2.2s both}
    /* Phrase qui se colore au défilement */
    .rs-phrase{position:relative}
    .rs-phrase-in{position:-webkit-sticky;position:sticky;top:${HEADER_H}px;height:calc(100vh - ${HEADER_H}px);height:calc(100svh - ${HEADER_H}px);display:flex;align-items:center}
    .rs-w{transition:color ${MO.reveal} ${MO.soft}}
    /* Cartes de fonctionnalités animées */
    .rs-fcards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:${GAP.grid}px}
    .rs-fcard{background:${T.surface};border:1px solid ${T.line};border-radius:${RAD.lg}px;padding:16px 16px 24px;box-shadow:${SH.xs};display:grid;gap:12px;align-content:start;transition:box-shadow ${MO.base} ${MO.ease},transform ${MO.base} ${MO.ease}}
    .rs-fcard:hover{box-shadow:${SH.glow};transform:translateY(-2px)}
    .rs-fvis{position:relative;height:168px;border-radius:${RAD.md}px;background:${T.bg};overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:16px}
    .rs-cyc>*{grid-area:1/1}
    .rs-cyc>*:not(:first-child){opacity:0}
    .play .rs-cyc>*{animation:rsCyc 9s infinite both}
    .play .rs-cyc>*:nth-child(2){animation-delay:3s}.play .rs-cyc>*:nth-child(3){animation-delay:6s}
    @keyframes rsCyc{0%{opacity:0;transform:translateY(8px)}4%,30%{opacity:1;transform:none}34%,100%{opacity:0;transform:translateY(-8px)}}
    .rs-jobs>span:first-child{background:${T.primaryBg};border-color:${T.primary};color:${T.primary}}
    .play .rs-jobs>span{animation:rsJob 9s infinite both}
    .play .rs-jobs>span:nth-child(2){animation-delay:3s}.play .rs-jobs>span:nth-child(3){animation-delay:6s}
    @keyframes rsJob{0%,33%{background:${T.primaryBg};border-color:${T.primary};color:${T.primary}}34%,100%{background:${T.surface};border-color:${T.line};color:${T.body}}}
    .rs-fhl{background-repeat:no-repeat;background-size:100% 100%;border-radius:4px;padding:0 2px}
    .play .rs-fhl{animation:rsHl 6s infinite both}
    .play .rs-fhl.h2{animation-delay:.8s}
    @keyframes rsHl{0%,8%{background-size:0% 100%}20%,85%{background-size:100% 100%}95%,100%{background-size:0% 100%}}
    .rs-ftag{opacity:1}
    .play .rs-ftag{animation:rsTag 6s infinite both}
    .play .rs-ftag.t2{animation-delay:.3s}
    @keyframes rsTag{0%,22%{opacity:0;transform:translateY(8px)}30%,85%{opacity:1;transform:none}95%,100%{opacity:0}}
    .rs-digits{display:inline-block;height:1em;overflow:hidden;vertical-align:top}
    .rs-digits>span{display:block}
    .play .rs-digits>span{animation:rsDig 10s steps(10) infinite}
    @keyframes rsDig{from{transform:translateY(0)}to{transform:translateY(-10em)}}
    .rs-wave{display:flex;align-items:center;gap:4px;height:40px}
    .rs-wave i{display:block;width:4px;border-radius:2px;background:${T.primary};height:40%}
    .play .rs-wave i{animation:rsWave 1.2s ease-in-out infinite}
    @keyframes rsWave{0%,100%{transform:scaleY(.5)}50%{transform:scaleY(1.4)}}
    .rs-typing{display:none}
    .play .rs-typing{display:inline-flex;position:absolute;top:16px;left:16px;animation:rsTypeA 6s infinite both}
    .play .rs-answer{animation:rsTypeB 6s infinite both}
    @keyframes rsTypeA{0%,40%{opacity:1}45%,100%{opacity:0}}
    @keyframes rsTypeB{0%,44%{opacity:0;transform:translateY(8px)}52%,92%{opacity:1;transform:none}100%{opacity:0}}
    .rs-seg{position:relative;display:grid;grid-template-columns:1fr 1fr;background:${T.surface};border:1px solid ${T.line};border-radius:${RAD.md}px;padding:4px}
    .rs-seg>i{position:absolute;top:4px;bottom:4px;left:4px;width:calc(50% - 4px);border-radius:12px;background:${T.primaryBg};border:1.5px solid ${T.primary}}
    .play .rs-seg>i{animation:rsSeg 6s ${MO.ease} infinite both}
    @keyframes rsSeg{0%,40%{transform:none}50%,90%{transform:translateX(100%)}100%{transform:none}}
    .rs-seg>span{position:relative;text-align:center;padding:8px 4px;font:${F("label")};color:${T.navy}}
    .rs-band{padding:48px}
    /* Article */
    .rs-prose{color:${T.body};font:${F("bodyLg")}}
    .rs-prose h2{font:800 calc(24px * var(--fs))/1.25 ${FD};letter-spacing:-.02em;color:${T.navy};margin:48px 0 16px;scroll-margin-top:${GAP.section + 16}px}
    .rs-prose h3{font:700 calc(18px * var(--fs))/1.4 ${FD};color:${T.navy};margin:32px 0 12px}
    .rs-prose p{margin:0 0 16px}
    .rs-prose ul,.rs-prose ol{margin:0 0 16px;padding-left:24px}
    .rs-prose li{margin:0 0 8px;padding-left:4px}
    .rs-prose strong{color:${T.navy};font-weight:700}
    .rs-prose a{color:${T.primary};font-weight:600;text-underline-offset:3px}
    .rs-prose>:first-child{margin-top:0}
    .rs-callout{border-radius:${RAD.md}px;padding:16px 20px;margin:24px 0;font:${F("bodyLg")}}
    .rs-callout p:last-child,.rs-callout ul:last-child{margin-bottom:0}
    .rs-callout-t{display:flex;align-items:center;gap:8px;font:${F("overline")};letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px}
    .rs-quote{border-left:3px solid ${T.primary};padding:8px 0 8px 24px;margin:32px 0;color:${T.navy};font:${F("quote")}}
    .rs-quote p{margin:0 0 8px}
    .rs-toc a{display:block;padding:8px 0 8px 12px;border-left:2px solid ${T.line};color:${T.body};text-decoration:none;font:${F("small")}}
    .rs-toc a:hover{color:${T.primary};border-left-color:${T.primary}}
    .rs-art{display:grid;grid-template-columns:240px minmax(0,1fr);gap:64px;align-items:start}
    .rs-art-side{position:-webkit-sticky;position:sticky;top:${HEADER_H + 32}px}
    /* Grilles */
    .rs-g2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:${GAP.grid}px}
    .rs-g3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:${GAP.grid}px}
    .rs-g4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:${GAP.grid}px}
    .rs-split{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:64px;align-items:center}
    .rs-chips{display:flex;gap:8px;flex-wrap:wrap}
    .rp-split{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:${GAP.grid}px;align-items:start}
    .rp-stack{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:${GAP.grid}px}
    @media (max-width:1023px){ .rs-g4{grid-template-columns:repeat(2,minmax(0,1fr))} .rs-art{grid-template-columns:minmax(0,1fr);gap:32px} .rs-art-side{position:static} }
    @media (prefers-reduced-motion: reduce){
      *,*::before,*::after{animation-duration:.001ms!important;animation-delay:0s!important;animation-iteration-count:1!important;transition-duration:.001ms!important;transition-delay:0s!important;scroll-behavior:auto!important}
    }
    /* Options d'accessibilité (docs/design-system.md, section 8 bis) : attributs posés sur <html> par src/lib/a11y.js */
    html[data-motion=reduce] *,html[data-motion=reduce] *::before,html[data-motion=reduce] *::after{animation-duration:.001ms!important;animation-delay:0s!important;animation-iteration-count:1!important;transition-duration:.001ms!important;transition-delay:0s!important;scroll-behavior:auto!important}
    html[data-spacing=on] body *{letter-spacing:.12em!important;word-spacing:.16em!important}
    html[data-spacing=on] :is(p,li,dd,dt,label,blockquote,td,th,h1,h2,h3,h4,.rs-prose){line-height:1.8!important}
    html[data-spacing=on] :is(p,li,dd,blockquote,h1,h2,h3,h4){text-align:left!important}
    html[data-spacing=on] p{margin-bottom:.5em}
    html[data-focusmode=on] .rp-deco,html[data-focusmode=on] .rs-fvis{display:none!important}
    html[data-focusmode=on] *,html[data-focusmode=on] *::before,html[data-focusmode=on] *::after{animation-iteration-count:1!important}
    html[data-links=on] a,html[data-links=on] .navlink,html[data-links=on] .rp-link{text-decoration:underline!important;text-underline-offset:3px}
    html[data-focusring=on] :focus-visible{outline:3px solid ${T.navy}!important;outline-offset:3px!important;box-shadow:${SH.ring}!important}
    .rp-ruler{position:fixed;left:0;right:0;z-index:${Z.modal + 1};background:${T.overlay};pointer-events:none}
    /* Point de rupture unique : 760 px (référentiel 6) */
    @media (max-width:760px){
      .rp-hide-m,.rp-rail-other{display:none!important}
      .rp-show-m{display:inline}
      .rp-nav{padding:0 16px!important;height:${HEADER_H_M}px!important;gap:8px}
      /* Boutons de l'en-tête : texte agrandi plafonné à 115 % pour que logo, « Mon espace », accessibilité et menu tiennent sur une ligne */
      .rp-nav button{font-size:calc(13px * min(var(--fs, 1), 1.15))!important}
      .rp-nav nav{gap:8px!important}
      .rp-nav nav .navlink{font-size:calc(13px * var(--fs))}
      .ty-display{font-size:calc(${TY_MOBILE.display}px * var(--fs))!important} .ty-xl{font-size:calc(${TY_MOBILE.xl}px * var(--fs))!important} .ty-h1{font-size:calc(${TY_MOBILE.h1}px * var(--fs))!important} .ty-lead{font-size:calc(${TY_MOBILE.lead}px * var(--fs))!important}
      .rp-pad-sm{padding:${PAD_MOBILE.sm}px!important} .rp-pad-md{padding:${PAD_MOBILE.md}px!important} .rp-pad-lg{padding:${PAD_MOBILE.lg}px!important}
      .rp-page{padding:${PAD_MOBILE.page}!important}
      .rp-btn-sm{min-height:44px!important}
      .rp-actions{flex-direction:column-reverse;align-items:stretch!important}
      .rp-actions>*{width:100%}
      .rp-actions>.rp-back{width:auto;align-self:flex-start}
      .rp-stack,.rp-split{grid-template-columns:minmax(0,1fr)!important}
      .rp-pad,.rs-pad{padding-left:16px!important;padding-right:16px!important}
      .rp-wide-m{width:100%}
      .rp-wide-m>button{width:100%}
      .rp-trust{display:grid!important;grid-template-columns:1fr;gap:0 16px!important}
      .rp-fgroups{grid-template-columns:minmax(0,1fr)!important;gap:16px!important}
      .rp-ai-panel{left:0;right:0;top:auto;bottom:0;width:auto;height:62vh;height:62svh;border-radius:${RAD.lg}px ${RAD.lg}px 0 0}
      @keyframes rpAiIn{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
      html.rp-asst-open .rp-app{padding-bottom:62vh;padding-bottom:62svh}
      .rp-flow{flex-direction:column;gap:20px!important;overflow:visible!important}
      .rp-flow-step{flex:none!important;min-width:0!important}
      .rs-menu{top:${HEADER_H_M}px;padding:16px 16px 40px}
      .rp-account{width:100vw}
      .rs-hero{grid-template-columns:minmax(0,1fr);gap:40px}
      .rs-bubble{left:-8px}
      .rs-card-pos{right:8px!important;width:min(310px,calc(100% - 16px))!important}
      .rs-fcards{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:16px;margin:0 -16px;padding:4px 16px 16px;scroll-padding:0 16px;-webkit-overflow-scrolling:touch}
      .rs-fcard{flex:0 0 82%;scroll-snap-align:start}
      .rs-phrase-in{top:${HEADER_H_M}px;height:calc(100vh - ${HEADER_H_M}px);height:calc(100svh - ${HEADER_H_M}px)}
      .rs-phrase-t{font-size:calc(32px * var(--fs))!important}
      .rs-g2,.rs-g3,.rs-g4,.rs-split{grid-template-columns:minmax(0,1fr);gap:16px}
      .rs-split{gap:32px}
      .rs-panel{top:${HEADER_H_M}px;height:calc(100vh - ${HEADER_H_M}px);height:calc(100svh - ${HEADER_H_M}px);justify-content:flex-start;padding:16px 0}
      .rs-pgrid{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);gap:16px;flex:1}
      .rs-steps-d{display:none!important}
      .rs-tabs-m{display:block}
      .rs-visbox{height:auto!important;min-height:300px}
      .rs-section{padding-top:48px!important}
      .rs-chips.rs-scroll{flex-wrap:nowrap;overflow-x:auto;margin:0 -16px;padding:0 16px 4px}
      .rs-prose h2{font-size:calc(20px * var(--fs))}
      .rs-quote{font-size:calc(18px * var(--fs))}
      .rs-band{padding:32px 24px}
    }
    @media (max-height:520px){ .rs-panel{position:static!important;height:auto!important} }
    @media (max-width:360px){ .rp-hide-xs{display:none!important} }
    /* En-tête des petits écrans : logo réduit, puis option d'accessibilité déplacée dans le menu (elle y est déjà) */
    @media (max-width:420px){ .rp-head-logo .rp-logo-sym{height:30px!important} .rp-head-logo .rp-logo-word{height:28px!important} }
    @media (max-width:359px){ .rp-head-a11y{display:none!important} .rp-nav{padding:0 12px!important} }
    /* Cibles tactiles de 44 px (référentiel 8) sur mobile et sur tout écran tactile */
    @media (max-width:760px),(pointer:coarse){
      .rs-chip,[role=tab]{min-height:44px}
      .rs-toc a{min-height:44px;display:flex;align-items:center}
      .rp-crumbs a,.rp-sources a{display:inline-flex;align-items:center;min-height:44px}
      .rp-ai-bubble a,.rp-ai-bubble button{min-height:44px}
    }
    @media print{header,footer,.noprint{display:none!important}body{background:${T.surface}}}
    ::-webkit-scrollbar{height:8px;width:8px}::-webkit-scrollbar-thumb{background:${T.line};border-radius:4px}
  `}</style>
);

export {
  ORG_NAME, lockScroll, RepetMark, RepetWord, RepetLogo, OrgLogo, Halo, img, Icon, I, SI, Txt, Eyebrow, Bare, Btn, IconBtn, Fab, Link, Back,
  Tag, Card, Notice, Quote, IconTile, Empty, Confirm, ConfirmMark, TimeChip, fmtTime, Field, Input, Textarea, Select, Checkbox, CheckTile,
  Chip, Toggle, Rail, GradHead, Modal, ConfirmDialog, RadioGroup, Menu, BrandLoader, Section, PageHero, Accordion, Tabs, ScrollProgress, GStyle,
};
