import React, { useEffect, useRef, useState } from "react";
import { T, FIX, Bare, HL, GRAD_NIGHT, GRAD, GRAD_ACCROCHE, GRAD_HERO, GRAD_SECTION, GLOW, PACE, RAD, SH, RepetMark, Halo, Tag, Btn, Card, Icon, I, ON, TY, W, MO, SI, img, Eyebrow, Section, IconTile, Link, HEADER_H, HEADER_H_M } from "./ui.jsx";
import { useReducedMotion, useCount, useInView, Reveal } from "./motion.jsx";

/* Page d'accueil : héros (accroche qui change, scènes en boucle), strate épinglée en quatre étapes,
   parti pris, portes d'entrée, bandeau final. Le détail par public est sur la page Solutions. */

export default function Home({ go, openSpace }) {
  return (
    <main className="rs-home" style={{ position: "relative", isolation: "isolate" }}>
      <MouseGlow />
      <Hero go={go} />
      <Phrase />
      <Strate />
      <div className="rs-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: "0 24px" }}>
        <Features />
        <NotDo />
        <ForWho go={go} />
        <FinalBand openSpace={openSpace} go={go} />
      </div>
    </main>
  );
}

/* ─── Héros ─── */

function useTicker(n, ms, paused) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI(k => (k + 1) % n), ms);
    return () => clearInterval(t);
  }, [n, ms, paused]);
  return [i, setI];
}

/* Fond de l'accueil : un seul calque fixe derrière toutes les sections (aucun fond de section), donc sans rupture
   entre le héros, la phrase et la strate. Dégradé violet et bleu qui suit la souris ; sur tactile, lente dérive autonome
   (CSS), léger déplacement au défilement et au doigt, avec lissage. Il s'efface en douceur avant le pied de page (--fy).
   Fixe en mouvement réduit, masqué en mode concentration. Aucun capteur d'orientation. */
function MouseGlow() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let px = 0.72, py = 0.18, x = px, y = py, sy = 0, raf = 0;
    const foot = () => document.querySelector("footer");
    const paint = () => {
      const f = foot();
      el.style.setProperty("--fy", `${Math.round(f ? f.getBoundingClientRect().top : window.innerHeight * 2)}px`);
      el.style.setProperty("--mx", `${(x * 100).toFixed(2)}%`); el.style.setProperty("--my", `${((y + sy) * 100).toFixed(2)}%`);
    };
    const target = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      return reduced ? 0 : (window.scrollY / max - 0.5) * 0.24;   // défilement : le dégradé glisse doucement
    };
    let ts = target(); sy = ts;
    const tick = () => {
      x += (px - x) * 0.08; y += (py - y) * 0.08; sy += (ts - sy) * 0.08;
      paint();
      raf = Math.abs(px - x) + Math.abs(py - y) + Math.abs(ts - sy) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    paint();
    const onScroll = () => { ts = target(); if (reduced) paint(); else kick(); };
    const onResize = () => paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    if (reduced) return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize); };
    const mv = e => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX / window.innerWidth; py = e.clientY / window.innerHeight; kick();
    };
    /* Doigt : amplitude réduite de moitié autour de la position de repos. */
    const tm = e => {
      const t = e.touches[0]; if (!t) return;
      px = 0.72 + (t.clientX / window.innerWidth - 0.72) * 0.5; py = 0.18 + (t.clientY / window.innerHeight - 0.18) * 0.5; kick();
    };
    window.addEventListener("pointermove", mv, { passive: true });
    window.addEventListener("touchmove", tm, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", mv); window.removeEventListener("touchmove", tm); cancelAnimationFrame(raf);
    };
  }, [reduced]);
  return <div ref={ref} aria-hidden className="rs-glow rp-deco"><i /></div>;
}

/* Fins d'accroche et scènes synchronisées : même cadence, même fondu, un lien de sens entre le mot et l'image. */
function Hero({ go }) {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [w, setW] = useTicker(SCENES.length, PACE.scene, reduced || hover || stopped);
  return (
    <section style={{ position: "relative", overflowX: "clip" }}>
      <div className="rs-pad" style={{ position: "relative", maxWidth: W.page, margin: "0 auto", padding: "80px 24px" }}>
        <div className="rs-hero">
          <div className="up" style={{ display: "grid", gap: 24, justifyItems: "start" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Tag tone="primary" icon={I.user}>Avec votre coach</Tag>
              <Tag tone="primary">Sans note, sans jugement</Tag>
            </div>
            <h1 className="ty-display" style={{ ...TY.display, color: T.primary, margin: 0 }}>
              <span className="rs-sr">Répétez votre entretien d'embauche, {SCENES.map(x => x.ending.replace(".", "")).join(", ")}.</span>
              <span aria-hidden>
                <span style={{ color: T.navy }}>Répétez votre entretien d'embauche,</span>
                <span className="rs-rot">
                  {SCENES.map(({ ending: e }, i) => (
                    <span key={e} className={i === w ? "on" : ""} style={{ background: GRAD_ACCROCHE, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{e}</span>
                  ))}
                </span>
              </span>
            </h1>
            <p className="ty-lead" style={{ ...TY.lead, color: T.body, maxWidth: 520, margin: 0 }}>
              Vous répondez à des questions d'entretien, seul, autant de fois que vous voulez. Un assistant IA <strong style={{ color: T.navy }}>décrit votre réponse, sans la noter</strong>. Vous choisissez ce que vous envoyez à votre coach.
            </p>
            <div className="rp-wide-m" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Btn kind="objective" size="lg" onClick={() => go("#/espace")} iconRight={I.arrow}>Lancer ma première répétition</Btn>
              <Btn kind="secondary" size="lg" onClick={() => go("#/solutions")}>Voir comment ça marche</Btn>
            </div>
            <div style={{ ...TY.small, color: T.muted, display: "grid", gap: 4 }}>
              <span>Pas de compte à créer : votre coach vous donne un code d'accès.</span>
              <span>Vous êtes coach ? <Link onClick={() => go("#/espace")}>Connectez-vous à l'espace coach</Link>.</span>
            </div>
          </div>
          <HeroStage reduced={reduced} i={w} setI={setW} stopped={stopped} setStopped={setStopped} setHover={setHover} />
        </div>
      </div>
    </section>
  );
}

/* Scènes du héros : une photo en situation et un petit morceau d'interface, chacune liée à sa fin d'accroche.
   Jamais de score ni de courbe. bubbleTop : position de la bulle (jamais sur un visage). */
const SCENES = [
  {
    ending: "à votre rythme.", src: "entrainement.webp", alt: "Un homme s'entraîne devant son ordinateur portable, écouteurs aux oreilles.", label: "S'entraîner quand on veut, et les repères de l'assistant",
    bubble: { who: "Question 2 sur 3", text: "« Pourquoi ce poste vous intéresse-t-il ? »", rec: 38 }, bubbleTop: "6%", card: "reperes",
  },
  {
    ending: "sans jugement.", src: "ressources/se-presenter-en-deux-minutes.webp", pos: "40% 50%", alt: "Une femme assise à une table chez elle, souriante, une tablette à la main.", label: "Un échauffement chez soi, rien n'est enregistré",
    bubble: { who: "Consigne 2 sur 7", text: "« Redites-la un peu plus lentement. »" }, bubbleTop: "56%", card: "warmup",
  },
  {
    ending: "avec vos mots.", src: "ressources/parler-de-ses-experiences-methode-sar.webp", pos: "66% 50%", alt: "Un homme explique avec les mains, assis face à une collègue.", label: "Votre réponse mise par écrit, avec vos mots",
    bubble: { who: "Mise par écrit", text: "« J'ai travaillé deux ans à l'accueil d'une mairie. »", live: 12 }, bubbleTop: "58%", card: "transcript",
  },
  {
    ending: "en confiance.", src: "recruteuse.webp", alt: "Une recruteuse écoute la personne en face d'elle, un bloc-notes à la main.", label: "Une question de recruteuse et le retour de l'assistant",
    bubble: { who: "Question de la recruteuse", text: "« Parlez-moi d'un problème que vous avez résolu au travail. »" }, bubbleTop: "40%", card: "debrief",
  },
];

/* Minuteur qui avance en direct quand la scène est affichée. */
function LiveTime({ from, on, reduced }) {
  const [t, setT] = useState(from);
  useEffect(() => {
    if (!on) { setT(from); return; }
    if (reduced) return;
    const id = setInterval(() => setT(x => x + 1), 1000);
    return () => clearInterval(id);
  }, [on, from, reduced]);
  return <>{`${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`}</>;
}

function HeroStage({ reduced, i, setI, stopped, setStopped, setHover }) {
  return (
    <div className="rs-stage" role="group" aria-roledescription="carrousel" aria-label="La Répét' en quatre images"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setHover(true)} onBlur={() => setHover(false)}>
      {SCENES.map((sc, k) => <Scene key={sc.src} sc={sc} on={k === i} first={k === 0} reduced={reduced} />)}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4, marginTop: 40 }}>
        {SCENES.map((sc, k) => (
          <Bare key={sc.src} className="rs-dot" aria-current={k === i ? "true" : "false"} aria-label={`Scène ${k + 1} sur ${SCENES.length} : ${sc.label}`} onClick={() => setI(k)}><i /></Bare>
        ))}
        {!reduced && (
          <Bare className="rs-dot" aria-label={stopped ? "Relancer les images" : "Mettre les images en pause"} onClick={() => setStopped(v => !v)} style={{ color: T.primary, width: 44, height: 44, display: "inline-grid", placeItems: "center" }}>
            <Icon d={stopped ? I.play : I.pause} s={16} />
          </Bare>
        )}
      </div>
    </div>
  );
}

function Scene({ sc, on, first, reduced }) {
  const b = sc.bubble;
  return (
    <div className={`rs-scene ${on ? "on" : ""}`} aria-hidden={!on}>
      <div style={{ position: "relative" }}>
        <Halo style={{ width: "120%", height: "90%", background: GLOW.violet, top: "-8%", left: "-24%" }} />
        <Halo style={{ width: "100%", height: "80%", background: GLOW.blue, bottom: "-16%", right: "-24%" }} />
        <div style={{ position: "relative", borderRadius: RAD.xl, overflow: "hidden", boxShadow: SH.glow, aspectRatio: "4 / 5", background: T.primaryBg }}>
          <img src={img(sc.src)} alt={sc.alt} width={900} height={1125} loading={first ? "eager" : "lazy"} decoding="async"
            style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: sc.pos || "50% 50%" }} />
        </div>
        <div className="rs-pop d1 rs-bubble" style={{ position: "absolute", top: sc.bubbleTop, maxWidth: 290, background: T.surface, borderRadius: RAD.md, borderTopLeftRadius: RAD.xs, padding: "12px 16px", boxShadow: SH.glow, display: "grid", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {b.rec != null && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: T.error, animation: "blink 1.2s infinite" }} /><span style={{ ...TY.time, color: T.navy, fontVariantNumeric: "tabular-nums" }}><LiveTime from={b.rec} on={on} reduced={reduced} /></span></span>}
            {b.live != null && <span style={{ ...TY.time, color: T.surface, background: T.primary, borderRadius: RAD.pill, padding: "4px 8px", fontVariantNumeric: "tabular-nums" }}><LiveTime from={b.live} on={on} reduced={reduced} /></span>}
            <span style={{ ...TY.overline, color: T.muted }}>{b.who}</span>
          </div>
          <div style={{ ...TY.h3, color: T.navy }}>{b.text}</div>
        </div>
        <div className="rs-pop d2 rs-card-pos" style={{ position: "absolute", right: -16, bottom: -28, width: "min(310px, 86%)" }}>
          {sc.card === "debrief" && <DebriefCard />}
          {sc.card === "reperes" && <ReperesCard />}
          {sc.card === "warmup" && <WarmupCard />}
          {sc.card === "transcript" && <TranscriptCard />}
        </div>
      </div>
    </div>
  );
}

/* Lignes d'encart qui apparaissent l'une après l'autre, du bas vers le haut, à chaque arrivée de la scène. */
const lineStyle = (k, n) => ({ animationDelay: `${0.9 + (n - 1 - k) * 0.28}s` });

const DebriefCard = () => (
  <div style={{ background: FIX.primary, color: ON.text, borderRadius: RAD.md, padding: 16, boxShadow: SH.glow, display: "grid", gap: 8 }}>
    <div className="rs-line" style={{ display: "flex", alignItems: "center", gap: 8, ...TY.overline, ...lineStyle(0, 3) }}><Icon d={I.sparkle} s={12} c={ON.text} /> Retour de l'assistant</div>
    <div className="rs-line" style={{ display: "flex", gap: 8, ...TY.bodyStrong, ...lineStyle(1, 3) }}><Icon d={I.check} s={16} c={ON.text} /><span>Vous décrivez clairement le problème.</span></div>
    <div className="rs-line" style={{ display: "flex", gap: 8, ...TY.body, ...lineStyle(2, 3) }}><Icon d={I.search} s={16} c={ON.text} /><span>Qu'avez-vous fait personnellement pour le résoudre ?</span></div>
  </div>
);

const WarmupCard = () => (
  <div style={{ background: T.surface, borderRadius: RAD.md, padding: 16, boxShadow: SH.glow, display: "grid", gap: 8 }}>
    <div className="rs-line" style={{ display: "flex", alignItems: "center", gap: 8, ...TY.overline, color: T.primary, ...lineStyle(0, 3) }}><Icon d={I.mic} s={12} c={T.primary} /> Échauffement · rien n'est enregistré</div>
    <div className="rs-line" style={{ ...TY.h4, color: T.navy, ...lineStyle(1, 3) }}>« Merci de me recevoir aujourd'hui. »</div>
    <div className="rs-line" style={{ display: "flex", alignItems: "center", gap: 8, ...TY.small, color: T.body, ...lineStyle(2, 3) }}><Icon d={I.lock} s={16} c={T.successDk} /> Chez vous, quand vous voulez</div>
  </div>
);

const TranscriptCard = () => {
  const rows = [["0:08", "Bonjour, je m'appelle Sami."], ["0:12", "J'ai travaillé deux ans à l'accueil d'une mairie."], ["0:18", "J'aime orienter les gens."]];
  return (
    <div style={{ background: T.surface, borderRadius: RAD.md, padding: 16, boxShadow: SH.glow, display: "grid", gap: 8 }}>
      <div className="rs-line" style={{ display: "flex", alignItems: "center", gap: 8, ...TY.overline, color: T.primary, ...lineStyle(0, 4) }}><Icon d={I.note} s={12} c={T.primary} /> Votre réponse, mise par écrit</div>
      {rows.map(([t, x], k) => (
        <div key={t} className="rs-line" style={{ display: "flex", gap: 8, alignItems: "baseline", ...lineStyle(k + 1, 4) }}>
          <span style={{ ...TY.time, color: T.muted, minWidth: 32 }}>{t}</span>
          <span className={k === rows.length - 2 ? "rs-hl" : undefined} style={{ ...TY.small, color: T.navy }}>{x}</span>
        </div>
      ))}
    </div>
  );
};

export const Pin = ({ ap, s = 14 }) => (
  <span aria-hidden style={{ display: "block", width: s, height: s, borderRadius: "50%", boxSizing: "border-box", background: ap ? T.accent : T.surface, border: ap ? `2px solid ${T.surface}` : `3px solid ${T.violet}`, boxShadow: SH.xs }} />
);

const ReperesCard = () => (
  <div style={{ background: T.surface, borderRadius: RAD.md, padding: 16, boxShadow: SH.glowAi, display: "grid", gap: 12, borderTop: `4px solid ${T.violet}` }}>
    <div className="rs-line" style={{ display: "flex", alignItems: "center", gap: 8, ...TY.overline, color: T.violet, ...lineStyle(0, 4) }}><Icon d={I.sparkle} s={12} c={T.violet} /> Repères de l'assistant</div>
    {[[true, "Un exemple concret à 0:35"], [true, "Environ 140 mots par minute"], [false, "« Euh » revient 4 fois"]].map(([ap, t], k) => (
      <div key={t} className="rs-line" style={{ display: "flex", alignItems: "center", gap: 8, ...lineStyle(k + 1, 4) }}>
        <Pin ap={ap} /><span style={{ ...TY.small, color: T.navy, flex: 1 }}>{t}</span>
        <span style={{ ...TY.label, color: ap ? T.accent : T.violet }}>{ap ? "Point d'appui" : "À explorer"}</span>
      </div>
    ))}
  </div>
);

const RapportCard = () => (
  <div style={{ background: T.surface, borderRadius: RAD.md, padding: 16, boxShadow: SH.glow, display: "flex", gap: 12, alignItems: "center" }}>
    <div style={{ width: 40, height: 40, borderRadius: "50%", background: T.successBg, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon d={I.check} s={20} c={T.successDk} /></div>
    <div>
      <div style={{ ...TY.h4, color: T.navy }}>Rapport de votre coach reçu</div>
      <div style={{ ...TY.caption, color: T.muted }}>Ses remarques, placées au bon moment de votre réponse</div>
    </div>
  </div>
);

/* ─── Strate épinglée : le panneau reste fixe, seul son contenu change au fil du défilement ─── */
const STEPS = [
  { k: "S'entraîner", t: "Vous vous entraînez quand vous voulez", d: "Choisissez une question liée au métier que vous visez. Répondez face à la caméra, ou en voix seule. Recommencez autant de fois que vous voulez.", V: VisCamera },
  { k: "Recevoir un retour", t: "L'assistant décrit votre réponse", d: "Rythme de parole, pauses, exemples, regard : il vous dit ce qu'il a remarqué, et à quel moment. Il commence par ce qui fonctionne déjà.", V: VisReport },
  { k: "Envoyer", t: "Vous décidez de ce que vous envoyez", d: "Votre vidéo reste sur votre appareil. Votre coach la voit seulement si vous la lui envoyez, réponse par réponse.", V: VisShare },
  { k: "En parler", t: "Votre coach vous répond, vous en parlez ensemble", d: "Votre coach regarde votre réponse et ajoute ses remarques. Son rapport sert de point de départ à votre prochain rendez-vous ou atelier.", V: VisCoach },
];

function Strate() {
  const reduced = useReducedMotion();
  const [short, setShort] = useState(false);
  const [active, setActive] = useState(0);
  const sec = useRef(null), barsD = useRef([]), barsM = useRef([]);
  const N = STEPS.length;

  useEffect(() => {
    if (!window.matchMedia) return;
    const m = window.matchMedia("(max-height: 619px)"), on = () => setShort(m.matches);
    on(); m.addEventListener ? m.addEventListener("change", on) : m.addListener(on);
    return () => (m.removeEventListener ? m.removeEventListener("change", on) : m.removeListener(on));
  }, []);
  const stacked = reduced || short;

  useEffect(() => {
    if (stacked) return;
    let raf = 0, last = -1;
    const upd = () => {
      raf = 0;
      const el = sec.current; if (!el) return;
      const hh = window.innerWidth <= 760 ? HEADER_H_M : HEADER_H;
      const r = el.getBoundingClientRect(), range = r.height - (window.innerHeight - hh);
      const p = range > 0 ? Math.min(1, Math.max(0, (hh - r.top) / range)) : 0;
      for (let i = 0; i < N; i++) {
        const f = Math.min(1, Math.max(0, p * N - i));
        if (barsD.current[i]) barsD.current[i].style.transform = `scaleY(${f})`;
        if (barsM.current[i]) barsM.current[i].style.transform = `scaleX(${f})`;
      }
      const a = Math.min(N - 1, Math.floor(p * N));
      if (a !== last) { last = a; setActive(a); }
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(upd); };
    upd();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, [stacked, N]);

  const jump = i => {
    const el = sec.current; if (!el) return;
    const hh = window.innerWidth <= 760 ? HEADER_H_M : HEADER_H;
    const range = el.offsetHeight - (window.innerHeight - hh);
    const top = el.getBoundingClientRect().top + window.scrollY - hh + range * ((i + 0.08) / N);
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  };

  const head = (
    <div style={{ display: "grid", gap: 12, maxWidth: W.read }}>
      <Eyebrow>Comment ça marche</Eyebrow>
      <h2 className="ty-xl" style={{ ...TY.xl, color: T.navy, margin: 0 }}>Quatre étapes, de votre première réponse à l'échange avec votre coach</h2>
    </div>
  );

  if (stacked) {
    return (
      <section className="rs-pad rs-section" style={{ maxWidth: W.page, margin: "0 auto", padding: "80px 24px 0" }}>
        {head}
        <ol style={{ listStyle: "none", margin: "32px 0 0", padding: 0, display: "grid", gap: 48 }}>
          {STEPS.map((s, i) => (
            <li key={s.k} className="rs-g2" style={{ alignItems: "center" }}>
              <div style={{ display: "grid", gap: 8 }}>
                <Eyebrow c={T.accent}>{`${i + 1}. ${s.k}`}</Eyebrow>
                <h3 className="ty-h1" style={{ ...TY.h1, color: T.navy, margin: 0 }}>{s.t}</h3>
                <p style={{ ...TY.bodyLg, color: T.body, margin: 0, maxWidth: 480 }}>{s.d}</p>
              </div>
              <div className="on" style={{ position: "relative", height: 380 }}><VisFrame><s.V play /></VisFrame></div>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section ref={sec} className="rs-strate" aria-label="Quatre étapes, de votre première réponse à l'échange avec votre coach" style={{ height: `calc(100vh + ${N * 85}vh)` }}>
      <div className="rs-panel">
        <div className="rs-pad" style={{ maxWidth: W.page, width: "100%", margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: 32, height: "100%", justifyContent: "center", minHeight: 0 }}>
          {head}
          <div className="rs-pgrid">
            <div>
              <ol className="rs-steps-d" style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 4 }}>
                {STEPS.map((s, i) => (
                  <li key={s.k}>
                    <Bare className={`rs-step ${active === i ? "on" : ""}`} aria-current={active === i ? "step" : undefined} onClick={() => jump(i)} style={{ display: "flex", gap: 16, width: "100%", padding: "12px 0" }}>
                      <span className="rs-step-bar"><i ref={el => (barsD.current[i] = el)} /></span>
                      <span style={{ display: "grid", gap: 8, padding: "4px 0" }}>
                        <span style={{ ...TY.overline, color: active === i ? T.accent : T.muted }}>{`${i + 1}. ${s.k}`}</span>
                        <span className="ty-h1" style={{ ...TY.h1, color: active === i ? T.navy : T.muted }}>{s.t}</span>
                        <span className="rs-step-d"><span style={{ display: "block", overflow: "hidden" }}><span style={{ display: "block", ...TY.bodyLg, color: T.body, maxWidth: 480 }}>{s.d}</span></span></span>
                      </span>
                    </Bare>
                  </li>
                ))}
              </ol>
              <div className="rs-tabs-m">
                <div style={{ display: "flex", gap: 8 }} aria-hidden>
                  {STEPS.map((s, i) => (
                    <span key={s.k} style={{ flex: 1, height: 4, borderRadius: 2, background: T.line, overflow: "hidden" }}>
                      <i ref={el => (barsM.current[i] = el)} style={{ display: "block", height: "100%", background: T.primary, transformOrigin: "0 50%", transform: "scaleX(0)" }} />
                    </span>
                  ))}
                </div>
                <div aria-live="off" style={{ display: "grid", gap: 8, marginTop: 16 }}>
                  <span style={{ ...TY.overline, color: T.accent }}>{`Étape ${active + 1} sur ${N} · ${STEPS[active].k}`}</span>
                  <span style={{ ...TY.h2, color: T.navy }}>{STEPS[active].t}</span>
                  <span style={{ ...TY.small, color: T.body }}>{STEPS[active].d}</span>
                </div>
              </div>
            </div>
            <div className="rs-visbox" style={{ position: "relative", height: 440 }} aria-hidden>
              {/* Pile de cartes : chaque étape est sa propre carte, qui glisse et se superpose à la précédente */}
              {STEPS.map(({ V, k }, i) => (
                <div key={k} className={`rs-vcard ${active === i ? "on" : i < active ? "past" : "next"}`} style={{ zIndex: i + 1 }}><V play={active === i} /></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const VisFrame = ({ children }) => (
  <div aria-hidden style={{ position: "absolute", inset: 0, background: T.surface, borderRadius: RAD.xl, boxShadow: SH.glow, border: `1px solid ${T.line}`, overflow: "hidden" }}>{children}</div>
);
const visBox = { height: "100%", padding: 24, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 };

function VisCamera() {
  return (
    <div style={visBox}>
      <div style={{ position: "relative", flex: 1, minHeight: 0, borderRadius: RAD.lg, background: GRAD_NIGHT, overflow: "hidden" }}>
        <svg viewBox="0 0 200 160" style={{ position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)", height: "78%" }}>
          <circle cx="100" cy="60" r="30" fill={ON.glow} />
          <path d="M36 160c0-38 28-62 64-62s64 24 64 62z" fill={ON.glow} />
        </svg>
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", alignItems: "center", gap: 8, background: ON.scrim, padding: "4px 12px", borderRadius: RAD.pill }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.error, animation: "blink 1.2s infinite" }} />
          <span style={{ ...TY.time, color: ON.text }}>0:42</span>
        </div>
        <div className="rs-in" style={{ position: "absolute", left: 12, right: 12, bottom: 12, background: T.surface, borderRadius: RAD.md, padding: "12px 16px", transitionDelay: ".25s", display: "grid", gap: 4 }}>
          <div style={{ ...TY.overline, color: T.muted }}>Question · agent d'accueil</div>
          <div style={{ ...TY.h3, color: T.navy }}>« Pouvez-vous vous présenter en deux minutes ? »</div>
        </div>
      </div>
    </div>
  );
}

/* Retour descriptif : la chronologie de l'entretien se remplit, les repères apparaissent.
   Aucune note, aucune jauge : uniquement le temps de l'entretien et des faits. */
const SEGS = [[0, 11], [13, 27], [29, 41], [44, 58], [60, 70], [73, 86], [88, 100]];
const OBS = [
  { at: 4, time: "0:04", ap: true, d: 300, t: "Ouverture", txt: "Vous entrez directement dans le sujet." },
  { at: 38, time: "0:35", ap: true, d: 900, t: "Exemples concrets", txt: "Vous citez une expérience précise." },
  { at: 66, time: "1:01", ap: false, d: 1500, t: "Petits mots répétés", txt: "« Euh » revient quelques fois." },
];

function VisReport({ play }) {
  const reduced = useReducedMotion();
  const wpm = useCount(148, play, 2200, reduced), pauses = useCount(6, play, 2200, reduced);
  return (
    <div key={play ? "p" : "s"} className={`rs-tl ${play ? "play" : ""}`} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ background: GRAD, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <RepetMark s={28} white />
        <div style={{ ...TY.h3, color: ON.text }}>Votre retour · question 1</div>
      </div>
      <div style={{ padding: "16px 24px 8px" }}>
        <div style={{ ...TY.overline, color: T.muted }}>Déroulé de votre réponse</div>
        <div style={{ position: "relative", marginTop: 24 }}>
          <div style={{ position: "relative", height: 10, borderRadius: 4, background: T.lineLt, overflow: "hidden" }}>
            {SEGS.map(([a, b]) => <span key={a} style={{ position: "absolute", top: 0, bottom: 0, left: `${a}%`, width: `${b - a}%`, background: T.primary, borderRadius: 3 }} />)}
            <span className="rs-tl-mask" style={{ position: "absolute", inset: 0, background: T.surface }} />
          </div>
          <span className="rs-tl-head" style={{ position: "absolute", top: -4, height: 18, width: 2, transform: "translateX(-1px)", background: T.navy, borderRadius: 1 }} />
          {OBS.map(o => (
            <span key={o.at} className="rs-tl-pin" style={{ position: "absolute", left: `${o.at}%`, bottom: 12, display: "flex", flexDirection: "column", alignItems: "center", animationDelay: `${o.d}ms` }}>
              <Pin ap={o.ap} /><span style={{ width: 2, height: 4, background: o.ap ? T.accent : T.violet }} />
            </span>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", ...TY.time, color: T.muted, marginTop: 8 }}><span>0:00</span><span>1:32</span></div>
      </div>
      <div className="rs-tl-facts" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", margin: "4px 24px 0", borderTop: `1px solid ${T.lineLt}`, borderBottom: `1px solid ${T.lineLt}` }}>
        {[[wpm, "mots/min", "Rythme"], [pauses, "", "Pauses"], ["1:32", "", "Durée"]].map(([n, u, l], i) => (
          <div key={l} style={{ padding: "12px 0", textAlign: "center", borderLeft: i ? `1px solid ${T.lineLt}` : "none" }}>
            <div style={{ ...TY.num, color: T.navy, fontVariantNumeric: "tabular-nums" }}>{n}{u && <span style={{ ...TY.caption, color: T.muted, marginLeft: 4 }}>{u}</span>}</div>
            <div style={{ ...TY.overline, color: T.muted, marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "4px 24px 16px" }}>
        {OBS.map((o, i) => {
          const c = o.ap ? T.accent : T.violet;
          return (
            <div key={o.t} className="rs-tl-row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < 2 ? `1px solid ${T.lineLt}` : "none", animationDelay: `${o.d}ms` }}>
              <span style={{ ...TY.time, color: T.surface, background: c, borderRadius: RAD.pill, padding: "4px 8px", flexShrink: 0 }}>{o.time}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...TY.h4, color: T.navy }}>{o.t}</div>
                <div style={{ ...TY.caption, color: T.muted }}>{o.txt}</div>
              </div>
              <Tag tone={o.ap ? "appui" : "ai"}>{o.ap ? "Appui" : "À explorer"}</Tag>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VisShare() {
  return (
    <div style={{ ...visBox, alignItems: "stretch" }}>
      <div style={{ border: `1px solid ${T.line}`, borderRadius: RAD.lg, padding: 20, boxShadow: SH.xs }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <IconTile icon={I.play} />
          <div>
            <div style={{ ...TY.h3, color: T.navy }}>Entretien du 12 mars</div>
            <div style={{ ...TY.mono, color: T.muted }}>1 min 32</div>
          </div>
        </div>
        <div style={{ position: "relative", height: 24, marginTop: 16 }}>
          <span className="rs-swap rs-off" style={{ position: "absolute", left: 0, top: 0 }}><Tag tone="muted" icon={I.lock}>Sur cet appareil</Tag></span>
          <span className="rs-swap rs-onl" style={{ position: "absolute", left: 0, top: 0 }}><Tag tone="success" icon={I.send}>Envoyée à votre coach</Tag></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.lineLt}` }}>
          <span style={{ ...TY.bodyStrong, color: T.navy }}>Envoyer à mon coach</span>
          <span className="rs-track" style={{ position: "relative", width: 44, height: 26, borderRadius: RAD.pill }}>
            <span className="rs-knob" style={{ position: "absolute", top: 3, width: 20, height: 20, borderRadius: "50%", background: T.surface, boxShadow: SH.sm }} />
          </span>
        </div>
      </div>
      <div className="rs-in" style={{ ...TY.caption, color: T.muted, display: "flex", gap: 8, alignItems: "center", transitionDelay: ".9s" }}>
        <Icon d={I.shield} s={16} c={T.primary} /> Vous pouvez supprimer une réponse, ou tout votre espace, à tout moment.
      </div>
    </div>
  );
}

function VisCoach() {
  const note = (t, txt, d) => (
    <div className="rs-in" style={{ display: "flex", gap: 12, alignItems: "flex-start", background: T.primaryBg, borderLeft: `3px solid ${T.primary}`, borderRadius: RAD.xs, padding: "8px 12px", transitionDelay: d }}>
      <span style={{ ...TY.time, color: T.surface, background: T.primary, borderRadius: RAD.pill, padding: "4px 8px", flexShrink: 0 }}>{t}</span>
      <span style={{ ...TY.small, color: T.navy }}>{txt}</span>
    </div>
  );
  return (
    <div style={visBox}>
      <div style={{ ...TY.overline, color: T.muted }}>Remarques de votre coach</div>
      <div style={{ position: "relative", marginTop: 16 }}>
        <div style={{ height: 6, borderRadius: 3, background: T.primaryBg }} />
        {OBS.map(o => <span key={o.at} style={{ position: "absolute", left: `${o.at}%`, top: -4, transform: "translateX(-50%)" }}><Pin ap={o.ap} /></span>)}
        <span style={{ position: "absolute", left: "52%", top: -4, width: 14, height: 14, borderRadius: RAD.xs / 2, background: T.primary, border: `2px solid ${T.surface}` }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", ...TY.time, color: T.muted }}><span>0:00</span><span>1:32</span></div>
      {note("0:35", "Très bon exemple, gardez-le.", ".3s")}
      {note("0:48", "Ici, vous pouvez dire ce que vous avez fait, vous.", ".55s")}
      {note("1:01", "Une respiration suffit à la place du « euh ».", ".8s")}
      <div className="rs-in" style={{ display: "flex", alignItems: "center", gap: 8, ...TY.bodyStrong, color: T.primary, marginTop: 4, transitionDelay: "1.05s" }}>
        <Icon d={SI.users} s={16} c={T.primary} /> Rendez-vous avec votre coach jeudi
      </div>
    </div>
  );
}

/* ─── Grande phrase qui se colore mot par mot au fil du défilement ─── */
/* Deux phrases, une ou deux lignes à l'écran : la mécanique de coloration reste la même (mots-clés en dégradé). */
const PHRASE = [["Un"], ["entretien,"], ["ça"], ["se"], ["prépare"], ["à", 1], ["voix", 1], ["haute.", 1], ["Entraînez-vous"], ["ici,"], ["en", 1], ["toute", 1], ["confiance.", 1]];
const PHRASE_SUB = "Répétez, écoutez-vous, recommencez. Votre coach vous aide quand vous le décidez.";

function Phrase() {
  const reduced = useReducedMotion();
  const sec = useRef(null);
  const [lit, setLit] = useState(reduced ? PHRASE.length + 1 : 0);
  useEffect(() => {
    if (reduced) { setLit(PHRASE.length + 1); return; }
    let raf = 0;
    const upd = () => {
      raf = 0;
      const el = sec.current; if (!el) return;
      const hh = window.innerWidth <= 760 ? HEADER_H_M : HEADER_H;
      const r = el.getBoundingClientRect(), range = r.height - (window.innerHeight - hh);
      // la coloration commence quand la phrase arrive au centre et finit avant la fin de la section
      const p = range > 0 ? Math.min(1, Math.max(0, (hh - r.top + window.innerHeight * 0.35) / (range + window.innerHeight * 0.1))) : 1;
      setLit(Math.round(p * (PHRASE.length + 1)));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(upd); };
    upd();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, [reduced]);

  const text = (
    <div className="rs-pad" style={{ maxWidth: W.page, width: "100%", margin: "0 auto", padding: "0 24px" }}>
      <p className="rs-sr">{PHRASE.map(w => w[0]).join(" ")} {PHRASE_SUB}</p>
      <div aria-hidden style={{ maxWidth: W.wide, display: "grid", gap: 24 }}>
        <div className="rs-phrase-t" style={{ ...TY.display, color: T.navy }}>
          {PHRASE.map(([w, key], i) => {
            const on = i < lit;
            return (
              <React.Fragment key={i}>
                <span className="rs-w" style={on && key
                  ? { background: GRAD_ACCROCHE, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", paddingBottom: ".08em" }
                  : { color: on ? T.navy : T.line }}>{w}</span>{i < PHRASE.length - 1 ? " " : ""}
              </React.Fragment>
            );
          })}
        </div>
        <div className="ty-lead rs-w" style={{ ...TY.lead, color: lit > PHRASE.length ? T.body : T.line, maxWidth: 560 }}>{PHRASE_SUB}</div>
      </div>
    </div>
  );
  if (reduced) return <section className="rs-section" style={{ paddingTop: 80 }}>{text}</section>;
  return (
    <section ref={sec} className="rs-phrase" style={{ height: "180vh" }}>
      <div className="rs-phrase-in">{text}</div>
    </section>
  );
}

/* ─── Cartes de fonctionnalités : micro-animation en boucle, seulement quand la carte est visible ─── */
function FCard({ title, text, children }) {
  const reduced = useReducedMotion();
  const [ref, v] = useInView({ once: false, threshold: 0.35, rootMargin: "0px" });
  return (
    <div ref={ref} className={`rs-fcard ${v && !reduced ? "play" : ""}`}>
      <div className="rs-fvis" aria-hidden>{children}</div>
      <h3 style={{ ...TY.h3, color: T.navy, margin: "4px 8px 0" }}>{title}</h3>
      <p style={{ ...TY.body, color: T.body, margin: "0 8px" }}>{text}</p>
    </div>
  );
}

const miniCard = { background: T.surface, borderRadius: RAD.sm, padding: "12px 16px", boxShadow: SH.xs };

function Features() {
  return (
    <Section eyebrow="Au fil de l'entraînement" title="Tout ce qu'il faut pour répéter sereinement" sub="Des outils simples, pensés pour s'entraîner seul et garder la main sur ce que l'on partage.">
      <div className="rs-fcards">
        <FCard title="Un échauffement sans enregistrement" text="Des phrases à lire à voix haute pour se mettre en route. Rien n'est enregistré ni analysé.">
          <div style={{ ...TY.overline, color: T.muted, marginBottom: 8 }}>Échauffement · lisez à voix haute</div>
          <div className="rs-cyc" style={{ display: "grid" }}>
            {["« Je vous remercie de me recevoir. »", "« J'ai travaillé deux ans en boutique. »", "« Je suis disponible dès lundi. »"].map(t => (
              <div key={t} style={{ ...miniCard, ...TY.h3, color: T.navy }}>{t}</div>
            ))}
          </div>
        </FCard>
        <FCard title="Des questions adaptées au métier" text="Choisissez le métier visé : les questions s'y adaptent. Vous pouvez aussi ajouter les vôtres.">
          <div className="rs-jobs" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {["agent d'accueil", "serveur(se)", "aide-soignant(e)"].map(j => <span key={j} style={{ ...TY.tag, padding: "8px 12px", borderRadius: RAD.pill, border: `1.5px solid ${T.line}`, background: T.surface, color: T.body }}>{j}</span>)}
          </div>
          <div className="rs-cyc" style={{ display: "grid" }}>
            {["« Comment accueillez-vous une personne mécontente ? »", "« Comment gérez-vous un service chargé ? »", "« Comment réagissez-vous face à une urgence ? »"].map(t => (
              <div key={t} style={{ ...miniCard, ...TY.label, color: T.navy }}>{t}</div>
            ))}
          </div>
        </FCard>
        <FCard title="Caméra ou micro seul" text="Répondez en vidéo, ou en voix seule si vous préférez. Trois minutes maximum par réponse.">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.surface, borderRadius: RAD.pill, padding: "4px 12px", boxShadow: SH.xs }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.error, animation: "blink 1.2s infinite" }} />
              <span style={{ ...TY.time, color: T.navy }}>0:4<span className="rs-digits"><span>0<br />1<br />2<br />3<br />4<br />5<br />6<br />7<br />8<br />9</span></span></span>
            </span>
            <Tag tone="muted" icon={I.mic}>Voix seule</Tag>
          </div>
          <div className="rs-wave" style={{ marginTop: 24, justifyContent: "center" }}>
            {Array.from({ length: 22 }, (_, i) => <i key={i} style={{ animationDelay: `${(i * 137) % 900}ms`, height: `${30 + ((i * 53) % 60)}%` }} />)}
          </div>
        </FCard>
        <FCard title="Une transcription repérée" text="Votre réponse est transcrite sur votre appareil. Les passages utiles sont repérés, sans jugement.">
          <p style={{ ...TY.small, color: T.navy, margin: 0 }}>
            Bonjour, je m'appelle Sami. <span className="rs-fhl h2" style={{ backgroundImage: HL.ai }}>Euh</span>, j'ai <span className="rs-fhl" style={{ backgroundImage: HL.appui }}>géré la caisse d'une supérette pendant trois ans</span>.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            <span className="rs-ftag"><Tag tone="appui" icon={I.check}>Exemple concret</Tag></span>
            <span className="rs-ftag t2"><Tag tone="ai" icon={I.search}>Mot d'appui</Tag></span>
          </div>
        </FCard>
        <FCard title="Un assistant pour vos questions" text="Une hésitation sur un retour ou sur une question difficile ? L'assistant répond, votre coach complète.">
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ ...miniCard, justifySelf: "end", background: T.primaryBg, ...TY.small, color: T.navy, maxWidth: "85%" }}>Comment parler d'un trou dans mon CV ?</div>
            <div style={{ position: "relative", ...miniCard, background: T.violetBg, ...TY.small, color: T.navy, maxWidth: "90%", minHeight: 44 }}>
              <span className="rs-typing rp-dots" style={{ color: T.violet }}><i /><i /><i /></span>
              <span className="rs-answer" style={{ display: "block" }}>Restez simple et honnête, puis parlez de ce que vous avez fait pendant cette période.</span>
            </div>
          </div>
        </FCard>
        <FCard title="Rapport écrit ou vidéo, au choix" text="Découvrez votre retour comme vous le préférez : en lisant, ou en vous revoyant avec des repères.">
          <div className="rs-seg"><i /><span>Rapport écrit</span><span>Me revoir en vidéo</span></div>
          <div style={{ ...miniCard, marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <Pin ap /><span style={{ ...TY.caption, color: T.navy, flex: 1 }}>Ouverture directe à 0:04</span><span style={{ ...TY.time, color: T.muted }}>0:04</span>
          </div>
        </FCard>
      </div>
    </Section>
  );
}

/* ─── Ce que La Répét' ne fait pas ─── */
function NotDo() {
  const items = [
    ["7/10", I.ban, "Aucune note", "Ni score, ni classement. L'assistant décrit, vous décidez quoi en faire."],
    ["humeur", I.shield, "Aucune émotion devinée", "L'assistant ne cherche pas à deviner votre humeur ni votre personnalité. Il décrit ce qui se voit et ce qui s'entend."],
    ["envoi auto", I.lock, "Aucun envoi sans votre accord", "Votre coach voit seulement ce que vous lui envoyez. Vous pouvez tout supprimer, à tout moment."],
  ];
  return (
    <Section eyebrow="Nos engagements" title="Ce que La Répét' ne fait pas">
      <div className="rs-g3">
        {items.map(([ghost, ic, t, d], i) => (
          <Reveal key={t} delay={i * 90} style={{ height: "100%" }}>
            <Card style={{ height: "100%", display: "grid", gap: 8, alignContent: "start" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <IconTile icon={ic} />
                <span className="strike" aria-hidden style={{ ...TY.mono, color: T.muted }}>{ghost}</span>
              </div>
              <h3 style={{ ...TY.h3, margin: 0, color: T.navy }}>{t}</h3>
              <p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ─── Pour qui ─── */
function ForWho({ go }) {
  const doors = [
    { top: true, t: "Vous avez un code d'accès", d: "Votre coach vous a donné un code d'accès de 6 caractères. Il ouvre votre espace.", b: <Btn kind="secondary" onClick={() => go("#/espace")} iconRight={I.arrow}>Ouvrir mon espace</Btn> },
    { top: "coach", t: "Vous êtes coach", d: "Créez un parcours et transmettez le code d'accès. Relisez les réponses que l'on vous envoie. Préparez vos débriefings.", b: <Btn kind="secondary" onClick={() => go("#/espace")}>Me connecter à l'espace coach</Btn> },
    { top: "ai", t: "Vous représentez un organisme", d: "Direction, DSI, juridique : voyez comment l'outil s'installe chez vous, avec vos règles et votre hébergement.", b: <Btn kind="secondary" onClick={() => go("#/solutions/organismes")}>Voir le déploiement</Btn> },
  ];
  return (
    <Section eyebrow="Pour qui" title="Par où commencer ?">
      <div className="rs-g3">
        {doors.map((x, i) => (
          <Reveal key={x.t} delay={i * 90} style={{ height: "100%" }}>
            <Card topbar={x.top} style={{ height: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
              <h3 style={{ ...TY.h2, margin: "8px 0 0", color: T.navy }}>{x.t}</h3>
              <p style={{ ...TY.body, color: T.body, margin: 0, flex: 1 }}>{x.d}</p>
              <div>{x.b}</div>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ─── Bandeau final (partagé par les pages publiques) ─── */
export function FinalBand({ title = "Votre premier entraînement vous attend", text = "Il vous faut votre code d'accès et quelques minutes.", children, openSpace, go }) {
  return (
    <section style={{ padding: "80px 0" }} className="rs-section">
      <Reveal>
        <div className="rp-cta rs-on-dark" style={{ position: "relative", borderRadius: RAD.xl, padding: 48, overflow: "hidden", background: GRAD, boxShadow: SH.glowAi }}>
          <Halo style={{ width: 300, height: 300, background: ON.glow, bottom: -120, right: -40 }} />
          <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <h2 className="ty-xl" style={{ ...TY.xl, color: ON.text, margin: 0 }}>{title}</h2>
              <p style={{ ...TY.bodyLg, color: ON.text, margin: 0 }}>{text}</p>
            </div>
            <div className="rp-wide-m" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {children || <>
                <Btn kind="white" size="lg" onClick={openSpace} iconRight={I.arrow}>Ouvrir mon espace</Btn>
              </>}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
