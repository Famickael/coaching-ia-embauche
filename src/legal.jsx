import React from "react";
import { T, TY, Btn, Modal, Notice, I } from "./ui.jsx";

/* ════════════════════════ MODALES LÉGALES & INFO ════════════════════════ */

function LegalModal({ modal, close }) {
  if (!modal) return null;
  const C = MODAL_CONTENT[modal];
  return (
    <Modal close={close} title={C.title} sub={C.sub} icon={C.icon} head={C.soft ? "soft" : "grad"} width={C.wide ? "read" : "form"}
      footer={
        <div className="rp-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ ...TY.caption, color: T.muted }}>Responsable de traitement : l'organisme qui vous accompagne</span>
          <Btn kind="primary" size="sm" onClick={close}>J'ai compris</Btn>
        </div>
      }>
      {C.body}
    </Modal>
  );
}

const LBlock = ({ t, children }) => (
  <div style={{ display: "grid", gap: 4, marginBottom: 20 }}>
    {t && <h3 style={{ ...TY.h4, color: T.navy, margin: 0 }}>{t}</h3>}
    <div style={{ ...TY.body, color: T.body }}>{children}</div>
  </div>
);
const LRow = ({ k, v }) => (
  <div style={{ display: "flex", flexWrap: "wrap", columnGap: 12, rowGap: 4, padding: "8px 0", borderBottom: `1px solid ${T.lineLt}` }}>
    <div style={{ ...TY.label, color: T.navy, width: 160, flexShrink: 0 }}>{k}</div>
    <div style={{ ...TY.small, color: T.body, flex: "1 1 240px" }}>{v}</div>
  </div>
);

const MODAL_CONTENT = {
  lifecycle: {
    icon: I.shield, wide: true, title: "Le cycle de vie de votre vidéo", sub: "Ce qu'il advient de votre enregistrement, étape par étape",
    body: (
      <div>
        <LBlock>De l'enregistrement à la suppression, voici exactement ce qui se passe, et à quel moment votre vidéo est, ou n'est pas, transmise.</LBlock>
        {[
          { n: "1", t: "Enregistrement", d: "La vidéo est captée et reste sur votre appareil (navigateur). Rien n'est envoyé.", c: T.primary },
          { n: "2", t: "Analyse", d: "La transcription de votre voix et l'analyse se font sur votre appareil. Si votre organisme a activé la reformulation par un modèle de langage, seul le texte de votre discours (jamais l'image ni le son) est envoyé à un service hébergé en France.", c: T.primary },
          { n: "3", t: "Tant que vous ne partagez pas", d: "Si vous ne faites rien de plus, la vidéo reste sur votre appareil et n'est jamais envoyée sur un serveur. Vous pouvez la supprimer à tout moment depuis votre espace.", c: T.successDk },
          { n: "4", t: "Si vous partagez (ou demandez à la rejouer)", d: "À ce moment précis, et seulement à ce moment, la vidéo est transmise de façon chiffrée et stockée sur les serveurs de l'organisme qui vous accompagne (hébergement en France), pour que votre coach puisse la regarder, ou pour que vous puissiez la revoir plus tard.", c: T.warningDk },
          { n: "5", t: "Conservation", d: "La vidéo et le rapport sont conservés le temps de votre accompagnement, puis supprimés. Vous pouvez demander leur suppression à tout moment, sans justification.", c: T.primary },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div aria-hidden style={{ ...TY.time, width: 28, height: 28, borderRadius: "50%", background: s.c, color: T.surface, display: "grid", placeItems: "center" }}>{s.n}</div>
              {i < 4 && <div style={{ width: 2, flex: 1, background: T.line, marginTop: 4 }} />}
            </div>
            <div style={{ display: "grid", gap: 4, paddingBottom: 4 }}>
              <h3 style={{ ...TY.h4, color: T.navy, margin: 0 }}><span className="rp-sr">Étape {s.n} : </span>{s.t}</h3>
              <div style={{ ...TY.small, color: T.body }}>{s.d}</div>
            </div>
          </div>
        ))}
        <Notice tone="success" icon={I.lock} role="" style={{ marginTop: 8 }}>
          <strong>En résumé :</strong> rien ne quitte votre appareil tant que vous ne l'avez pas décidé. Le partage est une action volontaire, jamais automatique.
        </Notice>
      </div>
    ),
  },
  emotion: {
    icon: I.shield, soft: true, title: "Pourquoi on n'analyse pas vos émotions", sub: "Un engagement, pour vous comme pour la loi",
    body: (
      <div>
        <LBlock>Cet outil <strong>ne cherche jamais à deviner ce que vous ressentez</strong>. Il ne détecte ni le stress, ni la confiance, ni la nervosité, ni aucune émotion.</LBlock>
        <LBlock t="Concrètement">Il décrit seulement des faits observables : à quelle vitesse vous parlez, comment votre propos est construit, vers où va votre regard. Jamais « vous semblez stressée », uniquement « le débit est de 145 mots par minute ».</LBlock>
        <Notice tone="info" icon={I.scale}>
          <strong>Pour le cadre juridique :</strong> l'inférence d'émotions par IA est <strong>interdite</strong> en contexte d'emploi et de formation par l'article 5(1)(f) du Règlement européen sur l'IA (AI Act). Cette exclusion est intégrée à la conception de l'outil, pas seulement à sa politique d'usage : aucune brique d'analyse émotionnelle n'existe dans le système.
        </Notice>
      </div>
    ),
  },
  cgu: {
    icon: I.user, wide: true, title: "Conditions générales d'utilisation", sub: "La Répét' · version bénéficiaire · résumé",
    body: (
      <div>
        <Notice tone="warning" style={{ marginBottom: 20 }}>
          Texte de travail, à valider par la direction juridique avant la mise en production.
        </Notice>
        <LBlock t="1. Objet">La Répét' est un outil d'entraînement à l'entretien d'embauche proposé dans le cadre d'un accompagnement vers l'emploi. Il aide à se préparer ; il ne réalise aucune évaluation à valeur décisionnelle et ne conditionne aucun droit.</LBlock>
        <LBlock t="2. Accès">L'accès se fait par un code ou un lien personnel transmis par votre coach. Aucun compte n'est créé. Le code est strictement personnel.</LBlock>
        <LBlock t="3. Usage attendu">Vous vous enregistrez pour vous entraîner. Vous êtes seul·e à décider de partager une prise à votre coach. Vous vous engagez à n'enregistrer que vous-même et à ne pas filmer de tiers sans leur accord.</LBlock>
        <LBlock t="4. Ce que l'outil ne fait pas">Il ne note pas, ne classe pas, ne déduit aucune émotion (voir l'AI Act). Les retours sont descriptifs et indicatifs ; ils ne se substituent pas au jugement de votre coach.</LBlock>
        <LBlock t="5. Vos données">Le traitement de vos données est décrit dans la notice d'information (RGPD), accessible à tout moment. Vous pouvez exercer vos droits, dont la suppression, sans justification.</LBlock>
        <LBlock t="6. Supervision humaine">Aucun retour n'est transmis sans la médiation de votre coach, qui le contextualise avant l'envoi.</LBlock>
        <LBlock t="7. Responsable">L'outil est hébergé par l'organisme qui vous accompagne, responsable de traitement.</LBlock>
      </div>
    ),
  },
  rgpd: {
    icon: I.lock, wide: true, title: "Notice d'information : protection des données", sub: "Article 13 du RGPD · résumé",
    body: (
      <div>
        <Notice tone="warning" style={{ marginBottom: 20 }}>
          Texte de travail, à valider par le DPO. Une analyse d'impact (DPIA) précède la mise en production.
        </Notice>
        <LRow k="Responsable de traitement" v="L'organisme qui vous accompagne (nom et coordonnées à compléter)" />
        <LRow k="Finalité" v="Aider le bénéficiaire à préparer ses entretiens d'embauche, avec l'appui d'un coach." />
        <LRow k="Base légale" v="Consentement explicite du bénéficiaire (art. 6-1-a et art. 9-2-a pour les données issues de la vidéo). Recueilli librement, retirable à tout moment, et non conditionné à l'accès à la prestation." />
        <LRow k="Données traitées" v="Vidéo d'entraînement (si partagée), transcription du discours, observations descriptives, prénom et initiale, poste visé. Aucune inférence émotionnelle." />
        <LRow k="Traitement local" v="L'analyse de la vidéo se fait sur l'appareil. La vidéo n'est transmise et stockée que si le bénéficiaire la partage ou demande à la rejouer." />
        <LRow k="Hébergement" v="Serveurs situés en France (UE). Aucun transfert hors UE. Le modèle de langage utilisé est hébergé en France." />
        <LRow k="Destinataires" v="Le coach référent du bénéficiaire, uniquement. Aucune transmission à un tiers, aucun usage publicitaire." />
        <LRow k="Durée de conservation" v="Le temps de l'accompagnement, puis suppression. Suppression possible à tout moment à la demande." />
        <LRow k="Vos droits" v="Accès, rectification, effacement, opposition, retrait du consentement, limitation. Exerçables sans justification auprès du coach ou du DPO." />
        <LRow k="Réclamation" v="Vous pouvez saisir la CNIL (cnil.fr) à tout moment." />
        <Notice tone="info" icon={I.scale} style={{ marginTop: 16 }}>
          Système classé « haut risque » au sens de l'AI Act (usage en contexte d'emploi). Les obligations associées (transparence, supervision humaine, exclusion de l'inférence émotionnelle, journalisation) sont intégrées à la conception.
        </Notice>
      </div>
    ),
  },
};



export { LegalModal };
