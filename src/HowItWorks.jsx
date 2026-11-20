import React from "react";
import { T, FD, FB, FM, RAD, sp, Btn, Card, Icon, I, GradHead } from "./ui.jsx";
import { Reveal } from "./motion.jsx";
import { Section, FinalBand } from "./Home.jsx";

/* Page « Fonctionnement » : déroulé, ce que l'assistant observe, parti pris, garanties techniques. */

export default function HowItWorks({ go, openSpace }) {
  return (
    <main className="rp-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 24px 0" }}>
      <Reveal>
        <div style={{ borderRadius: RAD.lg, overflow: "hidden" }}>
          <GradHead soft tag="Fonctionnement" title="Du premier entraînement au débriefing" sub="Qui fait quoi, ce que l'assistant observe, et où vont les données." />
        </div>
      </Reveal>

      <Section eyebrow="Le déroulé" title="Un seul lien pour tout le parcours">
        <Reveal><Flow /></Reveal>
      </Section>

      <Section eyebrow="L'assistant" title="Ce que l'assistant observe" sub="Des faits situés dans l'entretien, présentés comme des repères et jamais comme une note.">
        <div className="rp-stack" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: sp(4) }}>
          {OBSERVE.map(([t, ex], i) => (
            <Reveal key={t} delay={(i % 4) * 70} style={{ height: "100%" }}>
              <Card style={{ height: "100%" }}>
                <h3 style={{ font: `700 16px ${FD}`, margin: "0 0 8px", color: T.navy }}>{t}</h3>
                <p style={{ font: `400 13.5px/1.55 ${FB}`, color: T.body, margin: 0 }}>{ex}</p>
              </Card>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div style={{ marginTop: sp(5), display: "flex", gap: 12, alignItems: "flex-start", background: `${T.violet}0D`, borderLeft: `3px solid ${T.violet}`, borderRadius: RAD.sm, padding: "14px 18px", font: `500 14px/1.6 ${FB}`, color: T.navy }}>
            <Icon d={I.ban} s={18} c={T.violet} />
            <span>Ce que l'assistant n'observe pas : les émotions, la personnalité, l'apparence.</span>
          </div>
        </Reveal>
      </Section>

      <Section eyebrow="Le parti pris" title="Un coach qui rend autonome, pas conforme">
        <div className="rp-stack" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: sp(5) }}>
          {PRINC.map(([n, t, d], i) => <Reveal key={n} delay={(i % 2) * 90} style={{ height: "100%" }}><Princ n={n} t={t} d={d} /></Reveal>)}
        </div>
      </Section>

      <Section eyebrow="Données et hébergement" title="Hébergé par votre organisme, sans prestataire">
        <div className="rp-stack" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: sp(5) }}>
          <Reveal style={{ height: "100%" }}><Proof icon={I.lock} t="Analyse locale, transmission maîtrisée" b="L'analyse de la posture tourne dans le navigateur (MediaPipe). La vidéo n'est transmise et stockée que si le bénéficiaire choisit de la partager à son coach, jamais à son insu." /></Reveal>
          <Reveal delay={90} style={{ height: "100%" }}><Proof icon={I.shield} t="Texte traité dans le navigateur" b="La transcription (Whisper) et l'analyse descriptive tournent dans le navigateur. Une reformulation par un modèle hébergé en France (par exemple Mistral) peut être activée ; elle ne reçoit que du texte." /></Reveal>
          <Reveal delay={180} style={{ height: "100%" }}><Proof icon={I.sparkle} t="Conçu pour être hébergé en interne" b="Application développée et opérée par l'organisme d'accompagnement lui-même. Briques standards, maîtrisables par une équipe interne." /></Reveal>
        </div>
      </Section>

      <FinalBand title="Prêt à vous lancer ?" text="Ouvrez votre espace avec le code transmis par votre coach.">
        <Btn kind="white" size="lg" onClick={openSpace}>Ouvrir mon espace&nbsp;<Icon d={I.arrow} s={18} c={T.primary} /></Btn>
        <Btn kind="ghostDark" size="lg" onClick={() => go("#/coach")}>Espace coach</Btn>
      </FinalBand>
    </main>
  );
}

const OBSERVE = [
  ["Débit", "Environ 140 mots par minute sur l'ensemble de l'entretien."],
  ["Pauses", "3 pauses de plus de 2 secondes, la plus longue à 0:42."],
  ["Exemples concrets", "Vous citez une expérience précise : « deux ans à l'accueil d'une mairie »."],
  ["Mots d'appui", "« euh » revient 4 fois, surtout en début de phrase."],
  ["Structure", "5 phrases, avec une phrase de conclusion."],
  ["Vocabulaire", "Le mot « vraiment » revient 4 fois."],
  ["Direction du regard", "Regard vers l'écran environ 60 % du temps, vers le bas 30 %."],
];

const PRINC = [
  ["01", "Décrire, jamais noter", "« Vous regardez vers le bas 40 % du temps » plutôt que « contact visuel insuffisant ». La personne observe, et décide elle-même quoi en faire."],
  ["02", "Des conventions, pas des vérités", "Chaque repère est une convention de secteur, variable selon le poste et la culture, jamais une qualité personnelle universelle."],
  ["03", "L'humain garde la main", "Le coach relit les entretiens que la personne choisit de lui envoyer : il contextualise, nuance et annote avant de renvoyer le rapport."],
  ["04", "On commence en douceur", "Un échauffement sans analyse ni conservation. Puis, au moment du retour, la personne choisit : un rapport écrit, ou se revoir en vidéo."],
];

const Proof = ({ icon, t, b }) => (
  <Card hover topbar style={{ height: "100%" }}>
    <div style={{ position: "relative", width: 48, height: 48, borderRadius: RAD.md, background: `${T.primary}10`, display: "grid", placeItems: "center", marginBottom: sp(4) }}>
      <Icon d={icon} s={22} c={T.primary} />
      <span style={{ position: "absolute", top: -3, right: -3, width: 12, height: 12, borderRadius: "50%", background: T.accent, border: "2px solid #fff" }} />
    </div>
    <h3 style={{ font: `700 17px/1.3 ${FD}`, margin: "0 0 8px", color: T.navy }}>{t}</h3>
    <p style={{ font: `400 14px/1.6 ${FB}`, color: T.body, margin: 0 }}>{b}</p>
  </Card>
);
const Princ = ({ n, t, d }) => (
  <Card hover style={{ display: "flex", gap: sp(4), height: "100%" }}>
    <div style={{ font: `800 24px ${FM}`, color: T.accent, flexShrink: 0, lineHeight: 1.1 }}>{n}</div>
    <div>
      <h3 style={{ font: `700 18px ${FD}`, margin: "0 0 6px", color: T.navy }}>{t}</h3>
      <p style={{ font: `400 14px/1.6 ${FB}`, color: T.body, margin: 0 }}>{d}</p>
    </div>
  </Card>
);

function Flow() {
  const steps = [
    { n: 1, who: "Coach", t: "crée un parcours", d: "et génère un lien", c: T.primary },
    { n: 2, who: "Bénéficiaire", t: "ouvre le lien", d: "saisit son code", c: T.blue },
    { n: 3, who: "Bénéficiaire", t: "s'entraîne seul", d: "l'assistant décrit l'entretien", c: T.violet },
    { n: 4, who: "Bénéficiaire", t: "partage son entretien", d: "quand il le décide", c: T.accent },
    { n: 5, who: "Coach", t: "annote", d: "contextualise, nuance", c: T.primary },
    { n: 6, who: "Ensemble", t: "débriefing en atelier", d: "en présentiel", c: T.blue },
    { n: 7, who: "Bénéficiaire", t: "peut recommencer", d: "même après l'atelier", c: T.accent },
  ];
  return (
    <div className="rp-flow" style={{ display: "flex", overflowX: "auto", paddingBottom: sp(2), gap: 0 }}>
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className="rp-flow-step" style={{ flex: "1 0 146px", minWidth: 146 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: sp(2) }}>
              <span style={{ width: 28, height: 28, borderRadius: "50%", background: s.c, color: "#fff", display: "grid", placeItems: "center", font: `700 12px ${FM}`, flexShrink: 0 }}>{s.n}</span>
              <span style={{ font: `700 10.5px ${FB}`, textTransform: "uppercase", letterSpacing: ".05em", color: s.c }}>{s.who}</span>
            </div>
            <div style={{ font: `700 15px ${FD}`, marginBottom: 2, color: T.navy }}>{s.t}</div>
            <div style={{ font: `400 13px ${FB}`, color: T.body }}>{s.d}</div>
          </div>
          {i < steps.length - 1 && <div className="rp-hide-m" style={{ flexShrink: 0, alignSelf: "flex-start", marginTop: 4, color: T.faint, padding: "0 6px" }}><Icon d={I.arrow} s={16} c={T.faint} /></div>}
        </React.Fragment>
      ))}
    </div>
  );
}

