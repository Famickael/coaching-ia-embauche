import React, { useEffect, useState } from "react";
import { T, GRAD, GRAD_MAIN, GRAD_AI, GRAD_SOFT, FD, FB, FM, RAD, SH, sp, RepetMark, RepetLogo, TSLogo, Halo, Tag, Btn, Card, Icon, I, GStyle } from "./ui.jsx";
import { LegalModal } from "./legal.jsx";
import Beneficiary from "./Beneficiary.jsx";
import Counselor from "./Counselor.jsx";

/* La Répét' : coach IA d'entraînement à l'entretien.
   Rôles : présentation, bénéficiaire (accès par code ou lien #/s/CODE), conseiller. */

function codeFromHash() {
  const m = location.hash.match(/^#\/s\/([A-Za-z0-9]{6})/);
  return m ? m[1].toUpperCase() : null;
}

export default function App() {
  const [role, setRoleState] = useState(() => (codeFromHash() ? "benef" : "home"));
  const [hashCode, setHashCode] = useState(codeFromHash);
  const [modal, setModal] = useState(null); // "lifecycle" | "cgu" | "rgpd" | "emotion" | null

  useEffect(() => {
    const on = () => { const c = codeFromHash(); setHashCode(c); if (c) setRoleState("benef"); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const setRole = r => { if (r !== "benef" && location.hash) history.replaceState(null, "", location.pathname); setRoleState(r); window.scrollTo({ top: 0 }); };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: FB, color: T.ink, display: "flex", flexDirection: "column" }}>
      <GStyle />
      <Nav role={role} setRole={setRole} setModal={setModal} />
      <div style={{ flex: 1 }}>
        {role === "home" && <Landing setRole={setRole} setModal={setModal} />}
        {role === "benef" && <Beneficiary key={hashCode || "nocode"} initialCode={hashCode} setModal={setModal} />}
        {role === "conseiller" && <Counselor setRole={setRole} />}
      </div>
      <Footer setModal={setModal} />
      <LegalModal modal={modal} close={() => setModal(null)} />
    </div>
  );
}

function Nav({ role, setRole, setModal }) {
  const tabs = [["home", "Présentation"], ["benef", "Bénéficiaire"], ["conseiller", "Conseiller"]];
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(248,250,252,.82)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${T.line}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, cursor: "pointer" }} onClick={() => setRole("home")}>
          <RepetLogo s={17} tagline={false} />
          <div style={{ width: 1, height: 30, background: T.line }} />
          <TSLogo s={10} />
        </div>
        <nav style={{ display: "flex", gap: 4, background: "#fff", padding: 4, borderRadius: RAD.pill, boxShadow: SH.xs }}>
          {tabs.map(([k, l]) => (
            <button key={k} onClick={() => setRole(k)} style={{
              font: `600 13px ${FB}`, padding: "8px 16px", borderRadius: RAD.pill, border: "none", cursor: "pointer",
              background: role === k ? T.primary : "transparent", color: role === k ? "#fff" : T.muted, transition: "all .2s",
            }}>{l}</button>
          ))}
        </nav>
      </div>
    </header>
  );
}

/* ════════════════════════ LANDING ════════════════════════ */

function Landing({ setRole, setModal }) {
  return (
    <main>
      <section style={{ position: "relative", overflow: "hidden", background: T.bg }}>
        {/* aplats bleu clair subtils + formes organiques dégradé */}
        <Halo style={{ width: 560, height: 560, background: `${T.blue}1A`, top: -180, right: -100 }} />
        <Halo style={{ width: 420, height: 420, background: `${T.primary}14`, top: 60, left: -180 }} />
        <Halo style={{ width: 260, height: 260, background: `${T.violet}14`, bottom: -80, right: 200 }} />
        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "84px 24px 76px", display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 56, alignItems: "center" }}>
          <div className="up">
            <div style={{ display: "flex", gap: 8, marginBottom: sp(6) }}>
              <Tag tone="ai">✨ Coach IA</Tag>
              <Tag tone="success">Conçu pour l'AI Act et le RGPD</Tag>
            </div>
            <h1 style={{ font: `800 56px/1.05 ${FD}`, letterSpacing: "-.035em", margin: `0 0 ${sp(5)}px`, color: T.primary }}>
              Préparez votre entretien,<br /><span style={{ background: GRAD_MAIN, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>sans pression.</span>
            </h1>
            <p style={{ font: `400 19px/1.6 ${FB}`, color: T.body, maxWidth: 520, margin: `0 0 ${sp(8)}px` }}>
              Entraînez-vous à votre rythme, recevez un retour bienveillant qui <strong style={{ color: T.primary }}>décrit sans noter</strong>, puis échangez avec votre conseiller. Un seul lien, aucun compte à créer.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Btn kind="objective" size="lg" onClick={() => setRole("benef")}>Commencer l'entraînement&nbsp;<Icon d={I.arrow} s={18} c="#fff" /></Btn>
              <Btn kind="secondary" size="lg" onClick={() => setRole("conseiller")}>Espace conseiller</Btn>
            </div>
            <div style={{ font: `500 13px ${FB}`, color: T.muted, marginTop: sp(5) }}>
              Pour les <strong style={{ color: T.primary }}>organismes d'accompagnement vers l'emploi</strong>
            </div>
          </div>
          <div className="up" style={{ position: "relative" }}>
            <HeroVisual />
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <Section eyebrow="Le déroulé" title="Un seul lien, du premier essai au débriefing">
          <Flow />
        </Section>

        <Section eyebrow="Pour la DSI & le juridique" title="Réalisable et hébergé en interne, sans prestataire">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: sp(5) }}>
            <Proof icon={I.lock} t="Analyse locale, transmission maîtrisée" b="L'analyse de la posture tourne dans le navigateur (MediaPipe). La vidéo n'est transmise et stockée que si le bénéficiaire choisit de la partager à son conseiller, jamais à son insu." />
            <Proof icon={I.shield} t="Texte traité en souveraineté" b="La transcription (Whisper) et l'analyse descriptive tournent dans le navigateur. Une reformulation par un modèle hébergé en France (par exemple Mistral) peut être activée ; elle ne reçoit que du texte." />
            <Proof icon={I.sparkle} t="Conçu pour être hébergé en interne" b="Application développée et opérée par l'organisme d'accompagnement lui-même. Briques standards, maîtrisables par une équipe interne." />
          </div>
        </Section>

        <Section eyebrow="Le parti pris" title="Un coach qui rend autonome, pas conforme">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: sp(5) }}>
            <Princ n="01" t="Décrire, jamais noter" d="« Tu regardes vers le bas 40 % du temps » plutôt que « contact visuel insuffisant ». Tu observes, et tu décides quoi en faire." />
            <Princ n="02" t="Des conventions, pas des vérités" d="Chaque repère est une convention de secteur, variable selon le poste et la culture, jamais une qualité personnelle universelle." />
            <Princ n="03" t="L'humain garde la main" d="Aucun retour n'arrive sans passer par ton conseiller, qui contextualise et annote avant l'envoi." />
            <Princ n="04" t="On commence en douceur" d="Première prise sans analyse. Et au moment du retour, tu choisis : un rapport écrit, ou te revoir en vidéo." />
          </div>
        </Section>

        <section style={{ padding: `${sp(4)}px 0 ${sp(20)}px` }}>
          <div style={{ position: "relative", borderRadius: RAD.xl, padding: "52px 48px", overflow: "hidden", background: GRAD, boxShadow: SH.lg }}>
            <Halo style={{ width: 300, height: 300, background: "rgba(255,255,255,.18)", bottom: -120, right: -40 }} />
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
              <div>
                <h3 style={{ font: `800 30px ${FD}`, color: "#fff", margin: "0 0 8px", letterSpacing: "-.02em" }}>Prêt à voir comment ça marche ?</h3>
                <p style={{ font: `400 17px ${FB}`, color: "rgba(255,255,255,.9)", margin: 0 }}>Créez un parcours côté conseiller, puis ouvrez le lien côté bénéficiaire.</p>
              </div>
              <Btn kind="objective" size="lg" onClick={() => setRole("benef")}>Commencer&nbsp;<Icon d={I.arrow} s={18} c="#fff" /></Btn>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function HeroVisual() {
  return (
    <div style={{ position: "relative", animation: "float 6s ease-in-out infinite" }}>
      <Card pad={0} style={{ overflow: "hidden", boxShadow: SH.lg, borderRadius: RAD.xl }}>
        <div style={{ background: GRAD, padding: "18px 22px", display: "flex", alignItems: "center", gap: 10 }}>
          <RepetMark s={30} />
          <div style={{ font: `700 15px ${FD}`, color: "#fff", letterSpacing: "-.01em" }}>Ta prise du jour</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
            {[0, 1, 2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(255,255,255,.5)" }} />)}
          </div>
        </div>
        <div style={{ padding: 22 }}>
          {[
            { t: "Ouverture", tone: "appui", txt: "Tu entres dans le sujet directement." },
            { t: "Exemples concrets", tone: "appui", txt: "Une expérience précise pour appuyer." },
            { t: "Mots d'appui", tone: "explorer", txt: "« euh » revient quelques fois." },
          ].map((r, i) => {
            const ap = r.tone === "appui", c = ap ? T.orange : T.violet;
            return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: i < 2 ? `1px solid ${T.lineLt}` : "none" }}>
              <div style={{ width: 34, height: 34, borderRadius: RAD.sm, background: `${c}14`, display: "grid", placeItems: "center" }}>
                <Icon d={ap ? I.check : I.sparkle} s={16} c={c} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ font: `700 13px ${FD}`, color: T.navy }}>{r.t}</div>
                <div style={{ font: `400 12px ${FB}`, color: T.muted }}>{r.txt}</div>
              </div>
              <Tag tone={ap ? "orange" : "ai"}>{ap ? "Appui" : "À explorer"}</Tag>
            </div>
          );})}
        </div>
      </Card>
      <div style={{ position: "absolute", bottom: -18, left: -18, background: "#fff", borderRadius: RAD.md, padding: "10px 14px", boxShadow: SH.lg, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: GRAD_AI, display: "grid", placeItems: "center" }}><Icon d={I.sparkle} s={14} c="#fff" /></div>
        <div style={{ font: `700 12px ${FM}`, color: T.primary }}>Analyse en 8s</div>
      </div>
    </div>
  );
}

const Section = ({ eyebrow, title, children }) => (
  <section style={{ padding: `${sp(18)}px 0 0` }}>
    <div style={{ font: `700 12px ${FB}`, letterSpacing: ".1em", textTransform: "uppercase", color: T.primary, marginBottom: sp(2) }}>{eyebrow}</div>
    <h2 style={{ font: `800 34px/1.1 ${FD}`, letterSpacing: "-.03em", margin: 0, color: T.navy }}>{title}</h2>
    <div style={{ marginTop: sp(8) }}>{children}</div>
  </section>
);

const Proof = ({ icon, t, b }) => (
  <Card hover topbar>
    <div style={{ position: "relative", width: 48, height: 48, borderRadius: RAD.md, background: `${T.primary}10`, display: "grid", placeItems: "center", marginBottom: sp(4) }}>
      <Icon d={icon} s={22} c={T.primary} />
      <span style={{ position: "absolute", top: -3, right: -3, width: 12, height: 12, borderRadius: "50%", background: T.orange, border: "2px solid #fff" }} />
    </div>
    <h3 style={{ font: `700 17px/1.3 ${FD}`, margin: "0 0 8px", color: T.navy }}>{t}</h3>
    <p style={{ font: `400 14px/1.6 ${FB}`, color: T.body, margin: 0 }}>{b}</p>
  </Card>
);
const Princ = ({ n, t, d }) => (
  <Card hover style={{ display: "flex", gap: sp(4) }}>
    <div style={{ font: `800 24px ${FM}`, color: T.orange, flexShrink: 0, lineHeight: 1.1 }}>{n}</div>
    <div>
      <h3 style={{ font: `700 18px ${FD}`, margin: "0 0 6px", color: T.navy }}>{t}</h3>
      <p style={{ font: `400 14px/1.6 ${FB}`, color: T.body, margin: 0 }}>{d}</p>
    </div>
  </Card>
);

function Flow() {
  const steps = [
    { n: 1, who: "Conseiller", t: "crée un parcours", d: "et génère un lien", c: T.primary },
    { n: 2, who: "Bénéficiaire", t: "ouvre le lien", d: "saisit son code", c: T.blue },
    { n: 3, who: "Bénéficiaire", t: "s'entraîne seul", d: "retour IA bienveillant", c: T.violet },
    { n: 4, who: "Bénéficiaire", t: "partage sa prise", d: "quand il le décide", c: T.orange },
    { n: 5, who: "Conseiller", t: "annote", d: "contextualise, nuance", c: T.primary },
    { n: 6, who: "Ensemble", t: "débriefing en atelier", d: "en présentiel", c: T.blue },
    { n: 7, who: "Bénéficiaire", t: "peut recommencer", d: "même après l'atelier", c: T.orange },
  ];
  return (
    <div style={{ display: "flex", overflowX: "auto", paddingBottom: sp(2), gap: 0 }}>
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div style={{ flex: "1 0 146px", minWidth: 146 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: sp(2) }}>
              <span style={{ width: 28, height: 28, borderRadius: "50%", background: s.c, color: "#fff", display: "grid", placeItems: "center", font: `700 12px ${FM}`, flexShrink: 0 }}>{s.n}</span>
              <span style={{ font: `700 10.5px ${FB}`, textTransform: "uppercase", letterSpacing: ".05em", color: s.c }}>{s.who}</span>
            </div>
            <div style={{ font: `700 15px ${FD}`, marginBottom: 2, color: T.navy }}>{s.t}</div>
            <div style={{ font: `400 13px ${FB}`, color: T.body }}>{s.d}</div>
          </div>
          {i < steps.length - 1 && <div style={{ flexShrink: 0, alignSelf: "flex-start", marginTop: 4, color: T.faint, padding: "0 6px" }}><Icon d={I.arrow} s={16} c={T.faint} /></div>}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ════════════════════════ BÉNÉFICIAIRE ════════════════════════ */


/* ════════════════════════ FOOTER (non collant) ════════════════════════ */

function Footer({ setModal }) {
  const links = [["cgu", "Conditions d'utilisation"], ["rgpd", "Protection des données"], ["lifecycle", "Cycle de vie de la vidéo"]];
  return (
    <footer style={{ borderTop: `1px solid ${T.line}`, background: "#fff", marginTop: sp(10) }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <RepetLogo s={14} tagline={false} />
          <div style={{ width: 1, height: 26, background: T.line }} />
          <TSLogo s={9} />
        </div>
        <div style={{ display: "flex", gap: 16, font: `500 12px ${FB}`, color: T.body, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon d={I.lock} s={14} c={T.success} /> Analyse locale, partage maîtrisé</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon d={I.shield} s={14} c={T.blue} /> Modèle souverain</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>⚖️ Sans inférence émotionnelle</span>
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${T.lineLt}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 24px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ font: `400 11px ${FB}`, color: T.muted }}>
            La Répét' · prototype de coaching IA à l'entretien d'embauche
          </div>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            {links.map(([k, l]) => (
              <button key={k} onClick={() => setModal && setModal(k)} style={{ font: `500 12px ${FB}`, color: T.primary, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: 2 }}>{l}</button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

