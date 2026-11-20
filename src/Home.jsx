import React, { useEffect, useRef, useState } from "react";
import { T, GRAD, GRAD_MAIN, FD, FB, FM, RAD, SH, sp, RepetMark, Halo, Tag, Btn, Card, Icon, I } from "./ui.jsx";
import { useInView, useReducedMotion, useCount, Reveal } from "./motion.jsx";

/* Page d'accueil : à quoi sert l'outil, raconté au fil du défilement.
   Le détail du fonctionnement est sur la page « Fonctionnement » (HowItWorks.jsx). */

export default function Home({ go, openSpace }) {
  return (
    <main>
      <Hero go={go} />
      <div className="rp-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <Scrolly />
        <NotDo />
        <ForWho go={go} />
        <FinalBand openSpace={openSpace} go={go} />
      </div>
    </main>
  );
}

/* ─── Éléments partagés avec la page Fonctionnement ─── */
export const Eyebrow = ({ children, c = T.primary }) => (
  <div style={{ font: `700 12px ${FB}`, letterSpacing: ".1em", textTransform: "uppercase", color: c, marginBottom: sp(2) }}>{children}</div>
);
export const Section = ({ eyebrow, title, children, sub }) => (
  <section className="rp-section" style={{ padding: `${sp(18)}px 0 0` }}>
    <Reveal>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="rp-h2" style={{ font: `800 34px/1.1 ${FD}`, letterSpacing: "-.03em", margin: 0, color: T.navy }}>{title}</h2>
      {sub && <p style={{ font: `400 16px/1.6 ${FB}`, color: T.body, margin: "12px 0 0", maxWidth: 640 }}>{sub}</p>}
    </Reveal>
    <div style={{ marginTop: sp(8) }}>{children}</div>
  </section>
);
export const linkBtn = { font: `600 13px ${FB}`, color: T.primary, background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 };

/* ─── Héros ─── */
function Hero({ go }) {
  return (
    <section style={{ position: "relative", overflow: "hidden", background: T.bg }}>
      <Halo style={{ width: 560, height: 560, background: `${T.blue}1A`, top: -180, right: -100 }} />
      <Halo style={{ width: 420, height: 420, background: `${T.primary}14`, top: 60, left: -180 }} />
      <Halo style={{ width: 260, height: 260, background: `${T.violet}14`, bottom: -80, right: 200 }} />
      <div className="rp-hero" style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "84px 24px 84px", display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 56, alignItems: "center" }}>
        <div className="up">
          <div style={{ display: "flex", gap: 8, marginBottom: sp(6), flexWrap: "wrap" }}>
            <Tag tone="ai"><Icon d={I.sparkle} s={12} c={T.violet} /> Assistant IA</Tag>
            <Tag tone="primary">Sans note, sans jugement</Tag>
          </div>
          <h1 className="rp-h1" style={{ font: `800 54px/1.05 ${FD}`, letterSpacing: "-.035em", margin: `0 0 ${sp(5)}px`, color: T.primary }}>
            Répétez votre entretien d'embauche,<br /><span style={{ paddingBottom: ".08em", background: GRAD_MAIN, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>sans pression.</span>
          </h1>
          <p style={{ font: `400 19px/1.6 ${FB}`, color: T.body, maxWidth: 520, margin: `0 0 ${sp(8)}px` }}>
            La Répét' vous permet de vous entraîner en autonomie, face à votre caméra. Un assistant <strong style={{ color: T.primary }}>décrit votre entretien sans le noter</strong>, puis votre coach vous aide à aller plus loin.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Btn kind="objective" size="lg" onClick={() => go("#/espace")}>J'ai un code&nbsp;<Icon d={I.arrow} s={18} c="#fff" /></Btn>
            <Btn kind="secondary" size="lg" onClick={() => go("#/fonctionnement")}>Voir le fonctionnement</Btn>
          </div>
          <div style={{ font: `500 13px ${FB}`, color: T.muted, marginTop: sp(5) }}>
            Aucun compte à créer. Vous êtes coach ? <button onClick={() => go("#/coach")} style={{ ...linkBtn, padding: "8px 0" }}>Accéder à l'espace coach</button>
          </div>
        </div>
        <div className="rp-hero-vis"><HeroCard /></div>
      </div>
    </section>
  );
}

/* Carte d'aperçu : la chronologie de l'entretien se remplit, les repères et les observations apparaissent.
   Aucune note, aucune jauge : uniquement le temps de l'entretien et des faits. */
const SEGS = [[0, 11], [13, 27], [29, 41], [44, 58], [60, 70], [73, 86], [88, 100]];
const OBS = [
  { at: 4, time: "0:04", ap: true, d: 400, t: "Ouverture", txt: "Vous entrez directement dans le sujet." },
  { at: 38, time: "0:35", ap: true, d: 1210, t: "Exemples concrets", txt: "Une expérience précise pour appuyer." },
  { at: 66, time: "1:01", ap: false, d: 1880, t: "Mots d'appui", txt: "« euh » revient quelques fois." },
];

export const Pin = ({ ap, s = 14 }) => (
  <span style={{ display: "block", width: s, height: s, borderRadius: "50%", boxSizing: "border-box", background: ap ? T.accent : "#fff", border: ap ? "2px solid #fff" : `3px solid ${T.violet}`, boxShadow: "0 0 0 1.5px #fff, 0 2px 6px rgba(27,58,102,.2)" }} />
);

function HeroCard() {
  const reduced = useReducedMotion();
  // La carte flotte doucement (animation « float »), coupée si l'appareil demande moins d'animations.
  const [ref, v] = useInView({ threshold: 0.4 });
  const wpm = useCount(148, v, 2700, reduced), pauses = useCount(6, v, 2700, reduced);
  const lab = { font: `600 10.5px ${FB}`, textTransform: "uppercase", letterSpacing: ".06em", color: T.muted };
  return (
    <div style={{ position: "relative", animation: reduced ? "none" : "float 6s ease-in-out infinite" }}>
      <div ref={ref} className={`hc ${v ? "is-in" : ""}`} role="img"
        aria-label="Aperçu d'un retour : chronologie d'un entretien de 1 minute 32 avec trois repères, 148 mots par minute, 6 pauses. Aucune note.">
        <Card pad={0} style={{ overflow: "hidden", boxShadow: SH.lg, borderRadius: RAD.xl }}>
          <div aria-hidden>
            <div style={{ background: GRAD, padding: "16px 20px", display: "flex", alignItems: "center", gap: 10 }}>
              <RepetMark s={28} white />
              <div style={{ font: `700 15px ${FD}`, color: "#fff", letterSpacing: "-.01em" }}>Entretien du 12 mars</div>
            </div>

            <div style={{ padding: "18px 22px 8px" }}>
              <div style={lab}>Chronologie de l'entretien</div>
              <div style={{ position: "relative", marginTop: 26 }}>
                <div style={{ position: "relative", height: 10, borderRadius: 5, background: T.lineLt, overflow: "hidden" }}>
                  {SEGS.map(([a, b]) => <span key={a} style={{ position: "absolute", top: 0, bottom: 0, left: `${a}%`, width: `${b - a}%`, background: T.primary, borderRadius: 3 }} />)}
                  <span className="hc-mask" style={{ position: "absolute", inset: 0, background: "#fff" }} />
                </div>
                <span className="hc-head" style={{ position: "absolute", top: -4, height: 18, width: 2, marginLeft: -1, background: T.navy, borderRadius: 1 }} />
                {OBS.map(o => (
                  <span key={o.at} className="hc-pin" style={{ position: "absolute", left: `${o.at}%`, bottom: 14, display: "flex", flexDirection: "column", alignItems: "center", animationDelay: `${o.d}ms` }}>
                    <Pin ap={o.ap} />
                    <span style={{ width: 2, height: 6, background: o.ap ? T.accent : T.violet }} />
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", font: `500 10px ${FM}`, color: T.muted, marginTop: 6 }}><span>0:00</span><span>1:32</span></div>
            </div>

            <div className="hc-facts" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", margin: "6px 22px 0", borderTop: `1px solid ${T.lineLt}`, borderBottom: `1px solid ${T.lineLt}` }}>
              {[[wpm, "mots/min", "Débit"], [pauses, "", "Pauses"], ["1:32", "", "Durée"]].map(([n, u, l], i) => (
                <div key={l} style={{ padding: "12px 0", textAlign: "center", borderLeft: i ? `1px solid ${T.lineLt}` : "none" }}>
                  <div style={{ font: `700 20px ${FM}`, color: T.navy, fontVariantNumeric: "tabular-nums" }}>{n}{u && <span style={{ font: `500 11px ${FB}`, color: T.muted, marginLeft: 4 }}>{u}</span>}</div>
                  <div style={{ ...lab, marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: "6px 22px 18px" }}>
              {OBS.map((o, i) => {
                const c = o.ap ? T.accent : T.violet;
                return (
                  <div key={o.t} className="hc-row" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < 2 ? `1px solid ${T.lineLt}` : "none", animationDelay: `${o.d}ms` }}>
                    <span style={{ font: `700 10px ${FM}`, color: "#fff", background: c, borderRadius: 6, padding: "3px 6px", flexShrink: 0 }}>{o.time}</span>
                    <div style={{ width: 30, height: 30, borderRadius: RAD.sm, background: o.ap ? T.accentBg : `${T.violet}14`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                      <Icon d={o.ap ? I.check : I.search} s={15} c={c} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ font: `700 13px ${FD}`, color: T.navy }}>{o.t}</div>
                      <div style={{ font: `400 12px ${FB}`, color: T.muted }}>{o.txt}</div>
                    </div>
                    <Tag tone={o.ap ? "appui" : "ai"}>{o.ap ? "Appui" : "À explorer"}</Tag>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
      <div className="rp-float" style={{ position: "absolute", bottom: -18, left: -18, background: "#fff", borderRadius: RAD.md, padding: "10px 14px", boxShadow: SH.lg, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.accentBg, display: "grid", placeItems: "center" }}><Icon d={I.lock} s={14} c={T.accent} /></div>
        <div style={{ font: `700 12px ${FB}`, color: T.primary }}>La vidéo reste sur votre appareil</div>
      </div>
    </div>
  );
}

/* ─── Défilement raconté : une répétition en quatre temps ─── */
const STEPS = [
  { k: "Vous", c: T.accent, t: "Vous vous entraînez quand vous voulez", d: "Choisissez une question, lancez la caméra ou le micro seul, et répondez. Vous pouvez recommencer autant de fois que vous le souhaitez.", V: VisCamera },
  { k: "L'assistant", c: T.violet, t: "L'assistant décrit ce qu'il observe", d: "Débit, pauses, exemples concrets, mots d'appui, structure, direction du regard : des faits situés dans votre réponse. Jamais de note, jamais d'émotion déduite.", V: VisTranscript },
  { k: "Vous", c: T.accent, t: "Vous décidez de ce que vous partagez", d: "Votre vidéo reste sur votre appareil. Elle n'est envoyée à votre coach que si vous le choisissez, entretien par entretien.", V: VisShare },
  { k: "Votre coach", c: T.primary, t: "Votre coach annote, vous en reparlez ensemble", d: "Votre coach relit, nuance et commente des moments précis. Son rapport sert de base à votre débriefing en atelier.", V: VisCoach },
];

function Scrolly() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const refs = useRef([]);
  useEffect(() => {
    if (reduced) return;
    // Sur téléphone, la scène occupe le haut de l'écran : le visuel change quand le texte suivant entre par le bas.
    const mobile = window.matchMedia && window.matchMedia("(max-width:760px)").matches;
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setActive(+e.target.dataset.i); }), { rootMargin: mobile ? "-75% 0px -24% 0px" : "-45% 0px -45% 0px", threshold: 0 });
    refs.current.forEach(el => el && io.observe(el));
    return () => io.disconnect();
  }, [reduced]);

  const text = (s, i) => (
    <>
      <Eyebrow c={s.c}>{`${i + 1}. ${s.k}`}</Eyebrow>
      <h3 style={{ font: `800 28px/1.15 ${FD}`, letterSpacing: "-.02em", color: T.navy, margin: "0 0 12px" }} className="rp-h3">{s.t}</h3>
      <p style={{ font: `400 17px/1.6 ${FB}`, color: T.body, margin: 0, maxWidth: 460 }}>{s.d}</p>
    </>
  );

  return (
    <section className="rp-section" style={{ padding: `${sp(18)}px 0 0` }}>
      <Reveal>
        <Eyebrow>À quoi ça sert</Eyebrow>
        <h2 className="rp-h2" style={{ font: `800 34px/1.1 ${FD}`, letterSpacing: "-.03em", margin: 0, color: T.navy }}>Une répétition en quatre temps</h2>
      </Reveal>
      {reduced ? (
        <div style={{ display: "grid", gap: 40, marginTop: 32 }}>
          {STEPS.map((s, i) => (
            <div key={i} className="rp-stack" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center" }}>
              <div>{text(s, i)}</div>
              <div style={{ position: "relative", height: 340 }}><Stage active={i} only={i} /></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="sc">
          <div className="sc-scene"><Stage active={active} /></div>
          <div className="sc-steps">
            {STEPS.map((s, i) => (
              <div key={i} data-i={i} ref={el => (refs.current[i] = el)} className={`sc-step ${active === i ? "on" : ""}`}>{text(s, i)}</div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function Stage({ active, only }) {
  return (
    <div aria-hidden style={{ position: "relative", height: "100%", background: "#fff", borderRadius: RAD.xl, boxShadow: SH.lg, border: `1px solid ${T.line}`, overflow: "hidden" }}>
      {STEPS.map(({ V }, i) => (only === undefined || only === i) && (
        <div key={i} className={`sc-vis ${active === i ? "on" : ""}`}><V /></div>
      ))}
      {only === undefined && (
        <div style={{ position: "absolute", bottom: 14, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6 }}>
          {STEPS.map((_, i) => <span key={i} className={`sc-dot ${active === i ? "on" : ""}`} style={{ background: active === i ? T.accent : T.line }} />)}
        </div>
      )}
    </div>
  );
}

const visBox = { height: "100%", padding: "22px 22px 40px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 };

function VisCamera() {
  return (
    <div style={visBox}>
      <div style={{ position: "relative", flex: 1, minHeight: 0, borderRadius: 20, background: "linear-gradient(160deg,#1B3A66,#2C4D7C 60%,#45449A)", overflow: "hidden" }}>
        <svg viewBox="0 0 200 160" style={{ position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)", height: "78%" }}>
          <circle cx="100" cy="60" r="30" fill="rgba(255,255,255,.16)" />
          <path d="M36 160c0-38 28-62 64-62s64 24 64 62z" fill="rgba(255,255,255,.16)" />
        </svg>
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", alignItems: "center", gap: 7, background: "rgba(0,0,0,.35)", padding: "5px 10px", borderRadius: RAD.pill }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.error, animation: "blink 1.2s infinite" }} />
          <span style={{ font: `700 11px ${FM}`, color: "#fff" }}>0:42</span>
        </div>
        <div className="sc-in" style={{ position: "absolute", left: 12, right: 12, bottom: 12, background: "#fff", borderRadius: RAD.md, padding: "10px 14px", transitionDelay: ".25s" }}>
          <div style={{ font: `600 10.5px ${FB}`, textTransform: "uppercase", letterSpacing: ".06em", color: T.muted }}>Question</div>
          <div style={{ font: `700 15px ${FD}`, color: T.navy }}>« Parlez-moi de vous. »</div>
        </div>
      </div>
    </div>
  );
}

function VisTranscript() {
  const hl = (c, delay) => ({ backgroundImage: `linear-gradient(${c},${c})`, transitionDelay: delay });
  const line = { font: `500 15px/1.55 ${FB}`, color: T.navy, margin: 0 };
  return (
    <div style={visBox}>
      <div style={{ font: `600 10.5px ${FB}`, textTransform: "uppercase", letterSpacing: ".06em", color: T.muted }}>Transcription</div>
      <p style={line}>Bonjour, je m'appelle Camille.</p>
      <p style={line}><span className="sc-hl" style={hl(`${T.violet}26`, ".2s")}>Euh</span>, j'ai tenu <span className="sc-hl" style={hl(`${T.accent}24`, ".45s")}>l'accueil d'une mairie pendant deux ans</span>.</p>
      <p style={line}>J'aime renseigner les personnes.</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
        <span className="sc-in" style={{ transitionDelay: ".9s" }}><Tag tone="appui"><Icon d={I.check} s={12} c={T.accent} /> Exemple concret · Appui</Tag></span>
        <span className="sc-in" style={{ transitionDelay: "1.05s" }}><Tag tone="ai"><Icon d={I.search} s={12} c={T.violet} /> Mot d'appui · À explorer</Tag></span>
      </div>
    </div>
  );
}

function VisShare() {
  return (
    <div style={{ ...visBox, alignItems: "stretch" }}>
      <div style={{ border: `1px solid ${T.line}`, borderRadius: RAD.lg, padding: 18, boxShadow: SH.xs }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: RAD.sm, background: `${T.primary}12`, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon d={I.play} s={16} c={T.primary} /></div>
          <div>
            <div style={{ font: `700 15px ${FD}`, color: T.navy }}>Entretien du 12 mars</div>
            <div style={{ font: `500 12px ${FM}`, color: T.muted }}>1 min 32</div>
          </div>
        </div>
        <div style={{ position: "relative", height: 26, marginTop: 14 }}>
          <span className="sc-swap sc-off" style={{ position: "absolute", left: 0, top: 0 }}><Tag tone="muted"><Icon d={I.lock} s={12} c={T.muted} /> Sur cet appareil</Tag></span>
          <span className="sc-swap sc-onl" style={{ position: "absolute", left: 0, top: 0 }}><Tag tone="appui"><Icon d={I.send} s={12} c={T.accent} /> Envoyée à votre coach</Tag></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.lineLt}` }}>
          <span style={{ font: `600 14px ${FB}`, color: T.navy }}>Envoyer à mon coach</span>
          <span className="sc-track" style={{ position: "relative", width: 44, height: 26, borderRadius: 13 }}>
            <span className="sc-knob" style={{ position: "absolute", top: 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.25)" }} />
          </span>
        </div>
      </div>
    </div>
  );
}

function VisCoach() {
  const note = (t, txt, d) => (
    <div className="sc-in" style={{ display: "flex", gap: 10, alignItems: "flex-start", background: `${T.primary}0D`, borderLeft: `3px solid ${T.primary}`, borderRadius: RAD.xs, padding: "9px 12px", transitionDelay: d }}>
      <span style={{ font: `700 10px ${FM}`, color: "#fff", background: T.primary, borderRadius: 6, padding: "3px 6px", flexShrink: 0 }}>{t}</span>
      <span style={{ font: `500 13.5px/1.45 ${FB}`, color: T.navy }}>{txt}</span>
    </div>
  );
  return (
    <div style={visBox}>
      <div style={{ position: "relative", marginTop: 18 }}>
        <div style={{ height: 6, borderRadius: 3, background: T.lineLt }}><div style={{ width: "100%", height: "100%", borderRadius: 3, background: `${T.primary}40` }} /></div>
        {OBS.map(o => <span key={o.at} style={{ position: "absolute", left: `${o.at}%`, top: -4, transform: "translateX(-50%)" }}><Pin ap={o.ap} /></span>)}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", font: `500 10px ${FM}`, color: T.muted }}><span>0:00</span><span>1:32</span></div>
      {note("0:35", "Très bon exemple, gardez-le.", ".3s")}
      {note("1:01", "Une respiration ici suffirait.", ".65s")}
      <div className="sc-in" style={{ display: "flex", alignItems: "center", gap: 8, font: `600 13px ${FB}`, color: T.primary, marginTop: 4, transitionDelay: ".95s" }}>
        <Icon d={I.user} s={16} c={T.primary} /> Débriefing en atelier
      </div>
    </div>
  );
}

/* ─── Ce que La Répét' ne fait pas ─── */
function NotDo() {
  const items = [
    ["7/10", I.ban, "Aucune note", "Pas de score, pas de classement. Des observations que vous êtes libre d'utiliser."],
    ["humeur", I.shield, "Aucune émotion déduite", "L'assistant ne cherche ni votre humeur ni votre personnalité. Il s'en tient à ce qui se voit et s'entend."],
    ["envoi auto", I.lock, "Aucun envoi sans vous", "Rien ne part vers votre coach sans votre accord, et vous pouvez tout supprimer."],
  ];
  return (
    <Section eyebrow="Le parti pris" title="Ce que La Répét' ne fait pas">
      <div className="rp-stack" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: sp(5) }}>
        {items.map(([ghost, ic, t, d], i) => (
          <Reveal key={t} delay={i * 90} style={{ height: "100%" }}>
            <Card style={{ height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: sp(4) }}>
                <div style={{ width: 44, height: 44, borderRadius: RAD.md, background: `${T.primary}10`, display: "grid", placeItems: "center" }}><Icon d={ic} s={20} c={T.primary} /></div>
                <span className="strike" aria-hidden style={{ font: `500 13px ${FM}`, color: T.muted }}>{ghost}</span>
              </div>
              <h3 style={{ font: `700 18px ${FD}`, margin: "0 0 6px", color: T.navy }}>{t}</h3>
              <p style={{ font: `400 14px/1.6 ${FB}`, color: T.body, margin: 0 }}>{d}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ─── Pour qui ─── */
function ForWho({ go }) {
  return (
    <Section eyebrow="Pour qui" title="Deux portes d'entrée">
      <div className="rp-stack" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: sp(5) }}>
        <Reveal style={{ height: "100%" }}>
          <Card topbar style={{ height: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
            <h3 style={{ font: `700 20px ${FD}`, margin: "6px 0 0", color: T.navy }}>Un coach vous accompagne</h3>
            <p style={{ font: `400 15px/1.6 ${FB}`, color: T.body, margin: 0, flex: 1 }}>Votre coach vous a remis un code de 6 caractères. Il ouvre votre espace d'entraînement.</p>
            <div><Btn kind="objective" onClick={() => go("#/espace")}>J'ai un code&nbsp;<Icon d={I.arrow} s={16} c="#fff" /></Btn></div>
          </Card>
        </Reveal>
        <Reveal delay={90} style={{ height: "100%" }}>
          <Card topbar="coach" style={{ height: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
            <h3 style={{ font: `700 20px ${FD}`, margin: "6px 0 0", color: T.navy }}>Vous êtes coach</h3>
            <p style={{ font: `400 15px/1.6 ${FB}`, color: T.body, margin: 0, flex: 1 }}>Créez un parcours, transmettez le code, relisez les entretiens que l'on vous envoie.</p>
            <div><Btn kind="secondary" onClick={() => go("#/coach")}>Espace coach</Btn></div>
          </Card>
        </Reveal>
      </div>
    </Section>
  );
}

/* ─── Bandeau final ─── */
export function FinalBand({ title = "Prêt pour une première répétition ?", text = "Cinq minutes et votre code suffisent pour un premier entretien.", children, openSpace, go }) {
  return (
    <section style={{ padding: `${sp(18)}px 0 ${sp(20)}px` }}>
      <Reveal>
        <div className="rp-cta" style={{ position: "relative", borderRadius: RAD.xl, padding: "52px 48px", overflow: "hidden", background: GRAD, boxShadow: SH.lg }}>
          <Halo style={{ width: 300, height: 300, background: "rgba(255,255,255,.18)", bottom: -120, right: -40 }} />
          <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
            <div>
              <h2 className="rp-h3" style={{ font: `800 30px ${FD}`, color: "#fff", margin: "0 0 8px", letterSpacing: "-.02em" }}>{title}</h2>
              <p style={{ font: `400 17px ${FB}`, color: "rgba(255,255,255,.9)", margin: 0 }}>{text}</p>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {children || <>
                <Btn kind="white" size="lg" onClick={openSpace}>Ouvrir mon espace&nbsp;<Icon d={I.arrow} s={18} c={T.primary} /></Btn>
                <Btn kind="ghostDark" size="lg" onClick={() => go("#/fonctionnement")}>Voir le fonctionnement</Btn>
              </>}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
