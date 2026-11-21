import React, { useEffect, useRef, useState } from "react";
import {
  T, TY, RAD, SH, PAD, GAP, W, Card, Tag, Btn, Back, Link, IconBtn, IconTile, Icon, I, Rail, GradHead, RepetMark, Txt, Notice, Empty, Confirm,
  Field, Input, Textarea, CheckTile, Chip, Modal, BrandLoader,
} from "./ui.jsx";
import Recorder from "./Recorder.jsx";
import WarmupStage from "./WarmupStage.jsx";
import AssistantDock, { openAssistant, nudgeAssistant } from "./Assistant.jsx";
import { ReportBody } from "./Report.jsx";
import { useStore, getState, TRIAL_CODE, findParcours, updateParcours, takesOf, createTake, updateTake, unshareTake, deleteTake, saveWarmupDebrief, loadWarmupDebrief, loadVideoUrl, requestPersistence } from "./lib/store.js";
import { PHRASES, SUMMARY, PAGES, LEGAL_VERSION } from "./content/legal.js";
import { Summary } from "./Legal.jsx";
import { transcribe } from "./lib/transcribe.js";
import { analyze } from "./lib/analysis.js";
import { QUESTIONS, fill, WARMUP_PHRASES, WARMUP_PROMPTS, fillPhrase, randomPhraseIndex, WORK_TOPICS, questionsForTopics, fullInterview, FULL_INTRO, FULL_OUTRO, posteLabel, dePoste } from "./lib/questions.js";
import RecruiterVoice from "./RecruiterVoice.jsx";
import { searchJobs, norm } from "./lib/jobs.js";
import { FEELINGS, feelingAck } from "./lib/assistant.js";
import { useLeaveGuard } from "./lib/hooks.js";
import { hasMedia, isAudio, noFeedback } from "./lib/takes.js";
import { dateTime, duration } from "./lib/format.js";

const CODE_ERR = "Ce code ne fonctionne pas. Vérifiez les 6 caractères, ou demandez-le à votre coach.";
/* Ouvrir une réponse : choix du mode de lecture seulement s'il y a un retour de l'assistant et un enregistrement. */
const openView = t => (!hasMedia(t) ? ["report", "simple"] : noFeedback(t) ? ["report", "video"] : ["choose", "simple"]);
const wrap = w => ({ maxWidth: w, margin: "0 auto", width: "100%" });

const stack = (gap = GAP.stack) => ({ display: "grid", gap });
const dateFr = dateTime, dur = duration; // formats uniques (src/lib/format.js)
const actions = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: GAP.actions, flexWrap: "wrap" };
const PAGE = { padding: PAD.page };

export default function Beneficiary({ initialCode, setModal, onCode }) {
  const s = useStore();
  const [code, setCode] = useState(() => (initialCode && findParcours(initialCode) ? initialCode.toUpperCase() : null));
  const [view, setView] = useState("home");
  const [speaking, setSpeaking] = useState(false); // le recruteur lit la question : l'enregistrement attend
  const [ctx, setCtx] = useState({}); // question, recording, takeId, mode ; série : queue (textes), qi (rang), selection, preselect
  const p0 = code ? s.parcours[code] || getState().parcours[code] : null; // instantané éventuellement antérieur à la création du parcours d'essai
  const p = p0 && { ...p0, counselor: p0.counselor || s.counselor?.name || "" }; // nom du coach affiché

  useEffect(() => { if (p && !p.openedAt) updateParcours(p.code, { openedAt: new Date().toISOString() }); }, [p?.code]);
  useEffect(() => { if (code && !p && !findParcours(code)) setCode(null); }, [p, code]); // parcours supprimé par le coach
  /* Mémorise l'espace ouvert (bouton « Mon espace »). L'oubli (onCode(null)) n'a lieu que sur une sortie explicite,
     pas à l'ouverture d'un lien avec un code inconnu (BUG-14) : la session d'un autre espace reste mémorisée. */
  const prevCode = useRef(code);
  useEffect(() => { if (code || prevCode.current) onCode && onCode(code); prevCode.current = code; }, [code]);
  /* Accord retiré (ici ou dans un autre onglet) : retour à l'accueil de l'espace, contexte vidé (BUG-03). */
  useEffect(() => { if (p && !p.consent) { setView("home"); setCtx({}); } }, [p?.consent]); // eslint-disable-line
  const take = ctx.takeId ? s.takes[ctx.takeId] : null;
  /* Réponse supprimée (autre onglet, retrait de l'accord) alors qu'un écran l'affichait : retour à l'accueil (BUG-03). */
  const orphan = ["choose", "report", "share"].includes(view) && !take;
  useEffect(() => { if (orphan) { setView("home"); setCtx(c => ({ ...c, takeId: null })); } }, [orphan]);

  if (!p) return <main className="rp-page" style={PAGE}><CodeEntry initial={initialCode} invalid={!!initialCode && !findParcours(initialCode)} onOk={c => { setCode(c); setView("home"); }} /></main>;
  if (!p.consent) return <main className="rp-page" style={PAGE}><Consent p={p} onBack={() => setCode(null)} /></main>;

  const go = (v, patch) => { if (patch) setCtx(c => ({ ...c, ...patch })); setView(v); window.scrollTo({ top: 0 }); };
  /* Sans retour de l'assistant (BUG-05) : trois étapes, pas de « Préparation » ni de « Retour ». */
  const flowSteps = p.consent.ai ? ["Questions", "Réponse", "Préparation", "Retour"] : ["Questions", "Réponse", "Réponse gardée"];
  const flowIdx = (p.consent.ai ? { pick: 0, record: 1, processing: 2, choose: 3, report: 3 } : { pick: 0, record: 1, processing: 2, choose: 2, report: 2 })[view];
  const total = ctx.from === "recap" ? 0 : ctx.queue?.length || 0; // réponse rouverte depuis le récapitulatif : pas de suite de série
  const series = total ? { i: ctx.qi || 0, n: total, hasNext: (ctx.qi || 0) < total - 1, full: !!ctx.full, step: ctx.steps?.[ctx.qi || 0] } : null;
  const nextQuestion = () => go("record", { qi: series.i + 1, question: ctx.queue[series.i + 1], takeId: null, recording: null });
  /* « Retour » depuis une réponse rouverte du récapitulatif : retour au récapitulatif, série conservée (BUG-22). */
  const back = () => (ctx.from === "recap" ? go("recap", { takeId: null }) : go("home", { queue: null }));
  const stopSeries = () => (series?.full ? go("recap") : go("home", { queue: null, qi: 0 }));

  const asstCtx = { warmup: "warmup", record: "record", processing: "record", choose: "feedback", report: "feedback", share: "feedback" }[view] || "general";
  return (
    <main className="rp-page rp-has-fab" style={PAGE}>
      <AssistantDock poste={p.poste} context={asstCtx} />
      {flowIdx !== undefined && <div style={{ ...wrap(view === "report" && ctx.mode === "video" ? W.wide : W.read), marginBottom: GAP.block }} className="noprint"><Rail step={flowIdx} steps={flowSteps} /></div>}
      <div key={view} className="up">
        {view === "home" && <Home p={p} takes={takesOf(p.code, s)} go={go} counselor={p.counselor} />}
        {view === "warmup" && <Warmup p={p} go={go} setModal={setModal} />}
        {view === "pick" && <Pick p={p} ctx={ctx} go={go} />}
        {view === "record" && (
          <Card pad="lg" level={2} style={{ ...wrap(W.read), ...stack(16) }}>
            <div><Tag tone="primary">{series?.full ? `Entraînement complet · question ${series.i + 1} sur ${series.n}` : series && series.n > 1 ? `Entraînement · question ${series.i + 1} sur ${series.n}` : "Entraînement"}</Tag></div>
            <div style={stack(8)}>
              <Txt v="h1" as="h1" color={T.navy}>À vous de répondre</Txt>
              <Txt v="body" color={T.body}>Rien ne vous interrompt pendant que vous parlez. Vous pouvez recommencer autant de fois que vous voulez.</Txt>
            </div>
            <EmotionNote setModal={setModal} />
            <RecruiterVoice key={`${ctx.qi || 0}-${ctx.question}`} label={series?.full ? `Le recruteur · ${series.step}` : "Question du recruteur"} text={series?.full && series.i === 0 ? `${FULL_INTRO} ${ctx.question}` : ctx.question} onSpeaking={setSpeaking} />
            <Recorder question={null} speaking={speaking} beforeStart={() => { try { window.speechSynthesis?.cancel(); } catch { /* rien */ } }} setModal={setModal} onCancel={() => go("pick")}
              trackGaze={!!p.consent.ai} validateLabel={p.consent.ai ? "Voir mon retour" : "Garder cette réponse"}
              onDone={rec => go("processing", { recording: rec })} />
          </Card>
        )}
        {view === "processing" && <Processing p={p} ctx={ctx} go={go} />}
        {view === "choose" && take && <Choose take={take} go={go} series={series} back={back} />}
        {view === "report" && take && <TakeReport p={p} take={take} mode={ctx.mode} go={go} series={series} nextQuestion={nextQuestion} stopSeries={stopSeries} back={back} />}
        {view === "share" && take && <Share p={p} take={take} go={go} setModal={setModal} />}
        {view === "sent" && <Sent p={p} go={go} series={series} nextQuestion={nextQuestion} />}
        {view === "recap" && <Recap p={p} ctx={ctx} s={s} go={go} />}
      </div>
    </main>
  );
}

/* ─── Saisie du code ─── */
function CodeEntry({ initial, invalid, onOk }) {
  const [code, setCode] = useState((initial || TRIAL_CODE).toUpperCase());
  /* Erreur posée seulement si le code reçu par le lien est inconnu (BUG-04), pas après « Retour » depuis l'accord. */
  const [err, setErr] = useState(invalid ? CODE_ERR : "");
  const submit = e => {
    e?.preventDefault();
    const p = findParcours(code);
    if (!p) return setErr(CODE_ERR);
    setBusy(true);
    setTimeout(() => onOk(p.code), 700); // logo d'attente, durée minimale courte
  };
  const [busy, setBusy] = useState(false);
  return (
    <div style={{ ...wrap(W.narrow), textAlign: "center", display: "grid", gap: GAP.grid, justifyItems: "center" }}>
      {busy && <BrandLoader full label="Ouverture de votre espace…" />}
      <RepetMark s={56} />
      <div style={stack(12)}>
        <Txt v="h1" as="h1" color={T.navy}>Bienvenue sur La Répét'</Txt>
        <Txt v="bodyLg" color={T.body}>Écrivez le code d'accès que votre coach vous a donné.</Txt>
      </div>
      <Card pad="lg" level={2} style={{ width: "100%", textAlign: "left" }}>
        <form onSubmit={submit} style={stack(GAP.grid)}>
          <Field id="code" label="Votre code d'accès" error={err}>
            <Input id="code" variant="code" error={err} value={code} autoComplete="off" maxLength={6} placeholder="6 caractères"
              onChange={e => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")); setErr(""); }} />
          </Field>
          <Btn kind="objective" size="lg" full disabled={code.length < 6} iconRight={I.arrow}>Ouvrir mon espace</Btn>
        </form>
      </Card>
      <Txt v="caption" color={T.muted}>Ce code est à vous. Ne le donnez à personne. {PHRASES.code}</Txt>
    </div>
  );
}

/* ─── Accord (consentement) : les deux cases décochées au départ (RGPD, art. 4(11) et 7) ─── */
function Consent({ p, onBack }) {
  const [c, setC] = useState({ local: false, ai: false });
  const box = (k, title, text, required) => (
    <CheckTile on={c[k]} onToggle={() => setC(x => ({ ...x, [k]: !x[k] }))}>
      <span style={{ ...TY.bodyStrong, color: T.navy }}>{title} <span style={{ ...TY.caption, color: T.muted }}>· {required ? "obligatoire pour s'entraîner" : "au choix"}</span></span>
      <span style={{ ...TY.small, color: T.body }}>{text}</span>
    </CheckTile>
  );
  return (
    <Card pad="none" level={2} style={wrap(W.read)}>
      <GradHead tag={`Bonjour ${p.prenom}`} title="Avant de commencer" sub="Cet espace est le vôtre. Rien n'est noté. Rien n'est envoyé sans vous." />
      <div className="rp-pad-lg" style={{ padding: PAD.lg, ...stack(GAP.grid) }}>
        <Summary items={SUMMARY.accord} />
        <div style={stack(GAP.stack)}>
          {box("local", "Je veux m'enregistrer sur cet appareil.", "Ma vidéo et ma voix restent sur cet appareil. Mon coach les voit seulement si je les lui envoie, réponse par réponse.", true)}
          {box("ai", "Je veux recevoir un retour de l'assistant.", "L'assistant est un programme. Il décrit des faits : rythme de parole, pauses, regard. Il ne met pas de note. Il ne cherche pas à deviner les émotions. Sans cette case, vous pouvez quand même vous enregistrer et vous revoir.")}
        </div>
        <div style={stack(8)}>
          <p style={{ ...TY.small, color: T.body, margin: 0 }}>{PHRASES.refuse}</p>
          <p style={{ ...TY.small, color: T.body, margin: 0 }}>{PHRASES.changeMind}</p>
          <p style={{ ...TY.small, color: T.body, margin: 0, display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
            <Link href={PAGES.hub.route} target="_blank" rel="noopener">Tout lire sur vos données (nouvel onglet)</Link>
            <Link href={PAGES.conditions.route} target="_blank" rel="noopener">Règles d'utilisation (nouvel onglet)</Link>
          </p>
        </div>
        <div className="rp-actions" style={actions}>
          <Back onClick={onBack} />
          <Btn kind="objective" disabled={!c.local} onClick={() => { requestPersistence(); updateParcours(p.code, { consent: { at: new Date().toISOString(), local: true, ai: c.ai, version: LEGAL_VERSION } }); }} iconRight={I.arrow}>Je suis d'accord, je commence</Btn>
        </div>
      </div>
    </Card>
  );
}

function EmotionNote({ setModal }) {
  return (
    <Notice tone="ai" icon={I.shield}>
      <strong>L'assistant ne cherche pas à deviner vos émotions.</strong> Il décrit seulement ce qui se voit et ce qui s'entend.{" "}
      <Link onClick={() => setModal("assistant")}>En savoir plus sur ce choix</Link>
    </Notice>
  );
}

/* ─── Espace personnel ─── */
function Home({ p, takes, go, counselor }) {
  const reports = takes.filter(t => t.report);
  return (
    <div style={{ ...wrap(W.read), ...stack(GAP.block) }}>
      <Card pad="none" level={2}>
        <GradHead tag={counselor ? `Accompagnement avec ${counselor}` : "Votre espace"} title={`Bonjour ${p.prenom}`}
          sub="Indiquez le métier que vous visez. Puis choisissez : un échauffement ou un entraînement." />
        <div className="rp-pad-md" style={{ padding: PAD.md, ...stack(GAP.grid) }}>
          <JobField p={p} />
          <div className="rp-stack" style={{ gap: GAP.stack }}>
            <ChoiceTile icon={I.mic} title="Échauffement" tipLabel="En savoir plus sur l'échauffement" tipId="tip-warmup"
              tip="L'échauffement sert à vous lancer. Vous dites une phrase à voix haute, plusieurs fois, en suivant une consigne. Rien n'est enregistré ni gardé."
              text="Quelques minutes pour vous lancer, une phrase à la fois. Rien n'est enregistré.">
              <Btn kind="secondary" onClick={() => go("warmup")}>M'échauffer</Btn>
            </ChoiceTile>
            <ChoiceTile icon={I.play} title="Entraînement" tipLabel="En savoir plus sur l'entraînement" tipId="tip-training"
              tip={p.consent.ai
                ? "Vos réponses sont enregistrées sur votre appareil. L'assistant les décrit, sans les noter. Vous décidez ensuite, réponse par réponse, de les envoyer ou non à votre coach."
                : "Vos réponses sont enregistrées sur votre appareil, pour que vous puissiez vous revoir. Vous avez choisi de ne pas recevoir le retour de l'assistant. Vous décidez, réponse par réponse, de les envoyer ou non à votre coach."}
              text={p.consent.ai ? "Vous choisissez vos questions et vous enregistrez vos réponses. L'assistant décrit ensuite chaque réponse." : "Vous choisissez vos questions et vous enregistrez vos réponses."}>
              <Btn kind="objective" onClick={() => go("pick", { queue: null, selection: null, preselect: null })} iconRight={I.arrow}>Commencer l'entraînement</Btn>
            </ChoiceTile>
          </div>
        </div>
      </Card>

      {reports.length > 0 && (
        <Notice tone="success">
          {counselor || "Votre coach"} vous a envoyé {reports.length > 1 ? `${reports.length} rapports` : "un rapport"}. Ouvrez la réponse marquée « Rapport reçu » pour le lire.
        </Notice>
      )}

      <section style={stack(16)}>
        <Txt v="h2" as="h2" color={T.navy}>Mes réponses</Txt>
        {takes.length === 0 && <Empty icon={I.play} text="Vous n'avez pas encore de réponse enregistrée. Commencez quand vous voulez." />}
        {takes.length > 0 && (
          <div style={stack(GAP.stack)}>
            {takes.map(t => {
              const st = t.report ? ["Rapport reçu", "success"] : t.shared ? ["Envoyée à votre coach", "primary"] : ["Gardée sur cet appareil", "muted"];
              return (
                <Card key={t.id} pad="sm" hover style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <IconTile icon={hasMedia(t) && !isAudio(t) ? I.play : I.mic} />
                  <div style={{ flex: 1, minWidth: 200, ...stack(4) }}>
                    <div style={{ ...TY.h4, color: T.navy }}>{t.question}</div>
                    <div style={{ ...TY.caption, color: T.muted }}>{dateFr(t.createdAt)} · {dur(t.duration)}</div>
                  </div>
                  <Tag tone={st[1]}>{st[0]}</Tag>
                  <Btn kind="secondary" size="sm" onClick={() => { const [v, mode] = openView(t); go(v, { takeId: t.id, mode, queue: null, from: null }); }}>Ouvrir</Btn>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <Notice tone="info" icon={I.shield}>
        {PHRASES.noTracking} {PHRASES.sharedDevice} <Link href={PAGES.hub.route}>Vos données</Link>
      </Notice>
    </div>
  );
}

/* Tuile de choix (échauffement / entraînement) avec bulle d'information : bloc interne, pas une carte dans la carte. */
function ChoiceTile({ icon, title, text, tip, tipLabel, tipId, children }) {
  return (
    <div style={{ position: "relative", borderRadius: RAD.md, padding: PAD.sm, display: "flex", flexDirection: "column", gap: 12, background: T.bg, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <IconTile icon={icon} bg={T.surface} />
        <h2 style={{ ...TY.h3, color: T.navy, margin: 0, flex: 1 }}>{title}</h2>
        <InfoTip label={tipLabel} id={tipId}>{tip}</InfoTip>
      </div>
      <p style={{ ...TY.small, color: T.body, margin: 0, flex: 1 }}>{text}</p>
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
      <IconBtn icon={I.info} label={label} aria-expanded={open} aria-controls={id} onClick={() => setPinned(v => !v)} />
      <span id={id} role="note" hidden={!open}
        style={{ position: "absolute", left: 8, right: 8, top: 64, zIndex: 20, background: T.surface, border: `1px solid ${T.line}`, borderRadius: RAD.sm, boxShadow: SH.lg, padding: "12px 16px", ...TY.small, color: T.navy, display: open ? "block" : "none" }}>
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
    if (t !== p.poste) { updateParcours(p.code, { poste: t }); setStatus(`Métier enregistré : ${t}. Les questions en tiennent compte.`); }
  };
  const onKey = e => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive(a => (items.length ? (a + 1) % items.length : -1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setOpen(true); setActive(a => (items.length ? (a <= 0 ? items.length - 1 : a - 1) : -1)); }
    else if (e.key === "Enter") { e.preventDefault(); commit(open && active >= 0 && items[active] ? labelOf(items[active]) : val); }
    else if (e.key === "Escape") { if (open) { e.preventDefault(); setOpen(false); setActive(-1); } else setVal(p.poste || ""); }
  };

  return (
    <div style={{ position: "relative", ...stack(8) }}>
      <Field id="job" label="Métier visé" hint={`Écrivez votre métier. Vous pouvez aussi le choisir dans la liste. ${PHRASES.job}`}>
        <div style={{ position: "relative" }}>
          <Input id="job" icon={I.search} hint role="combobox" aria-autocomplete="list" aria-expanded={open && items.length > 0} aria-controls="job-list"
            aria-activedescendant={open && active >= 0 ? `job-opt-${active}` : undefined}
            value={val} autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="Par exemple : agent d'accueil"
            onChange={e => { setVal(e.target.value); setOpen(true); setActive(-1); setStatus(""); }}
            onFocus={() => { clearTimeout(blurT.current); setOpen(true); }}
            onClick={() => setOpen(true)}
            onBlur={() => { blurT.current = setTimeout(() => commit(valRef.current), 160); }}
            onKeyDown={onKey} />
          {open && items.length > 0 && (
            <ul id="job-list" role="listbox" aria-label="Métiers proposés"
              style={{ position: "absolute", left: 0, right: 0, top: "calc(100% + 8px)", zIndex: 30, margin: 0, padding: 4, listStyle: "none", background: T.surface, border: `1px solid ${T.line}`, borderRadius: RAD.md, boxShadow: SH.lg, maxHeight: 264, overflowY: "auto" }}>
              {items.map((it, i) => (
                // design-lint-disable-next-line K4 -- option d'une liste combobox ARIA : le clavier passe par le champ (aria-activedescendant), le clic complète
                <li key={labelOf(it) + i} id={`job-opt-${i}`} role="option" aria-selected={i === active} className="rp-opt"
                  onPointerDown={e => e.preventDefault()} onMouseDown={e => e.preventDefault()}
                  onClick={() => { clearTimeout(blurT.current); commit(labelOf(it)); }}
                  onMouseMove={() => active !== i && setActive(i)}
                  style={{ padding: "12px 12px", borderRadius: RAD.sm, cursor: "pointer", ...(typeof it === "string" ? TY.body : TY.bodyStrong), color: typeof it === "string" ? T.navy : T.primary, background: i === active ? T.primaryBg : undefined }}>
                  {typeof it === "string" ? it : `Utiliser « ${it.free} »`}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Field>
      <div role="status" aria-live="polite" style={{ ...TY.small, color: T.successDk, display: "flex", alignItems: "center", gap: 8 }}>
        {status && <><Icon d={I.check} s={16} />{status}</>}
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
  ["Installez-vous", "Le dos droit, assis ou debout, les pieds à plat. La respiration est plus libre et la voix porte mieux."],
  ["Si vous butez sur un mot, continuez", "Tout le monde hésite à l'oral. Reprendre simplement la phrase suffit."],
  ["Gardez un verre d'eau à portée de main", "Boire une gorgée laisse aussi un instant pour réfléchir."],
];

function Warmup({ p, go, setModal }) {
  const [stage, setStage] = useState("practice"); // practice | debrief
  const [pi, setPi] = useState(() => randomPhraseIndex());
  const [prompt, setPrompt] = useState(0);
  const [tips, setTips] = useState(false);
  const phrase = fillPhrase(WARMUP_PHRASES[pi], p);
  const shuffle = () => { setPi(i => randomPhraseIndex(i)); setPrompt(0); };
  const finish = () => { updateParcours(p.code, { warmupDone: true }); setStage("debrief"); window.scrollTo({ top: 0 }); };

  if (stage === "debrief") return <WarmupDebrief p={p} go={go} again={() => { setStage("practice"); shuffle(); window.scrollTo({ top: 0 }); }} />;

  return (
    <div style={{ ...wrap(W.read), ...stack(GAP.grid) }}>
      <Card pad="lg" level={2} style={stack(16)}>
        <div><Tag tone="primary">Échauffement · rien n'est enregistré</Tag></div>
        <div style={stack(8)}>
          <Txt v="h1" as="h1" color={T.navy}>Échauffez votre voix</Txt>
          <Txt v="body" color={T.body} style={{ maxWidth: W.form }}>
            Dites la phrase à voix haute. Redites-la en suivant la consigne. Changez de phrase quand vous voulez.
          </Txt>
        </div>

        <div><Link onClick={() => setTips(true)} style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44 }}><Icon d={I.bulb} s={16} />Voir les astuces pour bien démarrer</Link></div>
        <div style={{ background: T.primaryBg, borderRadius: RAD.md, padding: "16px 20px", ...stack(12) }}>
          <div style={{ ...TY.overline, color: T.primary }}>Votre phrase</div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <p aria-live="polite" data-testid="warmup-phrase" style={{ ...TY.h2, color: T.navy, margin: 0, flex: 1, minWidth: 0 }}>« {phrase} »</p>
            <IconBtn icon={I.shuffle} label="Changer de phrase" variant="outline" onClick={shuffle} />
          </div>
          <div style={{ paddingTop: 12, borderTop: `1px solid ${T.line}`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200, ...TY.small, color: T.navy }} aria-live="polite">
              <strong>Consigne {prompt + 1} sur {WARMUP_PROMPTS.length} :</strong> {WARMUP_PROMPTS[prompt]}
            </div>
            <Btn kind="ghost" size="sm" onClick={() => setPrompt(i => (i + 1) % WARMUP_PROMPTS.length)} icon={I.redo}>Consigne suivante</Btn>
          </div>
        </div>

        <WarmupStage setModal={setModal} />
      </Card>

      {tips && (
        <Modal close={() => setTips(false)} title="Astuces pour bien démarrer" icon={I.bulb} footer={<div style={{ display: "flex", justifyContent: "flex-end" }}><Btn kind="primary" size="sm" onClick={() => setTips(false)}>Fermer</Btn></div>}>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 12 }}>
            {WARMUP_TIPS.map(([t, d]) => (
              <li key={t} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ marginTop: 2, display: "inline-flex", color: T.primary }}><Icon d={I.check} s={16} /></span>
                <span style={{ ...TY.body, color: T.body }}><strong style={{ color: T.navy }}>{t}.</strong> {d}</span>
              </li>
            ))}
          </ul>
        </Modal>
      )}

      <div className="rp-actions" style={actions}>
        <Back onClick={() => go("home")} />
        <Btn kind="objective" onClick={finish} iconRight={I.arrow}>Terminer l'échauffement</Btn>
      </div>
    </div>
  );
}

const OPINIONS = ["Utile", "Rassurant", "Trop court", "Pas assez guidé", "Je ne sais pas encore"];

/* Questionnaire de fin d'échauffement : réponses gardées sur l'appareil, jamais envoyées au coach. */
function WarmupDebrief({ p, go, again }) {
  /* Réponses précédentes rechargées en entier (BUG-13) ; écriture seulement après un changement de la personne :
     au clic d'une puce, et à la sortie du champ de commentaire (pas à chaque frappe, pas à l'ouverture). */
  const [prev] = useState(() => loadWarmupDebrief(p.code) || {});
  const [feeling, setFeeling] = useState(prev.feeling ?? null);
  const [opinion, setOpinion] = useState(prev.opinion ?? null);
  const [comment, setComment] = useState(prev.comment || "");
  const [work, setWork] = useState(prev.work || []);
  const first = useRef(true);
  const save = () => saveWarmupDebrief(p.code, { feeling, opinion, comment: comment.trim(), work });
  useEffect(() => { if (first.current) { first.current = false; return; } save(); }, [feeling, opinion, work]); // eslint-disable-line
  const toggleWork = id => setWork(w => (w.includes(id) ? w.filter(x => x !== id) : [...w, id]));
  const q = (n, t, id) => <h2 id={id} style={{ ...TY.h3, color: T.navy, margin: 0 }}>{n}. {t}</h2>;
  const pre = questionsForTopics(work);
  useEffect(() => { nudgeAssistant("warmup"); }, []);

  return (
    <div style={wrap(W.read)}>
      <Card pad="lg" level={2} style={stack(GAP.grid)}>
        <div style={stack(12)}>
          <div><Tag tone="success">Échauffement terminé</Tag></div>
          <Txt v="h1" as="h1" color={T.navy}>Quatre questions rapides</Txt>
          <Txt v="body" color={T.body}>Répondez si vous voulez. Vos réponses restent sur cet appareil : votre coach ne les voit pas.</Txt>
        </div>

        <section style={stack(12)}>
          {q(1, "Comment vous sentez-vous après cet échauffement ?", "dq1")}
          <div role="radiogroup" aria-labelledby="dq1" className="rs-chips">
            {FEELINGS.map(f => <Chip key={f.id} role="radio" on={feeling === f.id} onClick={() => setFeeling(v => (v === f.id ? null : f.id))}>{f.label}</Chip>)}
          </div>
          <div aria-live="polite">
            {feeling && <Notice tone="ai" icon={I.chat}><strong style={{ color: T.violet }}>Assistant :</strong> {feelingAck(feeling)}</Notice>}
          </div>
        </section>

        <section style={stack(12)}>
          {q(2, "Qu'avez-vous pensé de cet échauffement ?", "dq2")}
          <div role="radiogroup" aria-labelledby="dq2" className="rs-chips">
            {OPINIONS.map(o => <Chip key={o} role="radio" on={opinion === o} onClick={() => setOpinion(v => (v === o ? null : o))}>{o}</Chip>)}
          </div>
          <label htmlFor="dq2-text" className="rp-sr">Un commentaire sur l'échauffement (facultatif)</label>
          <Input id="dq2-text" value={comment} onChange={e => setComment(e.target.value)} onBlur={save} maxLength={300} placeholder="Un commentaire, si vous le souhaitez (facultatif)" />
        </section>

        <section style={stack(12)}>
          {q(3, "Qu'aimeriez-vous travailler ensuite ?", "dq3")}
          <div role="group" aria-labelledby="dq3" className="rs-chips">
            {WORK_TOPICS.map(t => <Chip key={t.id} role="checkbox" on={work.includes(t.id)} onClick={() => toggleWork(t.id)}>{t.label}</Chip>)}
          </div>
          <p style={{ ...TY.caption, color: T.muted, margin: 0 }}>
            {pre.length ? `${pre.length > 1 ? `${pre.length} questions seront déjà choisies` : "1 question sera déjà choisie"} pour votre entraînement. Vous pourrez changer.` : "Vos choix serviront à vous proposer des questions pour l'entraînement."}
          </p>
        </section>

        <section style={stack(8)}>
          <h2 style={{ ...TY.h3, color: T.navy, margin: 0 }}>4. Avez-vous une question ?</h2>
          <div><Btn kind="secondary" size="sm" icon={I.chat} onClick={() => openAssistant("debrief")}>Poser ma question à l'assistant</Btn></div>
        </section>

        <div className="rp-actions" style={actions}>
          <div className="rp-actions" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn kind="ghost" size="sm" onClick={again} icon={I.redo}>Refaire un échauffement</Btn>
            <Btn kind="ghost" size="sm" onClick={() => go("home")}>Revenir à mon espace</Btn>
          </div>
          <Btn kind="objective" onClick={() => go("pick", { preselect: pre, selection: null, queue: null })} iconRight={I.arrow}>Commencer l'entraînement</Btn>
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
    if (queue.length) go("record", { queue, qi: 0, question: queue[0], selection: { sel, custom }, takeId: null, preselect: null, full: false, steps: null, seriesTakes: {}, from: null });
  };
  const startFull = () => {
    const plan = fullInterview(p.poste);
    go("record", { queue: plan.map(x => x.text), steps: plan.map(x => x.step), full: true, qi: 0, question: plan[0].text, selection: null, takeId: null, preselect: null, seriesTakes: {}, from: null });
  };

  const qcard = (q, removable) => {
    const idx = sel.indexOf(q.key), on = idx >= 0;
    return (
      <CheckTile key={q.key} on={on} onToggle={() => toggle(q.key)} mark={idx + 1}
        after={removable && <IconBtn icon={I.close} label={`Retirer la question : ${q.text}`} tone="muted" size={16} onClick={() => remove(q.key)} />}>
        <span style={{ ...TY.overline, color: T.primary }}>{q.theme}</span>
        <span style={{ ...TY.bodyStrong, color: T.navy, overflowWrap: "anywhere" }}>{q.text}</span>
      </CheckTile>
    );
  };

  return (
    <div style={{ ...wrap(W.read), ...stack(GAP.grid) }}>
      <div style={stack(8)}>
        <Txt v="h1" as="h1" color={T.navy}>Sur quelles questions voulez-vous vous entraîner ?</Txt>
        <Txt v="bodyLg" color={T.body}>Choisissez une ou plusieurs questions. Vous y répondrez dans l'ordre où vous les choisissez. Vous pouvez ajouter les vôtres.</Txt>
        {!ctx.selection && ctx.preselect?.length > 0 && (
          <p style={{ ...TY.small, color: T.primary, margin: 0, display: "flex", alignItems: "center", gap: 8 }}><Icon d={I.check} s={16} /> Questions choisies d'après vos réponses à l'échauffement. Vous pouvez changer.</p>
        )}
      </div>
      <Card topbar style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <IconTile icon={I.users} />
          <h2 style={{ ...TY.h3, color: T.navy, margin: 0, flex: 1 }}>Faire un entraînement complet</h2>
        </div>
        <p style={{ ...TY.body, color: T.body, margin: 0 }}>
          Une simulation d'entretien, dans l'ordre réel : accueil, présentation, motivation, expériences, qualités, mise en situation, vos questions. 7 questions liées au métier {posteLabel(p.poste) ? dePoste(posteLabel(p.poste)) : "que vous visez"}. Le recruteur lit chaque question à voix haute.
        </p>
        <div className="rp-wide-m"><Btn kind="secondary" icon={I.play} onClick={startFull}>Faire un entraînement complet</Btn></div>
      </Card>
      <h2 style={{ ...TY.h3, color: T.navy, margin: 0 }}>Ou choisissez vos questions</h2>
      <div role="group" aria-label="Questions proposées" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,240px),1fr))", gap: GAP.stack }}>
        {qs.map(q => qcard(q))}
      </div>

      <Card style={stack(GAP.stack)}>
        <form onSubmit={add}>
          <Field id="own" label="Ajouter ma question">
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Input id="own" value={own} onChange={e => setOwn(e.target.value)} maxLength={240} placeholder="Par exemple : pourquoi avez-vous quitté votre dernier emploi ?" style={{ flex: "1 1 240px", width: "auto", minWidth: 0 }} />
              <Btn kind="secondary" disabled={own.trim().length < 5} icon={I.plus}>Ajouter</Btn>
            </div>
          </Field>
        </form>
        {custom.length > 0 && (
          <div role="group" aria-label="Mes questions" style={stack(8)}>
            {custom.map(q => qcard(q, true))}
          </div>
        )}
      </Card>

      <div className="rp-sel" style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: RAD.md, boxShadow: SH.lg, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div aria-live="polite" style={{ ...TY.label, color: n ? T.navy : T.muted }}>
          {n ? `${n} question${n > 1 ? "s" : ""} choisie${n > 1 ? "s" : ""}` : "Aucune question choisie"}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {n > 0 && <Btn kind="ghost" size="sm" onClick={() => setSel([])}>Tout retirer</Btn>}
          <Btn kind="objective" disabled={!n} onClick={start} iconRight={I.arrow}>{n ? `Commencer (${n} question${n > 1 ? "s" : ""})` : "Commencer"}</Btn>
        </div>
      </div>
      <div><Back onClick={() => go("home")} /></div>
    </div>
  );
}

/* ─── Transcription + analyse, puis enregistrement de la prise ─── */
/* Trois étapes, un message chacune (BUG-25) ; la transcription et l'analyse déjà faites sont gardées :
   « Réessayer » reprend à l'étape qui a échoué. */
const PROC_ERR = {
  transcribe: ["Votre réponse n'a pas pu être mise par écrit", "La première fois, l'outil d'écriture se télécharge : vérifiez votre connexion à Internet, puis réessayez."],
  analyze: ["Le retour n'a pas pu être préparé", "Votre réponse est mise par écrit. Réessayez : la préparation du retour reprend où elle s'était arrêtée."],
  save: ["Votre réponse n'a pas pu être gardée sur cet appareil", "Il manque peut-être de la place. Libérez de la place ou supprimez d'anciennes réponses, puis réessayez."],
};
function Processing({ p, ctx, go }) {
  const [stage, setStage] = useState(p.consent.ai ? "Préparation de votre retour…" : "Enregistrement de votre réponse sur cet appareil…");
  const [err, setErr] = useState(null); // { step, detail }
  const [attempt, setAttempt] = useState(0);
  const done = useRef({}); // { tr, analysis } déjà obtenus
  const rec = ctx.recording;
  useLeaveGuard(true); // la réponse n'est gardée qu'à la fin, y compris en cas d'erreur

  useEffect(() => {
    let alive = true, step = "transcribe";
    (async () => {
      try {
        setErr(null);
        if (p.consent.ai) {
          if (!done.current.tr) {
            setStage("Votre appareil met votre réponse par écrit…");
            done.current.tr = await transcribe(rec.blob, pr => {
              if (!alive) return;
              if (pr.stage === "model") setStage(`Téléchargement de l'outil d'écriture (${pr.value} %). C'est seulement la première fois.`);
              else setStage("Votre appareil met votre réponse par écrit…");
            });
          }
          step = "analyze";
          if (!done.current.analysis) {
            setStage("Préparation des repères de votre retour…");
            done.current.analysis = await analyze({ segments: done.current.tr.segments, duration: rec.duration, gaze: rec.gaze, poste: p.poste, question: ctx.question });
          }
        } else {
          done.current.analysis = { synthese: "Vous avez choisi de ne pas recevoir le retour de l'assistant. Vous pouvez revoir votre réponse et l'envoyer à votre coach.", dimensions: [], source: "none" };
        }
        if (!alive) return;
        step = "save";
        const { tr, analysis } = done.current;
        const id = await createTake({ code: p.code, question: ctx.question, duration: rec.duration, blob: rec.blob, transcript: tr?.text || "", segments: tr?.segments || [], gaze: rec.gaze, analysis });
        const [v, mode] = openView({ hasMedia: !!rec.blob, analysis });
        if (alive) go(v, { takeId: id, mode, recording: null, seriesTakes: ctx.queue ? { ...(ctx.seriesTakes || {}), [ctx.qi || 0]: id } : null });
      } catch (e) {
        console.error(e);
        if (alive) setErr({ step, detail: String(e?.message || e) });
      }
    })();
    return () => { alive = false; };
  }, [attempt]); // eslint-disable-line

  const [title, text] = err ? PROC_ERR[err.step] : [];
  return (
    <Card pad="lg" level={2} topbar="ai" style={{ ...wrap(W.form), textAlign: "center", display: "grid", justifyItems: "center", gap: 12 }}>
      {!err ? (<>
        <h1 className="rp-sr">{p.consent.ai ? "Préparation de votre retour" : "Enregistrement de votre réponse"}</h1>
        <BrandLoader label={stage} size={88} />
        <Txt v="body" color={T.body}>Tout se passe sur votre appareil. Cela peut prendre un moment.</Txt>
        {p.consent.ai && <Txt v="caption" color={T.muted}>{PHRASES.download}</Txt>}
      </>) : (<>
        <Txt v="h2" as="h1" color={T.navy}>{title}</Txt>
        <Txt v="body" color={T.body}>{text}</Txt>
        <details style={{ textAlign: "left" }}>
          <summary style={{ ...TY.label, color: T.primary, cursor: "pointer", minHeight: 44, display: "flex", alignItems: "center" }}>Détail pour le support</summary>
          <p style={{ ...TY.mono, color: T.muted, margin: 0 }}>{err.detail}</p>
        </details>
        <div className="rp-actions" style={{ display: "flex", gap: GAP.actions, justifyContent: "center", flexWrap: "wrap", marginTop: 8 }}>
          <Btn kind="secondary" onClick={() => go("record")}>Recommencer ma réponse</Btn>
          <Btn kind={p.consent.ai ? "ai" : "objective"} onClick={() => setAttempt(a => a + 1)}>Réessayer</Btn>
        </div>
      </>)}
    </Card>
  );
}

/* ─── Choix du mode de restitution ─── */
function Choose({ take, go, series, back }) {
  const opt = (mode, title, sub, body, btn, ai) => (
    <Card hover onClick={() => go("report", { mode })} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ ...TY.h2, color: T.navy }}>{title}</span>
      <span style={{ ...TY.label, color: ai ? T.violet : T.primary }}>{sub}</span>
      <span style={{ ...TY.body, color: T.body, flex: 1, marginBottom: 8 }}>{body}</span>
      <Btn as="span" kind={ai ? "ai" : "secondary"} full size="sm">{btn}</Btn>
    </Card>
  );
  return (
    <div style={{ ...wrap(W.read), ...stack(GAP.grid) }}>
      <div style={{ textAlign: "center", display: "grid", gap: 12, justifyItems: "center" }}>
        <Tag tone="success">{series && series.n > 1 ? `Question ${series.i + 1} sur ${series.n} · votre retour est prêt` : "Votre retour est prêt"}</Tag>
        <Txt v="h1" as="h1" color={T.navy}>Comment voulez-vous voir votre retour ?</Txt>
        <Txt v="bodyLg" color={T.body}>Les deux contiennent le même retour. Vous pourrez changer d'avis.</Txt>
      </div>
      <div className="rp-stack" style={{ alignItems: "stretch" }}>
        {opt("simple", "Lire mon retour", "Sans me revoir", "Vous lisez ce que l'assistant a remarqué. Pratique si vous n'aimez pas vous revoir.", "Lire")}
        {isAudio(take)
          ? opt("video", "Me réécouter", "Avec les repères au bon moment", "Vous réécoutez votre réponse. Chaque repère est placé au bon moment : touchez-le pour y aller.", "Me réécouter", true)
          : opt("video", "Me revoir en vidéo", "Avec les repères au bon moment", "Vous revoyez votre réponse. Chaque repère est placé au bon moment : touchez-le pour y aller.", "Me revoir", true)}
      </div>
      <div><Back onClick={back} /></div>
    </div>
  );
}

/* ─── Rapport + actions ─── */
function TakeReport({ p, take, mode, go, series, nextQuestion, stopSeries, back }) {
  useEffect(() => { if (series && !series.hasNext && !series.full) nudgeAssistant("training"); }, []); // eslint-disable-line
  const del = async () => {
    if (!window.confirm("Supprimer définitivement cette réponse et son retour ?")) return;
    await deleteTake(take.id);
    if (series?.hasNext) nextQuestion(); else go("home", { queue: null });
  };
  const nofb = noFeedback(take);
  const head = (t, d) => <div style={stack(4)}><div style={{ ...TY.h3, color: T.navy }}>{t}</div><div style={{ ...TY.small, color: T.body }}>{d}</div></div>;
  return (
    <div style={{ ...wrap(mode === "video" ? W.wide : W.read), ...stack(16) }}>
      <Card pad="none" level={2}>
        <GradHead tag={take.report ? "Rapport de votre coach" : nofb ? "Votre réponse" : "Votre retour"} title={take.question}
          sub={`${dateFr(take.createdAt)} · ${dur(take.duration)}.${nofb ? " Vous avez choisi de ne pas recevoir le retour de l'assistant." : ` ${PHRASES.feedback}`}${take.analysis?.source === "llm" ? ` ${PHRASES.feedbackLlm}` : ""}`}
          action={hasMedia(take) && !nofb && (
            <Btn kind="ghostDark" size="sm" className="noprint" onClick={() => go("report", { mode: mode === "video" ? "simple" : "video" })}>
              {mode === "video" ? "Lire mon retour" : isAudio(take) ? "Me réécouter" : "Me revoir en vidéo"}
            </Btn>)} />
      </Card>
      <ReportBody take={take} mode={mode} counselorName={p.counselor} />
      {series && (
        <Card style={{ ...actions, gap: 16 }} className="noprint">
          {head(series.hasNext ? `Question ${series.i + 1} sur ${series.n} terminée` : series.full ? "C'était la dernière question de l'entretien" : series.n > 1 ? "C'était la dernière question de votre sélection" : "Entraînement terminé",
            series.hasNext ? (nofb ? "Prenez le temps de revoir votre réponse. Passez à la suite quand vous voulez." : "Prenez le temps de lire ce retour. Passez à la suite quand vous voulez.") : nofb ? "Vous retrouvez toutes vos réponses dans votre espace, et vous pouvez recommencer quand vous voulez." : "Vous retrouvez tous vos retours dans votre espace, et vous pouvez recommencer quand vous voulez.")}
          <div className="rp-actions" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {series.hasNext && <Btn kind="ghost" size="sm" onClick={stopSeries}>Arrêter ici</Btn>}
            {series.hasNext
              ? <Btn kind="objective" onClick={nextQuestion} iconRight={I.arrow}>Question suivante ({series.i + 2} sur {series.n})</Btn>
              : series.full ? <Btn kind="objective" onClick={() => go("recap")} iconRight={I.arrow}>Voir le récapitulatif</Btn>
              : <Btn kind="secondary" size="sm" onClick={stopSeries}>Revenir à mon espace</Btn>}
          </div>
        </Card>
      )}
      <Card style={{ ...actions, gap: 16 }} className="noprint">
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          {take.shared && <span style={{ color: T.successDk, display: "inline-flex", marginTop: 2 }}><Icon d={I.check} s={20} /></span>}
          {head(take.report ? "Rapport reçu" : take.shared ? "Réponse envoyée à votre coach" : `Envie d'en parler avec ${p.counselor || "votre coach"} ?`,
            take.shared ? (take.report ? "Vous pouvez continuer à vous entraîner et envoyer une nouvelle réponse à tout moment." : `Vous pouvez continuer à vous entraîner. ${PHRASES.sent}`) : "Cette réponse reste sur votre appareil tant que vous ne l'envoyez pas.")}
        </div>
        <div className="rp-actions" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn kind="danger" size="sm" onClick={del} icon={I.trash}>Supprimer cette réponse</Btn>
          {take.shared && !take.report && <Btn kind="ghost" size="sm" onClick={() => unshareTake(take.id)} icon={I.redo}>Reprendre mon envoi</Btn>}
          {hasMedia(take) && <Btn kind="ghost" size="sm" onClick={() => downloadTake(take)} icon={I.arrow}>{isAudio(take) ? "Télécharger ma voix" : "Télécharger ma vidéo"}</Btn>}
          <Btn kind="ghost" size="sm" onClick={() => window.print()} icon={I.print}>Imprimer</Btn>
          {!series?.hasNext && <Btn kind="secondary" size="sm" onClick={() => go("pick", { queue: null, selection: null, preselect: null })} icon={I.redo}>M'entraîner encore</Btn>}
          {!take.shared && <Btn kind={series?.hasNext || series?.full ? "secondary" : "objective"} size="sm" onClick={() => go("share")} icon={I.send}>Envoyer à mon coach</Btn>}
        </div>
      </Card>
      <div className="noprint">
        <Chip tone="ai" check={false} onClick={() => openAssistant("feedback")}><Icon d={I.chat} s={16} /> {nofb ? "Une question sur l'entretien ? Demandez à l'assistant" : "Une question sur ce retour ? Demandez à l'assistant"}</Chip>
      </div>
      <div className="noprint"><Back onClick={back} /></div>
    </div>
  );
}

/* Portabilité : télécharger sa réponse (fichier local, rien n'est envoyé). */
async function downloadTake(take) {
  const url = await loadVideoUrl(take.id);
  if (!url) return;
  const a = document.createElement("a");
  a.href = url; a.download = `la-repet-reponse-${take.createdAt.slice(0, 10)}.${take.mime?.includes("mp4") ? "mp4" : "webm"}`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function Share({ p, take, go, setModal }) {
  const [note, setNote] = useState("");
  return (
    <Card pad="lg" level={2} style={{ ...wrap(W.form), ...stack(GAP.grid) }}>
      <div style={stack(12)}>
        <div><Tag tone="primary">Envoi · vous décidez</Tag></div>
        <Txt v="h1" as="h1" color={T.navy}>Envoyer cette réponse à {p.counselor || "votre coach"}</Txt>
        <Txt v="body" color={T.body}>{PHRASES.share} {PHRASES.sameDevice}</Txt>
      </div>
      <Summary items={SUMMARY.envoi} style={{ gap: 8 }} />
      <div><Link onClick={() => setModal("video")}>Que devient ma vidéo ?</Link></div>
      <Field id="note" label="Un message pour votre coach (facultatif)">
        <Textarea id="note" value={note} onChange={e => setNote(e.target.value)} placeholder="Par exemple : j'ai l'impression de parler trop vite, qu'en pensez-vous ?" />
      </Field>
      <div className="rp-actions" style={actions}>
        <Back onClick={() => go("report")}>Je la garde pour moi</Back>
        <Btn kind="objective" onClick={() => { updateTake(take.id, { shared: true, sharedAt: new Date().toISOString(), note: note.trim() }); go("sent"); }} icon={I.send}>Envoyer à mon coach</Btn>
      </div>
    </Card>
  );
}

function Sent({ p, go, series, nextQuestion }) {
  return (
    <Confirm title="Réponse envoyée" actions={<>
      <Btn kind="secondary" onClick={() => go("home", { queue: null })}>Revenir à mon espace</Btn>
      {series?.full && !series.hasNext
        ? <Btn kind="objective" onClick={() => go("recap")} iconRight={I.arrow}>Voir le récapitulatif</Btn>
        : series?.hasNext
        ? <Btn kind="objective" onClick={nextQuestion} iconRight={I.arrow}>Question suivante ({series.i + 2} sur {series.n})</Btn>
        : <Btn kind="objective" onClick={() => go("pick", { queue: null, selection: null, preselect: null })} icon={I.redo}>M'entraîner encore</Btn>}
    </>}>
      {p.counselor || "Votre coach"} va regarder votre réponse et ajouter ses remarques. Son rapport arrivera dans votre espace. {PHRASES.sameDevice || "Vous y revenez avec le même code."} {PHRASES.sent}
    </Confirm>
  );
}

/* Récapitulatif de l'entraînement complet : les réponses dans l'ordre de l'entretien, sans aucun score. */
function Recap({ p, ctx, s, go }) {
  useEffect(() => { nudgeAssistant("training"); }, []);
  const steps = ctx.steps || [], qs = ctx.queue || [], ids = ctx.seriesTakes || {};
  return (
    <div style={{ ...wrap(W.read), ...stack(GAP.grid) }}>
      <Card pad="none" level={2}>
        <GradHead tag="Entraînement complet" title="Récapitulatif de votre entretien" sub="Vos réponses, dans l'ordre de l'entretien. Ouvrez chaque retour quand vous voulez, et envoyez à votre coach celles que vous choisissez." />
      </Card>
      <RecruiterVoice label="Fin de l'entretien" text={FULL_OUTRO} />
      <ol style={{ listStyle: "none", margin: 0, padding: 0, ...stack(GAP.stack) }} aria-label="Vos réponses">
        {qs.map((q, i) => {
          const t = ids[i] ? s.takes[ids[i]] : null;
          return (
            <li key={i}>
              <Card pad="sm" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <span aria-hidden style={{ ...TY.time, width: 28, height: 28, borderRadius: "50%", background: t ? T.successDk : T.surface, color: t ? T.surface : T.muted, border: t ? "none" : `1.5px solid ${T.lineStrong}`, display: "grid", placeItems: "center", flexShrink: 0 }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 200, ...stack(4) }}>
                  <div style={{ ...TY.overline, color: T.primary }}>{steps[i]}</div>
                  <div style={{ ...TY.h4, color: T.navy }}>{q}</div>
                  <div style={{ ...TY.caption, color: T.muted }}>{t ? `${dur(t.duration)} · ${t.shared ? "envoyée à votre coach" : "gardée sur cet appareil"}` : "Pas de réponse enregistrée"}</div>
                </div>
                {t && <Btn kind="secondary" size="sm" onClick={() => { const [v, mode] = openView(t); go(v, { takeId: t.id, mode, from: "recap" }); }}>{noFeedback(t) ? "Ouvrir ma réponse" : "Ouvrir mon retour"}</Btn>}
              </Card>
            </li>
          );
        })}
      </ol>
      <div className="rp-actions" style={actions}>
        <Btn kind="ghost" size="sm" onClick={() => go("home", { queue: null, full: false })}>Revenir à mon espace</Btn>
        <Btn kind="objective" icon={I.redo} onClick={() => go("pick", { queue: null, full: false, selection: null, preselect: null })}>M'entraîner encore</Btn>
      </div>
    </div>
  );
}
