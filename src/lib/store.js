/* Couche de données locale.
   - Métadonnées (parcours, prises, rapports) : localStorage, clé "larepet.v1".
   - Vidéos : IndexedDB, base "larepet", store "videos" (clé = id de prise).
   Tout reste dans le navigateur. Le passage en production remplace ce module
   par des appels à une API (voir README, section "Passage en production"). */

import { useEffect, useState } from "react";

const KEY = "larepet.v1";
const EMPTY = { counselor: null, parcours: {}, takes: {}, lastSpace: null }; // lastSpace : { role: "benef", code } | { role: "coach" }
const listeners = new Set();

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

let state = read();

/* Parcours d'essai : code générique pour découvrir l'outil sans passer par la création d'un parcours.
   Créé au moment où le code est saisi ou ouvert par lien (pas au chargement de la page : rien n'est
   écrit sur l'appareil avant une action de la personne), recréé s'il a été supprimé. À retirer en production (voir README). */
export const TRIAL_CODE = "REPETE";
export const TRIAL_COACH = "Sophie M.";
/* Connexion coach de démonstration : identifiants fictifs pré-remplis (domaine réservé aux exemples), aucune vérification. */
export const TRIAL_LOGIN = { email: "sophie.m@exemple.fr", password: "repet-2026", name: TRIAL_COACH };
function ensureTrial() {
  if (state.parcours[TRIAL_CODE]) return;
  state = { ...state, parcours: { ...state.parcours, [TRIAL_CODE]: {
    code: TRIAL_CODE, prenom: "Camille", poste: "agent d'accueil", warmup: true, counselor: "",
    trial: true, createdAt: new Date().toISOString(), openedAt: null, consent: null,
  } } };
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* mode privé */ }
  queueMicrotask(() => listeners.forEach(fn => fn(state))); // pas de mise à jour pendant un rendu
}

function write(next) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* quota ou mode privé */ }
  listeners.forEach(fn => fn(state));
}

export function getState() { return state; }

export function useStore() {
  const [s, setS] = useState(state);
  useEffect(() => {
    listeners.add(setS);
    setS(state); // rattrape une écriture faite avant l'abonnement (parcours d'essai créé pendant le premier rendu)
    const onStorage = e => { if (e.key === KEY) { state = read(); listeners.forEach(fn => fn(state)); } };
    window.addEventListener("storage", onStorage); // synchronise deux onglets (bénéficiaire / coach)
    return () => { listeners.delete(setS); window.removeEventListener("storage", onStorage); };
  }, []);
  return s;
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

/* Code d'accès : 6 caractères sans caractères ambigus (0/O, 1/I/L). */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function newCode() {
  let c;
  do {
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    c = Array.from(bytes, b => ALPHABET[b % ALPHABET.length]).join("");
  } while (state.parcours[c]);
  return c;
}

/* Dernier espace ouvert sur cet appareil, pour que « Mon espace » y ramène directement. */
export function setLastSpace(ls) {
  if (JSON.stringify(state.lastSpace || null) === JSON.stringify(ls || null)) return;
  write({ ...state, lastSpace: ls || null });
}

/* ── Coach ── */
export function setCounselor(name) {
  write({ ...state, counselor: { name: name.trim(), since: new Date().toISOString() } });
}

export function logoutCounselor() {
  write({ ...state, counselor: null, lastSpace: state.lastSpace?.role === "coach" ? null : state.lastSpace });
}

/* ── Parcours ── */
export function createParcours({ prenom, poste, warmup }) {
  const code = newCode();
  const p = {
    code, prenom: prenom.trim(), poste: poste.trim(), warmup: !!warmup,
    counselor: state.counselor?.name || "",
    createdAt: new Date().toISOString(), openedAt: null, consent: null,
  };
  write({ ...state, parcours: { ...state.parcours, [code]: p } });
  return code;
}

export function findParcours(code) {
  const c = (code || "").trim().toUpperCase();
  if (c === TRIAL_CODE) ensureTrial();
  return state.parcours[c] || null;
}

export function updateParcours(code, patch) {
  const p = state.parcours[code];
  if (!p) return;
  write({ ...state, parcours: { ...state.parcours, [code]: { ...p, ...patch } } });
}

export async function deleteParcours(code) {
  const takes = Object.values(state.takes).filter(t => t.code === code);
  for (const t of takes) await deleteVideo(t.id);
  const nextTakes = { ...state.takes };
  takes.forEach(t => delete nextTakes[t.id]);
  const nextParcours = { ...state.parcours };
  delete nextParcours[code];
  write({ ...state, parcours: nextParcours, takes: nextTakes });
}

/* Retrait du consentement : supprime réponses et vidéos, garde le parcours (accès coach),
   trace la date du retrait et la version des textes acceptés (RGPD, art. 7(1)). */
export async function withdrawConsent(code) {
  const takes = Object.values(state.takes).filter(t => t.code === code);
  for (const t of takes) await deleteVideo(t.id);
  const nextTakes = { ...state.takes };
  takes.forEach(t => delete nextTakes[t.id]);
  const prev = state.parcours[code];
  write({ ...state, takes: nextTakes, parcours: { ...state.parcours, [code]: { ...prev, consent: null, consentWithdrawnAt: new Date().toISOString(), consentHistory: [...(prev?.consentHistory || []), ...(prev?.consent ? [{ ...prev.consent, withdrawnAt: new Date().toISOString() }] : [])] } } });
}

/* ── Prises ── */
export function takesOf(code, s = state) {
  return Object.values(s.takes).filter(t => t.code === code).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createTake({ code, question, duration, blob, transcript, segments, gaze, analysis }) {
  const id = uid();
  if (blob) await saveVideo(id, blob);
  const t = {
    id, code, question, duration, transcript, segments, gaze, analysis,
    hasVideo: !!blob, mime: blob?.type || null,
    createdAt: new Date().toISOString(),
    shared: false, sharedAt: null, note: "", report: null,
  };
  write({ ...state, takes: { ...state.takes, [id]: t } });
  return id;
}

/* Reprendre un envoi : le coach ne voit plus la réponse, la personne la garde (tant qu'aucun rapport n'est envoyé). */
export function unshareTake(id) {
  const t = state.takes[id];
  if (!t || t.report) return;
  write({ ...state, takes: { ...state.takes, [id]: { ...t, shared: false, sharedAt: null, draft: null } } });
}

/* Rapport du coach (BUG-02) : refusé si la personne a repris son envoi entre-temps (deux onglets, deux appareils).
   Renvoie true si le rapport est enregistré. Production : rpc('envoyer_rapport'), qui refuse de la même façon. */
export function sendReport(id, report) {
  const t = state.takes[id];
  if (!t || !t.shared) return false;
  write({ ...state, takes: { ...state.takes, [id]: { ...t, report, draft: null } } });
  return true;
}

/* Brouillon du coach : ignoré si la réponse n'est plus partagée (le brouillon a été effacé par la reprise). */
export function saveDraft(id, draft) {
  const t = state.takes[id];
  if (!t || !t.shared) return false;
  write({ ...state, takes: { ...state.takes, [id]: { ...t, draft } } });
  return true;
}

export function updateTake(id, patch) {
  const t = state.takes[id];
  if (!t) return;
  write({ ...state, takes: { ...state.takes, [id]: { ...t, ...patch } } });
}

export async function deleteTake(id) {
  await deleteVideo(id);
  const next = { ...state.takes };
  delete next[id];
  write({ ...state, takes: next });
}

/* Statut d'un parcours, calculé à partir des prises. */
export function parcoursStatus(p, s = state) {
  const takes = takesOf(p.code, s);
  const shared = takes.filter(t => t.shared);
  if (shared.some(t => !t.report)) return { key: "toreview", label: "À relire", tone: "warning" };
  if (shared.length) return { key: "sent", label: "Rapport envoyé", tone: "success" };
  if (takes.length || p.openedAt) return { key: "training", label: "S'entraîne", tone: "primary" };
  return { key: "new", label: "Pas encore ouvert", tone: "muted" };
}

/* ── IndexedDB (vidéos) ── */
function db() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("larepet", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("videos");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function tx(mode, fn) {
  const d = await db();
  return new Promise((resolve, reject) => {
    const t = d.transaction("videos", mode);
    const r = fn(t.objectStore("videos"));
    t.oncomplete = () => resolve(r?.result);
    t.onerror = () => reject(t.error);
  });
}
export const saveVideo = (id, blob) => tx("readwrite", s => s.put(blob, id));
export const deleteVideo = id => tx("readwrite", s => s.delete(id)).catch(() => {});
export async function loadVideoUrl(id) {
  const blob = await tx("readonly", s => s.get(id));
  return blob ? URL.createObjectURL(blob) : null;
}

/* ── Questionnaire de fin d'échauffement ──
   Clé séparée ("larepet.warmup.CODE") : ces réponses restent sur l'appareil, elles ne font pas partie
   des données partagées avec le coach et ne sont pas destinées à remonter vers un serveur. */
const WARMUP_KEY = code => `larepet.warmup.${code}`;
export function saveWarmupDebrief(code, data) {
  try { localStorage.setItem(WARMUP_KEY(code), JSON.stringify({ ...data, at: new Date().toISOString() })); } catch { /* mode privé */ }
}
export function loadWarmupDebrief(code) {
  try { return JSON.parse(localStorage.getItem(WARMUP_KEY(code)) || "null"); } catch { return null; }
}
export function clearWarmupDebrief(code) {
  try { localStorage.removeItem(WARMUP_KEY(code)); } catch { /* mode privé */ }
}
