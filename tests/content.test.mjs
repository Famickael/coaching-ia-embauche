/* Contenus et formats (sans navigateur) : node tests/content.test.mjs */
import assert from "assert/strict";
import { fill, fillPhrase, fullInterview, QUESTIONS, WARMUP_PHRASES } from "../src/lib/questions.js";
import { dePoste, fillPoste } from "../src/lib/text.js";
import { clock, duration } from "../src/lib/format.js";

/* BUG-12 : élision devant voyelle ou h muet. */
assert.equal(dePoste("agent d'accueil"), "d'agent d'accueil");
assert.equal(dePoste("électricien"), "d'électricien");
assert.equal(dePoste("hôtesse de caisse"), "d'hôtesse de caisse");
assert.equal(dePoste("serveur"), "de serveur");
assert.equal(fill("Pourquoi ce poste de {poste} vous intéresse-t-il ?", "agent d'accueil"), "Pourquoi ce poste d'agent d'accueil vous intéresse-t-il ?");
assert.equal(fill("Pourquoi ce poste de {poste} vous intéresse-t-il ?", ""), "Pourquoi ce poste vous intéresse-t-il ?");
assert.equal(fill("Pourquoi ce poste de {poste} vous intéresse-t-il ?", "serveur(se)"), "Pourquoi ce poste de serveur vous intéresse-t-il ?");
assert.equal(fillPoste("Pour un poste de {poste}, préparez-vous.", "", "le poste visé"), "Pour un poste, préparez-vous.");
for (const job of ["agent d'accueil", "électricien", "aide-soignant(e)", "", "serveur(se)"]) {
  const all = [...QUESTIONS.map(q => fill(q.text, job)), ...WARMUP_PHRASES.map(t => fillPhrase(t, { poste: job, prenom: "Lou" })), ...fullInterview(job).map(x => x.text)];
  for (const t of all) {
    assert.ok(!/\bde [aeiouyhàâéèêîôû]/i.test(t.replace(/de (?:la|le|les)\b/gi, "")), `élision manquante : ${t}`);
    assert.ok(!/ce poste de ce poste|\{poste\}|\{prenom\}/.test(t), `gabarit mal rempli : ${t}`);
  }
}

/* BUG-17 : horloge arrondie avant le découpage. */
assert.equal(clock(59.6), "1:00");
assert.equal(clock(119.7), "2:00");
assert.equal(clock(5), "0:05");
assert.equal(duration(42), "42 s");
assert.equal(duration(95), "1 min 35");

console.log("content.test : OK");

/* BUG-01 : la confirmation de la demande ne promet un rappel que si un envoi réel a eu lieu. */
const { PHRASES } = await import("../src/content/legal.js");
for (const k of ["contactCopy", "contactMail", "contactInfo"]) assert.ok(!/recontact|enregistrée/i.test(PHRASES[k]), `${k} promet un envoi : ${PHRASES[k]}`);
assert.match(PHRASES.contactSent, /recontacte/);
/* RED-07 : sans serveur, l'envoi est décrit comme local. */
assert.match(PHRASES.sameDevice, /cet appareil/);
console.log("content.test : textes de la démo OK");
