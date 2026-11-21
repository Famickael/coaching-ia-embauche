# État fonctionnel réel de La Répét'

Ce document dit ce qui fonctionne vraiment, ce qui ne fonctionne qu'en local, ce qui est factice et ce qui manque. Il s'appuie sur un essai de bout en bout dans Chromium avec une vraie voix française, et sur la lecture du code. Pour la mise en ligne, voir [`mise-en-ligne.md`](mise-en-ligne.md) ; pour la cible de production, [`plan-production.md`](plan-production.md).

- **Date de l'essai :** 21 novembre 2026, commit `997cbed` de la branche `claude/hopeful-heisenberg-oil2aj`.
- **En une phrase :** tout le cœur fonctionne réellement **dans un seul navigateur** (enregistrement, transcription Whisper, analyse, retour, assistants, relecture coach, rapport) ; **rien ne circule entre deux appareils**, faute de serveur ; le retour rédigé par un modèle de langage fonctionne avec le proxy de `serveur/llm-proxy/`, mais il est presque toujours écarté à cause d'un bug de conformité (B1).

---

## 1. Méthode

| Élément | Détail |
|---|---|
| Navigateur | Chromium 1243 de Playwright 1.65.1 (`CHROMIUM_PATH=/opt/pw-browsers/chromium`), sans interface, 4 cœurs Xeon 2,1 GHz, pas de GPU |
| Caméra | caméra simulée de Chromium (`--use-fake-device-for-media-stream`) : une forme verte animée, **sans visage** |
| Micro | `--use-file-for-fake-audio-capture` avec un fichier WAV de 28 s de parole française synthétisée par `espeak-ng -v fr` (« Bonjour, je m'appelle Camille. J'ai travaillé trois ans comme agent d'accueil dans une mairie. Par exemple, j'accueillais chaque jour une centaine de personnes… Euh, ce que j'aime, c'est le contact avec le public… »). Chromium rejoue le fichier en boucle à partir de l'ouverture du micro |
| Site A | construit **sans** variable (`npx vite build`), comme le site publié aujourd'hui |
| Site B | construit avec `VITE_LLM_ENDPOINT=http://localhost:8787/`, vers le proxy de `serveur/llm-proxy/` lancé par `local.mjs`, lui-même branché sur un **faux service Anthropic** local (`ANTHROPIC_BASE_URL`), sans vraie clé. Le faux service préfixe ses textes par « [proxy] » pour les repérer à l'écran |
| Parcours joué | code `REPETE`, accord, échauffement (caméra, flou, voix seule, assistant), série de deux questions (une en vidéo 32 s, une en voix seule 20 s), retour écrit, envoi au coach, « second appareil » simulé par un contexte de navigateur séparé, relecture coach, assistant de rédaction, envoi du rapport, rapport côté personne, prise hors ligne, rechargement hors ligne, retrait de l'accord |
| Contrôle des données | lecture directe de `localStorage["larepet.v1"]` et des clés de la base IndexedDB `larepet` à chaque étape |
| Whisper hors navigateur | même modèle (`onnx-community/whisper-base`, encodeur fp32, décodeur q8) dans Node, sur le même fichier, pour comparer des réglages (section 4.3) |

Le script d'essai n'est pas versionné (périmètre de cette mission). Il reprend `tests/whisper-real.cjs` et `tests/e2e.cjs` ; il peut être ajouté sous `tests/` si on le souhaite.

---

## 2. Tableau par fonctionnalité

Légende : **Fonctionne** (vérifié de bout en bout), **Local seulement** (fonctionne, mais uniquement dans le navigateur où les données ont été créées), **Factice** (simulé, rien de réel derrière), **Absent**.

### 2.1 Personne accompagnée

| Fonction | État | Comment c'est réalisé | Constat de l'essai et limites |
|---|---|---|---|
| Accès par code ou lien `#/s/CODE` | Local seulement | `findParcours` lit `localStorage` ; le code d'essai `REPETE` crée un parcours fictif à la volée (`ensureTrial`, `src/lib/store.js`) | Un code créé par un coach n'existe que dans le navigateur du coach. Sur un autre appareil, seul `REPETE` marche (il est recréé). Aucune expiration, aucune limite de tentatives |
| Accord (consentement) granulaire, retirable | Fonctionne (local) | écran `Consent`, champ `consent` du parcours, `withdrawConsent` | Les deux cases sont décochées par défaut ; le retrait vide les réponses, les vidéos et le questionnaire, et garde un historique daté (`consentHistory`) |
| Échauffement | Fonctionne | `WarmupStage.jsx` : aperçu `getUserMedia` sans `MediaRecorder` | Aucune prise créée (0 dans le stockage après l'échauffement). Phrase aléatoire, consignes, passage voix seule vérifiés |
| Fond flou ou uni pendant l'échauffement | Fonctionne | `src/lib/background.js`, MediaPipe Image Segmenter, modèle chargé depuis `storage.googleapis.com`, moteur servi par le site | « Flou » actif en 3 s. **Uniquement à l'échauffement** : pas de flou pendant l'enregistrement d'une réponse |
| Choix des questions, série, entraînement complet | Fonctionne | `Pick`, `src/lib/questions.js` | Série de deux questions jouée, « Question suivante » enchaîne |
| Question lue à voix haute (recruteur oral) | Fonctionne avec repli | `RecruiterVoice.jsx`, `speechSynthesis` de l'appareil, voix `fr-FR` | Chromium sous Linux sans interface n'a **aucune voix** (`getVoices()` vide) : repli silencieux, la question reste affichée, l'enregistrement n'est pas bloqué. Sur Windows, macOS, Android, iOS une voix française est en général présente (non vérifié ici) |
| Enregistrement vidéo | Fonctionne (local) | `Recorder.jsx`, `MediaRecorder` (`video/webm;codecs=vp8,opus` sous Chromium), 3 min au plus, vidéo dans IndexedDB | Prise de 32 s gardée, relue avant validation |
| Enregistrement voix seule | Fonctionne (local) | même composant, `audio/webm;codecs=opus` | Suivi du regard désactivé (normal) |
| Suivi du regard | Fonctionne, non validé sur un vrai visage | `src/lib/gaze.js`, MediaPipe Face Landmarker, 2 images par seconde, coefficients `eyeLook*` seulement | 61 échantillons pour 32 s. Avec la caméra simulée (sans visage) : « visage hors champ 100 % », et le retour affiche « Regard orienté vers l'écran environ 0 % du temps » (voir B5) |
| Transcription | Fonctionne, qualité à surveiller | Whisper base dans un Web Worker (`whisper.worker.js`, transformers.js 3.8.1, ONNX Runtime servi par le site) ; modèle téléchargé depuis Hugging Face puis mis en cache | Voir section 4. Rapide, mais boucles de répétition (B3) |
| Indicateurs d'analyse | Fonctionne | `computeMetrics` et `localAnalysis` (`src/lib/analysis.js`), à partir des segments horodatés et du regard | Voir section 5 |
| Retour (synthèse et repères) | Fonctionne (moteur local) | `localAnalysis` ; reformulation facultative par modèle de langage (`analyze`, `VITE_LLM_ENDPOINT`), rapprochée (`reconcile`) puis filtrée (`isCompliant`) | Sans `VITE_LLM_ENDPOINT` : `source: "local"`. Avec le proxy : la reformulation est **écartée** dès qu'un « euh » apparaît (B1) |
| Choix lire ou revoir, lecteur avec repères | Fonctionne | `Choose`, `Report.jsx` | |
| Assistant de préparation | Fonctionne | `src/lib/assistant.js` : base locale (53 sujets, relances) ou modèle via `VITE_LLM_ENDPOINT`, filtré par `assistantCompliant` | Site A : réponse locale (« Une présentation efficace tient en deux minutes environ… »). Site B : réponse du proxy affichée (« [proxy] Présentez votre parcours en trois temps… ») |
| Envoi au coach | Local seulement | `updateTake(id, { shared: true, note })` : un simple drapeau dans `localStorage` | Le coach ne voit la réponse que dans **le même navigateur**. Aucun téléversement, aucune notification |
| Rapport du coach visible | Local seulement | lecture de `take.report` | Vu dans l'espace après envoi par le coach, même navigateur |
| Télécharger sa vidéo ou sa voix | Fonctionne (lecture du code, non joué) | `downloadTake` (`beneficiary/shared.jsx`), menu « Autres actions » | Média seul. **Pas d'export** du texte, du retour ni du rapport (sauf impression), pas d'export global des données (B7) |
| Impression ou PDF du rapport | Fonctionne (lecture du code) | `window.print()` et feuille d'impression | |
| Supprimer une réponse | Fonctionne (lecture du code) | `deleteTake` : vidéo IndexedDB puis métadonnées | |
| Retrait de l'accord (tout supprimer) | Fonctionne | `withdrawConsent` | Avant : 3 prises, 3 vidéos. Après : 0 prise, IndexedDB vide, parcours gardé avec `consent: null` et l'historique |
| Hors ligne, page déjà ouverte | Fonctionne | modèle Whisper en mémoire du worker et dans le cache du navigateur | Prise voix seule enregistrée et transcrite réseau coupé (10 s). Site B : l'appel au proxy échoue (« Failed to fetch »), repli sur l'analyse locale, sans erreur visible |
| Hors ligne, rechargement | Absent | aucun service worker | `net::ERR_INTERNET_DISCONNECTED` : la page ne se charge pas sans réseau |

### 2.2 Coach

| Fonction | État | Comment c'est réalisé | Constat et limites |
|---|---|---|---|
| Connexion coach | Factice | `Espace.jsx` : identifiants de démonstration pré-remplis (`TRIAL_LOGIN`), **aucune vérification**, n'importe qui devient « Sophie M. » | À remplacer par une vraie authentification |
| Création d'un parcours (code, lien) | Local seulement | `createParcours` : code de 6 caractères tiré par `crypto.getRandomValues` | Le code n'est utilisable que dans ce navigateur |
| Liste, indicateurs agrégés | Local seulement | `coach/List.jsx` | « 1 entretien à relire » vu dans le même navigateur. **Autre navigateur : « Aucun parcours pour l'instant »** |
| Relecture : notes horodatées, commentaires, introduction, brouillon | Fonctionne (local) | `coach/Review.jsx`, `saveDraft` | Note « Bonne accroche au début » à 0:00 et introduction enregistrées |
| Assistant de rédaction du rapport | Fonctionne | `src/lib/coachAssistant.js` : base locale ou modèle via `VITE_LLM_ENDPOINT`, filtré par `coachCompliant` | Site A : 4 propositions locales. Site B : 2 propositions du proxy (« [proxy] Vous avez cité un exemple précis… »), insérables |
| Envoi du rapport | Local seulement | `sendReport` (refusé si la personne a repris son envoi) | Rapport enregistré (`by: "Sophie M."`) et visible côté personne, même navigateur |

### 2.3 Éléments annexes

| Fonction | État | Détail |
|---|---|---|
| Formulaire de contact (page « Nous contacter ») | Factice | `src/Demo.jsx` : rien n'est envoyé ; après validation des champs, un message de statut indique « Aucune demande envoyée, version de démonstration » (`PHRASES.contactDemo`). Au commit essayé, `VITE_CONTACT_EMAIL` ouvrait la messagerie (`mailto:`) ; cette option est retirée par la refonte en cours |
| E-mails (invitation coach, notifications) | Absent | aucun envoi |
| Nom de domaine | Absent | site sur `famickael.github.io/la-repet/` |
| Logo de l'organisme (marque blanche) | Factice | « Famickael » en pointillés (`OrgLogo`, `ORG_LOGO_URL`) |
| Textes juridiques | Valeurs d'exemple | `src/content/organisme.js` à compléter par l'organisme et le DPO |

---

## 3. Où vivent les données, et ce qui ne peut pas marcher sans serveur

| Donnée | Emplacement | Taille constatée |
|---|---|---|
| Parcours, accords, prises (texte, segments, regard, analyse), brouillons, rapports, coach connecté | `localStorage`, clé `larepet.v1` (un seul objet JSON) | environ 7 500 caractères pour 2 prises |
| Vidéos et voix | IndexedDB, base `larepet`, magasin `videos`, clé = identifiant de prise | une vidéo de 3 min pèse environ 15 Mo |
| Questionnaire de fin d'échauffement | `localStorage`, clé `larepet.warmup.CODE` | |
| Réglages (son coupé, accessibilité) | `localStorage`, `sessionStorage` | |
| Modèles Whisper et MediaPipe | cache du navigateur | environ 85 Mo |

Deux onglets du même navigateur se synchronisent par l'événement `storage`. Rien d'autre ne sort de l'appareil, à part le texte envoyé au proxy IA quand `VITE_LLM_ENDPOINT` est défini.

**Conséquences, vérifiées par l'essai (contexte de navigateur séparé = second appareil) :**

- un coach ne peut pas créer un parcours pour une personne qui s'entraîne chez elle : le code n'existe pas sur l'appareil de la personne ;
- une réponse « envoyée au coach » n'arrive nulle part ailleurs : dans le second contexte, l'espace coach affiche « Aucun parcours pour l'instant » et l'espace `REPETE` repart de l'accord, sans aucune prise ;
- un rapport du coach n'atteint la personne que si elle utilise le même navigateur ;
- vider les données du navigateur, changer de navigateur ou passer en navigation privée efface tout ;
- les indicateurs agrégés du coach ne portent que sur ce navigateur ;
- aucune authentification n'est possible : la « connexion » coach est un nom enregistré localement.

Le dispositif tel qu'il est décrit (coach d'un côté, personne chez elle de l'autre) **ne fonctionne donc pas aujourd'hui**. Il fonctionne en démonstration sur un seul poste (deux onglets) ou en atelier sur un poste partagé.

---

## 4. Transcription (Whisper)

### 4.1 Réglages

`onnx-community/whisper-base` (révision `main`, à figer par `VITE_WHISPER_REVISION`), encodeur fp32, décodeur q8, WebGPU si un adaptateur existe, sinon WebAssembly ; langue française, horodatage par segment, découpage en fenêtres de 30 s avec 5 s de recouvrement. Avec `VITE_STT_ENDPOINT`, le son part vers un service au format OpenAI (non essayé ici).

### 4.2 Temps mesurés (WebAssembly, 4 cœurs, pas de GPU)

| Prise | Durée | Temps entre « Voir mon retour » et l'écran de choix |
|---|---|---|
| Vidéo, premier passage (inclut le téléchargement du modèle, environ 80 Mo) | 33 s | 33 s (site A), 27 s (site B) |
| Voix seule, modèle déjà chargé | 20 s | 13 s, 16 s |
| Voix seule, hors ligne | 12 s | 10 s |
| Node, même modèle, fichier entier | 28 s | 10 s |

La transcription est donc plus rapide que le temps réel sur ce poste. Sur un téléphone d'entrée de gamme, à mesurer (`plan-production.md`, 1.7).

### 4.3 Qualité du texte

La voix de synthèse `espeak-ng` est difficile (robotique) : les erreurs de mots ne disent pas grand-chose de la qualité sur une vraie voix. En revanche, deux défauts sont nets :

1. **Boucles de répétition.** Whisper base répète une phrase en boucle :
   - site A, prise vidéo : « Je suis ma mère et mon tournée. » répété 11 fois ;
   - site B, prise voix seule (20 s) : « Je suis une mère et mon père et mon père. » répété plus de 10 fois ;
   - Node, prise de 33 s : « de la vie » répété des dizaines de fois au passage de la fenêtre de 30 s.

   Avec `no_repeat_ngram_size: 3`, la boucle de la prise de 33 s disparaît (même texte, sans répétition, 16 s au lieu de 32 s). `repetition_penalty: 1.2` supprime aussi la boucle mais dégrade le reste du texte.
2. **Effet sur l'analyse.** Les mots inventés gonflent le débit (269 mots par minute au lieu d'environ 150 pour la voix de synthèse) et créent de faux « Mots qui reviennent » (« tournée » 14 fois). La personne reçoit alors un repère faux.

Exemple de texte obtenu (site B, prise vidéo, sans boucle) : « J'ai trajeté trois ans qu'on a jamais d'accueil dans une mérie. Par exemple, j'accueilé chaque jour une centaine de personnes, je réponds mes mots téléphoniques […] Euh, ce que j'aime, c'est le contact à ma République. […] je souhaiterai rejoindre votre équipe parce que votre structure a accueil beaucoup de famille et j'ai envie de mettre mon expérience à votre service. »

**À faire avant tout pilote :** refaire la mesure avec de vraies voix (accents variés), comparer `whisper-small`, et appliquer la correction B3.

---

## 5. Indicateurs d'analyse calculés

Tous viennent de `computeMetrics` et `localAnalysis` (`src/lib/analysis.js`), à partir des seuls segments horodatés de Whisper (`[{start, end, text}]`), de la durée et, en vidéo, du résumé du regard. Aucun ne note la personne.

| Repère (`id`) | Calcul | Seuils (conventions affichées) | Constat |
|---|---|---|---|
| Rythme de parole (`debit`) | mots reconnus ÷ temps de parole (somme des segments) × 60 | 110 à 170 mots par minute : point d'appui | 269 puis 176 mots par minute (gonflé par les boucles, B3) |
| Pauses (`pauses`) | silences de 2 s ou plus entre deux segments | 3 pauses ou moins : point d'appui | aucune (voix de synthèse continue) |
| Exemples concrets (`exemples`) | motif : nombre + ans, mois, clients, personnes… ; « par exemple » ; « quand j'ai » ; « lors de » | présence : point d'appui | repéré (« trois ans », « par exemple ») |
| Petits mots répétés (`petits-mots`) | « euh », « heu », « ben », « en fait », « du coup », « genre », « voilà »… | 4 par minute ou moins : point d'appui | « euh » (1) repéré |
| Construction (`structure`) | nombre de phrases, mots par phrase, phrase de conclusion dans les deux derniers segments (« c'est pourquoi », « en résumé »…) | conclusion et 30 mots par phrase au plus : point d'appui | |
| Mots qui reviennent (`repetitions`) | mots de 5 lettres ou plus présents 4 fois ou plus | toujours « à explorer » | faux positif dû aux boucles |
| Direction du regard (`regard`) | part du temps visage absent, regard vers le bas, sur le côté (`gaze.js`, 2 images par seconde) ; affiché si plus de 10 échantillons | 60 % vers l'écran : point d'appui | « visage hors champ 100 % » avec la caméra simulée (B5) |
| Son enregistré (`captation`) | moins de 15 mots reconnus | remplace tous les autres repères | |

La synthèse liste les points d'appui, puis renvoie aux pistes.

---

## 6. Retour généré : moteur local ou modèle de langage

| Situation | Ce qui se passe |
|---|---|
| Sans `VITE_LLM_ENDPOINT` (site publié aujourd'hui) | Tout est calculé dans le navigateur. Retour `source: "local"`, assistant et aide au coach sur leurs bases locales. **Le site est entièrement utilisable ainsi**, aucun appel réseau à part les modèles |
| Avec `VITE_LLM_ENDPOINT` vers le proxy | Le navigateur envoie la question, la transcription (8 000 caractères au plus), les mesures et le retour local. Le proxy choisit le modèle par tâche (`claude-sonnet-5-5` pour le retour, `claude-haiku-5-5` pour l'assistant, `claude-sonnet-5-5` pour le coach), sans `temperature`, et renvoie le texte. Le navigateur rapproche la sortie de l'analyse locale puis la filtre |
| Moins de 15 mots reconnus | Pas d'appel au modèle |
| Proxy injoignable, erreur, refus du modèle, sortie non conforme | Repli sur le texte local, sans message d'erreur (constaté hors ligne : « Failed to fetch » puis retour local) |

Constats de l'essai (site B, faux service Anthropic) :

- requêtes reçues par le faux service : en-têtes `x-api-key` et `anthropic-version: 2026-10-21`, pas de `temperature`, `max_tokens` 1024 (assistant), 4096 avec sortie structurée (retour), 2048 (coach) ;
- assistant de la personne et aide au coach : textes du proxy affichés ;
- retour de la prise en voix seule : `source: "llm"` ;
- retour de la prise vidéo : **écarté** (« retour non conforme ») alors que le texte du faux service était neutre. Cause : bug B1.

Le proxy n'a pas été essayé avec une vraie clé Anthropic dans cet essai : la qualité des textes réels, leur taux de refus par `isCompliant` et les temps de réponse restent à mesurer.

---

## 7. Bugs constatés

### B1. La reformulation du retour par le modèle de langage est écartée dès qu'un petit mot est repéré

- **Gravité :** haute dès que `VITE_LLM_ENDPOINT` est défini (sans effet sur le site publié aujourd'hui).
- **Reproduction :** construire avec `VITE_LLM_ENDPOINT` vers un proxy qui répond ; enregistrer une réponse qui contient un « euh » (4 par minute au plus) ; la console affiche `[analyse] modèle de langage indisponible ou non conforme, analyse locale utilisée Error: retour non conforme`, et le retour affiché est le retour local.
- **Cause :** le conseil local du repère « Petits mots répétés » dit « Leur présence reste discrète et **ne gêne pas** la compréhension. » ; le motif `g[êe]n[ée]e?s?` de `EMOTION` (`src/lib/compliance.js`), prévu pour « gêné », reconnaît aussi le verbe « gêne ». `reconcile` réinjecte le conseil local quand le modèle le reprend ou omet le repère, et `feedbackCompliant` refuse alors tout le retour. Vérifié dans Node : `feedbackCompliant(localAnalysis(...))` vaut `false` pour cette prise.
- **Correction :** voir C1.

### B2. La préparation du retour peut attendre sans fin si le proxy ne répond pas

- **Reproduction :** lecture du code. `analyze()` (`src/lib/analysis.js`) appelle `fetch` sans délai de garde, contrairement à `askAssistant` et `coachSuggest` (15 s). Si le proxy accepte la connexion sans répondre, l'écran reste sur « Préparation des repères de votre retour… ». Le proxy coupe lui-même à 25 s (`UPSTREAM_TIMEOUT_MS`), ce qui limite le problème avec ce proxy, pas avec un autre service.
- **Correction :** voir C2.

### B3. Boucles de répétition de Whisper, qui faussent le débit et les répétitions

- **Reproduction :** enregistrer 20 à 35 s de parole peu nette (ici une voix de synthèse) ; la transcription répète une phrase 10 fois ou plus ; le retour annonce un débit très élevé et un « mot qui revient » inventé. Reproduit dans le navigateur (deux fois sur quatre prises) et dans Node.
- **Correction :** voir C3.

### B4. « Tout se passe sur votre appareil » reste affiché quand le texte part vers le service d'IA

- **Reproduction :** site construit avec `VITE_LLM_ENDPOINT` ; enregistrer une réponse ; l'écran de préparation affiche « Tout se passe sur votre appareil. Cela peut prendre un moment. » alors que la transcription est envoyée au proxy. Les textes de `src/content/legal.js` ont bien une variante (`REMOTE_LLM`), pas cette phrase écrite en dur.
- **Correction :** voir C4.

### B5. Repère du regard trompeur quand aucun visage n'est détecté

- **Reproduction :** caméra masquée ou sans visage (ici la caméra simulée) ; le retour affiche « Regard orienté vers l'écran environ 0 % du temps, vers le bas 0 %, sur le côté 0 %, visage hors champ 100 % » et le classe « à explorer ». À vérifier avec une vraie caméra mal cadrée.
- **Correction :** voir C5.

### B6. Le nom du prestataire d'IA proposé dans la notice ne correspond pas au fournisseur actuel

- `src/content/organisme.js` propose `llmProvider: "prestataire de modèle de langage hébergé en France, à désigner (exemple)"`. Avec Anthropic, le traitement a lieu hors de l'Union (`plan-production.md`, 1.6). Si le proxy est branché, la notice affichée serait inexacte. Le propriétaire ne souhaite pas citer le fournisseur sur le site : c'est au DPO de trancher entre le nommer dans la notice (obligation d'information sur les destinataires et les transferts) et choisir un autre fournisseur.

### B7. Pas d'export des données de la personne

- Seul le média (vidéo ou voix) se télécharge, réponse par réponse. Le texte, le retour et le rapport ne s'exportent que par l'impression. Le bandeau de stockage plein (`App.jsx`) invite pourtant à « télécharger vos réponses ». Pas de fichier unique pour le droit à la portabilité.

---

## 8. Corrections à faire

Aucune n'a été appliquée dans `src/` (périmètre de cette mission).

| # | Fichier | Cause | Correction proposée |
|---|---|---|---|
| C1 | `src/lib/analysis.js` (conseil du repère `petits-mots`), `tests/analysis.test.mjs` | « ne gêne pas » est reconnu comme une émotion par `compliance.js` (B1) | Reformuler : « Leur présence reste discrète et la réponse reste facile à suivre. » Ajouter un test qui vérifie `isCompliant(localAnalysis(...))` pour chaque branche de chaque repère (appui et à explorer). Garder le motif de `compliance.js` tel quel |
| C2 | `src/lib/analysis.js`, `analyze()` | `fetch` sans délai de garde (B2) | `AbortController` et `setTimeout(() => ctrl.abort(), 30000)`, comme dans `askAssistant` |
| C3 | `src/lib/whisper.worker.js` | décodage sans garde contre les répétitions (B3) | Ajouter `no_repeat_ngram_size: 3` aux options de `asr(...)` ; essayer `onnx-community/whisper-small` avec `tests/whisper-real.cjs` ; dans `computeMetrics`, ignorer le débit et les « mots qui reviennent » quand un même groupe de 4 mots se répète plus de 3 fois de suite, et proposer de recommencer |
| C4 | `src/beneficiary/Processing.jsx` (ligne « Tout se passe sur votre appareil ») | phrase écrite en dur (B4) | Lire une phrase de `src/content/legal.js` qui dépend de `REMOTE_LLM` (par exemple « Votre réponse est mise par écrit sur votre appareil. Le texte, sans image ni son, est ensuite envoyé au service de l'assistant. ») |
| C5 | `src/lib/analysis.js` (repère `regard`) | aucun cas « visage non détecté » (B5) | Si `absentRatio` dépasse 0,8, remplacer le repère par « Votre visage n'a pas été repéré par la caméra pendant la plus grande partie de la réponse » avec un conseil de cadrage, sans pourcentage de regard |
| C6 | `src/lib/assistant.js`, `src/lib/analysis.js`, `src/lib/coachAssistant.js` | le proxy déduit la tâche du texte du prompt | Ajouter `task: "chat"`, `"feedback"` ou `"coach"` au corps JSON (le proxy le lit déjà) ; retirer `model: VITE_LLM_MODEL` (ignoré par le proxy) ou le garder pour un autre service |
| C7 | `src/lib/assistant.js`, `src/lib/coachAssistant.js` | délai client de 15 s, délai proxy de 25 s | Aligner : 20 s côté client, ou `UPSTREAM_TIMEOUT_MS = 14000` pour l'assistant. Sans effet sur la personne (repli local), mais évite de payer des réponses jamais lues |
| C8 | `src/content/organisme.js`, `src/content/legal.js` | prestataire d'exemple « hébergé en France » (B6) | Décision DPO ; renseigner `llmProvider` en conséquence avant de brancher le proxy |
| C9 | `src/beneficiary/TakeReport.jsx`, `src/app/AccountMenu.jsx` | pas d'export (B7) | Ajouter « Télécharger mes données » : un fichier JSON (parcours, réponses, textes, retours, rapports) et les médias ; corriger le texte du bandeau de `App.jsx` |
| C10 | `vite.config.js`, nouveau service worker | rechargement impossible hors ligne | Si l'usage hors ligne est voulu : précache de l'application (par exemple `vite-plugin-pwa`) ; les modèles sont déjà dans le cache du navigateur |

---

## 9. Ce qu'il faudrait pour que le cœur marche entre plusieurs appareils

Un serveur de données est **indispensable** : aucun réglage du site statique ne peut faire passer une réponse du navigateur de la personne à celui du coach. Le proxy IA ne suffit pas (il ne garde rien, par conception). Un projet Supabase n'est pas obligatoire ; ce qu'il faut, c'est :

1. **Une base** pour les parcours, les accords, les métadonnées des réponses envoyées, les brouillons et les rapports.
2. **Un stockage d'objets** pour les vidéos, rempli **uniquement au moment de l'envoi au coach** (aujourd'hui `updateTake(..., { shared: true })`), avec chiffrement et durée de conservation.
3. **Une authentification des coachs** (aujourd'hui factice) et un **accès de la personne par code** : code à usage limité, expiration, limitation des tentatives, jeton de session court.
4. **Une API** qui reprend les fonctions de `src/lib/store.js` (`createParcours`, `findParcours`, `createTake`, `updateTake`, `sendReport`, `saveDraft`, `deleteTake`, `withdrawConsent`, `loadVideoUrl`…). Point d'attention : `store.js` est **synchrone** (`useSyncExternalStore`, `findParcours` renvoie directement un objet) ; il faut une façade avec cache local et rafraîchissement asynchrone. La correspondance fonction par fonction est dans `plan-production.md`, section 3.
5. **Ce qui reste local** : l'échauffement, l'enregistrement, la transcription, l'analyse, le questionnaire d'échauffement, et toute réponse non envoyée.

Options d'hébergement, sans trancher :

| Option | Composants | Remarques |
|---|---|---|
| Supabase (plan actuel) | Postgres, Auth, Storage, fonctions, région Paris | Décrit en détail dans `plan-production.md` ; un projet de plus à administrer |
| Même compte Cloudflare que le proxy | Workers (API), D1 (base SQLite), R2 (vidéos), authentification à écrire ou déléguée | Pas de nouveau prestataire ; localisation des données dans l'Union à vérifier pour chaque service avant de choisir |
| API Node chez un hébergeur français | Node, Postgres managé, stockage compatible S3 (Scaleway, OVHcloud) | Hébergement en France plus simple à justifier ; plus d'exploitation |

Quel que soit le choix : textes d'information en variante « production » (`VITE_BACKEND_URL`), AIPD, purge automatique, journal des accès (`plan-production.md`, lots 0 à 9).
