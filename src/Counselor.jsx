import React, { useMemo, useRef, useState } from "react";
import { T, GRAD_SOFT, FD, FB, FM, RAD, SH, Card, Tag, Btn, Back, Icon, I } from "./ui.jsx";
import { useStore, TRIAL_LOGIN, setCounselor, logoutCounselor, createParcours, deleteParcours, takesOf, updateTake, parcoursStatus } from "./lib/store.js";
import { Player, DimCard, markersOf, useVideoUrl } from "./Report.jsx";
import { fmt } from "./lib/analysis.js";

const inp = { width: "100%", height: 48, padding: "0 16px", borderRadius: RAD.md, border: `1.5px solid ${T.line}`, font: `400 15px ${FB}`, color: T.navy, background: "#fff" };
const dateFr = iso => (iso ? new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "");
export const linkFor = code => `${location.origin}${location.pathname}#/s/${code}`;

export default function Counselor() {
  const s = useStore();
  const [view, setView] = useState({ name: "list" });
  if (!s.counselor) return <main className="rp-pad" style={{ padding: "48px 24px 64px" }}><Login /></main>;

  return (
    <main className="rp-pad" style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 24px 64px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }} className="noprint">
        <div>
          <h1 style={{ font: `800 27px ${FD}`, margin: "0 0 3px", letterSpacing: "-.025em", color: T.navy }}>Espace coach · {s.counselor.name}</h1>
          <p style={{ font: `400 14px ${FB}`, color: T.body, margin: 0 }}>Les personnes que vous accompagnez dans le module entretien</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn kind={view.name === "list" ? "dark" : "secondary"} size="sm" onClick={() => setView({ name: "list" })}>Mes bénéficiaires</Btn>
          <Btn kind={view.name === "create" ? "dark" : "secondary"} size="sm" onClick={() => setView({ name: "create" })}><Icon d={I.plus} s={15} c={view.name === "create" ? "#fff" : T.primary} /> Nouveau parcours</Btn>
          <Btn kind="ghost" size="sm" onClick={logoutCounselor}>Se déconnecter</Btn>
        </div>
      </div>
      <div key={view.name + (view.code || "") + (view.takeId || "")} className="up">
        {view.name === "list" && <List s={s} open={code => setView({ name: "parcours", code })} create={() => setView({ name: "create" })} />}
        {view.name === "create" && <Create done={code => setView({ name: "created", code })} cancel={() => setView({ name: "list" })} />}
        {view.name === "created" && <Created p={s.parcours[view.code]} back={() => setView({ name: "list" })} openAsBenef={() => { location.hash = `#/s/${view.code}`; }} />}
        {view.name === "parcours" && s.parcours[view.code] && <Parcours s={s} p={s.parcours[view.code]} back={() => setView({ name: "list" })} review={takeId => setView({ name: "review", code: view.code, takeId })} />}
        {view.name === "review" && s.takes[view.takeId] && <Review s={s} p={s.parcours[view.code]} take={s.takes[view.takeId]} back={() => setView({ name: "parcours", code: view.code })} />}
      </div>
    </main>
  );
}

/* Connexion simulée : identifiants fictifs pré-remplis, aucune vérification.
   À remplacer par une authentification forte en production (voir README). */
function Login() {
  const [email, setEmail] = useState(TRIAL_LOGIN.email);
  const [pwd, setPwd] = useState(TRIAL_LOGIN.password);
  const ok = /.+@.+\..+/.test(email) && pwd.length >= 4;
  const lab = { font: `600 13px ${FB}`, color: T.navy, display: "block", margin: "0 0 7px" };
  return (
    <Card pad={32} topbar="coach" style={{ maxWidth: 440, margin: "0 auto", boxShadow: SH.sm }}>
      <Tag tone="primary">Espace coach</Tag>
      <h1 style={{ font: `800 24px ${FD}`, margin: "12px 0 6px", color: T.navy }}>Connexion</h1>
      <p style={{ font: `400 14px/1.6 ${FB}`, color: T.body, margin: "0 0 20px" }}>Accédez à vos parcours et aux prises que l'on vous a envoyées.</p>
      <form onSubmit={e => { e.preventDefault(); if (ok) setCounselor(TRIAL_LOGIN.name); }}>
        <label htmlFor="login-email" style={lab}>Adresse électronique professionnelle</label>
        <input id="login-email" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} style={inp} />
        <label htmlFor="login-pwd" style={{ ...lab, marginTop: 14 }}>Mot de passe</label>
        <input id="login-pwd" type="password" autoComplete="current-password" value={pwd} onChange={e => setPwd(e.target.value)} style={inp} />
        <div style={{ marginTop: 20 }}><Btn kind="primary" full disabled={!ok}>Se connecter</Btn></div>
      </form>
    </Card>
  );
}

function Stat({ n, l, c }) {
  return (
    <Card style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ font: `800 28px ${FM}`, color: c, lineHeight: 1 }}>{n}</div>
      <div style={{ font: `500 13px/1.3 ${FB}`, color: T.body }}>{l}</div>
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
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 8 }}>
        <Stat n={rows.filter(r => r.st.key === "toreview").length} l="Prises à relire" c={T.accent} />
        <Stat n={rows.length} l="Parcours ouverts" c={T.primary} />
        <Stat n={reviewed.length} l="Rapports envoyés" c={T.success} />
        <Stat n={benefWithTakes ? `${Math.round((retrain / benefWithTakes) * 100)} %` : "–"} l="Bénéficiaires qui se réentraînent" c={T.violet} />
      </div>
      <p style={{ font: `400 12px ${FB}`, color: T.muted, margin: "0 0 18px" }}>
        Indicateurs agrégés uniquement, sans mesure de performance individuelle.{avgDelay != null && ` Délai moyen de relecture : ${avgDelay} h.`}
      </p>
      {rows.length === 0 ? (
        <Card pad={32} style={{ textAlign: "center" }}>
          <div style={{ font: `700 17px ${FD}`, color: T.navy, marginBottom: 6 }}>Aucun parcours pour l'instant</div>
          <p style={{ font: `400 14px ${FB}`, color: T.body, margin: "0 0 16px" }}>Créez un parcours pour générer le code et le lien à transmettre à la personne accompagnée.</p>
          <Btn kind="primary" onClick={create}><Icon d={I.plus} s={16} c="#fff" /> Créer un parcours</Btn>
        </Card>
      ) : (
        <Card pad={0} style={{ overflow: "hidden", boxShadow: SH.sm }}>
          {rows.map(({ p, st, takes }, i) => (
            <div key={p.code} style={{ display: "flex", alignItems: "center", gap: 16, padding: "15px 22px", borderTop: i ? `1px solid ${T.lineLt}` : "none", background: st.key === "toreview" ? `${T.accent}08` : "#fff", flexWrap: "wrap" }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: GRAD_SOFT, display: "grid", placeItems: "center", font: `700 15px ${FD}`, color: T.primary }}>{p.prenom[0]?.toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ font: `700 15px ${FD}`, color: T.navy }}>{p.prenom} <span style={{ font: `600 12px ${FM}`, color: T.muted, marginLeft: 6 }}>{p.code}</span></div>
                <div style={{ font: `400 13px ${FB}`, color: T.body }}>{p.poste || "Poste non précisé"} · {takes.length} prise{takes.length > 1 ? "s" : ""} · créé le {dateFr(p.createdAt)}</div>
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

function Toggle({ on, set, children }) {
  return <button type="button" onClick={set} style={{ font: `600 13px ${FB}`, height: 42, padding: "0 16px", borderRadius: RAD.md, cursor: "pointer", border: `1.5px solid ${on ? T.primary : T.line}`, background: on ? GRAD_SOFT : "#fff", color: on ? T.primary : T.body }}>{children}</button>;
}

function Create({ done, cancel }) {
  const [prenom, setPrenom] = useState(""), [poste, setPoste] = useState(""), [warmup, setWarmup] = useState(true);
  return (
    <Card pad={32} style={{ maxWidth: 600, margin: "0 auto", boxShadow: SH.sm }}>
      <Tag tone="primary">Nouveau parcours</Tag>
      <h2 style={{ font: `800 22px ${FD}`, margin: "12px 0 6px", color: T.navy }}>Créer un parcours pour une personne accompagnée</h2>
      <p style={{ font: `400 14px/1.6 ${FB}`, color: T.body, margin: "0 0 20px" }}>Un code personnel est généré. La personne n'a aucun compte à créer.</p>
      <form onSubmit={e => { e.preventDefault(); if (prenom.trim()) done(createParcours({ prenom, poste, warmup })); }}>
        <label style={{ font: `600 14px ${FB}`, display: "block", marginBottom: 4, color: T.navy }}>Prénom et initiale</label>
        <div style={{ font: `400 12px ${FB}`, color: T.muted, marginBottom: 8 }}>Seul identifiant affiché. Ni numéro d'identifiant, ni adresse électronique.</div>
        <input value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Prénom et initiale" style={inp} />
        <label style={{ font: `600 14px ${FB}`, display: "block", margin: "16px 0 4px", color: T.navy }}>Poste ou secteur visé</label>
        <div style={{ font: `400 12px ${FB}`, color: T.muted, marginBottom: 8 }}>Sert à contextualiser les questions, jamais à fixer une norme.</div>
        <input value={poste} onChange={e => setPoste(e.target.value)} placeholder="Par exemple : agent d'accueil" style={inp} />
        <label style={{ font: `600 14px ${FB}`, display: "block", margin: "16px 0 8px", color: T.navy }}>Première session</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Toggle on={warmup} set={() => setWarmup(true)}>Proposer un échauffement sans analyse</Toggle>
          <Toggle on={!warmup} set={() => setWarmup(false)}>Directement l'entraînement</Toggle>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 26 }}>
          <Back onClick={cancel} />
          <Btn kind="primary" disabled={!prenom.trim()}>Générer le code&nbsp;<Icon d={I.arrow} s={18} c="#fff" /></Btn>
        </div>
      </form>
    </Card>
  );
}

function CopyBtn({ text, label }) {
  const [ok, setOk] = useState(false);
  return <Btn kind="secondary" size="sm" onClick={() => navigator.clipboard?.writeText(text).then(() => { setOk(true); setTimeout(() => setOk(false), 1600); })}><Icon d={ok ? I.check : I.copy} s={15} c={T.primary} /> {ok ? "Copié" : label}</Btn>;
}

function Created({ p, back, openAsBenef }) {
  if (!p) return null;
  const link = linkFor(p.code);
  return (
    <Card pad={36} style={{ maxWidth: 600, margin: "0 auto", textAlign: "center", boxShadow: SH.sm }}>
      <div style={{ width: 58, height: 58, borderRadius: "50%", background: T.successBg, display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Icon d={I.check} s={26} c={T.success} /></div>
      <h2 style={{ font: `800 22px ${FD}`, margin: "0 0 8px", color: T.navy }}>Le parcours de {p.prenom} est prêt</h2>
      <p style={{ font: `400 14px/1.6 ${FB}`, color: T.body, margin: "0 auto 18px", maxWidth: 430 }}>Transmettez le code ou le lien. Il sert à tout : s'entraîner, partager une prise, recevoir le rapport.</p>
      <div style={{ background: GRAD_SOFT, borderRadius: RAD.md, padding: 18, marginBottom: 14 }}>
        <div style={{ font: `500 11px ${FB}`, color: T.muted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Code d'accès</div>
        <div style={{ font: `700 30px ${FM}`, color: T.primary, letterSpacing: ".25em" }}>{p.code}</div>
      </div>
      <div style={{ font: `500 12.5px ${FM}`, color: T.body, wordBreak: "break-all", marginBottom: 16 }}>{link}</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        <CopyBtn text={p.code} label="Copier le code" />
        <CopyBtn text={link} label="Copier le lien" />
        <Btn kind="secondary" size="sm" onClick={() => { location.href = `mailto:?subject=${encodeURIComponent("Votre accès La Répét'")}&body=${encodeURIComponent(`Bonjour ${p.prenom},\n\nVoici votre accès personnel pour vous entraîner à l'entretien : ${link}\nCode : ${p.code}\n\nÀ bientôt.`)}`; }}>Préparer un courriel</Btn>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 20 }}>
        <Btn kind="ghost" size="sm" onClick={back}>Retour à la liste</Btn>
        <Btn kind="primary" size="sm" onClick={openAsBenef}>Ouvrir l'espace bénéficiaire sur cet appareil</Btn>
      </div>
    </Card>
  );
}

function Parcours({ s, p, back, review }) {
  const takes = takesOf(p.code, s);
  const shared = takes.filter(t => t.shared);
  const del = async () => { if (window.confirm(`Supprimer le parcours de ${p.prenom}, ses prises et ses rapports ?`)) { await deleteParcours(p.code); back(); } };
  return (
    <div>
      <Card style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ font: `800 20px ${FD}`, color: T.navy }}>{p.prenom} <span style={{ font: `600 13px ${FM}`, color: T.muted }}>{p.code}</span></div>
          <div style={{ font: `400 13px ${FB}`, color: T.body }}>
            {p.poste || "Poste non précisé"} · {p.consent ? `consentement recueilli le ${dateFr(p.consent.at)}${p.consent.ai ? "" : ", sans retour de l'assistant"}` : p.openedAt ? "lien ouvert, consentement non recueilli" : "lien pas encore ouvert"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <CopyBtn text={linkFor(p.code)} label="Copier le lien" />
          <Btn kind="ghost" size="sm" onClick={del}><Icon d={I.trash} s={15} c={T.primary} /> Supprimer</Btn>
        </div>
      </Card>
      <h2 style={{ font: `800 18px ${FD}`, color: T.navy, margin: "0 0 4px" }}>Prises partagées</h2>
      <p style={{ font: `400 13px ${FB}`, color: T.muted, margin: "0 0 12px" }}>
        {takes.length - shared.length > 0 ? `${takes.length - shared.length} autre${takes.length - shared.length > 1 ? "s" : ""} prise${takes.length - shared.length > 1 ? "s" : ""} reste${takes.length - shared.length > 1 ? "nt" : ""} privée${takes.length - shared.length > 1 ? "s" : ""} : vous n'y avez pas accès.` : "Seules les prises que la personne a choisi d'envoyer apparaissent ici."}
      </p>
      {shared.length === 0 && <Card><div style={{ font: `400 14px ${FB}`, color: T.body }}>Aucune prise partagée pour le moment.</div></Card>}
      {shared.map(t => (
        <Card key={t.id} hover style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ font: `700 14.5px ${FD}`, color: T.navy }}>{t.question}</div>
            <div style={{ font: `400 12.5px ${FB}`, color: T.muted }}>Envoyée le {dateFr(t.sharedAt)} · {Math.round(t.duration)} s{t.report ? ` · rapport envoyé le ${dateFr(t.report.sentAt)}` : ""}</div>
          </div>
          <Tag tone={t.report ? "success" : "warning"}>{t.report ? "Rapport envoyé" : "À relire"}</Tag>
          <Btn kind={t.report ? "secondary" : "objective"} size="sm" onClick={() => review(t.id)}>{t.report ? "Revoir" : "Relire et annoter"}</Btn>
        </Card>
      ))}
      <div style={{ marginTop: 14 }}><Back onClick={back} /></div>
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
    <Card pad={40} style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", boxShadow: SH.sm }}>
      <div style={{ width: 58, height: 58, borderRadius: "50%", background: T.successBg, display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Icon d={I.check} s={26} c={T.success} /></div>
      <h2 style={{ font: `800 22px ${FD}`, margin: "0 0 10px", color: T.navy }}>Rapport envoyé à {p.prenom}</h2>
      <p style={{ font: `400 14px/1.6 ${FB}`, color: T.body, margin: "0 auto 20px", maxWidth: 400 }}>{p.prenom} le retrouve dans son espace, avec son code. Vos remarques apparaissent à côté de chaque observation.</p>
      <Btn kind="primary" onClick={back}>Retour au parcours</Btn>
    </Card>
  );

  return (
    <div>
      <div style={{ font: `800 20px ${FD}`, color: T.navy, marginBottom: 4 }}>{take.question}</div>
      <div style={{ font: `400 13px ${FB}`, color: T.muted, marginBottom: 16 }}>{p.prenom} · envoyée le {dateFr(take.sharedAt)}{take.report ? " · rapport déjà envoyé, vous pouvez le modifier et le renvoyer" : ""}</div>
      <div className="rp-split" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(0,1fr)", gap: 20 }}>
        <div>
          <Player take={virtualTake} url={url} markers={markersOf(virtualTake)} active={active} onActive={setActive} playerRef={playerRef} />
          <Card style={{ marginTop: 12 }}>
            <div style={{ font: `700 14px ${FD}`, color: T.navy, marginBottom: 8 }}>Ajouter une note au moment en cours de lecture</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={noteText} onChange={e => setNoteText(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()} placeholder="Mettez la vidéo en pause au bon moment, puis écrivez votre remarque" style={{ ...inp, height: 42, font: `400 13.5px ${FB}` }} />
              <Btn kind="primary" size="sm" onClick={addNote} disabled={!noteText.trim()}>Ajouter</Btn>
            </div>
            {notes.slice().sort((a, b) => a.t - b.t).map(n => (
              <div key={n.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderTop: `1px solid ${T.lineLt}`, marginTop: 8 }}>
                <button onClick={() => seek(n.t, n.id)} style={{ minWidth: 44, height: 22, borderRadius: RAD.pill, background: T.primary, color: "#fff", border: "none", font: `700 11px ${FM}`, cursor: "pointer" }}>{fmt(n.t)}</button>
                <span style={{ flex: 1, font: `400 13.5px ${FB}`, color: T.navy }}>{n.text}</span>
                <button aria-label="Supprimer la note" onClick={() => { const next = notes.filter(x => x.id !== n.id); setNotes(next); saveDraft({ notes: next }); }} style={{ background: "none", border: "none", cursor: "pointer" }}><Icon d={I.trash} s={15} c={T.muted} /></button>
              </div>
            ))}
          </Card>
          {take.note && (
            <Card style={{ marginTop: 12 }}>
              <div style={{ font: `600 13px ${FB}`, color: T.body, marginBottom: 6 }}>Le mot de {p.prenom} à l'envoi</div>
              <p style={{ font: `400 14px/1.6 ${FB}`, color: T.navy, margin: 0, fontStyle: "italic" }}>« {take.note} »</p>
            </Card>
          )}
          {take.transcript && (
            <details style={{ marginTop: 12 }}>
              <summary style={{ font: `600 13px ${FB}`, color: T.primary, cursor: "pointer" }}>Afficher la transcription</summary>
              <Card style={{ marginTop: 8 }}>
                {take.segments.map((sg, i) => (
                  <div key={i} onClick={() => seek(sg.start)} style={{ display: "flex", gap: 10, padding: "4px 0", cursor: "pointer" }}>
                    <span style={{ font: `600 11px ${FM}`, color: T.muted, minWidth: 40 }}>{fmt(sg.start)}</span>
                    <span style={{ font: `400 13.5px/1.5 ${FB}`, color: T.navy }}>{sg.text}</span>
                  </div>
                ))}
              </Card>
            </details>
          )}
        </div>

        <div>
          <Card style={{ marginBottom: 14 }}>
            <h3 style={{ font: `700 16px ${FD}`, margin: "0 0 4px", color: T.navy }}>Votre mot d'introduction</h3>
            <p style={{ font: `400 12px ${FB}`, color: T.muted, margin: "0 0 10px" }}>La première chose que {p.prenom} lira. Adressez-vous directement à la personne.</p>
            <textarea value={intro} onChange={e => setIntro(e.target.value)} onBlur={() => saveDraft()} placeholder={`${p.prenom}, j'ai regardé ta prise…`}
              style={{ width: "100%", minHeight: 90, padding: 12, borderRadius: RAD.md, border: `1.5px solid ${T.line}`, font: `400 14px/1.5 ${FB}`, color: T.navy, resize: "vertical" }} />
          </Card>
          <div style={{ font: `700 14px ${FD}`, color: T.navy, margin: "0 2px 4px" }}>Observations de l'assistant</div>
          <p style={{ font: `400 12px ${FB}`, color: T.muted, margin: "0 2px 10px" }}>Nuancez, contextualisez ou contredisez : votre lecture prime sur celle de l'assistant.</p>
          {A.dimensions.length === 0 && <Card><div style={{ font: `400 13px ${FB}`, color: T.body }}>{A.synthese || "Pas d'observation automatique pour cette prise."}</div></Card>}
          {A.dimensions.map(d => (
            <div key={d.id}>
              <DimCard d={d} compact active={active === d.id} onClick={() => seek(d.t, d.id)} />
              <input value={comments[d.id] || ""} onChange={e => setComments(c => ({ ...c, [d.id]: e.target.value }))} onBlur={() => saveDraft()} placeholder="Votre remarque sur cette observation (facultatif)"
                style={{ ...inp, height: 40, font: `400 13px ${FB}`, marginTop: -4, marginBottom: 14 }} />
            </div>
          ))}
          <Btn kind="objective" full onClick={send}>{take.report ? "Renvoyer le rapport" : "Envoyer le rapport"}&nbsp;<Icon d={I.send} s={16} c="#fff" /></Btn>
          <p style={{ font: `400 11.5px/1.4 ${FB}`, color: T.muted, textAlign: "center", marginTop: 10 }}>Rien n'est transmis tant que vous n'avez pas envoyé le rapport. Vos saisies sont enregistrées en brouillon.</p>
        </div>
      </div>
      <div style={{ marginTop: 14 }}><Back onClick={back} /></div>
    </div>
  );
}
