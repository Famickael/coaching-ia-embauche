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
/* Chemin d'une image du dossier public/ (le site est servi sous un sous-dossier). */
const img = p => `${import.meta.env.BASE_URL}img/${p}`;
/* Masques du logo : fichiers de public/img/logo/, mis en cache et préchargés par index.html (PERF-07). */
const LOGO_BUBBLES = img("logo/bulles.png");
const LOGO_DOTS = img("logo/points.png");
const LOGO_ACCENTS = img("logo/accents.png");
const LOGO_LETTERS = img("logo/lettres.png");
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
/* Polices : public/fonts/fonts.css, liée et préchargée par index.html (PERF-03). */
const GStyle = () => (
  <style>{`
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
