/* Configuration de l'organisme qui déploie La Répét' : SEUL fichier à compléter.
   À REMPLACER PAR L'ORGANISME : toutes les valeurs ci-dessous sont des EXEMPLES explicites, acceptés par le
   propriétaire pour la présentation (mention « exemple », « à remplacer » ou « à valider » visible à l'écran).
   Les adresses électroniques utilisent le domaine réservé exemple.fr ou example.org, jamais un domaine réel.
   Avant toute mise en service, chaque valeur est remplacée par la valeur réelle validée par le DPO.
   Une valeur remise à null retrouve la formulation neutre et vraie (« votre organisme d'accompagnement »…).
   Voir docs/conformite.md (sections 2.1, 2.6, 2.8 et 5) pour ce que chaque champ doit contenir. */

/* Les modèles d'analyse sont-ils servis par l'organisme ? (VITE_MODELS_BASE_URL, VITE_MEDIAPIPE_WASM, VITE_FACE_MODEL) */
export const SELF_HOSTED_MODELS = !!(import.meta.env?.VITE_MODELS_BASE_URL && import.meta.env?.VITE_MEDIAPIPE_WASM);

export const ORG = {
  /* Responsable de traitement (RGPD, art. 13(1)(a)) */
  name: "Organisme d'accompagnement (nom à remplacer)",            // nom ou raison sociale
  legalForm: "association loi 1901 (forme juridique d'exemple)",       // forme juridique
  address: "12 rue de l'Exemple, 75000 Paris (adresse d'exemple)",         // adresse du siège
  registration: "SIRET 000 000 000 00000 (numéro d'exemple)",    // SIREN, SIRET ou RNA, s'il existe
  email: "contact@exemple.fr",           // courriel de contact
  phone: "01 00 00 00 00 (numéro d'exemple)",           // téléphone de contact
  /* Délégué à la protection des données (RGPD, art. 13(1)(b)) */
  dpo: "Délégué à la protection des données de l'organisme (nom à remplacer)",             // nom ou service
  dpoEmail: "dpo@exemple.fr",        // courriel du DPO
  dpoAddress: "12 rue de l'Exemple, 75000 Paris (adresse d'exemple)",      // adresse postale pour exercer ses droits
  /* Mentions légales (LCEN, art. 1-1) */
  publisher: "la direction de l'organisme (nom à remplacer)",       // responsable de la publication (prénom et nom)
  /* Hébergeur du site (à défaut : l'hébergeur actuel, HOST_DEFAULT) */
  host: "hébergeur à désigner par l'organisme, hébergement en France (exemple : nom, adresse et téléphone du prestataire)",            // nom, adresse et téléphone de l'hébergeur de production
  /* Sous-traitants éventuels, mode production */
  llmProvider: "prestataire de modèle de langage hébergé en France, à désigner (exemple)",     // prestataire du modèle de langage et pays, si VITE_LLM_ENDPOINT est utilisé
  sttProvider: "prestataire de transcription hébergé en France, à désigner (exemple)",     // prestataire de la transcription serveur et pays, si VITE_STT_ENDPOINT est utilisé
  /* Durées de conservation validées par le DPO (proposition dans docs/conformite.md, 2.8) */
  retention: "vidéos et réponses gardées sur votre appareil jusqu'à ce que vous les supprimiez ; réponses envoyées au coach et rapports : 6 mois après la fin de l'accompagnement ; compte coach : 1 an après le dernier accès (durées types, à valider par le délégué à la protection des données)",       // texte ou tableau des durées validées
  demoRetention: "3 mois après le rendez-vous (durée type, à valider)",   // durée de conservation des demandes de démonstration
  /* Base légale retenue par le DPO (consentement ou mission d'intérêt public, écart R6) */
  legalBasis: "Votre accord (consentement, article 6.1.a du RGPD). Base légale type, à valider par le délégué à la protection des données.",
  /* Accessibilité : contact pour signaler un problème, schéma pluriannuel et plan annuel */
  a11yContact: "accessibilite@exemple.fr",
  a11yPlanUrl: "Schéma pluriannuel et plan d'actions de l'année à publier par l'organisme (adresse d'exemple : https://www.example.org/accessibilite).",
  /* Versions des textes, enregistrées avec l'accord de la personne */
  textsVersion: "2026-11-20",
};

/* Repère pour la documentation et les tests : jamais affiché à l'écran (les valeurs d'exemple ci-dessus sont à remplacer). */
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
