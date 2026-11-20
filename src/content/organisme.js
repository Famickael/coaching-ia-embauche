/* Configuration de l'organisme qui déploie La Répét' : SEUL fichier à compléter.
   Chaque valeur null s'affiche « À compléter par l'organisme » dans les pages « Vos données »,
   « Mentions légales », « Conditions » et « Accessibilité ». Aucune valeur n'est inventée ici.
   Voir docs/conformite.md (sections 2.1, 2.6, 2.8 et 5) pour ce que chaque champ doit contenir. */

/* Mode des textes : « prototype » tant qu'aucun serveur n'existe (tout reste dans le navigateur),
   « production » quand VITE_BACKEND_URL est défini. Les textes « production » ne doivent jamais
   s'afficher tant que l'hébergement réel n'existe pas (docs/conformite.md, écart R3). */
export const MODE = import.meta.env?.VITE_BACKEND_URL ? "production" : "prototype";

export const ORG = {
  /* Responsable de traitement (RGPD, art. 13(1)(a)) */
  name: null,            // nom ou raison sociale
  legalForm: null,       // forme juridique
  address: null,         // adresse du siège
  registration: null,    // SIREN, SIRET ou RNA, s'il existe
  email: null,           // courriel de contact
  phone: null,           // téléphone de contact
  /* Délégué à la protection des données (RGPD, art. 13(1)(b)) */
  dpo: null,             // nom ou service
  dpoEmail: null,        // courriel du DPO
  dpoAddress: null,      // adresse postale pour exercer ses droits
  /* Mentions légales (LCEN, art. 1-1) */
  publisher: null,       // responsable de la publication (prénom et nom)
  /* Hébergement de production (prototype : GitHub Pages, voir HOST_PROTOTYPE) */
  host: null,            // nom, adresse et téléphone de l'hébergeur de production
  /* Sous-traitants éventuels, mode production */
  llmProvider: null,     // prestataire du modèle de langage et pays, si VITE_LLM_ENDPOINT est utilisé
  sttProvider: null,     // prestataire de la transcription serveur et pays, si VITE_STT_ENDPOINT est utilisé
  /* Durées de conservation validées par le DPO (proposition dans docs/conformite.md, 2.8) */
  retention: null,       // texte ou tableau des durées validées
  demoRetention: null,   // durée de conservation des demandes de démonstration
  /* Base légale retenue par le DPO (consentement ou mission d'intérêt public, écart R6) */
  legalBasis: null,
  /* Accessibilité : contact pour signaler un problème, schéma pluriannuel et plan annuel */
  a11yContact: null,
  a11yPlanUrl: null,
  /* Versions des textes, enregistrées avec l'accord de la personne */
  textsVersion: "prototype-2026-11-20",
};

export const TODO = "À compléter par l'organisme";
export const val = v => (v == null || v === "" ? TODO : v);
export const missing = Object.entries(ORG).filter(([, v]) => v == null).map(([k]) => k);

/* Hébergement réel du prototype public (vérifiable) : GitHub Pages. */
export const HOST_PROTOTYPE = "GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis (service GitHub Pages, pages.github.com)";

/* Services tiers contactés par le prototype pour télécharger les outils d'analyse.
   Versions figées : voir src/lib/gaze.js, src/lib/background.js, src/lib/whisper.worker.js. */
export const THIRD_PARTIES = [
  ["Hugging Face (États-Unis)", "huggingface.co", "Modèle de mise par écrit de la voix (Whisper base, environ 80 Mo)"],
  ["jsDelivr", "cdn.jsdelivr.net", "Moteurs de calcul : MediaPipe 1.2.3 et ONNX Runtime (version fixée par transformers.js 3.8.1)"],
  ["Google (États-Unis)", "storage.googleapis.com", "Modèles de suivi du visage et de détourage MediaPipe (version 1, environ 4 Mo)"],
];
