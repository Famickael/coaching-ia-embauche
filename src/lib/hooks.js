/* Petits crochets React partagés par les écrans. */
import { useEffect } from "react";

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
