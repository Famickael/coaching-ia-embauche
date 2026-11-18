import React, { useEffect } from "react";
import { T, GRAD, GRAD_SOFT, FD, FB, FM, RAD, SH, Halo, Btn, Icon, I } from "./ui.jsx";

/* ════════════════════════ MODALES LÉGALES & INFO ════════════════════════ */

function LegalModal({ modal, close }) {
  useEffect(() => {
    if (!modal) return;
    const h = e => e.key === "Escape" && close();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [modal]);
  if (!modal) return null;
  const C = MODAL_CONTENT[modal];
  return (
    <div onClick={close} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(15,31,74,.45)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", padding: 20, animation: "up .25s ease both" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: RAD.xl, maxWidth: C.wide ? 760 : 600, width: "100%", maxHeight: "86vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: SH.lg }}>
        <div style={{ position: "relative", padding: "24px 28px", background: C.soft ? GRAD_SOFT : GRAD, overflow: "hidden", flexShrink: 0 }}>
          {!C.soft && <Halo style={{ width: 200, height: 200, background: "rgba(255,255,255,.16)", bottom: -110, right: -20 }} />}
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: RAD.md, background: C.soft ? "#fff" : "rgba(255,255,255,.2)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon d={C.icon} s={22} c={C.soft ? T.primary : "#fff"} /></div>
              <div>
                <h2 style={{ font: `800 20px ${FD}`, color: C.soft ? T.navy : "#fff", margin: 0, letterSpacing: "-.02em" }}>{C.title}</h2>
                {C.sub && <div style={{ font: `400 12.5px ${FB}`, color: C.soft ? T.body : "rgba(255,255,255,.85)", marginTop: 2 }}>{C.sub}</div>}
              </div>
            </div>
            <button onClick={close} aria-label="Fermer" style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: C.soft ? "#fff" : "rgba(255,255,255,.2)", color: C.soft ? T.navy : "#fff", cursor: "pointer", fontSize: 18, flexShrink: 0, display: "grid", placeItems: "center" }}>✕</button>
          </div>
        </div>
        <div style={{ padding: "24px 28px", overflowY: "auto" }}>{C.body}</div>
        <div style={{ padding: "16px 28px", borderTop: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, gap: 12, flexWrap: "wrap" }}>
          <span style={{ font: `400 11px ${FB}`, color: T.muted }}>Responsable de traitement : l'organisme qui vous accompagne</span>
          <Btn kind="primary" size="sm" onClick={close}>J'ai compris</Btn>
        </div>
      </div>
    </div>
  );
}

const LBlock = ({ t, children }) => (
  <div style={{ marginBottom: 18 }}>
    {t && <div style={{ font: `700 13px ${FD}`, color: T.navy, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".04em" }}>{t}</div>}
    <div style={{ font: `400 13.5px/1.65 ${FB}`, color: T.body }}>{children}</div>
  </div>
);
const LRow = ({ k, v }) => (
  <div style={{ display: "flex", gap: 12, padding: "9px 0", borderBottom: `1px solid ${T.lineLt}` }}>
    <div style={{ font: `600 13px ${FB}`, color: T.navy, minWidth: 150, flexShrink: 0 }}>{k}</div>
    <div style={{ font: `400 13px/1.55 ${FB}`, color: T.body }}>{v}</div>
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
          { n: "3", t: "Tant que vous ne partagez pas", d: "Si vous ne faites rien de plus, la vidéo reste sur votre appareil et n'est jamais envoyée sur un serveur. Vous pouvez la supprimer à tout moment depuis votre espace.", c: T.success },
          { n: "4", t: "Si vous partagez (ou demandez à la rejouer)", d: "À ce moment précis, et seulement à ce moment, la vidéo est transmise de façon chiffrée et stockée sur les serveurs de l'organisme qui vous accompagne (hébergement en France), pour que votre coach puisse la regarder, ou pour que vous puissiez la revoir plus tard.", c: T.warning },
          { n: "5", t: "Conservation", d: "La vidéo et le rapport sont conservés le temps de votre accompagnement, puis supprimés. Vous pouvez demander leur suppression à tout moment, sans justification.", c: T.lavender },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 14, marginBottom: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: s.c, color: "#fff", display: "grid", placeItems: "center", font: `700 13px ${FM}` }}>{s.n}</div>
              {i < 4 && <div style={{ width: 2, flex: 1, background: T.line, marginTop: 4 }} />}
            </div>
            <div style={{ paddingBottom: 4 }}>
              <div style={{ font: `700 14px ${FD}`, color: T.navy, marginBottom: 2 }}>{s.t}</div>
              <div style={{ font: `400 13px/1.55 ${FB}`, color: T.body }}>{s.d}</div>
            </div>
          </div>
        ))}
        <div style={{ background: T.successBg, borderRadius: RAD.md, padding: "14px 16px", marginTop: 6, font: `400 13px/1.6 ${FB}`, color: "#1E7A4A", display: "flex", gap: 10 }}>
          <span style={{ flexShrink: 0 }}>🔐</span>
          <span><strong>En résumé :</strong> rien ne quitte votre appareil tant que vous ne l'avez pas décidé. Le partage est une action volontaire, jamais automatique.</span>
        </div>
      </div>
    ),
  },
  emotion: {
    icon: I.shield, soft: true, title: "Pourquoi on n'analyse pas vos émotions", sub: "Un engagement, pour vous comme pour la loi",
    body: (
      <div>
        <LBlock>Cet outil <strong>ne cherche jamais à deviner ce que vous ressentez</strong>. Il ne détecte ni le stress, ni la confiance, ni la nervosité, ni aucune émotion.</LBlock>
        <LBlock t="Concrètement">Il décrit seulement des faits observables : à quelle vitesse vous parlez, comment votre propos est construit, vers où va votre regard. Jamais « vous semblez stressée », uniquement « le débit est de 145 mots par minute ».</LBlock>
        <div style={{ background: GRAD_SOFT, borderRadius: RAD.md, padding: "14px 16px", font: `400 13px/1.6 ${FB}`, color: T.primaryDk }}>
          <strong>Pour le cadre juridique :</strong> l'inférence d'émotions par IA est <strong>interdite</strong> en contexte d'emploi et de formation par l'article 5(1)(f) du Règlement européen sur l'IA (AI Act). Cette exclusion est intégrée à la conception de l'outil, pas seulement à sa politique d'usage : aucune brique d'analyse émotionnelle n'existe dans le système.
        </div>
      </div>
    ),
  },
  cgu: {
    icon: I.user, wide: true, title: "Conditions générales d'utilisation", sub: "La Répét' · version bénéficiaire · résumé",
    body: (
      <div>
        <div style={{ background: T.warningBg, borderRadius: RAD.md, padding: "11px 14px", marginBottom: 18, font: `400 12px/1.5 ${FB}`, color: "#8A5A0A" }}>
          Texte de travail, à valider par la direction juridique avant la mise en production.
        </div>
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
        <div style={{ background: T.warningBg, borderRadius: RAD.md, padding: "11px 14px", marginBottom: 18, font: `400 12px/1.5 ${FB}`, color: "#8A5A0A" }}>
          Texte de travail, à valider par le DPO. Une analyse d'impact (DPIA) précède la mise en production.
        </div>
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
        <div style={{ marginTop: 16, background: GRAD_SOFT, borderRadius: RAD.md, padding: "13px 15px", font: `400 12.5px/1.6 ${FB}`, color: T.primaryDk }}>
          ⚖️ Système classé « haut risque » au sens de l'AI Act (usage en contexte d'emploi). Les obligations associées (transparence, supervision humaine, exclusion de l'inférence émotionnelle, journalisation) sont intégrées à la conception.
        </div>
      </div>
    ),
  },
};



export { LegalModal };
