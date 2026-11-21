import React, { useState } from "react";
import { T, RAD, SH, GAP, Btn, Icon, I, TY, W, PageHero, IconTile, Field, Input, Textarea, Select, Link, Toggle, Card, Tag, RadioGroup } from "./ui.jsx";
import { PHRASES } from "./content/legal.js";

/* Page « Nous contacter » : un commanditaire (acteur public de l'emploi ou entreprise) décrit son projet
   d'accompagnement. La Répét' est l'outil de l'organisme : on ne vend pas un logiciel, on propose un accompagnement
   mené par nos coachs. Le site n'envoie rien lui-même (BUG-01) :
   - avec VITE_CONTACT_EMAIL, la demande s'ouvre dans la messagerie de la personne (mailto:), qui l'envoie ;
   - sans adresse, la demande est préparée et la personne la copie pour nous l'envoyer.
   « Nous vous recontactons » (PHRASES.contactSent) est réservé à un envoi réel, par la fonction serveur
   « demande » de la production (docs/plan-production.md, 1.5) : mode "sent", branché ici le moment venu. */

const CONTACT = import.meta.env.VITE_CONTACT_EMAIL || "";
const KINDS = [["public", "Acteur public"], ["entreprise", "Entreprise"]];
const PUBLICS = {
  public: ["Demandeurs d'emploi", "Personnes en parcours d'insertion", "Jeunes en recherche d'emploi", "Autre public"],
  entreprise: ["Collaborateurs en mobilité interne", "Collaborateurs en mobilité externe ou en reconversion", "Préparation aux entretiens annuels ou professionnels", "Autre besoin"],
};
const VOLUMES = ["Moins de 10 personnes", "De 10 à 50 personnes", "De 50 à 200 personnes", "Plus de 200 personnes", "À définir"];
const DEADLINES = ["Dans le mois", "D'ici 3 mois", "D'ici 6 mois", "Plus tard ou à définir"];
const EMPTY = { nom: "", structure: "", type: "public", fonction: "", email: "", tel: "", public: "", volume: "", echeance: "", message: "" };
const ORDER = ["nom", "structure", "email", "public"];

function validate(f) {
  const e = {};
  if (!f.nom.trim()) e.nom = "Indiquez votre nom.";
  if (!f.structure.trim()) e.structure = "Indiquez le nom de votre structure.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Vérifiez l'adresse : elle doit ressembler à prenom.nom@exemple.fr.";
  if (f.tel.trim() && !/^[+\d][\d .-]{7,}$/.test(f.tel.trim())) e.tel = "Indiquez un numéro de téléphone, par exemple 01 23 45 67 89.";
  if (!f.public) e.public = "Choisissez le public à accompagner.";
  return e;
}

const kindLabel = k => KINDS.find(m => m[0] === k)?.[1] || "";
const summary = f => [
  `Nom : ${f.nom}`, `Structure : ${f.structure} (${kindLabel(f.type)})`, f.fonction && `Fonction : ${f.fonction}`,
  `Courriel : ${f.email}`, f.tel && `Téléphone : ${f.tel}`, `Public accompagné : ${f.public}`,
  f.volume && `Volume approximatif : ${f.volume}`, f.echeance && `Échéance : ${f.echeance}`, f.message && `Message : ${f.message}`,
].filter(Boolean).join("\n");

export default function Demo({ go }) {
  const [f, setF] = useState(EMPTY);
  const [err, setErr] = useState({});
  const [sent, setSent] = useState(null);
  const set = k => v => { setF(x => ({ ...x, [k]: v })); if (err[k]) setErr(x => ({ ...x, [k]: undefined })); };
  const ev = k => e => set(k)(e.target.value);

  const submit = e => {
    e.preventDefault();
    const v = validate(f);
    setErr(v);
    const first = [...ORDER, "tel"].find(k => v[k]);
    if (first) { document.getElementById(`demo-${first}`)?.focus(); return; }
    let mailto = "";
    if (CONTACT) {
      mailto = `mailto:${CONTACT}?subject=${encodeURIComponent(`Projet d'accompagnement · ${f.structure}`)}&body=${encodeURIComponent(summary(f))}`;
      window.location.href = mailto;
    }
    setSent({ ...f, mailto, mode: mailto ? "mail" : "copy" });
    window.scrollTo({ top: 0 });
  };

  if (sent) return <Done f={sent} go={go} reset={() => { setF(EMPTY); setSent(null); }} />;

  return (
    <main>
      <PageHero eyebrow="Nous contacter" title="Parler de votre projet d'accompagnement"
        lead="Acteur public de l'emploi ou entreprise : décrivez-nous votre besoin. Nous construisons avec vous un accompagnement mené par nos coachs et outillé par La Répét'." />
      <div className="rs-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: "48px 24px 0" }}>
        <div className="rp-stack" style={{ alignItems: "stretch", maxWidth: W.wide }}>
          <Card pad="lg" level={2} topbar>
          <form noValidate onSubmit={submit} aria-labelledby="demo-title" style={{ display: "grid", gap: GAP.field }}>
            <div style={{ display: "grid", gap: 12 }}>
              <h2 id="demo-title" style={{ ...TY.h2, color: T.navy, margin: 0 }}>Votre projet</h2>
              <p style={{ ...TY.small, color: T.muted, margin: 0 }}>Le nom, la structure, l'adresse électronique et le public accompagné sont obligatoires.</p>
            </div>
            {Object.values(err).some(Boolean) && (
              <div role="alert" style={{ background: T.errorBg, color: T.errorDk, borderRadius: RAD.md, padding: "12px 16px", ...TY.small, display: "flex", gap: 12 }}>
                <Icon d={I.ban} s={16} c={T.errorDk} /> Certains champs sont à compléter. Ils sont signalés ci-dessous.
              </div>
            )}
            <div className="rs-g2" style={{ gap: 20 }}>
              <Field id="demo-nom" label="Votre nom" error={err.nom}><Input id="demo-nom" autoComplete="name" value={f.nom} onChange={ev("nom")} error={err.nom} /></Field>
              <Field id="demo-fonction" label="Votre fonction (facultatif)"><Input id="demo-fonction" autoComplete="organization-title" value={f.fonction} onChange={ev("fonction")} /></Field>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              <span id="demo-type" style={{ ...TY.label, color: T.navy }}>Type de structure</span>
              <RadioGroup aria-labelledby="demo-type" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {KINDS.map(([k, l]) => <Toggle key={k} on={f.type === k} onClick={() => { set("type")(k); set("public")(""); }}>{l}</Toggle>)}
              </RadioGroup>
            </div>
            <Field id="demo-structure" label="Nom de votre structure" error={err.structure}><Input id="demo-structure" autoComplete="organization" value={f.structure} onChange={ev("structure")} error={err.structure} /></Field>
            <div className="rs-g2" style={{ gap: 20 }}>
              <Field id="demo-email" label="Adresse électronique" error={err.email}><Input id="demo-email" type="email" inputMode="email" autoComplete="email" value={f.email} onChange={ev("email")} error={err.email} /></Field>
              <Field id="demo-tel" label="Téléphone (facultatif)" error={err.tel}><Input id="demo-tel" type="tel" inputMode="tel" autoComplete="tel" value={f.tel} onChange={ev("tel")} error={err.tel} /></Field>
            </div>
            <Field id="demo-public" label="Public accompagné" error={err.public}><Select id="demo-public" value={f.public} onChange={ev("public")} options={PUBLICS[f.type]} placeholder="Choisir" error={err.public} /></Field>
            <div className="rs-g2" style={{ gap: 20 }}>
              <Field id="demo-volume" label="Nombre de personnes (facultatif)"><Select id="demo-volume" value={f.volume} onChange={ev("volume")} options={VOLUMES} placeholder="Choisir" /></Field>
              <Field id="demo-echeance" label="Échéance (facultatif)"><Select id="demo-echeance" value={f.echeance} onChange={ev("echeance")} options={DEADLINES} placeholder="Choisir" /></Field>
            </div>
            <Field id="demo-message" label="Message (facultatif)" hint="Par exemple : le contexte de l'accompagnement, le territoire, les types d'entretien à préparer.">
              <Textarea id="demo-message" rows={4} value={f.message} onChange={ev("message")} hint="1" />
            </Field>
            <div style={{ display: "grid", gap: 8, marginTop: 4 }}>
              <div className="rp-wide-m"><Btn kind="objective" size="md" icon={I.send}>Envoyer ma demande</Btn></div>
              <span style={{ ...TY.caption, color: T.muted, display: "flex", gap: 8, alignItems: "flex-start" }}>
                <Icon d={I.lock} s={16} />
                <span>{PHRASES.contactInfo} <Link href="#/vos-donnees/notice">Vos données</Link></span>
              </span>
            </div>
          </form>
          </Card>

          <Card pad="lg" topbar="coach" as="aside" style={{ display: "grid", gap: 24, alignContent: "start" }}>
            <div style={{ display: "grid", gap: 12 }}>
              <div><Tag tone="primary">Commanditaires</Tag></div>
              <h2 style={{ ...TY.h2, color: T.navy, margin: 0 }}>Comment nous travaillons ensemble</h2>
            </div>
            {[[I.chat, "Un premier échange", "Votre public, vos objectifs, votre calendrier, les types d'entretien à préparer."],
              [I.note, "Une proposition d'accompagnement", "Rendez-vous individuels, ateliers, durée : nous l'ajustons à votre besoin."],
              [I.users, "Nos coachs accompagnent", "Chaque personne s'entraîne avec La Répét' entre deux rendez-vous, et décide de ce qu'elle envoie."],
              [I.shield, "Un bilan d'ensemble", "Vous recevez un bilan de l'accompagnement, jamais une mesure individuelle."]].map(([ic, t, d]) => (
              <div key={t} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <IconTile icon={ic} />
                <div style={{ display: "grid", gap: 4 }}>
                  <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>{t}</h3>
                  <p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p>
                </div>
              </div>
            ))}
            <p style={{ ...TY.small, color: T.muted, margin: 0 }}>Vous vous entraînez avec un coach ? <Link href="#/espace">Ouvrir mon espace</Link></p>
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
        <h1 className="ty-h1" style={{ ...TY.h1, color: T.navy, margin: 0 }}>{f.mode === "sent" ? "Merci, votre demande est envoyée" : "Merci, votre demande est prête"}</h1>
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
