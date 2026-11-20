/* Configuration de l'organisme qui déploie La Répét' : SEUL fichier à compléter.
   À COMPLÉTER PAR L'ORGANISME : chaque valeur null ci-dessous. Rien ne s'affiche « à compléter » à l'écran :
   tant qu'une valeur manque, les pages « Vos données », « Mentions légales », « Conditions » et « Accessibilité »
   utilisent une formulation neutre et vraie (« votre organisme d'accompagnement », « les coordonnées du délégué
   à la protection des données vous sont communiquées par votre coach »). Aucune valeur n'est inventée ici.
   Voir docs/conformite.md (sections 2.1, 2.6, 2.8 et 5) pour ce que chaque champ doit contenir. */

/* Les modèles d'analyse sont-ils servis par l'organisme ? (VITE_MODELS_BASE_URL, VITE_MEDIAPIPE_WASM, VITE_FACE_MODEL) */
export const SELF_HOSTED_MODELS = !!(import.meta.env?.VITE_MODELS_BASE_URL && import.meta.env?.VITE_MEDIAPIPE_WASM);

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
  /* Hébergeur du site (à défaut : l'hébergeur actuel, HOST_DEFAULT) */
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
  textsVersion: "2026-11-20",
};

/* Repère pour la documentation et les tests : jamais affiché à l'écran. */
export const TODO = "À compléter par l'organisme";
export const missing = Object.entries(ORG).filter(([, v]) => v == null).map(([k]) => k);

/* Formulations neutres utilisées tant qu'un champ n'est pas renseigné. */
export const orgName = () => ORG.name || "votre organisme d'accompagnement";
export const OrgName = () => ORG.name || "Votre organisme d'accompagnement";
export const dpoLine = () => ORG.dpoEmail
  ? `Délégué à la protection des données : ${ORG.dpo ? `${ORG.dpo}, ` : ""}${ORG.dpoEmail}${ORG.dpoAddress ? `, ${ORG.dpoAddress}` : ""}.`
  : "Les coordonnées du délégué à la protection des données vous sont communiquées par votre coach.";
export const contactLine = () => ORG.email ? `Contact : ${ORG.email}${ORG.phone ? `, ${ORG.phone}` : ""}.` : "Pour toute question, votre coach vous indique qui contacter.";

/* Hébergeur actuel du site (vérifiable), utilisé tant que ORG.host n'est pas renseigné. */
export const HOST_DEFAULT = "GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis (service GitHub Pages, pages.github.com)";
export const hostLine = () => ORG.host || HOST_DEFAULT;

/* Services tiers qui fournissent les outils d'analyse quand l'organisme ne les héberge pas lui-même.
   Versions figées : voir src/lib/gaze.js, src/lib/background.js, src/lib/whisper.worker.js. */
export const THIRD_PARTIES = [
  ["Hugging Face (États-Unis)", "huggingface.co", "Modèle de mise par écrit de la voix (Whisper base, environ 80 Mo)"],
  ["jsDelivr", "cdn.jsdelivr.net", "Moteurs de calcul : MediaPipe 1.2.3 et ONNX Runtime (version fixée par transformers.js 3.8.1)"],
  ["Google (États-Unis)", "storage.googleapis.com", "Modèles de suivi du visage et de détourage MediaPipe (version 1, environ 4 Mo)"],
];
