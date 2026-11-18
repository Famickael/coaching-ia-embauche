/* Test de l'analyse descriptive et du garde-fou (sans navigateur). */
import { readFileSync } from "fs";
import assert from "assert/strict";

const src = readFileSync(new URL("../src/lib/analysis.js", import.meta.url), "utf8").replace(/import\.meta\.env/g, "({})");
const { localAnalysis, isCompliant } = await import("data:text/javascript," + encodeURIComponent(src));

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
assert.ok(!isCompliant({ ...a, synthese: "Vous semblez stressée." }), "rejet d'une inférence émotionnelle");
assert.ok(!isCompliant({ ...a, synthese: "Note : 14/20" }), "rejet d'une note");
assert.ok(isCompliant(localAnalysis({ segments: [{ start: 0, end: 2, text: "Bonjour." }], duration: 5 })), "prise très courte");
console.log("analysis.test : OK");
a.dimensions.forEach(d => console.log(`  [${d.type}] ${d.titre} : ${d.observation}`));
