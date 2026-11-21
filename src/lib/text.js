/* Outils de texte partagés. */

/* Minuscules sans accents (ARC-14) : recherche, correspondance de mots-clés, adresses. */
export const stripAccents = s => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
/* Identifiant d'adresse : « Préparer son entretien » donne « preparer-son-entretien ». */
export const slugify = s => stripAccents(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* Métier sans ses parenthèses : « serveur(se) » devient « serveur ». */
export const posteLabel = poste => (poste || "").replace(/\s*\([^)]*\)/g, "").trim();

/* Élision devant voyelle ou h muet (BUG-12) : « d'agent d'accueil », « de serveur ». */
export const dePoste = job => (/^[aeiouyhàâäéèêëîïôöûùü]/i.test(job) ? `d'${job}` : `de ${job}`);

/* Remplit {poste} dans un texte. « de {poste} » prend l'élision ; sans métier, « de {poste} » disparaît
   (« ce poste de {poste} » devient « ce poste ») et {poste} seul prend la valeur de repli. */
export function fillPoste(text, poste, fallback = "ce poste") {
  const job = posteLabel(poste);
  if (job) return text.replace(/(?<![\p{L}])de \{poste\}/gu, dePoste(job)).replace(/\{poste\}/g, job);
  return text.replace(/ de \{poste\}/g, "").replace(/\{poste\}/g, fallback);
}
