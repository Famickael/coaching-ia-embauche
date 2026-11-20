import React from "react";
import { T, RAD, SH, Btn, Card, Icon, I, TY, W, SI, img, Eyebrow, Section, PageHero, IconTile, Accordion } from "./ui.jsx";
import { Reveal, useSectionScroll } from "./motion.jsx";
import { FinalBand } from "./Home.jsx";

/* Page « À propos » : mission, pourquoi ce projet, parti pris, cadre réglementaire, pour qui,
   comment c'est construit, FAQ (#/a-propos/faq). */

export default function About({ go, openSpace, section }) {
  useSectionScroll(section);
  return (
    <main>
      <PageHero eyebrow="À propos" title="Rendre l'entraînement à l'entretien accessible, sans jamais noter"
        lead="La Répét' est née dans un organisme d'accompagnement vers l'emploi, d'un constat simple : un entretien se prépare à voix haute, et l'on progresse quand on peut recommencer sans être jugé."
        aside={<AboutAside />} />

      <div className="rs-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: "0 24px" }}>
        <Section first eyebrow="Notre mission" title="Permettre à chacun de répéter, à son rythme, avec un coach à ses côtés">
          <div className="rs-g3">
            {MISSION.map(([ic, t, d], i) => (
              <Reveal key={t} delay={i * 80} style={{ height: "100%" }}>
                <Card style={{ height: "100%", display: "grid", gap: 12, alignContent: "start" }}>
                  <IconTile icon={ic} />
                  <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>{t}</h3>
                  <p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Section>

        <Section eyebrow="Pourquoi ce projet" title="Ce que nous avons observé sur le terrain">
          <div className="rs-split" style={{ alignItems: "start" }}>
            <div style={{ display: "grid", gap: 16, ...TY.bodyLg, color: T.body }}>
              <p style={{ margin: 0 }}>Dans les ateliers de préparation aux entretiens, le temps manque. Chacun ne peut s'exercer qu'une ou deux fois, souvent devant le groupe, ce qui intimide une partie des participants. Entre deux séances, beaucoup aimeraient s'entraîner, mais seuls face à une caméra, sans retour, l'exercice décourage vite.</p>
              <p style={{ margin: 0 }}>Les outils du marché proposent souvent des scores, des jauges ou des analyses d'émotions. Pour des personnes qui doutent déjà d'elles, une note peut décourager davantage qu'elle n'aide. Et la reconnaissance des émotions est désormais interdite par le droit européen dans les contextes de travail et d'éducation.</p>
              <p style={{ margin: 0 }}>Nous avons donc voulu un outil qui <strong style={{ color: T.navy }}>décrit sans noter</strong>, qui laisse la personne décider de ce qu'elle partage, et qui redonne au coach du temps pour ce qu'il fait de mieux : accompagner.</p>
            </div>
            <Reveal>
              <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: RAD.lg, padding: 32, display: "grid", gap: 16, boxShadow: SH.sm }}>
                <Eyebrow>Un exemple de repère</Eyebrow>
                <div style={{ display: "grid", gap: 12 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}><Icon d={I.ban} s={20} c={T.errorDk} /><span style={{ ...TY.body, color: T.body, textDecoration: "line-through" }}>« Contact visuel insuffisant : 4/10 »</span></div>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}><Icon d={I.check} s={20} c={T.successDk} /><span style={{ ...TY.bodyStrong, color: T.navy }}>« Vous regardez vers le bas environ 40 % du temps, surtout en début de réponse. »</span></div>
                </div>
                <p style={{ ...TY.small, color: T.muted, margin: 0 }}>La personne observe, puis décide elle-même quoi en faire, avec son coach.</p>
              </div>
            </Reveal>
          </div>
        </Section>

        <Section eyebrow="Le parti pris" title="Quatre principes qui guident chaque écran">
          <div className="rs-g2">
            {PRINC.map(([n, t, d], i) => (
              <Reveal key={n} delay={(i % 2) * 80} style={{ height: "100%" }}>
                <Card style={{ height: "100%", display: "flex", gap: 16 }}>
                  <div style={{ ...TY.num, fontSize: 24, color: T.primary, flexShrink: 0 }}>{n}</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    <h3 style={{ ...TY.h2, color: T.navy, margin: 0 }}>{t}</h3>
                    <p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </Section>

        <Section eyebrow="Cadre réglementaire" title="Conçu pour l'AI Act et le RGPD dès le départ">
          <div className="rs-g3">
            {LAW.map(([ic, t, d]) => (
              <Card key={t} topbar style={{ height: "100%", display: "grid", gap: 12, alignContent: "start" }}>
                <IconTile icon={ic} />
                <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>{t}</h3>
                <p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section eyebrow="Pour qui" title="Les organismes d'accompagnement vers l'emploi">
          <div className="rs-split" style={{ alignItems: "start" }}>
            <p style={{ ...TY.bodyLg, color: T.body, margin: 0 }}>La Répét' s'adresse aux structures qui préparent des personnes aux entretiens d'embauche et à la présentation de soi : structures d'insertion, missions locales, organismes de formation, services emploi des collectivités, associations. Elle s'utilise en complément d'un accompagnement humain, individuel ou collectif.</p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 12 }}>
              {[[I.user, "Les personnes accompagnées", "qui veulent s'entraîner à leur rythme, y compris celles qui redoutent l'exercice devant un groupe."],
                [SI.users, "Les coachs et conseillers", "qui veulent des supports concrets pour leurs ateliers et leurs rendez-vous."],
                [SI.building, "Les directions et équipes support", "qui veulent un outil maîtrisé, conforme et hébergé par l'organisme."]].map(([ic, t, d]) => (
                <li key={t} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <IconTile icon={ic} />
                  <span style={{ ...TY.body, color: T.body }}><strong style={{ color: T.navy }}>{t}</strong> {d}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section eyebrow="Comment c'est construit" title="De la conception au prototype">
          <ol style={{ listStyle: "none", margin: 0, padding: 0 }} className="rs-g4">
            {BUILD.map(([t, d], i) => (
              <li key={t} style={{ borderTop: `2px solid ${i < 3 ? T.primary : T.line}`, paddingTop: 16, display: "grid", gap: 8, alignContent: "start" }}>
                <span style={{ ...TY.time, color: i < 3 ? T.primary : T.muted }}>{`Étape ${i + 1}`}</span>
                <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>{t}</h3>
                <p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p>
              </li>
            ))}
          </ol>
          <p style={{ ...TY.small, color: T.muted, margin: "24px 0 0", maxWidth: W.read }}>
            Le code s'appuie sur des briques ouvertes et standards (React, Vite, Whisper, MediaPipe), pour rester maîtrisable par une équipe interne. Le détail technique est sur la page <a href="#/solutions/organismes" className="rs-link">Solutions, organismes</a>.
          </p>
        </Section>

        <Section id="faq" eyebrow="Questions fréquentes" title="FAQ" sub="Personnes accompagnées, coachs, organismes : les réponses aux questions que l'on nous pose le plus souvent.">
          <div style={{ display: "grid", gap: 48 }}>
            {FAQ.map(([group, items], g) => (
              <div key={group} style={{ display: "grid", gap: 16 }}>
                <h3 style={{ ...TY.h2, color: T.navy, margin: 0 }}>{group}</h3>
                <Accordion idPrefix={`faq${g}`} items={items} />
              </div>
            ))}
          </div>
        </Section>

        <FinalBand title="Une question qui n'est pas dans la liste ?" text="Parlons-en : une démonstration est l'occasion d'aborder vos cas concrets.">
          <Btn kind="white" size="lg" onClick={() => go("#/demo")} iconRight={I.arrow}>Demander une démo</Btn>
          <Btn kind="ghostDark" size="lg" onClick={openSpace}>Ouvrir mon espace</Btn>
        </FinalBand>
      </div>
    </main>
  );
}

const AboutAside = () => (
  <div className="rp-hide-m" style={{ borderRadius: RAD.xl, overflow: "hidden", boxShadow: SH.lg, aspectRatio: "3 / 2", background: T.primaryBg }}>
    <img src={img("a-propos.webp")} alt="Deux femmes échangent autour d'une table ronde, dans un bureau lumineux." width={1200} height={800} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
  </div>
);

const MISSION = [
  [I.redo, "S'entraîner sans limite", "Autant de répétitions que nécessaire, chez soi, au moment choisi, sans public."],
  [I.sparkle, "Comprendre sans être jugé", "Un retour qui décrit des faits situés dans la réponse, jamais une note."],
  [SI.users, "Avancer avec son coach", "Le coach relit ce qu'on lui envoie, nuance, et prépare le débriefing."],
];

const PRINC = [
  ["01", "Décrire, jamais noter", "Pas de score, pas de jauge, pas de classement. Des observations factuelles, que la personne est libre d'utiliser."],
  ["02", "Des conventions, pas des vérités", "Chaque repère est une convention de secteur, variable selon le poste et la culture, jamais une qualité personnelle universelle."],
  ["03", "L'humain garde la main", "La personne choisit ce qu'elle partage ; le coach contextualise, contredit si besoin, et décide de ce qui est renvoyé."],
  ["04", "Commencer en douceur", "Un échauffement sans analyse ni conservation, puis le choix du mode de retour : rapport écrit ou vidéo."],
];

const LAW = [
  [SI.scale, "Règlement européen sur l'IA", "Aucune reconnaissance d'émotion ni inférence de personnalité (article 5 du règlement 2024/1689). Transparence sur le rôle de l'assistant et supervision humaine à chaque étape."],
  [I.shield, "RGPD", "Minimisation (prénom et initiale, poste visé), consentement granulaire et retirable, vidéo conservée sur l'appareil tant que la personne ne l'envoie pas. Analyse d'impact à mener par l'organisme."],
  [I.user, "Accessibilité", "Navigation au clavier, contrastes vérifiés, respect du réglage « réduire les animations ». Un audit RGAA complet fait partie des étapes de mise en production."],
];

const BUILD = [
  ["Cadrage", "Un cadre AI Act et une analyse d'impact, un cadre psychosociologique sur les partis pris et les points de vigilance."],
  ["Cahier des charges", "Des exigences fonctionnelles et non fonctionnelles, et un benchmark qui a conclu à une construction interne plutôt qu'à un achat."],
  ["Prototype fonctionnel", "La boucle complète tourne dans le navigateur : entraînement, retour descriptif, envoi, relecture et rapport du coach."],
  ["Mise en production", "Backend hébergé en France, authentification des coachs, auto-hébergement des modèles, audit d'accessibilité, validation juridique."],
];

const FAQ = [
  ["Personnes accompagnées", [
    ["Faut-il créer un compte ?", "Non. Votre coach vous remet un code de 6 caractères qui ouvre votre espace. Aucune adresse électronique ni mot de passe n'est demandé."],
    ["Ma vidéo est-elle envoyée quelque part ?", ["Non, tant que vous ne décidez pas de l'envoyer à votre coach. L'enregistrement, la transcription et l'analyse se font dans votre navigateur.", "Au premier usage, le navigateur télécharge les modèles d'analyse (transcription et suivi du regard). Ce téléchargement ne transmet aucune donnée personnelle."]],
    ["Est-ce que je reçois une note ?", "Jamais. L'assistant décrit ce qu'il observe (débit, pauses, exemples, mots d'appui, structure, regard), en commençant par ce qui fonctionne. Il ne déduit ni émotion ni trait de personnalité."],
    ["Puis-je m'entraîner sans caméra ?", "Oui, en voix seule. Le suivi du regard est alors désactivé, le reste du retour reste disponible."],
    ["Puis-je tout supprimer ?", "Oui, à tout moment : une prise, votre parcours, ou le retrait de votre accord, qui supprime vos prises et vos vidéos."],
    ["Que faire si j'ai perdu mon code ?", "Demandez-le à votre coach : il le retrouve dans son espace."],
  ]],
  ["Coachs", [
    ["Est-ce que je vois toutes les prises ?", "Non. Vous voyez uniquement les prises que la personne choisit de vous envoyer, avec le mot qu'elle y a joint."],
    ["Puis-je contredire l'assistant ?", "Oui. Vous pouvez commenter chaque observation pour la confirmer, la nuancer ou la contredire. Votre commentaire apparaît à côté de l'observation dans le rapport."],
    ["Combien de temps demande une relecture ?", "Cela dépend de vous : quelques notes horodatées et un mot d'introduction suffisent souvent. Un brouillon est enregistré automatiquement, vous pouvez reprendre plus tard."],
    ["Puis-je utiliser l'outil en atelier collectif ?", "Oui. Les prises partagées servent de support au débriefing. Montrer un extrait au groupe demande toujours l'accord explicite de la personne."],
    ["Existe-t-il un classement des personnes ou des coachs ?", "Non. Les indicateurs sont agrégés (prises à relire, rapports envoyés, réentraînement, délai moyen de relecture). Aucune mesure de performance individuelle n'est proposée."],
  ]],
  ["Organismes", [
    ["Où sont stockées les données ?", ["Dans le prototype actuel, dans le navigateur de l'appareil utilisé (localStorage pour les informations, IndexedDB pour les vidéos). Le coach et la personne doivent donc utiliser le même appareil pour que la boucle fonctionne.", "Pour un usage réel à distance, un backend hébergé par l'organisme, en France, doit être branché derrière les fonctions de stockage existantes."]],
    ["Le dispositif est-il conforme à l'AI Act ?", "Il est conçu pour : aucune reconnaissance d'émotion, transparence sur le rôle de l'assistant, supervision humaine, absence de notation. La qualification réglementaire complète dépend de votre usage et reste à faire avec votre juridique et votre DPO."],
    ["Une analyse d'impact (AIPD) est-elle nécessaire ?", "Elle est recommandée avant tout déploiement. Les textes d'information fournis dans l'outil (conditions d'utilisation, notice RGPD, cycle de vie de la vidéo) sont des documents de travail à valider."],
    ["Combien cela coûte-t-il ?", "Il n'y a pas d'abonnement à un éditeur : l'outil est conçu pour être construit et hébergé par l'organisme. Le coût dépend du travail de mise en production (backend, authentification, hébergement des modèles) et de l'exploitation courante, à estimer avec votre DSI ou un prestataire."],
    ["Comment l'installer ?", "Le prototype se construit avec Node.js (npm run build) et se publie sur n'importe quel hébergement statique. Le dépôt contient un guide de démarrage et la liste du travail restant pour la production."],
    ["Peut-on y mettre notre logo ?", "Oui. L'en-tête prévoit l'emplacement du logo de l'organisme qui déploie l'outil (marque blanche)."],
    ["Quels navigateurs sont pris en charge ?", "Les navigateurs récents sur ordinateur et téléphone, dont Safari sur iPhone. Sur les appareils modestes, la transcription peut prendre un peu plus de temps."],
  ]],
];
