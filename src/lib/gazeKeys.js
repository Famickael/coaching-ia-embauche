/* Coefficients lus par le suivi du regard (gaze.js) : direction des yeux uniquement (SEC-06).
   Aucun coefficient d'expression (sourire, sourcils) n'est lu : aucune émotion n'est déduite (AI Act, art. 5(1)(f)).
   tests/analysis.test.mjs échoue si une clé ne commence pas par « eyeLook » (voir docs/conformite.md). */
export const EYE_KEYS = ["eyeLookDownLeft", "eyeLookDownRight", "eyeLookOutLeft", "eyeLookOutRight", "eyeLookInLeft", "eyeLookInRight"];
