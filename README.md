# La Répét' · coaching IA à l'entretien d'embauche

Prototype fonctionnel d'un dispositif d'entraînement à l'entretien d'embauche, assisté par une IA puis par un conseiller. Il a été conçu pour une prestation d'accompagnement vers l'emploi de type « Valoriser son image pro » (France Travail).

Le principe : le conseiller crée un parcours et transmet un code (ou un lien). La personne accompagnée s'entraîne seule, chez elle, autant de fois qu'elle le souhaite. Elle reçoit un retour qui **décrit sans noter**, choisit de se revoir en vidéo ou de lire un rapport écrit, puis décide d'envoyer sa prise au conseiller. Le conseiller annote des moments précis de la vidéo, commente les observations de l'assistant et renvoie un rapport, qui sert de base au débriefing en atelier.

> Le logo de l'organisme partenaire est un **logo fictif** (« Votre organisme », marque blanche), défini dans `src/ui.jsx` (`TSMark`, `TSLogo`).

---

## Démarrage

```bash
npm install          # le fichier .npmrc désactive les scripts postinstall (inutiles côté navigateur)
npm run dev          # http://localhost:5173
npm run build        # production dans dist/ (chemins relatifs, déployable sur un hébergement statique)
```

Publication : le workflow `.github/workflows/pages.yml` construit et publie le site sur GitHub Pages à chaque envoi sur `main` (réglage du dépôt : Pages, source « GitHub Actions »). Adresse : https://famickael.github.io/coaching-ia-embauche/. GitHub Pages ne permet pas d'activer l'isolation inter-origines (en-têtes COOP/COEP) : Whisper y tourne sur un seul cœur, ou sur WebGPU quand le navigateur le propose.

Parcours de prise en main :

1. Onglet **Conseiller** : saisir son nom, puis « Nouveau parcours ». Un code de 6 caractères et un lien `…/#/s/CODE` sont générés.
2. Ouvrir le lien (ou onglet **Bénéficiaire** puis saisir le code) : consentement, espace personnel, échauffement facultatif, choix d'une question, enregistrement, analyse, rapport, envoi.
3. Retour onglet **Conseiller** : la prise apparaît « À relire ». Relecture, notes horodatées, commentaires, envoi du rapport.
4. Côté bénéficiaire, le rapport est visible dans l'espace, avec le même code.

**Important, mode local :** toutes les données sont stockées dans le navigateur (voir « Architecture »). Le conseiller et le bénéficiaire doivent donc utiliser le **même navigateur sur le même appareil** pour que la boucle fonctionne (par exemple deux onglets, synchronisés automatiquement). Un backend est nécessaire pour un usage réel à distance : voir « Passage en production ».

Au premier enregistrement analysé, le navigateur télécharge le modèle de transcription Whisper (environ 80 Mo, mis en cache ensuite) depuis Hugging Face, et le modèle de suivi du visage MediaPipe (environ 4 Mo) depuis Google. Aucune donnée personnelle n'est envoyée lors de ces téléchargements. En production, ces fichiers doivent être auto-hébergés (variables `VITE_MODELS_BASE_URL`, `VITE_MEDIAPIPE_WASM`, `VITE_FACE_MODEL`).

---

## Ce qui est fonctionnel

| Fonction | Implémentation |
|---|---|
| Accès sans compte par code ou lien | `store.createParcours` génère un code aléatoire (alphabet sans caractères ambigus) ; route `#/s/CODE` dans `App.jsx` |
| Consentement granulaire, tracé et retirable | écran `Consent` (`Beneficiary.jsx`) ; `withdrawConsent` supprime prises et vidéos |
| Échauffement sans analyse ni conservation | `Warmup` : la prise n'est jamais enregistrée |
| Questions contextualisées par le poste visé, ou question libre | `src/lib/questions.js` |
| Enregistrement caméra + micro, ou micro seul | `Recorder.jsx` : `getUserMedia` + `MediaRecorder` (webm, mp4 sur Safari), 3 min maximum, relecture avant validation |
| Transcription horodatée **dans le navigateur** | `src/lib/whisper.worker.js` (transformers.js, Whisper base, WebGPU si disponible, sinon WASM), ou service serveur via `VITE_STT_ENDPOINT` |
| Suivi du regard et de la présence dans le cadre, en local | `src/lib/gaze.js` (MediaPipe Face Landmarker, 2 images par seconde) |
| Retour descriptif, sans note ni inférence émotionnelle | `src/lib/analysis.js` : débit, pauses, exemples concrets, mots d'appui, structure, vocabulaire, regard |
| Reformulation facultative par un modèle de langage | `analyze()` via `VITE_LLM_ENDPOINT`, sortie filtrée par `isCompliant()`, repli sur l'analyse locale |
| Choix rapport écrit ou relecture vidéo | `Choose`, `ReportBody` (`Report.jsx`) |
| Repères cliquables sur la barre de lecture (repère ↔ moment) | `Player` (`Report.jsx`) |
| Partage volontaire prise par prise, avec un mot au conseiller | `Share` |
| Relecture conseiller : notes horodatées, commentaires par observation, mot d'introduction, brouillon automatique | `Review` (`Counselor.jsx`) |
| Rapport final IA + conseiller, renvoyable après modification | `take.report` |
| Réentraînement illimité, y compris après le rapport | espace bénéficiaire |
| Suppression d'une prise, d'un parcours, de toutes ses données | `deleteTake`, `deleteParcours`, `withdrawConsent` |
| Indicateurs agrégés non stigmatisants | `List` (`Counselor.jsx`) : prises à relire, parcours, rapports, taux de réentraînement, délai moyen de relecture |
| Impression ou export PDF du rapport | `window.print()` + feuille de style d'impression (`GStyle`) |
| Mentions d'information : CGU, notice RGPD, cycle de vie de la vidéo, exclusion des émotions | `src/legal.jsx` (textes de travail à valider) |

---

## Architecture

```
index.html
src/
  main.jsx            point d'entrée React
  App.jsx             routage (rôles + lien #/s/CODE), navigation, page de présentation, pied de page
  ui.jsx              design system v2 : jetons (couleurs, dégradés, rayons, ombres), logos, Btn, Card, Tag, Icon, Rail, GradHead
  legal.jsx           modales : cycle de vie de la vidéo, émotions, CGU, notice RGPD
  Beneficiary.jsx     espace bénéficiaire : code, consentement, espace, échauffement, question, enregistrement, traitement, rapport, partage
  Counselor.jsx       espace conseiller : identification locale, liste et indicateurs, création de parcours, détail, relecture
  Recorder.jsx        enregistreur caméra/micro + déclenchement du suivi du regard
  Report.jsx          lecteur avec repères, cartes d'observation, corps du rapport (partagé par les deux espaces)
  lib/
    store.js          données : localStorage (« larepet.v1 ») pour les métadonnées, IndexedDB (« larepet ») pour les vidéos
    analysis.js       analyse descriptive locale, garde-fou de conformité, reformulation LLM facultative
    transcribe.js     décodage audio 16 kHz + transcription locale (worker) ou serveur
    whisper.worker.js Whisper dans un Web Worker
    gaze.js           MediaPipe Face Landmarker (présence, orientation de la tête, direction des yeux)
    questions.js      banque de questions
tests/
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
                        draft:  { intro, comments, notes } | null,               // brouillon conseiller
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
| `VITE_MEDIAPIPE_WASM`, `VITE_FACE_MODEL` | fichiers MediaPipe auto-hébergés |

---

## Règles de conception à respecter (non négociables)

Ces règles traduisent le cadre réglementaire (AI Act, RGPD) et les partis pris pédagogiques du projet. Toute évolution doit les préserver.

1. **Aucune inférence d'émotion ni de trait de personnalité** (article 5(1)(f) du Règlement (UE) 2024/1689, applicable depuis le 2 février 2025). `gaze.js` ne lit que les coefficients `eyeLook*` et la position des repères du visage, jamais les coefficients d'expression. `analysis.js` filtre tout retour contenant un vocabulaire émotionnel (`FORBIDDEN`) ou une note (`isCompliant`).
2. **Décrire, jamais noter.** Pas de score, de note, de classement ni de jauge de performance.
3. **Points d'appui avant points à explorer**, formulation positive, repères présentés comme des conventions de secteur.
4. **La vidéo reste sur l'appareil** tant que la personne ne décide pas de l'envoyer, prise par prise. Seul du texte peut partir vers un modèle de langage.
5. **Supervision humaine** : rien n'arrive au bénéficiaire de la part du conseiller sans envoi explicite ; le conseiller peut nuancer ou contredire l'assistant.
6. **Choix du mode de restitution** (rapport écrit ou vidéo) et **échauffement sans analyse**.
7. **Indicateurs agrégés uniquement**, aucune mesure de performance individuelle (ni bénéficiaire, ni conseiller).
8. **Minimisation** : prénom et initiale, poste visé ; aucun identifiant administratif ni adresse électronique.

Couleurs (design system v2) : bleu `#386097` dominant (structure, navigation), bleu clair `#3893CD` secondaire, orange `#C25700` pour l'action et les points d'appui, violet `#5C4BB9` réservé à l'IA et aux points à explorer, vert `#41C77A` pour la validation. Typographies : Manrope (titres), Inter (texte), JetBrains Mono (chiffres).

---

## Passage en production (travail restant)

Par ordre de priorité :

1. **Backend et stockage serveur.** Remplacer `src/lib/store.js` par une API (mêmes signatures : `createParcours`, `findParcours`, `createTake`, `updateTake`, `deleteTake`, `withdrawConsent`, `loadVideoUrl`…). Hébergement en France, chiffrement au repos et en transit. La vidéo ne doit être téléversée qu'au moment de `Share` (aujourd'hui `updateTake(..., { shared: true })`) ; avant, elle reste en IndexedDB sur l'appareil.
2. **Authentification forte des conseillers** (aujourd'hui `Identify` enregistre un simple nom), cloisonnement par site et par conseiller, rôles référent et administrateur.
3. **Expiration et révocation des codes**, limitation des tentatives de saisie.
4. **Durées de conservation et purge automatique**, journalisation des accès.
5. **Auto-hébergement des modèles** (Whisper, MediaPipe) et, si besoin, proxy serveur pour la transcription et la reformulation (modèles hébergés en France).
6. **Validation des seuils** de `analysis.js` (débit, pauses, mots d'appui) et de `gaze.js` (seuils `down` et `side`) sur des prises réelles, puis **audit de biais** sur des profils représentatifs (âge, genre, accent, quartiers prioritaires, primo-arrivants).
7. **Accessibilité** : audit RGAA 4.1.2 complet, consignes en FALC, test au lecteur d'écran.
8. **Analyse d'impact (DPIA)** et validation des textes de `legal.jsx` par le juridique et le DPO.

Limites connues :
- la qualité de transcription de Whisper base en français est correcte mais imparfaite sur les prises courtes ou bruitées ; `whisper-small` est meilleur mais plus lourd ;
- le suivi du regard dépend de la lumière et de la position de la caméra ; il est désactivé en mode « son seulement » ;
- Safari enregistre en mp4 ; le décodage audio pour Whisper repose sur `decodeAudioData`.

---

## Tests

```bash
npm run test:analysis                                   # analyse et garde-fou, sans navigateur
npx playwright install chromium && npm run test:e2e     # parcours complet dans Chromium
# ou, avec un Chromium déjà installé : CHROMIUM_PATH=/chemin/vers/chromium npm run test:e2e
```

Le test de bout en bout construit l'application avec un service de transcription simulé (`tests/mock-stt.mjs`), utilise la caméra et le micro simulés de Chromium, rejoue la boucle complète (création du parcours, consentement, enregistrement, analyse, rapport vidéo, envoi, relecture et annotation, envoi du rapport, lecture du rapport final) et enregistre des captures dans `tests/screenshots/`.

---

## Reprise du travail avec Claude Code

Contexte utile pour reprendre ce dépôt :

- **Origine.** Prototype conçu en plusieurs itérations (octobre et novembre 2026) : d'abord un fichier React unique destiné à une démonstration, puis cette version modulaire et fonctionnelle. Deux documents de cadrage, hors dépôt, l'accompagnent : un cadre AI Act, architecture et DPIA, et un cadre psychosociologique (partis pris, points de vigilance) ; ainsi qu'un cahier des charges fonctionnel (exigences EF-01 à EF-42 et ENF-01 à ENF-20, classées indispensable ou souhaitable) et un benchmark de marché qui conclut à une construction interne plutôt qu'à l'achat d'une solution.
- **Ce qui a été vérifié.** Compilation (`npm run build`), test unitaire de l'analyse, test de bout en bout complet dans Chromium avec caméra simulée et transcription simulée.
- **Ce qui n'a pas pu être vérifié.** Le téléchargement et l'exécution réels de Whisper et de MediaPipe (réseau de l'environnement de développement restreint) : à tester en premier dans un vrai navigateur, avec une vraie caméra et un vrai micro (`npm run dev`, puis un parcours complet).
- **Où intervenir.** Logique métier dans `src/lib/`, écrans dans `Beneficiary.jsx` et `Counselor.jsx`, composants visuels dans `ui.jsx`. Les styles sont écrits en ligne avec les jetons de `ui.jsx` (`T`, `RAD`, `SH`, `FD`, `FB`, `FM`) ; conserver ce système plutôt que d'introduire une autre bibliothèque.
- **Langue et ton.** Interface en français, vouvoiement côté bénéficiaire, ton positif et non évaluatif (« vous pouvez renforcer… » plutôt que « insuffisant »). Pas de tiret cadratin dans les textes d'interface.
- **Prochaine étape suggérée.** Point 1 de « Passage en production » : un backend minimal (par exemple Supabase ou une API Node hébergée en France) branché derrière les fonctions de `store.js`, sans changer les écrans.
