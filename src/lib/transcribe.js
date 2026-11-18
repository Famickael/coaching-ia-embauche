/* Transcription d'une prise.
   - Par défaut : Whisper exécuté dans le navigateur (whisper.worker.js), aucun envoi du son.
   - Si VITE_STT_ENDPOINT est défini : envoi du fichier audio à un service de transcription
     hébergé en France, compatible avec le format OpenAI « audio/transcriptions » (verbose_json). */

async function decodeTo16k(blob) {
  const buf = await blob.arrayBuffer();
  const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
  try {
    const audio = await ctx.decodeAudioData(buf);
    const ch = audio.numberOfChannels > 1
      ? audio.getChannelData(0).map((v, i) => (v + audio.getChannelData(1)[i]) / 2)
      : audio.getChannelData(0);
    return { audio: new Float32Array(ch), duration: audio.duration };
  } finally { ctx.close(); }
}

async function remote(blob, onProgress) {
  onProgress?.({ stage: "transcribe", value: 0 });
  const form = new FormData();
  form.append("file", blob, "prise.webm");
  form.append("model", import.meta.env.VITE_STT_MODEL || "whisper-1");
  form.append("language", "fr");
  form.append("response_format", "verbose_json");
  form.append("timestamp_granularities[]", "segment");
  const res = await fetch(import.meta.env.VITE_STT_ENDPOINT, { method: "POST", body: form });
  if (!res.ok) throw new Error(`Service de transcription : erreur ${res.status}`);
  const d = await res.json();
  const segments = (d.segments || [{ start: 0, end: d.duration || 0, text: d.text }]).map(s => ({ start: s.start, end: s.end, text: s.text.trim() }));
  return { text: d.text.trim(), segments };
}

let worker = null;

export async function transcribe(blob, onProgress) {
  if (import.meta.env.VITE_STT_ENDPOINT) return remote(blob, onProgress);
  const { audio, duration } = await decodeTo16k(blob);
  if (!worker) worker = new Worker(new URL("./whisper.worker.js", import.meta.url), { type: "module" });
  return new Promise((resolve, reject) => {
    worker.onmessage = ({ data }) => {
      if (data.type === "progress") onProgress?.(data);
      else if (data.type === "done") resolve({ text: data.text, segments: data.segments });
      else if (data.type === "error") reject(new Error(data.message));
    };
    worker.postMessage({ audio, duration }, [audio.buffer]);
  });
}
