import React, { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { T, RAD, SH, GAP, W, Z, TY, PAD, HEADER_H, PageHero, BrandLoader, RepetLogo, Tag, Btn, Bare, IconBtn, Link, Card, Field, Input, Txt, Icon, I, Notice, Modal, GStyle, ScrollProgress } from "./ui.jsx";
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
import { useStore, getState, setLastSpace, setCounselor, logoutCounselor, findParcours, withdrawConsent, clearWarmupDebrief, TRIAL_CODE, TRIAL_LOGIN } from "./lib/store.js";

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
  const m = h.match(/^#\/s\/([A-Za-z0-9]{6})/);
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
  return { role: "home" };
}

/* Titre du document à chaque route (RGAA 8.6). */
const TITLES = { research: "L'IA et la recherche", home: "S'entraîner à l'entretien d'embauche", about: "À propos", solutions: "Solutions", resources: "Ressources", demo: "Demander une prise en main", espace: "Mon espace", benef: "Mon espace", coach: "Espace coach" };
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

const PUBLIC = ["home", "research", "about", "solutions", "resources", "demo", "legal"];

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
      if (document.startViewTransition) { try { document.startViewTransition(apply); return; } catch { /* repli */ } }
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
      {/* Contenu et pied de page changent ensemble (un seul groupe de transition) : le pied ne passe jamais sur l'ancienne page */}
      <div key={enter} className={`rp-view${leaving ? " rp-leave" : ""}${enter ? " rp-enter" : ""}`} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1 }}>
        {route.role === "home" && <Home go={go} openSpace={openSpace} />}
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
      <ToTop lift={route.role === "benef" && !!route.code} />
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
     Elle ne dépend pas de la route : sur toutes les pages, l'en-tête garde « Mes paramètres ». */
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
    <header className="noprint rp-header" style={{ position: "sticky", top: 0, zIndex: Z.nav, background: menu ? T.bg : T.glass, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderBottom: `1px solid ${T.line}` }}>
      <div className="rp-nav" style={{ maxWidth: W.page, margin: "0 auto", padding: "0 24px", height: HEADER_H, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, minWidth: 0 }}>
          <a href="#/" onClick={e => { e.preventDefault(); go("#/"); }} aria-label="La Répét', accueil" style={{ display: "flex", flexShrink: 0 }}>
            <RepetLogo s={17} tagline={false} />
          </a>
          <nav aria-label="Navigation principale" className="rs-links" style={{ display: "flex", alignItems: "center", gap: 24, marginLeft: 12 }}>
            {LINKS.map(([h, l, r]) => <NavItem key={h} href={h} label={l} id={r} on={activeOf(route.role) === r} />)}
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {inSpace ? (<>
            <IconBtn icon={I.a11y} label="Options d'accessibilité" onClick={openA11y} />
            <SettingsMenu route={spaceRoute} s={s} />
            {isPublic && <IconBtn ref={burger} variant="outline" className="rs-burger" aria-expanded={menu} aria-controls="rs-menu" label={menu ? "Fermer le menu" : "Ouvrir le menu"} icon={menu ? I.close : I.menu} onClick={() => setMenu(m => !m)} />}
          </>) : (<>
            <span className="rs-demo"><Btn kind="secondary" size="sm" style={STILL} onClick={() => go("#/demo")}>Demander une prise en main</Btn></span>
            <IconBtn icon={I.a11y} label="Options d'accessibilité" onClick={openA11y} />
            <Btn kind="primary" size="sm" style={STILL} onClick={openSpace}><span className="rp-hide-m" style={{ display: "inline-flex" }}><Icon d={I.user} s={16} /></span>Mon espace</Btn>
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

/* « Mes paramètres » : menu déroulant accessible (bouton aria-expanded, flèches, Début, Fin, Échap). */
function SettingsMenu({ route, s }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const btn = useRef(null), list = useRef(null);
  const coach = route.role === "coach";
  const code = route.code;
  const items = coach
    ? [["space", "Retour à mon espace", I.user], ["data", "Vos données", I.shield], ["a11y", "Options d'accessibilité", I.a11y], ["logout", "Se déconnecter", I.logout]]
    : [["space", "Retour à mon espace", I.user], ["data", "Vos données", I.shield], ["a11y", "Options d'accessibilité", I.a11y], ["code", "Changer de code", I.redo], ["withdraw", "Retirer mon consentement", I.trash], ["logout", "Se déconnecter", I.logout]];
  const focusItem = i => { const el = list.current?.querySelectorAll("[role=menuitem]")[i]; el?.focus(); };
  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => focusItem(0));
    const out = e => { if (!list.current?.contains(e.target) && !btn.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("pointerdown", out);
    return () => document.removeEventListener("pointerdown", out);
  }, [open]);
  const close = (refocus = true) => { setOpen(false); if (refocus) btn.current?.focus(); };
  const act = k => {
    close(k !== "withdraw" && k !== "a11y");
    if (k === "a11y") openA11y();
    if (k === "space") go(coach ? "#/coach" : `#/s/${code}`);
    if (k === "data") go(coach ? "#/vos-donnees/coachs" : "#/vos-donnees");
    if (k === "code") { setLastSpace(null); go("#/beneficiaire"); }
    if (k === "withdraw") setConfirm(true);
    if (k === "logout") { if (coach) logoutCounselor(); setLastSpace(null); go("#/"); }
  };
  const onKey = e => {
    const els = [...(list.current?.querySelectorAll("[role=menuitem]") || [])];
    const i = els.indexOf(document.activeElement);
    const k = { ArrowDown: (i + 1) % els.length, ArrowUp: (i - 1 + els.length) % els.length, Home: 0, End: els.length - 1 }[e.key];
    if (k !== undefined) { e.preventDefault(); els[k]?.focus(); }
    if (e.key === "Escape") { e.preventDefault(); close(); }
    if (e.key === "Tab") setOpen(false);
  };
  const p = !coach && code ? s.parcours[code] : null;
  return (
    <div style={{ position: "relative" }}>
      <Btn ref={btn} kind="secondary" size="sm" style={STILL} aria-label="Mes paramètres" aria-haspopup="menu" aria-expanded={open} aria-controls="rp-settings" onClick={() => setOpen(o => !o)}
        onKeyDown={e => { if (e.key === "ArrowDown" && !open) { e.preventDefault(); setOpen(true); } }}>
        <Icon d={I.user} s={16} /><span className="rp-hide-m">Mes paramètres</span><Icon d={I.chevron} s={16} />
      </Btn>
      {open && (
        <div ref={list} id="rp-settings" role="menu" aria-label="Mes paramètres" onKeyDown={onKey}
          style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: Z.nav + 1, minWidth: 260, maxWidth: "calc(100vw - 32px)", background: T.surface, border: `1px solid ${T.line}`, borderRadius: RAD.md, boxShadow: SH.lg, padding: 8, display: "grid", gap: 4 }}>
          <div style={{ ...TY.caption, color: T.muted, padding: "4px 12px 8px" }}>{coach ? `Espace coach · ${s.counselor?.name || ""}` : p ? `Espace de ${p.prenom}` : "Mon espace"}</div>
          {items.map(([k, l, ic]) => (
            <Bare key={k} role="menuitem" tabIndex={-1} onClick={() => act(k)} className="rp-menuitem"
              style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 44, padding: "0 12px", borderRadius: RAD.sm, ...TY.bodyStrong, color: k === "withdraw" ? T.errorDk : T.navy }}>
              <Icon d={ic} s={16} />{l}
            </Bare>
          ))}
        </div>
      )}
      {confirm && (
        <Modal close={() => setConfirm(false)} title="Tout supprimer ?" footer={
          <div className="rp-actions" style={{ display: "flex", justifyContent: "flex-end", gap: GAP.actions, flexWrap: "wrap" }}>
            <Btn kind="secondary" onClick={() => { setConfirm(false); btn.current?.focus(); }}>Annuler</Btn>
            <Btn kind="danger" style={{ background: T.errorDk, color: T.surface }} icon={I.trash} onClick={async () => { clearWarmupDebrief(code); await withdrawConsent(code); setConfirm(false); }}>Tout supprimer</Btn>
          </div>}>
          <div style={{ display: "grid", gap: 12 }}>
            <Txt v="bodyLg" color={T.body}>Si vous retirez votre accord, vos réponses et les rapports de votre coach sont effacés de cet appareil. C'est définitif.</Txt>
            <Txt v="body" color={T.body}>Vous pourrez recommencer quand vous voulez. Votre accompagnement continue normalement.</Txt>
          </div>
        </Modal>
      )}
    </div>
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
              <div><Tag tone="appui">Bénéficiaire</Tag></div>
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
                <Btn kind="secondary" full disabled={!ok}>Se connecter</Btn>
                <Txt v="caption" color={T.muted}>{PHRASES.coachLogin} <Link href="#/vos-donnees/coachs">Coachs : vos données</Link></Txt>
              </div>
            </form>
          </Card>
        </div>
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
