/* Test des pages publiques (site) : construit l'application, la sert, puis visite toutes les pages
   à 1280 px et à 390 px dans Chromium (menu mobile, strate épinglée, FAQ, ressources, formulaire).
   Captures dans tests/screenshots/site/. Lancer : npm run test:site (CHROMIUM_PATH facultatif). */
import { spawn, execSync } from "child_process";
import { readdirSync, statSync, readFileSync } from "fs";
import { join } from "path";

const OUT = "node_modules/.cache/site-dist", PORT = 5097;
execSync(`npx vite build --outDir ${OUT} --emptyOutDir`, { stdio: "inherit" });
/* Garde-fous de conformité sur le site construit (docs/conformite.md, point 34) :
   aucune police chez Google, aucune version « @latest », aucune mention « haut risque ». */
const walk = d => readdirSync(d).flatMap(f => statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]);
const bad = [];
for (const f of walk(OUT).filter(f => /\.(js|css|html)$/.test(f))) {
  const t = readFileSync(f, "utf8");
  for (const [re, why] of [[/fonts\.(googleapis|gstatic)\.com/, "police chargée chez Google"], [/@latest\//, "version « @latest »"], [/haut risque/i, "mention « haut risque »"]]) if (re.test(t)) bad.push(`${f} : ${why}`);
  /* SEC-04 : aucun code chargé depuis jsDelivr. Seule exception : la valeur par défaut de transformers.js, écrasée
     dans le worker par wasmPaths (moteur ONNX servi par le site). */
  if (/cdn\.jsdelivr\.net/.test(t) && !(/whisper\.worker/.test(f) && /wasmPaths=\{wasm:/.test(t.replace(/\s/g, "")))) bad.push(`${f} : code chargé depuis jsDelivr`);
}
if (bad.length) { console.error("Conformité du site construit :\n" + bad.join("\n")); process.exit(1); }
const srv = spawn("node", ["node_modules/vite/bin/vite.js", "preview", "--outDir", OUT, "--port", String(PORT), "--strictPort"], { stdio: "inherit" });
/* Attend que le serveur réponde (au plus 30 s) plutôt qu'un délai fixe. */
for (let t = 0; t < 60; t++) { try { const r = await fetch(`http://localhost:${PORT}/`); if (r.ok) break; } catch { /* pas encore prêt */ } await new Promise(r => setTimeout(r, 500)); }
const t = spawn("node", ["tests/site.e2e.cjs", `http://localhost:${PORT}/`, "tests/screenshots/site"], { stdio: "inherit" });
t.on("exit", code => { srv.kill(); process.exit(code); });
