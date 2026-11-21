import React, { useState } from "react";
import { T, GAP, W, TY, PageHero, Tag, Btn, Link, Card, Field, Input, Txt, I, Notice } from "../ui.jsx";
import { PHRASES } from "../content/legal.js";
import { setLastSpace, setCounselor, findParcours, TRIAL_CODE, TRIAL_LOGIN } from "../lib/store.js";
import { go, openSpace } from "./router.js";

/* ─── « Mon espace » : code d'accès ou connexion coach (plus d'écran de connexion séparé) ─── */
export function Espace() {
  const [code, setCode] = useState(TRIAL_CODE);
  const [err, setErr] = useState("");
  const [email, setEmail] = useState(TRIAL_LOGIN.email);
  const [pwd, setPwd] = useState(TRIAL_LOGIN.password);
  const [forgot, setForgot] = useState(false);
  const ok = /.+@.+\..+/.test(email) && pwd.length >= 4;
  const submit = e => {
    e.preventDefault();
    const p = findParcours(code);
    if (!p) return setErr("Ce code ne fonctionne pas. Vérifiez les 6 caractères, ou demandez-le à votre coach.");
    go(`#/s/${p.code}`); // pas d'attente artificielle (UI-10)
  };
  const login = e => {
    e.preventDefault();
    if (!ok) return;
    setCounselor(TRIAL_LOGIN.name); setLastSpace({ role: "coach" }); if (location.hash !== "#/coach") go("#/coach");
  };
  const card = { display: "flex", flexDirection: "column", gap: GAP.grid, height: "100%" };
  return (
    <main>
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
export function NotFound() {
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
