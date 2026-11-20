import React, { useEffect, useRef, useState } from "react";
import { T, GRAD_SOFT, GRAD_AI, GRAD_AI_SOFT, FD, FB, FM, RAD, SH, Card, Tag, Btn, Back, Icon, I, Rail, GradHead, RepetMark } from "./ui.jsx";
import Recorder from "./Recorder.jsx";
import WarmupStage from "./WarmupStage.jsx";
import Assistant from "./Assistant.jsx";
import { ReportBody } from "./Report.jsx";
import { useStore, TRIAL_CODE, findParcours, updateParcours, takesOf, createTake, updateTake, deleteTake, withdrawConsent, saveWarmupDebrief, loadWarmupDebrief, clearWarmupDebrief } from "./lib/store.js";
import { transcribe } from "./lib/transcribe.js";
import { analyze } from "./lib/analysis.js";
import { QUESTIONS, fill, WARMUP_PHRASES, WARMUP_PROMPTS, fillPhrase, randomPhraseIndex, WORK_TOPICS, questionsForTopics } from "./lib/questions.js";
import { searchJobs, norm } from "./lib/jobs.js";
import { FEELINGS, feelingAck } from "./lib/assistant.js";

const wrap = w => ({ maxWidth: w, margin: "0 auto" });
const dateFr = iso => new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

export default function Beneficiary({ initialCode, setModal, onCode }) {
  const s = useStore();
  const [code, setCode] = useState(() => (initialCode && findParcours(initialCode) ? initialCode.toUpperCase() : null));
  const [view, setView] = useState("home");
  const [ctx, setCtx] = useState({}); // question, recording, takeId, mode ; série : queue (textes), qi (rang), selection, preselect
  const p0 = code ? s.parcours[code] : null;
  const p = p0 && { ...p0, counselor: p0.counselor || s.counselor?.name || "" }; // nom du coach affiché

  useEffect(() => { if (p && !p.openedAt) updateParcours(p.code, { openedAt: new Date().toISOString() }); }, [p?.code]);
  useEffect(() => { if (code && !p) setCode(null); }, [p, code]); // parcours supprimé par le coach
  useEffect(() => { onCode && onCode(code); }, [code]); // mémorise l'espace ouvert (bouton « Mon espace »)

  if (!p) return <main className="rp-pad" style={{ padding: "36px 24px 64px" }}><CodeEntry initial={initialCode} onOk={c => { setCode(c); setView("home"); }} /></main>;
  if (!p.consent) return <main className="rp-pad" style={{ padding: "36px 24px 64px" }}><Consent p={p} setModal={setModal} onBack={() => setCode(null)} /></main>;

  const go = (v, patch) => { if (patch) setCtx(c => ({ ...c, ...patch })); setView(v); window.scrollTo({ top: 0 }); };
  const flowSteps = ["Question", "Entraînement", "Analyse", "Retour"];
  const flowIdx = { pick: 0, record: 1, processing: 2, choose: 3, report: 3 }[view];
  const take = ctx.takeId ? s.takes[ctx.takeId] : null;
  const total = ctx.queue?.length || 0;
  const series = total ? { i: ctx.qi || 0, n: total, hasNext: (ctx.qi || 0) < total - 1 } : null;
  const nextQuestion = () => go("record", { qi: series.i + 1, question: ctx.queue[series.i + 1], takeId: null, recording: null });
  const stopSeries = () => go("home", { queue: null, qi: 0 });

  return (
    <main className="rp-pad" style={{ padding: "36px 24px 64px" }}>
      {flowIdx !== undefined && <div style={{ ...wrap(view === "report" && ctx.mode === "video" ? 1000 : 820), marginBottom: 28 }} className="noprint"><Rail step={flowIdx} steps={flowSteps} /></div>}
      <div key={view} className="up">
        {view === "home" && <Home p={p} takes={takesOf(p.code, s)} go={go} counselor={p.counselor} onQuit={() => setCode(null)} />}
        {view === "warmup" && <Warmup p={p} go={go} setModal={setModal} />}
        {view === "pick" && <Pick p={p} ctx={ctx} go={go} />}
        {view === "record" && (
          <Card pad={28} style={{ ...wrap(820), boxShadow: SH.sm }}>
            <Tag tone="primary">{series && series.n > 1 ? `Entraînement · question ${series.i + 1} sur ${series.n}` : "Entraînement"}</Tag>
            <h1 style={{ font: `800 24px ${FD}`, margin: "12px 0 6px", color: T.navy, letterSpacing: "-.02em" }}>À vous. Reprenez autant que vous voulez.</h1>
            <p style={{ font: `400 14px/1.55 ${FB}`, color: T.body, margin: "0 0 16px" }}>Aucun signal ne vous interrompt pendant l'enregistrement. Le retour vient après, et c'est vous qui décidez de le partager.</p>
            <EmotionNote setModal={setModal} />
            <Recorder question={ctx.question} setModal={setModal} onCancel={() => go("pick")}
              trackGaze={!!p.consent.ai} validateLabel={p.consent.ai ? "Voir mon retour" : "Enregistrer ma réponse"}
              onDone={rec => go("processing", { recording: rec })} />
          </Card>
        )}
        {view === "processing" && <Processing p={p} ctx={ctx} go={go} />}
        {view === "choose" && take && <Choose take={take} go={go} series={series} />}
        {view === "report" && take && <TakeReport p={p} take={take} mode={ctx.mode} go={go} series={series} nextQuestion={nextQuestion} stopSeries={stopSeries} />}
        {view === "share" && take && <Share p={p} take={take} go={go} />}
        {view === "sent" && <Sent p={p} go={go} series={series} nextQuestion={nextQuestion} />}
      </div>
    </main>
  );
}

/* ─── Saisie du code ─── */
function CodeEntry({ initial, onOk }) {
  const [code, setCode] = useState((initial || TRIAL_CODE).toUpperCase());
  const [err, setErr] = useState(initial ? "Ce code n'existe pas ou n'est plus actif." : "");
  const submit = e => {
    e?.preventDefault();
    const p = findParcours(code);
    if (p) onOk(p.code); else setErr("Ce code n'existe pas ou n'est plus actif. Vérifiez-le auprès de votre coach.");
  };
  return (
    <div style={{ ...wrap(460), textAlign: "center" }}>
      <div style={{ display: "inline-flex", marginBottom: 24 }}><RepetMark s={58} /></div>
      <h1 style={{ font: `800 30px ${FD}`, letterSpacing: "-.03em", color: T.navy, margin: "0 0 12px" }}>Bienvenue sur La Répét'</h1>
      <p style={{ font: `400 16px/1.6 ${FB}`, color: T.body, margin: "0 0 28px" }}>Saisissez le code transmis par votre coach, ou ouvrez directement le lien qu'il vous a envoyé.</p>
      <Card pad={28} style={{ boxShadow: SH.sm }}>
        <form onSubmit={submit}>
          <label htmlFor="code" style={{ font: `600 13px ${FB}`, color: T.navy, display: "block", textAlign: "left", marginBottom: 8 }}>Votre code d'accès</label>
          <input id="code" value={code} autoComplete="off" maxLength={6} onChange={e => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")); setErr(""); }} placeholder="6 caractères"
            style={{ width: "100%", height: 56, padding: "0 18px", borderRadius: RAD.md, border: `1.5px solid ${err ? T.errorDk : T.line}`, font: `700 22px ${FM}`, letterSpacing: ".25em", textAlign: "center", color: T.navy, background: T.bg }} />
          {err && <div role="alert" style={{ font: `500 13px ${FB}`, color: T.errorDk, marginTop: 8, textAlign: "left" }}>{err}</div>}
          <div style={{ marginTop: 20 }}><Btn kind="objective" size="lg" full disabled={code.length < 6}>Accéder à mon espace&nbsp;<Icon d={I.arrow} s={18} c="#fff" /></Btn></div>
        </form>
      </Card>
      <p style={{ font: `400 12.5px ${FB}`, color: T.muted, marginTop: 20 }}>Aucun compte à créer. Ce code vous est personnel.</p>
    </div>
  );
}

/* ─── Consentement ─── */
function Consent({ p, setModal, onBack }) {
  const [c, setC] = useState({ local: false, ai: true });
  const box = (k, title, text, required) => (
    <div onClick={() => setC(x => ({ ...x, [k]: !x[k] }))} role="checkbox" aria-checked={c[k]} tabIndex={0}
      onKeyDown={e => (e.key === " " || e.key === "Enter") && (e.preventDefault(), setC(x => ({ ...x, [k]: !x[k] })))}
      style={{ display: "flex", gap: 13, padding: 16, borderRadius: RAD.md, border: `1.5px solid ${c[k] ? T.primary : T.line}`, background: c[k] ? GRAD_SOFT : "#fff", cursor: "pointer", marginBottom: 10 }}>
      <div style={{ width: 22, height: 22, borderRadius: RAD.xs, flexShrink: 0, marginTop: 1, background: c[k] ? T.primary : "#fff", border: `2px solid ${c[k] ? T.primary : T.faint}`, display: "grid", placeItems: "center" }}>{c[k] && <Icon d={I.check} s={13} c="#fff" />}</div>
      <div>
        <div style={{ font: `700 14.5px ${FB}`, color: T.navy, marginBottom: 2 }}>{title} {required && <span style={{ font: `400 11px ${FB}`, color: T.muted }}>· nécessaire</span>}</div>
        <div style={{ font: `400 13px/1.55 ${FB}`, color: T.body }}>{text}</div>
      </div>
    </div>
  );
  const link = (k, l) => <button type="button" onClick={e => { e.stopPropagation(); setModal(k); }} style={{ font: `600 13px ${FB}`, color: T.primary, background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "underline" }}>{l}</button>;
  return (
    <Card pad={0} style={{ ...wrap(680), overflow: "hidden", boxShadow: SH.sm }}>
      <GradHead tag={`Bonjour ${p.prenom}`} title="Avant de commencer" sub="Cet espace est le vôtre. Vous vous entraînez à votre rythme, rien n'est noté et rien n'est partagé sans votre accord." />
      <div className="rp-card-pad" style={{ padding: "24px 32px 8px" }}>
        {box("local", "Enregistrer et analyser mes entraînements sur cet appareil", "La vidéo et le son restent sur votre appareil. Ils ne sont envoyés à votre coach que si vous le décidez, réponse par réponse.", true)}
        {box("ai", "Recevoir un retour de l'assistant", "Un retour écrit qui décrit des faits (rythme, pauses, structure, direction du regard). Il ne note pas et ne déduit aucune émotion. Sans cette option, vous pouvez quand même vous enregistrer et vous revoir.")}
        <div style={{ font: `400 13px/1.6 ${FB}`, color: T.body, margin: "12px 0 4px" }}>
          En continuant, vous confirmez avoir pris connaissance des {link("cgu", "conditions d'utilisation")}, de la {link("rgpd", "notice de protection des données")} et du {link("lifecycle", "cycle de vie de la vidéo")}. Vous pouvez retirer votre consentement à tout moment depuis votre espace, sans justification.
        </div>
      </div>
      <div className="rp-card-pad" style={{ padding: "18px 32px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Back onClick={onBack} />
        <Btn kind="objective" disabled={!c.local} onClick={() => updateParcours(p.code, { consent: { at: new Date().toISOString(), local: true, ai: c.ai } })}>Je consens et je commence&nbsp;<Icon d={I.arrow} s={18} c="#fff" /></Btn>
      </div>
    </Card>
  );
}

function EmotionNote({ setModal }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start", background: GRAD_SOFT, borderRadius: RAD.md, padding: "12px 15px", marginBottom: 16 }}>
      <Icon d={I.shield} s={18} c={T.violet} />
      <div style={{ font: `400 13px/1.55 ${FB}`, color: T.primaryDk }}>
        <strong>On ne juge pas vos émotions.</strong> L'assistant ne cherche pas à savoir si vous êtes stressé·e : il décrit seulement des faits.{" "}
        <button onClick={() => setModal("emotion")} style={{ font: `600 13px ${FB}`, color: T.violet, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}>Pourquoi ?</button>
      </div>
    </div>
  );
}

/* ─── Espace personnel ─── */
function Home({ p, takes, go, counselor, onQuit }) {
  const reports = takes.filter(t => t.report);
  const withdraw = async () => {
    if (window.confirm("Retirer votre consentement supprime tous vos entraînements et vos rapports sur cet appareil. Continuer ?")) { clearWarmupDebrief(p.code); await withdrawConsent(p.code); }
  };
  return (
    <div style={wrap(820)}>
      <Card pad={0} style={{ boxShadow: SH.sm, marginBottom: 18 }}>
        <GradHead tag={counselor ? `Accompagnement avec ${counselor}` : "Votre espace"} title={`Bonjour ${p.prenom}`}
          sub="Choisissez le métier que vous visez, puis démarrez votre entraînement : les questions s'adaptent à ce métier. Vous pouvez d'abord vous échauffer pour vous mettre en voix." />
        <div className="rp-card-pad" style={{ padding: "22px 28px 26px" }}>
          <JobField p={p} />
          <div className="rp-stack" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 18 }}>
            <ChoiceTile icon={I.mic} title="Échauffement" tipLabel="En savoir plus sur l'échauffement" tipId="tip-warmup"
              tip="L'échauffement n'est ni enregistré ni analysé. Il sert à vous mettre en voix : vous dites une phrase à voix haute, plusieurs fois, avec des astuces et des relances. Rien n'est gardé quand vous quittez l'écran."
              text="Quelques minutes pour vous mettre en voix, une phrase à la fois. Ni enregistré, ni analysé.">
              <Btn kind="secondary" onClick={() => go("warmup")}>Commencer par un échauffement</Btn>
            </ChoiceTile>
            <ChoiceTile icon={I.play} title="Entraînement" tipLabel="En savoir plus sur l'entraînement" tipId="tip-training"
              tip={p.consent.ai
                ? "L'entraînement est enregistré sur votre appareil et reçoit un retour de l'assistant, qui décrit des faits sans noter. Vous décidez ensuite, réponse par réponse, de l'envoyer ou non à votre coach."
                : "L'entraînement est enregistré sur votre appareil pour que vous puissiez vous revoir. Le retour de l'assistant est désactivé à votre demande. Vous décidez, réponse par réponse, de l'envoyer ou non à votre coach."}
              text="Vous choisissez une ou plusieurs questions et vous vous enregistrez sur cet appareil. L'assistant vous fait un retour.">
              <Btn kind="objective" onClick={() => go("pick", { queue: null, selection: null, preselect: null })}>Démarrer l'entraînement&nbsp;<Icon d={I.arrow} s={17} c="#fff" /></Btn>
            </ChoiceTile>
          </div>
        </div>
      </Card>

      {reports.length > 0 && (
        <div style={{ background: `${T.accent}10`, border: `1px solid ${T.accent}33`, borderRadius: RAD.md, padding: "14px 18px", marginBottom: 18, font: `500 14px ${FB}`, color: T.navy }}>
          {counselor || "Votre coach"} vous a envoyé {reports.length > 1 ? `${reports.length} rapports` : "un rapport"}. Ouvrez l'entraînement concerné pour le lire.
        </div>
      )}

      <h2 style={{ font: `800 20px ${FD}`, color: T.navy, margin: "8px 0 12px" }}>Mes entraînements</h2>
      {takes.length === 0 && <Card><div style={{ font: `400 14px ${FB}`, color: T.body }}>Vous n'avez pas encore d'entraînement enregistré. Lancez-vous quand vous êtes prêt·e.</div></Card>}
      {takes.map(t => {
        const st = t.report ? ["Rapport reçu", "appui"] : t.shared ? ["Envoyé, en attente de relecture", "primary"] : ["Sur cet appareil uniquement", "muted"];
        return (
          <Card key={t.id} hover style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ width: 42, height: 42, borderRadius: RAD.sm, background: GRAD_AI, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon d={t.hasVideo && !t.mime?.startsWith("audio") ? I.play : I.mic} s={17} c="#fff" /></div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ font: `700 14.5px ${FD}`, color: T.navy }}>{t.question}</div>
              <div style={{ font: `400 12.5px ${FB}`, color: T.muted }}>{dateFr(t.createdAt)} · {Math.round(t.duration)} s</div>
            </div>
            <Tag tone={st[1]}>{st[0]}</Tag>
            <Btn kind="secondary" size="sm" onClick={() => go(t.hasVideo ? "choose" : "report", { takeId: t.id, mode: "simple", queue: null })}>Ouvrir</Btn>
          </Card>
        );
      })}

      <div style={{ marginTop: 28, paddingTop: 18, borderTop: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }} className="noprint">
        <button onClick={onQuit} style={{ font: `500 13px ${FB}`, color: T.muted, background: "none", border: "none", cursor: "pointer" }}>← Changer de code</button>
        <button onClick={withdraw} style={{ font: `500 13px ${FB}`, color: T.errorDk, background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, textAlign: "left" }}><Icon d={I.trash} s={14} c={T.error} /> Retirer mon consentement et supprimer mes données</button>
      </div>
    </div>
  );
}

/* Tuile de choix (échauffement / entraînement) avec bulle d'information. */
function ChoiceTile({ icon, title, text, tip, tipLabel, tipId, children }) {
  return (
    <div style={{ position: "relative", border: `1px solid ${T.line}`, borderRadius: RAD.md, padding: 16, display: "flex", flexDirection: "column", gap: 10, background: T.bg, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div aria-hidden style={{ width: 34, height: 34, borderRadius: RAD.sm, background: "#fff", border: `1px solid ${T.line}`, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon d={icon} s={16} c={T.primary} /></div>
        <h2 style={{ font: `800 16px ${FD}`, color: T.navy, margin: 0 }}>{title}</h2>
        <InfoTip label={tipLabel} id={tipId}>{tip}</InfoTip>
      </div>
      <p style={{ font: `400 13.5px/1.55 ${FB}`, color: T.body, margin: 0, flex: 1 }}>{text}</p>
      <div className="rp-wide-m">{children}</div>
    </div>
  );
}

/* Bulle d'information : au survol (souris), au toucher et au clavier (Entrée/Espace, Échap pour fermer). */
function InfoTip({ label, id, children }) {
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const ref = useRef(null);
  const open = hover || pinned;
  useEffect(() => {
    if (!pinned) return;
    const out = e => { if (ref.current && !ref.current.contains(e.target)) setPinned(false); };
    document.addEventListener("pointerdown", out);
    return () => document.removeEventListener("pointerdown", out);
  }, [pinned]);
  return (
    <span ref={ref} style={{ display: "inline-flex" }}
      onPointerEnter={e => e.pointerType === "mouse" && setHover(true)} onPointerLeave={e => e.pointerType === "mouse" && setHover(false)}
      onKeyDown={e => { if (e.key === "Escape") { setPinned(false); setHover(false); } }}>
      <button type="button" aria-label={label} aria-expanded={open} aria-controls={id} onClick={() => setPinned(v => !v)}
        style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: open ? `${T.primary}14` : "transparent", display: "grid", placeItems: "center", cursor: "pointer", padding: 0 }}>
        <Icon d={I.info} s={18} c={T.primary} />
      </button>
      <span id={id} role="note" hidden={!open}
        style={{ position: "absolute", left: 10, right: 10, top: 56, zIndex: 20, background: "#fff", border: `1px solid ${T.line}`, borderRadius: RAD.sm, boxShadow: SH.lg, padding: "12px 14px", font: `400 13px/1.55 ${FB}`, color: T.navy, display: open ? "block" : "none" }}>
        {children}
      </span>
    </span>
  );
}

/* Métier visé : champ avec autocomplétion accessible (combobox), saisie libre acceptée. */
function JobField({ p }) {
  const [val, setVal] = useState(p.poste || "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [status, setStatus] = useState("");
  const valRef = useRef(val); valRef.current = val;
  const blurT = useRef(0);
  useEffect(() => () => clearTimeout(blurT.current), []);
  useEffect(() => { if (!open) setVal(p.poste || ""); }, [p.poste]); // eslint-disable-line

  const matches = searchJobs(val, 8);
  const typed = val.trim();
  const exact = matches.some(m => norm(m) === norm(typed));
  const items = typed && !exact ? [...matches, { free: typed }] : matches;
  const labelOf = it => (typeof it === "string" ? it : it.free);

  const commit = v => {
    const t = (v || "").trim();
    setOpen(false); setActive(-1);
    if (!t) { setVal(p.poste || ""); return; }
    setVal(t);
    if (t !== p.poste) { updateParcours(p.code, { poste: t }); setStatus(`Métier enregistré : ${t}. Les questions s'adaptent à ce métier.`); }
  };
  const onKey = e => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive(a => (items.length ? (a + 1) % items.length : -1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setOpen(true); setActive(a => (items.length ? (a <= 0 ? items.length - 1 : a - 1) : -1)); }
    else if (e.key === "Enter") { e.preventDefault(); commit(open && active >= 0 && items[active] ? labelOf(items[active]) : val); }
    else if (e.key === "Escape") { if (open) { e.preventDefault(); setOpen(false); setActive(-1); } else setVal(p.poste || ""); }
  };

  return (
    <div style={{ position: "relative" }}>
      <label htmlFor="job" style={{ font: `700 14px ${FD}`, color: T.navy, display: "block", marginBottom: 4 }}>Métier visé</label>
      <div id="job-help" style={{ font: `400 12.5px ${FB}`, color: T.muted, marginBottom: 8 }}>Commencez à taper puis choisissez dans la liste, ou écrivez librement votre métier.</div>
      <div style={{ position: "relative" }}>
        <span aria-hidden style={{ position: "absolute", left: 14, top: 15, pointerEvents: "none" }}><Icon d={I.search} s={18} c={T.faint} /></span>
        <input id="job" role="combobox" aria-autocomplete="list" aria-expanded={open && items.length > 0} aria-controls="job-list"
          aria-activedescendant={open && active >= 0 ? `job-opt-${active}` : undefined} aria-describedby="job-help"
          value={val} autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="Par exemple : agent d'accueil"
          onChange={e => { setVal(e.target.value); setOpen(true); setActive(-1); setStatus(""); }}
          onFocus={() => { clearTimeout(blurT.current); setOpen(true); }}
          onClick={() => setOpen(true)}
          onBlur={() => { blurT.current = setTimeout(() => commit(valRef.current), 160); }}
          onKeyDown={onKey}
          style={{ width: "100%", height: 50, padding: "0 16px 0 42px", borderRadius: RAD.md, border: `1.5px solid ${T.line}`, font: `500 16px ${FB}`, color: T.navy, background: "#fff" }} />
        {open && items.length > 0 && (
          <ul id="job-list" role="listbox" aria-label="Métiers proposés"
            style={{ position: "absolute", left: 0, right: 0, top: "calc(100% + 6px)", zIndex: 30, margin: 0, padding: 6, listStyle: "none", background: "#fff", border: `1px solid ${T.line}`, borderRadius: RAD.md, boxShadow: SH.lg, maxHeight: 264, overflowY: "auto" }}>
            {items.map((it, i) => (
              <li key={labelOf(it) + i} id={`job-opt-${i}`} role="option" aria-selected={i === active} className="rp-opt"
                onPointerDown={e => e.preventDefault()} onMouseDown={e => e.preventDefault()}
                onClick={() => { clearTimeout(blurT.current); commit(labelOf(it)); }}
                onMouseMove={() => active !== i && setActive(i)}
                style={{ padding: "10px 12px", borderRadius: RAD.sm, cursor: "pointer", font: `${typeof it === "string" ? 500 : 600} 14.5px ${FB}`, color: typeof it === "string" ? T.navy : T.primary, background: i === active ? `${T.primary}12` : undefined }}>
                {typeof it === "string" ? it : `Utiliser « ${it.free} »`}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div role="status" aria-live="polite" style={{ font: `500 12.5px ${FB}`, color: T.accent, marginTop: status ? 8 : 0, display: "flex", alignItems: "center", gap: 6 }}>
        {status && <><Icon d={I.check} s={14} c={T.accent} />{status}</>}
      </div>
    </div>
  );
}

/* ─── Échauffement (ni enregistré, ni analysé) ─── */
const WARMUP_TIPS = [
  ["Respirez avant de parler", "Inspirez par le nez sur quatre temps, expirez sur six. La voix se pose plus facilement."],
  ["Prenez votre temps", "À l'oral, on parle souvent plus vite qu'on ne le pense. Une courte pause entre deux idées aide l'autre à suivre."],
  ["Articulez les fins de phrase", "C'est là que les mots se perdent le plus souvent."],
  ["Regardez la caméra, pas votre image", "L'objectif donne à votre interlocuteur l'impression que vous le regardez."],
  ["Sourire n'est pas obligatoire", "Parlez simplement, avec votre façon d'être. Il n'y a pas d'attitude attendue."],
  ["Installez-vous", "Assis·e bien droit·e ou debout, les pieds à plat : la respiration est plus libre et la voix porte mieux."],
  ["Si vous butez sur un mot, continuez", "Tout le monde hésite à l'oral. Reprendre simplement la phrase suffit."],
  ["Gardez un verre d'eau à portée de main", "Boire une gorgée laisse aussi un instant pour réfléchir."],
];

function Warmup({ p, go, setModal }) {
  const [stage, setStage] = useState("practice"); // practice | debrief
  const [pi, setPi] = useState(() => randomPhraseIndex());
  const [prompt, setPrompt] = useState(0);
  const phrase = fillPhrase(WARMUP_PHRASES[pi], p);
  const shuffle = () => { setPi(i => randomPhraseIndex(i)); setPrompt(0); };
  const finish = () => { updateParcours(p.code, { warmupDone: true }); setStage("debrief"); window.scrollTo({ top: 0 }); };

  if (stage === "debrief") return <WarmupDebrief p={p} go={go} again={() => { setStage("practice"); shuffle(); window.scrollTo({ top: 0 }); }} />;

  return (
    <div style={wrap(980)}>
      <Card pad={28} style={{ boxShadow: SH.sm, marginBottom: 16 }}>
        <Tag tone="warning">Échauffement · ni enregistré, ni analysé</Tag>
        <h1 style={{ font: `800 24px ${FD}`, margin: "12px 0 6px", color: T.navy, letterSpacing: "-.02em" }}>Mettez-vous en voix</h1>
        <p style={{ font: `400 14.5px/1.6 ${FB}`, color: T.body, margin: "0 0 18px", maxWidth: 680 }}>
          Quelques minutes pour vous habituer à parler à voix haute avant l'entraînement. L'exercice se concentre sur <strong style={{ color: T.navy }}>une seule phrase à la fois</strong> : dites-la, redites-la en suivant la relance, puis changez de phrase quand vous voulez. Rien n'est enregistré ni analysé.
        </p>

        <div style={{ background: GRAD_SOFT, borderRadius: RAD.md, padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ font: `700 11px ${FB}`, color: T.primary, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Votre phrase</div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <p aria-live="polite" data-testid="warmup-phrase" style={{ font: `700 19px/1.45 ${FD}`, color: T.navy, margin: 0, flex: 1, minWidth: 0 }}>« {phrase} »</p>
            <button type="button" onClick={shuffle} aria-label="Changer de phrase" title="Changer de phrase"
              style={{ width: 42, height: 42, flexShrink: 0, borderRadius: "50%", border: `1.5px solid ${T.primaryLt}`, background: "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}>
              <Icon d={I.shuffle} s={18} c={T.primary} />
            </button>
          </div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.primary}1a`, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200, font: `500 13.5px/1.5 ${FB}`, color: T.primaryDk }} aria-live="polite">
              <strong>Relance {prompt + 1}/{WARMUP_PROMPTS.length} :</strong> {WARMUP_PROMPTS[prompt]}
            </div>
            <Btn kind="ghost" size="sm" onClick={() => setPrompt(i => (i + 1) % WARMUP_PROMPTS.length)}><Icon d={I.redo} s={15} c={T.primary} /> Relance suivante</Btn>
          </div>
        </div>

        <WarmupStage setModal={setModal} />
      </Card>

      <div className="rp-split" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.15fr)", gap: 16, alignItems: "start" }}>
        <Card pad={22}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Icon d={I.bulb} s={18} c={T.primary} />
            <h2 style={{ font: `800 16px ${FD}`, color: T.navy, margin: 0 }}>Astuces pour bien démarrer</h2>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
            {WARMUP_TIPS.map(([t, d]) => (
              <li key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span aria-hidden style={{ marginTop: 2 }}><Icon d={I.check} s={15} c={T.accent} /></span>
                <span style={{ font: `400 13.5px/1.5 ${FB}`, color: T.body }}><strong style={{ color: T.navy }}>{t}.</strong> {d}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Assistant context="warmup" poste={p.poste} id="asst-warmup"
          intro="Bonjour ! Une question sur l'échauffement, le site ou la préparation de votre entretien ? Posez-la ici, vous pouvez ensuite me demander un exemple ou plus de détails." />
      </div>

      <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Back onClick={() => go("home")} />
        <Btn kind="objective" onClick={finish}>J'ai terminé l'échauffement&nbsp;<Icon d={I.arrow} s={17} c="#fff" /></Btn>
      </div>
    </div>
  );
}

const OPINIONS = ["Utile", "Rassurant", "Trop court", "Pas assez guidé", "Je ne sais pas encore"];

function Chip({ on, onClick, role = "radio", children }) {
  return (
    <button type="button" role={role} aria-checked={on} onClick={onClick}
      style={{ font: `600 13px ${FB}`, padding: "9px 14px", borderRadius: RAD.pill, cursor: "pointer", textAlign: "left",
        border: `1.5px solid ${on ? T.primary : T.line}`, background: on ? `${T.primary}12` : "#fff", color: on ? T.primaryDk : T.body, display: "inline-flex", alignItems: "center", gap: 6 }}>
      {on && <Icon d={I.check} s={13} c={T.primary} />}{children}
    </button>
  );
}

/* Questionnaire de fin d'échauffement : réponses gardées sur l'appareil, jamais envoyées au coach. */
function WarmupDebrief({ p, go, again }) {
  const prev = loadWarmupDebrief(p.code);
  const [feeling, setFeeling] = useState(null);
  const [opinion, setOpinion] = useState(null);
  const [comment, setComment] = useState("");
  const [work, setWork] = useState(() => prev?.work || []);
  useEffect(() => { saveWarmupDebrief(p.code, { feeling, opinion, comment: comment.trim(), work }); }, [feeling, opinion, comment, work]); // eslint-disable-line
  const toggleWork = id => setWork(w => (w.includes(id) ? w.filter(x => x !== id) : [...w, id]));
  const q = (n, t, id) => <h2 id={id} style={{ font: `800 16px ${FD}`, color: T.navy, margin: "0 0 10px" }}>{n}. {t}</h2>;
  const pre = questionsForTopics(work);

  return (
    <div style={wrap(760)}>
      <Card pad={28} style={{ boxShadow: SH.sm }}>
        <Tag tone="success">Échauffement terminé</Tag>
        <h1 style={{ font: `800 24px ${FD}`, margin: "12px 0 6px", color: T.navy, letterSpacing: "-.02em" }}>Quatre questions rapides</h1>
        <p style={{ font: `400 14px/1.6 ${FB}`, color: T.body, margin: "0 0 22px" }}>Vos réponses restent sur cet appareil : elles ne sont pas envoyées à votre coach. Toutes les questions sont facultatives.</p>

        <section style={{ marginBottom: 22 }}>
          {q(1, "Comment vous êtes-vous senti·e ?", "dq1")}
          <div role="radiogroup" aria-labelledby="dq1" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {FEELINGS.map(f => <Chip key={f.id} on={feeling === f.id} onClick={() => setFeeling(v => (v === f.id ? null : f.id))}>{f.label}</Chip>)}
          </div>
          <div aria-live="polite">
            {feeling && (
              <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "flex-start", background: GRAD_AI_SOFT, borderRadius: RAD.sm, padding: "10px 13px", font: `400 13.5px/1.55 ${FB}`, color: T.navy }}>
                <span aria-hidden style={{ marginTop: 1 }}><Icon d={I.chat} s={15} c={T.violet} /></span>
                <span><strong style={{ color: T.violet }}>Assistant :</strong> {feelingAck(feeling)}</span>
              </div>
            )}
          </div>
        </section>

        <section style={{ marginBottom: 22 }}>
          {q(2, "Qu'avez-vous pensé de cet échauffement ?", "dq2")}
          <div role="radiogroup" aria-labelledby="dq2" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {OPINIONS.map(o => <Chip key={o} on={opinion === o} onClick={() => setOpinion(v => (v === o ? null : o))}>{o}</Chip>)}
          </div>
          <label htmlFor="dq2-text" className="rp-sr">Un commentaire sur l'échauffement (facultatif)</label>
          <input id="dq2-text" value={comment} onChange={e => setComment(e.target.value)} maxLength={300} placeholder="Un commentaire, si vous le souhaitez (facultatif)"
            style={{ marginTop: 10, width: "100%", height: 46, padding: "0 14px", borderRadius: RAD.md, border: `1.5px solid ${T.line}`, font: `400 15px ${FB}`, color: T.navy }} />
        </section>

        <section style={{ marginBottom: 22 }}>
          {q(3, "Qu'aimeriez-vous travailler ensuite ?", "dq3")}
          <div role="group" aria-labelledby="dq3" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {WORK_TOPICS.map(t => <Chip key={t.id} role="checkbox" on={work.includes(t.id)} onClick={() => toggleWork(t.id)}>{t.label}</Chip>)}
          </div>
          <p style={{ font: `400 12.5px ${FB}`, color: T.muted, margin: "8px 0 0" }}>
            {pre.length ? `${pre.length} question${pre.length > 1 ? "s" : ""} seront présélectionnées pour votre entraînement. Vous pourrez modifier ce choix.` : "Vos choix présélectionneront des questions pour votre entraînement."}
          </p>
        </section>

        <section>
          <Assistant context="debrief" poste={p.poste} id="asst-debrief" title="4. Avez-vous une question ?" maxHeight={320}
            placeholder="Par exemple : comment parler de mes qualités ?" />
        </section>

        <div style={{ marginTop: 22, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Btn kind="ghost" size="sm" onClick={again}><Icon d={I.redo} s={15} c={T.primary} /> Refaire un échauffement</Btn>
            <Btn kind="ghost" size="sm" onClick={() => go("home")}>Revenir à mon espace</Btn>
          </div>
          <Btn kind="objective" onClick={() => go("pick", { preselect: pre, selection: null, queue: null })}>Commencer l'entraînement&nbsp;<Icon d={I.arrow} s={17} c="#fff" /></Btn>
        </div>
      </Card>
    </div>
  );
}

/* ─── Choix des questions (sélection multiple + questions personnelles) ─── */
function Pick({ p, ctx, go }) {
  const init = ctx.selection || { sel: (ctx.preselect || []).map(id => `q:${id}`), custom: [] };
  const [sel, setSel] = useState(init.sel);
  const [custom, setCustom] = useState(init.custom);
  const [own, setOwn] = useState("");
  const qs = QUESTIONS.map(q => ({ key: `q:${q.id}`, theme: q.theme, text: fill(q.text, p.poste) }));
  const all = [...qs, ...custom];
  const toggle = key => setSel(s => (s.includes(key) ? s.filter(k => k !== key) : [...s, key]));
  const add = e => {
    e?.preventDefault();
    const t = own.trim();
    if (t.length < 5) return;
    const key = `c:${Date.now().toString(36)}`;
    setCustom(c => [...c, { key, theme: "Ma question", text: t }]);
    setSel(s => [...s, key]);
    setOwn("");
  };
  const remove = key => { setCustom(c => c.filter(x => x.key !== key)); setSel(s => s.filter(k => k !== key)); };
  const n = sel.length;
  const start = () => {
    const queue = sel.map(k => all.find(x => x.key === k)?.text).filter(Boolean);
    if (queue.length) go("record", { queue, qi: 0, question: queue[0], selection: { sel, custom }, takeId: null, preselect: null });
  };

  const qcard = (q, removable) => {
    const idx = sel.indexOf(q.key), on = idx >= 0;
    return (
      <div key={q.key} role="checkbox" aria-checked={on} tabIndex={0} onClick={() => toggle(q.key)}
        onKeyDown={e => (e.key === " " || e.key === "Enter") && (e.preventDefault(), toggle(q.key))}
        style={{ position: "relative", display: "flex", gap: 12, alignItems: "flex-start", padding: 14, borderRadius: RAD.md, cursor: "pointer", minWidth: 0,
          border: `1.5px solid ${on ? T.primary : T.line}`, background: on ? GRAD_SOFT : "#fff", boxShadow: on ? "none" : SH.xs, transition: "border-color .15s, background .15s" }}>
        <div aria-hidden style={{ width: 24, height: 24, borderRadius: RAD.xs, flexShrink: 0, marginTop: 1, background: on ? T.primary : "#fff", border: `2px solid ${on ? T.primary : T.faint}`, display: "grid", placeItems: "center", color: "#fff", font: `700 12px ${FB}` }}>
          {on ? idx + 1 : ""}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: `600 11px ${FB}`, color: T.primary, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>{q.theme}</div>
          <div style={{ font: `600 14px/1.45 ${FB}`, color: T.navy, overflowWrap: "anywhere" }}>{q.text}</div>
        </div>
        {removable && (
          <button type="button" aria-label={`Retirer la question : ${q.text}`} onClick={e => { e.stopPropagation(); remove(q.key); }}
            style={{ width: 30, height: 30, flexShrink: 0, borderRadius: "50%", border: "none", background: "transparent", display: "grid", placeItems: "center", cursor: "pointer" }}>
            <Icon d={I.close} s={16} c={T.muted} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={wrap(820)}>
      <h1 style={{ font: `800 26px ${FD}`, color: T.navy, margin: "0 0 6px", letterSpacing: "-.02em" }}>Sur quelles questions voulez-vous vous entraîner ?</h1>
      <p style={{ font: `400 15px/1.55 ${FB}`, color: T.body, margin: "0 0 6px" }}>Sélectionnez une ou plusieurs questions, dans l'ordre où vous voulez y répondre. Vous pouvez aussi ajouter les vôtres.</p>
      {!ctx.selection && ctx.preselect?.length > 0 && (
        <p style={{ font: `500 13px ${FB}`, color: T.accent, margin: "0 0 6px", display: "flex", alignItems: "center", gap: 6 }}><Icon d={I.check} s={14} c={T.accent} /> Présélection d'après votre échauffement : vous pouvez la modifier.</p>
      )}
      <div role="group" aria-label="Questions proposées" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,250px),1fr))", gap: 10, margin: "14px 0 18px" }}>
        {qs.map(q => qcard(q))}
      </div>

      <Card pad={18} style={{ marginBottom: 16 }}>
        <form onSubmit={add}>
          <label htmlFor="own" style={{ font: `700 14px ${FD}`, color: T.navy, display: "block", marginBottom: 8 }}>Ajouter ma question</label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input id="own" value={own} onChange={e => setOwn(e.target.value)} maxLength={240} placeholder="Par exemple : pourquoi avez-vous quitté votre dernier emploi ?"
              style={{ flex: "1 1 240px", minWidth: 0, height: 48, padding: "0 16px", borderRadius: RAD.md, border: `1.5px solid ${T.line}`, font: `400 15px ${FB}`, color: T.navy }} />
            <Btn kind="secondary" disabled={own.trim().length < 5}><Icon d={I.plus} s={16} c={T.primary} /> Ajouter</Btn>
          </div>
        </form>
        {custom.length > 0 && (
          <div role="group" aria-label="Mes questions" style={{ display: "grid", gap: 8, marginTop: 14 }}>
            {custom.map(q => qcard(q, true))}
          </div>
        )}
      </Card>

      <div className="rp-sel" style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: RAD.md, boxShadow: SH.lg, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div aria-live="polite" style={{ font: `600 13.5px ${FB}`, color: n ? T.navy : T.muted }}>
          {n ? `${n} question${n > 1 ? "s" : ""} sélectionnée${n > 1 ? "s" : ""}` : "Aucune question sélectionnée"}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {n > 0 && <Btn kind="ghost" size="sm" onClick={() => setSel([])}>Tout désélectionner</Btn>}
          <Btn kind="objective" disabled={!n} onClick={start}>{n ? `Commencer (${n} question${n > 1 ? "s" : ""})` : "Commencer"}&nbsp;<Icon d={I.arrow} s={17} c="#fff" /></Btn>
        </div>
      </div>
      <div style={{ marginTop: 10 }}><Back onClick={() => go("home")} /></div>
    </div>
  );
}

/* ─── Transcription + analyse, puis enregistrement de la prise ─── */
function Processing({ p, ctx, go }) {
  const [stage, setStage] = useState("Préparation…");
  const [err, setErr] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const rec = ctx.recording;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr(null);
        let segments = [], transcript = "", analysis = null;
        if (p.consent.ai) {
          setStage("Transcription de votre discours sur cet appareil…");
          const tr = await transcribe(rec.blob, pr => {
            if (!alive) return;
            if (pr.stage === "model") setStage(`Préparation du modèle de transcription (${pr.value} %). Ce téléchargement n'a lieu qu'une fois.`);
            else setStage("Transcription de votre discours sur cet appareil…");
          });
          segments = tr.segments; transcript = tr.text;
          setStage("Préparation de votre retour…");
          analysis = await analyze({ segments, duration: rec.duration, gaze: rec.gaze, poste: p.poste, question: ctx.question });
        } else {
          analysis = { synthese: "Le retour de l'assistant est désactivé à votre demande. Vous pouvez revoir votre réponse et la partager à votre coach.", dimensions: [], source: "none" };
        }
        if (!alive) return;
        const id = await createTake({ code: p.code, question: ctx.question, duration: rec.duration, blob: rec.blob, transcript, segments, gaze: rec.gaze, analysis });
        if (alive) go("choose", { takeId: id, recording: null });
      } catch (e) {
        console.error(e);
        if (alive) setErr(String(e?.message || e));
      }
    })();
    return () => { alive = false; };
  }, [attempt]);

  return (
    <Card pad={48} topbar="ai" style={{ ...wrap(560), textAlign: "center", boxShadow: SH.sm }}>
      {!err ? (<>
        <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto 24px" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: GRAD_AI, opacity: 0.18 }} />
          <div style={{ position: "absolute", inset: 6, border: `4px solid ${T.lineLt}`, borderTopColor: T.violet, borderRadius: "50%", animation: "spin .9s linear infinite" }} />
        </div>
        <h2 style={{ font: `800 20px ${FD}`, margin: "0 0 10px", color: T.navy }}>{stage}</h2>
        <p style={{ font: `400 14px/1.6 ${FB}`, color: T.body, margin: 0 }}>Aucune émotion n'est déduite : le retour décrit uniquement des faits observables.</p>
      </>) : (<>
        <h2 style={{ font: `800 20px ${FD}`, margin: "0 0 10px", color: T.navy }}>La transcription n'a pas pu aboutir</h2>
        <p style={{ font: `400 14px/1.6 ${FB}`, color: T.body, margin: "0 0 6px" }}>Vérifiez votre connexion (le modèle se télécharge au premier usage) puis réessayez.</p>
        <p style={{ font: `400 12px ${FM}`, color: T.muted, margin: "0 0 18px" }}>{err}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Btn kind="secondary" onClick={() => go("record")}>Refaire l'enregistrement</Btn>
          <Btn kind="ai" onClick={() => setAttempt(a => a + 1)}>Réessayer</Btn>
        </div>
      </>)}
    </Card>
  );
}

/* ─── Choix du mode de restitution ─── */
function Choose({ take, go, series }) {
  const opt = (mode, title, sub, body, accent) => (
    <Card hover onClick={() => go("report", { mode })} pad={26} style={{ display: "flex", flexDirection: "column", borderColor: accent ? `${T.violet}44` : T.line }}>
      <h3 style={{ font: `800 19px ${FD}`, margin: "0 0 2px", color: T.navy }}>{title}</h3>
      <div style={{ font: `600 13px ${FB}`, color: accent ? T.violet : T.primary, marginBottom: 10 }}>{sub}</div>
      <p style={{ font: `400 14px/1.6 ${FB}`, color: T.body, margin: "0 0 16px", flex: 1 }}>{body}</p>
      <Btn kind={accent ? "ai" : "secondary"} full size="sm">Choisir</Btn>
    </Card>
  );
  return (
    <div style={wrap(720)}>
      <div style={{ textAlign: "center", marginBottom: 26 }}>
        <Tag tone="success">{series && series.n > 1 ? `Question ${series.i + 1} sur ${series.n} · votre retour est prêt` : "Votre retour est prêt"}</Tag>
        <h1 style={{ font: `800 27px ${FD}`, margin: "14px 0 8px", color: T.navy, letterSpacing: "-.02em" }}>Comment préférez-vous le découvrir ?</h1>
        <p style={{ font: `400 15px/1.6 ${FB}`, color: T.body, margin: 0 }}>Les deux contiennent le même retour. Vous pourrez changer d'avis.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
        {opt("simple", "Un rapport écrit", "Sans me revoir", "Vous lisez les observations tranquillement, sous forme de texte. Idéal si vous n'aimez pas vous revoir.")}
        {opt("video", "Me revoir en vidéo", "Avec les repères au bon moment", "Chaque observation est placée sur la barre de lecture. Cliquez un repère ou une observation : la lecture s'y place.", true)}
      </div>
      <div style={{ marginTop: 16 }}><Back onClick={() => go("home")} /></div>
    </div>
  );
}

/* ─── Rapport + actions ─── */
function TakeReport({ p, take, mode, go, series, nextQuestion, stopSeries }) {
  const [ask, setAsk] = useState(false);
  const del = async () => {
    if (!window.confirm("Supprimer définitivement cette réponse et son retour ?")) return;
    await deleteTake(take.id);
    if (series?.hasNext) nextQuestion(); else go("home", { queue: null });
  };
  return (
    <div style={wrap(mode === "video" ? 1000 : 760)}>
      <Card pad={0} style={{ overflow: "hidden", marginBottom: 16, boxShadow: SH.sm }}>
        <GradHead tag={take.report ? "Rapport de votre coach" : "Votre retour"} title={take.question}
          sub={`${dateFr(take.createdAt)} · ${Math.round(take.duration)} s. Ce retour décrit des faits, il ne note pas.`}
          action={take.hasVideo && (
            <button className="noprint" onClick={() => go("report", { mode: mode === "video" ? "simple" : "video" })} style={{ font: `600 12px ${FB}`, color: "#fff", background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.3)", borderRadius: RAD.pill, padding: "8px 14px", cursor: "pointer" }}>
              {mode === "video" ? "Plutôt un rapport écrit" : "Plutôt me revoir en vidéo"}
            </button>)} />
      </Card>
      <ReportBody take={take} mode={mode} counselorName={p.counselor} />
      {series && (
        <Card style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, borderColor: `${T.accent}55` }} className="noprint">
          <div>
            <div style={{ font: `700 15px ${FD}`, color: T.navy }}>{series.hasNext ? `Question ${series.i + 1} sur ${series.n} terminée` : series.n > 1 ? "C'était la dernière question de votre sélection" : "Entraînement terminé"}</div>
            <div style={{ font: `400 13px ${FB}`, color: T.body }}>{series.hasNext ? "Prenez le temps de lire ce retour, puis passez à la suite quand vous êtes prêt·e." : "Vous retrouvez tous vos retours dans votre espace, et vous pouvez recommencer quand vous voulez."}</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {series.hasNext && <Btn kind="ghost" size="sm" onClick={stopSeries}>Arrêter ici</Btn>}
            {series.hasNext
              ? <Btn kind="objective" onClick={nextQuestion}>Question suivante ({series.i + 2}/{series.n})&nbsp;<Icon d={I.arrow} s={17} c="#fff" /></Btn>
              : <Btn kind="secondary" size="sm" onClick={stopSeries}>Revenir à mon espace</Btn>}
          </div>
        </Card>
      )}
      <Card style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, background: take.shared ? T.successBg : "#fff" }} className="noprint">
        <div>
          <div style={{ font: `700 15px ${FD}`, color: T.navy }}>{take.report ? "Rapport reçu" : take.shared ? "Réponse envoyée à votre coach" : `Prêt·e à en parler avec ${p.counselor || "votre coach"} ?`}</div>
          <div style={{ font: `400 13px ${FB}`, color: T.body }}>{take.shared ? "Vous pouvez continuer à vous entraîner et envoyer une nouvelle réponse à tout moment." : "Cette réponse reste sur votre appareil tant que vous ne l'envoyez pas."}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn kind="ghost" size="sm" onClick={del}><Icon d={I.trash} s={15} c={T.primary} /> Supprimer</Btn>
          <Btn kind="ghost" size="sm" onClick={() => window.print()}><Icon d={I.print} s={15} c={T.primary} /> Imprimer ou PDF</Btn>
          {!series?.hasNext && <Btn kind="secondary" size="sm" onClick={() => go("pick", { queue: null, selection: null, preselect: null })}><Icon d={I.redo} s={15} c={T.primary} /> M'entraîner encore</Btn>}
          {!take.shared && <Btn kind={series?.hasNext ? "secondary" : "objective"} size="sm" onClick={() => go("share")}>Envoyer à mon coach&nbsp;<Icon d={I.send} s={15} c={series?.hasNext ? T.primary : "#fff"} /></Btn>}
        </div>
      </Card>
      <div style={{ marginTop: 16 }} className="noprint">
        {ask
          ? <Assistant context="feedback" poste={p.poste} id="asst-feedback" title="Une question sur ce retour ?" intro="Je peux vous expliquer un repère du retour ou vous donner des conseils pour votre prochain essai. Je ne vois pas votre vidéo." />
          : <button type="button" onClick={() => setAsk(true)} style={{ display: "inline-flex", alignItems: "center", gap: 8, font: `600 13.5px ${FB}`, color: T.violet, background: GRAD_AI_SOFT, border: `1px solid ${T.violet}33`, borderRadius: RAD.pill, padding: "10px 16px", cursor: "pointer" }}>
              <Icon d={I.chat} s={16} c={T.violet} /> Une question sur ce retour ? Demandez à l'assistant
            </button>}
      </div>
      <div style={{ marginTop: 12 }} className="noprint"><Back onClick={() => go("home", { queue: null })} /></div>
    </div>
  );
}

function Share({ p, take, go }) {
  const [note, setNote] = useState("");
  return (
    <Card pad={32} style={{ ...wrap(640), boxShadow: SH.sm }}>
      <Tag tone="success">Partage · vous décidez</Tag>
      <h1 style={{ font: `800 24px ${FD}`, margin: "12px 0 6px", color: T.navy }}>Envoyer cette réponse à {p.counselor || "votre coach"}</h1>
      <p style={{ font: `400 14.5px/1.6 ${FB}`, color: T.body, margin: "0 0 18px" }}>Votre réponse enregistrée et le retour de l'assistant seront transmis uniquement à votre coach. Vous pouvez la supprimer à tout moment.</p>
      <label htmlFor="note" style={{ font: `600 13px ${FB}`, color: T.navy, display: "block", marginBottom: 8 }}>Un mot pour votre coach (facultatif)</label>
      <textarea id="note" value={note} onChange={e => setNote(e.target.value)} placeholder="Par exemple : j'ai l'impression de parler trop vite, qu'en pensez-vous ?"
        style={{ width: "100%", minHeight: 90, padding: 14, borderRadius: RAD.md, border: `1.5px solid ${T.line}`, font: `400 14px/1.5 ${FB}`, color: T.navy, resize: "vertical", marginBottom: 20 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Back onClick={() => go("report")} />
        <Btn kind="objective" onClick={() => { updateTake(take.id, { shared: true, sharedAt: new Date().toISOString(), note: note.trim() }); go("sent"); }}>Envoyer&nbsp;<Icon d={I.send} s={16} c="#fff" /></Btn>
      </div>
    </Card>
  );
}

function Sent({ p, go, series, nextQuestion }) {
  return (
    <Card pad={40} style={{ ...wrap(580), textAlign: "center", boxShadow: SH.sm }}>
      <div style={{ width: 60, height: 60, borderRadius: "50%", background: T.successBg, display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Icon d={I.check} s={28} c={T.success} /></div>
      <h1 style={{ font: `800 24px ${FD}`, color: T.navy, margin: "0 0 10px" }}>Réponse envoyée</h1>
      <p style={{ font: `400 15px/1.65 ${FB}`, color: T.body, margin: "0 auto 22px", maxWidth: 430 }}>{p.counselor || "Votre coach"} va relire votre réponse et y ajouter ses remarques. Vous retrouverez son rapport dans votre espace, avec ce même code, et vous en parlerez ensemble en atelier.</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <Btn kind="secondary" onClick={() => go("home", { queue: null })}>Revenir à mon espace</Btn>
        {series?.hasNext
          ? <Btn kind="objective" onClick={nextQuestion}>Question suivante ({series.i + 2}/{series.n})&nbsp;<Icon d={I.arrow} s={16} c="#fff" /></Btn>
          : <Btn kind="objective" onClick={() => go("pick", { queue: null, selection: null, preselect: null })}><Icon d={I.redo} s={16} c="#fff" /> M'entraîner à nouveau</Btn>}
      </div>
    </Card>
  );
}
