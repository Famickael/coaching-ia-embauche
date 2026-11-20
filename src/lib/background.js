/* Changement du fond derrière la personne pendant l'échauffement (MediaPipe Image Segmenter,
   modèle « selfie segmenter »). Tout le calcul se fait dans le navigateur, sur un <canvas> :
   aucune image n'est envoyée ni enregistrée. Le masque ne sert qu'à séparer la personne du décor ;
   aucune autre information n'est extraite de l'image. */

import { FilesetResolver, ImageSegmenter } from "@mediapipe/tasks-vision";
import { FIX } from "../tokens.js";

const WASM = import.meta.env.VITE_MEDIAPIPE_WASM || "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm";
const MODEL = import.meta.env.VITE_SEGMENTER_MODEL ||
  "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/1/selfie_segmenter.tflite";

export const BG_COLOR = FIX.studio; // couleur unie proposée (jeton du référentiel)

let segPromise = null;
/* Charge le modèle une seule fois. En cas d'échec, un nouvel essai reste possible plus tard. */
export function loadSegmenter() {
  if (!segPromise) {
    segPromise = FilesetResolver.forVisionTasks(WASM)
      .then(fs => ImageSegmenter.createFromOptions(fs, {
        baseOptions: { modelAssetPath: MODEL, delegate: "GPU" },
        runningMode: "VIDEO", outputConfidenceMasks: true, outputCategoryMask: false,
      }))
      .catch(e => { segPromise = null; throw e; });
  }
  return segPromise;
}

/* Démarre le rendu sur `canvas` à partir de l'élément <video>.
   getMode() renvoie "blur" ou "color" ; renvoie une fonction d'arrêt. */
export function startBackground(segmenter, video, canvas, getMode) {
  const ctx = canvas.getContext("2d");
  const maskCanvas = document.createElement("canvas");
  const mctx = maskCanvas.getContext("2d");
  // flou obtenu par réduction puis agrandissement (ctx.filter n'existe pas sur Safari)
  const small = document.createElement("canvas");
  const sctx = small.getContext("2d");
  let raf = 0, alive = true, lastTs = -1, imgData = null;

  const frame = () => {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    const w = video.videoWidth, h = video.videoHeight;
    if (!w || !h || video.readyState < 2) return;
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    let ts = performance.now();
    if (ts <= lastTs) ts = lastTs + 1;
    lastTs = ts;
    try {
      segmenter.segmentForVideo(video, ts, result => {
        const masks = result.confidenceMasks || [];
        const mask = masks[masks.length - 1]; // dernière catégorie : la personne
        if (!mask) return;
        const mw = mask.width, mh = mask.height, data = mask.getAsFloat32Array();
        if (maskCanvas.width !== mw || maskCanvas.height !== mh) { maskCanvas.width = mw; maskCanvas.height = mh; imgData = null; }
        if (!imgData) imgData = mctx.createImageData(mw, mh);
        const px = imgData.data;
        for (let i = 0, j = 3; i < data.length; i++, j += 4) px[j] = Math.min(255, Math.max(0, data[i] * 255 * 1.15 - 10));
        mctx.putImageData(imgData, 0, 0);

        // 1. la personne : masque, puis image de la caméra à l'intérieur
        ctx.save();
        ctx.clearRect(0, 0, w, h);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(maskCanvas, 0, 0, w, h);
        ctx.globalCompositeOperation = "source-in";
        ctx.drawImage(video, 0, 0, w, h);
        // 2. le fond, derrière
        ctx.globalCompositeOperation = "destination-over";
        if (getMode() === "color") {
          ctx.fillStyle = BG_COLOR; ctx.fillRect(0, 0, w, h);
        } else {
          const sw = Math.max(16, Math.round(w / 14)), sh = Math.max(9, Math.round(h / 14));
          if (small.width !== sw) { small.width = sw; small.height = sh; }
          sctx.drawImage(video, 0, 0, sw, sh);
          ctx.drawImage(small, 0, 0, w, h);
        }
        ctx.restore();
      });
    } catch (e) {
      console.warn("[fond] rendu interrompu", e);
    }
  };
  raf = requestAnimationFrame(frame);
  return () => { alive = false; cancelAnimationFrame(raf); };
}
