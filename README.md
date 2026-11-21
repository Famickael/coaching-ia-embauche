# La Répét' · coaching IA à l'entretien d'embauche

Prototype fonctionnel d'un dispositif d'entraînement à l'entretien d'embauche, assisté par une IA puis par un coach. Il a été conçu pour les prestations d'accompagnement vers l'emploi qui préparent aux entretiens et à la présentation de soi.

Le principe : le coach crée un parcours et transmet un code (ou un lien). La personne accompagnée s'entraîne seule, chez elle, autant de fois qu'elle le souhaite. Elle reçoit un retour qui **décrit sans noter**, choisit de se revoir en vidéo ou de lire un rapport écrit, puis décide d'envoyer sa prise au coach. Le coach annote des moments précis de la vidéo, commente les observations de l'assistant et renvoie un rapport, qui sert de base au débriefing en atelier.

> L'emplacement du logo de l'organisme qui déploie l'outil (marque blanche) affiche pour l'instant « Famickael » dans un cadre en pointillés : `OrgLogo` dans `src/ui.jsx`. Renseigner `ORG_LOGO_URL` pour afficher une image à la place.

---

## Essayer

| Expérience | Lien | Accès |
|---|---|---|
| **Côté bénéficiaire** | https://famickael.github.io/la-repet/#/s/REPETE | code d'essai **`REPETE`**, déjà rempli dans le lien |
| **Côté coach** | https://famickael.github.io/la-repet/#/espace | connexion de démonstration intégrée à « Mon espace », identifiants fictifs pré-remplis (« Sophie M. », `sophie.m@exemple.fr`) |

Pour voir la boucle complète, ouvre les deux liens **dans le même navigateur** (deux onglets) : enregistre une prise côté bénéficiaire et envoie-la, elle apparaît « À relire » côté coach ; annote-la et envoie le rapport, il apparaît dans l'espace bénéficiaire. Le code `REPETE` est aussi pré-rempli dans la page « Mon espace ».

Le parcours d'essai (prénom « Camille », poste « agent d'accueil ») est créé quand le code `REPETE` est saisi ou ouvert par lien (rien n'est écrit sur l'appareil avant), et recréé s'il est supprimé (`TRIAL_CODE` dans `src/lib/store.js`). Il ne contient aucune réponse fictive. À retirer en production, avec la connexion coach de démonstration (`TRIAL_LOGIN` dans `src/lib/store.js`, `Espace` dans `src/App.jsx`) : aucune vérification n'est faite, les identifiants servent uniquement à projeter l'usage.

---

## Démarrage

```bash
npm install          # le fichier .npmrc désactive les scripts postinstall (inutiles côté navigateur)
npm run dev          # http://localhost:5173
npm run build        # production dans dist/ (chemins relatifs, déployable sur un hébergement statique)
```

Publication : le workflow `.github/workflows/pages.yml` construit et publie le site sur GitHub Pages à chaque envoi sur `main` (réglage du dépôt : Pages, source « GitHub Actions »). Adresse : https://famickael.github.io/la-repet/. Si le site affiche une page blanche, vérifier ce réglage : avec la source « Deploy from a branch », GitHub publie les fichiers sources bruts (`index.html` pointe alors vers `/src/main.jsx`, introuvable) à la place de la version construite. GitHub Pages ne permet pas d'activer l'isolation inter-origines (en-têtes COOP/COEP) : Whisper y tourne sur un seul cœur, ou sur WebGPU quand le navigateur le propose.

Parcours de prise en main :

1. **Mon espace** puis « Accéder à l'espace coach » (ou lien `#/coach`) : se connecter, puis « Nouveau parcours ». Un code de 6 caractères et un lien `…/#/s/CODE` sont générés.
2. Ouvrir le lien (ou **Mon espace** puis saisir le code) : consentement, espace personnel, échauffement facultatif, choix d'une question, enregistrement, analyse, rapport, envoi.
3. Retour à l'espace coach (**Changer** dans l'en-tête) : la prise apparaît « À relire ». Relecture, notes horodatées, commentaires, envoi du rapport.
4. Côté bénéficiaire, le rapport est visible dans l'espace, avec le même code.

**Important, mode local :** toutes les données sont stockées dans le navigateur (voir « Architecture »). Le coach et le bénéficiaire doivent donc utiliser le **même navigateur sur le même appareil** pour que la boucle fonctionne (par exemple deux onglets, synchronisés automatiquement). Un backend est nécessaire pour un usage réel à distance : voir « Passage en production ».

Au premier enregistrement analysé, le navigateur télécharge le modèle de transcription Whisper (environ 80 Mo, mis en cache ensuite) depuis Hugging Face, le moteur MediaPipe 1.2.3 et ONNX Runtime depuis jsDelivr, et le modèle de suivi du visage MediaPipe (environ 4 Mo, version « float16/1 ») depuis Google. La vidéo et la voix ne sont pas envoyées, mais comme pour tout site, ces serveurs voient l'adresse IP de l'appareil : c'est dit dans « Vos données » (`#/vos-donnees/appareil`). Les versions sont figées (plus de `@latest`) ; la révision de Whisper se fige avec `VITE_WHISPER_REVISION`. En production, ces fichiers doivent être auto-hébergés (variables `VITE_MODELS_BASE_URL`, `VITE_MEDIAPIPE_WASM`, `VITE_FACE_MODEL`, `VITE_SEGMENTER_MODEL`). Les polices sont auto-hébergées dans `public/fonts/` (licence OFL, `LICENCES.txt`) : aucun appel à Google Fonts.

---

## Contenu et images du site

- **Ressources** : un article est un fichier `src/content/resources/<slug>.md` (en-tête puis Markdown simple). Deux gabarits selon le champ `type` : `guide` (article de blog avec sommaire) et `cas` (scénario d'usage avec faits clés, toujours fictif et sans résultat chiffré). Format complet, règles éditoriales et sujets à écrire : [`docs/briefs/chatgpt-ressources.md`](docs/briefs/chatgpt-ressources.md).
- **Images** : chemins, dimensions, consignes et textes alternatifs de chaque image : [`docs/briefs/chatgpt-images.md`](docs/briefs/chatgpt-images.md). Déposer un fichier sous le même nom suffit à remplacer une image provisoire.

### Crédits photos

Photos provisoires issues d'[Unsplash](https://unsplash.com), utilisées sous la [licence Unsplash](https://unsplash.com/license) (usage gratuit, attribution non obligatoire mais faite ici), recadrées et converties en WebP :

| Fichier (`public/img/`) | Auteur | Photo |
|---|---|---|
| `recruteuse.webp` | Vitaly Gariev | https://unsplash.com/photos/Hl1HIQ0fmQk |
| `entrainement.webp`, `ressources/premiere-repetition-pas-a-pas.webp` | Ewan Buck | https://unsplash.com/photos/13vSUuXFnwA |
| `coach.webp`, `ressources/relire-une-prise-et-preparer-le-debriefing.webp` | Vitaly Gariev | https://unsplash.com/photos/qnm5RTmMasE |
| `a-propos.webp` | Christina @ wocintechchat.com | https://unsplash.com/photos/eF7HN40WbAQ |
| `solutions-equipe.webp` | Christina @ wocintechchat.com | https://unsplash.com/photos/LQ1t-8Ms5PY |
| `ressources/se-presenter-en-deux-minutes.webp` | Brooke Cagle | https://unsplash.com/photos/JBwcenOuRCg |
| `ressources/parler-de-ses-experiences-methode-sar.webp` | Vitaly Gariev | https://unsplash.com/photos/E3TJIo5E9Gg |
| `ressources/questions-frequentes-des-recruteurs.webp` | Vitaly Gariev | https://unsplash.com/photos/pg2eJwNVpvY |
| `ressources/questions-a-poser-et-questions-interdites.webp` | Mina Rad | https://unsplash.com/photos/-P7kHROe-6A |
| `ressources/reussir-un-entretien-en-visio.webp` | Vitaly Gariev | https://unsplash.com/photos/DHrmBvaey5g |

Les photos suivantes proviennent de Pexels et sont utilisées sous la [licence Pexels](https://www.pexels.com/license/). Elles ont été recadrées et converties en WebP.

| Fichier (`public/img/`) | Photographe | Photo |
|---|---|---|
| `categories/preparer.webp` | Mikhail Nilov | [Pexels](https://www.pexels.com/photo/a-man-writing-on-a-notebook-while-studying-7594201/) |
| `categories/questions.webp` | cottonbro studio | [Pexels](https://www.pexels.com/photo/woman-getting-a-job-interview-5989931/) |
| `categories/visio.webp` | Julia M Cameron | [Pexels](https://www.pexels.com/photo/person-writing-on-notebook-4145190/) |
| `categories/guides.webp` | Mizuno K | [Pexels](https://www.pexels.com/photo/woman-using-a-smart-phone-fixed-on-a-tripod-13929354/) |
| `categories/coachs.webp` | Anna Shvets | [Pexels](https://www.pexels.com/photo/person-writing-on-a-notebook-4226208/) |
| `categories/organismes.webp` | fauxels | [Pexels](https://www.pexels.com/photo/photo-of-people-sitting-near-wooden-table-3182764/) |
| `ressources/deployer-la-repet-dans-votre-organisme.webp` | Arina Krasnikova | [Pexels](https://www.pexels.com/photo/two-women-talking-at-an-office-desk-6016370/) |
| `ressources/gerer-le-trac-et-preparer-sa-venue.webp` | Ketut Subiyanto | [Pexels](https://www.pexels.com/photo/faceless-businessman-with-smartphone-walking-on-crosswalk-in-sunlight-4560165/) |
| `ressources/scenario-accompagnement-a-distance.webp` | Annushka Ahuja | [Pexels](https://www.pexels.com/photo/a-girl-having-video-call-on-her-laptop-on-a-table-8055483/) |
| `ressources/scenario-atelier-collectif.webp` | Alena Shekhovtcova | [Pexels](https://www.pexels.com/photo/women-talking-on-a-meeting-in-an-office-8067880/) |

---

## Ce qui est fonctionnel

| Fonction | Implémentation |
|---|---|
| Accès sans compte par code ou lien | `store.createParcours` génère un code aléatoire (alphabet sans caractères ambigus) ; route `#/s/CODE` dans `App.jsx` |
| Consentement granulaire, tracé et retirable | écran `Consent` (`Beneficiary.jsx`) ; `withdrawConsent` supprime prises et vidéos |
| Échauffement ni enregistré ni analysé | `Warmup` (`Beneficiary.jsx`) et `WarmupStage.jsx` : aperçu en direct sans `MediaRecorder`, une phrase à la fois tirée au hasard (`WARMUP_PHRASES`, relances `WARMUP_PROMPTS`), astuces, questionnaire de fin gardé sur l'appareil (`saveWarmupDebrief`, clé séparée) |
| Fond flou ou couleur unie pendant l'échauffement, en local | `src/lib/background.js` (MediaPipe Image Segmenter, modèle selfie segmenter, rendu sur canvas) ; option désactivée si le modèle ne charge pas |
| Choix du métier visé avec autocomplétion | `JobField` (combobox accessible) et `src/lib/jobs.js` (environ 150 métiers, recherche sans accents), saisie libre ; met à jour `poste` du parcours |
| Assistant de préparation d'entretien en panneau latéral (bouton flottant, bulle d'invitation ; questions sur le site : renvoi vers la FAQ) | `src/Assistant.jsx` et `src/lib/assistant.js` : moteur local (53 sujets, relances « un exemple ? », « pourquoi ? », « et pour… ? ») ou modèle de langage via `VITE_LLM_ENDPOINT`, sortie filtrée par `isCompliant()` |
| Entraînement complet : simulation d'entretien dans l'ordre réel (accueil, présentation, motivation, expériences, qualités et axes de progrès, mise en situation selon le métier, question au recruteur), puis récapitulatif sans score | `fullInterview`, `situationFor` (`src/lib/questions.js`), vue `recap` (`Beneficiary.jsx`) |
| Recruteur oral sans visage : question lue par la synthèse vocale française de l'appareil, sous-titre mot à mot, « Réécouter », « Couper le son » ; repli silencieux sans voix française | `src/RecruiterVoice.jsx` |
| Sélection de plusieurs questions, contextualisées par le poste visé, et ajout de questions personnelles | `Pick` puis enchaînement question par question (`ctx.queue`), « Question suivante (2/N) », arrêt possible ; `src/lib/questions.js` |
| Enregistrement caméra + micro, ou micro seul | `Recorder.jsx` : `getUserMedia` + `MediaRecorder` (webm, mp4 sur Safari), 3 min maximum, relecture avant validation |
| Transcription horodatée **dans le navigateur** | `src/lib/whisper.worker.js` (transformers.js, Whisper base, WebGPU si disponible, sinon WASM), ou service serveur via `VITE_STT_ENDPOINT` |
| Suivi du regard et de la présence dans le cadre, en local | `src/lib/gaze.js` (MediaPipe Face Landmarker, 2 images par seconde) |
| Retour descriptif, sans note ni inférence émotionnelle | `src/lib/analysis.js` : débit, pauses, exemples concrets, mots d'appui, structure, vocabulaire, regard |
| Reformulation facultative par un modèle de langage | `analyze()` via `VITE_LLM_ENDPOINT`, sortie filtrée par `isCompliant()`, repli sur l'analyse locale |
| Choix rapport écrit ou relecture vidéo | `Choose`, `ReportBody` (`Report.jsx`) |
| Repères cliquables sur la barre de lecture (repère ↔ moment) | `Player` (`Report.jsx`) |
| Partage volontaire prise par prise, avec un mot au coach | `Share` |
| Relecture coach : notes horodatées, commentaires par observation, mot d'introduction, brouillon automatique | `Review` (`Counselor.jsx`) |
| « Mon compte » : vers « Mon espace » sans session ; panneau latéral du compte une fois connecté | `AccountMenu` (`App.jsx`) |
| Rapport final IA + coach, renvoyable après modification | `take.report` |
| Réentraînement illimité, y compris après le rapport | espace bénéficiaire |
| Suppression d'une prise, d'un parcours, de toutes ses données | `deleteTake`, `deleteParcours`, `withdrawConsent` |
| Indicateurs agrégés non stigmatisants | `List` (`Counselor.jsx`) : prises à relire, parcours, rapports, taux de réentraînement, délai moyen de relecture |
| Impression ou export PDF du rapport | `window.print()` + feuille de style d'impression (`GStyle`) |
| Information sur les données en trois niveaux (phrase, résumé, page), pages « Vos données », conditions, mentions légales, déclaration d'accessibilité | `src/content/legal.js` (textes), `src/content/organisme.js` (valeurs d'exemple explicites, à remplacer par l'organisme), `src/Legal.jsx` (pages et fenêtre de résumé) ; audit dans `docs/conformite.md` |

---

## Architecture

```
index.html
src/
  main.jsx            point d'entrée React
  App.jsx             routage par ancre, en-tête (menu repliable sous 1024 px, barre de progression de lecture), page « Mon espace », pied de page
                      routes : #/, #/a-propos(/faq), #/solutions(/beneficiaires|coachs|organismes), #/ressources, #/ressources/c/CATEGORIE,
                      #/ressources/SLUG, #/demo, #/espace, #/s/CODE, #/coach, #/vos-donnees(/video|assistant|droits|appareil|notice|coachs),
                      #/conditions, #/mentions-legales, #/accessibilite, #/a-propos/ia-et-recherche ; #/fonctionnement redirige vers #/solutions
  Home.jsx            accueil : héros (accroche qui change, scènes photo + interface en boucle), phrase qui se colore au défilement,
                      strate épinglée « un seul dispositif » en quatre temps, cartes animées, parti pris, portes d'entrée, bandeau final
  About.jsx           « À propos » : mission, pourquoi, parti pris, cadre réglementaire, pour qui, construction, FAQ en accordéons
  Solutions.jsx       « Solutions » (ancienne page Fonctionnement) : déroulé, par public, ce que l'assistant observe ou non, onglets organisme, garanties
  Resources.jsx       centre de ressources : hub (catégories, à la une, recherche, filtre, glossaire), liste par catégorie, article (gabarits guide et cas)
  Demo.jsx            « Demander une prise en main » (personnes accompagnées) : formulaire, confirmation, mailto: si VITE_CONTACT_EMAIL est défini
  Research.jsx        « L'IA et la recherche » : ce que fait l'IA, ce qu'elle ne fait pas, études citées avec leurs liens
  A11y.jsx            options d'accessibilité (fenêtre de réglages, règle de lecture) ; lib/a11y.js : lecture, enregistrement, application
  RecruiterVoice.jsx  recruteur oral sans visage (synthèse vocale de l'appareil, sous-titre mot à mot)
  Loader.jsx          retrait de l'écran de chargement (balisage et styles en ligne dans index.html)
  content/
    resources.js      catégories, chargement des articles Markdown (import.meta.glob), lecture de l'en-tête, découpage en blocs
    resources/*.md    articles du centre de ressources (un fichier par article)
  motion.jsx          apparition au défilement (IntersectionObserver), compteur, respect de « réduire les animations »
  tokens.js           jetons du référentiel v3 (couleurs, typographie, espacements, rayons, ombres, mouvement, contrastes)
  ui.jsx              composants de base (réexporte les jetons) : logos, Txt, Btn, Card, Tag, Notice, Modal, champs, Rail, GradHead, styles globaux
  Legal.jsx           pages « Vos données » (#/vos-donnees/...), conditions, mentions légales, accessibilité ; fenêtre de résumé (niveau 2)
  content/legal.js    fonds unique des textes d'information : phrases, résumés, textes complets (variantes prototype et production)
  content/organisme.js  SEUL fichier à compléter par l'organisme : responsable, DPO, hébergeur, durées, base légale (valeurs d'exemple affichées, domaines exemple.fr et example.org ; null = formulation neutre)
  Beneficiary.jsx     espace bénéficiaire : code, consentement, espace, échauffement, question, enregistrement, traitement, rapport, partage
  Counselor.jsx       espace coach : identification locale, liste et indicateurs, création de parcours, détail, relecture
  Recorder.jsx        enregistreur caméra/micro + déclenchement du suivi du regard
  WarmupStage.jsx     aperçu de l'échauffement (caméra ou voix seule, fond), sans enregistrement
  Assistant.jsx       assistant de préparation (fil de conversation) et panneau latéral commun DockPanel
  Report.jsx          lecteur avec repères, cartes d'observation, corps du rapport (partagé par les deux espaces)
  lib/
    store.js          données : localStorage (« larepet.v1 ») pour les métadonnées, IndexedDB (« larepet ») pour les vidéos
    analysis.js       analyse descriptive locale, garde-fou de conformité, reformulation LLM facultative
    transcribe.js     décodage audio 16 kHz + transcription locale (worker) ou serveur
    whisper.worker.js Whisper dans un Web Worker
    gaze.js           MediaPipe Face Landmarker (présence, orientation de la tête, direction des yeux)
    questions.js      banque de questions, phrases et relances d'échauffement, sujets du questionnaire de fin
    jobs.js           liste des métiers et recherche pour l'autocomplétion
    assistant.js      assistant : base de connaissances locale, relances, appel facultatif au modèle de langage
    background.js     fond flou ou uni pendant l'échauffement (MediaPipe Image Segmenter)
public/img/            photos et visuels (voir « Crédits photos » et docs/briefs/chatgpt-images.md)
docs/
  design-system.md    référentiel UI/UX
  briefs/             briefs pour ChatGPT : articles (chatgpt-ressources.md) et images (chatgpt-images.md)
tests/
  run-site-e2e.mjs, site.e2e.cjs   balayage responsive (11 largeurs, 320 × 568, 844 × 390, menu ouvert, connecté), pages publiques à 1280 et 390 px, mouvement réduit (npm run test:site)
  analysis.test.mjs   test unitaire de l'analyse et du garde-fou (npm run test:analysis)
  run-e2e.mjs         test de bout en bout Playwright avec caméra et transcription simulées (npm run test:e2e)
  e2e.cjs, mock-stt.mjs
```

### Modèle de données (`src/lib/store.js`)

```
state = {
  counselor: { name, since },
  parcours: { [code]: { code, prenom, poste, warmup, counselor, createdAt, openedAt, warmupDone,
                        consent: { at, local, ai } | null } },
  takes:    { [id]:   { id, code, question, duration, transcript, segments: [{start,end,text}],
                        gaze, analysis: { synthese, dimensions: [{id,titre,type,observation,conseil,t}], metrics, source },
                        hasVideo, mime, createdAt, shared, sharedAt, note,
                        draft:  { intro, comments, notes } | null,               // brouillon coach
                        report: { intro, comments: {dimId: texte}, notes: [{id,t,text}], sentAt, by } | null } }
}
```

États d'une prise : sur l'appareil → envoyée (`shared`) → annotée (`draft`) → rapport envoyé (`report`) → supprimée.

### Configuration (`.env.example`)

Toutes les variables sont facultatives. Sans elles, l'application fonctionne entièrement dans le navigateur.

| Variable | Rôle |
|---|---|
| `VITE_STT_ENDPOINT`, `VITE_STT_MODEL` | transcription serveur, format OpenAI `audio/transcriptions` (`verbose_json`, segments), par exemple un proxy vers un modèle hébergé en France |
| `VITE_WHISPER_MODEL`, `VITE_MODELS_BASE_URL` | modèle Whisper local et hébergement des modèles |
| `VITE_LLM_ENDPOINT`, `VITE_LLM_MODEL` | reformulation par un modèle de langage via un proxy compatible « chat completions » ; la clé reste côté serveur |
| `VITE_MEDIAPIPE_WASM`, `VITE_FACE_MODEL`, `VITE_SEGMENTER_MODEL` | fichiers MediaPipe auto-hébergés (suivi du visage, détourage pour le fond de l'échauffement) |

---

## Règles de conception à respecter (non négociables)

Ces règles traduisent le cadre réglementaire (AI Act, RGPD) et les partis pris pédagogiques du projet. Toute évolution doit les préserver.

1. **Aucune inférence d'émotion ni de trait de personnalité** (article 5(1)(f) du Règlement (UE) 2024/1689, applicable depuis le 2 février 2025). `gaze.js` ne lit que les coefficients `eyeLook*` et la position des repères du visage, jamais les coefficients d'expression. `analysis.js` filtre tout retour contenant un vocabulaire émotionnel (`FORBIDDEN`) ou une note (`isCompliant`).
2. **Décrire, jamais noter.** Pas de score, de note, de classement ni de jauge de performance.
3. **Points d'appui avant points à explorer**, formulation positive, repères présentés comme des conventions de secteur.
4. **La vidéo reste sur l'appareil** tant que la personne ne décide pas de l'envoyer, prise par prise. Seul du texte peut partir vers un modèle de langage.
5. **Supervision humaine** : rien n'arrive au bénéficiaire de la part du coach sans envoi explicite ; le coach peut nuancer ou contredire l'assistant.
6. **Choix du mode de restitution** (rapport écrit ou vidéo) et **échauffement sans analyse**.
7. **Indicateurs agrégés uniquement**, aucune mesure de performance individuelle (ni bénéficiaire, ni coach).
8. **Minimisation** : prénom et initiale, poste visé ; aucun identifiant administratif ni adresse électronique.

Référentiel UI/UX complet (couleurs, typographie, espacements, composants) : `docs/design-system.md`, source unique de vérité. Les jetons sont dans `src/tokens.js`, les composants dans `src/ui.jsx` ; `npm run test:design` vérifie automatiquement le respect du référentiel.

---

## Passage en production (travail restant)

Par ordre de priorité :

1. **Backend et stockage serveur.** Remplacer `src/lib/store.js` par une API (mêmes signatures : `createParcours`, `findParcours`, `createTake`, `updateTake`, `deleteTake`, `withdrawConsent`, `loadVideoUrl`…). Hébergement en France, chiffrement au repos et en transit. La vidéo ne doit être téléversée qu'au moment de `Share` (aujourd'hui `updateTake(..., { shared: true })`) ; avant, elle reste en IndexedDB sur l'appareil.
2. **Authentification forte des coachs** (aujourd'hui `Identify` enregistre un simple nom), cloisonnement par site et par coach, rôles référent et administrateur.
3. **Expiration et révocation des codes**, limitation des tentatives de saisie.
4. **Durées de conservation et purge automatique**, journalisation des accès.
5. **Auto-hébergement des modèles** (Whisper, MediaPipe) et, si besoin, proxy serveur pour la transcription et la reformulation (modèles hébergés en France).
6. **Validation des seuils** de `analysis.js` (débit, pauses, mots d'appui) et de `gaze.js` (seuils `down` et `side`) sur des prises réelles, puis **audit de biais** sur des profils représentatifs (âge, genre, accent, quartiers prioritaires, primo-arrivants).
7. **Accessibilité** : audit RGAA 4.1.2 complet, consignes en FALC, test au lecteur d'écran.
8. **Analyse d'impact (AIPD), obligatoire**, note de qualification AI Act, remplacer les valeurs d'exemple de `src/content/organisme.js` et faire valider les textes de `src/content/legal.js` par le juridique et le DPO ; formation des coachs. Détail et priorités : `docs/conformite.md`. Avec `VITE_BACKEND_URL`, les textes passent en variante « production ».

Limites connues :
- la qualité de transcription de Whisper base en français est correcte mais imparfaite sur les prises courtes ou bruitées ; `whisper-small` est meilleur mais plus lourd ;
- le suivi du regard dépend de la lumière et de la position de la caméra ; il est désactivé en mode « son seulement » ;
- Safari enregistre en mp4 ; le décodage audio pour Whisper repose sur `decodeAudioData`.

---

## Tests

```bash
npm run test:analysis                                   # analyse et garde-fou, sans navigateur
node tests/assistant.test.mjs                           # assistant local : conformité de toutes les réponses, relances
npm run test:design                                     # référentiel UI/UX : couleurs, typographie, espacements, composants (bloquant)
npx playwright install chromium && npm run test:e2e     # parcours complet dans Chromium
# ou, avec un Chromium déjà installé : CHROMIUM_PATH=/chemin/vers/chromium npm run test:e2e
E2E_VIEWPORT=390x844 npm run test:e2e                 # même parcours en taille téléphone, échoue si une page déborde en largeur
npm run test:site                                       # pages publiques : navigation, menu mobile, strate, FAQ, ressources, démo
```

`test:site` construit le site dans `node_modules/.cache/site-dist`, balaie d'abord 11 largeurs (320 à 1280 px) plus 320 × 568 et 844 × 390 en paysage, déconnecté puis connecté, menu mobile ouvert (débordement, chevauchement dans l'en-tête, fermeture visible, page bloquée et inerte derrière le menu, panneau « Mon compte » dans l'écran), puis visite toutes les pages publiques à 1280 et 390 px et avec « réduire les animations », et échoue en cas d'erreur JavaScript, de débordement horizontal ou d'élément attendu absent. Captures dans `tests/screenshots/site/`.

Le test de bout en bout construit l'application avec un service de transcription simulé (`tests/mock-stt.mjs`), utilise la caméra et le micro simulés de Chromium, rejoue la boucle complète (création du parcours, consentement, choix du métier, échauffement avec phrase aléatoire, assistant et questionnaire de fin, sélection de deux questions dont une personnelle, enregistrement des deux réponses à la suite, analyse, rapport vidéo, envoi, relecture et annotation, envoi du rapport, lecture du rapport final) et enregistre des captures dans `tests/screenshots/`.

---

## Reprise du travail avec Claude Code

Contexte utile pour reprendre ce dépôt :

- **Origine.** Prototype conçu en plusieurs itérations (octobre et novembre 2026) : d'abord un fichier React unique destiné à une démonstration, puis cette version modulaire et fonctionnelle. Deux documents de cadrage, hors dépôt, l'accompagnent : un cadre AI Act, architecture et DPIA, et un cadre psychosociologique (partis pris, points de vigilance) ; ainsi qu'un cahier des charges fonctionnel (exigences EF-01 à EF-42 et ENF-01 à ENF-20, classées indispensable ou souhaitable) et un benchmark de marché qui conclut à une construction interne plutôt qu'à l'achat d'une solution.
- **Ce qui a été vérifié.** Compilation (`npm run build`), test unitaire de l'analyse, test de bout en bout complet dans Chromium avec caméra simulée et transcription simulée.
- **Ce qui n'a pas pu être vérifié.** Le téléchargement et l'exécution réels de Whisper et de MediaPipe (réseau de l'environnement de développement restreint) : à tester en premier dans un vrai navigateur, avec une vraie caméra et un vrai micro (`npm run dev`, puis un parcours complet).
- **Affichage mobile.** Les styles en ligne ne gèrent pas les media queries : l'adaptation au téléphone passe par des classes `rp-*` définies dans `GStyle` (`ui.jsx`, sous 760 px), qui surchargent les styles en ligne.
- **Où intervenir.** Logique métier dans `src/lib/`, écrans dans `Beneficiary.jsx` et `Counselor.jsx`, composants visuels dans `ui.jsx`. Les styles sont écrits en ligne avec les jetons de `src/tokens.js` (`T`, `TY`, `PAD`, `GAP`, `W`, `RAD`, `SH`, `MO`), réexportés par `ui.jsx` ; conserver ce système plutôt que d'introduire une autre bibliothèque, et passer `npm run test:design`.
- **Langue et ton.** Interface en français, vouvoiement côté bénéficiaire, ton positif et non évaluatif (« vous pouvez renforcer… » plutôt que « insuffisant »). Pas de tiret cadratin dans les textes d'interface.
- **Prochaine étape suggérée.** Point 1 de « Passage en production » : un backend minimal (par exemple Supabase ou une API Node hébergée en France) branché derrière les fonctions de `store.js`, sans changer les écrans.
