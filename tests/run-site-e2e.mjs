/* Test des pages publiques (site) : construit l'application, la sert, puis visite toutes les pages
   à 1280 px et à 390 px dans Chromium (menu mobile, strate épinglée, FAQ, ressources, formulaire).
   Captures dans tests/screenshots/site/. Lancer : npm run test:site (CHROMIUM_PATH facultatif). */
import { spawn, execSync } from "child_process";

const OUT = "node_modules/.cache/site-dist", PORT = 5097;
execSync(`npx vite build --outDir ${OUT} --emptyOutDir`, { stdio: "inherit" });
const srv = spawn("node", ["node_modules/vite/bin/vite.js", "preview", "--outDir", OUT, "--port", String(PORT), "--strictPort"], { stdio: "inherit" });
await new Promise(r => setTimeout(r, 2500));
const t = spawn("node", ["tests/site.e2e.cjs", `http://localhost:${PORT}/`, "tests/screenshots/site"], { stdio: "inherit" });
t.on("exit", code => { srv.kill(); process.exit(code); });
