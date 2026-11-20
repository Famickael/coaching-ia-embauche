/* Test du moteur local de l'assistant (sans navigateur) : node tests/assistant.test.mjs */
import assert from "assert/strict";
import { KB, localReply, feelingAck, FEELINGS, CONTEXT_SUGGESTIONS } from "../src/lib/assistant.js";
import { isCompliant } from "../src/lib/analysis.js";

const ok = t => isCompliant({ synthese: t, dimensions: [] }) && !/—/.test(t);

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
Object.values(CONTEXT_SUGGESTIONS).flat().forEach(q => assert.ok(!localReply(q).fallback, `suggestion sans réponse : ${q}`));
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
console.log(`assistant.test : OK (${KB.length} entrées)`);
