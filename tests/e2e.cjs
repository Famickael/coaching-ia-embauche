const { chromium } = require("playwright");
const SC = process.argv[2] || "tests/screenshots";
require("fs").mkdirSync(SC, { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream", "--autoplay-policy=no-user-gesture-required"] });
  const [vw, vh] = (process.env.E2E_VIEWPORT || "1280x900").split("x").map(Number); // ex. 390x844 pour un téléphone
  const mobile = vw < 600;
  const ctx = await b.newContext({ viewport: { width: vw, height: vh }, isMobile: mobile, hasTouch: mobile, permissions: ["camera", "microphone", "clipboard-read", "clipboard-write"] });
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", e => errors.push("pageerror " + e.message));
  p.on("console", m => { if (m.type() === "error") errors.push("console " + m.text().slice(0, 160)); });
  p.on("dialog", d => d.accept());
  const overflow = [];
  const shot = async n => {
    const w = await p.evaluate(() => document.documentElement.scrollWidth);
    if (w > vw + 1) overflow.push(`${n} : ${w}px pour ${vw}px`);
    await p.screenshot({ path: `${SC}/${n}.png`, fullPage: true });
  };
  const click = t => p.getByRole("button", { name: t }).first().click();

  await p.goto("http://localhost:5098/"); await shot("01-accueil");
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 3)); await p.waitForTimeout(900); await shot("01b-accueil-defilement");
  await p.goto("http://localhost:5098/#/fonctionnement"); await p.waitForTimeout(400); await shot("01c-fonctionnement");
  await p.goto("http://localhost:5098/#/"); await click("Mon espace"); await shot("01d-mon-espace");
  await shot("01e-connexion-coach"); await click("Se connecter");
  await click("Créer un parcours");
  await p.getByPlaceholder("Prénom et initiale").fill("Alex D."); await p.getByPlaceholder(/agent d'accueil/).fill("agent d'accueil");
  await click("Créer le parcours"); await shot("02-code");
  const code = (await p.locator("text=/^[A-Z2-9]{6}$/").first().textContent()).trim(); console.log("code", code);
  await click("Ouvrir son espace sur cet appareil");
  const boxes = p.getByRole("checkbox");
  if (await boxes.nth(1).getAttribute("aria-checked") !== "false") throw new Error("la case du retour de l'assistant doit être décochée par défaut");
  await boxes.nth(0).click(); await boxes.nth(1).click(); await shot("03-consentement");
  await click("Je suis d'accord, je commence");
  const see = (t, timeout = 5000) => p.getByText(t).first().waitFor({ timeout });

  // Espace : choix du métier (combobox) et bulles d'information
  const job = p.getByRole("combobox", { name: "Métier visé" });
  await job.fill(""); await job.type("serv");
  await p.getByRole("option", { name: "serveur(se)", exact: true }).waitFor();
  await shot("03b-espace-metier");
  await job.press("ArrowDown"); await job.press("Enter");
  await see(/Métier enregistré/);
  await click("En savoir plus sur l'échauffement"); await see(/Rien n'est enregistré ni gardé/); await shot("03c-info-echauffement");
  await p.keyboard.press("Escape");

  // Échauffement : phrase aléatoire, relance, aperçu caméra, assistant, questionnaire
  await click("M'échauffer");
  const phrase = p.getByTestId("warmup-phrase");
  const ph1 = await phrase.textContent();
  await click("Changer de phrase");
  const ph2 = await phrase.textContent();
  if (ph1 === ph2) throw new Error("la phrase d'échauffement n'a pas changé");
  await click("Consigne suivante"); await see(/Consigne 2 sur/);
  await click("Activer la caméra"); await p.waitForTimeout(800);
  await p.getByRole("radio", { name: "Flou" }).click(); await p.waitForTimeout(2500);
  await shot("03d-echauffement");
  await click("Passer en voix seule"); await see("Voix seule · rien n'est enregistré");
  await click("Passer en vidéo"); await p.waitForTimeout(500);
  const ask = async (id, q, expected) => { const i = p.locator(`#${id}-input`); await i.fill(q); await i.press("Enter"); await see(expected); };
  await ask("asst-warmup", "Comment me présenter en entretien ?", /deux minutes environ/);
  await ask("asst-warmup", "un exemple ?", /Je m'appelle Camille/);
  await p.locator("#asst-warmup-title").scrollIntoViewIfNeeded(); await shot("03e-echauffement-assistant");
  await click("Terminer l'échauffement");
  await p.getByRole("radio", { name: "Un peu de tension" }).click(); await see(/Merci pour votre réponse/);
  await p.getByRole("radio", { name: "Utile" }).click();
  await p.getByRole("checkbox", { name: "Me présenter" }).click();
  await p.getByRole("checkbox", { name: "Expliquer ma motivation" }).click();
  await ask("asst-debrief", "Comment expliquer un trou dans mon CV ?", /simple et honnête/);
  await ask("asst-debrief", "et pour le salaire ?", /fourchette/);
  await shot("03f-questionnaire");
  await click("Commencer l'entraînement");

  // Sélection de 2 questions (une de la banque, une personnelle)
  await see(/Questions choisies d'après vos réponses/);
  await click("Tout retirer");
  await p.getByRole("checkbox", { name: /Pouvez-vous vous présenter en deux minutes/ }).click();
  await p.locator("#own").fill("Pourquoi avez-vous quitté votre dernier emploi ?"); await click("Ajouter");
  await shot("03g-selection");
  await click("Commencer (2 questions)");

  const record = async n => {
    await click("Activer la caméra"); await p.waitForTimeout(800);
    await click("Démarrer l'enregistrement"); await p.waitForTimeout(4500); await shot(`04-enregistrement-q${n}`);
    await click("Arrêter"); await p.waitForTimeout(800); await shot(`05-relecture-q${n}`);
    await click("Voir mon retour");
    await p.getByText("Comment voulez-vous voir votre retour ?").waitFor({ timeout: 30000 });
  };
  await see("Entraînement · question 1 sur 2");
  await record(1); await shot("06-choix");
  await p.getByText("Lire mon retour").first().click(); await p.waitForTimeout(500);
  await click("Une question sur ce retour ? Demandez à l'assistant");
  await p.getByRole("button", { name: "Je parle trop vite, que faire ?" }).click(); await see(/120 à 160 mots/);
  await shot("06b-rapport-q1");
  await click("Question suivante (2 sur 2)");
  await see("Entraînement · question 2 sur 2"); await see("« Pourquoi avez-vous quitté votre dernier emploi ? »");
  await record(2);
  await p.getByText("Me revoir en vidéo").first().click(); await p.waitForTimeout(800); await shot("07-rapport-video");
  await see("C'était la dernière question de votre sélection");
  await p.locator("[title*='Exemples concrets']").first().click().catch(() => {});
  await click("Envoyer à mon coach");
  await p.locator("textarea").fill("Je parle peut-être trop vite ?"); await click("Envoyer à mon coach"); await shot("08-envoye");
  await click("Mes paramètres"); await p.getByRole("menuitem", { name: "Se déconnecter" }).waitFor(); await shot("08b-mes-parametres");
  await p.getByRole("menuitem", { name: "Se déconnecter" }).click(); await click("Mon espace"); await click("Se connecter"); await p.waitForTimeout(300); await shot("09-liste-conseiller");
  await click("Relire"); await click("Relire et annoter"); await p.waitForTimeout(800);
  await p.getByPlaceholder(/Mettez la vidéo en pause/).fill("Belle entrée en matière."); await click("Ajouter");
  await p.locator("textarea").fill("Alex, ta présentation est claire. On en parle jeudi.");
  await p.getByPlaceholder("Votre remarque sur ce repère (facultatif)").first().fill("D'accord, garde ce rythme.");
  await shot("10-relecture-conseiller");
  await click("Envoyer le rapport"); await shot("11-rapport-envoye");
  await p.goto(`http://localhost:5098/#/s/${code}`); await p.waitForTimeout(500); await shot("12-espace-benef");
  await click("Ouvrir"); await p.getByText("Lire mon retour").first().click(); await p.waitForTimeout(500); await shot("13-rapport-final");
  console.log("erreurs:", errors.filter(e => !/fonts.googleapis|jsdelivr|googleapis|Failed to load resource|ERR_TUNNEL/.test(e)));
  if (overflow.length) { console.error("débordement horizontal:", overflow); process.exitCode = 1; }
  await b.close();
})().catch(e => { console.error("ECHEC", e.message); process.exit(1); });
