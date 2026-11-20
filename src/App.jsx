import React, { useEffect, useRef, useState } from "react";
import { T, FD, FB, FM, RAD, SH, sp, RepetLogo, OrgLogo, Tag, Btn, Card, Icon, I, GStyle } from "./ui.jsx";
import { SiteStyle, ScrollProgress, SI, TT, TY, W } from "./site.jsx";
import { dismissLoader } from "./Loader.jsx";
import { LegalModal } from "./legal.jsx";
import Home from "./Home.jsx";
import Solutions from "./Solutions.jsx";
import About from "./About.jsx";
import Resources from "./Resources.jsx";
import Demo from "./Demo.jsx";
import Beneficiary from "./Beneficiary.jsx";
import Counselor from "./Counselor.jsx";
import { useStore, getState, setLastSpace, logoutCounselor, findParcours, TRIAL_CODE } from "./lib/store.js";

/* La Répét' : coach IA d'entraînement à l'entretien.
   Routes (dans l'ancre de l'adresse, pour que le bouton Retour du navigateur fonctionne) :
     #/                         accueil
     #/a-propos(/faq)           à propos (et sa FAQ)
     #/solutions(/public)       solutions par public : beneficiaires, coachs, organismes
     #/fonctionnement           ancienne adresse, redirigée vers #/solutions
     #/ressources               centre de ressources (catégories, articles mis en avant, recherche)
     #/ressources/c/CATEGORIE   liste des ressources d'une catégorie
     #/ressources/SLUG          article
     #/demo                     demande de démonstration
     #/espace                   choix de l'espace (code bénéficiaire ou coach)
     #/s/CODE                   espace bénéficiaire
     #/beneficiaire             saisie du code
     #/coach                    espace coach (connexion simulée, identifiants pré-remplis) */

function routeFromHash() {
  const h = location.hash;
  const m = h.match(/^#\/s\/([A-Za-z0-9]{6})/);
  if (m) return { role: "benef", code: m[1].toUpperCase() };
  if (h === "#/beneficiaire") return { role: "benef", code: null };
  if (h === "#/coach") return { role: "coach" };
  if (h === "#/fonctionnement") { history.replaceState(null, "", "#/solutions"); return { role: "solutions" }; }
  let r = h.match(/^#\/solutions(?:\/([a-z-]+))?$/);
  if (r) return { role: "solutions", section: r[1] };
  r = h.match(/^#\/a-propos(?:\/([a-z-]+))?$/);
  if (r) return { role: "about", section: r[1] };
  r = h.match(/^#\/ressources\/c\/([a-z0-9-]+)$/);
  if (r) return { role: "resources", cat: r[1] };
  r = h.match(/^#\/ressources(?:\/([a-z0-9-]+))?$/);
  if (r) return { role: "resources", slug: r[1] };
  if (h === "#/demo") return { role: "demo" };
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

const PUBLIC = ["home", "about", "solutions", "resources", "demo"];

export default function App() {
  const s = useStore();
  const [route, setRoute] = useState(routeFromHash);
  const [modal, setModal] = useState(null); // "lifecycle" | "cgu" | "rgpd" | "emotion" | null

  useEffect(() => {
    dismissLoader();
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
    <div className="rp-app" style={{ background: T.bg, fontFamily: FB, color: T.navy, display: "flex", flexDirection: "column" }}>
      <GStyle />
      <SiteStyle />
      <Nav route={route} s={s} />
      <div style={{ flex: 1 }}>
        {route.role === "home" && <Home go={go} openSpace={openSpace} />}
        {route.role === "about" && <About go={go} openSpace={openSpace} section={route.section} />}
        {route.role === "solutions" && <Solutions go={go} openSpace={openSpace} section={route.section} />}
        {route.role === "resources" && <Resources go={go} openSpace={openSpace} slug={route.slug} cat={route.cat} />}
        {route.role === "demo" && <Demo go={go} />}
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
const LINKS = [["#/a-propos", "À propos", "about"], ["#/solutions", "Solutions", "solutions"], ["#/ressources", "Ressources", "resources"]];

function Nav({ route, s }) {
  const inSpace = route.role === "benef" || route.role === "coach";
  const isPublic = PUBLIC.includes(route.role);
  const p = route.role === "benef" ? s.parcours[s.lastSpace?.code] : null;
  const label = route.role === "coach" ? "Espace coach" : p ? `Espace de ${p.prenom}` : "Espace bénéficiaire";
  const [menu, setMenu] = useState(false);
  const burger = useRef(null), panel = useRef(null);

  useEffect(() => { setMenu(false); }, [route]);
  useEffect(() => {
    if (!menu) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector("a,button")?.focus();
    const key = e => {
      if (e.key === "Escape") { setMenu(false); burger.current?.focus(); }
      if (e.key === "Tab" && panel.current) { // focus retenu dans le panneau et le bouton menu
        const f = [burger.current, ...panel.current.querySelectorAll("a,button")];
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    };
    const close = () => { if (window.innerWidth > 1023) setMenu(false); };
    document.addEventListener("keydown", key);
    window.addEventListener("resize", close);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", key); window.removeEventListener("resize", close); };
  }, [menu]);

  return (
    <header className="noprint" style={{ position: "sticky", top: 0, zIndex: 50, background: menu ? T.bg : "rgba(248,250,252,.9)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderBottom: `1px solid ${T.line}` }}>
      <div className="rp-nav" style={{ maxWidth: W.page, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, minWidth: 0 }}>
          <a href="#/" onClick={e => { e.preventDefault(); go("#/"); }} aria-label="La Répét', accueil" style={{ display: "flex", flexShrink: 0 }}>
            <RepetLogo s={17} tagline={false} />
          </a>
          <div className="rp-hide-m" style={{ width: 1, height: 32, background: T.line }} />
          <span className="rp-hide-m"><OrgLogo s={10} /></span>
          <nav aria-label="Navigation principale" className="rs-links" style={{ display: "flex", alignItems: "center", gap: 24, marginLeft: 12 }}>
            {LINKS.map(([h, l, r]) => (
              <a key={h} href={h} className={`navlink ${route.role === r ? "on" : ""}`} aria-current={route.role === r ? "page" : undefined}>{l}</a>
            ))}
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {inSpace ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.surface, border: `1px solid ${T.line}`, borderRadius: RAD.pill, padding: "4px 4px 4px 12px", boxShadow: SH.xs }}>
              <Icon d={I.user} s={16} c={T.primary} />
              <span style={{ ...TY.label, color: T.navy, whiteSpace: "nowrap", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
              <button onClick={() => logout(route.role)} aria-label="Se déconnecter" title="Se déconnecter"
                style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: TT.primaryBg, display: "grid", placeItems: "center", cursor: "pointer" }}>
                <Icon d={I.logout} s={16} c={T.primary} />
              </button>
            </div>
          ) : (<>
            <span className="rs-demo"><Btn kind="secondary" size="sm" onClick={() => go("#/demo")}>Demander une démo</Btn></span>
            <Btn kind="primary" size="sm" onClick={openSpace}><span className="rp-hide-m" style={{ display: "inline-flex" }}><Icon d={I.user} s={16} c={T.surface} /></span>Mon espace</Btn>
            <button ref={burger} type="button" className="rs-burger rs-icbtn" aria-expanded={menu} aria-controls="rs-menu" aria-label={menu ? "Fermer le menu" : "Ouvrir le menu"} onClick={() => setMenu(m => !m)}>
              <Icon d={menu ? I.close : SI.menu} s={20} />
            </button>
          </>)}
        </div>
      </div>
      {isPublic && <ScrollProgress />}
      {menu && (
        <div id="rs-menu" ref={panel} className="rs-menu" role="dialog" aria-modal="true" aria-label="Menu">
          <nav aria-label="Navigation principale" onClick={() => setMenu(false)}>
            <a href="#/" className="rs-mlink" aria-current={route.role === "home" ? "page" : undefined}>Accueil<Icon d={SI.chevronR} s={20} c={T.faint} /></a>
            {LINKS.map(([h, l, r]) => (
              <a key={h} href={h} className="rs-mlink" aria-current={route.role === r ? "page" : undefined}>{l}<Icon d={SI.chevronR} s={20} c={T.faint} /></a>
            ))}
          </nav>
          <div style={{ display: "grid", gap: 12, marginTop: 24 }}>
            <Btn kind="secondary" full onClick={() => { setMenu(false); go("#/demo"); }}>Demander une démo</Btn>
          </div>
          <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ ...TY.caption, color: T.muted }}>Déployé par</span><OrgLogo s={9} />
          </div>
        </div>
      )}
    </header>
  );
}

/* Déconnexion : le coach se déconnecte ; le bénéficiaire quitte son espace sur cet appareil
   (ses données restent enregistrées, il y revient avec son code). */
function logout(role) {
  if (role === "coach") logoutCounselor();
  setLastSpace(null);
  go("#/");
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
            <p style={{ font: `400 14px/1.6 ${FB}`, color: T.body, margin: "0 0 18px", flex: 1 }}>Créez des parcours, transmettez les codes et relisez les entretiens que l'on vous envoie.</p>
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
    [I.lock, "La vidéo reste sur votre appareil", TT.successDk],
    [I.send, "Envoi au coach seulement si vous le décidez", T.blue],
    [I.ban, "Sans note ni classement", T.violet],
    [I.shield, "Aucune émotion déduite", T.accent],
  ];
  const pages = [["#/a-propos", "À propos"], ["#/solutions", "Solutions"], ["#/ressources", "Ressources"], ["#/a-propos/faq", "FAQ"], ["#/demo", "Demander une démo"]];
  const links = [["cgu", "Conditions d'utilisation"], ["rgpd", "Protection des données"], ["lifecycle", "Cycle de vie de la vidéo"]];
  const lk = { ...TY.caption, fontWeight: 600, color: T.primary, background: "none", border: "none", cursor: "pointer", padding: "12px 0", textDecoration: "underline", textUnderlineOffset: 3 };
  return (
    <footer className="noprint" style={{ borderTop: `1px solid ${T.line}`, background: T.surface, marginTop: sp(10) }}>
      <div className="rp-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: "24px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <RepetLogo s={14} tagline={false} />
          <div style={{ width: 1, height: 24, background: T.line }} />
          <OrgLogo s={9} />
        </div>
        <div className="rp-trust" style={{ display: "flex", gap: 20, ...TY.caption, color: T.body, flexWrap: "wrap" }}>
          {trust.map(([ic, l, c]) => <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Icon d={ic} s={16} c={c} /> {l}</span>)}
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${T.lineLt}` }}>
        <div className="rp-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: "4px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", columnGap: 24 }}>
          <nav aria-label="Pages du site" style={{ display: "flex", flexWrap: "wrap", columnGap: 20 }}>
            {pages.map(([h, l]) => <a key={h} href={h} style={{ ...lk, display: "inline-block" }}>{l}</a>)}
          </nav>
          <div style={{ display: "flex", flexWrap: "wrap", columnGap: 20 }}>
            {links.map(([k, l]) => <button key={k} onClick={() => setModal(k)} style={lk}>{l}</button>)}
          </div>
        </div>
      </div>
    </footer>
  );
}
