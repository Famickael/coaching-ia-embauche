/* Lecture d'une réponse enregistrée (« take » dans les données) : utilitaires partagés par les écrans.
   hasMedia remplace hasVideo (BUG-06) : une réponse en voix seule a un enregistrement, pas une vidéo.
   L'ancien champ reste lu pour les réponses déjà enregistrées sur l'appareil. */
export const hasMedia = t => !!(t && (t.hasMedia ?? t.hasVideo));
export const isAudio = t => !!t?.mime?.startsWith("audio");
/* La personne a refusé le retour de l'assistant (BUG-05) : aucun repère, aucune synthèse à afficher. */
export const noFeedback = t => t?.analysis?.source === "none";
