import React, { useEffect, useRef, useState } from "react";
import { T, W, Z, TY, HEADER_H, RepetLogo, Btn, Bare, IconBtn, Link, Icon, I, ScrollProgress, lockScroll } from "../ui.jsx";
import { CATEGORIES } from "../content/categories.js";
import { openA11y } from "../A11y.jsx";
import { PUBLIC, go, openSpace } from "./router.js";
import { AccountMenu } from "./AccountMenu.jsx";

/* ─── En-tête ─── */
/* Boutons de l'en-tête : aucun déplacement au survol (rien ne bouge dans la barre). */
export const STILL = { transform: "none" };

export const LINKS = [["#/a-propos", "À propos", "about"], ["#/solutions", "Solutions", "solutions"], ["#/ressources", "Ressources", "resources"]];

/* Sous-menus (deuxième niveau) : le clic sur l'intitulé mène toujours à la page principale. */
export const SUBS = {
  about: [["#/a-propos", "Notre démarche"], ["#/a-propos/ia-et-recherche", "L'IA et la recherche"], ["#/a-propos/faq", "Questions fréquentes"]],
  solutions: [["#/solutions/demandeurs-emploi", "Demandeurs d'emploi"], ["#/solutions/collaborateurs", "Collaborateurs en mobilité"], ["#/solutions/coachs", "Coachs"], ["#/solutions/commanditaires", "Commanditaires"]],
  resources: CATEGORIES.map(c => [`#/ressources/c/${c.id}`, c.title]),
};

export const activeOf = role => (role === "research" ? "about" : role);

export const DATA_LINKS = [["#/vos-donnees", "Vos données"], ["#/vos-donnees/video", "Que devient ma vidéo ?"], ["#/mentions-legales", "Mentions légales"], ["#/accessibilite", "Accessibilité : non conforme"]];

export function Nav({ route, s }) {
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
            <span className="rs-demo"><Btn kind="secondary" size="sm" style={STILL} onClick={() => go("#/demo")}>Nous contacter</Btn></span>
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
            <Btn kind="secondary" full onClick={() => { setMenu(false); go("#/demo"); }}>Nous contacter</Btn>
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

/* Entrée de navigation à deux niveaux : lien vers la page principale + bouton qui ouvre le sous-menu
   (survol avec petit délai de fermeture, clic, clavier : Entrée, Espace, flèches, Échap). */
export function NavItem({ href, label, id, on }) {
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
export function MobileItem({ href, label, id, on }) {
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
