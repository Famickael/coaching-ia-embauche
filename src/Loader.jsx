/* Écran de chargement : le balisage et les styles sont dans index.html (visibles avant le JavaScript).
   Cette fonction le retire en fondu au montage de React, après une durée minimale courte.
   Durée minimale comptée depuis le début de la navigation : si le JavaScript arrive tard, aucune attente
   supplémentaire. Sous navigateur piloté (tests automatisés), retrait immédiat. */
const MIN_MS = 600;
let done = false;

export function dismissLoader() {
  if (done || typeof document === "undefined") return;
  done = true;
  const el = document.getElementById("rp-loader");
  if (!el) return;
  const auto = typeof navigator !== "undefined" && navigator.webdriver;
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (auto) { el.remove(); return; }
  const wait = Math.max(0, MIN_MS - performance.now());
  setTimeout(() => {
    el.classList.add("rpl-out");
    setTimeout(() => el.remove(), reduced ? 0 : 320);
  }, wait);
}
