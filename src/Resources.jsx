import React, { useMemo, useRef, useState } from "react";
import { T, GAP, GRAD_PAGE, RAD, SH, Btn, Tag, Icon, I, TY, W, img, Eyebrow, Section, PageHero, Chip, IconTile, Input } from "./ui.jsx";
import { Reveal, scrollToTarget } from "./motion.jsx";
import { FinalBand } from "./home/FinalBand.jsx";
import { dateLong } from "./lib/format.js";
import { useTitle } from "./lib/hooks.js";
import { ARTICLES, CATEGORIES, TYPES, findArticle, findCategory, search, norm } from "./content/resources.js";

const TYPES_PL = { guide: "Guides", cas: "Scénarios d'usage" };

/* Centre de ressources à deux niveaux :
   #/ressources              catégories, articles à la une, recherche et filtre, glossaire
   #/ressources/c/CATEGORIE  liste d'une catégorie, filtre par type
   #/ressources/SLUG         article : gabarit « guide » (blog) ou « cas » (scénario d'usage)
   Le contenu est dans src/content/resources/*.md (voir docs/briefs/chatgpt-ressources.md). */

export default function Resources({ go, openSpace, slug, cat }) {
  /* Titre du document : celui de l'article ou de la catégorie (A11Y-06). */
  useTitle(slug ? findArticle(slug)?.title || "Ressource introuvable" : cat ? findCategory(cat)?.title || "Ressource introuvable" : "Ressources");
  if (slug) {
    const a = findArticle(slug);
    return a ? <Article a={a} go={go} openSpace={openSpace} /> : <NotFound go={go} />;
  }
  if (cat) {
    const c = findCategory(cat);
    return c ? <CategoryView c={c} go={go} openSpace={openSpace} /> : <NotFound go={go} />;
  }
  return <Hub go={go} openSpace={openSpace} />;
}

const iconOf = k => I[k] || I.book;
const catTitle = id => findCategory(id)?.title || id;
const fmtDate = dateLong; // src/lib/format.js
const wrap = { maxWidth: W.page, margin: "0 auto", padding: "0 24px" };

/* ─── Niveau 1 : le hub ─── */
function Hub({ go, openSpace }) {
  const [q, setQ] = useState("");
  const [fcat, setFcat] = useState("");
  const results = useMemo(() => search(q).filter(a => !fcat || a.category === fcat), [q, fcat]);
  const featured = ARTICLES.filter(a => a.featured).slice(0, 3);
  return (
    <main>
      <PageHero eyebrow="Ressources" title="Des conseils pour préparer votre entretien"
        lead="Des conseils concrets pour préparer un entretien. Des guides pour utiliser La Répét'. Des exemples d'usage de notre accompagnement.">
        <SearchBox q={q} setQ={setQ} go={go} />
      </PageHero>

      <div className="rs-pad" style={wrap}>
        <section className="rs-section" aria-labelledby="rs-themes" style={{ paddingTop: GAP.block + 16 }}>
          <h2 id="rs-themes" className="rs-sr">Thèmes</h2>
          <div className="rs-g3">
            {CATEGORIES.map((c, i) => {
              const n = ARTICLES.filter(a => a.category === c.id).length;
              return (
                <Reveal key={c.id} delay={(i % 3) * 70} style={{ height: "100%" }}>
                  <a href={`#/ressources/c/${c.id}`} className="rs-card-btn" style={{ height: "100%", textDecoration: "none" }}>
                    <div style={{ position: "relative", aspectRatio: "16 / 9", background: T.primaryBg }}>
                      <img src={img(`categories/${c.id}.webp`)} alt="" width={800} height={450} loading="lazy" decoding="async" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ padding: 24, display: "grid", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <IconTile icon={iconOf(c.icon)} />
                        <h3 style={{ ...TY.h2, color: T.navy, margin: 0 }}>{c.title}</h3>
                      </div>
                      <p style={{ ...TY.body, color: T.body, margin: 0 }}>{c.desc}</p>
                      <span style={{ ...TY.label, color: T.primary, display: "inline-flex", alignItems: "center", gap: 8 }}>{n} ressource{n > 1 ? "s" : ""} <Icon d={I.arrow} s={16} /></span>
                    </div>
                  </a>
                </Reveal>
              );
            })}
          </div>
        </section>

        {featured.length > 0 && (
          <Section eyebrow="À la une" title="Pour bien commencer">
            <div className="rs-g3">{featured.map(a => <ArticleCard key={a.slug} a={a} />)}</div>
          </Section>
        )}

        <Section id="toutes" eyebrow="Rechercher" title={q ? `Résultats pour « ${q} »` : "Toutes les ressources"}>
          <div className="rs-chips rs-scroll" role="group" aria-label="Filtrer par thème" style={{ marginBottom: 24 }}>
            <Chip pressed={!fcat} onClick={() => setFcat("")}>Tous les thèmes</Chip>
            {CATEGORIES.map(c => <Chip key={c.id} pressed={fcat === c.id} onClick={() => setFcat(fcat === c.id ? "" : c.id)}>{c.title}</Chip>)}
          </div>
          <p role="status" style={{ ...TY.small, color: T.muted, margin: "0 0 16px" }}>{results.length} ressource{results.length > 1 ? "s" : ""}</p>
          {results.length ? <div className="rs-g3">{results.map(a => <ArticleCard key={a.slug} a={a} />)}</div>
            : <Empty text="Aucune ressource ne correspond à cette recherche. Essayez un autre mot, ou retirez le filtre de thème." />}
        </Section>

        <FinalBand title="Passer de la lecture à la pratique" text="Le plus utile reste de s'entraîner à voix haute. Votre code suffit." openSpace={openSpace} go={go} />
      </div>
    </main>
  );
}

const Empty = ({ text }) => (
  <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: RAD.lg, padding: 32, display: "grid", justifyItems: "center", gap: 12, textAlign: "center" }}>
    <IconTile icon={I.search} s={48} />
    <p style={{ ...TY.body, color: T.body, margin: 0, maxWidth: 440 }}>{text}</p>
  </div>
);

function ArticleCard({ a }) {
  return (
    <a href={`#/ressources/${a.slug}`} className="rs-card-btn" style={{ height: "100%", textDecoration: "none", display: "flex", flexDirection: "column" }}>
      <div style={{ aspectRatio: "16 / 9", background: T.primaryBg }}>
        <img src={img(a.image)} alt="" width={1200} height={675} loading="lazy" decoding="async" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Tag tone={a.type === "cas" ? "ai" : "primary"}>{TYPES[a.type]}</Tag>
          <span style={{ ...TY.caption, color: T.muted }}>{catTitle(a.category)}</span>
        </div>
        <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>{a.title}</h3>
        <p style={{ ...TY.body, color: T.body, margin: 0, flex: 1 }}>{a.summary}</p>
        <span style={{ ...TY.caption, color: T.muted, display: "inline-flex", alignItems: "center", gap: 4 }}><Icon d={I.clock} s={16} c={T.muted} /> {a.readingTime} min de lecture</span>
      </div>
    </a>
  );
}

/* ─── Niveau 2 : une catégorie ─── */
function CategoryView({ c, go, openSpace }) {
  const all = ARTICLES.filter(a => a.category === c.id);
  const types = Object.keys(TYPES).filter(t => all.some(a => a.type === t));
  const [ft, setFt] = useState("");
  const list = all.filter(a => !ft || a.type === ft);
  return (
    <main>
      <PageHero eyebrow={<Crumbs items={[["#/ressources", "Ressources"]]} />} title={c.title} lead={c.desc} />
      <div className="rs-pad" style={wrap}>
        <section className="rs-section" style={{ paddingTop: 48 }}>
          {types.length > 1 && (
            <div className="rs-chips" role="group" aria-label="Filtrer par type" style={{ marginBottom: 24 }}>
              <Chip pressed={!ft} onClick={() => setFt("")}>Tous les types</Chip>
              {types.map(t => <Chip key={t} pressed={ft === t} onClick={() => setFt(ft === t ? "" : t)}>{TYPES_PL[t]}</Chip>)}
            </div>
          )}
          <p role="status" style={{ ...TY.small, color: T.muted, margin: "0 0 16px" }}>{list.length} ressource{list.length > 1 ? "s" : ""}</p>
          {list.length ? <div className="rs-g3">{list.map(a => <ArticleCard key={a.slug} a={a} />)}</div>
            : <Empty text="Aucune ressource de ce type pour l'instant dans ce thème." />}
        </section>
        <section className="rs-section" style={{ paddingTop: 80 }}>
          <Eyebrow>Autres thèmes</Eyebrow>
          <div className="rs-chips" style={{ marginTop: 16 }}>
            {CATEGORIES.filter(x => x.id !== c.id).map(x => <a key={x.id} href={`#/ressources/c/${x.id}`} className="rs-chip" style={{ textDecoration: "none" }}><Icon d={iconOf(x.icon)} s={16} /> {x.title}</a>)}
          </div>
        </section>
        <FinalBand title="Passer de la lecture à la pratique" text="Le plus utile reste de s'entraîner à voix haute. Votre code suffit." openSpace={openSpace} go={go} />
      </div>
    </main>
  );
}

const Crumbs = ({ items }) => (
  <nav aria-label="Fil d'Ariane" className="rp-crumbs" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
    {items.map(([h, l], i) => (
      <React.Fragment key={h}>
        {i > 0 && <Icon d={I.chevronR} s={12} c={T.muted} />}
        <a href={h} style={{ color: T.primary, textDecoration: "underline", textUnderlineOffset: 3 }}>{l}</a>
      </React.Fragment>
    ))}
  </nav>
);

/* ─── Rendu Markdown (sous-ensemble : titres, paragraphes, listes, citations, encadrés) ─── */
function inline(text) {
  const out = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0, m, k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<strong key={k++}>{inline(m[1])}</strong>);
    else if (m[2]) out.push(<em key={k++}>{m[2]}</em>);
    else {
      const href = m[4], ext = /^https?:/.test(href);
      /* Seuls les liens web, courriel et internes au site sont rendus (SEC-05) ; tout autre schéma reste du texte. */
      if (!/^(https?:|mailto:|#\/)/.test(href)) out.push(m[3]);
      else out.push(<a key={k++} href={href} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{m[3]}</a>);
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const CALLOUT = {
  conseil: { label: "Conseil", icon: I.bulb, fg: T.accent, bg: T.accentBg },
  exemple: { label: "Exemple", icon: I.chat, fg: T.primary, bg: T.primaryBg },
  attention: { label: "Point d'attention", icon: I.info, fg: T.warningDk, bg: T.warningBg },
  "a-retenir": { label: "À retenir", icon: I.check, fg: T.primary, bg: T.primaryBg },
};

function Blocks({ blocks }) {
  return blocks.map((b, i) => {
    if (b.t === "h2") return <h2 key={i} id={b.id}>{inline(b.text)}</h2>;
    if (b.t === "h3") return <h3 key={i}>{inline(b.text)}</h3>;
    if (b.t === "p") return <p key={i}>{inline(b.text)}</p>;
    if (b.t === "ul") return <ul key={i}>{b.items.map((x, j) => <li key={j}>{inline(x)}</li>)}</ul>;
    if (b.t === "ol") return <ol key={i}>{b.items.map((x, j) => <li key={j}>{inline(x)}</li>)}</ol>;
    if (b.t === "quote" || (b.t === "callout" && b.kind === "citation")) {
      return (
        <figure key={i} className="rs-quote" style={{ margin: "32px 0" }}>
          <Icon d={I.quote} s={24} c={T.primary} />
          <blockquote style={{ margin: "8px 0 0" }}><Blocks blocks={b.blocks} /></blockquote>
          {b.title && <figcaption style={{ ...TY.caption, color: T.muted, marginTop: 8 }}>{b.title}</figcaption>}
        </figure>
      );
    }
    if (b.t === "callout") {
      const c = CALLOUT[b.kind] || CALLOUT.conseil;
      return (
        <div key={i} role="note" className="rs-callout" style={{ background: c.bg, color: T.navy }}>
          <div className="rs-callout-t" style={{ color: c.fg }}><Icon d={c.icon} s={16} c={c.fg} /> {b.title || c.label}</div>
          <Blocks blocks={b.blocks} />
        </div>
      );
    }
    return null;
  });
}

/* ─── Article ─── */
function related(a) {
  const same = ARTICLES.filter(x => x.slug !== a.slug && x.category === a.category);
  const other = ARTICLES.filter(x => x.slug !== a.slug && x.category !== a.category && x.type === a.type);
  return [...same, ...other].slice(0, 3);
}

function Article({ a, go, openSpace }) {
  const cas = a.type === "cas";
  const toc = a.blocks.filter(b => b.t === "h2");
  const meta = (
    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", ...TY.small, color: T.muted }}>
      <span>{a.author}</span>
      {a.date && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon d={I.calendar} s={16} c={T.muted} /> {fmtDate(a.date)}</span>}
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon d={I.clock} s={16} c={T.muted} /> {a.readingTime} min de lecture</span>
    </div>
  );
  const facts = [["Contexte", a.facts.context], ["Public", a.facts.audience], ["Durée", a.facts.duration], ["Dispositif", a.facts.setup]].filter(([, v]) => v);

  return (
    <main>
      <article>
        <header style={{ background: GRAD_PAGE }}>
          <div className="rs-pad" style={{ ...wrap, padding: "48px 24px 0" }}>
            <div className="up" style={{ display: "grid", gap: 16, maxWidth: W.read }}>
              <div style={{ ...TY.small }}><Crumbs items={[["#/ressources", "Ressources"], [`#/ressources/c/${a.category}`, catTitle(a.category)]]} /></div>
              <div><Tag tone={cas ? "ai" : "primary"}>{TYPES[a.type]}</Tag></div>
              <h1 className="ty-xl" style={{ ...TY.pageTitle, color: T.navy, margin: 0 }}>{a.title}</h1>
              <p className="ty-lead" style={{ ...TY.lead, color: T.body, margin: 0 }}>{a.summary}</p>
              {meta}
            </div>
            <div style={{ marginTop: 32, borderRadius: RAD.lg, overflow: "hidden", aspectRatio: "1200 / 630", background: T.primaryBg, boxShadow: SH.sm }}>
              <img src={img(a.image)} alt={a.imageAlt} width={1200} height={630} decoding="async" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
        </header>

        <div className="rs-pad" style={{ ...wrap, paddingTop: 48 }}>
          <div className="rs-art">
            <aside className="rs-art-side" aria-label={cas ? "Faits clés" : "Sommaire"}>
              {cas ? (
                <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: RAD.lg, padding: 24, display: "grid", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ ...TY.overline, color: T.muted }}>Faits clés</span>
                    <Tag tone="muted">Scénario type</Tag>
                  </div>
                  <dl style={{ margin: 0, display: "grid", gap: 16 }}>
                    {facts.map(([k, v]) => (
                      <div key={k} style={{ display: "grid", gap: 4 }}>
                        <dt style={{ ...TY.label, color: T.navy }}>{k}</dt>
                        <dd style={{ ...TY.small, color: T.body, margin: 0 }}>{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <p style={{ ...TY.caption, color: T.muted, margin: 0 }}>Situation fictive. Ce scénario décrit un usage possible. Aucun résultat n'a été mesuré.</p>
                </div>
              ) : toc.length > 1 && (
                <nav className="rs-toc" aria-label="Sommaire de l'article">
                  <div style={{ ...TY.overline, color: T.muted, marginBottom: 8 }}>Sommaire</div>
                  {toc.map(h => <a key={h.id} href={`#/ressources/${a.slug}`} onClick={e => { e.preventDefault(); scrollToTarget(h.id); }}>{h.text}</a>)}
                </nav>
              )}
            </aside>
            <div className="rs-prose" style={{ maxWidth: W.read }}><Blocks blocks={a.blocks} /></div>
          </div>
        </div>
      </article>

      <div className="rs-pad" style={wrap}>
        {related(a).length > 0 && (
          <Section eyebrow="À lire ensuite" title="Sur le même thème">
            <div className="rs-g3">{related(a).map(x => <ArticleCard key={x.slug} a={x} />)}</div>
          </Section>
        )}
        {cas ? (
          <FinalBand title="Un projet d'accompagnement ?" text="Acteur public de l'emploi ou entreprise : parlons de vos besoins.">
            <Btn kind="white" size="lg" onClick={() => go("#/demo")} iconRight={I.arrow}>Nous contacter</Btn>
          </FinalBand>
        ) : (
          <FinalBand title="Mettez ces conseils en pratique" text="Ouvrez votre espace et répétez à voix haute, à votre rythme." openSpace={openSpace} go={go}>
            <Btn kind="white" size="lg" onClick={openSpace} iconRight={I.arrow}>Ouvrir mon espace</Btn>
            <Btn kind="ghostDark" size="lg" onClick={() => go("#/ressources")}>Toutes les ressources</Btn>
          </FinalBand>
        )}
      </div>
    </main>
  );
}

function NotFound({ go }) {
  return (
    <main className="rs-pad" style={{ maxWidth: W.form, margin: "0 auto", padding: "80px 24px", textAlign: "center", display: "grid", gap: 16, justifyItems: "center" }}>
      <IconTile icon={I.search} s={48} />
      <h1 className="ty-h1" style={{ ...TY.h1, color: T.navy, margin: 0 }}>Cette ressource est introuvable</h1>
      <p style={{ ...TY.bodyLg, color: T.body, margin: 0 }}>Elle a peut-être changé d'adresse. Retrouvez toutes les ressources ci-dessous.</p>
      <Btn kind="primary" onClick={() => go("#/ressources")}>Voir toutes les ressources</Btn>
    </main>
  );
}

/* Recherche avec suggestions : titres d'articles correspondants (sans tenir compte des accents),
   combobox ARIA (flèches, Entrée, Échap), clic ou Entrée ouvre l'article. */
function SearchBox({ q, setQ, go }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const blurT = useRef(0);
  const tokens = norm(q).split(/\s+/).filter(Boolean);
  const byTitle = tokens.length ? ARTICLES.filter(a => tokens.every(w => norm(a.title).includes(w))) : [];
  const sugg = (byTitle.length ? byTitle : tokens.length ? search(q) : []).slice(0, 6);
  const show = open && sugg.length > 0;
  const pick = a => { setOpen(false); setActive(-1); go(`#/ressources/${a.slug}`); };
  const onKey = e => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive(i => (sugg.length ? (i + 1) % sugg.length : -1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setOpen(true); setActive(i => (sugg.length ? (i <= 0 ? sugg.length - 1 : i - 1) : -1)); }
    else if (e.key === "Enter" && show && active >= 0) { e.preventDefault(); pick(sugg[active]); }
    else if (e.key === "Escape") { if (show) { e.preventDefault(); setOpen(false); setActive(-1); } }
  };
  return (
    <form role="search" onSubmit={e => { e.preventDefault(); setOpen(false); scrollToTarget("toutes"); }} style={{ position: "relative", maxWidth: 520, marginTop: 8 }}>
      <label htmlFor="rs-q" className="rs-sr">Rechercher une ressource</label>
      <span aria-hidden style={{ position: "absolute", left: 16, top: 14, color: T.muted, display: "flex" }}><Icon d={I.search} s={20} /></span>
      <Input id="rs-q" type="search" role="combobox" aria-autocomplete="list" aria-expanded={show} aria-controls="rs-q-list"
        aria-activedescendant={show && active >= 0 ? `rs-q-opt-${active}` : undefined} autoComplete="off"
        placeholder="Rechercher : visio, salaire, trac…" value={q} style={{ paddingLeft: 48 }}
        onChange={e => { setQ(e.target.value); setOpen(true); setActive(-1); }} onKeyDown={onKey}
        onFocus={() => { clearTimeout(blurT.current); setOpen(true); }} onBlur={() => { blurT.current = setTimeout(() => setOpen(false), 160); }} />
      {show && (
        <ul id="rs-q-list" role="listbox" aria-label="Ressources suggérées"
          style={{ position: "absolute", left: 0, right: 0, top: "calc(100% + 8px)", zIndex: 30, margin: 0, padding: 4, listStyle: "none", background: T.surface, border: `1px solid ${T.line}`, borderRadius: RAD.md, boxShadow: SH.lg }}>
          {sugg.map((a, i) => (
            // design-lint-disable-next-line K4 -- option d'une liste combobox ARIA : le clavier passe par le champ (aria-activedescendant), le clic ouvre l'article
            <li key={a.slug} id={`rs-q-opt-${i}`} role="option" aria-selected={i === active} className="rp-opt"
              onMouseDown={e => e.preventDefault()} onClick={() => pick(a)} onMouseMove={() => active !== i && setActive(i)}
              style={{ padding: "12px", borderRadius: RAD.sm, cursor: "pointer", display: "grid", gap: 2, background: i === active ? T.primaryBg : undefined }}>
              <span style={{ ...TY.bodyStrong, color: T.navy }}>{a.title}</span>
              <span style={{ ...TY.caption, color: T.muted }}>{catTitle(a.category)} · {TYPES[a.type]}</span>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
