import React from "react";
import { T, RAD, SH, Btn, Card, Icon, I, TY, W, img, Eyebrow, Section, PageHero, IconTile, Accordion } from "./ui.jsx";
import { Reveal, useSectionScroll } from "./motion.jsx";
import { FinalBand } from "./home/FinalBand.jsx";

/* Page « À propos » : mission, pourquoi ce projet, parti pris, cadre réglementaire, pour qui,
   comment c'est construit, FAQ (#/a-propos/faq). */

export default function About({ go, openSpace, section }) {
  useSectionScroll(section);
  return (
    <main>
      <PageHero eyebrow="À propos" title="S'entraîner à l'entretien, sans jamais être noté"
        lead="Un entretien se prépare à voix haute. Et l'on progresse quand on peut recommencer sans être jugé. La Répét' est construite sur ces deux idées."
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
              <p style={{ margin: 0 }}>Certains outils proposent des scores, des jauges ou des analyses d'émotions. Pour des personnes qui doutent déjà d'elles, une note peut décourager davantage qu'elle n'aide. Et la reconnaissance des émotions est désormais interdite par le droit européen dans les contextes de travail et d'éducation.</p>
              <p style={{ margin: 0 }}>Nous avons donc voulu un outil qui <strong style={{ color: T.navy }}>décrit sans noter</strong>, qui laisse la personne décider de ce qu'elle envoie, et qui redonne au coach du temps pour ce qu'il fait de mieux : accompagner.</p>
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

        <Section eyebrow="Nos principes" title="Quatre principes qui guident chaque écran">
          <div className="rs-g2">
            {PRINC.map(([n, t, d], i) => (
              <Reveal key={n} delay={(i % 2) * 80} style={{ height: "100%" }}>
                <Card style={{ height: "100%", display: "flex", gap: 16 }}>
                  <div style={{ ...TY.num, color: T.primary, flexShrink: 0 }}>{n}</div>
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

        <Section eyebrow="À qui s'adresse La Répét'" title="Les organismes d'accompagnement vers l'emploi">
          <div className="rs-split" style={{ alignItems: "start" }}>
            <p style={{ ...TY.bodyLg, color: T.body, margin: 0 }}>La Répét' s'adresse aux structures qui préparent des personnes aux entretiens d'embauche et à la présentation de soi : structures d'insertion, missions locales, organismes de formation, services emploi des collectivités, associations. Elle s'utilise en complément d'un accompagnement humain, individuel ou collectif.</p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 12 }}>
              {[[I.user, "Les personnes accompagnées", "qui veulent s'entraîner à leur rythme, y compris celles qui redoutent l'exercice devant un groupe."],
                [I.users, "Les coachs", "qui veulent des supports concrets pour leurs ateliers et leurs rendez-vous."],
                [I.building, "Les directions et équipes support", "qui veulent un outil maîtrisé, conforme et hébergé par l'organisme."]].map(([ic, t, d]) => (
                <li key={t} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <IconTile icon={ic} />
                  <span style={{ ...TY.body, color: T.body }}><strong style={{ color: T.navy }}>{t}</strong> {d}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section id="faq" eyebrow="Questions fréquentes" title="Vos questions, nos réponses" sub="Personnes accompagnées, coachs, organismes : les réponses aux questions que l'on nous pose le plus souvent.">
          <div style={{ display: "grid", gap: 48 }}>
            {FAQ.map(([group, items], g) => (
              <div key={group} style={{ display: "grid", gap: 16 }}>
                <h3 style={{ ...TY.h2, color: T.navy, margin: 0 }}>{group}</h3>
                <Accordion idPrefix={`faq${g}`} items={items} />
              </div>
            ))}
          </div>
        </Section>

        <FinalBand title="Une question qui n'est pas dans la liste ?" text="Parlez-en à votre coach, ou demandez une prise en main accompagnée.">
          <Btn kind="white" size="lg" onClick={() => go("#/demo")} iconRight={I.arrow}>Demander une prise en main</Btn>
        </FinalBand>
      </div>
    </main>
  );
}

const AboutAside = () => (
  <div className="rp-hide-m" style={{ borderRadius: RAD.xl, overflow: "hidden", boxShadow: SH.glow, aspectRatio: "3 / 2", background: T.primaryBg }}>
    <img src={img("a-propos.webp")} alt="Deux femmes échangent autour d'une table ronde, dans un bureau lumineux." width={1200} height={800} loading="lazy" decoding="async" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
  </div>
);

const MISSION = [
  [I.redo, "S'entraîner sans limite", "Autant de répétitions que nécessaire, chez soi, au moment choisi, sans public."],
  [I.sparkle, "Comprendre sans être jugé", "L'assistant dit ce qu'il a remarqué, et à quel moment. Jamais de note."],
  [I.users, "Avancer avec son coach", "Le coach relit ce qu'on lui envoie, ajoute ses remarques et prépare le débriefing."],
];

const PRINC = [
  ["01", "Décrire, jamais noter", "Pas de score, pas de jauge, pas de classement. Des repères factuels, que la personne est libre d'utiliser."],
  ["02", "Des usages, pas des règles", "Un repère renvoie aux usages d'un métier. Ils changent selon le poste et l'entreprise. Ce n'est jamais un jugement sur la personne."],
  ["03", "L'humain garde la main", "La personne choisit ce qu'elle envoie. Le coach peut nuancer ou contredire l'assistant. Il décide de ce qu'il renvoie."],
  ["04", "Commencer en douceur", "Un échauffement sans enregistrement. Puis un retour à lire ou à regarder, au choix."],
];

const LAW = [
  [I.scale, "Règlement européen sur l'IA", "Aucune reconnaissance d'émotion ni inférence de personnalité (article 5 du règlement 2024/1689 : interdite sur le lieu de travail et dans les établissements d'enseignement ; nous l'excluons partout). Transparence sur le rôle de l'assistant et supervision humaine à chaque étape."],
  [I.shield, "RGPD", "Minimisation (prénom et initiale, poste visé), consentement donné option par option et retirable, vidéo conservée sur l'appareil tant que la personne ne l'envoie pas. Analyse d'impact à mener par l'organisme."],
  [I.user, "Accessibilité", "Navigation au clavier, contrastes vérifiés en thème clair et sombre, options d'accessibilité (taille du texte, police lisible, espacement, règle de lecture). Déclaration : non conforme tant qu'aucun audit RGAA n'est réalisé."],
];

const FAQ = [
  ["Personnes accompagnées", [
    ["Faut-il créer un compte ?", "Non. Votre coach vous donne un code d'accès de 6 caractères. Il ouvre votre espace. On ne vous demande ni adresse électronique ni mot de passe."],
    ["Ma vidéo est-elle envoyée quelque part ?", ["Non, tant que vous ne l'envoyez pas à votre coach. Tout se fait sur votre appareil : l'enregistrement, la mise par écrit et le retour de l'assistant.", "La première fois, votre appareil télécharge les outils nécessaires (environ 85 Mo). Votre vidéo et votre voix ne sont pas envoyées. Comme pour tout site, le serveur qui fournit ces fichiers voit l'adresse internet (IP) de votre appareil. Le détail est dans « Vos données »."]],
    ["Est-ce que je reçois une note ?", "Jamais. L'assistant décrit votre réponse : rythme de parole, pauses, exemples, regard. Il commence par ce qui fonctionne déjà. Il ne cherche à deviner ni vos émotions ni votre personnalité."],
    ["Puis-je m'entraîner sans caméra ?", "Oui, en voix seule. L'assistant ne décrit alors pas votre regard. Le reste du retour ne change pas."],
    ["Puis-je tout supprimer ?", "Oui, à tout moment. Vous pouvez supprimer une réponse. Vous pouvez aussi retirer votre accord : toutes vos réponses et vos vidéos sont alors supprimées."],
    ["Que faire si j'ai perdu mon code ?", "Demandez-le à votre coach : il le retrouve dans son espace."],
  ]],
  ["Coachs", [
    ["Est-ce que je vois toutes les réponses ?", "Non. Vous voyez seulement les réponses que la personne choisit de vous envoyer, avec le message qu'elle a joint."],
    ["Puis-je contredire l'assistant ?", "Oui. Vous pouvez commenter chaque repère pour le confirmer, le nuancer ou le contredire. Votre commentaire apparaît à côté du repère dans le rapport."],
    ["Combien de temps demande une relecture ?", "Cela dépend de vous. Quelques remarques dans la vidéo et un mot d'introduction suffisent souvent. Votre brouillon s'enregistre tout seul : vous pouvez reprendre plus tard."],
    ["Puis-je utiliser l'outil en atelier collectif ?", "Oui. Les réponses reçues servent de support au débriefing. Montrer un extrait au groupe demande toujours l'accord explicite de la personne."],
    ["Existe-t-il un classement des personnes ou des coachs ?", "Non. Les chiffres portent sur l'ensemble des parcours : réponses à relire, rapports envoyés, délai moyen de relecture. Aucun ne mesure une personne ni un coach."],
  ]],
  ["Organismes", [
    ["Où sont stockées les données ?", ["Les entraînements sont gardés dans le navigateur de l'appareil de la personne, tant qu'elle ne les envoie pas.", "Les réponses envoyées et les rapports sont stockés selon l'hébergement choisi par l'organisme, qui se branche derrière les fonctions de stockage de l'outil. Le détail est sur la page Solutions, rubrique Organismes."]],
    ["L'outil est-il conforme à l'AI Act ?", "Il est conçu pour s'y conformer : aucune reconnaissance d'émotion, transparence sur le rôle de l'assistant, supervision humaine, absence de notation. La qualification réglementaire complète dépend de votre usage et reste à faire avec votre juridique et votre DPO."],
    ["Une analyse d'impact (AIPD) est-elle nécessaire ?", "Oui. Le public accompagné et l'usage d'une technologie nouvelle la rendent nécessaire avant tout déploiement. Les textes d'information fournis dans l'outil (« Vos données », conditions d'utilisation) sont des documents de travail à valider par votre DPO."],
    ["Combien cela coûte-t-il ?", "Il n'y a pas d'abonnement à un éditeur : l'outil est conçu pour être construit et hébergé par l'organisme. Le coût dépend du travail de mise en production (backend, authentification, hébergement des modèles) et de l'exploitation courante, à estimer avec votre DSI ou un prestataire."],
    ["Comment l'installer ?", "L'outil est une application web, publiée sur l'hébergement de l'organisme. La documentation technique décrit l'installation et le raccordement au stockage."],
    ["Peut-on y mettre notre logo ?", "Oui. L'en-tête prévoit l'emplacement du logo de l'organisme qui déploie l'outil (marque blanche)."],
    ["Quels navigateurs sont pris en charge ?", "Les navigateurs récents sur ordinateur et téléphone, dont Safari sur iPhone. Sur les appareils modestes, la transcription peut prendre un peu plus de temps."],
  ]],
];
