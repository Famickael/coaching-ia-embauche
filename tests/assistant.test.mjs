/* Test du moteur local de l'assistant (sans navigateur) : node tests/assistant.test.mjs */
import assert from "assert/strict";
import { KB, localReply, feelingAck, FEELINGS, CONTEXT_SUGGESTIONS, assistantCompliant } from "../src/lib/assistant.js";
import { TIPS, KIND_TIPS, entriesFor, localSuggestions, coachSuggest, coachCompliant, rephrase, introIdeas, debriefIdeas, questionKind, jobFamily, MODES } from "../src/lib/coachAssistant.js";

const ok = t => assistantCompliant(t) && !/—/.test(t);

assert.ok(KB.length >= 40, `au moins 40 entrées (${KB.length})`);
const ids = new Set(KB.map(e => e.id));
assert.equal(ids.size, KB.length, "identifiants uniques");
for (const e of KB) {
  for (const f of ["answer", "more", "example"]) assert.ok(e[f], `${e.id}.${f} manquant`);
  for (const f of ["answer", "more", "example", "why", "q"]) if (e[f]) assert.ok(ok(e[f]), `${e.id}.${f} non conforme : ${e[f]}`);
  e.related.forEach(r => assert.ok(ids.has(r), `${e.id} : sujet voisin inconnu ${r}`));
  const r = localReply(e.q, {}, { poste: "agent d'accueil" });
  assert.equal(r.topic, e.id, `la suggestion « ${e.q} » doit mener à ${e.id} (obtenu ${r.topic})`);
}
Object.values(CONTEXT_SUGGESTIONS).flat().forEach(q => { const r = localReply(q); assert.ok(!r.fallback, `suggestion sans réponse : ${q}`); assert.ok(ok(r.text), `réponse locale non conforme : ${r.text}`); });
for (const q of ["bonjour", "merci", "non", "oui", "", "je suis nerveux", "j'ai peur de bafouiller", "comment rester calme ?"]) { const r = localReply(q); assert.ok(ok(r.text), `réponse locale non conforme pour « ${q} » : ${r.text}`); }
FEELINGS.forEach(f => assert.ok(ok(feelingAck(f.id)), `accusé de réception non conforme : ${f.id}`));

// Conversation multi-tours avec relances
let m = {};
const say = (t, ctx) => { const r = localReply(t, m, { context: ctx, poste: "agent d'accueil" }); m = r.memory; return r; };
let r = say("Comment je dois me présenter ?");
assert.equal(r.topic, "se-presenter");
r = say("un exemple ?"); assert.equal(r.topic, "se-presenter"); assert.match(r.text, /Je m'appelle/);
r = say("pourquoi ?"); assert.match(r.text, /première question/);
r = say("plus de détails"); assert.match(r.text, /agent d'accueil/, "{poste} remplacé");
r = say("et pour un trou dans le CV ?"); assert.equal(r.topic, "trous-cv");
r = say("merci"); assert.match(r.text, /plaisir/);
r = say("je stresse beaucoup avant les entretiens"); assert.equal(r.topic, "respiration"); assert.ok(ok(r.text));
r = say("est-ce que l'assistant voit si je suis nerveux ?"); assert.equal(r.topic, "emotions");
r = say("quelle est la capitale du Pérou ?"); assert.ok(r.fallback); assert.equal(r.suggestions.length, 3);
r = say("Que devient ma vidéo ?"); assert.equal(r.topic, "video-devenir");
r = say("oui"); assert.equal(r.topic, "video-devenir");
r = say("comment parler de salaire"); assert.equal(r.topic, "salaire");
r = say("entretien en visio"); assert.equal(r.topic, "visio");

/* ─── Assistant de rédaction du rapport (côté coach) ─── */
const MAIN_DIMS = ["debit", "pauses", "exemples", "appui", "structure", "regard"];
const QS = ["Pouvez-vous vous présenter en deux minutes ?", "Pourquoi ce poste de serveur vous intéresse-t-il ?", "Racontez une expérience qui vous prépare au métier.", "Avez-vous des questions à nous poser ?", "Quelle est votre couleur préférée ?"];
let coachCount = 0;
for (const d of MAIN_DIMS) for (const type of ["appui", "explorer"]) for (const question of QS) for (const poste of ["", "agent d'accueil", "aide-soignant"]) {
  const list = entriesFor(d, type, { question, poste });
  assert.ok(list.length >= 40, `${d}/${type} « ${question} » ${poste} : au moins 40 entrées (${list.length})`);
  list.forEach(t => assert.ok(ok(t) && coachCompliant(t), `entrée non conforme : ${t}`));
  coachCount = Math.max(coachCount, list.length);
}
Object.values(TIPS).forEach(x => [...x.appui, ...x.explorer].forEach(t => assert.ok(coachCompliant(t), `astuce non conforme : ${t}`)));
Object.values(KIND_TIPS).flat().forEach(t => assert.ok(coachCompliant(t), `astuce de question non conforme : ${t}`));
assert.equal(questionKind("Pouvez-vous vous présenter ?"), "presentation");
assert.equal(questionKind("Avez-vous des questions à nous poser ?"), "questions");
assert.equal(jobFamily("aide-soignant(e)"), "soin");
// Garde-fou : notes, émotions et jugements sur la personne écartés
for (const bad of ["Vous êtes timide.", "Vous aviez l'air stressé.", "Note : 12/20.", "C'est nul.", "Excellent travail !", "Vous manquez de confiance en vous.", "Tu es trop lent.", "Votre score est bon.", "Réponse \u2014 claire"]) assert.ok(!coachCompliant(bad), `devrait être écarté : ${bad}`);
// Reformulation dans le ton de la charte
let rp = rephrase("Tu parles trop vite ! Il faut que tu ralentisses.");
assert.equal(rp.text, "Vous parlez à un rythme rapide. Vous pouvez ralentir.");
rp = rephrase("D'accord, garde ce rythme. Tu es trop stressé, c'est nul.");
assert.equal(rp.text, "D'accord, gardez ce rythme."); assert.equal(rp.removed.length, 1);
rp = rephrase("Vous devez regarder la caméra.");
assert.equal(rp.text, "Vous pouvez regarder la caméra.");
// Suggestions locales de chaque mode : conformes, liées à l'observation, renouvelables
const dims = [{ id: "debit", titre: "Rythme de parole", type: "explorer", observation: "Environ 190 mots par minute" }, { id: "exemples", titre: "Exemples concrets", type: "appui", observation: "Vous citez deux ans en magasin" }];
const base = { dims, question: QS[0], poste: "agent d'accueil", prenom: "Camille" };
for (const [mode] of MODES.filter(([m]) => m !== "rephrase")) {
  const a = localSuggestions({ ...base, mode, dimId: "debit", page: 0 }), b = localSuggestions({ ...base, mode, dimId: "debit", page: 1 });
  assert.ok(a.items.length >= 3, `${mode} : au moins 3 propositions`);
  a.items.forEach(i => assert.ok(coachCompliant(i.text), `${mode} non conforme : ${i.text}`));
  assert.notDeepEqual(a.items.map(i => i.text), b.items.map(i => i.text), `${mode} : « Autres propositions » doit changer la liste`);
}
assert.ok(localSuggestions({ ...base, mode: "tips", dimId: "debit" }).items.every(i => i.dimId === "debit"));
assert.ok(localSuggestions({ ...base, mode: "positive", dimId: "exemples" }).items.some(i => /exemple|situation|expérience/i.test(i.text)));
assert.ok(introIdeas(base).every(t => t.startsWith("Camille, ")), "introduction adressée à la personne");
assert.ok(debriefIdeas(base).length >= 8);
const rr = await coachSuggest({ ...base, mode: "rephrase", text: "Tu dois sourire plus. Garde ce rythme." });
assert.equal(rr.source, "local"); assert.equal(rr.items[0].text, "Gardez ce rythme."); assert.ok(rr.note);

console.log(`assistant.test : OK (${KB.length} entrées ; assistant coach : ${coachCount} entrées au plus par observation et par situation)`);
