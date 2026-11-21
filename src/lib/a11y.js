/* Options d'accessibilité : lecture, enregistrement (localStorage, avec try/catch) et application sur <html>.
   Appliquées avant le premier rendu (src/main.jsx, et script en ligne d'index.html pour le thème) : pas de flash.
   Au premier passage, les préférences du système sont respectées (thème, contraste, animations). */

import { LIGHT, DARK } from "../tokens.js";

export const A11Y_KEY = "larepet.a11y";
export const FONT_SCALES = [1, 1.125, 1.25, 1.5];                     // taille du texte : 4 niveaux
export const FONT_LABELS = ["Normale", "Grande", "Très grande", "Maximale"];
export const DEFAULTS = {
  size: 0,            // index dans FONT_SCALES
  theme: "auto",      // auto | light | dark
  contrast: false,    // contraste renforcé
  readable: false,    // police lisible (Atkinson Hyperlegible)
  spacing: false,     // espacement des lettres, des mots et des lignes, texte aligné à gauche
  motion: false,      // réduire les animations (en plus du réglage du système)
  focus: false,       // mode concentration : masque halos, photos décoratives, cartes animées, défilements automatiques
  ruler: false,       // règle de lecture
  links: false,       // liens toujours soulignés
  focusRing: false,   // focus renforcé
};

const mq = q => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(q).matches;

export function loadA11y() {
  try {
    const raw = localStorage.getItem(A11Y_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { /* stockage indisponible */ }
  return { ...DEFAULTS, contrast: mq("(prefers-contrast: more)") };   // premier passage : préférences du système
}

export function saveA11y(s) {
  try { localStorage.setItem(A11Y_KEY, JSON.stringify(s)); } catch { /* stockage indisponible */ }
}

export function resetA11y() {
  try { localStorage.removeItem(A11Y_KEY); } catch { /* stockage indisponible */ }
  return { ...DEFAULTS, contrast: mq("(prefers-contrast: more)") };
}

/* Thème effectivement affiché (auto suit le système). */
export const effectiveTheme = s => (s.theme === "auto" ? (mq("(prefers-color-scheme: dark)") ? "dark" : "light") : s.theme);

export function applyA11y(s) {
  if (typeof document === "undefined") return;
  const h = document.documentElement, d = h.dataset;
  d.theme = s.theme;
  d.contrast = s.contrast ? "more" : "normal";
  d.font = s.readable ? "lisible" : "normal";
  d.spacing = s.spacing ? "on" : "off";
  d.motion = s.motion ? "reduce" : "auto";
  d.focusmode = s.focus ? "on" : "off";
  d.links = s.links ? "on" : "off";
  d.focusring = s.focusRing ? "on" : "off";
  h.style.setProperty("--fs", String(FONT_SCALES[s.size] || 1));
  /* Texte agrandi (125 % et plus) ou espacé : l'en-tête bascule plus tôt sur le menu repliable (GStyle). */
  d.textsize = (FONT_SCALES[s.size] || 1) >= 1.25 || s.spacing ? "lg" : "normal";
  /* Thème automatique : « light dark » suit le système sans dépendre d'un écouteur (A11Y-21). */
  h.style.colorScheme = s.theme === "auto" ? "light dark" : s.theme;
  /* Couleur de la barre du navigateur (A11Y-20) : suit le système, ou le thème choisi. */
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => {
    const sys = (m.getAttribute("media") || "").includes("dark") ? "dark" : "light";
    m.setAttribute("content", (s.theme === "auto" ? sys : s.theme) === "dark" ? DARK.bg : LIGHT.bg);
  });
  window.dispatchEvent(new CustomEvent("rp-a11y", { detail: s }));
}

/* Mouvement réduit : réglage du système ou option du site ; withFocus : le mode concentration compte aussi (il arrête
   les défilements automatiques et les cartes animées). Détection unique du site (ARC-13). */
export const prefersReduced = (withFocus = false) => mq("(prefers-reduced-motion: reduce)")
  || (typeof document !== "undefined" && (document.documentElement.dataset.motion === "reduce" || (withFocus && document.documentElement.dataset.focusmode === "on")));
/* Mode concentration : pas de défilement automatique, pas de carte animée. */
export const focusMode = () => typeof document !== "undefined" && document.documentElement.dataset.focusmode === "on";
