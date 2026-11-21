/* Test de la couche de données locale (sans navigateur) : node tests/store.test.mjs
   localStorage et indexedDB sont simulés par deux petits objets en mémoire. */
import assert from "assert/strict";

const mem = new Map();
let failWrites = false;
globalThis.localStorage = {
  getItem: k => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => { if (failWrites) { const e = new Error("quota"); e.name = "QuotaExceededError"; throw e; } mem.set(k, String(v)); },
  removeItem: k => mem.delete(k),
};
const blobs = new Map();
globalThis.indexedDB = {
  open() {
    const req = {};
    const store = {
      put: (v, k) => { blobs.set(k, v); return {}; },
      delete: k => { blobs.delete(k); return {}; },
      get: k => ({ result: blobs.get(k) }),
    };
    const db = {
      transaction() { const t = { objectStore: () => store }; setTimeout(() => t.oncomplete?.(), 0); return t; },
      close() {}, objectStoreNames: { contains: () => true },
    };
    setTimeout(() => { req.result = db; req.onsuccess?.(); }, 0);
    return req;
  },
};
globalThis.window = globalThis.window || { addEventListener() {}, removeEventListener() {} };

const S = await import("../src/lib/store.js");

// Parcours, réponse, envoi
S.setCounselor("Sophie M.");
const code = S.createParcours({ prenom: "Alex D.", poste: "agent d'accueil", warmup: true });
assert.match(code, /^[A-HJ-NP-Z2-9]{6}$/);
S.updateParcours(code, { consent: { at: new Date().toISOString(), local: true, ai: true } });
const id = await S.createTake({ code, question: "Q ?", duration: 12, blob: { type: "video/webm" }, transcript: "", segments: [], gaze: null, analysis: { synthese: "", dimensions: [] } });
assert.ok(blobs.has(id), "vidéo enregistrée dans IndexedDB");
S.updateTake(id, { shared: true, sharedAt: new Date().toISOString(), note: "" });
assert.equal(S.getState().takes[id].shared, true);

// BUG-02 : reprise de l'envoi pendant la relecture, le rapport est refusé
assert.equal(S.saveDraft(id, { intro: "brouillon" }), true);
S.unshareTake(id);
assert.equal(S.getState().takes[id].draft, null, "la reprise efface le brouillon du coach");
assert.equal(S.saveDraft(id, { intro: "x" }), false, "brouillon refusé après reprise");
assert.equal(S.sendReport(id, { intro: "Bonjour", notes: [], comments: {} }), false, "rapport refusé après reprise");
assert.equal(S.getState().takes[id].report, null);
S.updateTake(id, { shared: true, sharedAt: new Date().toISOString() });
assert.equal(S.sendReport(id, { intro: "Bonjour", notes: [], comments: {} }), true);
assert.equal(S.getState().takes[id].report.intro, "Bonjour");

console.log("store.test : OK");
