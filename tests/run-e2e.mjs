/* Test de bout en bout : construit l'application avec un service de transcription simulé,
   la sert, puis rejoue le parcours coach -> personne accompagnée -> coach -> personne accompagnée
   dans Chromium avec une caméra et un micro simulés. Captures dans tests/screenshots/.
   Argument facultatif : autre scénario à jouer (par exemple tests/e2e-cas-limites.cjs). */
import { spawn, execSync } from "child_process";

const script = process.argv[2] || "tests/e2e.cjs";
/* Ports et dossier réglables (E2E_PORT, E2E_STT_PORT, E2E_OUT) pour lancer deux scénarios en parallèle. */
const PORT = process.env.E2E_PORT || "5098", STT = process.env.E2E_STT_PORT || "5099", OUT = process.env.E2E_OUT || "tests/.dist";
const run = (cmd, args, env = {}) => spawn(cmd, args, { stdio: "inherit", env: { ...process.env, ...env } });
execSync(`npx vite build --outDir ${OUT} --emptyOutDir`, { stdio: "inherit", env: { ...process.env, VITE_STT_ENDPOINT: `http://localhost:${STT}/stt` } });
const stt = run("node", ["tests/mock-stt.mjs"], { E2E_STT_PORT: STT });
const srv = run("node", ["node_modules/vite/bin/vite.js", "preview", "--outDir", OUT, "--port", PORT, "--strictPort"]);
/* Attend que le serveur réponde (au plus 30 s) plutôt qu'un délai fixe. */
for (let t = 0; t < 60; t++) { try { const r = await fetch(`http://localhost:${PORT}/`); if (r.ok) break; } catch { /* pas encore prêt */ } await new Promise(r => setTimeout(r, 500)); }
const dir = script.includes("cas-limites") ? "tests/screenshots/cas-limites" : "tests/screenshots";
const e2e = run("node", [script, process.env.E2E_VIEWPORT ? `${dir}/${process.env.E2E_VIEWPORT}` : dir], { E2E_BASE: `http://localhost:${PORT}/` });
e2e.on("exit", code => { stt.kill(); srv.kill(); process.exit(code); });
