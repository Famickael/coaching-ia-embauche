/* Banque de questions d'entraînement. {poste} est remplacé par le poste visé du parcours (fillPoste, src/lib/text.js :
   « de {poste} » prend l'élision, « d'agent d'accueil »). */
import { posteLabel, dePoste, fillPoste } from "./text.js";
import { stripAccents } from "./text.js";
export { posteLabel, dePoste };

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
export const fill = (q, poste) => fillPoste(q, poste);

/* Échauffement : une seule phrase à la fois, à dire à voix haute. Rien n'est enregistré. */
export const WARMUP_PHRASES = [
  "Bonjour, je m'appelle {prenom} et je vous remercie de me recevoir.",
  "Merci de me recevoir aujourd'hui pour parler du poste de {poste}.",
  "Je m'intéresse au métier de {poste} depuis plusieurs mois.",
  "Ce qui me plaît dans le métier de {poste}, c'est le contact avec les gens.",
  "Dans mon dernier emploi, j'accueillais et j'orientais le public.",
  "J'aime apprendre de nouvelles choses et je m'adapte vite.",
  "Je suis quelqu'un de ponctuel et d'organisé.",
  "Je travaille bien en équipe, et je sais aussi travailler en autonomie.",
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

/* Consignes : une manière différente de redire la même phrase. */
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
  return fillPoste(text, poste).replace("{prenom}", first || "…");
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

/* ─── Entraînement complet : simulation d'entretien dans l'ordre réel ───
   Accueil, présentation, motivation pour le poste, expériences, qualités et axes de progrès,
   mise en situation liée au métier, question au recruteur. 7 questions, contextualisées par le métier. */
const SITUATIONS = [
  [["accueil", "hote", "hotesse", "standard", "secretaire", "receptionniste", "agent d'accueil", "guichet"], "Une personne arrive mécontente à l'accueil parce qu'elle attend depuis longtemps. Que faites-vous ?"],
  [["vend", "commerc", "caiss", "magasin", "libre-service", "boutique", "conseill"], "Un client hésite entre deux produits et vous demande conseil, alors que d'autres clients attendent. Comment vous y prenez-vous ?"],
  [["serveu", "cuisin", "restaura", "barman", "barmaid", "plonge", "commis", "boulang", "patiss", "hotel"], "En plein service, une commande a été oubliée et le client s'impatiente. Que faites-vous ?"],
  [["soin", "aide", "auxiliaire", "infirm", "creche", "enfance", "animat", "educat", "menag", "domicile"], "Une personne dont vous vous occupez refuse l'aide que vous lui proposez. Comment réagissez-vous ?"],
  [["logist", "magasinier", "cariste", "preparat", "chauffeur", "livreu", "manutention", "entrepot", "transport"], "Une livraison urgente arrive alors que votre journée est déjà chargée. Comment vous organisez-vous ?"],
  [["batiment", "macon", "electric", "plomb", "peint", "menuis", "chantier", "entretien", "proprete", "jardin", "agent de"], "Pendant votre travail, vous remarquez un risque pour la sécurité d'un collègue. Que faites-vous ?"],
  [["administr", "comptab", "assistant", "gestion", "bureau", "informati", "secretariat"], "On vous confie deux dossiers urgents à rendre en même temps. Comment vous organisez-vous ?"],
];
const normJob = stripAccents;
export function situationFor(poste) {
  const p = normJob(poste);
  const hit = SITUATIONS.find(([keys]) => keys.some(k => p.includes(normJob(k))));
  return hit ? hit[1] : "Décrivez une situation difficile que vous avez su gérer au travail. Qu'avez-vous fait ?";
}
export function fullInterview(poste) {
  const job = posteLabel(poste), de = job ? ` ${dePoste(job)}` : "";
  return [
    { step: "Accueil", text: `Pour commencer, comment avez-vous entendu parler de ce poste${de} ?` },
    { step: "Présentation", text: "Pouvez-vous vous présenter en deux minutes ?" },
    { step: "Motivation", text: `Pourquoi ce poste${de} vous intéresse-t-il ?` },
    { step: "Expériences", text: `Racontez une expérience qui vous prépare au métier${de}. Qu'avez-vous fait, concrètement ?` },
    { step: "Qualités et axes de progrès", text: "Quelles qualités apporteriez-vous à ce poste, et sur quel point aimeriez-vous progresser ?" },
    { step: "Mise en situation", text: situationFor(poste) },
    { step: "Vos questions", text: "Nous arrivons à la fin de l'entretien. Avez-vous des questions à nous poser ?" },
  ];
}
export const FULL_INTRO = "Bonjour, et merci d'être là. Nous allons commencer l'entretien.";
export const FULL_OUTRO = "Merci pour cet échange. C'est la fin de l'entretien.";
