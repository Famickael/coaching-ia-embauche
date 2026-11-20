import React, { useEffect, useMemo, useRef, useState } from "react";
import { T, TY, RAD, PAD, GAP, W, Card, Tag, Btn, Back, Link, IconBtn, Icon, I, ORG_NAME, Txt, Notice, Empty, Confirm, ConfirmMark, Field, Input, Textarea, Toggle, Modal, TimeChip, Bare } from "./ui.jsx";
import { useStore, TRIAL_LOGIN, setCounselor, createParcours, deleteParcours, takesOf, updateTake, parcoursStatus } from "./lib/store.js";
import { Player, DimCard, markersOf, useVideoUrl } from "./Report.jsx";
import { fmt } from "./lib/analysis.js";

const dateFr = iso => (iso ? new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "");
export const linkFor = code => `${location.origin}${location.pathname}#/s/${code}`;

const stack = (gap = GAP.stack) => ({ display: "grid", gap });
const actions = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: GAP.actions, flexWrap: "wrap" };

export default function Counselor() {
  const s = useStore();
  const [view, setView] = useState({ name: "list" });
  const [modal, setModal] = useState(null); // null | { step: "create" } | { step: "created", code }
  if (!s.counselor) return <main className="rp-page" style={{ padding: PAD.page }}><Login /></main>;

  return (
    <main className="rp-page" style={{ maxWidth: W.wide, margin: "0 auto", padding: PAD.page, ...stack(GAP.grid) }}>
      <div style={{ ...actions, alignItems: "flex-end" }} className="noprint">
        <div style={stack(4)}>
          <Txt v="h1" as="h1" color={T.navy}>Espace coach · {s.counselor.name}</Txt>
          <Txt v="body" color={T.body}>Les personnes que vous accompagnez dans le module entretien</Txt>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn kind={view.name === "list" ? "primary" : "secondary"} size="sm" onClick={() => setView({ name: "list" })} aria-current={view.name === "list" ? "page" : undefined}>Mes bénéficiaires</Btn>
          <Btn kind="secondary" size="sm" onClick={() => setModal({ step: "create" })} icon={I.plus}>Nouveau parcours</Btn>
        </div>
      </div>
      <div key={view.name + (view.code || "") + (view.takeId || "")} className="up">
        {view.name === "list" && <List s={s} open={code => setView({ name: "parcours", code })} create={() => setModal({ step: "create" })} />}
        {view.name === "parcours" && s.parcours[view.code] && <Parcours s={s} p={s.parcours[view.code]} back={() => setView({ name: "list" })} review={takeId => setView({ name: "review", code: view.code, takeId })} />}
        {view.name === "review" && s.takes[view.takeId] && <Review s={s} p={s.parcours[view.code]} take={s.takes[view.takeId]} back={() => setView({ name: "parcours", code: view.code })} />}
      </div>
      {modal?.step === "create" && (
        <Modal close={() => setModal(null)} title="Créer un parcours pour une personne accompagnée" sub="Un code personnel est généré. La personne n'a aucun compte à créer.">
          <Create done={code => setModal({ step: "created", code })} cancel={() => setModal(null)} />
        </Modal>
      )}
      {modal?.step === "created" && (
        <Modal close={() => setModal(null)} label="Parcours créé">
          <Created p={s.parcours[modal.code]} back={() => { setModal(null); setView({ name: "list" }); }} openAsBenef={() => { location.hash = `#/s/${modal.code}`; }} />
        </Modal>
      )}
    </main>
  );
}

/* Connexion simulée : identifiants fictifs pré-remplis, aucune vérification.
   À remplacer par une authentification forte en production (voir README). */
function Login() {
  const [email, setEmail] = useState(TRIAL_LOGIN.email);
  const [pwd, setPwd] = useState(TRIAL_LOGIN.password);
  const [forgot, setForgot] = useState(false);
  const ok = /.+@.+\..+/.test(email) && pwd.length >= 4;
  return (
    <Card pad="lg" level={2} topbar="coach" style={{ maxWidth: W.narrow, margin: "0 auto", ...stack(GAP.grid) }}>
      <div style={stack(12)}>
        <div><Tag tone="primary">Espace coach</Tag></div>
        <Txt v="h1" as="h1" color={T.navy}>Connexion</Txt>
        <Txt v="body" color={T.body}>Accédez à vos parcours et aux prises que l'on vous a envoyées.</Txt>
      </div>
      <form onSubmit={e => { e.preventDefault(); if (ok) setCounselor(TRIAL_LOGIN.name); }} style={stack(GAP.field)}>
        <Field id="login-email" label="Adresse électronique professionnelle">
          <Input id="login-email" type="email" inputMode="email" autoCapitalize="none" autoCorrect="off" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} />
        </Field>
        <div style={stack(4)}>
          <Field id="login-pwd" label="Mot de passe">
            <Input id="login-pwd" type="password" autoComplete="current-password" value={pwd} onChange={e => setPwd(e.target.value)} />
          </Field>
          <div style={{ textAlign: "right" }}>
            <Link onClick={() => setForgot(true)} style={{ ...TY.small, ...TY.link, minHeight: 44 }}>Mot de passe oublié ?</Link>
          </div>
          {forgot && <Notice tone="info" role="status">Contactez votre référent pour réinitialiser votre mot de passe.</Notice>}
        </div>
        <Btn kind="objective" full disabled={!ok}>Se connecter</Btn>
        <Txt v="caption" color={T.muted} style={{ textAlign: "center" }}>Accès réservé aux coachs de {ORG_NAME}.</Txt>
      </form>
    </Card>
  );
}

/* Indicateur agrégé (aucune mesure individuelle). */
function Stat({ n, l, c = T.primary }) {
  return (
    <Card style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ ...TY.num, color: c }}>{n}</div>
      <div style={{ ...TY.small, color: T.body }}>{l}</div>
    </Card>
  );
}

function List({ s, open, create }) {
  const rows = Object.values(s.parcours).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(p => ({ p, st: parcoursStatus(p, s), takes: takesOf(p.code, s) }));
  const all = Object.values(s.takes);
  const shared = all.filter(t => t.shared);
  const reviewed = shared.filter(t => t.report);
  const delays = reviewed.map(t => (new Date(t.report.sentAt) - new Date(t.sharedAt)) / 3.6e6).filter(x => x >= 0);
  const avgDelay = delays.length ? Math.round(delays.reduce((a, b) => a + b, 0) / delays.length) : null;
  const benefWithTakes = rows.filter(r => r.takes.length).length;
  const retrain = rows.filter(r => r.takes.length > 1).length;

  return (
    <div style={stack(GAP.grid)}>
      <div style={stack(12)}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: GAP.stack }}>
          <Stat n={rows.filter(r => r.st.key === "toreview").length} l="Prises à relire" c={T.accent} />
          <Stat n={rows.length} l="Parcours ouverts" />
          <Stat n={reviewed.length} l="Rapports envoyés" c={T.successDk} />
          <Stat n={benefWithTakes ? `${Math.round((retrain / benefWithTakes) * 100)} %` : "–"} l="Bénéficiaires qui se réentraînent" />
        </div>
        <Txt v="caption" color={T.muted}>
          Indicateurs agrégés uniquement, sans mesure de performance individuelle.{avgDelay != null && ` Délai moyen de relecture : ${avgDelay} h.`}
        </Txt>
      </div>
      {rows.length === 0 ? (
        <Empty icon={I.users} title="Aucun parcours pour l'instant" text="Créez un parcours pour générer le code et le lien à transmettre à la personne accompagnée."
          action={<Btn kind="primary" onClick={create} icon={I.plus}>Créer un parcours</Btn>} />
      ) : (
        <Card pad="none" level={2}>
          {rows.map(({ p, st, takes }, i) => (
            <div key={p.code} className="rp-row" style={{ display: "flex", alignItems: "center", gap: 16, padding: PAD.row, borderTop: i ? `1px solid ${T.lineLt}` : "none", background: st.key === "toreview" ? T.accentBg : T.surface, flexWrap: "wrap" }}>
              <div aria-hidden style={{ width: 40, height: 40, borderRadius: "50%", background: T.primaryBg, display: "grid", placeItems: "center", ...TY.h4, color: T.primary, flexShrink: 0 }}>{p.prenom[0]?.toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 200, ...stack(4) }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}><span style={{ ...TY.h4, color: T.navy }}>{p.prenom}</span><span style={{ ...TY.mono, color: T.muted }}>{p.code}</span></div>
                <div style={{ ...TY.small, color: T.body }}>{p.poste || "Poste non précisé"} · {takes.length} prise{takes.length > 1 ? "s" : ""} · créé le {dateFr(p.createdAt)}</div>
              </div>
              <Tag tone={st.tone}>{st.label}</Tag>
              <Btn kind={st.key === "toreview" ? "objective" : "secondary"} size="sm" onClick={() => open(p.code)}>{st.key === "toreview" ? "Relire" : "Ouvrir"}</Btn>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function Create({ done, cancel }) {
  const [prenom, setPrenom] = useState(""), [poste, setPoste] = useState(""), [warmup, setWarmup] = useState(true);
  return (
    <form onSubmit={e => { e.preventDefault(); if (prenom.trim()) done(createParcours({ prenom, poste, warmup })); }} style={stack(GAP.field)}>
      <Field id="new-prenom" label="Prénom et initiale" hint="Seul identifiant affiché. Ni numéro d'identifiant, ni adresse électronique.">
        <Input id="new-prenom" hint value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Prénom et initiale" />
      </Field>
      <Field id="new-poste" label="Poste ou secteur visé" hint="Sert à contextualiser les questions, jamais à fixer une norme.">
        <Input id="new-poste" hint value={poste} onChange={e => setPoste(e.target.value)} placeholder="Par exemple : agent d'accueil" />
      </Field>
      <div style={stack(8)}>
        <span id="new-first" style={{ ...TY.label, color: T.navy }}>Première session</span>
        <div role="radiogroup" aria-labelledby="new-first" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Toggle on={warmup} onClick={() => setWarmup(true)}>Proposer un échauffement sans analyse</Toggle>
          <Toggle on={!warmup} onClick={() => setWarmup(false)}>Directement l'entraînement</Toggle>
        </div>
      </div>
      <div className="rp-actions" style={{ ...actions, marginTop: 4 }}>
        <Back onClick={cancel}>Annuler</Back>
        <Btn kind="objective" disabled={!prenom.trim()} iconRight={I.arrow}>Générer le code</Btn>
      </div>
    </form>
  );
}

function CopyBtn({ text, label }) {
  const [ok, setOk] = useState(false);
  return <Btn kind="secondary" size="sm" onClick={() => navigator.clipboard?.writeText(text).then(() => { setOk(true); setTimeout(() => setOk(false), 1600); })} icon={ok ? I.check : I.copy}>{ok ? "Copié" : label}</Btn>;
}

function Created({ p, back, openAsBenef }) {
  if (!p) return null;
  const link = linkFor(p.code);
  return (
    <div style={{ textAlign: "center", display: "grid", justifyItems: "center", gap: 16 }}>
      <ConfirmMark />
      <div style={stack(8)}>
        <h2 style={{ ...TY.h2, color: T.navy, margin: 0 }}>Le parcours de {p.prenom} est prêt</h2>
        <Txt v="body" color={T.body}>Transmettez le code ou le lien. Il sert à tout : s'entraîner, partager une prise, recevoir le rapport.</Txt>
      </div>
      <div style={{ background: T.primaryBg, borderRadius: RAD.md, padding: PAD.sm, width: "100%", ...stack(8) }}>
        <div style={{ ...TY.overline, color: T.body }}>Code d'accès</div>
        <div style={{ ...TY.code, color: T.primary }}>{p.code}</div>
      </div>
      <div style={{ ...TY.mono, color: T.body, wordBreak: "break-all" }}>{link}</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        <CopyBtn text={p.code} label="Copier le code" />
        <CopyBtn text={link} label="Copier le lien" />
        <Btn kind="secondary" size="sm" icon={I.mail} onClick={() => { location.href = `mailto:?subject=${encodeURIComponent("Votre accès La Répét'")}&body=${encodeURIComponent(`Bonjour ${p.prenom},\n\nVoici votre accès personnel pour vous entraîner à l'entretien : ${link}\nCode : ${p.code}\n\nÀ bientôt.`)}`; }}>Préparer un courriel</Btn>
      </div>
      <div className="rp-actions" style={{ display: "flex", gap: GAP.actions, justifyContent: "center", flexWrap: "wrap", marginTop: 8 }}>
        <Btn kind="ghost" size="sm" onClick={back}>Retour à la liste</Btn>
        <Btn kind="primary" size="sm" onClick={openAsBenef}>Ouvrir l'espace bénéficiaire sur cet appareil</Btn>
      </div>
    </div>
  );
}

function Parcours({ s, p, back, review }) {
  const takes = takesOf(p.code, s);
  const shared = takes.filter(t => t.shared);
  const del = async () => { if (window.confirm(`Supprimer le parcours de ${p.prenom}, ses prises et ses rapports ?`)) { await deleteParcours(p.code); back(); } };
  const priv = takes.length - shared.length;
  return (
    <div style={stack(GAP.block)}>
      <Card level={2} style={actions}>
        <div style={stack(4)}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}><span style={{ ...TY.h2, color: T.navy }}>{p.prenom}</span><span style={{ ...TY.mono, color: T.muted }}>{p.code}</span></div>
          <div style={{ ...TY.small, color: T.body }}>
            {p.poste || "Poste non précisé"} · {p.consent ? `consentement recueilli le ${dateFr(p.consent.at)}${p.consent.ai ? "" : ", sans retour de l'assistant"}` : p.openedAt ? "lien ouvert, consentement non recueilli" : "lien pas encore ouvert"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <CopyBtn text={linkFor(p.code)} label="Copier le lien" />
          <Btn kind="danger" size="sm" onClick={del} icon={I.trash}>Supprimer</Btn>
        </div>
      </Card>
      <section style={stack(16)}>
        <div style={stack(4)}>
          <Txt v="h2" as="h2" color={T.navy}>Prises partagées</Txt>
          <Txt v="small" color={T.muted}>
            {priv > 0 ? `${priv} autre${priv > 1 ? "s" : ""} prise${priv > 1 ? "s" : ""} reste${priv > 1 ? "nt" : ""} privée${priv > 1 ? "s" : ""} : vous n'y avez pas accès.` : "Seules les prises que la personne a choisi d'envoyer apparaissent ici."}
          </Txt>
        </div>
        {shared.length === 0 && <Empty icon={I.send} text="Aucune prise partagée pour le moment." />}
        {shared.length > 0 && (
          <div style={stack(GAP.stack)}>
            {shared.map(t => (
              <Card key={t.id} pad="sm" hover style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 220, ...stack(4) }}>
                  <div style={{ ...TY.h4, color: T.navy }}>{t.question}</div>
                  <div style={{ ...TY.caption, color: T.muted }}>Envoyée le {dateFr(t.sharedAt)} · {Math.round(t.duration)} s{t.report ? ` · rapport envoyé le ${dateFr(t.report.sentAt)}` : ""}</div>
                </div>
                <Tag tone={t.report ? "success" : "warning"}>{t.report ? "Rapport envoyé" : "À relire"}</Tag>
                <Btn kind={t.report ? "secondary" : "objective"} size="sm" onClick={() => review(t.id)}>{t.report ? "Revoir" : "Relire et annoter"}</Btn>
              </Card>
            ))}
          </div>
        )}
      </section>
      <div><Back onClick={back} /></div>
    </div>
  );
}

const nid = () => Math.random().toString(36).slice(2, 9);

function Review({ s, p, take, back }) {
  const url = useVideoUrl(take);
  const playerRef = useRef(null);
  const draft = take.report || take.draft || {};
  const [intro, setIntro] = useState(draft.intro || "");
  const [comments, setComments] = useState(draft.comments || {});
  const [notes, setNotes] = useState(draft.notes || []);
  const [noteText, setNoteText] = useState("");
  const [active, setActive] = useState(null);
  const [sent, setSent] = useState(false);
  const A = take.analysis || { synthese: "", dimensions: [] };
  const virtualTake = useMemo(() => ({ ...take, report: { notes } }), [take, notes]);

  const saveDraft = (patch = {}) => updateTake(take.id, { draft: { intro, comments, notes, ...patch } });
  const addNote = () => {
    const t = playerRef.current ? playerRef.current.currentTime : 0;
    if (!noteText.trim()) return;
    const next = [...notes, { id: nid(), t, text: noteText.trim() }];
    setNotes(next); setNoteText(""); saveDraft({ notes: next });
  };
  const seek = (t, id) => { setActive(id); const v = playerRef.current; if (v) { v.currentTime = t; v.play().catch(() => {}); } };
  const send = () => {
    updateTake(take.id, { report: { intro: intro.trim(), comments, notes, sentAt: new Date().toISOString(), by: s.counselor.name }, draft: null });
    setSent(true);
  };

  if (sent) return (
    <Confirm as="h2" title={`Rapport envoyé à ${p.prenom}`} actions={<Btn kind="primary" onClick={back}>Retour au parcours</Btn>}>
      {p.prenom} le retrouve dans son espace, avec son code. Vos remarques apparaissent à côté de chaque observation.
    </Confirm>
  );

  return (
    <div style={stack(GAP.grid)}>
      <div style={stack(4)}>
        <Txt v="h2" as="h2" color={T.navy}>{take.question}</Txt>
        <Txt v="small" color={T.muted}>{p.prenom} · envoyée le {dateFr(take.sharedAt)}{take.report ? " · rapport déjà envoyé, vous pouvez le modifier et le renvoyer" : ""}</Txt>
      </div>
      <div className="rp-split">
        <div style={stack(GAP.stack)}>
          <Player take={virtualTake} url={url} markers={markersOf(virtualTake)} active={active} onActive={setActive} playerRef={playerRef} />
          <Card style={stack(8)}>
            <label htmlFor="review-note" style={{ ...TY.h4, color: T.navy }}>Ajouter une note au moment en cours de lecture</label>
            <div style={{ display: "flex", gap: 8 }}>
              <Input id="review-note" value={noteText} onChange={e => setNoteText(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()} placeholder="Mettez la vidéo en pause au bon moment, puis écrivez votre remarque" style={{ flex: 1, minWidth: 0 }} />
              <Btn kind="primary" onClick={addNote} disabled={!noteText.trim()}>Ajouter</Btn>
            </div>
            {notes.length > 0 && (
              <div>
                {notes.slice().sort((a, b) => a.t - b.t).map(n => (
                  <div key={n.id} style={{ display: "flex", gap: 8, alignItems: "center", borderTop: `1px solid ${T.lineLt}` }}>
                    <TimeChip t={n.t} tone="primary" onClick={() => seek(n.t, n.id)} label={`Aller à ${fmt(n.t)}`} />
                    <span style={{ flex: 1, ...TY.small, color: T.navy }}>{n.text}</span>
                    <IconBtn icon={I.trash} label="Supprimer la note" tone="muted" size={16} onClick={() => { const next = notes.filter(x => x.id !== n.id); setNotes(next); saveDraft({ notes: next }); }} />
                  </div>
                ))}
              </div>
            )}
          </Card>
          {take.note && (
            <Card style={stack(8)}>
              <div style={{ ...TY.label, color: T.body }}>Le mot de {p.prenom} à l'envoi</div>
              <p style={{ ...TY.body, color: T.navy, margin: 0, fontStyle: "italic" }}>« {take.note} »</p>
            </Card>
          )}
          {take.transcript && (
            <details>
              <summary style={{ ...TY.label, color: T.primary, cursor: "pointer", minHeight: 44, display: "flex", alignItems: "center" }}>Afficher la transcription</summary>
              <Card style={{ marginTop: 8 }}>
                {take.segments.map((sg, i) => (
                  <Bare key={i} onClick={() => seek(sg.start)} style={{ display: "flex", gap: 12, padding: "4px 0", width: "100%", textAlign: "left" }}>
                    <span style={{ ...TY.time, color: T.muted, minWidth: 40, paddingTop: 4 }}>{fmt(sg.start)}</span>
                    <span style={{ ...TY.small, color: T.navy }}>{sg.text}</span>
                  </Bare>
                ))}
              </Card>
            </details>
          )}
        </div>

        <div style={stack(GAP.stack)}>
          <Card style={stack(8)}>
            <label htmlFor="review-intro" style={{ ...TY.h3, color: T.navy }}>Votre mot d'introduction</label>
            <Txt v="caption" color={T.muted} id="review-intro-h">La première chose que {p.prenom} lira. Adressez-vous directement à la personne.</Txt>
            <Textarea id="review-intro" aria-describedby="review-intro-h" value={intro} onChange={e => setIntro(e.target.value)} onBlur={() => saveDraft()} placeholder={`${p.prenom}, j'ai regardé ta prise…`} />
          </Card>
          <div style={{ ...stack(4), marginTop: 8 }}>
            <h3 style={{ ...TY.h4, color: T.navy, margin: 0 }}>Observations de l'assistant</h3>
            <Txt v="caption" color={T.muted}>Nuancez, contextualisez ou contredisez : votre lecture prime sur celle de l'assistant.</Txt>
          </div>
          {A.dimensions.length === 0 && <Card><Txt v="small" color={T.body}>{A.synthese || "Pas d'observation automatique pour cette prise."}</Txt></Card>}
          {A.dimensions.map(d => (
            <div key={d.id} style={stack(8)}>
              <DimCard d={d} active={active === d.id} onClick={() => seek(d.t, d.id)} />
              <Input value={comments[d.id] || ""} onChange={e => setComments(c => ({ ...c, [d.id]: e.target.value }))} onBlur={() => saveDraft()} placeholder="Votre remarque sur cette observation (facultatif)" aria-label={`Votre remarque sur l'observation : ${d.titre}`} />
            </div>
          ))}
          <Btn kind="objective" full onClick={send} icon={I.send}>{take.report ? "Renvoyer le rapport" : "Envoyer le rapport"}</Btn>
          <Txt v="caption" color={T.muted} style={{ textAlign: "center" }}>Rien n'est transmis tant que vous n'avez pas envoyé le rapport. Vos saisies sont enregistrées en brouillon.</Txt>
        </div>
      </div>
      <div><Back onClick={back} /></div>
    </div>
  );
}
