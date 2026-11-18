import React, { useEffect, useState } from "react";
import { T, GRAD_SOFT, GRAD_AI, FD, FB, FM, RAD, SH, Card, Tag, Btn, Back, Icon, I, Rail, GradHead, RepetMark } from "./ui.jsx";
import Recorder from "./Recorder.jsx";
import { ReportBody } from "./Report.jsx";
import { useStore, findParcours, updateParcours, takesOf, createTake, updateTake, deleteTake, withdrawConsent } from "./lib/store.js";
import { transcribe } from "./lib/transcribe.js";
import { analyze } from "./lib/analysis.js";
import { QUESTIONS, WARMUP_QUESTION, fill } from "./lib/questions.js";

const wrap = w => ({ maxWidth: w, margin: "0 auto" });
const dateFr = iso => new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

export default function Beneficiary({ initialCode, setModal }) {
  const s = useStore();
  const [code, setCode] = useState(() => (initialCode && findParcours(initialCode) ? initialCode.toUpperCase() : null));
  const [view, setView] = useState("home");
  const [ctx, setCtx] = useState({}); // question, recording, takeId, mode
  const p = code ? s.parcours[code] : null;

  useEffect(() => { if (p && !p.openedAt) updateParcours(p.code, { openedAt: new Date().toISOString() }); }, [p?.code]);
  useEffect(() => { if (code && !p) setCode(null); }, [p, code]); // parcours supprimé par le conseiller

  if (!p) return <main style={{ padding: "36px 24px 64px" }}><CodeEntry initial={initialCode} onOk={c => { setCode(c); setView("home"); }} /></main>;
  if (!p.consent) return <main style={{ padding: "36px 24px 64px" }}><Consent p={p} setModal={setModal} onBack={() => setCode(null)} /></main>;

  const go = (v, patch) => { if (patch) setCtx(c => ({ ...c, ...patch })); setView(v); window.scrollTo({ top: 0 }); };
  const flowSteps = ["Question", "Entraînement", "Analyse", "Retour"];
  const flowIdx = { pick: 0, record: 1, processing: 2, choose: 3, report: 3 }[view];
  const take = ctx.takeId ? s.takes[ctx.takeId] : null;

  return (
    <main style={{ padding: "36px 24px 64px" }}>
      {flowIdx !== undefined && <div style={{ ...wrap(view === "report" && ctx.mode === "video" ? 1000 : 820), marginBottom: 28 }} className="noprint"><Rail step={flowIdx} steps={flowSteps} /></div>}
      <div key={view} className="up">
        {view === "home" && <Home p={p} takes={takesOf(p.code, s)} go={go} counselor={p.counselor} onQuit={() => setCode(null)} />}
        {view === "warmup" && <Warmup p={p} go={go} setModal={setModal} />}
        {view === "pick" && <Pick p={p} go={go} />}
        {view === "record" && (
          <Card pad={28} style={{ ...wrap(820), boxShadow: SH.sm }}>
            <Tag tone="primary">Entraînement</Tag>
            <h1 style={{ font: `800 24px ${FD}`, margin: "12px 0 6px", color: T.navy, letterSpacing: "-.02em" }}>À vous. Reprenez autant que vous voulez.</h1>
            <p style={{ font: `400 14px/1.55 ${FB}`, color: T.body, margin: "0 0 16px" }}>Aucun signal ne vous interrompt pendant l'enregistrement. Le retour vient après, et c'est vous qui décidez de le partager.</p>
            <EmotionNote setModal={setModal} />
            <Recorder question={ctx.question} setModal={setModal} onCancel={() => go("pick")}
              trackGaze={!!p.consent.ai} validateLabel={p.consent.ai ? "Voir mon retour" : "Enregistrer ma prise"}
              onDone={rec => go("processing", { recording: rec })} />
          </Card>
        )}
        {view === "processing" && <Processing p={p} ctx={ctx} go={go} />}
        {view === "choose" && take && <Choose take={take} go={go} />}
        {view === "report" && take && <TakeReport p={p} take={take} mode={ctx.mode} go={go} />}
        {view === "share" && take && <Share p={p} take={take} go={go} />}
        {view === "sent" && <Sent p={p} go={go} />}
      </div>
    </main>
  );
}

/* ─── Saisie du code ─── */
function CodeEntry({ initial, onOk }) {
  const [code, setCode] = useState((initial || "").toUpperCase());
  const [err, setErr] = useState(initial ? "Ce code n'existe pas ou n'est plus actif." : "");
  const submit = e => {
    e?.preventDefault();
    const p = findParcours(code);
    if (p) onOk(p.code); else setErr("Ce code n'existe pas ou n'est plus actif. Vérifiez-le auprès de votre conseiller.");
  };
  return (
    <div style={{ ...wrap(460), textAlign: "center" }}>
      <div style={{ display: "inline-flex", marginBottom: 24 }}><RepetMark s={58} /></div>
      <h1 style={{ font: `800 30px ${FD}`, letterSpacing: "-.03em", color: T.navy, margin: "0 0 12px" }}>Bienvenue sur La Répét'</h1>
      <p style={{ font: `400 16px/1.6 ${FB}`, color: T.body, margin: "0 0 28px" }}>Saisissez le code transmis par votre conseiller, ou ouvrez directement le lien qu'il vous a envoyé.</p>
      <Card pad={28} style={{ boxShadow: SH.sm }}>
        <form onSubmit={submit}>
          <label htmlFor="code" style={{ font: `600 13px ${FB}`, color: T.navy, display: "block", textAlign: "left", marginBottom: 8 }}>Votre code d'accès</label>
          <input id="code" value={code} autoComplete="off" maxLength={6} onChange={e => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")); setErr(""); }} placeholder="6 caractères"
            style={{ width: "100%", height: 56, padding: "0 18px", borderRadius: RAD.md, border: `1.5px solid ${err ? T.error : T.line}`, font: `700 22px ${FM}`, letterSpacing: ".25em", textAlign: "center", color: T.navy, background: T.bg }} />
          {err && <div role="alert" style={{ font: `500 13px ${FB}`, color: T.error, marginTop: 8, textAlign: "left" }}>{err}</div>}
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
      <div style={{ padding: "24px 32px 8px" }}>
        {box("local", "Enregistrer et analyser mes prises sur cet appareil", "La vidéo et le son restent sur votre appareil. Ils ne sont envoyés à votre conseiller que si vous le décidez, prise par prise.", true)}
        {box("ai", "Recevoir un retour de l'assistant", "Un retour écrit qui décrit des faits (rythme, pauses, structure, direction du regard). Il ne note pas et ne déduit aucune émotion. Sans cette option, vous pouvez quand même vous enregistrer et vous revoir.")}
        <div style={{ font: `400 13px/1.6 ${FB}`, color: T.body, margin: "12px 0 4px" }}>
          En continuant, vous confirmez avoir pris connaissance des {link("cgu", "conditions d'utilisation")}, de la {link("rgpd", "notice de protection des données")} et du {link("lifecycle", "cycle de vie de la vidéo")}. Vous pouvez retirer votre consentement à tout moment depuis votre espace, sans justification.
        </div>
      </div>
      <div style={{ padding: "18px 32px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
  const suggestWarmup = p.warmup && !p.warmupDone && takes.length === 0;
  const withdraw = async () => {
    if (window.confirm("Retirer votre consentement supprime toutes vos prises et vos rapports sur cet appareil. Continuer ?")) await withdrawConsent(p.code);
  };
  return (
    <div style={wrap(820)}>
      <Card pad={0} style={{ overflow: "hidden", boxShadow: SH.sm, marginBottom: 18 }}>
        <GradHead tag={counselor ? `Accompagnement avec ${counselor}` : "Votre espace"} title={`Bonjour ${p.prenom}`}
          sub={`Poste visé : ${p.poste || "non précisé"}. Entraînez-vous autant de fois que vous le souhaitez, y compris après vos ateliers.`} />
        <div style={{ padding: "20px 28px", display: "flex", gap: 10, flexWrap: "wrap" }}>
          {suggestWarmup && <Btn kind="secondary" onClick={() => go("warmup")}>Commencer par un échauffement</Btn>}
          <Btn kind="objective" onClick={() => go("pick")}><Icon d={I.plus} s={17} c="#fff" /> Nouvel entraînement</Btn>
        </div>
      </Card>

      {reports.length > 0 && (
        <div style={{ background: `${T.orange}10`, border: `1px solid ${T.orange}33`, borderRadius: RAD.md, padding: "14px 18px", marginBottom: 18, font: `500 14px ${FB}`, color: T.navy }}>
          {counselor || "Votre conseiller"} vous a envoyé {reports.length > 1 ? `${reports.length} rapports` : "un rapport"}. Ouvrez la prise concernée pour le lire.
        </div>
      )}

      <h2 style={{ font: `800 20px ${FD}`, color: T.navy, margin: "8px 0 12px" }}>Mes prises</h2>
      {takes.length === 0 && <Card><div style={{ font: `400 14px ${FB}`, color: T.body }}>Vous n'avez pas encore de prise. Lancez un entraînement quand vous êtes prêt·e.</div></Card>}
      {takes.map(t => {
        const st = t.report ? ["Rapport reçu", "orange"] : t.shared ? ["Envoyée, en attente de relecture", "primary"] : ["Sur cet appareil uniquement", "muted"];
        return (
          <Card key={t.id} hover style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ width: 42, height: 42, borderRadius: RAD.sm, background: GRAD_AI, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon d={t.hasVideo && !t.mime?.startsWith("audio") ? I.play : I.mic} s={17} c="#fff" /></div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ font: `700 14.5px ${FD}`, color: T.navy }}>{t.question}</div>
              <div style={{ font: `400 12.5px ${FB}`, color: T.muted }}>{dateFr(t.createdAt)} · {Math.round(t.duration)} s</div>
            </div>
            <Tag tone={st[1]}>{st[0]}</Tag>
            <Btn kind="secondary" size="sm" onClick={() => go(t.hasVideo ? "choose" : "report", { takeId: t.id, mode: "simple" })}>Ouvrir</Btn>
          </Card>
        );
      })}

      <div style={{ marginTop: 28, paddingTop: 18, borderTop: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }} className="noprint">
        <button onClick={onQuit} style={{ font: `500 13px ${FB}`, color: T.muted, background: "none", border: "none", cursor: "pointer" }}>← Changer de code</button>
        <button onClick={withdraw} style={{ font: `500 13px ${FB}`, color: T.error, background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}><Icon d={I.trash} s={14} c={T.error} /> Retirer mon consentement et supprimer mes données</button>
      </div>
    </div>
  );
}

/* ─── Échauffement (non analysé, non conservé) ─── */
function Warmup({ p, go, setModal }) {
  const [done, setDone] = useState(false);
  return (
    <Card pad={28} style={{ ...wrap(820), boxShadow: SH.sm }}>
      <Tag tone="warning">Échauffement · sans analyse</Tag>
      <h1 style={{ font: `800 24px ${FD}`, margin: "12px 0 6px", color: T.navy, letterSpacing: "-.02em" }}>D'abord, on respire.</h1>
      <p style={{ font: `400 14px/1.6 ${FB}`, color: T.body, margin: "0 0 16px" }}>Cette prise sert à vous habituer à la caméra. Elle n'est <strong style={{ color: T.navy }}>ni analysée, ni conservée</strong> : elle disparaît quand vous quittez cet écran.</p>
      {done ? (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <div style={{ font: `800 20px ${FD}`, color: T.navy, marginBottom: 8 }}>Échauffement terminé</div>
          <p style={{ font: `400 14px ${FB}`, color: T.body, margin: "0 0 18px" }}>Vous pouvez passer à un vrai entraînement, avec un retour de l'assistant.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Btn kind="secondary" onClick={() => go("home")}>Revenir à mon espace</Btn>
            <Btn kind="objective" onClick={() => go("pick")}>Commencer l'entraînement</Btn>
          </div>
        </div>
      ) : (
        <Recorder question={WARMUP_QUESTION} setModal={setModal} trackGaze={false} validateLabel="Terminer l'échauffement"
          onCancel={() => go("home")} onDone={() => { updateParcours(p.code, { warmupDone: true }); setDone(true); }} />
      )}
    </Card>
  );
}

/* ─── Choix de la question ─── */
function Pick({ p, go }) {
  const [own, setOwn] = useState("");
  const qs = QUESTIONS.map(q => ({ ...q, text: fill(q.text, p.poste) }));
  return (
    <div style={wrap(820)}>
      <h1 style={{ font: `800 26px ${FD}`, color: T.navy, margin: "0 0 6px", letterSpacing: "-.02em" }}>Sur quelle question voulez-vous vous entraîner ?</h1>
      <p style={{ font: `400 15px ${FB}`, color: T.body, margin: "0 0 18px" }}>Choisissez une question ou écrivez celle que vous redoutez.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 10, marginBottom: 18 }}>
        {qs.map(q => (
          <Card key={q.id} hover pad={16} onClick={() => go("record", { question: q.text })}>
            <div style={{ font: `600 11px ${FB}`, color: T.primary, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>{q.theme}</div>
            <div style={{ font: `600 14px/1.45 ${FB}`, color: T.navy }}>{q.text}</div>
          </Card>
        ))}
      </div>
      <Card pad={18}>
        <label htmlFor="own" style={{ font: `600 13px ${FB}`, color: T.navy, display: "block", marginBottom: 8 }}>Ma propre question</label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input id="own" value={own} onChange={e => setOwn(e.target.value)} placeholder="Par exemple : pourquoi avez-vous quitté votre dernier emploi ?"
            style={{ flex: 1, minWidth: 240, height: 48, padding: "0 16px", borderRadius: RAD.md, border: `1.5px solid ${T.line}`, font: `400 15px ${FB}`, color: T.navy }} />
          <Btn kind="primary" disabled={own.trim().length < 5} onClick={() => go("record", { question: own.trim() })}>Utiliser</Btn>
        </div>
      </Card>
      <div style={{ marginTop: 14 }}><Back onClick={() => go("home")} /></div>
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
          analysis = { synthese: "Le retour de l'assistant est désactivé à votre demande. Vous pouvez revoir votre prise et la partager à votre conseiller.", dimensions: [], source: "none" };
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
          <Btn kind="secondary" onClick={() => go("record")}>Refaire la prise</Btn>
          <Btn kind="ai" onClick={() => setAttempt(a => a + 1)}>Réessayer</Btn>
        </div>
      </>)}
    </Card>
  );
}

/* ─── Choix du mode de restitution ─── */
function Choose({ take, go }) {
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
        <Tag tone="success">Votre retour est prêt</Tag>
        <h1 style={{ font: `800 27px ${FD}`, margin: "14px 0 8px", color: T.navy, letterSpacing: "-.02em" }}>Comment préférez-vous le découvrir ?</h1>
        <p style={{ font: `400 15px/1.6 ${FB}`, color: T.body, margin: 0 }}>Les deux contiennent le même retour. Vous pourrez changer d'avis.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
        {opt("simple", "Un rapport écrit", "Sans me revoir", "Vous lisez les observations tranquillement, sous forme de texte. Idéal si vous n'aimez pas vous revoir.")}
        {opt("video", "Revoir ma prise", "Avec les repères au bon moment", "Chaque observation est placée sur la barre de lecture. Cliquez un repère ou une observation : la lecture s'y place.", true)}
      </div>
      <div style={{ marginTop: 16 }}><Back onClick={() => go("home")} /></div>
    </div>
  );
}

/* ─── Rapport + actions ─── */
function TakeReport({ p, take, mode, go }) {
  const del = async () => { if (window.confirm("Supprimer définitivement cette prise et son rapport ?")) { await deleteTake(take.id); go("home"); } };
  return (
    <div style={wrap(mode === "video" ? 1000 : 760)}>
      <Card pad={0} style={{ overflow: "hidden", marginBottom: 16, boxShadow: SH.sm }}>
        <GradHead tag={take.report ? "Rapport de votre conseiller" : "Votre retour"} title={take.question}
          sub={`${dateFr(take.createdAt)} · ${Math.round(take.duration)} s. Ce retour décrit des faits, il ne note pas.`}
          action={take.hasVideo && (
            <button className="noprint" onClick={() => go("report", { mode: mode === "video" ? "simple" : "video" })} style={{ font: `600 12px ${FB}`, color: "#fff", background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.3)", borderRadius: RAD.pill, padding: "8px 14px", cursor: "pointer" }}>
              {mode === "video" ? "Plutôt un rapport écrit" : "Plutôt revoir ma prise"}
            </button>)} />
      </Card>
      <ReportBody take={take} mode={mode} counselorName={p.counselor} />
      <Card style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, background: take.shared ? T.successBg : "#fff" }} className="noprint">
        <div>
          <div style={{ font: `700 15px ${FD}`, color: T.navy }}>{take.report ? "Rapport reçu" : take.shared ? "Prise envoyée à votre conseiller" : `Prêt·e à en parler avec ${p.counselor || "votre conseiller"} ?`}</div>
          <div style={{ font: `400 13px ${FB}`, color: T.body }}>{take.shared ? "Vous pouvez continuer à vous entraîner et envoyer une nouvelle prise à tout moment." : "Cette prise reste sur votre appareil tant que vous ne l'envoyez pas."}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn kind="ghost" size="sm" onClick={del}><Icon d={I.trash} s={15} c={T.primary} /> Supprimer</Btn>
          <Btn kind="ghost" size="sm" onClick={() => window.print()}><Icon d={I.print} s={15} c={T.primary} /> Imprimer ou PDF</Btn>
          <Btn kind="secondary" size="sm" onClick={() => go("pick")}><Icon d={I.redo} s={15} c={T.primary} /> M'entraîner encore</Btn>
          {!take.shared && <Btn kind="objective" size="sm" onClick={() => go("share")}>Envoyer à mon conseiller&nbsp;<Icon d={I.send} s={15} c="#fff" /></Btn>}
        </div>
      </Card>
      <div style={{ marginTop: 12 }} className="noprint"><Back onClick={() => go("home")} /></div>
    </div>
  );
}

function Share({ p, take, go }) {
  const [note, setNote] = useState("");
  return (
    <Card pad={32} style={{ ...wrap(640), boxShadow: SH.sm }}>
      <Tag tone="success">Partage · vous décidez</Tag>
      <h1 style={{ font: `800 24px ${FD}`, margin: "12px 0 6px", color: T.navy }}>Envoyer cette prise à {p.counselor || "votre conseiller"}</h1>
      <p style={{ font: `400 14.5px/1.6 ${FB}`, color: T.body, margin: "0 0 18px" }}>Votre prise et le retour de l'assistant seront transmis uniquement à votre conseiller. Vous pouvez supprimer la prise à tout moment.</p>
      <label htmlFor="note" style={{ font: `600 13px ${FB}`, color: T.navy, display: "block", marginBottom: 8 }}>Un mot pour votre conseiller (facultatif)</label>
      <textarea id="note" value={note} onChange={e => setNote(e.target.value)} placeholder="Par exemple : j'ai l'impression de parler trop vite, qu'en pensez-vous ?"
        style={{ width: "100%", minHeight: 90, padding: 14, borderRadius: RAD.md, border: `1.5px solid ${T.line}`, font: `400 14px/1.5 ${FB}`, color: T.navy, resize: "vertical", marginBottom: 20 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Back onClick={() => go("report")} />
        <Btn kind="objective" onClick={() => { updateTake(take.id, { shared: true, sharedAt: new Date().toISOString(), note: note.trim() }); go("sent"); }}>Envoyer&nbsp;<Icon d={I.send} s={16} c="#fff" /></Btn>
      </div>
    </Card>
  );
}

function Sent({ p, go }) {
  return (
    <Card pad={40} style={{ ...wrap(580), textAlign: "center", boxShadow: SH.sm }}>
      <div style={{ width: 60, height: 60, borderRadius: "50%", background: T.successBg, display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Icon d={I.check} s={28} c={T.success} /></div>
      <h1 style={{ font: `800 24px ${FD}`, color: T.navy, margin: "0 0 10px" }}>Prise envoyée</h1>
      <p style={{ font: `400 15px/1.65 ${FB}`, color: T.body, margin: "0 auto 22px", maxWidth: 430 }}>{p.counselor || "Votre conseiller"} va relire votre prise et y ajouter ses remarques. Vous retrouverez son rapport dans votre espace, avec ce même code, et vous en parlerez ensemble en atelier.</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <Btn kind="secondary" onClick={() => go("home")}>Revenir à mon espace</Btn>
        <Btn kind="objective" onClick={() => go("pick")}><Icon d={I.redo} s={16} c="#fff" /> M'entraîner à nouveau</Btn>
      </div>
    </Card>
  );
}
