import React, { useEffect, useId, useRef, useState } from "react";
import { T, FD, FB, FM, RAD, SH, Icon } from "./ui.jsx";
import { Reveal } from "./motion.jsx";

/* Pages publiques (site) : jetons du référentiel v3 encore absents de ui.jsx, styles et composants partagés.
   Les valeurs reprennent exactement docs/design-system.md (sections 1, 2, 3, 12.1). Quand src/tokens.js
   existera, ces objets pourront être remplacés par un import sans toucher aux pages. */

export const TT = {
  primaryBg: "#EEF2F8", violetBg: "#F2F1F9", successDk: "#1E7A4A", warningDk: "#8A5A0A",
  lineStrong: "#7C8AA0", overlay: "rgba(27,58,102,.45)",
};
export const ON = { text: "#FFFFFF", chip: "rgba(255,255,255,.2)", line: "rgba(255,255,255,.3)", glow: "rgba(255,255,255,.16)", scrim: "rgba(0,0,0,.5)" };
export const TY = {
  display: { font: `800 54px/1.05 ${FD}`, letterSpacing: "-.035em" },
  xl: { font: `800 32px/1.15 ${FD}`, letterSpacing: "-.03em" },
  h1: { font: `800 28px/1.15 ${FD}`, letterSpacing: "-.02em" },
  h2: { font: `800 20px/1.25 ${FD}`, letterSpacing: "-.01em" },
  h3: { font: `700 16px/1.3 ${FD}` },
  h4: { font: `700 14px/1.4 ${FD}` },
  overline: { font: `700 11px/1.3 ${FB}`, letterSpacing: ".08em", textTransform: "uppercase" },
  lead: { font: `400 18px/1.6 ${FB}` },
  bodyLg: { font: `400 16px/1.6 ${FB}` },
  body: { font: `400 14px/1.6 ${FB}` },
  bodyStrong: { font: `600 14px/1.5 ${FB}` },
  small: { font: `400 13px/1.5 ${FB}` },
  caption: { font: `400 12px/1.5 ${FB}` },
  label: { font: `600 13px/1.3 ${FB}` },
  input: { font: `400 16px/1.5 ${FB}` },
  tag: { font: `600 12px/1 ${FB}`, letterSpacing: ".02em" },
  time: { font: `700 11px/1 ${FM}` },
  mono: { font: `500 12px/1.5 ${FM}` },
  num: { font: `700 28px/1 ${FM}` },
};
export const W = { page: 1200, wide: 1120, read: 760, form: 600, narrow: 440 };
export const MO = { fast: ".12s", base: ".2s", enter: ".45s", ease: "cubic-bezier(.2,.7,.3,1)" };
export const HEADER_H = 64, HEADER_H_M = 56;

/* Chemin d'une image du dossier public/ (le site est servi sous un sous-dossier). */
export const img = p => `${import.meta.env.BASE_URL}img/${p}`;

/* Icônes propres aux pages publiques (même gabarit que I dans ui.jsx). */
export const SI = {
  menu: <><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></>,
  chevron: <polyline points="6 9 12 15 18 9" />,
  chevronR: <polyline points="9 6 15 12 9 18" />,
  arrowL: <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>,
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
  list: <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>,
};

/* ─── Styles du site (classes rs-*, tailles mobiles .ty-*) ─── */
export const SiteStyle = () => (
  <style>{`
    .rs-sr{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
    a:focus-visible,[role=tab]:focus-visible,[tabindex]:focus-visible,summary:focus-visible{outline:2px solid ${T.primary};outline-offset:2px}
    .rs-on-dark :focus-visible{outline-color:#fff}
    .rs-link{color:${T.primary};font-weight:600;text-decoration:underline;text-underline-offset:3px}
    .rs-link:hover{color:${T.primaryDk}}
    /* En-tête */
    .rs-progress{position:absolute;left:0;right:0;bottom:-1px;height:3px;background:${T.primary};transform-origin:0 50%;transform:scaleX(0);pointer-events:none}
    .rs-burger{display:none}
    .rs-menu{position:fixed;left:0;right:0;bottom:0;top:${HEADER_H}px;z-index:49;background:${T.bg};overflow-y:auto;padding:24px 24px 48px;display:flex;flex-direction:column;gap:8px;animation:rsMenu ${MO.base} ${MO.ease} both}
    @keyframes rsMenu{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
    .rs-menu a.rs-mlink{display:flex;align-items:center;justify-content:space-between;min-height:56px;padding:0 4px;border-bottom:1px solid ${T.line};text-decoration:none;color:${T.navy};font:800 20px/1.25 ${FD}}
    .rs-menu a.rs-mlink[aria-current=page]{color:${T.primary}}
    @media (max-width:1023px){ .rs-links,.rs-demo{display:none!important} .rs-burger{display:inline-flex} }
    /* Boutons et éléments interactifs du site */
    .rs-chip{display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 16px;border-radius:${RAD.pill}px;border:1.5px solid ${T.line};background:${T.surface};color:${T.body};cursor:pointer;font:600 13px/1 ${FB};white-space:nowrap;transition:background-color ${MO.fast},border-color ${MO.fast},color ${MO.fast}}
    .rs-chip:hover{border-color:${T.primary};color:${T.primary}}
    .rs-chip[aria-pressed=true]{background:${TT.primaryBg};border-color:${T.primary};color:${T.primary}}
    .rs-icbtn{width:44px;height:44px;border-radius:50%;display:inline-grid;place-items:center;border:1px solid ${T.line};background:${T.surface};color:${T.primary};cursor:pointer;flex-shrink:0;transition:border-color ${MO.fast}}
    .rs-icbtn:hover{border-color:${T.primary}}
    .rs-textbtn{background:none;border:none;padding:12px 0;cursor:pointer;color:${T.primary};font:600 14px/1 ${FB};text-decoration:underline;text-underline-offset:3px}
    .rs-card-btn{display:block;width:100%;text-align:left;background:${T.surface};border:1px solid ${T.line};border-radius:${RAD.lg}px;padding:0;cursor:pointer;box-shadow:${SH.xs};overflow:hidden;color:inherit;font:inherit;transition:box-shadow ${MO.base} ${MO.ease},transform ${MO.base} ${MO.ease},border-color ${MO.fast}}
    .rs-card-btn:hover{box-shadow:${SH.lg};transform:translateY(-2px)}
    /* Accordéon */
    .rs-acc{border-bottom:1px solid ${T.line}}
    .rs-acc-btn{width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:56px;padding:16px 0;background:none;border:none;cursor:pointer;text-align:left;color:${T.navy};font:700 16px/1.3 ${FD}}
    .rs-acc-btn:hover{color:${T.primary}}
    .rs-acc-btn svg{transition:transform ${MO.base} ${MO.ease};flex-shrink:0}
    .rs-acc-btn[aria-expanded=true] svg{transform:rotate(180deg)}
    .rs-acc-panel{padding:0 0 20px;color:${T.body};font:400 14px/1.6 ${FB};max-width:720px}
    .rs-acc-panel p{margin:0 0 12px}.rs-acc-panel p:last-child{margin:0}
    /* Champs */
    .rs-input{width:100%;height:48px;padding:0 16px;border-radius:${RAD.md}px;border:1.5px solid ${TT.lineStrong};background:${T.surface};color:${T.navy};font:400 16px/1.5 ${FB};transition:border-color ${MO.fast},box-shadow ${MO.fast}}
    textarea.rs-input{height:auto;min-height:120px;padding:12px 16px;resize:vertical}
    select.rs-input{appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23386097' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 16px center;padding-right:44px}
    .rs-input::placeholder{color:${T.muted}}
    .rs-input:focus{outline:none;border-color:${T.primary}!important;box-shadow:0 0 0 4px ${TT.primaryBg}!important}
    .rs-input[aria-invalid=true]{border-color:${T.errorDk}}
    .rs-check{display:flex;gap:12px;align-items:flex-start;cursor:pointer;color:${T.body};font:400 14px/1.6 ${FB}}
    .rs-check input{width:22px;height:22px;margin:0;flex-shrink:0;accent-color:${T.primary};cursor:pointer;margin-top:1px}
    /* Héros */
    .rs-hero{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:64px;align-items:center}
    .rs-rot{display:grid}
    .rs-rot>span{grid-area:1/1;opacity:0;transform:translateY(.3em);transition:opacity ${MO.enter} ${MO.ease},transform ${MO.enter} ${MO.ease};padding-bottom:.08em}
    .rs-rot>span.on{opacity:1;transform:none}
    .rs-stage{position:relative;width:100%;max-width:440px;margin:0 auto}
    .rs-scene{position:absolute;inset:0;opacity:0;visibility:hidden;transition:opacity .6s ${MO.ease},visibility 0s linear .6s}
    .rs-scene.on{position:relative;opacity:1;visibility:visible;transition:opacity .6s ${MO.ease},visibility 0s}
    .rs-pop{opacity:0;transform:translateY(12px);transition:opacity ${MO.enter} ${MO.ease},transform ${MO.enter} ${MO.ease}}
    .on .rs-pop{opacity:1;transform:none}
    .on .rs-pop.d1{transition-delay:.25s}.on .rs-pop.d2{transition-delay:.6s}
    .rs-bubble{left:-32px}
    .rs-dot{width:44px;height:44px;border:none;background:none;padding:0;cursor:pointer;display:inline-grid;place-items:center}
    .rs-dot i{display:block;height:8px;width:8px;border-radius:4px;background:${T.faint};transition:width ${MO.base} ${MO.ease},background-color ${MO.base}}
    .rs-dot[aria-current=true] i{width:24px;background:${T.primary}}
    /* Strate épinglée */
    .rs-strate{position:relative}
    .rs-panel{position:-webkit-sticky;position:sticky;top:${HEADER_H}px;height:calc(100vh - ${HEADER_H}px);height:calc(100svh - ${HEADER_H}px);display:flex;flex-direction:column;justify-content:center;padding:24px 0;overflow:hidden}
    .rs-pgrid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:64px;align-items:center;min-height:0}
    .rs-step{display:flex;gap:16px;width:100%;text-align:left;background:none;border:none;padding:12px 0;cursor:pointer;color:inherit;font:inherit}
    .rs-step-bar{position:relative;width:3px;border-radius:2px;background:${T.line};flex-shrink:0;overflow:hidden}
    .rs-step-bar i{position:absolute;left:0;right:0;top:0;height:100%;background:${T.primary};transform-origin:50% 0;transform:scaleY(0)}
    .rs-step-d{display:grid;grid-template-rows:0fr;transition:grid-template-rows ${MO.enter} ${MO.ease},opacity ${MO.enter};opacity:0}
    .rs-step-d>div{overflow:hidden}
    .rs-step.on .rs-step-d{grid-template-rows:1fr;opacity:1}
    .rs-vis{position:absolute;inset:0;opacity:0;transform:translateY(12px);transition:opacity ${MO.enter} ${MO.ease},transform ${MO.enter} ${MO.ease};pointer-events:none}
    .rs-vis.on{opacity:1;transform:none}
    .rs-tabs-m{display:none}
    .rs-in{opacity:0;transform:translateY(10px);transition:opacity .4s ${MO.ease},transform .4s ${MO.ease}}
    .on .rs-in{opacity:1;transform:none}
    .rs-hl{background-repeat:no-repeat;background-size:0% 100%;transition:background-size .5s ease;border-radius:4px;padding:0 2px}
    .on .rs-hl{background-size:100% 100%}
    .rs-knob{left:3px;transition:left .25s ease .6s}
    .on .rs-knob{left:21px}
    .rs-track{background:${TT.lineStrong};transition:background-color .25s ease .6s}
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
    /* Article */
    .rs-prose{color:${T.body};font:400 16px/1.7 ${FB}}
    .rs-prose h2{font:800 24px/1.25 ${FD};letter-spacing:-.02em;color:${T.navy};margin:48px 0 16px;scroll-margin-top:96px}
    .rs-prose h3{font:700 18px/1.4 ${FD};color:${T.navy};margin:32px 0 12px}
    .rs-prose p{margin:0 0 16px}
    .rs-prose ul,.rs-prose ol{margin:0 0 16px;padding-left:24px}
    .rs-prose li{margin:0 0 8px;padding-left:4px}
    .rs-prose strong{color:${T.navy};font-weight:700}
    .rs-prose a{color:${T.primary};font-weight:600;text-underline-offset:3px}
    .rs-prose>:first-child{margin-top:0}
    .rs-callout{border-radius:${RAD.md}px;padding:16px 20px;margin:24px 0;font:400 15px/1.6 ${FB}}
    .rs-callout p:last-child,.rs-callout ul:last-child{margin-bottom:0}
    .rs-callout-t{display:flex;align-items:center;gap:8px;font:700 11px/1.3 ${FB};letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px}
    .rs-quote{border-left:3px solid ${T.primary};padding:8px 0 8px 24px;margin:32px 0;color:${T.navy};font:700 20px/1.45 ${FD}}
    .rs-quote p{margin:0 0 8px}
    .rs-toc a{display:block;padding:8px 0 8px 12px;border-left:2px solid ${T.line};color:${T.body};text-decoration:none;font:400 13px/1.5 ${FB}}
    .rs-toc a:hover{color:${T.primary};border-left-color:${T.primary}}
    .rs-art{display:grid;grid-template-columns:240px minmax(0,1fr);gap:64px;align-items:start}
    .rs-art-side{position:-webkit-sticky;position:sticky;top:96px}
    /* Grilles */
    .rs-g2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}
    .rs-g3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
    .rs-g4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px}
    .rs-split{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:64px;align-items:center}
    .rs-chips{display:flex;gap:8px;flex-wrap:wrap}
    @media (max-width:1023px){ .rs-g4{grid-template-columns:repeat(2,minmax(0,1fr))} .rs-art{grid-template-columns:minmax(0,1fr);gap:32px} .rs-art-side{position:static} }
    @media (max-width:760px){
      .ty-display{font-size:38px!important} .ty-xl{font-size:26px!important} .ty-h1{font-size:24px!important} .ty-lead{font-size:16px!important}
      .rs-menu{top:${HEADER_H_M}px;padding:16px 16px 40px}
      .rs-hero{grid-template-columns:minmax(0,1fr);gap:40px}
      .rs-bubble{left:-8px}
      .rs-g2,.rs-g3,.rs-g4,.rs-split{grid-template-columns:minmax(0,1fr);gap:16px}
      .rs-split{gap:32px}
      .rs-panel{top:${HEADER_H_M}px;height:calc(100vh - ${HEADER_H_M}px);height:calc(100svh - ${HEADER_H_M}px);justify-content:flex-start;padding:16px 0}
      .rs-pgrid{grid-template-columns:minmax(0,1fr);gap:16px;flex:1}
      .rs-steps-d{display:none}
      .rs-tabs-m{display:block}
      .rs-visbox{height:auto!important;flex:1;min-height:280px}
      .rs-section{padding-top:48px!important}
      .rs-pad{padding-left:16px!important;padding-right:16px!important}
      .rs-chips.rs-scroll{flex-wrap:nowrap;overflow-x:auto;margin:0 -16px;padding:0 16px 4px}
      .rs-prose h2{font-size:20px}
      .rs-quote{font-size:18px}
    }
  `}</style>
);

/* ─── Composants partagés ─── */
export const Eyebrow = ({ children, c = T.primary }) => (
  <div style={{ ...TY.overline, color: c }}>{children}</div>
);

export const Section = ({ id, eyebrow, title, sub, children, first }) => (
  <section id={id} className="rs-section" style={{ paddingTop: first ? 48 : 80, scrollMarginTop: 80 }}>
    <Reveal>
      <div style={{ display: "grid", gap: 12, maxWidth: W.read }}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="ty-xl" style={{ ...TY.xl, color: T.navy, margin: 0 }}>{title}</h2>
        {sub && <p className="ty-lead" style={{ ...TY.lead, color: T.body, margin: 0 }}>{sub}</p>}
      </div>
    </Reveal>
    <div style={{ marginTop: 32 }}>{children}</div>
  </section>
);

/* En-tête des pages secondaires : surtitre, titre, chapeau, visuel facultatif. */
export function PageHero({ eyebrow, title, lead, children, aside }) {
  return (
    <section style={{ background: `linear-gradient(180deg, ${TT.primaryBg}, ${T.bg})`, borderBottom: `1px solid ${T.line}` }}>
      <div className="rs-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: "64px 24px" }}>
        <div className={aside ? "rs-split" : undefined}>
          <div className="up" style={{ display: "grid", gap: 16, maxWidth: W.read }}>
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <h1 className="ty-xl" style={{ ...TY.xl, fontSize: 38, color: T.navy, margin: 0 }}>{title}</h1>
            {lead && <p className="ty-lead" style={{ ...TY.lead, color: T.body, margin: 0 }}>{lead}</p>}
            {children}
          </div>
          {aside}
        </div>
      </div>
    </section>
  );
}

export const IconTile = ({ icon, c = T.primary, bg = TT.primaryBg, s = 40 }) => (
  <div aria-hidden style={{ width: s, height: s, borderRadius: RAD.sm, background: bg, display: "grid", placeItems: "center", flexShrink: 0 }}>
    <Icon d={icon} s={s >= 48 ? 24 : 20} c={c} />
  </div>
);

export const Chip = ({ pressed, onClick, children, ...rest }) => (
  <button type="button" className="rs-chip" aria-pressed={pressed ? "true" : "false"} onClick={onClick} {...rest}>{children}</button>
);

export const IconBtn = ({ icon, label, onClick, ...rest }) => (
  <button type="button" className="rs-icbtn" aria-label={label} title={label} onClick={onClick} {...rest}><Icon d={icon} s={20} /></button>
);

export const TextBtn = ({ onClick, children, style }) => (
  <button type="button" className="rs-textbtn" onClick={onClick} style={style}>{children}</button>
);

/* Carte cliquable rendue en bouton (référentiel 5.5). */
export const CardButton = ({ onClick, children, label, style }) => (
  <button type="button" className="rs-card-btn" onClick={onClick} aria-label={label} style={style}>{children}</button>
);

/* Accordéon : bouton aria-expanded relié à son panneau, ouvrable au clavier (Entrée, Espace). */
export function Accordion({ items, idPrefix }) {
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
                <span>{q}</span><Icon d={SI.chevron} s={20} c={T.primary} />
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

/* Champs de formulaire (référentiel 5.3). */
export function Field({ id, label, hint, error, children }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "grid", gap: 4 }}>
        <label htmlFor={id} style={{ ...TY.label, color: T.navy }}>{label}</label>
        {hint && <span id={`${id}-h`} style={{ ...TY.caption, color: T.muted }}>{hint}</span>}
      </div>
      {children}
      {error && <span id={`${id}-e`} role="alert" style={{ ...TY.small, color: T.errorDk }}>{error}</span>}
    </div>
  );
}
const describedBy = (id, hint, error) => [hint && `${id}-h`, error && `${id}-e`].filter(Boolean).join(" ") || undefined;
export const Input = ({ id, hint, error, ...rest }) => (
  <input id={id} className="rs-input" aria-invalid={error ? "true" : undefined} aria-describedby={describedBy(id, hint, error)} {...rest} />
);
export const Textarea = ({ id, hint, error, ...rest }) => (
  <textarea id={id} className="rs-input" aria-invalid={error ? "true" : undefined} aria-describedby={describedBy(id, hint, error)} {...rest} />
);
export const Select = ({ id, hint, error, options, placeholder, ...rest }) => (
  <select id={id} className="rs-input" aria-invalid={error ? "true" : undefined} aria-describedby={describedBy(id, hint, error)} {...rest}>
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);
export const Checkbox = ({ id, checked, onChange, children, error }) => (
  <div style={{ display: "grid", gap: 8 }}>
    <label className="rs-check" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} aria-invalid={error ? "true" : undefined} aria-describedby={error ? `${id}-e` : undefined} />
      <span>{children}</span>
    </label>
    {error && <span id={`${id}-e`} role="alert" style={{ ...TY.small, color: T.errorDk }}>{error}</span>}
  </div>
);

/* Barre de progression de lecture : un seul écouteur passif, mise à jour par requestAnimationFrame. */
export function ScrollProgress() {
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

/* Lien interne en bouton-texte souligné. */
export const linkStyle = { ...TY.bodyStrong, color: T.primary, textDecoration: "underline", textUnderlineOffset: 3 };
