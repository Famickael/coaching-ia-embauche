import { prefersReduced } from "../lib/a11y.js";
import { PAGES } from "../content/legal.js";
import { getState } from "../lib/store.js";

export function routeFromHash() {
  const h = location.hash;
  const m = h.match(/^#\/s\/([A-Za-z0-9]{6})$/);
  if (m) return { role: "benef", code: m[1].toUpperCase() };
  if (h === "#/beneficiaire") return { role: "benef", code: null };
  if (h === "#/coach") return { role: "coach" };
  if (h === "#/fonctionnement") { history.replaceState(null, "", "#/solutions"); return { role: "solutions" }; }
  let r = h.match(/^#\/solutions(?:\/([a-z-]+))?$/);
  if (r) return { role: "solutions", section: r[1] };
  r = h.match(/^#\/a-propos(?:\/([a-z-]+))?$/);
  if (r && r[1] === "ia-et-recherche") return { role: "research" };
  if (r) return { role: "about", section: r[1] };
  r = h.match(/^#\/ressources\/c\/([a-z0-9-]+)$/);
  if (r) return { role: "resources", cat: r[1] };
  r = h.match(/^#\/ressources(?:\/([a-z0-9-]+))?$/);
  if (r) return { role: "resources", slug: r[1] };
  r = h.match(/^#\/vos-donnees(?:\/([a-z-]+))?$/);
  if (r) return { role: "legal", page: PAGES[r[1]] && r[1] !== "hub" ? r[1] : "hub" };
  if (h === "#/conditions") return { role: "legal", page: "conditions" };
  if (h === "#/mentions-legales") return { role: "legal", page: "mentions" };
  if (h === "#/accessibilite") return { role: "legal", page: "accessibilite" };
  if (h === "#/demo") return { role: "demo" };
  if (h === "#/espace") return { role: "espace" };
  if (h === "" || h === "#" || h === "#/") return { role: "home" };
  return { role: "notfound" }; // ancre inconnue (BUG-16)
}

/* Titre du document à chaque route (RGAA 8.6). */
export const TITLES = { notfound: "Page introuvable", research: "L'IA et la recherche", home: "S'entraîner à l'entretien d'embauche", about: "À propos", solutions: "Solutions", resources: "Ressources", demo: "Demander une prise en main", espace: "Mon espace", benef: "Mon espace", coach: "Espace coach" };

export const titleOf = (route, counselor) => route.role === "legal" ? PAGES[route.page].title : route.role === "coach" && !counselor ? TITLES.espace : TITLES[route.role] || TITLES.home;

export const reducedMotion = () => prefersReduced();

export const go = hash => { if (location.hash === hash) window.scrollTo({ top: 0 }); else location.hash = hash; };

/* « Mon espace » : rouvre le dernier espace utilisé sur cet appareil, sinon propose le choix. */
export function openSpace() {
  const ls = getState().lastSpace;
  if (ls?.role === "coach" && getState().counselor) return go("#/coach");
  if (ls?.role === "benef" && getState().parcours[ls.code]) return go(`#/s/${ls.code}`);
  go("#/espace");
}

export const PUBLIC = ["notfound", "home", "research", "about", "solutions", "resources", "demo", "legal"];
