/* Métiers courants de l'accompagnement vers l'emploi (France), pour l'autocomplétion du métier visé.
   La saisie libre reste possible : cette liste ne sert qu'à suggérer. */

export const JOBS = [
  // Accueil, secrétariat, administration
  "agent d'accueil", "hôte ou hôtesse d'accueil", "standardiste", "secrétaire", "secrétaire médical(e)",
  "assistant(e) administratif(ve)", "assistant(e) de direction", "assistant(e) RH", "gestionnaire de paie",
  "comptable", "aide-comptable", "agent administratif", "employé(e) de bureau", "chargé(e) de clientèle",
  "téléconseiller(ère)", "conseiller(ère) clientèle", "agent de saisie", "agent de la fonction publique",
  // Commerce, vente
  "vendeur(se) en magasin", "vendeur(se) en prêt-à-porter", "employé(e) libre-service", "employé(e) de commerce",
  "caissier(ère)", "hôte ou hôtesse de caisse", "conseiller(ère) de vente", "responsable de rayon", "manager de magasin",
  "commercial(e)", "commercial(e) itinérant(e)", "chargé(e) d'affaires", "boulanger(ère) vendeur(se)", "fleuriste",
  "employé(e) de pharmacie", "préparateur(trice) en pharmacie", "opticien(ne)",
  // Logistique, transport
  "préparateur(trice) de commandes", "magasinier(ère)", "cariste", "agent logistique", "manutentionnaire",
  "agent de quai", "réceptionnaire", "gestionnaire de stock", "chauffeur(se) livreur(se)", "livreur(se)",
  "conducteur(trice) poids lourd", "conducteur(trice) de bus", "conducteur(trice) de VTC", "chauffeur(se) de taxi",
  "agent de tri", "facteur(trice)", "déménageur(se)",
  // Hôtellerie, restauration
  "serveur(se)", "commis de cuisine", "cuisinier(ère)", "plongeur(se)", "employé(e) polyvalent(e) de restauration",
  "barman ou barmaid", "pâtissier(ère)", "boulanger(ère)", "boucher(ère)", "agent de restauration collective",
  "réceptionniste en hôtel", "femme ou valet de chambre", "gouvernant(e) d'hôtel", "chef de rang", "équipier(ère) en restauration rapide",
  // Propreté, sécurité, services
  "agent d'entretien", "agent de propreté", "agent de nettoyage", "laveur(se) de vitres", "agent de sécurité",
  "agent de surveillance", "agent de prévention", "gardien(ne) d'immeuble", "concierge", "agent de stationnement",
  "agent d'entretien des espaces verts", "jardinier(ère) paysagiste", "agent polyvalent", "agent de maintenance des bâtiments",
  // Aide à la personne, santé, social
  "aide à domicile", "auxiliaire de vie", "aide-soignant(e)", "agent de service hospitalier", "infirmier(ère)",
  "brancardier(ère)", "ambulancier(ère)", "auxiliaire de puériculture", "assistant(e) maternel(le)", "garde d'enfants",
  "accompagnant(e) éducatif(ve) et social(e)", "moniteur(trice) éducateur(trice)", "éducateur(trice) spécialisé(e)",
  "animateur(trice)", "animateur(trice) périscolaire", "ATSEM", "AESH (accompagnant d'élèves en situation de handicap)",
  "médiateur(trice) social(e)", "conseiller(ère) en insertion professionnelle", "agent de médiation",
  "aide médico-psychologique",
  // Bâtiment, industrie
  "maçon(ne)", "électricien(ne)", "plombier(ère)", "chauffagiste", "peintre en bâtiment", "plaquiste", "carreleur(se)",
  "menuisier(ère)", "charpentier(ère)", "couvreur(se)", "manœuvre", "ouvrier(ère) du BTP", "chef d'équipe BTP",
  "conducteur(trice) d'engins", "agent de production", "opérateur(trice) de production", "conducteur(trice) de ligne",
  "soudeur(se)", "mécanicien(ne) automobile", "carrossier(ère)", "technicien(ne) de maintenance", "électromécanicien(ne)",
  "agent de fabrication", "monteur(se) câbleur(se)", "contrôleur(se) qualité", "usineur(se)", "tourneur(se) fraiseur(se)",
  // Numérique, communication
  "développeur(se) web", "technicien(ne) informatique", "technicien(ne) support", "administrateur(trice) systèmes et réseaux",
  "community manager", "chargé(e) de communication", "graphiste", "webmaster", "data analyst", "chef de projet",
  // Agriculture, environnement
  "ouvrier(ère) agricole", "agent viticole", "saisonnier(ère) agricole", "agent de déchetterie", "ripeur(se)",
  // Éducation, formation, culture, sport
  "formateur(trice)", "professeur(e)", "surveillant(e) d'établissement", "bibliothécaire", "agent d'accueil en musée",
  "éducateur(trice) sportif(ve)", "coach sportif",
  // Beauté, bien-être
  "coiffeur(se)", "esthéticien(ne)", "prothésiste ongulaire",
  // Immobilier, banque
  "agent immobilier", "conseiller(ère) bancaire", "gestionnaire locatif(ve)", "assistant(e) commercial(e)",
];

/* Normalise pour la recherche : minuscules, sans accents ni ponctuation. */
export const norm = s => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/œ/g, "oe").replace(/[^a-z0-9]+/g, " ").trim();

const INDEX = [...new Set(JOBS)].map(j => ({ label: j, n: norm(j) }));

/* Recherche insensible aux accents et à la casse. Les débuts de libellé passent en premier,
   puis les débuts de mot, puis les correspondances au milieu d'un mot. */
export function searchJobs(query, limit = 8) {
  const q = norm(query);
  if (!q) return INDEX.slice(0, limit).map(x => x.label);
  const parts = q.split(" ");
  const scored = [];
  for (const x of INDEX) {
    if (!parts.every(p => x.n.includes(p))) continue;
    const score = x.n.startsWith(q) ? 0 : (" " + x.n).includes(" " + parts[0]) ? 1 : 2;
    scored.push([score, x.n.length, x.label]);
  }
  scored.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  return scored.slice(0, limit).map(x => x[2]);
}
