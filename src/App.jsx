import React, { useEffect, useRef, useState } from "react";
import { T, RAD, SH, GAP, W, Z, TY, HEADER_H, RepetLogo, OrgLogo, Tag, Btn, IconBtn, Link, Card, Field, Input, Txt, Icon, I, GStyle, ScrollProgress } from "./ui.jsx";
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
    <div className="rp-app" style={{ background: T.bg, ...TY.body, color: T.navy, display: "flex", flexDirection: "column" }}>
      <GStyle />
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

  return (<>
    <header className="noprint" style={{ position: "sticky", top: 0, zIndex: Z.nav, background: menu ? T.bg : T.glass, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderBottom: `1px solid ${T.line}` }}>
      <div className="rp-nav" style={{ maxWidth: W.page, margin: "0 auto", padding: "0 24px", height: HEADER_H, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
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
              <IconBtn icon={I.logout} label="Se déconnecter" size={16} onClick={() => logout(route.role)} style={{ width: 40, height: 40, background: T.primaryBg }} />
            </div>
          ) : (<>
            <span className="rs-demo"><Btn kind="secondary" size="sm" onClick={() => go("#/demo")}>Demander une démo</Btn></span>
            <Btn kind="primary" size="sm" onClick={openSpace}><span className="rp-hide-m" style={{ display: "inline-flex" }}><Icon d={I.user} s={16} /></span>Mon espace</Btn>
            <IconBtn ref={burger} variant="outline" className="rs-burger" aria-expanded={menu} aria-controls="rs-menu" label={menu ? "Fermer le menu" : "Ouvrir le menu"} icon={menu ? I.close : I.menu} onClick={() => setMenu(m => !m)} />
          </>)}
        </div>
      </div>
      {isPublic && <ScrollProgress />}
    </header>
      {menu && (
        <div id="rs-menu" ref={panel} className="rs-menu" role="dialog" aria-modal="true" aria-label="Menu">
          <nav aria-label="Navigation principale" onClick={() => setMenu(false)}>
            <a href="#/" className="rs-mlink" aria-current={route.role === "home" ? "page" : undefined}>Accueil<Icon d={I.chevronR} s={20} c={T.faint} /></a>
            {LINKS.map(([h, l, r]) => (
              <a key={h} href={h} className="rs-mlink" aria-current={route.role === r ? "page" : undefined}>{l}<Icon d={I.chevronR} s={20} c={T.faint} /></a>
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
  </>);
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
    <main className="rp-page" style={{ maxWidth: W.read, margin: "0 auto", padding: "40px 24px 64px" }}>
      <div className="up" style={{ display: "grid", gap: GAP.block }}>
        <div style={{ display: "grid", gap: 8 }}>
          <Txt v="h1" as="h1" color={T.navy}>Mon espace</Txt>
          <Txt v="bodyLg" color={T.body}>Choisissez votre accès.</Txt>
        </div>
        <div className="rp-stack" style={{ alignItems: "stretch" }}>
          <Card pad="lg" level={2} topbar style={{ display: "grid", gap: 12, alignContent: "start" }}>
            <div><Tag tone="appui">Bénéficiaire</Tag></div>
            <Txt v="h2" as="h2" color={T.navy}>J'ai un code d'entraînement</Txt>
            <Txt v="body" color={T.body}>Saisissez le code de 6 caractères remis par votre coach.</Txt>
            <form onSubmit={submit} style={{ display: "grid", gap: GAP.grid, marginTop: 8 }}>
              <Field id="espace-code" label="Votre code d'accès" error={err}>
                <Input id="espace-code" variant="code" error={err} value={code} autoComplete="off" maxLength={6} placeholder="6 caractères"
                  onChange={e => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")); setErr(""); }} />
              </Field>
              <Btn kind="objective" full disabled={code.length < 6} iconRight={I.arrow}>Ouvrir mon espace</Btn>
            </form>
          </Card>
          <Card pad="lg" topbar="coach" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div><Tag tone="primary">Coach</Tag></div>
            <Txt v="h2" as="h2" color={T.navy}>Je suis coach</Txt>
            <Txt v="body" color={T.body} style={{ flex: 1 }}>Créez des parcours, transmettez les codes et relisez les entretiens que l'on vous envoie.</Txt>
            <div style={{ marginTop: 8 }}><Btn kind="secondary" onClick={() => go("#/coach")} iconRight={I.arrow}>Accéder à l'espace coach</Btn></div>
          </Card>
        </div>
      </div>
    </main>
  );
}

/* ─── Pied de page (non collant) ─── */

function Footer({ setModal }) {
  const trust = [
    [I.lock, "La vidéo reste sur votre appareil", T.successDk],
    [I.send, "Envoi au coach seulement si vous le décidez", T.blue],
    [I.ban, "Sans note ni classement", T.violet],
    [I.shield, "Aucune émotion déduite", T.accent],
  ];
  const links = [["cgu", "Conditions d'utilisation"], ["rgpd", "Protection des données"], ["lifecycle", "Cycle de vie de la vidéo"]];
  const lk = { ...TY.caption, ...TY.link, minHeight: 44, display: "inline-flex", alignItems: "center" };
  return (
    <footer className="noprint" style={{ borderTop: `1px solid ${T.line}`, background: T.surface, marginTop: GAP.section / 2 }}>
      <div className="rp-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: "24px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <RepetLogo s={14} tagline={false} />
          <div style={{ width: 1, height: 24, background: T.line }} />
          <OrgLogo s={9} />
        </div>
        {/* Exception documentée (référentiel 1.5) : chaque engagement garde sa couleur d'icône. */}
        <div className="rp-trust" style={{ display: "flex", gap: 20, ...TY.caption, color: T.body, flexWrap: "wrap" }}>
          {trust.map(([ic, l, c]) => <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Icon d={ic} s={16} c={c} /> {l}</span>)}
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${T.lineLt}` }}>
        <div className="rp-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: "4px 24px", display: "flex", justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap", columnGap: 20 }}>
          <Link href="#/a-propos/faq" style={lk}>FAQ</Link>
          {links.map(([k, l]) => <Link key={k} onClick={() => setModal(k)} style={lk}>{l}</Link>)}
        </div>
      </div>
    </footer>
  );
}
