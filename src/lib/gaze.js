/* Suivi local de la direction du regard et de la présence dans le cadre (MediaPipe Face Landmarker).
   Tout le calcul se fait dans le navigateur, aucune image n'est envoyée.

   Seules sont lues : la position des repères du visage (présence, orientation de la tête)
   et les coefficients de direction des yeux (eyeLookDown*, eyeLookOut*, eyeLookIn*).
   Les coefficients d'expression (sourire, sourcils, etc.) ne sont jamais lus :
   aucune émotion n'est déduite (AI Act, art. 5(1)(f)). */

import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";

const WASM = import.meta.env.VITE_MEDIAPIPE_WASM || "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm";
const MODEL = import.meta.env.VITE_FACE_MODEL ||
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const EYE_KEYS = ["eyeLookDownLeft", "eyeLookDownRight", "eyeLookOutLeft", "eyeLookOutRight", "eyeLookInLeft", "eyeLookInRight"];

let landmarkerPromise = null;
function getLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = FilesetResolver.forVisionTasks(WASM).then(fs =>
      FaceLandmarker.createFromOptions(fs, {
        baseOptions: { modelAssetPath: MODEL, delegate: "GPU" },
        runningMode: "VIDEO", numFaces: 1, outputFaceBlendshapes: true,
      }));
  }
  return landmarkerPromise;
}

/* Démarre un échantillonnage (2 images par seconde) sur l'élément <video>.
   Retourne { stop(): résumé } ; en cas d'indisponibilité, le résumé vaut null. */
export function startGaze(video, startedAt) {
  const samples = [];
  let timer = null, alive = true;

  getLandmarker().then(lm => {
    if (!alive) return;
    timer = setInterval(() => {
      if (!video.videoWidth) return;
      const t = (performance.now() - startedAt) / 1000;
      let r;
      try { r = lm.detectForVideo(video, performance.now()); } catch { return; }
      const face = r.faceLandmarks?.[0];
      if (!face) { samples.push({ t, present: false }); return; }
      const cat = {};
      (r.faceBlendshapes?.[0]?.categories || []).forEach(c => { if (EYE_KEYS.includes(c.categoryName)) cat[c.categoryName] = c.score; });
      const down = ((cat.eyeLookDownLeft || 0) + (cat.eyeLookDownRight || 0)) / 2;
      // orientation de la tête : position du nez entre les coins externes des yeux
      const L = face[33], R = face[263], N = face[1];
      const yaw = (N.x - L.x) / ((R.x - L.x) || 1);
      const eyesSide = Math.max(((cat.eyeLookOutLeft || 0) + (cat.eyeLookInRight || 0)) / 2, ((cat.eyeLookInLeft || 0) + (cat.eyeLookOutRight || 0)) / 2);
      samples.push({ t, present: true, down: down > 0.45, side: Math.abs(yaw - 0.5) > 0.18 || eyesSide > 0.55 });
    }, 500);
  }).catch(e => console.warn("[regard] suivi indisponible", e));

  return {
    stop() {
      alive = false;
      if (timer) clearInterval(timer);
      if (samples.length < 4) return null;
      const n = samples.length;
      const absent = samples.filter(s => !s.present).length;
      const down = samples.filter(s => s.present && s.down).length;
      const side = samples.filter(s => s.present && !s.down && s.side).length;
      // plus longue séquence où le regard n'est pas vers l'écran
      let best = { len: 0, at: null }, cur = { len: 0, at: null };
      samples.forEach(s => {
        const away = !s.present || s.down || s.side;
        if (away) { if (!cur.len) cur.at = s.t; cur.len++; if (cur.len > best.len) best = { ...cur }; } else cur = { len: 0, at: null };
      });
      return { samples: n, absentRatio: absent / n, downRatio: down / n, sideRatio: side / n, longestAwayAt: best.at, longestAwaySec: best.len / 2 };
    },
  };
}
