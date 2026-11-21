/* Écran de chargement : le balisage et les styles sont dans index.html (visibles avant le JavaScript).
   Cette fonction le retire en fondu au montage de React, après une durée minimale (environ 1,9 s, 0,6 s si « réduire les animations »).
   Durée minimale comptée depuis le début de la navigation : si le JavaScript arrive tard, aucune attente
   supplémentaire. Sous navigateur piloté (tests automatisés), retrait immédiat. */
const MIN_MS = 2500;          // une animation complète : bulles qui se rejoignent (1,3 s), puis trois points (référentiel, section 7)
const MIN_MS_REDUCED = 600;   // « réduire les animations » : écran statique, plus bref
const FADE_MS = 700;          // fondu de sortie (index.html, #rp-loader)
let done = false;

export function dismissLoader() {
  if (done || typeof document === "undefined") return;
  done = true;
  const el = document.getElementById("rp-loader");
  if (!el) return;
  const auto = typeof navigator !== "undefined" && navigator.webdriver;
  const reduced = (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) || document.documentElement.dataset.motion === "reduce";
  if (auto) { el.remove(); return; }
  const wait = Math.max(0, (reduced ? MIN_MS_REDUCED : MIN_MS) - performance.now());
  /* Le site est déjà rendu dessous : le calque fixe passe en opacité 0 (transition sur opacity seulement),
     puis il est retiré à la fin de la transition (transitionend), avec un retrait de secours. */
  setTimeout(() => {
    if (reduced) { el.remove(); return; }
    let gone = false;
    const remove = () => { if (gone) return; gone = true; el.remove(); };
    el.addEventListener("transitionend", e => { if (e.propertyName === "opacity") remove(); });
    setTimeout(remove, FADE_MS + 400);
    requestAnimationFrame(() => el.classList.add("rpl-out"));
  }, wait);
}
