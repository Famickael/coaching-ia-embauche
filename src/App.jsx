import React, { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useFocusOnChange, focusMainHeading } from "./lib/hooks.js";
import { flushSync } from "react-dom";
import { T, W, TY, BrandLoader, Notice, GStyle } from "./ui.jsx";
import { dismissLoader } from "./Loader.jsx";
import LegalPage, { LegalModal } from "./Legal.jsx";
import Home from "./home/index.jsx";
import A11yLayer from "./A11y.jsx";
import { useStore, getState, setLastSpace, getStorageError } from "./lib/store.js";
import { go, openSpace, reducedMotion, routeFromHash, titleOf } from "./app/router.js";
import { Nav } from "./app/Nav.jsx";
import { Espace, NotFound } from "./app/Espace.jsx";
import { Footer } from "./app/Footer.jsx";
import { ToTop } from "./app/ToTop.jsx";

/* La Répét' : entraînement à l'entretien d'embauche, avec un assistant IA et votre coach.
   Routes (dans l'ancre de l'adresse, pour que le bouton Retour du navigateur fonctionne) :
     #/                         accueil
     #/a-propos(/faq)           à propos (et sa FAQ) ; #/a-propos/ia-et-recherche : L'IA et la recherche
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

/* Pages chargées à la demande (PERF-02) : l'accueil ne télécharge ni les espaces, ni les articles, ni MediaPipe. */
const Solutions = lazy(() => import("./Solutions.jsx"));

const About = lazy(() => import("./About.jsx"));

const Resources = lazy(() => import("./Resources.jsx"));

const Demo = lazy(() => import("./Demo.jsx"));

const Research = lazy(() => import("./Research.jsx"));

const Beneficiary = lazy(() => import("./beneficiary/index.jsx"));

const Counselor = lazy(() => import("./coach/index.jsx"));

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
  /* Titre de la route (effet de mise en page) ; chaque écran l'affine ensuite par useTitle (A11Y-06). */
  useLayoutEffect(() => { document.title = `${titleOf(route, s.counselor)} · La Répét'`; }, [route, s.counselor]);
  /* Changement de page (A11Y-02) : focus sur le titre, annonce discrète du titre de la page. */
  const routeKey = `${route.role}/${route.section || ""}/${route.slug || ""}/${route.cat || ""}/${route.page || ""}/${route.code || ""}`;
  useFocusOnChange(routeKey);
  const [announce, setAnnounce] = useState("");
  const firstRoute = useRef(true);
  useEffect(() => {
    if (firstRoute.current) { firstRoute.current = false; return; }
    const t = setTimeout(() => setAnnounce(document.title.replace(/ · La Répét'$/, "")), 400);
    return () => clearTimeout(t);
  }, [routeKey]);

  const onCode = code => {
    if (code) { setLastSpace({ role: "benef", code }); if (location.hash !== `#/s/${code}`) history.replaceState(null, "", `#/s/${code}`); }
    else if (getState().lastSpace?.role === "benef") { setLastSpace(null); history.replaceState(null, "", "#/beneficiaire"); }
  };

  return (
    <div className="rp-app" style={{ background: T.bg, ...TY.body, color: T.navy, display: "flex", flexDirection: "column" }}>
      <GStyle />
      {/* Lien d'évitement (A11Y-01) : visible au focus ; ne touche pas à l'ancre de routage */}
      <a href="#contenu" className="rp-skip" onClick={e => { e.preventDefault(); focusMainHeading(); document.querySelector("main")?.scrollIntoView(); }}>Aller au contenu</a>
      <div className="rp-sr" aria-live="polite" role="status">{announce}</div>
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
        <Suspense fallback={<div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}><BrandLoader label="Chargement…" /></div>}>
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
        </Suspense>
        </div>
        <Footer compact={route.role === "benef" || (route.role === "coach" && !!s.counselor)} />
      </div>
      <LegalModal modal={modal} close={() => setModal(null)} />
      <A11yLayer />
      <ToTop lift={route.role === "benef" || (route.role === "coach" && !!s.counselor)} />
    </div>
  );
}
