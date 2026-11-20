/* Pages publiques : navigation, menu mobile, strate épinglée, FAQ, ressources, formulaire de démo.
   Échoue en cas d'erreur JavaScript, de débordement horizontal ou d'élément attendu absent. */
const { chromium } = require("playwright");
const fs = require("fs");
const BASE = process.argv[2] || "http://localhost:5097/";
const SC = process.argv[3] || "tests/screenshots/site";
fs.mkdirSync(SC, { recursive: true });

const IGNORE = /fonts\.googleapis|fonts\.gstatic|Failed to load resource|ERR_TUNNEL|ERR_NAME|net::/;
const problems = [];
const check = (ok, msg) => { if (!ok) problems.push(msg); };

async function run(b, vw, vh, opts = {}) {
  const mobile = vw < 600, tag = `${vw}${opts.reduced ? "-reduit" : ""}`;
  const ctx = await b.newContext({ viewport: { width: vw, height: vh }, isMobile: mobile, hasTouch: mobile, reducedMotion: opts.reduced ? "reduce" : "no-preference" });
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", e => errors.push("pageerror " + e.message));
  p.on("console", m => { if (m.type() === "error" && !IGNORE.test(m.text())) errors.push("console " + m.text().slice(0, 200)); });
  const overflow = async n => {
    const w = await p.evaluate(() => document.documentElement.scrollWidth);
    check(w <= vw + 1, `[${tag}] ${n} : débordement horizontal ${w}px pour ${vw}px`);
  };
  // Pleine page : on parcourt d'abord la page pour déclencher les apparitions et les images différées.
  const revealAll = () => p.evaluate(async () => {
    const y0 = scrollY;
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.7) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
    scrollTo(0, y0); await new Promise(r => setTimeout(r, 300));
  });
  const shot = async (n, full = true) => { await overflow(n); if (full) await revealAll(); await p.screenshot({ path: `${SC}/${tag}-${n}.png`, fullPage: full }); };
  const visit = async (hash, n) => { await p.goto(BASE + hash); await p.waitForTimeout(500); await p.evaluate(() => window.scrollTo(0, 0)); };

  // Écran de chargement : visible tant que le JavaScript n'est pas arrivé, retiré ensuite.
  if (!opts.reduced) {
    await p.route(/\/assets\/index-.*\.js$/, async r => { await new Promise(x => setTimeout(x, 1500)); r.continue().catch(() => {}); });
    await p.goto(BASE, { waitUntil: "commit" });
    await p.waitForTimeout(400);
    check(await p.locator("#rp-loader").isVisible(), `[${tag}] écran de chargement non visible avant le JavaScript`);
    await p.screenshot({ path: `${SC}/${tag}-00-chargement.png` });
    await p.waitForSelector("#rp-loader", { state: "detached", timeout: 8000 }).catch(() => check(false, `[${tag}] écran de chargement non retiré`));
    await p.unroute(/\/assets\/index-.*\.js$/);
  }

  // Accueil
  await visit("#/", "accueil");
  check(await p.locator("#rp-loader").count() === 0, `[${tag}] écran de chargement encore présent`);
  check(await p.getByRole("heading", { level: 1 }).first().textContent().then(t => t.includes("Répétez votre entretien d'embauche")), `[${tag}] titre du héros absent`);
  await p.getByRole("button", { name: "Lancer ma première répétition" }).waitFor();
  await shot("01-accueil", false);
  const dot = p.getByRole("button", { name: /Scène 2 sur 3/ });
  await dot.click(); await p.waitForTimeout(700);
  check(await dot.getAttribute("aria-current") === "true", `[${tag}] le point de navigation des scènes ne change pas la scène`);
  await shot("01a-heros-scene2", false);
  await shot("01z-accueil-complet");

  if (!opts.reduced) {
    // Phrase qui se colore
    const ph = p.locator("section.rs-phrase");
    const phTop = await ph.evaluate(el => el.getBoundingClientRect().top + scrollY);
    const phH = await ph.evaluate(el => el.offsetHeight);
    await p.evaluate(y => scrollTo(0, y), phTop + phH * 0.15); await p.waitForTimeout(400);
    await shot("02a-phrase-debut", false);
    await p.evaluate(y => scrollTo(0, y), phTop + phH * 0.55); await p.waitForTimeout(400);
    await shot("02b-phrase-fin", false);
    // Strate épinglée : le panneau reste en place, l'étape active change
    const st = p.locator("section.rs-strate");
    const top = await st.evaluate(el => el.getBoundingClientRect().top + scrollY);
    const h = await st.evaluate(el => el.offsetHeight);
    const range = h - vh;
    const seen = [];
    for (const [i, f] of [[1, 0.1], [2, 0.38], [3, 0.63], [4, 0.9]]) {
      await p.evaluate(y => scrollTo(0, y), top + range * f); await p.waitForTimeout(1100);
      const panelTop = await p.locator(".rs-panel").evaluate(el => Math.round(el.getBoundingClientRect().top));
      check(panelTop <= 64 && panelTop >= 50, `[${tag}] strate : panneau non épinglé (top ${panelTop})`);
      seen.push(await p.locator(".rs-vis.on").count());
      const label = mobile ? await p.locator(".rs-tabs-m span").filter({ hasText: /^Étape/ }).first().textContent()
        : await p.locator(".rs-step.on").textContent();
      check(label.includes(["S'entraîner", "Recevoir un retour", "Partager", "Débriefer"][i - 1]), `[${tag}] strate : étape ${i} attendue, lu « ${label.slice(0, 40)} »`);
      await shot(`03-strate-etape${i}`, false);
    }
    // Cartes animées (défilement horizontal sur mobile, sans débordement de page)
    await p.locator(".rs-fcards").scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
    check(await p.locator(".rs-fcard.play").count() > 0, `[${tag}] cartes animées : aucune animation active alors qu'elles sont visibles`);
    await shot("04-cartes", false);
  } else {
    check(await p.locator("section.rs-strate").count() === 0, `[${tag}] mouvement réduit : la strate devrait être remplacée par des sections empilées`);
    check(await p.locator(".rs-fcard.play").count() === 0, `[${tag}] mouvement réduit : cartes animées actives`);
  }

  // Menu mobile
  if (mobile) {
    await visit("#/", "menu");
    await p.getByRole("button", { name: "Mon espace" }).first().waitFor();
    const burger = p.getByRole("button", { name: "Ouvrir le menu" });
    await burger.click();
    const dlg = p.getByRole("dialog", { name: "Menu" });
    await dlg.waitFor(); await p.waitForTimeout(350);
    await shot("05-menu-mobile", false);
    await p.keyboard.press("Escape");
    check(await dlg.count() === 0, `[${tag}] le menu ne se ferme pas avec Échap`);
    await burger.click();
    await dlg.getByRole("link", { name: "Solutions" }).click(); await p.waitForTimeout(400);
    check(p.url().endsWith("#/solutions"), `[${tag}] le lien Solutions du menu ne mène pas à #/solutions`);
    check(await p.getByRole("dialog", { name: "Menu" }).count() === 0, `[${tag}] le menu reste ouvert après navigation`);
  } else {
    await visit("#/", "nav");
    await p.getByRole("navigation", { name: "Navigation principale" }).getByRole("link", { name: "Ressources" }).click(); await p.waitForTimeout(300);
    check(p.url().endsWith("#/ressources"), `[${tag}] lien Ressources de l'en-tête`);
    check(await p.getByRole("button", { name: "Demander une démo" }).first().isVisible(), `[${tag}] bouton Demander une démo absent`);
  }

  // Redirection de l'ancienne adresse
  await visit("#/fonctionnement");
  check(p.url().endsWith("#/solutions"), `[${tag}] #/fonctionnement ne redirige pas vers #/solutions`);
  await shot("06-solutions");
  const tab = p.getByRole("tab", { name: "DSI" });
  await tab.click();
  check(await tab.getAttribute("aria-selected") === "true", `[${tag}] onglet DSI non sélectionné`);
  await p.keyboard.press("ArrowRight");
  check(await p.getByRole("tab", { name: "Juridique et DPO" }).getAttribute("aria-selected") === "true", `[${tag}] onglets : la flèche droite ne change pas d'onglet`);

  // À propos et FAQ
  await visit("#/a-propos"); await shot("07-a-propos");
  await p.goto(BASE + "#/a-propos/faq"); await p.waitForTimeout(700);
  const faqTop = await p.locator("#faq").evaluate(el => Math.round(el.getBoundingClientRect().top));
  check(faqTop < 200, `[${tag}] #/a-propos/faq ne défile pas jusqu'à la FAQ (${faqTop})`);
  const q = p.getByRole("button", { name: "Faut-il créer un compte ?" });
  await q.click();
  check(await q.getAttribute("aria-expanded") === "true", `[${tag}] FAQ : le dépliant ne s'ouvre pas`);
  await q.focus(); await p.keyboard.press("Enter");
  check(await q.getAttribute("aria-expanded") === "false", `[${tag}] FAQ : Entrée ne referme pas le dépliant`);
  await p.keyboard.press(" ");
  check(await q.getAttribute("aria-expanded") === "true", `[${tag}] FAQ : Espace n'ouvre pas le dépliant`);
  await shot("08-faq", false);

  // Ressources : hub, recherche, filtre, catégorie, articles
  await visit("#/ressources"); await shot("09-ressources");
  await p.getByRole("searchbox", { name: "Rechercher une ressource" }).fill("visio"); await p.waitForTimeout(200);
  check(await p.getByRole("link", { name: /Réussir un entretien en visio/ }).count() > 0, `[${tag}] recherche « visio » sans résultat`);
  await p.getByRole("searchbox", { name: "Rechercher une ressource" }).fill("");
  await p.getByRole("group", { name: "Filtrer par thème" }).getByRole("button", { name: "Pour les coachs" }).click();
  check((await p.locator("#toutes a.rs-card-btn").count()) >= 1, `[${tag}] filtre par thème sans résultat`);
  await p.goto(BASE + "#/ressources/c/coachs"); await p.waitForTimeout(400);
  await p.getByRole("group", { name: "Filtrer par type" }).getByRole("button", { name: /Scénario/ }).click();
  check((await p.locator("main a.rs-card-btn").count()) === 1, `[${tag}] filtre par type : un scénario attendu dans « Pour les coachs »`);
  await shot("10-categorie");
  await p.locator("main a.rs-card-btn").first().click(); await p.waitForTimeout(400);
  check(p.url().includes("#/ressources/scenario-atelier-collectif"), `[${tag}] clic sur la carte : article non ouvert`);
  check(await p.getByText("Scénario type").count() > 0, `[${tag}] scénario d'usage : mention « Scénario type » absente`);
  await shot("11-article-cas");
  await visit("#/ressources/se-presenter-en-deux-minutes");
  check(await p.getByRole("navigation", { name: "Sommaire de l'article" }).count() === 1, `[${tag}] article guide : sommaire absent`);
  await shot("12-article-guide");
  await visit("#/ressources/inexistant");
  check(await p.getByRole("heading", { name: "Cette ressource est introuvable" }).count() === 1, `[${tag}] article inconnu : message absent`);

  // Demander une démo
  await visit("#/demo"); await shot("13-demo");
  await p.getByRole("button", { name: "Envoyer ma demande" }).click();
  check(await p.locator("[role=alert]").count() > 3, `[${tag}] formulaire : erreurs non signalées`);
  await shot("13b-demo-erreurs", false);
  await p.getByLabel("Prénom").fill("Alex"); await p.getByLabel("Nom", { exact: true }).fill("Martin");
  await p.getByLabel("Organisme").fill("Organisme test");
  await p.getByLabel("Fonction").selectOption({ index: 1 });
  await p.getByLabel("Personnes accompagnées par an").selectOption({ index: 2 });
  await p.getByLabel("Adresse électronique professionnelle").fill("alex.martin@exemple.fr");
  await p.getByLabel(/J'accepte d'être recontacté/).check();
  await p.getByRole("button", { name: "Envoyer ma demande" }).click(); await p.waitForTimeout(300);
  check(await p.getByRole("heading", { name: /votre demande est prête/ }).count() === 1, `[${tag}] formulaire : écran de confirmation absent`);
  await shot("14-demo-confirmation");

  // Pied de page : lien FAQ
  await visit("#/");
  await p.locator("footer").getByRole("link", { name: "FAQ" }).click(); await p.waitForTimeout(400);
  check(p.url().endsWith("#/a-propos/faq"), `[${tag}] lien FAQ du pied de page`);

  errors.forEach(e => problems.push(`[${tag}] ${e}`));
  await ctx.close();
}

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  await run(b, 1280, 900);
  await run(b, 390, 844);
  await run(b, 1280, 900, { reduced: true });
  await b.close();
  if (problems.length) { console.error("ÉCHECS :\n" + problems.join("\n")); process.exit(1); }
  console.log("site : toutes les vérifications passent");
})().catch(e => { console.error("ECHEC", e.message); process.exit(1); });
