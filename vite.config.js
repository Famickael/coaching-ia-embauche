import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";

/* Moteur MediaPipe (SEC-04) : les deux fichiers utilisés par FilesetResolver.forVisionTasks sont servis par le site,
   sous mediapipe/, au lieu de cdn.jsdelivr.net. Version figée par package.json (@mediapipe/tasks-vision 1.2.3). */
const MP_DIR = fileURLToPath(new URL("./node_modules/@mediapipe/tasks-vision/wasm/", import.meta.url));
const MP_FILES = ["vision_wasm_internal.js", "vision_wasm_internal.wasm"];
const mediapipe = () => ({
  name: "la-repet-mediapipe",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const f = MP_FILES.find(n => req.url?.split("?")[0].endsWith(`/mediapipe/${n}`));
      if (!f) return next();
      res.setHeader("Content-Type", f.endsWith(".wasm") ? "application/wasm" : "text/javascript");
      res.end(readFileSync(MP_DIR + f));
    });
  },
  generateBundle() {
    for (const f of MP_FILES) this.emitFile({ type: "asset", fileName: `mediapipe/${f}`, source: readFileSync(MP_DIR + f) });
  },
});

export default defineConfig({
  plugins: [react(), mediapipe()],
  base: "./",
  worker: { format: "es" },
});
