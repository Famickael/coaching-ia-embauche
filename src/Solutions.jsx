import React from "react";
import { T, RAD, SH, Btn, Card, Tag, Icon, I, TY, W, SI, img, Eyebrow, Section, PageHero, IconTile, Tabs } from "./ui.jsx";
import { Reveal, useSectionScroll } from "./motion.jsx";
import { FinalBand } from "./Home.jsx";

/* Page « Solutions » (ancienne page Fonctionnement) : le déroulé, puis ce que l'outil apporte à chaque public :
   personnes accompagnées, coachs, organismes (direction, DSI, juridique et DPO). Ancres : #/solutions/<id>. */

const AUDIENCES = [
  ["beneficiaires", "Personnes accompagnées", I.user],
  ["coachs", "Coachs", SI.users],
  ["organismes", "Organismes", SI.building],
];

export default function Solutions({ go, openSpace, section }) {
  useSectionScroll(section);
  return (
    <main>
      <PageHero eyebrow="Solutions" title="Du premier entraînement au débriefing, pour chaque acteur"
        lead="La Répét' relie trois publics autour d'un même parcours : la personne qui s'entraîne, le coach qui l'accompagne et l'organisme qui déploie l'outil."
        aside={<HeroAside />}>
        <nav aria-label="Publics" className="rs-chips" style={{ marginTop: 8 }}>
          {AUDIENCES.map(([id, l, ic]) => <a key={id} href={`#/solutions/${id}`} className="rs-chip" style={{ textDecoration: "none" }}><Icon d={ic} s={16} /> {l}</a>)}
        </nav>
      </PageHero>

      <div className="rs-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: "0 24px" }}>
        <Section first eyebrow="Le déroulé" title="Un seul lien pour tout le parcours" sub="Chacun sait ce qu'il a à faire, et rien ne passe d'une étape à l'autre sans une décision humaine.">
          <Reveal><Flow /></Reveal>
        </Section>

        <AudienceSection id="beneficiaires" tag="Personnes accompagnées" title="S'entraîner seul, sans être jugé"
          sub="Un espace personnel, ouvert avec un code, pour répéter autant que nécessaire avant le jour J."
          features={BENEF} cta={<Btn kind="objective" onClick={() => go("#/espace")} iconRight={I.arrow}>Lancer ma première répétition</Btn>} />

        <AudienceSection id="coachs" tag="Coachs" title="Garder la main, gagner du temps de relecture"
          sub="Vous voyez seulement ce que la personne choisit de vous envoyer, et vous décidez de ce qui lui revient."
          features={COACH} cta={<Btn kind="secondary" onClick={() => go("#/coach")}>Accéder à l'espace coach</Btn>} />

        <Section id="assistant" eyebrow="L'assistant" title="Ce qu'il observe, et ce qu'il n'observe pas" sub="Des faits situés dans la réponse, présentés comme des repères et jamais comme une note.">
          <div className="rs-split" style={{ alignItems: "start" }}>
            <div className="rs-g2" style={{ gap: 12 }}>
              {OBSERVE.map(([t, ex], i) => (
                <Reveal key={t} delay={(i % 2) * 70} style={{ height: "100%" }}>
                  <Card pad={16} style={{ height: "100%", borderRadius: RAD.md, display: "grid", gap: 4, alignContent: "start" }}>
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
                <p style={{ ...TY.small, color: T.body, margin: 0 }}>Le suivi du regard lit seulement la position de la tête et la direction des yeux, jamais les expressions du visage. Tout retour contenant une note ou un vocabulaire émotionnel est écarté automatiquement.</p>
              </div>
            </Reveal>
          </div>
        </Section>

        <Section id="organismes" eyebrow="Organismes" title="Construit et hébergé par votre organisme" sub="Chaque fonction a ses questions. Voici les réponses, y compris sur ce qui reste à faire pour passer du prototype à la production.">
          <Tabs label="Fonctions de l'organisme" idPrefix="org" tabs={ORG.map(o => [o.tab, <OrgPanel key={o.tab} o={o} />])} />
        </Section>

        <Section id="garanties" eyebrow="Garanties" title="Les engagements tenus par le dispositif">
          <div className="rs-g4">
            {GARANTIES.map(([ic, t, d], i) => (
              <Reveal key={t} delay={(i % 4) * 70} style={{ height: "100%" }}>
                <Card topbar style={{ height: "100%", display: "grid", gap: 12, alignContent: "start" }}>
                  <IconTile icon={ic} />
                  <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>{t}</h3>
                  <p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Section>

        <FinalBand title="Voir La Répét' avec votre équipe" text="Une démonstration adaptée à vos publics, vos ateliers et votre hébergement.">
          <Btn kind="white" size="lg" onClick={() => go("#/demo")} iconRight={I.arrow}>Demander une démo</Btn>
          <Btn kind="ghostDark" size="lg" onClick={openSpace}>Ouvrir mon espace</Btn>
        </FinalBand>
      </div>
    </main>
  );
}

const HeroAside = () => (
  <div className="rp-hide-m" style={{ position: "relative" }}>
    <div style={{ borderRadius: RAD.xl, overflow: "hidden", boxShadow: SH.lg, aspectRatio: "3 / 2", background: T.primaryBg }}>
      <img src={img("solutions-equipe.webp")} alt="Une coach et une personne accompagnée échangent autour d'une table ronde." width={1200} height={800} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
    <div style={{ position: "absolute", left: -24, bottom: -24, background: T.surface, borderRadius: RAD.md, padding: "12px 16px", boxShadow: SH.lg, display: "flex", alignItems: "center", gap: 12 }}>
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
  [I.mic, "Échauffement sans analyse", "Des phrases à lire et des relances pour se mettre en route. Rien n'est enregistré ni analysé."],
  [SI.target, "Questions adaptées au métier", "Une banque de questions selon le poste visé, et la possibilité d'ajouter les siennes."],
  [I.video, "Caméra ou voix seule", "Trois minutes maximum par réponse, relecture avant validation, autant d'essais que souhaité."],
  [I.sparkle, "Un retour qui décrit", "Débit, pauses, exemples concrets, mots d'appui, structure, regard. Points d'appui d'abord."],
  [SI.layers, "Rapport écrit ou vidéo", "Lire un rapport, ou se revoir avec des repères cliquables sur la barre de lecture."],
  [I.chat, "Un assistant de préparation", "Des réponses aux questions sur l'outil et sur l'entretien, sans remplacer le coach."],
  [I.send, "Envoi volontaire", "Chaque prise reste sur l'appareil tant que la personne ne décide pas de l'envoyer."],
  [I.trash, "Tout supprimer à tout moment", "Une prise, un parcours, ou le retrait du consentement, qui efface les prises."],
];

const COACH = [
  [I.plus, "Parcours en quelques secondes", "Prénom et initiale, poste visé : le code et le lien sont prêts à transmettre."],
  [SI.list, "Prises à relire", "Une liste claire des prises envoyées, avec le mot de la personne."],
  [I.note, "Notes horodatées", "Mettez en pause, écrivez : la note se place au moment précis de la vidéo."],
  [I.chat, "Nuancer l'assistant", "Confirmez, nuancez ou contredisez chaque observation. Votre commentaire prime."],
  [I.send, "Rapport sous contrôle", "Rien ne part sans votre envoi. Brouillon automatique, rapport renvoyable après modification."],
  [I.print, "Support de débriefing", "Rapport imprimable ou exportable en PDF pour l'atelier ou le rendez-vous."],
];

const OBSERVE = [
  ["Débit", "« Environ 140 mots par minute sur l'ensemble de la réponse. »"],
  ["Pauses", "« 3 pauses de plus de 2 secondes, la plus longue à 0:42. »"],
  ["Exemples concrets", "« Vous citez une expérience précise : deux ans à l'accueil d'une mairie. »"],
  ["Mots d'appui", "« euh » revient 4 fois, surtout en début de phrase."],
  ["Structure", "« 5 phrases, avec une phrase de conclusion. »"],
  ["Vocabulaire", "« Le mot vraiment revient 4 fois. »"],
  ["Direction du regard", "« Vers l'écran environ 60 % du temps, vers le bas 30 %. »"],
  ["Durée", "« 1 minute 32 pour une question prévue en deux minutes. »"],
];

const ORG = [
  {
    tab: "Direction", icon: SI.compass, title: "Un complément à l'accompagnement, pas un substitut",
    points: [
      ["Plus de pratique entre deux rendez-vous", "Les personnes s'entraînent chez elles, à leur rythme, et arrivent en atelier avec des moments concrets à discuter."],
      ["Un pilotage sans surveillance", "Des indicateurs agrégés uniquement : prises à relire, parcours, rapports, réentraînement, délai moyen de relecture. Aucune mesure individuelle."],
      ["Indépendance vis-à-vis d'un éditeur", "L'outil est construit et opéré par l'organisme, avec des briques standards maîtrisables par une équipe interne."],
      ["Un projet cadré", "Cadre AI Act et analyse d'impact, cadre psychosociologique, cahier des charges fonctionnel : la conception a précédé le code."],
    ],
  },
  {
    tab: "DSI", icon: SI.server, title: "Une application web standard, à brancher sur votre infrastructure",
    points: [
      ["Aujourd'hui", "Application React construite avec Vite, servie en site statique. Données dans le navigateur (localStorage, IndexedDB) : le coach et la personne doivent utiliser le même appareil."],
      ["Pour la production", "Un backend branché derrière les fonctions de stockage existantes, hébergé en France, chiffrement au repos et en transit, téléversement de la vidéo seulement à l'envoi."],
      ["Modèles auto-hébergés", "Transcription Whisper et suivi du regard MediaPipe exécutés dans le navigateur ; fichiers à héberger chez vous en production."],
      ["Options par configuration", "Transcription serveur ou reformulation par un modèle de langage hébergé en France, qui ne reçoit que du texte, filtré par un garde-fou de conformité."],
    ],
  },
  {
    tab: "Juridique et DPO", icon: SI.scale, title: "Conçu pour l'AI Act et le RGPD",
    points: [
      ["Aucune inférence d'émotion", "L'article 5 du règlement (UE) 2024/1689 interdit la reconnaissance des émotions au travail et dans l'éducation. L'outil ne lit jamais les expressions du visage."],
      ["Transparence et supervision humaine", "La personne sait qu'un assistant produit le retour. Le coach peut le contredire, et rien ne parvient à la personne sans envoi explicite."],
      ["Minimisation et consentement", "Prénom et initiale, poste visé. Consentement granulaire, tracé et retirable ; le retrait supprime les prises."],
      ["Ce qui reste à faire", "Qualification du système selon votre usage, analyse d'impact (AIPD), durées de conservation, validation des textes d'information fournis comme documents de travail."],
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

const GARANTIES = [
  [I.lock, "La vidéo reste sur l'appareil", "Elle n'est transmise que si la personne décide de l'envoyer, prise par prise."],
  [I.ban, "Ni note ni classement", "Des repères descriptifs, présentés comme des conventions de secteur."],
  [I.shield, "Aucune émotion déduite", "Ni humeur, ni personnalité. Un filtre écarte tout retour non conforme."],
  [I.user, "L'humain décide", "Le coach relit, nuance, et choisit ce qu'il renvoie."],
];

function Flow() {
  const steps = [
    { n: 1, who: "Coach", t: "crée un parcours", d: "et transmet un code" },
    { n: 2, who: "Personne accompagnée", t: "ouvre son espace", d: "et donne son accord" },
    { n: 3, who: "Personne accompagnée", t: "s'entraîne seule", d: "l'assistant décrit" },
    { n: 4, who: "Personne accompagnée", t: "partage une prise", d: "quand elle le décide" },
    { n: 5, who: "Coach", t: "annote", d: "contextualise, nuance" },
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
