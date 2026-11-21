/* Pages publiques : navigation, menu mobile, strate épinglée, FAQ, ressources, formulaire de démo.
   Échoue en cas d'erreur JavaScript, de débordement horizontal ou d'élément attendu absent. */
const { chromium } = require("playwright");
const fs = require("fs");
const BASE = process.argv[2] || "http://localhost:5097/";
const SC = process.argv[3] || "tests/screenshots/site";
fs.mkdirSync(SC, { recursive: true });

const IGNORE = /Failed to load resource|ERR_TUNNEL|ERR_NAME|net::/;
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

  // Code d'essai ouvert par lien sur un navigateur neuf (localStorage vide) : écran d'accord de Camille
  await p.goto(BASE + "#/"); await p.evaluate(() => { localStorage.clear(); });
  await p.goto(BASE + "?neuf=1#/s/REPETE"); await p.waitForTimeout(600); // nouveau chargement de page, stockage vide
  check(await p.getByRole("heading", { name: "Avant de commencer" }).count() === 1 && await p.getByText("Bonjour Camille").count() > 0, `[${tag}] #/s/REPETE sur un navigateur neuf : écran d'accord de Camille absent`);
  check(await p.getByText(/Ce code ne fonctionne pas|n'existe pas/).count() === 0, `[${tag}] #/s/REPETE sur un navigateur neuf : message d'erreur de code affiché`);
  await shot("00b-repete-accord", false);
  await p.evaluate(() => { localStorage.clear(); });

  // Accueil
  await visit("#/", "accueil");
  check(await p.locator("#rp-loader").count() === 0, `[${tag}] écran de chargement encore présent`);
  check(await p.getByRole("heading", { level: 1 }).first().textContent().then(t => t.includes("Répétez votre entretien d'embauche")), `[${tag}] titre du héros absent`);
  await p.getByRole("button", { name: "Lancer ma première répétition" }).waitFor();
  await shot("01-accueil", false);
  const dot = p.getByRole("button", { name: /Scène 2 sur 4/ });
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
      check(label.includes(["S'entraîner", "Recevoir un retour", "Envoyer", "En parler"][i - 1]), `[${tag}] strate : étape ${i} attendue, lu « ${label.slice(0, 40)} »`);
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
    await p.getByRole("button", { name: "Mon compte" }).first().waitFor();
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
    check(await p.getByRole("button", { name: "Demander une prise en main" }).first().isVisible(), `[${tag}] bouton « Demander une prise en main » absent`);
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
  await p.goto(BASE + "#/a-propos/faq"); await p.waitForTimeout(1600);
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
  check(await p.getByText("Les mots de La Répét'").count() === 0, `[${tag}] ressources : le glossaire doit être retiré`);
  check(await p.getByRole("heading", { name: "Par thème" }).count() === 0, `[${tag}] ressources : le titre « Par thème » doit être retiré`);
  const sb = p.getByRole("combobox", { name: "Rechercher une ressource" });
  await sb.fill("visio"); await p.waitForTimeout(200);
  check(await p.getByRole("link", { name: /Réussir un entretien en visio/ }).count() > 0, `[${tag}] recherche « visio » sans résultat`);
  // Suggestions : sans accents, flèches, Échap, Entrée ouvre l'article
  await sb.fill("presenter"); await p.waitForTimeout(200);
  const opt = p.getByRole("listbox", { name: "Ressources suggérées" }).getByRole("option");
  check(await opt.count() > 0, `[${tag}] recherche : aucune suggestion pour « presenter »`);
  await shot("09b-suggestions", false);
  await sb.press("Escape");
  check(await p.getByRole("listbox", { name: "Ressources suggérées" }).count() === 0, `[${tag}] recherche : Échap ne ferme pas les suggestions`);
  await sb.press("ArrowDown"); await sb.press("Enter"); await p.waitForTimeout(400);
  check(/#\/ressources\/[a-z0-9-]+$/.test(p.url()) && !p.url().includes("/c/"), `[${tag}] recherche : Entrée sur une suggestion n'ouvre pas l'article (${p.url()})`);
  await visit("#/ressources");
  await sb.fill("");
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

  // Demander une prise en main (formulaire destiné aux personnes accompagnées)
  await visit("#/demo"); await shot("13-demo");
  check(await p.getByRole("checkbox").count() === 0, `[${tag}] formulaire : aucune case de recontact ne doit être obligatoire`);
  check(await p.getByLabel(/Fonction/).count() === 0, `[${tag}] formulaire : le champ « Fonction » (organismes) doit être retiré`);
  await p.getByRole("button", { name: "Préparer ma demande" }).click();
  check(await p.locator("[role=alert]").count() >= 3, `[${tag}] formulaire : erreurs non signalées`);
  await shot("13b-demo-erreurs", false);
  await p.getByLabel("Prénom").fill("Alex");
  await p.getByLabel("Votre numéro de téléphone").fill("06 12 34 56 78");
  await p.getByLabel("Vos disponibilités").selectOption({ index: 1 });
  await p.getByRole("button", { name: "Préparer ma demande" }).click(); await p.waitForTimeout(300);
  /* Site construit sans VITE_CONTACT_EMAIL (BUG-01) : rien n'est envoyé, l'écran le dit et propose de copier la demande. */
  check(await p.getByRole("heading", { name: /votre demande est prête/ }).count() === 1, `[${tag}] formulaire : écran de confirmation absent`);
  const doneText = await p.locator("main").innerText();
  check(!/recontact|enregistrée|est envoyée/i.test(doneText), `[${tag}] formulaire : la confirmation ne doit pas annoncer un envoi qui n'a pas eu lieu`);
  check(/transmettez-le à votre coach/.test(doneText), `[${tag}] formulaire : consigne de copie absente`);
  check(await p.getByRole("button", { name: "Copier ma demande" }).count() === 1, `[${tag}] formulaire : bouton « Copier ma demande » absent`);
  await shot("14-demo-confirmation");

  // Pied de page : liens vers les questions fréquentes et les pages « Vos données »
  await visit("#/");
  await p.locator("footer").getByRole("link", { name: "Questions fréquentes" }).click(); await p.waitForTimeout(400);
  check(p.url().endsWith("#/a-propos/faq"), `[${tag}] lien « Questions fréquentes » du pied de page`);
  await visit("#/");
  await p.locator("footer").getByRole("link", { name: "Accessibilité : non conforme" }).click(); await p.waitForTimeout(400);
  check(p.url().endsWith("#/accessibilite"), `[${tag}] lien « Accessibilité : non conforme » du pied de page`);

  // Pages « Vos données » et pages légales : titre, titre du document, pas de valeur inventée
  const LEGAL = [["#/vos-donnees", "Vos données, vos choix"], ["#/vos-donnees/video", "Que devient ma vidéo ?"], ["#/vos-donnees/assistant", "Ce que fait l'assistant, et ce qu'il ne fait pas"],
    ["#/vos-donnees/droits", "Vos droits"], ["#/vos-donnees/appareil", "Ce qui est gardé sur cet appareil"], ["#/vos-donnees/notice", "Information complète sur vos données"],
    ["#/vos-donnees/coachs", "Coachs : vos données"], ["#/conditions", "Règles d'utilisation"], ["#/mentions-legales", "Mentions légales"], ["#/accessibilite", "Accessibilité"]];
  for (const [h, t] of LEGAL) {
    await visit(h);
    const h1 = (await p.getByRole("heading", { level: 1 }).first().textContent()) || "";
    check(h1.trim() === t, `[${tag}] ${h} : titre « ${t} » attendu, lu « ${h1.trim()} »`);
    check((await p.title()).startsWith(t), `[${tag}] ${h} : titre du document non mis à jour (${await p.title()})`);
    await overflow(h);
    const body = await p.locator("main").innerText();
    check(!/prototype|à compléter|version d'essai/i.test(body), `[${tag}] ${h} : mention de prototype ou de champ à compléter visible`);
  }
  await visit("#/vos-donnees"); await shot("15-vos-donnees");
  await visit("#/vos-donnees/notice"); await shot("16-notice");
  check(await p.getByText("À compléter").count() === 0, `[${tag}] notice : « À compléter » ne doit jamais s'afficher`);
  await visit("#/accessibilite");
  check(await p.getByText(/non conforme/).count() > 0, `[${tag}] déclaration d'accessibilité : mention « non conforme » absente`);
  await shot("17-accessibilite");

  // Un seul en-tête de page : le titre est au même endroit sur À propos, Solutions, Ressources, Démo et Vos données
  const pos = [];
  for (const h of ["#/a-propos", "#/solutions", "#/ressources", "#/demo", "#/vos-donnees"]) {
    await visit(h); await p.waitForTimeout(500);
    const b = await p.getByRole("heading", { level: 1 }).first().boundingBox();
    pos.push([h, Math.round(b.x), Math.round(b.y)]);
  }
  check(pos.every(([, x, y]) => Math.abs(x - pos[0][1]) <= 1 && Math.abs(y - pos[0][2]) <= 1), `[${tag}] titres de page à des positions différentes : ${JSON.stringify(pos)}`);

  // Navigation à deux niveaux : sous-menu au clic et au clavier, accordéons sur mobile
  if (!mobile) {
    await visit("#/");
    const sub = p.getByRole("button", { name: "Sous-menu À propos" });
    await sub.click();
    check(await sub.getAttribute("aria-expanded") === "true", `[${tag}] sous-menu : aria-expanded non mis à jour`);
    await shot("22-sous-menu", false);
    await p.keyboard.press("Escape");
    check(await sub.getAttribute("aria-expanded") === "false", `[${tag}] sous-menu : Échap ne ferme pas`);
    await sub.focus(); await p.keyboard.press("ArrowDown"); await p.waitForTimeout(100); await p.keyboard.press("ArrowDown");
    await p.keyboard.press("Enter"); await p.waitForTimeout(900);
    check(p.url().endsWith("#/a-propos/ia-et-recherche"), `[${tag}] sous-menu au clavier : « L'IA et la recherche » non ouverte (${p.url()})`);
    check(((await p.getByRole("heading", { level: 1 }).first().textContent()) || "").includes("L'IA et la recherche"), `[${tag}] page « L'IA et la recherche » absente`);
    await shot("23-ia-et-recherche");
  } else {
    await visit("#/");
    await p.getByRole("button", { name: "Ouvrir le menu" }).click();
    const dlg = p.getByRole("dialog", { name: "Menu" });
    await dlg.getByRole("button", { name: "Sous-menu Solutions" }).click();
    check(await dlg.getByRole("link", { name: "Coachs" }).isVisible(), `[${tag}] menu mobile : l'accordéon Solutions ne s'ouvre pas`);
    await shot("22-menu-accordeon", false);
    await p.keyboard.press("Escape");
  }

  // Lien interne à la page : défilement doux sous l'en-tête, puis focus sur la cible
  await visit("#/ressources/se-presenter-en-deux-minutes");
  const toc = p.getByRole("navigation", { name: "Sommaire de l'article" }).getByRole("link");
  if (await toc.count() > 1) {
    const target = await toc.nth(1).textContent();
    await toc.nth(1).click(); await p.waitForTimeout(1200);
    const r = await p.evaluate(() => { const el = document.activeElement; const b = el.getBoundingClientRect(); return { top: Math.round(b.top), tag: el.tagName, text: el.textContent }; });
    check(r.top >= 40 && r.top < 200 && r.text.trim() === target.trim(), `[${tag}] sommaire : cible non atteinte ou sans focus (${JSON.stringify(r)})`);
  }

  // Changement de page en fondu : plusieurs navigations et retour arrière sans erreur, haut de page atteint
  for (const h of ["#/solutions", "#/a-propos", "#/ressources"]) { await p.evaluate(x => { location.hash = x; }, h); await p.waitForTimeout(900); }
  await p.goBack(); await p.waitForTimeout(900);
  check(p.url().endsWith("#/a-propos") && await p.evaluate(() => scrollY) === 0, `[${tag}] retour arrière : page ou position inattendue (${p.url()})`);

  // « Revenir en haut »
  await visit("#/a-propos");
  await p.evaluate(() => scrollTo(0, 2000)); await p.waitForTimeout(400);
  const top = p.getByRole("button", { name: "Revenir en haut" });
  check(await top.isVisible(), `[${tag}] « Revenir en haut » absent après défilement`);
  await top.click(); await p.waitForTimeout(1500);
  check(await p.evaluate(() => scrollY) < 5, `[${tag}] « Revenir en haut » ne remonte pas`);

  // Options d'accessibilité : thème sombre et grande taille de texte, sans débordement, mémorisées sans flash
  if (!opts.reduced) {
    await visit("#/");
    await p.getByRole("button", { name: "Options d'accessibilité" }).first().click();
    const dlg = p.getByRole("dialog", { name: "Options d'accessibilité" });
    await dlg.waitFor();
    await dlg.getByRole("radio", { name: "Sombre" }).click();
    await dlg.getByRole("radio", { name: mobile ? "Très grande" : "Maximale" }).click();
    await shot("18-options-accessibilite", false);
    await p.keyboard.press("Escape");
    check(await p.evaluate(() => document.documentElement.dataset.theme) === "dark", `[${tag}] accessibilité : thème sombre non appliqué`);
    const bg = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
    check(bg === "rgb(14, 20, 30)", `[${tag}] accessibilité : fond sombre attendu, lu ${bg}`);
    for (const h of ["#/", "#/a-propos", "#/solutions", "#/ressources", "#/vos-donnees", "#/demo", "#/espace", "#/accessibilite"]) {
      await visit(h); await overflow(`sombre et grand texte ${h}`);
    }
    await visit("#/"); await shot("19-accueil-sombre");
    await visit("#/espace"); await shot("20-mon-espace-sombre");
    await visit("#/vos-donnees"); await shot("21-vos-donnees-sombre");
    await visit("#/demo"); await shot("21b-demo-sombre"); // flèche du choix et champs en thème sombre (UI-12)
    await p.goto(BASE + "?sombre=1#/a-propos", { waitUntil: "commit" });
    await p.waitForFunction(() => document.documentElement.dataset.theme !== undefined);
    check(await p.evaluate(() => document.documentElement.dataset.theme === "dark" && document.documentElement.classList.contains("rp-boot-dark")), `[${tag}] accessibilité : thème non appliqué avant l'affichage au rechargement`);
    await p.waitForTimeout(500);
    await p.getByRole("button", { name: "Options d'accessibilité" }).first().click();
    await p.getByRole("button", { name: "Réinitialiser" }).click();
    check(await p.evaluate(() => document.documentElement.dataset.theme) === "auto", `[${tag}] accessibilité : « Réinitialiser » ne remet pas le thème automatique`);
    await p.keyboard.press("Escape");
  }

  // « Mon compte » déconnecté : mène à la page « Mon espace »
  await visit("#/ressources");
  await p.getByRole("button", { name: "Mon compte" }).first().click(); await p.waitForTimeout(900);
  check(p.url().endsWith("#/espace"), `[${tag}] « Mon compte » déconnecté ne mène pas à « Mon espace » (${p.url()})`);
  // Rester connecté : après connexion, les pages publiques gardent « Mon compte », qui ouvre un panneau latéral
  await visit("#/espace");
  await p.getByRole("button", { name: "Se connecter" }).click();
  await p.waitForFunction(() => location.hash === "#/coach", null, { timeout: 5000 }).catch(() => {}); await p.waitForTimeout(1000);
  check(((await p.getByRole("heading", { level: 1 }).first().textContent()) || "").startsWith("Bienvenue"), `[${tag}] connexion coach : « Bienvenue » attendu`);
  await shot("24-espace-coach");
  await visit("#/ressources");
  const account = p.getByRole("button", { name: "Mon compte" });
  check(await account.count() === 1, `[${tag}] session : « Mon compte » absent sur une page publique`);
  await account.click();
  const acc = p.getByRole("dialog", { name: "Mon compte" });
  await acc.waitFor();
  check(await acc.getByText(/Sophie M\. · Espace coach/).count() === 1, `[${tag}] panneau « Mon compte » : en-tête du compte absent`);
  const st = await p.evaluate(() => ({ lock: getComputedStyle(document.documentElement).overflowY === "hidden", inert: !!document.querySelector(".rp-view")?.inert, inPanel: !!document.activeElement?.closest("#rp-account") }));
  check(st.lock && st.inert && st.inPanel, `[${tag}] panneau « Mon compte » : défilement, fond inerte ou focus incorrects ${JSON.stringify(st)}`);
  for (let i = 0; i < 12; i++) await p.keyboard.press("Tab");
  check(await p.evaluate(() => !!document.activeElement?.closest("#rp-account")), `[${tag}] panneau « Mon compte » : le focus sort du panneau`);
  await shot("25-mon-compte", false);
  await p.keyboard.press("Escape");
  check(await acc.count() === 0, `[${tag}] panneau « Mon compte » : Échap ne ferme pas`);
  check(await p.evaluate(() => document.activeElement?.textContent.includes("Mon compte")), `[${tag}] panneau « Mon compte » : focus non rendu au bouton`);
  await account.click();
  await acc.getByRole("button", { name: "Retour à mon espace" }).click(); await p.waitForTimeout(900);
  check(p.url().endsWith("#/coach"), `[${tag}] session : « Retour à mon espace » ne mène pas à l'espace (${p.url()})`);
  await visit("#/vos-donnees/coachs");
  check(await p.getByRole("button", { name: "Mon compte" }).count() === 1, `[${tag}] « Vos données » depuis l'espace : en-tête d'espace perdu`);
  await p.getByRole("button", { name: "Mon compte" }).click();
  await p.getByRole("dialog", { name: "Mon compte" }).getByRole("button", { name: "Se déconnecter" }).click(); await p.waitForTimeout(900);
  check(await p.getByRole("dialog", { name: "Mon compte" }).count() === 0 && p.url().endsWith("#/"), `[${tag}] « Se déconnecter » ne met pas fin à la session`);
  await p.getByRole("button", { name: "Mon compte" }).first().click(); await p.waitForTimeout(900);
  check(p.url().endsWith("#/espace"), `[${tag}] après déconnexion, « Mon compte » doit mener à « Mon espace »`);

  errors.forEach(e => problems.push(`[${tag}] ${e}`));
  await ctx.close();
}

/* Balayage responsive : chaque largeur (et 320 × 568, 844 × 390 en paysage), pages publiques et espaces,
   déconnecté puis connecté (« Mon compte »), menu mobile ouvert avec ses sous-menus.
   Échoue en cas de débordement horizontal, de chevauchement ou de sortie d'écran dans l'en-tête, de menu
   défaillant (fermeture invisible, page qui défile ou cliquable derrière, dernier lien inatteignable) ou d'erreur. */
const WIDTHS = [320, 360, 375, 390, 414, 430, 600, 768, 820, 1024, 1280];
const SWEEP_PAGES = ["#/", "#/a-propos", "#/solutions", "#/ressources", "#/ressources/se-presenter-en-deux-minutes", "#/demo", "#/espace", "#/vos-donnees"];
async function sweep(b) {
  const views = [...WIDTHS.map(w => [w, w < 600 ? 800 : 900]), [320, 568], [844, 390]];
  for (const [vw, vh] of views) for (const logged of [false, true]) {
    const tag = `balayage ${vw}x${vh}${logged ? " connecté" : ""}`;
    const mobile = vw < 760;
    const ctx = await b.newContext({ viewport: { width: vw, height: vh }, isMobile: mobile, hasTouch: mobile, reducedMotion: "reduce" });
    const p = await ctx.newPage();
    const errors = [];
    p.on("pageerror", e => errors.push(e.message));
    await p.goto(BASE + "#/"); await p.evaluate(() => localStorage.clear());
    if (logged) { await p.goto(BASE + "#/espace"); await p.getByRole("button", { name: "Se connecter" }).click(); await p.waitForFunction(() => location.hash === "#/coach", null, { timeout: 5000 }).catch(() => {}); }
    for (const h of [...SWEEP_PAGES, logged ? "#/coach" : "#/s/REPETE"]) {
      await p.goto(BASE + h); await p.waitForTimeout(250);
      const r = await p.evaluate(() => {
        const vw = document.documentElement.clientWidth, out = [];
        if (document.documentElement.scrollWidth > vw + 1) out.push(`débordement horizontal ${document.documentElement.scrollWidth}px`);
        const nav = document.querySelector("header .rp-nav");
        const els = [...nav.querySelectorAll("a[aria-label], button, .navlink")].map(e => [e.getAttribute("aria-label") || e.textContent.trim(), e.getBoundingClientRect()]).filter(([, b]) => b.width > 0);
        for (const [n, b] of els) if (b.left < -1 || b.right > vw + 1) out.push(`en-tête : « ${n} » hors écran`);
        for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) {
          const [n1, a] = els[i], [n2, c] = els[j];
          if (a.left < c.right - 1 && c.left < a.right - 1 && a.top < c.bottom - 1 && c.top < a.bottom - 1) out.push(`en-tête : « ${n1} » chevauche « ${n2} »`);
        }
        return out;
      });
      r.forEach(m => problems.push(`[${tag}] ${h} : ${m}`));
      const burger = p.getByRole("button", { name: "Ouvrir le menu" });
      const hasBurger = await burger.count() && await burger.isVisible();
      if (vw < 1024 && h === "#/ressources" && !hasBurger) problems.push(`[${tag}] ${h} : bouton du menu absent`);
      if (vw >= 1024 && hasBurger) problems.push(`[${tag}] ${h} : bouton du menu visible sur grand écran`);
      if (hasBurger && (h === "#/" || h === "#/ressources")) {
        await burger.click();
        const dlg = p.getByRole("dialog", { name: "Menu" });
        await dlg.waitFor();
        const subs = dlg.getByRole("button", { name: /^Sous-menu/ });
        for (let i = 0; i < await subs.count(); i++) await subs.nth(i).click();
        const m = await p.evaluate(() => {
          const menu = document.getElementById("rs-menu");
          const close = document.querySelector("header [aria-label='Fermer le menu']").getBoundingClientRect();
          menu.scrollTop = menu.scrollHeight;
          const last = [...menu.querySelectorAll("a")].pop().getBoundingClientRect();
          const mb = menu.getBoundingClientRect();
          const under = document.elementFromPoint(innerWidth / 2, Math.min(innerHeight - 2, mb.bottom - 2));
          return { closeOk: close.top >= 0 && close.bottom <= innerHeight && close.right <= innerWidth, locked: getComputedStyle(document.documentElement).overflowY === "hidden",
            lastOk: last.bottom <= innerHeight + 1 && last.top >= mb.top, inert: !!document.querySelector(".rp-view")?.inert, under: !!under && (menu.contains(under) || !!under.closest("header")), sw: menu.scrollWidth <= menu.clientWidth + 1 };
        });
        // molette au-dessus de l'en-tête : la page ne doit pas défiler derrière le menu
        const y0 = await p.evaluate(() => scrollY);
        await p.mouse.move(Math.round(vw / 2), 20); await p.mouse.wheel(0, 600); await p.waitForTimeout(150);
        if (await p.evaluate(() => scrollY) !== y0) m.locked = false;
        if (!m.closeOk) problems.push(`[${tag}] ${h} menu : bouton de fermeture hors écran`);
        if (!m.locked) problems.push(`[${tag}] ${h} menu : la page défile derrière le menu`);
        if (!m.lastOk) problems.push(`[${tag}] ${h} menu : dernier lien inatteignable`);
        if (!m.inert || !m.under) problems.push(`[${tag}] ${h} menu : la page reste cliquable derrière le panneau`);
        if (!m.sw) problems.push(`[${tag}] ${h} menu : débordement horizontal du panneau`);
        await p.keyboard.press("Escape");
        if (await dlg.count()) problems.push(`[${tag}] ${h} menu : Échap ne ferme pas`);
        if (await p.evaluate(() => document.documentElement.classList.contains("rp-lock"))) problems.push(`[${tag}] ${h} menu : défilement toujours bloqué après fermeture`);
      }
      if (logged && h === "#/ressources") {
        await p.getByRole("button", { name: "Mon compte" }).click();
        await p.locator("#rp-account").waitFor();
        const r = await p.evaluate(() => { const b = document.getElementById("rp-account").getBoundingClientRect(); const items = [...document.querySelectorAll("#rp-account nav button")].pop().getBoundingClientRect(); return { b: [b.left, b.right, b.bottom].map(Math.round), lastOk: items.bottom <= innerHeight + 1 }; });
        if (r.b[0] < 0 || r.b[1] > vw + 1 || r.b[2] > vh + 1) problems.push(`[${tag}] panneau « Mon compte » hors écran ${JSON.stringify(r.b)}`);
        if (!r.lastOk) problems.push(`[${tag}] panneau « Mon compte » : dernière action inatteignable sans défiler`);
        await p.keyboard.press("Escape");
      }
    }
    errors.forEach(e => problems.push(`[${tag}] erreur ${e}`));
    await ctx.close();
  }
}

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  await sweep(b);
  await run(b, 1280, 900);
  await run(b, 390, 844);
  await run(b, 1280, 900, { reduced: true });
  await b.close();
  if (problems.length) { console.error("ÉCHECS :\n" + problems.join("\n")); process.exit(1); }
  console.log("site : toutes les vérifications passent");
})().catch(e => { console.error("ECHEC", e.message); process.exit(1); });
