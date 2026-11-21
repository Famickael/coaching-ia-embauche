/* Test de bout en bout : construit l'application avec un service de transcription simulé,
   la sert, puis rejoue le parcours coach -> personne accompagnée -> coach -> personne accompagnée
   dans Chromium avec une caméra et un micro simulés. Captures dans tests/screenshots/.
   Argument facultatif : autre scénario à jouer (par exemple tests/e2e-cas-limites.cjs). */
import { spawn, execSync } from "child_process";

const script = process.argv[2] || "tests/e2e.cjs";
const run = (cmd, args, env = {}) => spawn(cmd, args, { stdio: "inherit", env: { ...process.env, ...env } });
execSync("npx vite build --outDir tests/.dist --emptyOutDir", { stdio: "inherit", env: { ...process.env, VITE_STT_ENDPOINT: "http://localhost:5099/stt" } });
const stt = run("node", ["tests/mock-stt.mjs"]);
const srv = run("node", ["node_modules/vite/bin/vite.js", "preview", "--outDir", "tests/.dist", "--port", "5098", "--strictPort"]);
/* Attend que le serveur réponde (au plus 30 s) plutôt qu'un délai fixe. */
for (let t = 0; t < 60; t++) { try { const r = await fetch(`http://localhost:5098/`); if (r.ok) break; } catch { /* pas encore prêt */ } await new Promise(r => setTimeout(r, 500)); }
const dir = script.includes("cas-limites") ? "tests/screenshots/cas-limites" : "tests/screenshots";
const e2e = run("node", [script, process.env.E2E_VIEWPORT ? `${dir}/${process.env.E2E_VIEWPORT}` : dir]);
e2e.on("exit", code => { stt.kill(); srv.kill(); process.exit(code); });
