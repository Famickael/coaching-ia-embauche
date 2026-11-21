import React from "react";
import { T, RAD, SH, Btn, Card, Tag, Icon, I, TY, W, img, Eyebrow, Section, PageHero, IconTile, Tabs } from "./ui.jsx";
import { Reveal, useSectionScroll } from "./motion.jsx";
import { FinalBand } from "./home/FinalBand.jsx";

/* Page « Solutions » (ancienne page Fonctionnement) : le déroulé, puis ce que l'accompagnement apporte à chaque public :
   demandeurs d'emploi, collaborateurs en mobilité, coachs (les accompagnateurs de l'organisme) et commanditaires
   (acteurs publics, entreprises). La Répét' est l'outil de l'organisme, pas un logiciel vendu seul.
   Ancres : #/solutions/<id> (anciennes ancres beneficiaires et organismes redirigées dans router.js). */

const AUDIENCES = [
  ["demandeurs-emploi", "Demandeurs d'emploi", I.user],
  ["collaborateurs", "Collaborateurs en mobilité", I.compass],
  ["coachs", "Coachs", I.users],
  ["commanditaires", "Commanditaires", I.building],
];

export default function Solutions({ go, openSpace, section }) {
  useSectionScroll(section);
  return (
    <main>
      <PageHero eyebrow="Solutions" title="Un accompagnement outillé, pour chaque public"
        lead="Nos coachs accompagnent des demandeurs d'emploi et des collaborateurs d'entreprise. Entre deux rendez-vous, chacun s'entraîne avec La Répét', notre outil. Acteurs publics et entreprises nous confient cet accompagnement."
        aside={<HeroAside />}>
        <nav aria-label="Publics" className="rs-chips" style={{ marginTop: 8 }}>
          {AUDIENCES.map(([id, l, ic]) => <a key={id} href={`#/solutions/${id}`} className="rs-chip" style={{ textDecoration: "none" }}><Icon d={ic} s={16} /> {l}</a>)}
        </nav>
      </PageHero>

      <div className="rs-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: "0 24px" }}>
        <Section first eyebrow="Le déroulé" title="Sept étapes, chacune décidée par une personne" sub="Rien ne passe d'une étape à la suivante sans que quelqu'un le décide.">
          <Reveal><Flow /></Reveal>
        </Section>

        <AudienceSection id="demandeurs-emploi" tag="Demandeurs d'emploi" title="Préparer ses entretiens d'embauche, sans être jugé"
          sub="Dans le cadre d'un accompagnement vers l'emploi, un espace personnel ouvert avec un code, pour répéter autant que nécessaire avant le jour J."
          features={BENEF} cta={<Btn kind="objective" onClick={() => go("#/espace")} iconRight={I.arrow}>Lancer ma première répétition</Btn>} />

        <AudienceSection id="collaborateurs" tag="Collaborateurs en mobilité" title="Préparer un entretien de mobilité ou d'évolution"
          sub="Votre entreprise vous propose un accompagnement. Vous vous entraînez avec votre coach, en toute confidentialité vis-à-vis de votre employeur."
          features={COLLAB} cta={<Btn kind="secondary" onClick={() => go("#/espace")} iconRight={I.arrow}>Ouvrir mon espace</Btn>} />

        <AudienceSection id="coachs" tag="Coachs" title="Nos coachs relisent, nuancent et préparent le débriefing"
          sub="Les coachs de notre organisme mènent l'accompagnement. Ils voient seulement ce que la personne choisit de leur envoyer, et décident de ce qui lui revient."
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

        <Section id="commanditaires" eyebrow="Commanditaires" title="Nous confier un accompagnement" sub="Acteurs publics de l'emploi ou entreprises : vous nous confiez des personnes à accompagner. Nos coachs mènent l'accompagnement, La Répét' l'outille.">
          <Tabs label="Commanditaires" idPrefix="org" tabs={ORG.map(o => [o.tab, <OrgPanel key={o.tab} o={o} />])} />
          <div className="rp-wide-m" style={{ marginTop: 32 }}><Btn kind="objective" onClick={() => go("#/demo")} iconRight={I.arrow}>Parler de votre projet</Btn></div>
        </Section>

        <FinalBand title="Une question sur notre accompagnement ?" text="Les questions fréquentes répondent aux personnes accompagnées, aux coachs et aux commanditaires.">
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

const COLLAB = [
  [I.compass, "Mobilité interne ou externe", "Préparer un entretien pour un autre poste dans l'entreprise, ou pour un projet ailleurs."],
  [I.chat, "Entretien professionnel ou annuel", "S'entraîner à parler de son parcours, de ses compétences et de ses souhaits d'évolution, côté salarié."],
  [I.redo, "Reconversion", "Mettre des mots sur un nouveau projet et expliquer ce que l'on apporte d'un métier à l'autre."],
  [I.target, "Des questions adaptées", "Une banque de questions propre aux entretiens de mobilité et d'évolution, et la possibilité d'ajouter les siennes."],
  [I.sparkle, "Le même retour qui décrit", "Rythme de parole, pauses, exemples, regard. Jamais de note, jamais d'émotion devinée."],
  [I.lock, "Confidentiel vis-à-vis de l'employeur", "Votre employeur ne voit pas vos réponses. Seul votre coach voit ce que vous choisissez de lui envoyer."],
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
    tab: "Acteurs publics", icon: I.compass, title: "Accompagner le retour à l'emploi et l'insertion",
    points: [
      ["Pour qui", "Services publics de l'emploi, collectivités, départements, structures d'insertion : vous accompagnez des demandeurs d'emploi et vous cherchez un appui pour la préparation aux entretiens."],
      ["Ce que nous faisons", "Nos coachs mènent les rendez-vous et les ateliers. Entre deux séances, les personnes s'entraînent avec La Répét' et arrivent avec des moments concrets à discuter."],
      ["Un suivi sans surveillance", "Nous rendons compte de l'accompagnement avec des éléments d'ensemble : réponses relues, rapports envoyés, délai de relecture. Jamais une mesure individuelle."],
      ["Un cadre clair", "Aucune note, aucune émotion devinée, une vidéo qui reste sur l'appareil tant que la personne ne l'envoie pas. Le cadre est détaillé dans l'onglet « Cadre et données »."],
    ],
  },
  {
    tab: "Entreprises", icon: I.building, title: "Accompagner la mobilité de vos collaborateurs",
    points: [
      ["Pour qui", "Les entreprises qui font accompagner leurs collaborateurs : mobilité interne ou externe, préparation d'un entretien de mobilité, entretien annuel ou professionnel, reconversion."],
      ["Ce que nous faisons", "Nos coachs accompagnent chaque collaborateur, en rendez-vous individuels ou en ateliers. La Répét' lui permet de s'entraîner seul, à son rythme, entre deux rendez-vous."],
      ["La confidentialité", "Les réponses restent entre le collaborateur et son coach. L'entreprise ne voit ni les vidéos, ni les retours, ni les rapports."],
      ["Ce que vous recevez", "Un bilan d'ensemble de l'accompagnement, défini avec vous avant le démarrage, sans information sur une personne en particulier."],
    ],
  },
  {
    tab: "Cadre et données", icon: I.scale, title: "Conçu pour l'AI Act et le RGPD",
    points: [
      ["Aucune inférence d'émotion", "L'article 5 du règlement (UE) 2024/1689 interdit la reconnaissance des émotions sur le lieu de travail et dans les établissements d'enseignement. L'outil ne lit jamais les expressions du visage."],
      ["Transparence et supervision humaine", "La personne sait qu'un assistant IA produit le retour. Le coach peut le contredire, et rien ne parvient à la personne sans envoi explicite."],
      ["Minimisation et consentement", "Prénom et initiale, métier visé. Consentement donné option par option, daté et retirable. Le retrait supprime les réponses."],
      ["Avant tout démarrage", "Notre organisme, responsable du traitement, mène l'analyse d'impact (AIPD) et la qualification au regard de l'AI Act, et fixe les durées de conservation avec son délégué à la protection des données."],
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
