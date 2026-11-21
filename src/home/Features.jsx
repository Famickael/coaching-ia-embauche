import React from "react";
import { T, HL, RAD, SH, Tag, Btn, Card, I, TY, Section, IconTile } from "../ui.jsx";
import { useReducedMotion, useInView, Reveal } from "../motion.jsx";
import { Pin } from "./shared.jsx";

/* ─── Cartes de fonctionnalités : micro-animation en boucle, seulement quand la carte est visible ─── */
export function FCard({ title, text, children }) {
  const reduced = useReducedMotion();
  const [ref, v] = useInView({ once: false, threshold: 0.35, rootMargin: "0px" });
  return (
    <div ref={ref} className={`rs-fcard ${v && !reduced ? "play" : ""}`}>
      <div className="rs-fvis" aria-hidden>{children}</div>
      <h3 style={{ ...TY.h3, color: T.navy, margin: "4px 8px 0" }}>{title}</h3>
      <p style={{ ...TY.body, color: T.body, margin: "0 8px" }}>{text}</p>
    </div>
  );
}

export const miniCard = { background: T.surface, borderRadius: RAD.sm, padding: "12px 16px", boxShadow: SH.xs };

export function Features() {
  return (
    <Section eyebrow="Au fil de l'entraînement" title="Tout ce qu'il faut pour répéter à votre rythme" sub="Des outils simples, pensés pour s'entraîner seul et garder la main sur ce que l'on partage.">
      <div className="rs-fcards" tabIndex={0} role="group" aria-label="Fonctions, liste à faire défiler">
        <FCard title="Un échauffement sans enregistrement" text="Des phrases à lire à voix haute pour se mettre en route. Rien n'est enregistré ni analysé.">
          <div style={{ ...TY.overline, color: T.muted, marginBottom: 8 }}>Échauffement · lisez à voix haute</div>
          <div className="rs-cyc" style={{ display: "grid" }}>
            {["« Je vous remercie de me recevoir. »", "« J'ai travaillé deux ans en boutique. »", "« Je suis disponible dès lundi. »"].map(t => (
              <div key={t} style={{ ...miniCard, ...TY.h3, color: T.navy }}>{t}</div>
            ))}
          </div>
        </FCard>
        <FCard title="Des questions adaptées au métier" text="Choisissez le métier visé : les questions s'y adaptent. Vous pouvez aussi ajouter les vôtres.">
          <div className="rs-jobs" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {["agent d'accueil", "serveur(se)", "aide-soignant(e)"].map(j => <span key={j} style={{ ...TY.tag, padding: "8px 12px", borderRadius: RAD.pill, border: `1.5px solid ${T.line}`, background: T.surface, color: T.body }}>{j}</span>)}
          </div>
          <div className="rs-cyc" style={{ display: "grid" }}>
            {["« Comment accueillez-vous une personne mécontente ? »", "« Comment gérez-vous un service chargé ? »", "« Comment réagissez-vous face à une urgence ? »"].map(t => (
              <div key={t} style={{ ...miniCard, ...TY.label, color: T.navy }}>{t}</div>
            ))}
          </div>
        </FCard>
        <FCard title="Caméra ou micro seul" text="Répondez en vidéo, ou en voix seule si vous préférez. Trois minutes maximum par réponse.">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.surface, borderRadius: RAD.pill, padding: "4px 12px", boxShadow: SH.xs }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.error, animation: "blink 1.2s infinite" }} />
              <span style={{ ...TY.time, color: T.navy }}>0:4<span className="rs-digits"><span>0<br />1<br />2<br />3<br />4<br />5<br />6<br />7<br />8<br />9</span></span></span>
            </span>
            <Tag tone="muted" icon={I.mic}>Voix seule</Tag>
          </div>
          <div className="rs-wave" style={{ marginTop: 24, justifyContent: "center" }}>
            {Array.from({ length: 22 }, (_, i) => <i key={i} style={{ animationDelay: `${(i * 137) % 900}ms`, height: `${30 + ((i * 53) % 60)}%` }} />)}
          </div>
        </FCard>
        <FCard title="Une transcription repérée" text="Votre réponse est transcrite sur votre appareil. Les passages utiles sont repérés, sans jugement.">
          <p style={{ ...TY.small, color: T.navy, margin: 0 }}>
            Bonjour, je m'appelle Sami. <span className="rs-fhl h2" style={{ backgroundImage: HL.ai }}>Euh</span>, j'ai <span className="rs-fhl" style={{ backgroundImage: HL.appui }}>géré la caisse d'une supérette pendant trois ans</span>.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            <span className="rs-ftag"><Tag tone="appui" icon={I.check}>Exemple concret</Tag></span>
            <span className="rs-ftag t2"><Tag tone="ai" icon={I.search}>Mot d'appui</Tag></span>
          </div>
        </FCard>
        <FCard title="Un assistant pour vos questions" text="Une hésitation sur un retour ou sur une question difficile ? L'assistant répond, votre coach complète.">
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ ...miniCard, justifySelf: "end", background: T.primaryBg, ...TY.small, color: T.navy, maxWidth: "85%" }}>Comment parler d'un trou dans mon CV ?</div>
            <div style={{ position: "relative", ...miniCard, background: T.violetBg, ...TY.small, color: T.navy, maxWidth: "90%", minHeight: 44 }}>
              <span className="rs-typing rp-dots" style={{ color: T.violet }}><i /><i /><i /></span>
              <span className="rs-answer" style={{ display: "block" }}>Restez simple et honnête, puis parlez de ce que vous avez fait pendant cette période.</span>
            </div>
          </div>
        </FCard>
        <FCard title="Rapport écrit ou vidéo, au choix" text="Découvrez votre retour comme vous le préférez : en lisant, ou en vous revoyant avec des repères.">
          <div className="rs-seg"><i /><span>Rapport écrit</span><span>Me revoir en vidéo</span></div>
          <div style={{ ...miniCard, marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <Pin ap /><span style={{ ...TY.caption, color: T.navy, flex: 1 }}>Ouverture directe à 0:04</span><span style={{ ...TY.time, color: T.muted }}>0:04</span>
          </div>
        </FCard>
      </div>
    </Section>
  );
}

/* ─── Ce que La Répét' ne fait pas ─── */
export function NotDo() {
  const items = [
    ["7/10", I.ban, "Aucune note", "Ni score, ni classement. L'assistant décrit, vous décidez quoi en faire."],
    ["humeur", I.shield, "Aucune émotion devinée", "L'assistant ne cherche pas à deviner votre humeur ni votre personnalité. Il décrit ce qui se voit et ce qui s'entend."],
    ["envoi auto", I.lock, "Aucun envoi sans votre accord", "Votre coach voit seulement ce que vous lui envoyez. Vous pouvez tout supprimer, à tout moment."],
  ];
  return (
    <Section eyebrow="Nos engagements" title="Ce que La Répét' ne fait pas">
      <div className="rs-g3">
        {items.map(([ghost, ic, t, d], i) => (
          <Reveal key={t} delay={i * 90} style={{ height: "100%" }}>
            <Card style={{ height: "100%", display: "grid", gap: 8, alignContent: "start" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <IconTile icon={ic} />
                <span className="strike" aria-hidden style={{ ...TY.mono, color: T.muted }}>{ghost}</span>
              </div>
              <h3 style={{ ...TY.h3, margin: 0, color: T.navy }}>{t}</h3>
              <p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ─── Pour qui ─── */
export function ForWho({ go }) {
  const doors = [
    { top: true, t: "Vous avez un code d'accès", d: "Votre coach vous a donné un code d'accès de 6 caractères. Il ouvre votre espace.", b: <Btn kind="secondary" onClick={() => go("#/espace")} iconRight={I.arrow}>Ouvrir mon espace</Btn> },
    { top: "coach", t: "Vous êtes coach", d: "Créez un parcours et transmettez le code d'accès. Relisez les réponses que l'on vous envoie. Préparez vos débriefings.", b: <Btn kind="secondary" onClick={() => go("#/espace")}>Me connecter à l'espace coach</Btn> },
    { top: "ai", t: "Vous portez un projet d'accompagnement", d: "Acteur public de l'emploi ou entreprise : confiez-nous l'accompagnement de demandeurs d'emploi ou de collaborateurs en mobilité.", b: <Btn kind="secondary" onClick={() => go("#/demo")}>Parler de votre projet</Btn> },
  ];
  return (
    <Section eyebrow="Pour qui" title="Par où commencer ?">
      <div className="rs-g3">
        {doors.map((x, i) => (
          <Reveal key={x.t} delay={i * 90} style={{ height: "100%" }}>
            <Card topbar={x.top} style={{ height: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
              <h3 style={{ ...TY.h2, margin: "8px 0 0", color: T.navy }}>{x.t}</h3>
              <p style={{ ...TY.body, color: T.body, margin: 0, flex: 1 }}>{x.d}</p>
              <div>{x.b}</div>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
