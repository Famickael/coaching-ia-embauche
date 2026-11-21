import { defineConfig, loadEnv } from "vite";
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

/* Politique de sécurité du contenu (SEC-08), posée par une balise meta au build (GitHub Pages ne permet pas les en-têtes) :
   code et styles du site seulement (styles en ligne et petit script de thème d'index.html : 'unsafe-inline'),
   WebAssembly autorisé ('wasm-unsafe-eval'), médias et workers en blob:, connexions vers le site, les modèles
   (Hugging Face, Google) et les services configurés (VITE_LLM_ENDPOINT, VITE_STT_ENDPOINT, VITE_MODELS_BASE_URL).
   Pas en développement (rechargement à chaud). */
const csp = env => ({
  name: "la-repet-csp",
  apply: "build",
  transformIndexHtml(html) {
    const origin = u => { try { return new URL(u).origin; } catch { return null; } };
    const extra = [env.VITE_LLM_ENDPOINT, env.VITE_STT_ENDPOINT, env.VITE_MODELS_BASE_URL, env.VITE_MEDIAPIPE_WASM, env.VITE_FACE_MODEL, env.VITE_SEGMENTER_MODEL].map(origin).filter(Boolean);
    const connect = ["'self'", "blob:", "data:", "https://huggingface.co", "https://*.huggingface.co", "https://*.hf.co", "https://storage.googleapis.com", ...new Set(extra)].join(" ");
    const policy = [
      "default-src 'self'", "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' blob:", "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:", "media-src 'self' blob:", "font-src 'self'", `connect-src ${connect}`,
      "worker-src 'self' blob:", "object-src 'none'", "base-uri 'self'", "form-action 'self'",
    ].join("; ");
    return html.replace("<!--csp-->", `<meta http-equiv="Content-Security-Policy" content="${policy}" />`);
  },
});

export default defineConfig(({ mode }) => ({
  plugins: [react(), mediapipe(), csp(loadEnv(mode, process.cwd(), "VITE_"))],
  base: "./",
  worker: { format: "es" },
}));
