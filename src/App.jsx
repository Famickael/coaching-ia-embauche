import React, { useEffect, useState } from "react";
import { T, FD, FB, FM, RAD, SH, sp, RepetLogo, OrgLogo, Tag, Btn, Card, Icon, I, GStyle, LOCAL_ONLY } from "./ui.jsx";
import { LegalModal } from "./legal.jsx";
import Home from "./Home.jsx";
import HowItWorks from "./HowItWorks.jsx";
import Beneficiary from "./Beneficiary.jsx";
import Counselor from "./Counselor.jsx";
import { useStore, getState, setLastSpace, findParcours, TRIAL_CODE } from "./lib/store.js";

/* La Répét' : coach IA d'entraînement à l'entretien.
   Routes (dans l'ancre de l'adresse, pour que le bouton Retour du navigateur fonctionne) :
     #/                 accueil
     #/fonctionnement   fonctionnement détaillé
     #/espace           choix de l'espace (code bénéficiaire ou coach)
     #/s/CODE           espace bénéficiaire
     #/beneficiaire     saisie du code
     #/coach            espace coach (connexion simulée, identifiants pré-remplis) */

function routeFromHash() {
  const h = location.hash;
  const m = h.match(/^#\/s\/([A-Za-z0-9]{6})/);
  if (m) return { role: "benef", code: m[1].toUpperCase() };
  if (h === "#/beneficiaire") return { role: "benef", code: null };
  if (h === "#/coach") return { role: "coach" };
  if (h === "#/fonctionnement") return { role: "how" };
  if (h === "#/espace") return { role: "espace" };
  return { role: "home" };
}

const go = hash => { if (location.hash === hash) window.scrollTo({ top: 0 }); else location.hash = hash; };

/* « Mon espace » : rouvre le dernier espace utilisé sur cet appareil, sinon propose le choix. */
function openSpace() {
  const ls = getState().lastSpace;
  if (ls?.role === "coach") return go("#/coach");
  if (ls?.role === "benef" && findParcours(ls.code)) return go(`#/s/${ls.code}`);
  go("#/espace");
}

export default function App() {
  const s = useStore();
  const [route, setRoute] = useState(routeFromHash);
  const [modal, setModal] = useState(null); // "lifecycle" | "cgu" | "rgpd" | "emotion" | null

  useEffect(() => {
    const on = () => { setRoute(routeFromHash()); window.scrollTo({ top: 0 }); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  useEffect(() => { if (route.role === "coach") setLastSpace({ role: "coach" }); }, [route.role]);

  const onCode = code => {
    if (code) { setLastSpace({ role: "benef", code }); if (location.hash !== `#/s/${code}`) history.replaceState(null, "", `#/s/${code}`); }
    else if (getState().lastSpace?.role === "benef") { setLastSpace(null); history.replaceState(null, "", "#/beneficiaire"); }
  };

  return (
    <div className="rp-app" style={{ background: T.bg, fontFamily: FB, color: T.ink, display: "flex", flexDirection: "column" }}>
      <GStyle />
      <Nav route={route} s={s} />
      <div style={{ flex: 1 }}>
        {route.role === "home" && <Home go={go} openSpace={openSpace} />}
        {route.role === "how" && <HowItWorks go={go} openSpace={openSpace} />}
        {route.role === "espace" && <Espace />}
        {route.role === "benef" && <Beneficiary key={route.code || "nocode"} initialCode={route.code} setModal={setModal} onCode={onCode} />}
        {route.role === "coach" && <Counselor />}
      </div>
      <Footer setModal={setModal} />
      <LegalModal modal={modal} close={() => setModal(null)} />
    </div>
  );
}

/* ─── En-tête ─── */
function Nav({ route, s }) {
  const inSpace = route.role === "benef" || route.role === "coach";
  const p = route.role === "benef" ? s.parcours[s.lastSpace?.code] : null;
  const label = route.role === "coach" ? "Espace coach" : p ? `Espace de ${p.prenom}` : "Espace bénéficiaire";
  return (
    <header className="noprint" style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(248,250,252,.86)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderBottom: `1px solid ${T.line}` }}>
      <div className="rp-nav" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexShrink: 0 }}>
          <button onClick={() => go("#/")} aria-label="La Répét', accueil" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}>
            <RepetLogo s={17} tagline={false} />
          </button>
          <div className="rp-hide-m" style={{ width: 1, height: 30, background: T.line }} />
          <span className="rp-hide-m"><OrgLogo s={10} /></span>
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <a href="#/fonctionnement" className={`navlink rp-hide-xs ${inSpace ? "rp-hide-m" : ""} ${route.role === "how" ? "on" : ""}`}>Fonctionnement</a>
          {inSpace ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: `1px solid ${T.line}`, borderRadius: RAD.pill, padding: "4px 4px 4px 12px", boxShadow: SH.xs }}>
              <span className="rp-nav-pill-icon" style={{ display: "inline-flex" }}><Icon d={I.user} s={15} c={T.primary} /></span>
              <span className="rp-nav-pill-label" style={{ font: `600 13px ${FB}`, color: T.navy, whiteSpace: "nowrap" }}>{label}</span>
              <button onClick={() => go("#/espace")} aria-label="Changer d'espace" style={{ font: `600 12.5px ${FB}`, color: T.primary, background: `${T.primary}10`, border: "none", borderRadius: RAD.pill, padding: "7px 12px", cursor: "pointer", whiteSpace: "nowrap" }}>Changer d'espace</button>
            </div>
          ) : (
            <Btn kind="primary" size="sm" onClick={openSpace}><span className="rp-hide-m" style={{ display: "inline-flex" }}><Icon d={I.user} s={16} c="#fff" /></span>Mon espace</Btn>
          )}
        </nav>
      </div>
    </header>
  );
}

/* ─── Choix de l'espace ─── */
function Espace() {
  const [code, setCode] = useState(TRIAL_CODE);
  const [err, setErr] = useState("");
  const submit = e => {
    e.preventDefault();
    const p = findParcours(code);
    if (p) go(`#/s/${p.code}`); else setErr("Ce code n'existe pas ou n'est plus actif. Vérifiez-le auprès de votre coach.");
  };
  return (
    <main className="rp-pad" style={{ maxWidth: 920, margin: "0 auto", padding: "48px 24px 64px" }}>
      <div className="up">
        <h1 style={{ font: `800 32px ${FD}`, letterSpacing: "-.03em", color: T.navy, margin: "0 0 6px" }}>Mon espace</h1>
        <p style={{ font: `400 16px ${FB}`, color: T.body, margin: "0 0 28px" }}>Choisissez votre accès.</p>
        <div className="rp-stack" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20, alignItems: "stretch" }}>
          <Card pad={28} topbar style={{ boxShadow: SH.sm }}>
            <Tag tone="appui">Bénéficiaire</Tag>
            <h2 style={{ font: `800 21px ${FD}`, color: T.navy, margin: "12px 0 6px" }}>J'ai un code d'entraînement</h2>
            <p style={{ font: `400 14px/1.6 ${FB}`, color: T.body, margin: "0 0 18px" }}>Saisissez le code de 6 caractères remis par votre coach.</p>
            <form onSubmit={submit}>
              <label htmlFor="espace-code" style={{ font: `600 13px ${FB}`, color: T.navy, display: "block", marginBottom: 8 }}>Votre code d'accès</label>
              <input id="espace-code" value={code} autoComplete="off" maxLength={6} placeholder="6 caractères"
                onChange={e => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")); setErr(""); }}
                style={{ width: "100%", height: 54, padding: "0 18px", borderRadius: RAD.md, border: `1.5px solid ${err ? T.errorDk : T.line}`, font: `700 21px ${FM}`, letterSpacing: ".25em", textAlign: "center", color: T.navy, background: T.bg }} />
              {err && <div role="alert" style={{ font: `500 13px ${FB}`, color: T.errorDk, marginTop: 8 }}>{err}</div>}
              <div style={{ marginTop: 16 }}><Btn kind="objective" full disabled={code.length < 6}>Ouvrir mon espace&nbsp;<Icon d={I.arrow} s={17} c="#fff" /></Btn></div>
            </form>
          </Card>
          <Card pad={28} topbar="coach" style={{ boxShadow: SH.sm, display: "flex", flexDirection: "column" }}>
            <div><Tag tone="primary">Coach</Tag></div>
            <h2 style={{ font: `800 21px ${FD}`, color: T.navy, margin: "12px 0 6px" }}>Je suis coach</h2>
            <p style={{ font: `400 14px/1.6 ${FB}`, color: T.body, margin: "0 0 18px", flex: 1 }}>Créez des parcours, transmettez les codes et relisez les prises que l'on vous envoie.</p>
            <div><Btn kind="secondary" onClick={() => go("#/coach")}>Accéder à l'espace coach&nbsp;<Icon d={I.arrow} s={17} c={T.primary} /></Btn></div>
          </Card>
        </div>
      </div>
    </main>
  );
}

/* ─── Pied de page (non collant) ─── */

function Footer({ setModal }) {
  const trust = [
    [I.lock, LOCAL_ONLY ? "Analyse sur votre appareil" : "Vidéo conservée sur votre appareil"],
    [I.send, "Envoi au coach seulement si vous le décidez"],
    [I.ban, "Sans note ni classement"],
    [I.shield, "Aucune émotion déduite"],
  ];
  const links = [["cgu", "Conditions d'utilisation"], ["rgpd", "Protection des données"], ["lifecycle", "Cycle de vie de la vidéo"]];
  const lk = { font: `500 12px ${FB}`, color: T.primary, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: 2 };
  return (
    <footer className="noprint" style={{ borderTop: `1px solid ${T.line}`, background: "#fff", marginTop: sp(10) }}>
      <div className="rp-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <RepetLogo s={14} tagline={false} />
          <div style={{ width: 1, height: 26, background: T.line }} />
          <OrgLogo s={9} />
        </div>
        <div className="rp-trust" style={{ display: "flex", gap: 18, font: `500 12px ${FB}`, color: T.body, flexWrap: "wrap" }}>
          {trust.map(([ic, l]) => <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon d={ic} s={14} c={T.primary} /> {l}</span>)}
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${T.lineLt}` }}>
        <div className="rp-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 24px 16px", display: "flex", justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap", gap: 18 }}>
          <a href="#/fonctionnement" style={{ ...lk, display: "inline-block" }}>Fonctionnement</a>
          {links.map(([k, l]) => <button key={k} onClick={() => setModal(k)} style={lk}>{l}</button>)}
        </div>
      </div>
    </footer>
  );
}
