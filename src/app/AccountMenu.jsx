import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { T, RAD, GAP, TY, Btn, Bare, IconBtn, Txt, Icon, I, Modal, lockScroll } from "../ui.jsx";
import { openA11y } from "../A11y.jsx";
import { closeAssistant } from "../lib/bus.js";
import { setLastSpace, logoutCounselor, withdrawConsent } from "../lib/store.js";
import { go } from "./router.js";
import { STILL } from "./Nav.jsx";

/* « Mon compte » (session ouverte) : panneau latéral modal, plein écran sur mobile.
   En-tête du compte (prénom ou nom, rôle), puis les actions. Focus envoyé dans le panneau et retenu, Échap ferme,
   focus rendu au bouton, défilement de la page bloqué, page inerte. N'est jamais ouvert en même temps que
   l'assistant : l'ouvrir ferme l'assistant, et les boutons flottants sont retirés tant qu'il est ouvert. */
export function AccountMenu({ route, s }) {
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
        <Modal close={() => { setConfirm(false); btn.current?.focus(); }} title="Retirer mon accord et tout supprimer ?" footer={
          <div className="rp-actions" style={{ display: "flex", justifyContent: "flex-end", gap: GAP.actions, flexWrap: "wrap" }}>
            <Btn kind="secondary" onClick={() => { setConfirm(false); btn.current?.focus(); }}>Annuler</Btn>
            <Btn kind="dangerSolid" icon={I.trash} onClick={async () => { await withdrawConsent(code); setConfirm(false); }}>Tout supprimer</Btn>
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
