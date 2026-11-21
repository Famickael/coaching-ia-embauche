import React, { useRef, useState } from "react";
import { T, RAD, SH, GAP, Btn, Icon, I, TY, W, PageHero, IconTile, Field, Input, Textarea, Select, Link, Toggle, Card, Tag, Txt } from "./ui.jsx";
import { PHRASES } from "./content/legal.js";

/* Page « Demander une prise en main » : une personne demande une présentation et une première
   prise en main accompagnée par un coach. Le site n'envoie rien lui-même (BUG-01) :
   - avec VITE_CONTACT_EMAIL, la demande s'ouvre dans la messagerie de la personne (mailto:), qui l'envoie ;
   - sans adresse, la demande est préparée et la personne la copie pour la transmettre à son coach.
   « L'équipe vous recontacte » (PHRASES.contactSent) est réservé à un envoi réel, par la fonction serveur
   « demande » de la production (docs/plan-production.md, 1.5) : mode "sent", branché ici le moment venu. */

const CONTACT = import.meta.env.VITE_CONTACT_EMAIL || "";
const MEANS = [["tel", "Téléphone"], ["mail", "Courriel"], ["coach", "Par mon coach"]];
const SLOTS = ["En semaine, le matin", "En semaine, l'après-midi", "En semaine, en fin de journée", "Le samedi", "Je m'adapte"];
const NEEDS = ["Découvrir La Répét'", "Préparer un entretien bientôt", "Être aidé pour utiliser la caméra ou le micro", "Autre besoin"];
const EMPTY = { prenom: "", moyen: "tel", contact: "", dispo: "", besoin: "", message: "" };
const ORDER = ["prenom", "contact", "dispo"];

function validate(f) {
  const e = {};
  if (!f.prenom.trim()) e.prenom = "Indiquez votre prénom.";
  if (f.moyen === "tel" && !/^[+\d][\d .-]{7,}$/.test(f.contact.trim())) e.contact = "Indiquez un numéro de téléphone, par exemple 06 12 34 56 78.";
  if (f.moyen === "mail" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.contact.trim())) e.contact = "Vérifiez l'adresse : elle doit ressembler à prenom@exemple.fr.";
  if (!f.dispo) e.dispo = "Choisissez un moment, ou « Je m'adapte ».";
  return e;
}

const meansLabel = k => MEANS.find(m => m[0] === k)?.[1] || "";
const summary = f => [
  `Prénom : ${f.prenom}`, `Me contacter : ${meansLabel(f.moyen)}${f.moyen !== "coach" && f.contact ? ` (${f.contact})` : ""}`,
  `Disponibilités : ${f.dispo}`, f.besoin && `Besoin : ${f.besoin}`, f.message && `Message : ${f.message}`,
].filter(Boolean).join("\n");

export default function Demo({ go }) {
  const [f, setF] = useState(EMPTY);
  const [err, setErr] = useState({});
  const [sent, setSent] = useState(null);
  const form = useRef(null);
  const set = k => v => { setF(x => ({ ...x, [k]: v })); if (err[k]) setErr(x => ({ ...x, [k]: undefined })); };
  const ev = k => e => set(k)(e.target.value);

  const submit = e => {
    e.preventDefault();
    const v = validate(f);
    setErr(v);
    const first = ORDER.find(k => v[k]);
    if (first) { document.getElementById(`demo-${first}`)?.focus(); return; }
    let mailto = "";
    if (CONTACT) {
      mailto = `mailto:${CONTACT}?subject=${encodeURIComponent(`Demande de prise en main La Répét' · ${f.prenom}`)}&body=${encodeURIComponent(summary(f))}`;
      window.location.href = mailto;
    }
    setSent({ ...f, mailto, mode: mailto ? "mail" : "copy" });
    window.scrollTo({ top: 0 });
  };

  if (sent) return <Done f={sent} go={go} reset={() => { setF(EMPTY); setSent(null); }} />;

  const contactLabel = f.moyen === "tel" ? "Votre numéro de téléphone" : "Votre adresse électronique";
  return (
    <main>
      <PageHero eyebrow="Prise en main" title="Demander une prise en main" lead="Un coach vous montre l'outil et fait avec vous un premier entraînement." />
      <div className="rs-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: "48px 24px 0" }}>
        <div className="rp-stack" style={{ alignItems: "stretch", maxWidth: W.wide }}>
          <Card pad="lg" level={2} topbar>
          <form ref={form} noValidate onSubmit={submit} aria-labelledby="demo-title" style={{ display: "grid", gap: GAP.field }}>
            <div style={{ display: "grid", gap: 12 }}>
              <div><Tag tone="appui">Bénéficiaire</Tag></div>
              <h2 id="demo-title" style={{ ...TY.h2, color: T.navy, margin: 0 }}>Votre demande</h2>
              <p style={{ ...TY.small, color: T.muted, margin: 0 }}>Le prénom, le moyen de contact et les disponibilités sont obligatoires.</p>
            </div>
            {Object.values(err).some(Boolean) && (
              <div role="alert" style={{ background: T.errorBg, color: T.errorDk, borderRadius: RAD.md, padding: "12px 16px", ...TY.small, display: "flex", gap: 12 }}>
                <Icon d={I.ban} s={16} c={T.errorDk} /> Certains champs sont à compléter. Ils sont signalés ci-dessous.
              </div>
            )}
            <Field id="demo-prenom" label="Prénom" error={err.prenom}><Input id="demo-prenom" autoComplete="given-name" value={f.prenom} onChange={ev("prenom")} error={err.prenom} /></Field>
            <div style={{ display: "grid", gap: 8 }}>
              <span id="demo-moyen" style={{ ...TY.label, color: T.navy }}>Comment préférez-vous être contacté ?</span>
              <div role="radiogroup" aria-labelledby="demo-moyen" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {MEANS.map(([k, l]) => <Toggle key={k} on={f.moyen === k} onClick={() => { set("moyen")(k); setErr(x => ({ ...x, contact: undefined })); }}>{l}</Toggle>)}
              </div>
            </div>
            {f.moyen !== "coach" ? (
              <Field id="demo-contact" label={contactLabel} error={err.contact}>
                <Input id="demo-contact" type={f.moyen === "tel" ? "tel" : "email"} inputMode={f.moyen === "tel" ? "tel" : "email"} autoComplete={f.moyen === "tel" ? "tel" : "email"} value={f.contact} onChange={ev("contact")} error={err.contact} />
              </Field>
            ) : <p style={{ ...TY.small, color: T.body, margin: 0 }}>Votre coach vous transmet la date du rendez-vous.</p>}
            <div className="rs-g2" style={{ gap: 20 }}>
              <Field id="demo-dispo" label="Vos disponibilités" error={err.dispo}><Select id="demo-dispo" value={f.dispo} onChange={ev("dispo")} options={SLOTS} placeholder="Choisir" error={err.dispo} /></Field>
              <Field id="demo-besoin" label="Votre besoin (facultatif)"><Select id="demo-besoin" value={f.besoin} onChange={ev("besoin")} options={NEEDS} placeholder="Choisir" /></Field>
            </div>
            <Field id="demo-message" label="Message (facultatif)" hint="Par exemple : la date de votre entretien, ou ce qui vous aiderait.">
              <Textarea id="demo-message" rows={4} value={f.message} onChange={ev("message")} hint="1" />
            </Field>
            <div style={{ display: "grid", gap: 8, marginTop: 4 }}>
              <div className="rp-wide-m"><Btn kind="objective" size="md" icon={I.send}>{CONTACT ? "Envoyer ma demande" : "Préparer ma demande"}</Btn></div>
              <span style={{ ...TY.caption, color: T.muted, display: "flex", gap: 8, alignItems: "flex-start" }}>
                <Icon d={I.lock} s={16} />
                <span>{PHRASES.contactInfo} <Link href="#/vos-donnees/notice">Vos données</Link></span>
              </span>
            </div>
          </form>
          </Card>

          <Card pad="lg" topbar="coach" as="aside" style={{ display: "grid", gap: 24, alignContent: "start" }}>
            <div style={{ display: "grid", gap: 12 }}>
              <div><Tag tone="primary">Avec votre coach</Tag></div>
              <h2 style={{ ...TY.h2, color: T.navy, margin: 0 }}>Comment se passe le rendez-vous</h2>
            </div>
            {[[I.user, "Un coach à vos côtés", "Il vous montre comment ouvrir votre espace avec votre code d'accès."],
              [I.video, "Un premier entraînement", "Vous répondez à une question, avec la caméra ou en voix seule."],
              [I.sparkle, "Le retour de l'assistant", "Vous découvrez ensemble ce que l'assistant décrit, sans note."],
              [I.lock, "Vos choix", "Vous voyez comment garder une réponse pour vous ou l'envoyer à votre coach."]].map(([ic, t, d]) => (
              <div key={t} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <IconTile icon={ic} />
                <div style={{ display: "grid", gap: 4 }}>
                  <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>{t}</h3>
                  <p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p>
                </div>
              </div>
            ))}
            <p style={{ ...TY.small, color: T.muted, margin: 0 }}>Vous représentez un organisme ? <Link href="#/solutions/organismes">Voir le déploiement</Link></p>
          </Card>
        </div>
      </div>
    </main>
  );
}

function Done({ f, go, reset }) {
  const [copied, setCopied] = useState("");
  const text = summary(f);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied("Récapitulatif copié."); }
    catch { setCopied("La copie automatique n'a pas fonctionné : sélectionnez le texte puis copiez-le."); }
  };
  const lead = f.mode === "sent" ? PHRASES.contactSent : f.mode === "mail" ? PHRASES.contactMail : PHRASES.contactCopy;
  return (
    <main className="rs-pad" style={{ maxWidth: W.form, margin: "0 auto", padding: "64px 24px 0" }}>
      <div role="status" className="up" style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: RAD.lg, boxShadow: SH.sm, padding: 32, display: "grid", gap: 16, justifyItems: "center", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.successBg, display: "grid", placeItems: "center" }}><Icon d={I.check} s={28} c={T.successDk} /></div>
        <h1 className="ty-h1" style={{ ...TY.h1, color: T.navy, margin: 0 }}>{f.mode === "sent" ? `Merci ${f.prenom}, votre demande est envoyée` : `Merci ${f.prenom}, votre demande est prête`}</h1>
        <p style={{ ...TY.bodyLg, color: T.body, margin: 0 }}>{lead} {PHRASES.contactInfo}</p>
        <pre data-testid="demo-recap" style={{ ...TY.mono, color: T.navy, background: T.bg, borderRadius: RAD.sm, padding: 16, margin: 0, textAlign: "left", whiteSpace: "pre-wrap", wordBreak: "break-word", width: "100%", userSelect: "all" }}>{text}</pre>
        <div className="rp-wide-m" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          {f.mode === "mail" && <a href={f.mailto} className="rs-link" style={{ ...TY.bodyStrong, padding: "12px 0" }}>Rouvrir ma messagerie</a>}
          {f.mode === "copy" && <Btn kind="primary" icon={I.copy} onClick={copy}>Copier ma demande</Btn>}
          <Btn kind={f.mode === "copy" ? "secondary" : "primary"} onClick={() => go("#/")}>Revenir à l'accueil</Btn>
        </div>
        <span role="status" style={{ ...TY.small, color: T.body }}>{copied}</span>
        <Link onClick={reset}>Faire une autre demande</Link>
      </div>
    </main>
  );
}
