import React, { useEffect, useRef, useState } from "react";
import { T, RAD, SH, GAP, W, Z, TY, PAD, HEADER_H, RepetLogo, Tag, Btn, Bare, IconBtn, Link, Card, Field, Input, Txt, Icon, I, Notice, Modal, GStyle, ScrollProgress } from "./ui.jsx";
import { dismissLoader } from "./Loader.jsx";
import LegalPage, { LegalModal } from "./Legal.jsx";
import { PAGES, PHRASES } from "./content/legal.js";
import Home from "./Home.jsx";
import Solutions from "./Solutions.jsx";
import About from "./About.jsx";
import Resources from "./Resources.jsx";
import Demo from "./Demo.jsx";
import Beneficiary from "./Beneficiary.jsx";
import Counselor from "./Counselor.jsx";
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
const TITLES = { home: "S'entraîner à l'entretien d'embauche", about: "À propos", solutions: "Solutions", resources: "Ressources", demo: "Demander une prise en main", espace: "Mon espace", benef: "Mon espace", coach: "Espace coach" };
const titleOf = (route, counselor) => route.role === "legal" ? PAGES[route.page].title : route.role === "coach" && !counselor ? TITLES.espace : TITLES[route.role] || TITLES.home;

const go = hash => { if (location.hash === hash) window.scrollTo({ top: 0 }); else location.hash = hash; };

/* « Mon espace » : rouvre le dernier espace utilisé sur cet appareil, sinon propose le choix. */
function openSpace() {
  const ls = getState().lastSpace;
  if (ls?.role === "coach" && getState().counselor) return go("#/coach");
  if (ls?.role === "benef" && getState().parcours[ls.code]) return go(`#/s/${ls.code}`);
  go("#/espace");
}

const PUBLIC = ["home", "about", "solutions", "resources", "demo", "legal"];

export default function App() {
  const s = useStore();
  const [route, setRoute] = useState(routeFromHash);
  const [modal, setModal] = useState(null); // clé d'une fenêtre de résumé (src/Legal.jsx) ou null

  useEffect(() => {
    dismissLoader();
    const on = () => { setRoute(routeFromHash()); window.scrollTo({ top: 0 }); };
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
      <div style={{ flex: 1 }}>
        {route.role === "home" && <Home go={go} openSpace={openSpace} />}
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
      <LegalModal modal={modal} close={() => setModal(null)} />
    </div>
  );
}

/* ─── En-tête ─── */
const LINKS = [["#/a-propos", "À propos", "about"], ["#/solutions", "Solutions", "solutions"], ["#/ressources", "Ressources", "resources"]];
const DATA_LINKS = [["#/vos-donnees", "Vos données"], ["#/vos-donnees/video", "Que devient ma vidéo ?"], ["#/mentions-legales", "Mentions légales"], ["#/accessibilite", "Accessibilité : non conforme"]];

function Nav({ route, s }) {
  const inSpace = (route.role === "benef" && route.code && s.parcours[route.code]) || (route.role === "coach" && s.counselor);
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
    <header className="noprint" style={{ position: "sticky", top: 0, zIndex: Z.nav, background: menu ? T.bg : T.glass, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderBottom: `1px solid ${T.line}` }}>
      <div className="rp-nav" style={{ maxWidth: W.page, margin: "0 auto", padding: "0 24px", height: HEADER_H, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, minWidth: 0 }}>
          <a href="#/" onClick={e => { e.preventDefault(); go("#/"); }} aria-label="La Répét', accueil" style={{ display: "flex", flexShrink: 0 }}>
            <RepetLogo s={17} tagline={false} />
          </a>
          <nav aria-label="Navigation principale" className="rs-links" style={{ display: "flex", alignItems: "center", gap: 24, marginLeft: 12 }}>
            {LINKS.map(([h, l, r]) => (
              <a key={h} href={h} className={`navlink ${route.role === r ? "on" : ""}`} aria-current={route.role === r ? "page" : undefined}>{l}</a>
            ))}
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {inSpace ? (<>
            <a href={route.role === "coach" ? "#/vos-donnees/coachs" : "#/vos-donnees"} aria-label="Vos données" className="navlink rp-datalink" style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44 }}>
              <Icon d={I.shield} s={16} /><span className="rp-hide-m">Vos données</span>
            </a>
            <SettingsMenu route={route} s={s} />
          </>) : (<>
            <span className="rs-demo"><Btn kind="secondary" size="sm" onClick={() => go("#/demo")}>Demander une prise en main</Btn></span>
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
            <Btn kind="secondary" full onClick={() => { setMenu(false); go("#/demo"); }}>Demander une prise en main</Btn>
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
    ? [["data", "Vos données", I.shield], ["logout", "Se déconnecter", I.logout]]
    : [["data", "Vos données", I.shield], ["code", "Changer de code", I.redo], ["withdraw", "Retirer mon consentement", I.trash], ["logout", "Se déconnecter", I.logout]];
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
    close(k !== "withdraw");
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
      <Btn ref={btn} kind="secondary" size="sm" aria-label="Mes paramètres" aria-haspopup="menu" aria-expanded={open} aria-controls="rp-settings" onClick={() => setOpen(o => !o)}
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
          <div style={{ ...TY.caption, color: T.muted, padding: "8px 12px 4px", borderTop: `1px solid ${T.lineLt}` }}>{PHRASES.logout}</div>
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
  const ok = /.+@.+\..+/.test(email) && pwd.length >= 4;
  const submit = e => {
    e.preventDefault();
    const p = findParcours(code);
    if (p) go(`#/s/${p.code}`); else setErr("Ce code ne fonctionne pas. Vérifiez les 6 caractères, ou demandez-le à votre coach.");
  };
  const login = e => {
    e.preventDefault();
    if (!ok) return;
    setCounselor(TRIAL_LOGIN.name);
    setLastSpace({ role: "coach" });
    if (location.hash !== "#/coach") go("#/coach");
  };
  return (
    <main className="rp-page" style={{ maxWidth: W.wide, margin: "0 auto", padding: PAD.page }}>
      <div className="up" style={{ display: "grid", gap: GAP.block }}>
        <div style={{ display: "grid", gap: 8 }}>
          <Txt v="h1" as="h1" color={T.navy}>Mon espace</Txt>
          <Txt v="bodyLg" color={T.body}>Vous vous entraînez, ou vous êtes coach ?</Txt>
        </div>
        <div className="rp-stack" style={{ alignItems: "stretch" }}>
          <Card pad="lg" level={2} topbar style={{ display: "grid", gap: 12, alignContent: "start" }}>
            <div><Tag tone="appui">Je m'entraîne</Tag></div>
            <Txt v="h2" as="h2" color={T.navy}>J'ai un code d'accès</Txt>
            <Txt v="body" color={T.body}>Écrivez les 6 caractères du code que votre coach vous a donné.</Txt>
            <form onSubmit={submit} style={{ display: "grid", gap: GAP.grid, marginTop: 8 }}>
              <Field id="espace-code" label="Votre code d'accès" error={err}>
                <Input id="espace-code" variant="code" error={err} value={code} autoComplete="off" maxLength={6} placeholder="6 caractères"
                  onChange={e => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")); setErr(""); }} />
              </Field>
              <Btn kind="objective" full disabled={code.length < 6} iconRight={I.arrow}>Ouvrir mon espace</Btn>
            </form>
            <Txt v="caption" color={T.muted}>{PHRASES.code}</Txt>
          </Card>
          <Card pad="lg" topbar="coach" style={{ display: "grid", gap: 12, alignContent: "start" }}>
            <div><Tag tone="primary">Coach</Tag></div>
            <Txt v="h2" as="h2" color={T.navy}>Je suis coach</Txt>
            <Txt v="body" color={T.body}>Créez des parcours, transmettez les codes d'accès et relisez les réponses que l'on vous envoie.</Txt>
            <form onSubmit={login} style={{ display: "grid", gap: GAP.field, marginTop: 8 }}>
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
              <Btn kind="secondary" full disabled={!ok}>Se connecter</Btn>
            </form>
            <Txt v="caption" color={T.muted}>{PHRASES.coachLogin} <Link href="#/vos-donnees/coachs">Coachs : vos données</Link></Txt>
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
    <footer className="noprint" style={{ borderTop: `1px solid ${T.line}`, background: T.surface, marginTop: GAP.section / 2 }}>
      <div className="rp-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: "24px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
        <RepetLogo s={14} tagline={false} />
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
