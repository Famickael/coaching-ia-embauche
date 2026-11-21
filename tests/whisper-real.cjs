/* Essai réel des modèles dans le navigateur (hors suite automatique, réseau requis) : Whisper, puis le détourage
   MediaPipe de l'échauffement, sous la politique de sécurité du contenu du site construit.
   node tests/whisper-real.cjs <adresse du site construit sans VITE_STT_ENDPOINT>
   Vérifie que le worker Whisper charge le moteur ONNX depuis le site (pas de jsDelivr), télécharge le modèle et rend
   une transcription (le micro simulé de Chromium émet un bip : le texte peut être vide). Proxy : HTTPS_PROXY. */
const { chromium } = require("playwright");
const BASE = process.argv[2] || "http://localhost:6097/";
const now = () => new Date().toISOString();
(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: "localhost,127.0.0.1" } : undefined;
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, proxy, args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream", "--disable-features=WebGPU"] });
  const ctx = await b.newContext({ permissions: ["camera", "microphone"] });
  const st = { counselor: null, lastSpace: null, takes: {}, parcours: { REALWH: { code: "REALWH", prenom: "Lou", poste: "électricien", warmup: true, counselor: "", createdAt: now(), openedAt: now(), consent: { at: now(), local: true, ai: true, version: "1" } } } };
  await ctx.addInitScript(v => { try { if (!localStorage.getItem("e2e.seeded")) { localStorage.setItem("larepet.v1", v); localStorage.setItem("e2e.seeded", "1"); } } catch { /* rien */ } }, JSON.stringify(st));
  const hosts = new Set(), errors = [];
  ctx.on("request", r => hosts.add(new URL(r.url()).host));
  ctx.on("weberror", e => errors.push(e.error().message));
  const p = await ctx.newPage();
  const csp = [];
  p.on("console", m => { if (/Content Security Policy/i.test(m.text())) csp.push(m.text().slice(0, 200)); if (/whisper|onnx|transcri|fond|regard/i.test(m.text())) console.log("  console:", m.text().slice(0, 200)); });
  await p.goto(BASE + "#/s/REALWH");
  await p.getByRole("button", { name: "Commencer l'entraînement" }).click();
  await p.getByRole("checkbox", { name: /Pouvez-vous vous présenter/ }).click();
  await p.getByRole("button", { name: "Commencer (1 question)" }).click();
  await p.getByRole("button", { name: "Voix seule" }).click();
  await p.getByRole("button", { name: "Démarrer l'enregistrement" }).click();
  await p.waitForTimeout(4000);
  await p.getByRole("button", { name: "Arrêter l'enregistrement" }).click();
  await p.getByRole("button", { name: "Voir mon retour" }).click();
  const t0 = Date.now();
  const ok = await Promise.race([
    p.getByText("Comment voulez-vous voir votre retour ?").waitFor({ timeout: 600000 }).then(() => true),
    p.getByText(/n'a pas pu être mise par écrit/).waitFor({ timeout: 600000 }).then(() => false),
  ]);
  console.log(`transcription : ${ok ? "réussie" : "échec"} en ${Math.round((Date.now() - t0) / 1000)} s`);
  if (!ok) console.log(await p.locator("main").innerText());
  /* Détourage MediaPipe (moteur servi par le site, modèle chez Google) pendant l'échauffement */
  await p.goto(BASE + "#/s/REALWH"); await p.waitForTimeout(500);
  await p.getByRole("button", { name: "M'échauffer" }).click();
  await p.getByRole("button", { name: "Activer la caméra" }).click();
  await p.getByRole("radio", { name: "Flou" }).click();
  const bg = await Promise.race([
    p.waitForFunction(() => { const c = document.querySelector("canvas[role=img]"); return c && getComputedStyle(c).display === "block"; }, null, { timeout: 120000 }).then(() => true),
    p.getByText("Votre appareil ne permet pas de changer l'arrière-plan").waitFor({ timeout: 120000 }).then(() => false),
  ]).catch(() => false);
  console.log(`détourage MediaPipe : ${bg ? "actif" : "indisponible"}`);
  console.log("hôtes contactés :", [...hosts].join(", "));
  if (csp.length) console.log("violations de la politique de sécurité :", csp);
  const cdn = [...hosts].filter(h => /jsdelivr/.test(h));
  await b.close();
  if (!ok || !bg || cdn.length || csp.length) { console.error("ECHEC", cdn.length ? "jsDelivr contacté" : ""); process.exit(1); }
  console.log("whisper-real : OK");
})().catch(e => { console.error("ECHEC", e.message); process.exit(1); });
