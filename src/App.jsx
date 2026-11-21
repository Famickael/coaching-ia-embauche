import React, { useEffect, useRef, useState } from "react";
import { flushSync, createPortal } from "react-dom";
import { T, RAD, SH, GAP, W, Z, TY, PAD, HEADER_H, PageHero, BrandLoader, RepetLogo, Tag, Btn, Bare, IconBtn, Link, Card, Field, Input, Txt, Icon, I, Notice, Modal, GStyle, ScrollProgress, lockScroll } from "./ui.jsx";
import { dismissLoader } from "./Loader.jsx";
import LegalPage, { LegalModal } from "./Legal.jsx";
import { PAGES, PHRASES } from "./content/legal.js";
import Home from "./Home.jsx";
import Solutions from "./Solutions.jsx";
import About from "./About.jsx";
import Resources from "./Resources.jsx";
import Demo from "./Demo.jsx";
import Research from "./Research.jsx";
import { CATEGORIES } from "./content/resources.js";
import Beneficiary from "./Beneficiary.jsx";
import Counselor from "./Counselor.jsx";
import A11yLayer, { openA11y } from "./A11y.jsx";
import { closeAssistant } from "./Assistant.jsx";
import { useStore, getState, setLastSpace, setCounselor, logoutCounselor, findParcours, withdrawConsent, getStorageError, TRIAL_CODE, TRIAL_LOGIN } from "./lib/store.js";

/* La Répét' : entraînement à l'entretien d'embauche, avec un assistant IA et votre coach.
   Routes (dans l'ancre de l'adresse, pour que le bouton Retour du navigateur fonctionne) :
     #/                         accueil
     #/a-propos(/faq)           à propos (et sa FAQ)
     #/solutions(/public)       solutions par public : beneficiaires, coachs, organismes
     #/fonctionnement           ancienne adresse, redirigée vers #/solutions
     #/ressources               centre de ressources (catégories, articles mis en avant, recherche)
     #/ressources/c/CATEGORIE   liste des ressources d'une catégorie
     #/ressources/SLUG          article
     #/demo                     demande de prise en main accompagnée
     #/espace                   « Mon espace » : code d'accès ou connexion coach
     #/s/CODE                   espace bénéficiaire
     #/beneficiaire             saisie du code
     #/coach                    espace coach (sans connexion : « Mon espace »)
     #/vos-donnees(/video|assistant|droits|appareil|notice|coachs)   information sur les données
     #/conditions, #/mentions-legales, #/accessibilite                pages légales */

function routeFromHash() {
  const h = location.hash;
  const m = h.match(/^#\/s\/([A-Za-z0-9]{6})$/);
  if (m) return { role: "benef", code: m[1].toUpperCase() };
  if (h === "#/beneficiaire") return { role: "benef", code: null };
  if (h === "#/coach") return { role: "coach" };
  if (h === "#/fonctionnement") { history.replaceState(null, "", "#/solutions"); return { role: "solutions" }; }
  let r = h.match(/^#\/solutions(?:\/([a-z-]+))?$/);
  if (r) return { role: "solutions", section: r[1] };
  r = h.match(/^#\/a-propos(?:\/([a-z-]+))?$/);
  if (r && r[1] === "ia-et-recherche") return { role: "research" };
  if (r) return { role: "about", section: r[1] };
  r = h.match(/^#\/ressources\/c\/([a-z0-9-]+)$/);
  if (r) return { role: "resources", cat: r[1] };
  r = h.match(/^#\/ressources(?:\/([a-z0-9-]+))?$/);
  if (r) return { role: "resources", slug: r[1] };
  r = h.match(/^#\/vos-donnees(?:\/([a-z-]+))?$/);
  if (r) return { role: "legal", page: PAGES[r[1]] && r[1] !== "hub" ? r[1] : "hub" };
  if (h === "#/conditions") return { role: "legal", page: "conditions" };
  if (h === "#/mentions-legales") return { role: "legal", page: "mentions" };
  if (h === "#/accessibilite") return { role: "legal", page: "accessibilite" };
  if (h === "#/demo") return { role: "demo" };
  if (h === "#/espace") return { role: "espace" };
  if (h === "" || h === "#" || h === "#/") return { role: "home" };
  return { role: "notfound" }; // ancre inconnue (BUG-16)
}

/* Titre du document à chaque route (RGAA 8.6). */
const TITLES = { notfound: "Page introuvable", research: "L'IA et la recherche", home: "S'entraîner à l'entretien d'embauche", about: "À propos", solutions: "Solutions", resources: "Ressources", demo: "Demander une prise en main", espace: "Mon espace", benef: "Mon espace", coach: "Espace coach" };
const titleOf = (route, counselor) => route.role === "legal" ? PAGES[route.page].title : route.role === "coach" && !counselor ? TITLES.espace : TITLES[route.role] || TITLES.home;

const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduce";
const go = hash => { if (location.hash === hash) window.scrollTo({ top: 0 }); else location.hash = hash; };

/* « Mon espace » : rouvre le dernier espace utilisé sur cet appareil, sinon propose le choix. */
function openSpace() {
  const ls = getState().lastSpace;
  if (ls?.role === "coach" && getState().counselor) return go("#/coach");
  if (ls?.role === "benef" && getState().parcours[ls.code]) return go(`#/s/${ls.code}`);
  go("#/espace");
}

const PUBLIC = ["notfound", "home", "research", "about", "solutions", "resources", "demo", "legal"];

export default function App() {
  const s = useStore();
  const [route, setRoute] = useState(routeFromHash);
  const [modal, setModal] = useState(null); // clé d'une fenêtre de résumé (src/Legal.jsx) ou null

  const routeRef = useRef(route); routeRef.current = route;
  const [enter, setEnter] = useState(0); // repli sans View Transitions : fondu d'entrée par remontage
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    dismissLoader();
    /* Changement de page : la page sortante s'efface, la page entrante apparaît (View Transitions si disponible,
       sinon fondu par état). Le retour en haut se fait pendant le fondu. Même section, autre ancre : défilement
       interne (useSectionScroll), pas de fondu. Mouvement réduit : changement direct. */
    const on = () => {
      const next = routeFromHash(), cur = routeRef.current;
      const inPage = next.role === cur.role && ["about", "solutions"].includes(next.role) && next.section !== cur.section && next.section !== "ia-et-recherche" && cur.section !== "ia-et-recherche";
      if (inPage) { setRoute(next); if (!next.section) window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" }); return; }
      const apply = () => { flushSync(() => setRoute(next)); window.scrollTo({ top: 0 }); };
      if (reducedMotion()) return apply();
      if (document.startViewTransition) {
        try { const vt = document.startViewTransition(apply); [vt.ready, vt.finished, vt.updateCallbackDone].forEach(pr => pr?.catch(() => {})); return; } catch { /* repli */ }
      }
      setLeaving(true);
      setTimeout(() => { apply(); setLeaving(false); setEnter(k => k + 1); }, 280);
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  useEffect(() => { if (route.role === "coach" && s.counselor) setLastSpace({ role: "coach" }); }, [route.role, s.counselor]);
  useEffect(() => { document.title = `${titleOf(route, s.counselor)} · La Répét'`; }, [route, s.counselor]);

  const onCode = code => {
    if (code) { setLastSpace({ role: "benef", code }); if (location.hash !== `#/s/${code}`) history.replaceState(null, "", `#/s/${code}`); }
    else if (getState().lastSpace?.role === "benef") { setLastSpace(null); history.replaceState(null, "", "#/beneficiaire"); }
  };

  return (
    <div className="rp-app" style={{ background: T.bg, ...TY.body, color: T.navy, display: "flex", flexDirection: "column" }}>
      <GStyle />
      <Nav route={route} s={s} />
      {/* Stockage plein ou indisponible (ARC-01) : jamais de perte silencieuse */}
      {getStorageError() && (
        <div className="noprint" style={{ maxWidth: W.page, margin: "16px auto 0", padding: "0 24px", width: "100%" }}>
          <Notice tone="error">Cet appareil ne peut plus enregistrer. Libérez de la place ou téléchargez vos réponses, puis réessayez.</Notice>
        </div>
      )}
      {/* Contenu et pied de page changent ensemble (un seul groupe de transition) : le pied ne passe jamais sur l'ancienne page */}
      <div key={enter} className={`rp-view${leaving ? " rp-leave" : ""}${enter ? " rp-enter" : ""}`} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1 }}>
        {route.role === "home" && <Home go={go} openSpace={openSpace} />}
        {route.role === "notfound" && <NotFound />}
        {route.role === "research" && <Research go={go} openSpace={openSpace} />}
        {route.role === "about" && <About go={go} openSpace={openSpace} section={route.section} />}
        {route.role === "solutions" && <Solutions go={go} openSpace={openSpace} section={route.section} />}
        {route.role === "resources" && <Resources go={go} openSpace={openSpace} slug={route.slug} cat={route.cat} />}
        {route.role === "demo" && <Demo go={go} />}
        {route.role === "legal" && <LegalPage key={route.page} page={route.page} />}
        {(route.role === "espace" || (route.role === "coach" && !s.counselor)) && <Espace />}
        {route.role === "benef" && <Beneficiary key={route.code || "nocode"} initialCode={route.code} setModal={setModal} onCode={onCode} />}
        {route.role === "coach" && s.counselor && <Counselor />}
        </div>
        <Footer />
      </div>
      <LegalModal modal={modal} close={() => setModal(null)} />
      <A11yLayer />
      <ToTop lift={route.role === "benef" || (route.role === "coach" && !!s.counselor)} />
    </div>
  );
}

/* ─── En-tête ─── */
/* Boutons de l'en-tête : aucun déplacement au survol (rien ne bouge dans la barre). */
const STILL = { transform: "none" };
const LINKS = [["#/a-propos", "À propos", "about"], ["#/solutions", "Solutions", "solutions"], ["#/ressources", "Ressources", "resources"]];
/* Sous-menus (deuxième niveau) : le clic sur l'intitulé mène toujours à la page principale. */
const SUBS = {
  about: [["#/a-propos", "Notre démarche"], ["#/a-propos/ia-et-recherche", "L'IA et la recherche"], ["#/a-propos/faq", "Questions fréquentes"]],
  solutions: [["#/solutions/beneficiaires", "Personnes accompagnées"], ["#/solutions/coachs", "Coachs"], ["#/solutions/organismes", "Organismes"]],
  resources: CATEGORIES.map(c => [`#/ressources/c/${c.id}`, c.title]),
};
const activeOf = role => (role === "research" ? "about" : role);
const DATA_LINKS = [["#/vos-donnees", "Vos données"], ["#/vos-donnees/video", "Que devient ma vidéo ?"], ["#/mentions-legales", "Mentions légales"], ["#/accessibilite", "Accessibilité : non conforme"]];

function Nav({ route, s }) {
  /* Session : coach connecté, ou dernier espace bénéficiaire ouvert, tant qu'on ne s'est pas déconnecté.
     Elle ne dépend pas de la route : sur toutes les pages, l'en-tête garde « Mon compte ». */
  const ls = s.lastSpace;
  const session = ls?.role === "coach" && s.counselor ? { role: "coach" } : ls?.role === "benef" && s.parcours[ls.code] ? { role: "benef", code: ls.code } : null;
  const here = (route.role === "benef" && route.code && s.parcours[route.code]) ? { role: "benef", code: route.code } : (route.role === "coach" && s.counselor) ? { role: "coach" } : null;
  const spaceRoute = here || session;
  const inSpace = !!spaceRoute;
  const isPublic = PUBLIC.includes(route.role);
  const [menu, setMenu] = useState(false);
  const burger = useRef(null), panel = useRef(null);

  useEffect(() => { setMenu(false); }, [route]);
  useEffect(() => {
    if (!menu) return;
    const unlock = lockScroll();
    /* Fond inerte (A11Y-16) : la page et le pied de page ne reçoivent ni clic ni focus tant que le menu est ouvert */
    const view = document.querySelector(".rp-view");
    if (view) view.inert = true;
    document.documentElement.classList.add("rp-menu-open");
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
    const close = () => { if (burger.current && getComputedStyle(burger.current).display === "none") setMenu(false); };
    document.addEventListener("keydown", key);
    window.addEventListener("resize", close);
    return () => { unlock(); if (view) view.inert = false; document.documentElement.classList.remove("rp-menu-open"); document.removeEventListener("keydown", key); window.removeEventListener("resize", close); };
  }, [menu]);

  return (<>
    <header className="noprint rp-header" style={{ position: "sticky", top: 0, zIndex: Z.nav, background: menu ? T.bg : T.glass, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderBottom: `1px solid ${T.line}` }}>
      <div className="rp-nav" style={{ maxWidth: W.page, margin: "0 auto", padding: "0 24px", height: HEADER_H, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, minWidth: 0 }}>
          <a href="#/" onClick={e => { e.preventDefault(); go("#/"); }} aria-label="La Répét', accueil" className="rp-head-logo" style={{ display: "flex", alignItems: "center", minHeight: 44, flexShrink: 0 }}>
            <RepetLogo s={17} tagline={false} />
          </a>
          <nav aria-label="Navigation principale" className="rs-links" style={{ display: "flex", alignItems: "center", gap: 24, marginLeft: 12 }}>
            {LINKS.map(([h, l, r]) => <NavItem key={h} href={h} label={l} id={r} on={activeOf(route.role) === r} />)}
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {inSpace ? (<>
            <IconBtn icon={I.a11y} label="Options d'accessibilité" className="rp-head-a11y" onClick={openA11y} />
            <AccountMenu route={spaceRoute} s={s} />
            {isPublic && <IconBtn ref={burger} variant="outline" className="rs-burger" aria-expanded={menu} aria-controls="rs-menu" label={menu ? "Fermer le menu" : "Ouvrir le menu"} icon={menu ? I.close : I.menu} onClick={() => setMenu(m => !m)} />}
          </>) : (<>
            <span className="rs-demo"><Btn kind="secondary" size="sm" style={STILL} onClick={() => go("#/demo")}>Demander une prise en main</Btn></span>
            <IconBtn icon={I.a11y} label="Options d'accessibilité" className="rp-head-a11y" onClick={openA11y} />
            <Btn kind="primary" size="sm" style={STILL} onClick={openSpace}><span className="rp-hide-m" style={{ display: "inline-flex" }}><Icon d={I.user} s={16} /></span>Mon compte</Btn>
            <IconBtn ref={burger} variant="outline" className="rs-burger" aria-expanded={menu} aria-controls="rs-menu" label={menu ? "Fermer le menu" : "Ouvrir le menu"} icon={menu ? I.close : I.menu} onClick={() => setMenu(m => !m)} />
          </>)}
        </div>
      </div>
      {isPublic && <ScrollProgress />}
    </header>
      {menu && (
        <div id="rs-menu" ref={panel} className="rs-menu" role="dialog" aria-modal="true" aria-label="Menu">
          <nav aria-label="Menu principal" onClick={() => setMenu(false)}>
            <a href="#/" className="rs-mlink" aria-current={route.role === "home" ? "page" : undefined}>Accueil<Icon d={I.chevronR} s={20} c={T.faint} /></a>
            {LINKS.map(([h, l, r]) => <MobileItem key={h} href={h} label={l} id={r} on={activeOf(route.role) === r} />)}
          </nav>
          <div style={{ display: "grid", gap: 12, marginTop: 24 }}>
            <Btn kind="secondary" full onClick={() => { setMenu(false); go("#/demo"); }}>Demander une prise en main</Btn>
            <Btn kind="ghost" full icon={I.a11y} onClick={() => { setMenu(false); openA11y(); }}>Options d'accessibilité</Btn>
          </div>
          <nav aria-label="Vos données" onClick={() => setMenu(false)} style={{ marginTop: 24, display: "grid", gap: 4 }}>
            <div style={{ ...TY.overline, color: T.muted }}>Vos données</div>
            {DATA_LINKS.map(([h, l]) => <Link key={h} href={h} style={{ minHeight: 44, display: "inline-flex", alignItems: "center" }}>{l}</Link>)}
          </nav>
        </div>
      )}
  </>);
}

/* « Mon compte » (session ouverte) : panneau latéral modal, plein écran sur mobile.
   En-tête du compte (prénom ou nom, rôle), puis les actions. Focus envoyé dans le panneau et retenu, Échap ferme,
   focus rendu au bouton, défilement de la page bloqué, page inerte. N'est jamais ouvert en même temps que
   l'assistant : l'ouvrir ferme l'assistant, et les boutons flottants sont retirés tant qu'il est ouvert. */
function AccountMenu({ route, s }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const btn = useRef(null), panel = useRef(null);
  const coach = route.role === "coach";
  const code = route.code;
  const p = !coach && code ? s.parcours[code] : null;
  const items = coach
    ? [["space", "Retour à mon espace", I.user], ["data", "Vos données", I.shield], ["a11y", "Options d'accessibilité", I.a11y], ["logout", "Se déconnecter", I.logout]]
    : [["space", "Retour à mon espace", I.user], ["data", "Vos données", I.shield], ["a11y", "Options d'accessibilité", I.a11y], ["code", "Changer de code", I.redo], ["withdraw", "Retirer mon accord", I.trash], ["logout", "Se déconnecter", I.logout]];
  const refocus = useRef(true);
  useEffect(() => {
    if (!open) return;
    closeAssistant();
    refocus.current = true;
    const unlock = lockScroll();
    const view = document.querySelector(".rp-view"); if (view) view.inert = true;
    document.documentElement.classList.add("rp-account-open");
    const focusables = () => [...(panel.current?.querySelectorAll("button:not([disabled]),a[href]") || [])];
    requestAnimationFrame(() => focusables()[1]?.focus()); // première action (après « Fermer »)
    const key = e => {
      if (e.key === "Escape") { e.stopPropagation(); setOpen(false); }
      if (e.key === "Tab") {
        const f = focusables(); if (!f.length) return;
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key); unlock(); if (view) view.inert = false;
      document.documentElement.classList.remove("rp-account-open");
      if (refocus.current) btn.current?.focus();
    };
  }, [open]);
  useEffect(() => { const c = () => setOpen(false); window.addEventListener("hashchange", c); return () => window.removeEventListener("hashchange", c); }, []);
  const act = k => {
    refocus.current = !["withdraw", "a11y", "space", "data", "code", "logout"].includes(k);
    setOpen(false);
    if (k === "a11y") openA11y();
    if (k === "space") go(coach ? "#/coach" : `#/s/${code}`);
    if (k === "data") go(coach ? "#/vos-donnees/coachs" : "#/vos-donnees");
    if (k === "code") { setLastSpace(null); go("#/beneficiaire"); }
    if (k === "withdraw") setConfirm(true);
    if (k === "logout") { if (coach) logoutCounselor(); setLastSpace(null); go("#/"); }
  };
  const who = coach ? s.counselor?.name || "Coach" : p?.prenom || "Mon espace";
  return (
    <>
      <Btn ref={btn} kind="secondary" size="sm" style={STILL} aria-haspopup="dialog" aria-expanded={open} aria-controls="rp-account" onClick={() => setOpen(true)}>
        <span className="rp-hide-m" style={{ display: "inline-flex" }}><Icon d={I.user} s={16} /></span>Mon compte
      </Btn>
      {open && createPortal(
        // design-lint-disable-next-line K4 -- voile du panneau « Mon compte » : fermeture au clic, comme le voile de Modal
        <div className="rp-account-ov noprint" onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div ref={panel} id="rp-account" role="dialog" aria-modal="true" aria-labelledby="rp-account-title" className="rp-account">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: "16px 16px 16px 24px", borderBottom: `1px solid ${T.line}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <span aria-hidden style={{ width: 40, height: 40, borderRadius: "50%", background: T.primaryBg, color: T.primary, display: "grid", placeItems: "center", flexShrink: 0, ...TY.h3 }}>{who.charAt(0).toUpperCase()}</span>
                <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
                  <h2 id="rp-account-title" style={{ ...TY.h3, color: T.navy, margin: 0 }}>Mon compte</h2>
                  <div style={{ ...TY.small, color: T.body }}>{who} · {coach ? "Espace coach" : "Espace d'entraînement"}</div>
                </div>
              </div>
              <IconBtn icon={I.close} label="Fermer" tone="muted" onClick={() => setOpen(false)} />
            </div>
            <nav aria-label="Mon compte" style={{ padding: 16, display: "grid", gap: 4, overflowY: "auto" }}>
              {items.map(([k, l, ic]) => (
                <Bare key={k} onClick={() => act(k)} className="rp-menuitem"
                  style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 48, padding: "0 12px", borderRadius: RAD.sm, ...TY.bodyStrong, color: k === "withdraw" ? T.errorDk : T.navy, textAlign: "left" }}>
                  <Icon d={ic} s={20} />{l}
                </Bare>
              ))}
            </nav>
          </div>
        </div>, document.body)}
      {confirm && (
        <Modal close={() => { setConfirm(false); btn.current?.focus(); }} title="Retirer mon accord et tout supprimer ?" footer={
          <div className="rp-actions" style={{ display: "flex", justifyContent: "flex-end", gap: GAP.actions, flexWrap: "wrap" }}>
            <Btn kind="secondary" onClick={() => { setConfirm(false); btn.current?.focus(); }}>Annuler</Btn>
            <Btn kind="danger" style={{ background: T.errorDk, color: T.surface }} icon={I.trash} onClick={async () => { await withdrawConsent(code); setConfirm(false); }}>Tout supprimer</Btn>
          </div>}>
          <div style={{ display: "grid", gap: 12 }}>
            <Txt v="bodyLg" color={T.body}>Si vous retirez votre accord, vos réponses et les rapports de votre coach sont effacés de cet appareil. C'est définitif.</Txt>
            <Txt v="body" color={T.body}>Vous pourrez recommencer quand vous voulez. Votre accompagnement continue normalement.</Txt>
          </div>
        </Modal>
      )}
    </>
  );
}

/* ─── « Mon espace » : code d'accès ou connexion coach (plus d'écran de connexion séparé) ─── */
function Espace() {
  const [code, setCode] = useState(TRIAL_CODE);
  const [err, setErr] = useState("");
  const [email, setEmail] = useState(TRIAL_LOGIN.email);
  const [pwd, setPwd] = useState(TRIAL_LOGIN.password);
  const [forgot, setForgot] = useState(false);
  const [busy, setBusy] = useState("");
  const ok = /.+@.+\..+/.test(email) && pwd.length >= 4;
  const WAIT = 700; // durée minimale courte du logo d'attente, pour ne pas clignoter
  const submit = e => {
    e.preventDefault();
    const p = findParcours(code);
    if (!p) return setErr("Ce code ne fonctionne pas. Vérifiez les 6 caractères, ou demandez-le à votre coach.");
    setBusy("Ouverture de votre espace…");
    setTimeout(() => go(`#/s/${p.code}`), WAIT);
  };
  const login = e => {
    e.preventDefault();
    if (!ok) return;
    setBusy("Connexion à votre espace…");
    setTimeout(() => { setCounselor(TRIAL_LOGIN.name); setLastSpace({ role: "coach" }); if (location.hash !== "#/coach") go("#/coach"); }, WAIT);
  };
  const card = { display: "flex", flexDirection: "column", gap: GAP.grid, height: "100%" };
  return (
    <main>
      {busy && <BrandLoader full label={busy} />}
      <PageHero eyebrow="Accès" title="Mon espace" lead="Vous vous entraînez, ou vous êtes coach ?" />
      <div className="rs-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: "48px 24px 0" }}>
        <div className="rp-stack rp-equal" style={{ alignItems: "stretch", maxWidth: W.wide }}>
          <Card pad="lg" level={2} topbar style={card}>
            <div style={{ display: "grid", gap: 12 }}>
              <div><Tag tone="primary">Je m'entraîne</Tag></div>
              <Txt v="h2" as="h2" color={T.navy}>J'ai un code d'accès</Txt>
            </div>
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: GAP.field, flex: 1 }}>
              <Field id="espace-code" label="Votre code d'accès" hint="Les 6 caractères que votre coach vous a donnés." error={err}>
                <Input id="espace-code" variant="code" hint error={err} value={code} autoComplete="off" maxLength={6} placeholder="6 caractères"
                  onChange={e => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")); setErr(""); }} />
              </Field>
              <div style={{ marginTop: "auto", display: "grid", gap: 12 }}>
                <Btn kind="objective" full disabled={code.length < 6} iconRight={I.arrow}>Ouvrir mon espace</Btn>
                <Txt v="caption" color={T.muted}>{PHRASES.code}</Txt>
              </div>
            </form>
          </Card>
          <Card pad="lg" level={2} topbar="coach" style={card}>
            <div style={{ display: "grid", gap: 12 }}>
              <div><Tag tone="primary">Coach</Tag></div>
              <Txt v="h2" as="h2" color={T.navy}>J'ai un compte</Txt>
            </div>
            <form onSubmit={login} style={{ display: "flex", flexDirection: "column", gap: GAP.field, flex: 1 }}>
              <Field id="login-email" label="Adresse électronique professionnelle">
                <Input id="login-email" type="email" inputMode="email" autoCapitalize="none" autoCorrect="off" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} />
              </Field>
              <div style={{ display: "grid", gap: 4 }}>
                <Field id="login-pwd" label="Mot de passe">
                  <Input id="login-pwd" type="password" autoComplete="current-password" value={pwd} onChange={e => setPwd(e.target.value)} />
                </Field>
                <div style={{ textAlign: "right" }}>
                  <Link onClick={() => setForgot(true)} style={{ ...TY.small, ...TY.link, minHeight: 44 }}>Mot de passe oublié ?</Link>
                </div>
                {forgot && <Notice tone="info" role="status">Contactez votre référent pour réinitialiser votre mot de passe.</Notice>}
              </div>
              <div style={{ marginTop: "auto", display: "grid", gap: 12 }}>
                <Btn kind="objective" full disabled={!ok}>Se connecter</Btn>
                <Txt v="caption" color={T.muted}>{PHRASES.coachLogin} <Link href="#/vos-donnees/coachs">Coachs : vos données</Link></Txt>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </main>
  );
}

/* ─── Ancre inconnue (BUG-16) ─── */
function NotFound() {
  return (
    <main>
      <PageHero eyebrow="Page introuvable" title="Cette page n'existe pas" lead="L'adresse est peut-être incomplète, ou la page a changé de place." />
      <div className="rs-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: "32px 24px 0", display: "flex", gap: GAP.actions, flexWrap: "wrap" }}>
        <Btn kind="primary" onClick={() => go("#/")}>Revenir à l'accueil</Btn>
        <Btn kind="secondary" onClick={openSpace}>Mon espace</Btn>
      </div>
    </main>
  );
}

/* ─── Pied de page (non collant) ─── */

function Footer() {
  /* Exception documentée (référentiel 1.5) : chaque engagement garde sa couleur d'icône. */
  const trust = [
    [I.lock, "Votre vidéo reste sur votre appareil", T.successDk, "#/vos-donnees/video"],
    [I.send, "Votre coach voit seulement ce que vous lui envoyez", T.blue, "#/vos-donnees/video"],
    [I.ban, "Ni note ni classement", T.violet, "#/vos-donnees/assistant"],
    [I.shield, "Aucune émotion devinée", T.accent, "#/vos-donnees/assistant"],
  ];
  const groups = [
    ["Vos données", [["#/vos-donnees", "Vos données"], ["#/vos-donnees/video", "Que devient ma vidéo ?"], ["#/vos-donnees/assistant", "L'assistant et l'IA"], ["#/vos-donnees/droits", "Vos droits"]]],
    ["Le site", [["#/a-propos", "À propos"], ["#/solutions", "Solutions"], ["#/ressources", "Ressources"], ["#/a-propos/faq", "Questions fréquentes"], ["#/demo", "Demander une prise en main"]]],
    ["Informations légales", [["#/conditions", "Conditions d'utilisation"], ["#/mentions-legales", "Mentions légales"], ["#/accessibilite", "Accessibilité : non conforme"]]],
  ];
  const lk = { ...TY.caption, ...TY.link, minHeight: 44, display: "inline-flex", alignItems: "center" };
  return (
    <footer className="noprint" style={{ position: "relative", zIndex: 1, borderTop: `1px solid ${T.line}`, background: T.surface, marginTop: GAP.section / 2 }}>
      <div className="rp-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: "24px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
        <div style={{ display: "grid", gap: 12, maxWidth: 360 }}>
          <RepetLogo s={14} tagline={false} />
          <p style={{ ...TY.caption, color: T.body, margin: 0 }}>La Répét' aide à préparer l'entretien d'embauche. On répète à voix haute, l'assistant décrit sans noter, votre coach vous accompagne.</p>
        </div>
        <ul className="rp-trust" style={{ display: "flex", gap: 20, ...TY.caption, color: T.body, flexWrap: "wrap", listStyle: "none", margin: 0, padding: 0 }}>
          {trust.map(([ic, l, c, h]) => <li key={l}><a href={h} className="rp-trustlink" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: T.body, textDecoration: "none", minHeight: 44 }}><Icon d={ic} s={16} c={c} /> {l}</a></li>)}
        </ul>
      </div>
      <div style={{ borderTop: `1px solid ${T.lineLt}` }}>
        <div className="rp-pad rp-fgroups" style={{ maxWidth: W.page, margin: "0 auto", padding: "16px 24px 24px", display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 24 }}>
          {groups.map(([t, links]) => (
            <nav key={t} aria-label={t}>
              <h2 style={{ ...TY.overline, color: T.muted, margin: "0 0 4px" }}>{t}</h2>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {links.map(([h, l]) => <li key={h}><Link href={h} style={lk}>{l}</Link></li>)}
              </ul>
            </nav>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* « Revenir en haut » : apparaît après un défilement, remonte en douceur (saut direct en mouvement réduit),
   puis place le focus sur le titre de la page. Empilé au-dessus du bouton de l'assistant dans l'espace. */
function ToTop({ lift }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let raf = 0;
    const on = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; setShow(window.scrollY > 600); }); };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, []);
  if (!show) return null;
  const up = () => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduce";
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    const h = document.querySelector("main h1");
    if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
  };
  return <IconBtn icon={I.arrowUp} label="Revenir en haut" variant="outline" className="rp-totop noprint" onClick={up} style={{ bottom: lift ? 88 : 16 }} />;
}

/* Entrée de navigation à deux niveaux : lien vers la page principale + bouton qui ouvre le sous-menu
   (survol avec petit délai de fermeture, clic, clavier : Entrée, Espace, flèches, Échap). */
function NavItem({ href, label, id, on }) {
  const [open, setOpen] = useState(false);
  const t = useRef(0), btn = useRef(null), list = useRef(null);
  const items = SUBS[id] || [];
  const hoverAt = useRef(0);
  const show = () => { clearTimeout(t.current); hoverAt.current = Date.now(); setOpen(true); };
  const hide = (delay = 250) => { clearTimeout(t.current); t.current = setTimeout(() => setOpen(false), delay); };
  useEffect(() => () => clearTimeout(t.current), []);
  useEffect(() => { const c = () => setOpen(false); window.addEventListener("hashchange", c); return () => window.removeEventListener("hashchange", c); }, []);
  const links = () => [...(list.current?.querySelectorAll("a") || [])];
  const onKey = e => {
    const ls = links(), i = ls.indexOf(document.activeElement);
    if (e.key === "Escape") { e.preventDefault(); setOpen(false); btn.current?.focus(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); if (!open) { setOpen(true); requestAnimationFrame(() => links()[0]?.focus()); } else ls[(i + 1) % ls.length]?.focus(); }
    else if (e.key === "ArrowUp" && open) { e.preventDefault(); ls[(i - 1 + ls.length) % ls.length]?.focus(); }
    else if (e.key === "Home" && open && i >= 0) { e.preventDefault(); ls[0]?.focus(); }
    else if (e.key === "End" && open && i >= 0) { e.preventDefault(); ls[ls.length - 1]?.focus(); }
  };
  return (
    <div className="rp-navitem" onPointerEnter={e => e.pointerType === "mouse" && show()} onPointerLeave={e => e.pointerType === "mouse" && hide()} onKeyDown={onKey}
      onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) hide(0); }}>
      <a href={href} className={`navlink ${on ? "on" : ""}`} aria-current={on ? "page" : undefined}>{label}</a>
      <Bare ref={btn} className="rp-subbtn" aria-expanded={open} aria-controls={`sub-${id}`} aria-label={`Sous-menu ${label}`} onClick={() => { const next = Date.now() - hoverAt.current < 600 ? true : !open; setOpen(next); if (next) requestAnimationFrame(() => links()[0]?.focus()); }}>
        <Icon d={I.chevron} s={16} />
      </Bare>
      <div ref={list} id={`sub-${id}`} className="rp-submenu" hidden={!open}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 2 }}>
          {items.map(([h, l]) => <li key={h}><a href={h} className="rp-subitem">{l}</a></li>)}
        </ul>
      </div>
    </div>
  );
}

/* Menu mobile : chaque entrée est un accordéon (page principale + sous-pages). */
function MobileItem({ href, label, id, on }) {
  const [open, setOpen] = useState(false);
  const items = SUBS[id] || [];
  return (
    <div style={{ borderBottom: `1px solid ${T.line}` }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <a href={href} className="rs-mlink" style={{ flex: 1, borderBottom: "none" }} aria-current={on ? "page" : undefined}>{label}</a>
        <IconBtn icon={I.chevron} label={`Sous-menu ${label}`} aria-expanded={open} aria-controls={`msub-${id}`} onClick={e => { e.stopPropagation(); setOpen(o => !o); }} className={open ? "rp-rot" : undefined} />
      </div>
      <ul id={`msub-${id}`} hidden={!open} style={{ listStyle: "none", margin: 0, padding: "0 0 12px 12px", display: open ? "grid" : "none", gap: 4 }}>
        {items.map(([h, l]) => <li key={h}><a href={h} className="rp-subitem">{l}</a></li>)}
      </ul>
    </div>
  );
}
