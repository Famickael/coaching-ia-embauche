/* Cas limites de bout en bout (TST-02) : chaque scénario part d'un état préparé dans le stockage local,
   pour rester court. Lancer : npm run test:cas (CHROMIUM_PATH facultatif). Captures dans tests/screenshots/cas-limites/. */
const { chromium } = require("playwright");
const SC = process.argv[2] || "tests/screenshots/cas-limites";
require("fs").mkdirSync(SC, { recursive: true });
const BASE = "http://localhost:5098/";
const KEY = "larepet.v1";
const now = () => new Date().toISOString();

/* État de départ : un coach connecté, un parcours avec accord, éventuellement des réponses. */
function seed({ code = "CASAAA", ai = true, takes = {}, consent = true } = {}) {
  return {
    counselor: { name: "Sophie M.", since: now() }, lastSpace: null,
    parcours: { [code]: { code, prenom: "Lou", poste: "électricien", warmup: true, counselor: "Sophie M.", createdAt: now(), openedAt: now(), consent: consent ? { at: now(), local: true, ai, version: "1" } : null } },
    takes,
  };
}
const dims = [
  { id: "debit", titre: "Rythme de parole", type: "appui", observation: "Environ 130 mots par minute.", conseil: "Vous pouvez le garder.", t: 0 },
  { id: "exemples", titre: "Exemples concrets", type: "explorer", observation: "Aucune situation datée.", conseil: "Ajoutez une situation vécue.", t: 2 },
];
const take = (id, code, extra = {}) => ({ id, code, question: "Pouvez-vous vous présenter ?", duration: 42, transcript: "Bonjour je m'appelle Lou.", segments: [{ start: 0, end: 3, text: "Bonjour je m'appelle Lou." }], gaze: null,
  analysis: { synthese: "Vos points d'appui : rythme de parole.", dimensions: dims, source: "local" }, hasVideo: false, mime: null, createdAt: now(), shared: false, sharedAt: null, note: "", report: null, ...extra });

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream", "--autoplay-policy=no-user-gesture-required"] });
  const [vw, vh] = (process.env.E2E_VIEWPORT || "1280x900").split("x").map(Number);
  const mobile = vw < 600;
  const fails = [], errors = [];
  const check = (ok, msg) => { if (!ok) fails.push(msg); };
  /* Nouveau contexte (stockage vierge), état préparé avant le premier script de la page. */
  async function fresh(state, perms = ["camera", "microphone"]) {
    const ctx = await b.newContext({ viewport: { width: vw, height: vh }, isMobile: mobile, hasTouch: mobile, permissions: perms });
    if (state) await ctx.addInitScript(([k, v]) => { if (!sessionStorage.getItem("seeded")) { localStorage.setItem(k, v); sessionStorage.setItem("seeded", "1"); } }, [KEY, JSON.stringify(state)]);
    const watch = p => { p.on("pageerror", e => errors.push(`${p.url()} : ${e.message}`)); p.on("console", m => { if (m.type() === "error" && !/Failed to load resource|ERR_|jsdelivr|googleapis|huggingface/.test(m.text())) errors.push(`${p.url()} : ${m.text().slice(0, 160)}`); }); };
    ctx.on("page", watch);
    const p = await ctx.newPage();
    return { ctx, p };
  }
  const shot = (p, n) => p.screenshot({ path: `${SC}/${n}.png`, fullPage: true });
  const scenario = async (name, fn) => {
    try { await fn(); console.log(`  ok  ${name}`); }
    catch (e) { fails.push(`${name} : ${e.message.split("\n")[0]}`); console.log(`  ÉCHEC ${name}`); }
  };

  /* BUG-02 : la personne reprend son envoi pendant que le coach relit, dans un autre onglet. */
  await scenario("reprise de l'envoi pendant la relecture", async () => {
    const { ctx, p } = await fresh(seed({ takes: { t1: take("t1", "CASAAA", { shared: true, sharedAt: now() }) } }));
    await p.goto(BASE + "#/coach");
    await p.getByRole("button", { name: "Relire" }).first().click();
    await p.getByRole("button", { name: "Relire et annoter" }).click();
    await p.locator("#review-intro").fill("Lou, voici mes remarques.");
    const q = await ctx.newPage();
    await q.goto(BASE + "#/s/CASAAA");
    await q.getByRole("button", { name: "Ouvrir", exact: true }).first().click();
    await q.getByRole("button", { name: "Reprendre mon envoi" }).click();
    await p.getByText("La personne a repris cette réponse").waitFor({ timeout: 5000 });
    check(await p.getByRole("button", { name: /Envoyer le rapport/ }).count() === 0, "BUG-02 : le bouton d'envoi du rapport reste affiché après la reprise");
    const st = await p.evaluate(k => JSON.parse(localStorage.getItem(k)), KEY);
    check(!st.takes.t1.report, "BUG-02 : un rapport a été enregistré sur une réponse reprise");
    await shot(p, "01-reprise-pendant-relecture");
    await ctx.close();
  });

  /* BUG-18 : un rapport vide ne part pas. */
  await scenario("rapport vide refusé", async () => {
    const { ctx, p } = await fresh(seed({ takes: { t1: take("t1", "CASAAA", { shared: true, sharedAt: now() }) } }));
    await p.goto(BASE + "#/coach");
    await p.getByRole("button", { name: "Relire" }).first().click();
    await p.getByRole("button", { name: "Relire et annoter" }).click();
    check(await p.getByRole("button", { name: "Envoyer le rapport" }).isDisabled(), "BUG-18 : « Envoyer le rapport » actif sans aucun texte");
    await p.locator("#review-intro").fill("Lou, merci.");
    check(!(await p.getByRole("button", { name: "Envoyer le rapport" }).isDisabled()), "BUG-18 : « Envoyer le rapport » reste inactif après saisie");
    await ctx.close();
  });

  /* BUG-19 : la fiche du parcours indique le retrait de l'accord. */
  await scenario("accord retiré affiché au coach", async () => {
    const st = seed({ consent: false });
    st.parcours.CASAAA.consentWithdrawnAt = now();
    const { ctx, p } = await fresh(st);
    await p.goto(BASE + "#/coach");
    await p.getByRole("button", { name: "Ouvrir" }).first().click();
    await p.getByText(/accord retiré le/).waitFor({ timeout: 5000 });
    await ctx.close();
  });

  await b.close();
  if (errors.length) fails.push("erreurs JavaScript : " + errors.join(" | "));
  if (fails.length) { console.error("ECHEC\n- " + fails.join("\n- ")); process.exit(1); }
  console.log("e2e-cas-limites : OK");
})().catch(e => { console.error("ECHEC", e.message); process.exit(1); });
