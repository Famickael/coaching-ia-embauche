/* Transcription dans le navigateur (Whisper, ONNX, via transformers.js).
   Le son ne quitte pas l'appareil. Le modèle est téléchargé une fois puis mis en cache par le navigateur. */
import { pipeline, env } from "@huggingface/transformers";

const MODEL = import.meta.env.VITE_WHISPER_MODEL || "onnx-community/whisper-base";
if (import.meta.env.VITE_MODELS_BASE_URL) {
  // modèles auto-hébergés (production) : <base>/<modèle>/...
  env.remoteHost = import.meta.env.VITE_MODELS_BASE_URL;
  env.remotePathTemplate = "{model}/";
}

let asr = null;

self.onmessage = async ({ data }) => {
  try {
    if (!asr) {
      asr = await pipeline("automatic-speech-recognition", MODEL, {
        dtype: { encoder_model: "fp32", decoder_model_merged: "q8" },
        device: navigator.gpu ? "webgpu" : "wasm",
        progress_callback: p => {
          if (p.status === "progress") self.postMessage({ type: "progress", stage: "model", value: Math.round(p.progress || 0) });
        },
      });
    }
    self.postMessage({ type: "progress", stage: "transcribe", value: 0 });
    const out = await asr(data.audio, {
      language: "french", task: "transcribe",
      return_timestamps: true, chunk_length_s: 30, stride_length_s: 5,
    });
    const segments = (out.chunks || [{ timestamp: [0, data.duration], text: out.text }]).map(c => ({
      start: c.timestamp?.[0] ?? 0,
      end: c.timestamp?.[1] ?? c.timestamp?.[0] ?? 0,
      text: (c.text || "").trim(),
    })).filter(s => s.text);
    self.postMessage({ type: "done", text: out.text.trim(), segments });
  } catch (e) {
    self.postMessage({ type: "error", message: String(e?.message || e) });
  }
};
