/* Petits crochets React partagés par les écrans. */
import { useEffect, useRef } from "react";

/* Avertit avant de fermer ou recharger l'onglet tant qu'une réponse non gardée peut être perdue (BUG-08) :
   enregistrement en cours, relecture avant validation, préparation du retour. */
export function useLeaveGuard(active) {
  useEffect(() => {
    if (!active) return;
    const on = e => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", on);
    return () => window.removeEventListener("beforeunload", on);
  }, [active]);
}

/* Titre du document propre à chaque écran (A11Y-06, RGAA 8.6). App pose le titre de la route dans un effet de mise
   en page ; l'écran l'affine ensuite dans un effet ordinaire, qui passe après. */
export function useTitle(title) {
  useEffect(() => { if (title) document.title = `${title} · La Répét'`; }, [title]);
}

/* Après un changement d'écran (A11Y-02) : focus sur le titre principal (h1 de main), sans défilement, pour que le
   lecteur d'écran l'annonce et que le clavier reparte du contenu. Rien au premier affichage. */
export function useFocusOnChange(key) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const id = requestAnimationFrame(() => focusMainHeading());
    return () => cancelAnimationFrame(id);
  }, [key]); // eslint-disable-line
}
export function focusMainHeading() {
  const h = document.querySelector("main h1") || document.querySelector("main");
  if (!h) return;
  if (!h.hasAttribute("tabindex")) h.setAttribute("tabindex", "-1");
  h.focus({ preventScroll: true });
}
