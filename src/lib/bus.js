/* Commandes de l'assistant de préparation, utilisables depuis n'importe quel écran (ARC-16) : un petit module
   d'événements, pour que les écrans n'importent pas un composant (et tout son code) pour émettre une commande.
     openAssistant(context)   ouvre le panneau, avec les suggestions du contexte ;
     closeAssistant()         le ferme ;
     nudgeAssistant(reason)   propose la bulle (une fois par raison et par session) ;
     setRecording(on)         masque le bouton flottant pendant un enregistrement. */
export const ASSISTANT_EVENT = "rp-assistant";
const send = detail => window.dispatchEvent(new CustomEvent(ASSISTANT_EVENT, { detail }));
export const openAssistant = context => send({ action: "open", context });
export const nudgeAssistant = reason => send({ action: "nudge", reason });
export const closeAssistant = () => send({ action: "close" });
export const setRecording = on => send({ action: "recording", on });
