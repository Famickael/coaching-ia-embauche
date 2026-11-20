/* Jetons du référentiel UI/UX v3 (docs/design-system.md, section 12.1).
   JavaScript pur, sans JSX : importé par src/ui.jsx (qui les réexporte pour les écrans)
   et par tests/design-lint.mjs (échelles et contrastes). Toute valeur visuelle vient d'ici. */

export const T = {
  // Structure et marque (dominante)
  primary: "#386097", primaryDk: "#2C4D7C", primaryLt: "#4A72A8",
  // Secondaire décoratif (jamais en texte ni en fond de bouton)
  blue: "#3893CD", blueDk: "#2E7CB0",
  // Action principale et points d'appui
  accent: "#0B7A75", accentDk: "#0A6663", accentLt: "#7FD6CF",
  // Assistant (IA) et points à explorer
  violet: "#5C4BB9", lavender: "#736BDE",
  // Sémantique : les teintes claires servent au décor, les « Dk » au texte
  success: "#41C77A", successDk: "#1E7A4A",
  warning: "#FFB547", warningDk: "#8A5A0A",
  error: "#FF5A72", errorDk: "#C62F47",
  // Texte et neutres
  navy: "#1B3A66", body: "#4A5568", muted: "#64748B", faint: "#A4AFBF",
  lineStrong: "#7C8AA0", line: "#E7EBF2", lineLt: "#F0F3F8",
  bg: "#F8FAFC", surface: "#FFFFFF",
  // Fonds teintés (un par teinte, opaques)
  primaryBg: "#EEF2F8", accentBg: "#ECF5F4", violetBg: "#F2F1F9",
  successBg: "#E9F8F0", warningBg: "#FFF6E8", errorBg: "#FFECEF",
  // Voiles et fonds particuliers
  overlay: "rgba(27,58,102,.45)", videoBg: "#000000",
  glass: "rgba(248,250,252,.9)",
  studio: "#DCE6F2",                      // fond uni de remplacement de l'aperçu caméra (échauffement)          // en-tête collant translucide (section 6)
};

/* Texte et éléments posés sur fond sombre, dégradé ou vidéo (section 1.4). */
export const ON = {
  text: "#FFFFFF", chip: "rgba(255,255,255,.2)", line: "rgba(255,255,255,.3)",
  glow: "rgba(255,255,255,.16)", scrim: "rgba(0,0,0,.5)",
};

/* Dégradés (section 1.3). */
export const GRAD_PREMIUM = `linear-gradient(135deg, ${T.primary} 0%, ${T.blueDk} 50%, ${T.violet} 100%)`;
export const GRAD = GRAD_PREMIUM;
export const GRAD_MAIN = `linear-gradient(135deg, ${T.blue} 0%, ${T.violet} 100%)`;
export const GRAD_COACH = `linear-gradient(135deg, ${T.blue} 0%, ${T.accent} 100%)`;
export const GRAD_AI = `linear-gradient(135deg, ${T.blueDk} 0%, ${T.violet} 100%)`;
export const GRAD_SOFT = `linear-gradient(135deg, rgba(56,96,151,.08), rgba(92,75,185,.07))`;
export const GRAD_NIGHT = `linear-gradient(160deg, ${T.navy} 0%, ${T.primaryDk} 60%, ${T.violet} 100%)`;
/* Profondeur et marque (v3.1, demande du propriétaire) : titre d'accroche et fonds des sections clés. */
export const GRAD_TITLE = `linear-gradient(120deg, ${T.navy} 0%, ${T.primary} 100%)`;        // début du titre d'accroche (texte, AA)
export const GRAD_ACCROCHE = `linear-gradient(90deg, ${T.blueDk} 0%, ${T.violet} 100%)`;    // fin d'accroche, mots-clés de la phrase (texte large, AA)
export const GRAD_HERO = `linear-gradient(180deg, ${T.surface} 0%, ${T.primaryBg} 100%)`;   // fond du héros de l'accueil
export const GRAD_SECTION = `linear-gradient(180deg, ${T.bg} 0%, ${T.primaryBg} 50%, ${T.bg} 100%)`; // fond d'une section clé (strate)
/* Lueurs colorées diffuses (halos derrière les photos et les visuels), décor seulement. */
export const GLOW = { blue: "rgba(56,147,205,.22)", violet: "rgba(92,75,185,.20)" };
export const GRAD_PAGE = `linear-gradient(180deg, ${T.primaryBg}, ${T.bg})`;   // fond de PageHero (pages secondaires)
/* Surlignage progressif (strate épinglée, cartes animées) : teintes de fond des rôles. */
export const HL = {
  appui: `linear-gradient(${T.accentBg}, ${T.accentBg})`,
  ai: `linear-gradient(${T.violetBg}, ${T.violetBg})`,
  primary: `linear-gradient(${T.primaryBg}, ${T.primaryBg})`,
};

/* Typographie (section 2). */
export const FD = "'Manrope', 'Segoe UI', sans-serif";
export const FB = "'Inter', 'Segoe UI', sans-serif";
export const FM = "'JetBrains Mono', monospace";
export const SIZES = [11, 12, 13, 14, 16, 18, 20, 24, 26, 28, 32, 38, 54];
export const WEIGHTS = { [FD]: [700, 800], [FB]: [400, 600, 700], [FM]: [500, 700] };
export const TY = {
  display:  { font: `800 54px/1.05 ${FD}`, letterSpacing: "-.035em" },
  xl:       { font: `800 32px/1.15 ${FD}`, letterSpacing: "-.03em" },
  h1:       { font: `800 28px/1.15 ${FD}`, letterSpacing: "-.02em" },
  h2:       { font: `800 20px/1.25 ${FD}`, letterSpacing: "-.01em" },
  h3:       { font: `700 16px/1.3 ${FD}` },
  h4:       { font: `700 14px/1.4 ${FD}` },
  overline: { font: `700 11px/1.3 ${FB}`, letterSpacing: ".08em", textTransform: "uppercase" },
  lead:     { font: `400 18px/1.6 ${FB}` },
  bodyLg:   { font: `400 16px/1.6 ${FB}` },
  body:     { font: `400 14px/1.6 ${FB}` },
  bodyStrong: { font: `600 14px/1.5 ${FB}` },
  small:    { font: `400 13px/1.5 ${FB}` },
  caption:  { font: `400 12px/1.5 ${FB}` },
  label:    { font: `600 13px/1.3 ${FB}` },
  btnSm:    { font: `600 13px/1 ${FB}` }, btn: { font: `600 14px/1 ${FB}` }, btnLg: { font: `600 16px/1 ${FB}` },
  link:     { fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 },
  strong:   { fontWeight: 700 },                                      // <strong> dans un paragraphe
  input:    { font: `400 16px/1.5 ${FB}` },
  tag:      { font: `600 12px/1 ${FB}`, letterSpacing: ".02em" },
  num:      { font: `700 28px/1 ${FM}` },
  code:     { font: `700 24px/1 ${FM}`, letterSpacing: ".25em" },
  time:     { font: `700 11px/1 ${FM}` },
  mono:     { font: `500 12px/1.5 ${FM}` },
  /* Exceptions nommées : rendus validés (accueil) dont la taille reste dans SIZES */
  quote:    { font: `700 20px/1.45 ${FD}` },                          // citation d'article, phrase qui se colore (mobile)
  pageTitle: { font: `800 38px/1.1 ${FD}`, letterSpacing: "-.03em" }, // h1 des pages secondaires (PageHero)
  inherit:  { font: "inherit" },
};
export const TY_MOBILE = { display: 38, xl: 26, h1: 24, lead: 16 };   // appliqué par les classes .ty-* de GStyle

/* Espacement (section 3). */
export const SPACE = [0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80];
export const sp = n => n * 4;
export const PAD = { sm: 16, md: 24, lg: 32, row: "16px 24px", notice: "12px 16px", page: "40px 24px 64px" };
export const PAD_MOBILE = { sm: 16, md: 20, lg: 24, row: "16px 20px", page: "24px 16px 48px" };
export const GAP = { section: 80, block: 32, grid: 24, stack: 12, field: 20, actions: 12 };
export const W = { page: 1200, wide: 1120, read: 760, form: 600, narrow: 440 };
export const HEADER_H = 64, HEADER_H_M = 56;

/* Formes (section 4). */
export const RAD = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32, pill: 999 };
export const SH = {
  xs: "0 2px 6px rgba(27,58,102,.05)",
  sm: "0 8px 20px rgba(27,58,102,.07)",
  lg: "0 20px 60px rgba(27,58,102,.10)",
  ring: `0 0 0 4px ${T.primaryBg}`,
  /* Ombres colorées diffuses (v3.1) : photos et visuels du héros, visuel de la strate, bandeau d'appel final */
  glow: "0 32px 64px -16px rgba(56,96,151,.30), 0 12px 32px -12px rgba(56,147,205,.22)",
  glowAi: "0 32px 64px -16px rgba(92,75,185,.28), 0 12px 32px -12px rgba(56,96,151,.18)",
  /* Ombres colorées des boutons pleins [repos, survol], utilisées par Btn uniquement */
  btn: {
    primary: ["0 4px 12px rgba(56,96,151,.20)", "0 8px 20px rgba(56,96,151,.30)"],
    objective: ["0 4px 12px rgba(11,122,117,.20)", "0 8px 20px rgba(11,122,117,.30)"],
    ai: ["0 4px 12px rgba(92,75,185,.24)", "0 8px 20px rgba(92,75,185,.34)"],
    white: ["0 4px 12px rgba(27,58,102,.15)", "0 8px 20px rgba(27,58,102,.25)"],
  },
};
export const ringOf = bg => `0 0 0 4px ${bg}`;

/* Mouvement (section 7). */
export const MO = {
  fast: ".12s", base: ".2s", enter: ".45s", ease: "cubic-bezier(.2,.7,.3,1)",   // interface : survol, sélection, apparition d'écran
  reveal: ".7s", slow: ".9s", fade: "1.1s", soft: "cubic-bezier(.45,0,.55,1)",   // pages publiques (v3.1) : apparitions, étapes, fondus de scène
};
/* Cadence des éléments qui tournent seuls (ms) : scènes du héros, fin d'accroche. */
export const PACE = { scene: 11500, accroche: 5000 };
export const Z = { nav: 50, modal: 100 };

/* Champ de saisie (section 5.3). */
export const INPUT = {
  width: "100%", height: 48, padding: "0 16px", borderRadius: RAD.md, border: `1.5px solid ${T.lineStrong}`,
  background: T.surface, color: T.navy, ...TY.input,
};

/* Rôle → couleurs, pour Tag, Notice, repères, observations (section 5.4). */
export const TONE = {
  primary: { fg: T.primary, bg: T.primaryBg }, appui: { fg: T.accent, bg: T.accentBg }, ai: { fg: T.violet, bg: T.violetBg },
  success: { fg: T.successDk, bg: T.successBg }, warning: { fg: T.warningDk, bg: T.warningBg }, error: { fg: T.errorDk, bg: T.errorBg },
  muted: { fg: T.body, bg: T.lineLt },
};

/* Combinaisons texte/fond autorisées (section 1.5) : [texte, fond, seuil]. Vérifiées par la règle A1. */
export const PAIRS = [
  [T.navy, T.surface, 4.5], [T.navy, T.bg, 4.5], [T.navy, T.primaryBg, 4.5], [T.navy, T.accentBg, 4.5], [T.navy, T.violetBg, 4.5],
  [T.navy, T.successBg, 4.5], [T.navy, T.warningBg, 4.5], [T.navy, T.errorBg, 4.5],
  [T.body, T.surface, 4.5], [T.body, T.bg, 4.5], [T.body, T.primaryBg, 4.5], [T.body, T.accentBg, 4.5], [T.body, T.successBg, 4.5], [T.body, T.lineLt, 4.5],
  [T.muted, T.surface, 4.5], [T.muted, T.bg, 4.5],
  [T.primary, T.surface, 4.5], [T.primary, T.bg, 4.5], [T.primary, T.primaryBg, 4.5],
  [T.primaryDk, T.surface, 4.5], [T.primaryDk, T.bg, 4.5], [T.primaryDk, T.primaryBg, 4.5],
  [T.accent, T.surface, 4.5], [T.accent, T.bg, 4.5], [T.accent, T.accentBg, 4.5],
  [T.violet, T.surface, 4.5], [T.violet, T.bg, 4.5], [T.violet, T.violetBg, 4.5],
  [T.successDk, T.surface, 4.5], [T.successDk, T.successBg, 4.5],
  [T.warningDk, T.surface, 4.5], [T.warningDk, T.warningBg, 4.5],
  [T.errorDk, T.surface, 4.5], [T.errorDk, T.bg, 4.5], [T.errorDk, T.errorBg, 4.5],
  [T.surface, T.primary, 4.5], [T.surface, T.primaryDk, 4.5], [T.surface, T.accent, 4.5], [T.surface, T.accentDk, 4.5],
  [T.surface, T.violet, 4.5], [T.surface, T.errorDk, 4.5], [T.surface, T.successDk, 4.5], [T.surface, T.blueDk, 4.5], [T.surface, T.navy, 4.5],
  [T.accentLt, T.navy, 4.5],
  [T.lineStrong, T.surface, 3], [T.lineStrong, T.bg, 3],
  // dégradés de texte de l'accueil (texte de 32 px et plus : seuil 3) ; GRAD_TITLE commence en navy
  [T.primary, T.primaryBg, 3], [T.blueDk, T.bg, 3], [T.blueDk, T.primaryBg, 3], [T.violet, T.primaryBg, 3],
];
