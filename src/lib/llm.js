/* Point d'accès unique au modèle de langage, sans fournisseur (AGENTS.md, section 8).
   Le navigateur envoie une requête au format « chat completions » à VITE_LLM_ENDPOINT, avec la tâche
   (« chat » : assistant de préparation, « feedback » : reformulation du retour, « coach » : aide au rapport).
   Le fournisseur, le modèle et la clé se choisissent derrière ce point d'accès, dans un petit proxy sans état
   (modèle : serveur/llm-proxy) : aucun nom de fournisseur ni de modèle dans le code du navigateur.
   VITE_LLM_MODEL est facultatif : sans lui, le champ « model » n'est pas envoyé et le proxy décide.
   Sans VITE_LLM_ENDPOINT, tout fonctionne avec les moteurs locaux (analyse, assistants). */

export const LLM_ENDPOINT = import.meta.env?.VITE_LLM_ENDPOINT || "";
export const LLM_MODEL = import.meta.env?.VITE_LLM_MODEL || "";
export const llmEnabled = () => !!LLM_ENDPOINT;

/* Corps de la requête : tâche, modèle seulement s'il est imposé par la configuration, puis messages et réglages. */
export const llmBody = (task, body) => ({ task, ...(LLM_MODEL ? { model: LLM_MODEL } : {}), ...body });

/* Envoie la requête et renvoie le texte de la réponse (choices[0].message.content), ou lève une erreur. */
export async function llmComplete(task, body, { signal } = {}) {
  const res = await fetch(LLM_ENDPOINT, {
    method: "POST", signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(llmBody(task, body)),
  });
  if (!res.ok) throw new Error(res.status);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
