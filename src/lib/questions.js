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

export const fill = (q, poste) => q.replace("{poste}", poste || "ce poste");
