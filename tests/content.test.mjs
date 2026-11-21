/* Contenus et formats (sans navigateur) : node tests/content.test.mjs */
import assert from "assert/strict";
import { fill, fillPhrase, fullInterview, situationFor, QUESTIONS, WARMUP_PHRASES } from "../src/lib/questions.js";
import { searchJobs } from "../src/lib/jobs.js";
import { CATEGORIES } from "../src/content/categories.js";
import { readFileSync, readdirSync, existsSync } from "fs";
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

/* TST-09 : une mise en situation propre à chaque famille de métiers, repli générique sinon. */
const generic = situationFor("astronaute");
for (const job of ["agent d'accueil", "vendeur", "serveur(se)", "aide-soignant(e)", "électricien", "cariste"]) {
  const sit = situationFor(job);
  assert.ok(sit && sit.endsWith("?"), `mise en situation pour ${job}`);
}
assert.notEqual(situationFor("serveur(se)"), generic, "famille restauration reconnue");
assert.ok(searchJobs("serv", 8).some(j => /serveur/.test(j)), "recherche de métier");
assert.ok(searchJobs("élec", 8).length > 0, "recherche sans tenir compte des accents");

/* TST-09 : chaque article a un titre, une catégorie connue, une image présente dans public/img/. */
const dir = new URL("../src/content/resources/", import.meta.url);
const cats = new Set(CATEGORIES.map(c => c.id));
for (const f of readdirSync(dir).filter(f => f.endsWith(".md"))) {
  const front = (readFileSync(new URL(f, dir), "utf8").match(/^---\n([\s\S]*?)\n---/) || [])[1] || "";
  const val = k => (front.match(new RegExp(`^${k}:\\s*(.+)$`, "m")) || [])[1]?.trim();
  assert.ok(val("title"), `${f} : titre`);
  assert.ok(cats.has(val("category")), `${f} : catégorie inconnue ${val("category")}`);
  const img = val("image");
  assert.ok(img && existsSync(new URL(`../public/img/${img}`, import.meta.url)), `${f} : image absente ${img}`);
}
console.log("content.test : métiers et articles OK");
