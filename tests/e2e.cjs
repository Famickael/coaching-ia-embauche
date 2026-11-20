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
  await click("Accéder à l'espace coach");
  await shot("01e-connexion-coach"); await click("Se connecter");
  await click("Nouveau parcours");
  await p.getByPlaceholder("Prénom et initiale").fill("Alex D."); await p.getByPlaceholder(/agent d'accueil/).fill("agent d'accueil");
  await click("Générer le code"); await shot("02-code");
  const code = (await p.locator("text=/^[A-Z2-9]{6}$/").first().textContent()).trim(); console.log("code", code);
  await click("Ouvrir l'espace bénéficiaire sur cet appareil");
  await p.getByRole("checkbox").first().click(); await shot("03-consentement");
  await click("Je consens et je commence");
  await click("Nouvel entraînement");
  await p.getByText("Pouvez-vous vous présenter en deux minutes ?").click();
  await click("Activer la caméra"); await p.waitForTimeout(800);
  await click("Démarrer l'enregistrement"); await p.waitForTimeout(4500); await shot("04-enregistrement");
  await click("■ Arrêter"); await p.waitForTimeout(800); await shot("05-relecture-prise");
  await click("Voir mon retour");
  await p.getByText("Comment préférez-vous le découvrir ?").waitFor({ timeout: 30000 }); await shot("06-choix");
  await p.getByText("Revoir ma prise").first().click(); await p.waitForTimeout(800); await shot("07-rapport-video");
  await p.locator("[title*='Exemples concrets']").first().click().catch(() => {});
  await click("Envoyer à mon coach");
  await p.locator("textarea").fill("Je parle peut-être trop vite ?"); await click("Envoyer"); await shot("08-envoye");
  await click("Se déconnecter"); await click("Mon espace"); await click("Accéder à l'espace coach"); await p.waitForTimeout(300); await shot("09-liste-conseiller");
  await click("Relire"); await click("Relire et annoter"); await p.waitForTimeout(800);
  await p.getByPlaceholder(/Mettez la vidéo en pause/).fill("Belle entrée en matière."); await click("Ajouter");
  await p.locator("textarea").fill("Alex, ta présentation est claire. On en parle jeudi.");
  await p.getByPlaceholder("Votre remarque sur cette observation (facultatif)").first().fill("D'accord, garde ce rythme.");
  await shot("10-relecture-conseiller");
  await click("Envoyer le rapport"); await shot("11-rapport-envoye");
  await p.goto(`http://localhost:5098/#/s/${code}`); await p.waitForTimeout(500); await shot("12-espace-benef");
  await click("Ouvrir"); await p.getByText("Un rapport écrit").first().click(); await p.waitForTimeout(500); await shot("13-rapport-final");
  console.log("erreurs:", errors.filter(e => !/fonts.googleapis|jsdelivr|googleapis|Failed to load resource|ERR_TUNNEL/.test(e)));
  if (overflow.length) { console.error("débordement horizontal:", overflow); process.exitCode = 1; }
  await b.close();
})().catch(e => { console.error("ECHEC", e.message); process.exit(1); });
