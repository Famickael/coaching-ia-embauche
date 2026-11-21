/* Test de l'analyse descriptive et du garde-fou (sans navigateur) : npm run test:analysis */
import assert from "assert/strict";
import { localAnalysis, isCompliant, reconcile } from "../src/lib/analysis.js";
import { textCompliant } from "../src/lib/compliance.js";
import { assistantCompliant } from "../src/lib/assistant.js";
import { EYE_KEYS } from "../src/lib/gazeKeys.js";

const segments = [
  { start: 0, end: 6, text: "Bonjour, euh, je m'appelle Alex et en fait je postule au poste d'agent d'accueil." },
  { start: 6.5, end: 14, text: "J'ai travaillé deux ans dans un magasin, donc je sais gérer plusieurs clients en même temps." },
  { start: 17, end: 24, text: "Euh, je prépare toujours mes journées, du coup je suis prêt le matin, voilà." },
  { start: 24.5, end: 31, text: "C'est pour ça que ce poste me correspond vraiment." },
];
const gaze = { samples: 60, absentRatio: 0.05, downRatio: 0.3, sideRatio: 0.1, longestAwayAt: 12 };
const a = localAnalysis({ segments, duration: 32, gaze });

assert.ok(isCompliant(a), "le retour local doit être conforme");
assert.ok(a.dimensions.length >= 4);
const firstExplore = a.dimensions.findIndex(d => d.type === "explorer");
assert.ok(a.dimensions.slice(firstExplore).every(d => d.type === "explorer"), "points d'appui d'abord");
assert.ok(isCompliant(localAnalysis({ segments: [{ start: 0, end: 2, text: "Bonjour." }], duration: 5 })), "réponse très courte");

/* SEC-01, TST-03 : phrases interdites dans un retour (au moins 30, accents, élisions, notes en lettres). */
const FORBIDDEN = [
  "Votre émotion est visible.", "Vous semblez à l'aise.", "Vous paraissez calme et serein.", "Vous avez l'air tendu et hésitant.",
  "Vous semblez inquiet.", "Vous manquez d'assurance.", "Vous avez le trac.", "Vous êtes émue.", "Je vous mets 8 sur 10.", "Note de 7.",
  "Réussite : 80 %.", "Excellent, très bonne prestation, niveau B.", "Vous semblez stressée.", "Note : 14/20", "Vous étiez un peu nerveux au début.",
  "Votre stress se voit.", "On sent que vous êtes motivé.", "Vous êtes à l’aise devant la caméra.", "Votre réponse mérite quinze sur vingt.",
  "Vous restez détendu.", "Vous êtes très confiante.", "Vous paraissiez fatigué.", "Vous dégagez de l'enthousiasme.", "Une émotion passe dans votre voix.",
  "Votre score est de 12.", "Trois étoiles pour cette réponse.", "90 % de réussite.", "Bravo, c'est parfait.", "Vous avez eu peur de la question.",
  "Vous sembliez gêné.", "VOUS SEMBLEZ SEREINE.", "Vous êtes sincère.", "Vous souriez beaucoup, votre sourire aide.", "Très bien.", "Le ton est calme.",
  "Vous manquez de confiance en vous.", "Vous etes emue.", "Votre timidité ressort.", "Vous êtes resté calme.", "Je sens que vous hésitez.",
];
for (const t of FORBIDDEN) {
  assert.ok(!textCompliant(t), `devrait être rejeté : ${t}`);
  assert.ok(!isCompliant({ ...a, synthese: t }), `retour devrait être rejeté : ${t}`);
}
/* Phrases permises : sorties réelles de l'analyse locale et formulations factuelles proches des mots surveillés. */
const ALLOWED = [
  ...a.dimensions.flatMap(d => [d.titre, d.observation, d.conseil]), a.synthese,
  "Environ 130 mots par minute sur 0:45 de parole.", "Regard orienté vers l'écran environ 70 % du temps.",
  "Le contenu de la réponse cite deux expériences.", "Vous citez un élément précis : « deux ans en magasin ».",
  "Trois pauses de plus de 2 secondes.", "La réponse se termine par une idée de synthèse.", "Vous pouvez noter deux mots-clés avant de répondre.",
  "Le rythme est posé.", "Une respiration entre deux idées suffit souvent.", "Vous pouvez préparer un ou deux synonymes.",
];
for (const t of ALLOWED) assert.ok(textCompliant(t), `devrait être accepté : ${t}`);

/* L'assistant de préparation peut parler du trac quand la personne en parle, sans jamais la qualifier ni la noter. */
for (const t of ["Le trac est fréquent avant un entretien.", "Si vous avez le trac, respirez sur quatre temps.", "Installez-vous dans un endroit calme.", "La Répét' ne met pas de note."])
  assert.ok(assistantCompliant(t), `assistant, devrait être accepté : ${t}`);
for (const t of ["Vous semblez stressé.", "Votre stress est normal.", "Vous êtes tendu, c'est visible.", "Je vous donne 7 sur 10.", "Vous avez l'air à l'aise."])
  assert.ok(!assistantCompliant(t), `assistant, devrait être rejeté : ${t}`);

/* SEC-02 : sortie du modèle rapprochée de l'analyse locale. */
const llm = { synthese: "Synthèse reformulée.", dimensions: [
  { id: "structure", titre: "Construction", type: "appui", observation: "x".repeat(900), conseil: "Conseil.", t: 999 },
  { id: "structure", titre: "Doublon", type: "explorer", observation: "o", conseil: "c", t: 1 },
  { id: "inconnu", titre: "Inventé", type: "appui", observation: "o", conseil: "c", t: 1 },
  { id: "contenu", titre: "Contenu de la réponse", type: "explorer", observation: "Deux expériences citées.", conseil: "Vous pouvez en ajouter une troisième.", t: 5 },
  ...Array.from({ length: 20 }, (_, i) => ({ id: `x${i}`, titre: "t", type: "appui", observation: "o", conseil: "c", t: 0 })),
] };
const r = reconcile(llm, a);
const ids = r.dimensions.map(d => d.id);
assert.equal(new Set(ids).size, ids.length, "aucun identifiant en double");
assert.ok(!ids.includes("inconnu") && ids.includes("contenu"), "seuls les identifiants connus et « contenu » sont gardés");
assert.ok(r.dimensions.length <= 10, "dix repères au plus");
const st = r.dimensions.find(d => d.id === "structure"), ref = a.dimensions.find(d => d.id === "structure");
assert.equal(st.t, ref.t, "le moment vient de l'analyse locale"); assert.equal(st.type, ref.type, "le type vient de l'analyse locale");
assert.ok(st.observation.length <= 300, "champ tronqué");
for (const d of a.dimensions) assert.ok(ids.includes(d.id), `repère local conservé : ${d.id}`);
const fe = r.dimensions.findIndex(d => d.type === "explorer");
assert.ok(fe === -1 || r.dimensions.slice(fe).every(d => d.type === "explorer"), "points d'appui d'abord après rapprochement");
assert.equal(reconcile({ synthese: "x" }, a), null, "forme invalide refusée");

/* SEC-06 : le suivi du regard ne lit que les coefficients de direction des yeux. */
assert.ok(EYE_KEYS.length > 0 && EYE_KEYS.every(k => k.startsWith("eyeLook")), "seuls les coefficients eyeLook* sont lus");

console.log(`analysis.test : OK (${FORBIDDEN.length} phrases rejetées, ${ALLOWED.length} acceptées)`);
a.dimensions.forEach(d => console.log(`  [${d.type}] ${d.titre} : ${d.observation}`));
