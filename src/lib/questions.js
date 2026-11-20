/* Banque de questions d'entraînement. {poste} est remplacé par le poste visé du parcours. */
export const WARMUP_QUESTION = "En une phrase, qu'est-ce qui vous a donné envie de postuler à ce poste ?";

export const QUESTIONS = [
  { id: "presentation", theme: "Présentation de soi", text: "Pouvez-vous vous présenter en deux minutes ?" },
  { id: "motivation", theme: "Motivation", text: "Pourquoi ce poste de {poste} vous intéresse-t-il ?" },
  { id: "experience", theme: "Expérience", text: "Racontez une expérience professionnelle ou personnelle dont vous êtes fier ou fière." },
  { id: "difficulte", theme: "Mises en situation", text: "Décrivez une situation difficile que vous avez su gérer. Qu'avez-vous fait ?" },
  { id: "equipe", theme: "Travail en équipe", text: "Comment travaillez-vous avec une équipe ? Donnez un exemple." },
  { id: "qualites", theme: "Compétences", text: "Quelles sont les compétences que vous apporteriez dans ce poste de {poste} ?" },
  { id: "progres", theme: "Compétences", text: "Sur quel point aimeriez-vous progresser, et comment vous y prenez-vous ?" },
  { id: "parcours", theme: "Parcours", text: "Comment expliquez-vous les étapes de votre parcours ?" },
  { id: "entreprise", theme: "Motivation", text: "Que savez-vous de notre entreprise et de notre secteur ?" },
  { id: "projection", theme: "Projet", text: "Comment voyez-vous votre évolution dans les deux prochaines années ?" },
  { id: "questions", theme: "Fin d'entretien", text: "Avez-vous des questions à nous poser ?" },
];

/* Libellé de métier inséré dans une phrase : « serveur(se) » devient « serveur ». */
export const posteLabel = poste => (poste || "").replace(/\s*\([^)]*\)/g, "").trim();
export const fill = (q, poste) => q.replace("{poste}", posteLabel(poste) || "ce poste");

/* Échauffement : une seule phrase à la fois, à dire à voix haute. Rien n'est enregistré. */
export const WARMUP_PHRASES = [
  "Bonjour, je m'appelle {prenom} et je vous remercie de me recevoir.",
  "Je suis ravi·e d'être ici aujourd'hui pour parler du poste de {poste}.",
  "Je m'intéresse au métier de {poste} depuis plusieurs mois.",
  "Ce qui me plaît dans le métier de {poste}, c'est le contact avec les gens.",
  "Dans mon dernier emploi, j'étais chargé·e d'accueillir et d'orienter le public.",
  "J'aime apprendre de nouvelles choses et je m'adapte vite.",
  "Je suis quelqu'un de ponctuel et d'organisé.",
  "Je travaille bien en équipe, et je sais aussi avancer seul·e.",
  "Pendant ma formation, j'ai appris à respecter des consignes précises.",
  "Je peux vous donner un exemple concret de ce que j'ai réalisé.",
  "Ma principale qualité, c'est la persévérance.",
  "Un point que je travaille en ce moment, c'est la prise de parole en groupe.",
  "Entre deux emplois, j'ai suivi une formation pour me remettre à niveau.",
  "Je suis disponible rapidement, à temps plein ou à temps partiel.",
  "J'ai choisi votre entreprise parce que ses valeurs me correspondent.",
  "Pour moi, un bon accueil commence par l'écoute.",
  "Je souhaite évoluer dans le métier de {poste} au cours des prochaines années.",
  "Avez-vous des précisions sur l'organisation de l'équipe ?",
  "Quelles seraient mes premières missions si je rejoignais votre équipe ?",
  "Je vous remercie pour cet échange, au plaisir de vous revoir.",
];

/* Consignes de relance : une manière différente de redire la même phrase. */
export const WARMUP_PROMPTS = [
  "Lisez-la une première fois, tranquillement, à voix haute.",
  "Redites-la un peu plus lentement, en articulant chaque mot.",
  "Prenez une inspiration avant de commencer, puis dites-la d'un seul souffle.",
  "Dites-la en regardant la caméra sur les derniers mots.",
  "Marquez une courte pause après la virgule ou au milieu de la phrase.",
  "Essayez de la dire sans la lire, avec vos propres mots si besoin.",
  "Redites-la un peu plus fort, comme si la personne était au fond de la pièce.",
];

export function fillPhrase(text, { poste, prenom } = {}) {
  const first = (prenom || "").split(" ")[0];
  return text
    .replace("{poste}", posteLabel(poste) || "ce poste")
    .replace("{prenom}", first || "…");
}

/* Tire une phrase au hasard, différente de la précédente. */
export function randomPhraseIndex(prev = -1) {
  if (WARMUP_PHRASES.length < 2) return 0;
  let i;
  do { i = Math.floor(Math.random() * WARMUP_PHRASES.length); } while (i === prev);
  return i;
}

/* Questionnaire de fin d'échauffement : ce que la personne aimerait travailler ensuite.
   Chaque sujet présélectionne des questions de la banque pour l'entraînement. */
export const WORK_TOPICS = [
  { id: "presenter", label: "Me présenter", questions: ["presentation"] },
  { id: "experiences", label: "Parler de mes expériences", questions: ["experience", "difficulte"] },
  { id: "motivation", label: "Expliquer ma motivation", questions: ["motivation", "entreprise"] },
  { id: "qualites", label: "Mes qualités et mes points à travailler", questions: ["qualites", "progres"] },
  { id: "parcours", label: "Expliquer mon parcours", questions: ["parcours"] },
  { id: "equipe", label: "Le travail en équipe", questions: ["equipe"] },
  { id: "fin", label: "Poser mes questions au recruteur", questions: ["questions", "projection"] },
];

export const questionsForTopics = ids => [...new Set(WORK_TOPICS.filter(t => ids.includes(t.id)).flatMap(t => t.questions))];
