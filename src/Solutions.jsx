import React from "react";
import { T, RAD, SH, Btn, Card, Tag, Icon, I, TY, W, img, Eyebrow, Section, PageHero, IconTile, Tabs } from "./ui.jsx";
import { Reveal, useSectionScroll } from "./motion.jsx";
import { FinalBand } from "./home/FinalBand.jsx";

/* Page « Solutions » (ancienne page Fonctionnement) : le déroulé, puis ce que l'outil apporte à chaque public :
   personnes accompagnées, coachs, organismes (direction, DSI, juridique et DPO). Ancres : #/solutions/<id>. */

const AUDIENCES = [
  ["beneficiaires", "Personnes accompagnées", I.user],
  ["coachs", "Coachs", I.users],
  ["organismes", "Organismes", I.building],
];

export default function Solutions({ go, openSpace, section }) {
  useSectionScroll(section);
  return (
    <main>
      <PageHero eyebrow="Solutions" title="Ce que La Répét' apporte à chacun"
        lead="Un même outil pour trois publics : la personne qui s'entraîne, le coach qui l'accompagne, l'organisme qui le met en place."
        aside={<HeroAside />}>
        <nav aria-label="Publics" className="rs-chips" style={{ marginTop: 8 }}>
          {AUDIENCES.map(([id, l, ic]) => <a key={id} href={`#/solutions/${id}`} className="rs-chip" style={{ textDecoration: "none" }}><Icon d={ic} s={16} /> {l}</a>)}
        </nav>
      </PageHero>

      <div className="rs-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: "0 24px" }}>
        <Section first eyebrow="Le déroulé" title="Sept étapes, chacune décidée par une personne" sub="Rien ne passe d'une étape à la suivante sans que quelqu'un le décide.">
          <Reveal><Flow /></Reveal>
        </Section>

        <AudienceSection id="beneficiaires" tag="Personnes accompagnées" title="S'entraîner seul, sans être jugé"
          sub="Un espace personnel, ouvert avec un code, pour répéter autant que nécessaire avant le jour J."
          features={BENEF} cta={<Btn kind="objective" onClick={() => go("#/espace")} iconRight={I.arrow}>Lancer ma première répétition</Btn>} />

        <AudienceSection id="coachs" tag="Coachs" title="Relire, nuancer, préparer le débriefing"
          sub="Vous voyez seulement ce que la personne choisit de vous envoyer, et vous décidez de ce qui lui revient."
          features={COACH} cta={<Btn kind="secondary" onClick={() => go("#/espace")}>Me connecter à l'espace coach</Btn>} />

        <Section id="assistant" eyebrow="L'assistant" title="Ce que l'assistant observe, et ce qu'il n'observe pas" sub="Des faits, situés à un moment précis de la réponse. Jamais une note.">
          <div className="rs-split" style={{ alignItems: "start" }}>
            <div className="rs-g2" style={{ gap: 12 }}>
              {OBSERVE.map(([t, ex], i) => (
                <Reveal key={t} delay={(i % 2) * 70} style={{ height: "100%" }}>
                  <Card pad="sm" style={{ height: "100%", display: "grid", gap: 4, alignContent: "start" }}>
                    <h3 style={{ ...TY.h4, color: T.navy, margin: 0 }}>{t}</h3>
                    <p style={{ ...TY.small, color: T.body, margin: 0 }}>{ex}</p>
                  </Card>
                </Reveal>
              ))}
            </div>
            <Reveal>
              <div style={{ background: T.violetBg, borderRadius: RAD.lg, padding: 32, display: "grid", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}><IconTile icon={I.ban} c={T.violet} bg={T.surface} /><h3 style={{ ...TY.h2, color: T.navy, margin: 0 }}>Ce que l'assistant n'observe pas</h3></div>
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, ...TY.body, color: T.navy }}>
                  <li>Les émotions, l'humeur ou le stress supposé.</li>
                  <li>La personnalité, la motivation ou la sincérité.</li>
                  <li>L'apparence, la tenue, l'âge, l'origine.</li>
                  <li>L'accent ou la façon de parler d'une région.</li>
                </ul>
                <p style={{ ...TY.small, color: T.body, margin: 0 }}>Le suivi du regard lit seulement la position de la tête et la direction des yeux, jamais les expressions du visage. Un filtre écarte tout retour qui contient une note ou un mot sur les émotions.</p>
              </div>
            </Reveal>
          </div>
        </Section>

        <Section id="organismes" eyebrow="Organismes" title="Construit et hébergé par votre organisme" sub="Chaque fonction a ses questions. Voici les réponses.">
          <Tabs label="Fonctions de l'organisme" idPrefix="org" tabs={ORG.map(o => [o.tab, <OrgPanel key={o.tab} o={o} />])} />
        </Section>

        <FinalBand title="Une question sur La Répét' ?" text="Les questions fréquentes répondent aux personnes accompagnées, aux coachs et aux organismes.">
          <Btn kind="white" size="lg" onClick={() => go("#/a-propos/faq")} iconRight={I.arrow}>Lire les questions fréquentes</Btn>
        </FinalBand>
      </div>
    </main>
  );
}

const HeroAside = () => (
  <div className="rp-hide-m" style={{ position: "relative" }}>
    <div style={{ borderRadius: RAD.xl, overflow: "hidden", boxShadow: SH.glow, aspectRatio: "3 / 2", background: T.primaryBg }}>
      <img src={img("solutions-equipe.webp")} alt="Une coach et une personne accompagnée échangent autour d'une table ronde." width={1200} height={800} loading="lazy" decoding="async" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
    <div style={{ position: "absolute", left: -24, bottom: -24, background: T.surface, borderRadius: RAD.md, padding: "12px 16px", boxShadow: SH.glow, display: "flex", alignItems: "center", gap: 12 }}>
      <IconTile icon={I.shield} />
      <div style={{ ...TY.label, color: T.navy }}>Conçu pour l'AI Act et le RGPD</div>
    </div>
  </div>
);

function AudienceSection({ id, tag, title, sub, features, cta }) {
  return (
    <Section id={id} eyebrow={tag} title={title} sub={sub}>
      <div className="rs-g3">
        {features.map(([ic, t, d], i) => (
          <Reveal key={t} delay={(i % 3) * 70} style={{ height: "100%" }}>
            <Card style={{ height: "100%", display: "grid", gap: 12, alignContent: "start" }}>
              <IconTile icon={ic} />
              <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>{t}</h3>
              <p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p>
            </Card>
          </Reveal>
        ))}
      </div>
      <div style={{ marginTop: 24 }}>{cta}</div>
    </Section>
  );
}

const BENEF = [
  [I.lock, "Accès par code, sans compte", "Un code de 6 caractères remis par le coach. Ni adresse électronique, ni mot de passe."],
  [I.mic, "Échauffement sans analyse", "Des phrases à dire à voix haute, avec une consigne, pour se lancer. Rien n'est enregistré."],
  [I.target, "Questions adaptées au métier", "Une banque de questions selon le poste visé, et la possibilité d'ajouter les siennes."],
  [I.video, "Caméra ou voix seule", "Trois minutes maximum par réponse, relecture avant validation, autant d'essais que souhaité."],
  [I.sparkle, "Un retour qui décrit", "Rythme de parole, pauses, exemples, petits mots répétés, regard. Ce qui fonctionne déjà est présenté en premier."],
  [I.layers, "Un retour à lire ou à regarder", "Lire le retour, ou se revoir avec les repères placés au bon moment de la vidéo."],
  [I.chat, "Un assistant de préparation d'entretien", "Des réponses aux questions sur l'entretien, sans remplacer le coach. Un entraînement complet simule un entretien dans l'ordre réel."],
  [I.send, "Envoi volontaire", "Chaque réponse reste sur l'appareil tant que la personne ne l'envoie pas."],
  [I.trash, "Tout supprimer à tout moment", "La personne peut supprimer une réponse. Elle peut aussi retirer son accord : toutes ses réponses sont alors effacées."],
];

const COACH = [
  [I.plus, "Un parcours vite créé", "Prénom et initiale, métier visé : le code et le lien sont prêts à transmettre."],
  [I.list, "Réponses à relire", "Une liste claire des réponses reçues, avec le message de la personne."],
  [I.note, "Remarques placées dans la vidéo", "Mettez en pause, écrivez : votre remarque se place à ce moment de la vidéo."],
  [I.chat, "Nuancer l'assistant", "Confirmez, nuancez ou contredisez chaque repère. Votre lecture prime."],
  [I.send, "Rien ne part sans vous", "Votre brouillon s'enregistre tout seul. Vous envoyez le rapport quand il est prêt. Vous pouvez le corriger et le renvoyer."],
  [I.print, "Support de débriefing", "Rapport imprimable ou exportable en PDF pour l'atelier ou le rendez-vous."],
];

const OBSERVE = [
  ["Rythme de parole", "« Environ 140 mots par minute sur l'ensemble de la réponse. »"],
  ["Pauses", "« 3 pauses de plus de 2 secondes, la plus longue à 0:42. »"],
  ["Exemples concrets", "« Vous citez une expérience précise : deux ans à l'accueil d'une mairie. »"],
  ["Petits mots répétés", "« \"Euh\" revient 4 fois, surtout en début de phrase. »"],
  ["Structure", "« 5 phrases, avec une phrase de conclusion. »"],
  ["Vocabulaire", "« Le mot vraiment revient 4 fois. »"],
  ["Direction du regard", "« Vers l'écran environ 60 % du temps, vers le bas 30 %. »"],
  ["Durée", "« 1 minute 32 pour une question prévue en deux minutes. »"],
];

const ORG = [
  {
    tab: "Direction", icon: I.compass, title: "Un complément à l'accompagnement, pas un substitut",
    points: [
      ["Plus de pratique entre deux rendez-vous", "Les personnes s'entraînent chez elles, à leur rythme, et arrivent en atelier avec des moments concrets à discuter."],
      ["Un pilotage sans surveillance", "Des chiffres d'ensemble uniquement : réponses à relire, parcours, rapports envoyés, délai moyen de relecture. Aucune mesure individuelle."],
      ["Indépendance vis-à-vis d'un éditeur", "L'outil est construit et opéré par l'organisme, avec des briques standards maîtrisables par une équipe interne."],
      ["Un projet cadré", "Cadre AI Act et analyse d'impact, cadre psychosociologique, cahier des charges fonctionnel : la conception a précédé le code."],
    ],
  },
  {
    tab: "DSI", icon: I.server, title: "Une application web standard, à brancher sur votre infrastructure",
    points: [
      ["Architecture", "Application web React construite avec Vite, servie comme un site statique. Les entraînements sont gardés dans le navigateur de la personne (localStorage, IndexedDB)."],
      ["Raccordement à vos serveurs", "Votre stockage se branche derrière les fonctions de stockage existantes, avec chiffrement au repos et en transit. La vidéo n'est téléversée qu'au moment de l'envoi au coach."],
      ["Modèles auto-hébergés", "Transcription Whisper et suivi du regard MediaPipe exécutés dans le navigateur, à partir de fichiers que vous pouvez héberger chez vous."],
      ["Options par configuration", "Transcription serveur ou reformulation par un modèle de langage de votre choix, qui ne reçoit que du texte, filtré par un garde-fou de conformité."],
    ],
  },
  {
    tab: "Juridique et DPO", icon: I.scale, title: "Conçu pour l'AI Act et le RGPD",
    points: [
      ["Aucune inférence d'émotion", "L'article 5 du règlement (UE) 2024/1689 interdit la reconnaissance des émotions sur le lieu de travail et dans les établissements d'enseignement. L'outil ne lit jamais les expressions du visage."],
      ["Transparence et supervision humaine", "La personne sait qu'un assistant produit le retour. Le coach peut le contredire, et rien ne parvient à la personne sans envoi explicite."],
      ["Minimisation et consentement", "Prénom et initiale, métier visé. Consentement donné option par option, daté et retirable. Le retrait supprime les réponses."],
      ["Ce qui reste à faire", "Qualification du système selon votre usage, analyse d'impact (AIPD) obligatoire avant tout déploiement, durées de conservation, validation des textes de « Vos données » fournis comme documents de travail."],
    ],
  },
];

const OrgPanel = ({ o }) => (
  <div className="rs-split" style={{ alignItems: "start", gridTemplateColumns: "minmax(0,2fr) minmax(0,3fr)" }}>
    <div style={{ display: "grid", gap: 16 }}>
      <IconTile icon={o.icon} s={48} />
      <h3 className="ty-h1" style={{ ...TY.h1, color: T.navy, margin: 0 }}>{o.title}</h3>
    </div>
    <div className="rs-g2" style={{ gap: 16 }}>
      {o.points.map(([t, d]) => (
        <div key={t} style={{ borderTop: `2px solid ${T.primary}`, paddingTop: 16, display: "grid", gap: 8 }}>
          <h4 style={{ ...TY.h3, color: T.navy, margin: 0 }}>{t}</h4>
          <p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p>
        </div>
      ))}
    </div>
  </div>
);

function Flow() {
  const steps = [
    { n: 1, who: "Coach", t: "crée un parcours", d: "et transmet un code" },
    { n: 2, who: "Personne accompagnée", t: "ouvre son espace", d: "et donne son accord" },
    { n: 3, who: "Personne accompagnée", t: "s'entraîne seule", d: "l'assistant décrit sa réponse" },
    { n: 4, who: "Personne accompagnée", t: "envoie une réponse", d: "quand elle le décide" },
    { n: 5, who: "Coach", t: "relit", d: "ajoute ses remarques" },
    { n: 6, who: "Ensemble", t: "débriefent", d: "en atelier ou en rendez-vous" },
    { n: 7, who: "Personne accompagnée", t: "recommence", d: "même après le rapport" },
  ];
  return (
    <ol className="rp-flow" style={{ listStyle: "none", margin: 0, padding: "0 0 8px", display: "flex", overflowX: "auto", gap: 0 }}>
      {steps.map((s, i) => (
        <li key={i} className="rp-flow-step" style={{ flex: "1 0 148px", minWidth: 148, display: "flex", gap: 8 }}>
          <div style={{ display: "grid", gap: 8, alignContent: "start" }}>
            <span style={{ width: 28, height: 28, borderRadius: "50%", background: s.who === "Coach" ? T.primary : s.who === "Ensemble" ? T.navy : T.blueDk, color: T.surface, display: "grid", placeItems: "center", ...TY.time }}>{s.n}</span>
            <span style={{ ...TY.overline, color: T.muted }}>{s.who}</span>
            <span style={{ ...TY.h3, color: T.navy }}>{s.t}</span>
            <span style={{ ...TY.small, color: T.body }}>{s.d}</span>
          </div>
          {i < steps.length - 1 && <span className="rp-hide-m" style={{ marginTop: 4, padding: "0 8px" }}><Icon d={I.arrow} s={16} c={T.faint} /></span>}
        </li>
      ))}
    </ol>
  );
}
