import React, { useRef, useState } from "react";
import { T, RAD, SH, Btn, Icon, I, ORG_NAME, TY, W, SI, PageHero, IconTile, Field, Input, Textarea, Select, Checkbox, Link } from "./ui.jsx";

/* Page « Demander une démo » : formulaire sans serveur. Rien n'est envoyé ni conservé par le site.
   Si VITE_CONTACT_EMAIL est défini, la demande s'ouvre dans le logiciel de messagerie (mailto:). */

const CONTACT = import.meta.env.VITE_CONTACT_EMAIL || "";
const ROLES = ["Direction", "Coach, conseiller ou conseillère", "Responsable de formation ou d'atelier", "DSI ou équipe technique", "Juridique ou DPO", "Autre"];
const VOLUMES = ["Moins de 100", "De 100 à 500", "De 500 à 2 000", "Plus de 2 000", "Je ne sais pas encore"];
const EMPTY = { prenom: "", nom: "", organisme: "", fonction: "", email: "", volume: "", message: "", consent: false };
const ORDER = ["prenom", "nom", "organisme", "fonction", "email", "volume", "consent"];

function validate(f) {
  const e = {};
  if (!f.prenom.trim()) e.prenom = "Indiquez votre prénom.";
  if (!f.nom.trim()) e.nom = "Indiquez votre nom.";
  if (!f.organisme.trim()) e.organisme = "Indiquez le nom de votre organisme.";
  if (!f.fonction) e.fonction = "Choisissez votre fonction dans la liste.";
  if (!f.email.trim()) e.email = "Indiquez votre adresse électronique professionnelle.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Vérifiez l'adresse : elle doit ressembler à prenom.nom@organisme.fr.";
  if (!f.volume) e.volume = "Choisissez une fourchette, ou « Je ne sais pas encore ».";
  if (!f.consent) e.consent = "Cochez la case pour que nous puissions vous recontacter.";
  return e;
}

const summary = f => [
  `Prénom : ${f.prenom}`, `Nom : ${f.nom}`, `Organisme : ${f.organisme}`, `Fonction : ${f.fonction}`,
  `Adresse électronique : ${f.email}`, `Personnes accompagnées par an : ${f.volume}`, f.message && `Message : ${f.message}`,
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
      mailto = `mailto:${CONTACT}?subject=${encodeURIComponent(`Demande de démonstration La Répét' · ${f.organisme}`)}&body=${encodeURIComponent(summary(f))}`;
      window.location.href = mailto;
    }
    setSent({ ...f, mailto });
    window.scrollTo({ top: 0 });
  };

  if (sent) return <Done f={sent} go={go} reset={() => { setF(EMPTY); setSent(null); }} />;

  return (
    <main>
      <PageHero eyebrow="Demander une démo" title="Découvrir La Répét' avec votre équipe"
        lead="Une démonstration de 45 minutes environ : le parcours de la personne accompagnée, la relecture côté coach, puis vos questions sur le déploiement, l'hébergement et le cadre juridique." />
      <div className="rs-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: "48px 24px 0" }}>
        <div className="rs-split" style={{ alignItems: "start" }}>
          <form ref={form} noValidate onSubmit={submit} aria-labelledby="demo-title"
            style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: RAD.lg, boxShadow: SH.sm, padding: 32, display: "grid", gap: 20 }} className="rs-form">
            <div style={{ display: "grid", gap: 8 }}>
              <h2 id="demo-title" style={{ ...TY.h2, color: T.navy, margin: 0 }}>Vos coordonnées</h2>
              <p style={{ ...TY.small, color: T.muted, margin: 0 }}>Tous les champs sont obligatoires, sauf le message.</p>
            </div>
            {Object.values(err).some(Boolean) && (
              <div role="alert" style={{ background: T.errorBg, color: T.errorDk, borderRadius: RAD.md, padding: "12px 16px", ...TY.small, display: "flex", gap: 12 }}>
                <Icon d={I.ban} s={16} c={T.errorDk} /> Certains champs sont à compléter. Ils sont signalés ci-dessous.
              </div>
            )}
            <div className="rs-g2" style={{ gap: 20 }}>
              <Field id="demo-prenom" label="Prénom" error={err.prenom}><Input id="demo-prenom" autoComplete="given-name" value={f.prenom} onChange={ev("prenom")} error={err.prenom} /></Field>
              <Field id="demo-nom" label="Nom" error={err.nom}><Input id="demo-nom" autoComplete="family-name" value={f.nom} onChange={ev("nom")} error={err.nom} /></Field>
            </div>
            <Field id="demo-organisme" label="Organisme" error={err.organisme}><Input id="demo-organisme" autoComplete="organization" value={f.organisme} onChange={ev("organisme")} error={err.organisme} /></Field>
            <div className="rs-g2" style={{ gap: 20 }}>
              <Field id="demo-fonction" label="Fonction" error={err.fonction}><Select id="demo-fonction" value={f.fonction} onChange={ev("fonction")} options={ROLES} placeholder="Choisir" error={err.fonction} /></Field>
              <Field id="demo-volume" label="Personnes accompagnées par an" error={err.volume}><Select id="demo-volume" value={f.volume} onChange={ev("volume")} options={VOLUMES} placeholder="Choisir une fourchette" error={err.volume} /></Field>
            </div>
            <Field id="demo-email" label="Adresse électronique professionnelle" hint="Celle de votre organisme, pour vous proposer un créneau." error={err.email}>
              <Input id="demo-email" type="email" inputMode="email" autoComplete="email" value={f.email} onChange={ev("email")} hint="1" error={err.email} />
            </Field>
            <Field id="demo-message" label="Message (facultatif)" hint="Vos publics, vos ateliers, vos questions sur l'hébergement ou le cadre juridique.">
              <Textarea id="demo-message" rows={5} value={f.message} onChange={ev("message")} hint="1" />
            </Field>
            <Checkbox id="demo-consent" checked={f.consent} onChange={set("consent")} error={err.consent}>
              J'accepte d'être recontacté·e au sujet de cette demande. Mes coordonnées servent uniquement à organiser la démonstration.
            </Checkbox>
            <div style={{ display: "grid", gap: 8, marginTop: 4 }}>
              <div className="rp-wide-m"><Btn kind="objective" size="md" icon={I.send}>Envoyer ma demande</Btn></div>
              <span style={{ ...TY.caption, color: T.muted }}>
                {CONTACT ? "Votre logiciel de messagerie s'ouvrira avec votre demande prête à envoyer. Le site ne conserve rien." : "Le site ne conserve ni ne transmet vos coordonnées."}
              </span>
            </div>
          </form>

          <aside style={{ display: "grid", gap: 24 }} aria-label="Déroulé de la démonstration">
            <h2 style={{ ...TY.h2, color: T.navy, margin: 0 }}>Ce que nous verrons ensemble</h2>
            {[[I.user, "Le parcours de la personne accompagnée", "Code d'accès, échauffement, enregistrement, retour descriptif, envoi au coach."],
              [I.note, "La relecture côté coach", "Notes horodatées, commentaires sur les repères, rapport et débriefing."],
              [SI.server, "Le déploiement chez vous", "Hébergement, modèles auto-hébergés, travail restant pour la production."],
              [SI.scale, "Le cadre juridique", "AI Act, RGPD, analyse d'impact, textes d'information à valider."]].map(([ic, t, d]) => (
              <div key={t} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <IconTile icon={ic} />
                <div style={{ display: "grid", gap: 4 }}>
                  <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>{t}</h3>
                  <p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p>
                </div>
              </div>
            ))}
            <div style={{ background: T.primaryBg, borderRadius: RAD.md, padding: "12px 16px", display: "flex", gap: 12, ...TY.small, color: T.navy }}>
              <Icon d={I.lock} s={16} c={T.primary} /> <span>Envie d'essayer d'abord ? Le code d'essai est déjà rempli dans <Link onClick={() => go("#/espace")} style={{ ...TY.small, fontWeight: 600, padding: 0 }}>Mon espace</Link>.</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Done({ f, go, reset }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(summary(f)); setCopied(true); } catch { setCopied(false); } };
  return (
    <main className="rs-pad" style={{ maxWidth: W.form, margin: "0 auto", padding: "64px 24px 0" }}>
      <div role="status" className="up" style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: RAD.lg, boxShadow: SH.sm, padding: 32, display: "grid", gap: 16, justifyItems: "center", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.successBg, display: "grid", placeItems: "center" }}><Icon d={I.check} s={28} c={T.successDk} /></div>
        <h1 className="ty-h1" style={{ ...TY.h1, color: T.navy, margin: 0 }}>Merci {f.prenom}, votre demande est prête</h1>
        {f.mailto ? (
          <p style={{ ...TY.bodyLg, color: T.body, margin: 0 }}>Votre logiciel de messagerie s'est ouvert avec votre demande. Il vous reste à l'envoyer. S'il ne s'est pas ouvert, utilisez le lien ci-dessous.</p>
        ) : (
          <p style={{ ...TY.bodyLg, color: T.body, margin: 0 }}>L'envoi en ligne des demandes n'est pas encore activé sur ce site : aucune donnée n'a été transmise ni conservée. Pour organiser la démonstration, contactez l'équipe de {ORG_NAME} qui déploie La Répét', en lui transmettant votre demande.</p>
        )}
        <pre style={{ ...TY.mono, color: T.navy, background: T.bg, borderRadius: RAD.sm, padding: 16, margin: 0, textAlign: "left", whiteSpace: "pre-wrap", wordBreak: "break-word", width: "100%" }}>{summary(f)}</pre>
        <div className="rp-wide-m" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          {f.mailto ? <a href={f.mailto} className="rs-link" style={{ ...TY.bodyStrong, padding: "12px 0" }}>Ouvrir à nouveau ma messagerie</a>
            : <Btn kind="secondary" onClick={copy}>{copied ? "Demande copiée" : "Copier ma demande"}</Btn>}
          <Btn kind="primary" onClick={() => go("#/")}>Revenir à l'accueil</Btn>
        </div>
        <Link onClick={reset}>Faire une autre demande</Link>
      </div>
    </main>
  );
}
