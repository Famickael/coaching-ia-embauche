# Conformité et information des personnes : audit de La Répét'

Audit du 20 novembre 2026, sur l'état du dépôt à cette date (prototype, données dans le navigateur, site publié sur GitHub Pages).

**Portée et limites.** Ce document est un audit de travail, pas un avis juridique. La Répét' est un prototype. La qualification finale (base légale, catégorie de risque AI Act, durées, sous-traitants) revient au DPO et au juriste de l'organisme qui déploie l'outil. Les références ont été vérifiées à la source quand c'était possible : voir la section 7, qui liste aussi celles qui n'ont pas pu l'être.

**Convention de priorité.**

| Priorité | Sens |
|---|---|
| **Bloquant** | À corriger avant toute mise en production avec de vrais bénéficiaires. |
| **Important** | À corriger avant la production, ou dès maintenant sur le site public quand c'est simple. |
| **Recommandé** | Bonne pratique, qualité de l'information, confort de lecture. |

**Convention de nature.** `Obligatoire` : exigé par un texte. `Recommandé` : doctrine CNIL ou bonne pratique. `À valider` : choix qui relève du DPO ou du juridique.

---

## 1. Synthèse

Les partis pris du produit sont solides et vont au-delà du minimum : pas de note, pas d'émotion déduite, vidéo locale, partage volontaire prise par prise, échauffement sans enregistrement, suppression en libre-service. L'information existe et elle est déjà proposée à certains bons moments (bouton « Que devient ma vidéo ? » sous la caméra, encart sur les émotions).

Les écarts tiennent à quatre choses :

1. **Les textes légaux décrivent la cible, pas le prototype.** Ils parlent de serveurs en France, d'absence de transfert hors Union, d'un système « classé haut risque » dont les obligations seraient « intégrées ». Aujourd'hui rien de cela n'est exact : il n'y a pas de serveur, le site est servi par GitHub (États-Unis), les polices viennent de Google, les modèles de Hugging Face, de Google et de jsDelivr.
2. **Des mentions obligatoires manquent** : identité et contact du responsable de traitement et du DPO, mentions légales (éditeur, hébergeur), durées précises, déclaration d'accessibilité.
3. **Un défaut de consentement** : la case « Recevoir un retour de l'assistant » est cochée par défaut.
4. **L'information est rangée dans des fenêtres modales**, sans adresse, en petits caractères, avec des libellés de juriste. Le public visé a besoin de l'inverse : une phrase au bon moment, un résumé en images, et une page complète que le coach peut ouvrir et lire avec la personne.

Les dix actions à mener en premier sont listées en section 6.

---

## 2. Tableau des écarts

### 2.1 RGPD : information, base légale, durées, droits

| # | Priorité | Référence | Constat | Recommandation | Nature |
|---|---|---|---|---|---|
| R1 | Bloquant | [RGPD art. 13(1)(a) et (b)](https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre3#Article13) | Le responsable de traitement est « l'organisme qui vous accompagne (nom et coordonnées à compléter) ». Aucun contact du DPO. | Afficher le nom, l'adresse et un contact (courriel et téléphone) du responsable, et le contact du DPO. Les rendre paramétrables par organisme (marque blanche). Sur le site public de démonstration, nommer l'éditeur du prototype. | Obligatoire |
| R2 | Bloquant | [RGPD art. 4(11), 7 et considérant 32](https://eur-lex.europa.eu/eli/reg/2016/679/oj/fra) ; CJUE, 1er oct. 2019, Planet49, C-673/17 | Dans `Consent` (`src/Beneficiary.jsx`), l'état initial est `{ local: false, ai: true }` : la case « Recevoir un retour de l'assistant » est **cochée par défaut**. Une case cochée par défaut ne vaut pas consentement. | Décocher par défaut. La personne coche elle-même. Garder l'explication « Sans cette option, vous pouvez quand même vous enregistrer et vous revoir ». | Obligatoire |
| R3 | Bloquant | [RGPD art. 13(1)(e) et (f), art. 44 et suivants](https://eur-lex.europa.eu/eli/reg/2016/679/oj/fra) | La notice affirme « Serveurs situés en France (UE). Aucun transfert hors UE ». Dans le prototype, c'est inexact : voir les écarts T1 à T4. Le cycle de vie affirme qu'au partage « la vidéo est transmise de façon chiffrée et stockée sur les serveurs de l'organisme » : aujourd'hui rien n'est transmis, le partage ne quitte pas le navigateur. | Deux versions des textes, choisies par configuration : « prototype » (tout reste dans ce navigateur, voici les serveurs contactés) et « production » (hébergement réel, sous-traitants réels). Ne jamais afficher la version production tant que l'hébergement n'existe pas. | Obligatoire |
| R4 | Bloquant | [RGPD art. 13(2)(a), art. 5(1)(e)](https://eur-lex.europa.eu/eli/reg/2016/679/oj/fra) | Durée annoncée : « le temps de l'accompagnement, puis suppression ». Aucune durée chiffrée, aucun critère précis, aucune purge dans le code. Dans le prototype, les données restent jusqu'à ce que la personne les supprime ou que le navigateur les efface. | Fixer une durée par catégorie (proposition en 2.8), l'écrire dans la notice, et la mettre en œuvre (purge automatique). Dire dès maintenant la vérité du prototype : « Vos entraînements restent sur cet appareil jusqu'à ce que vous les supprimiez ». | Obligatoire (principe), À valider (valeurs) |
| R5 | Bloquant | [RGPD art. 13(2)(b), art. 12(2) et (3), art. 20, art. 21](https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre3) | La liste des droits est inexacte au regard de la base légale annoncée. Avec le consentement, le droit d'**opposition** (art. 21, réservé aux bases 6(1)(e) et (f)) ne s'applique pas, alors que le droit à la **portabilité** (art. 20) s'applique et n'est pas cité. Les droits s'exercent « auprès du coach ou du DPO », sans adresse ni délai. | Aligner la liste sur la base légale retenue. Donner un canal concret (courriel, courrier, « en parler à votre coach ») et le délai de réponse d'un mois. Garder la suppression en libre-service, qui est le meilleur canal pour ce public. Ajouter un bouton « Télécharger ma vidéo » (portabilité). | Obligatoire |
| R6 | Important | [RGPD art. 6(1)(a), art. 7(4), considérant 43](https://eur-lex.europa.eu/eli/reg/2016/679/oj/fra) ; lignes directrices CEPD 05/2020 sur le consentement | Base légale annoncée : consentement. Dans une relation d'accompagnement vers l'emploi, parfois prescrite et financée par un acteur public, il existe un déséquilibre : le consentement n'est « libre » que si refuser n'a aucune conséquence et si une alternative équivalente existe (préparer l'entretien avec le coach, sans l'outil). | Faire trancher la base légale par le DPO, selon le statut de l'organisme : consentement avec alternative réelle et affichée, ou mission d'intérêt public (6(1)(e)) pour l'accompagnement, en gardant de toute façon un accord explicite pour l'enregistrement et pour chaque envoi. Écrire sur l'écran d'accord : « Vous pouvez refuser. Cela ne change rien à votre accompagnement. » | À valider |
| R7 | Important | [RGPD art. 9(1) et (2)(a), art. 4(14), considérant 51](https://eur-lex.europa.eu/eli/reg/2016/679/oj/fra) | La notice invoque « art. 9-2-a pour les données issues de la vidéo ». Une vidéo n'est une donnée biométrique au sens de l'article 9 que si elle fait l'objet d'un traitement technique destiné à identifier la personne, ce qui n'est pas le cas ici. En revanche, l'image et le discours peuvent révéler des données sensibles (santé, handicap, origine, convictions). | Ne pas affirmer une qualification non tranchée dans un texte destiné aux bénéficiaires. Faire décider par le DPO si l'article 9 est retenu par prudence, et recueillir alors un consentement explicite. Conseiller à la personne de ne pas donner d'information de santé dans ses réponses. | À valider |
| R8 | Important | [RGPD art. 13(2)(e) et (f), art. 22](https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre3#Article13) | La notice ne dit pas si fournir les données est obligatoire, ni s'il existe une décision automatisée. | Ajouter : « Utiliser La Répét' est facultatif » et « Aucune décision n'est prise par une machine. Le retour de l'assistant n'a aucune conséquence sur vos droits ou votre accompagnement. » | Obligatoire |
| R9 | Bloquant | [RGPD art. 35](https://eur-lex.europa.eu/eli/reg/2016/679/oj/fra) ; [CNIL, « Ce qu'il faut savoir sur l'AIPD »](https://www.cnil.fr/fr/ce-quil-faut-savoir-sur-lanalyse-dimpact-relative-la-protection-des-donnees-aipd) (délibération n° 2018-327 et critères du G29, WP248) | Le traitement remplit au moins deux des neuf critères : personnes vulnérables, usage innovant, et selon l'analyse évaluation ou données à caractère hautement personnel. La FAQ dit que l'AIPD est « recommandée ». | L'AIPD est **obligatoire** avant la production, pas seulement recommandée. Corriger la FAQ (« Organismes ») et la page Solutions. | Obligatoire |
| R10 | Bloquant | [RGPD art. 28, art. 30, art. 32](https://eur-lex.europa.eu/eli/reg/2016/679/oj/fra) | Pour la production : pas de contrat de sous-traitance, pas de registre, pas d'authentification des coachs, pas de journalisation, codes sans expiration ni limite d'essais (déjà listé dans le README). | Contrat conforme à l'article 28 avec l'hébergeur et tout prestataire (transcription, modèle de langage). Fiche de registre. Mesures de sécurité du README, points 1 à 4. | Obligatoire |
| R11 | Important | [RGPD art. 7(1) et 7(3)](https://eur-lex.europa.eu/eli/reg/2016/679/oj/fra) | L'accord est tracé par une date (`consent.at`). Le retrait remet `consent` à `null` : aucune trace du retrait ni de la version des textes acceptés. Le retrait passe par `window.confirm`, peu lisible et non stylable. Le retrait est en bas de l'espace, en petit et en rouge : il est trouvable mais discret. | Enregistrer la version des textes vue et la date de retrait (côté serveur en production). Remplacer `window.confirm` par une boîte de dialogue accessible, avec des mots simples. Rendre le retrait aussi simple que l'accord : un lien « Vos données » toujours visible dans l'espace. | Obligatoire (preuve, simplicité du retrait), Recommandé (forme) |
| R12 | Important | [RGPD art. 13](https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre3#Article13) | Les coachs sont aussi des personnes concernées (nom, adresse professionnelle, annotations, délai moyen de relecture). Aucune information ne leur est destinée. | Une notice courte « Coachs » dans le centre « Vos données », avec un lien depuis l'écran de connexion. Rappeler que les indicateurs sont agrégés et ne mesurent pas la performance individuelle. | Obligatoire |
| R13 | Important | [Loi Informatique et libertés, art. 45](https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000886460) ; [RGPD art. 8 et 12(1)](https://eur-lex.europa.eu/eli/reg/2016/679/oj/fra) | Certains organismes accompagnent des jeunes de 16 et 17 ans, parfois moins. Rien n'est prévu pour les mineurs. | Décider de l'âge minimal. En dessous de 15 ans, le consentement se donne avec le titulaire de l'autorité parentale. Adapter le texte pour les mineurs. | À valider |
| R14 | Important | [RGPD art. 32, art. 25](https://eur-lex.europa.eu/eli/reg/2016/679/oj/fra) | Les entraînements restent dans le navigateur. Sur un ordinateur partagé (organisme, médiathèque, famille), la personne suivante peut rouvrir l'espace : le bouton de l'en-tête « Se déconnecter » ne supprime rien, et « Mon espace » rouvre le dernier espace utilisé (`lastSpace`). | Dire clairement ce que fait « Quitter » (les données restent). Ajouter au moment de l'accord et dans « Vos données » la question « Cet appareil est-il partagé ? » avec la consigne de supprimer en partant. Ne pas mémoriser `lastSpace` si la personne déclare un appareil partagé. | Recommandé (prototype), Obligatoire (sécurité en production) |
| R15 | Important | [RGPD art. 5(1)(a)](https://eur-lex.europa.eu/eli/reg/2016/679/oj/fra) (loyauté, transparence) | Trois phrases des CGU sont inexactes. « Aucun retour n'est transmis sans la médiation de votre coach » : le retour de l'assistant s'affiche directement, sans coach. « L'outil est hébergé par l'organisme qui vous accompagne » : faux aujourd'hui. « Si vous partagez (ou demandez à la rejouer) » : formule incompréhensible. | Réécrire (textes en section 5). Formule exacte : « Le retour de l'assistant s'affiche tout de suite. Votre coach ne le voit que si vous le lui envoyez. Il peut alors le compléter ou le contredire. » | Obligatoire |
| R16 | Recommandé | [RGPD art. 17, art. 7(3)](https://eur-lex.europa.eu/eli/reg/2016/679/oj/fra) | Une fois une réponse envoyée, la seule façon de revenir en arrière est de la supprimer entièrement. L'assistant dit « vous pouvez lui demander de la supprimer de son côté ». | Ajouter « Reprendre mon envoi » : le coach ne voit plus la réponse, la personne la garde. En production, la suppression par la personne doit supprimer aussi la copie serveur, sans passer par le coach. | Recommandé (prototype), Obligatoire (effacement effectif en production) |

### 2.2 Sous-traitants, transferts et services tiers

| # | Priorité | Référence | Constat | Recommandation | Nature |
|---|---|---|---|---|---|
| T1 | Bloquant | [RGPD art. 5(1)(a), 6, 44 et suivants](https://eur-lex.europa.eu/eli/reg/2016/679/oj/fra) ; à titre d'illustration, LG München I, 20 janv. 2022, 3 O 17493/20 (non vérifié à la source) | `GStyle` (`src/ui.jsx`) charge Manrope, Inter et JetBrains Mono par `@import url('https://fonts.googleapis.com/...')`. Chaque visite envoie l'adresse IP et l'agent du navigateur à Google, dès la page d'accueil, sans information ni base légale évidente. | Auto-héberger les polices (paquets `@fontsource/manrope`, `@fontsource/inter`, `@fontsource/jetbrains-mono`, ou fichiers WOFF2 dans `public/fonts/`). Correction simple, à faire dès maintenant sur le site public. Bénéfice annexe : affichage plus rapide et fonctionnement hors ligne. | Obligatoire en pratique (aucune nécessité ne justifie l'appel à un tiers) |
| T2 | Bloquant | Idem ; [RGPD art. 32](https://eur-lex.europa.eu/eli/reg/2016/679/oj/fra) | Au premier retour, le navigateur télécharge Whisper depuis `huggingface.co` (Hugging Face, États-Unis), le modèle de visage depuis `storage.googleapis.com` (Google) et le moteur MediaPipe depuis `cdn.jsdelivr.net`, avec l'étiquette `@latest` : le code exécuté peut changer sans contrôle. | Auto-héberger les trois (variables `VITE_MODELS_BASE_URL`, `VITE_MEDIAPIPE_WASM`, `VITE_FACE_MODEL`, `VITE_SEGMENTER_MODEL` déjà prévues). En attendant, figer la version (`@0.10.x` au lieu de `@latest`) et informer avant le téléchargement. | Obligatoire en production, Important tout de suite |
| T3 | Important | [RGPD art. 4(1)](https://eur-lex.europa.eu/eli/reg/2016/679/oj/fra) ; CJUE, 19 oct. 2016, Breyer, C-582/14 (non vérifié à la source) | Le README et la FAQ affirment : « Ce téléchargement ne transmet aucune donnée personnelle ». L'adresse IP est une donnée personnelle. | Formule exacte : « Votre vidéo et votre voix ne sont pas envoyées. Comme pour tout site, le serveur qui fournit ces fichiers voit l'adresse internet (IP) de votre appareil. » | Obligatoire (exactitude) |
| T4 | Important | [RGPD art. 13(1)(e) et (f), art. 28](https://eur-lex.europa.eu/eli/reg/2016/679/oj/fra) ; décision d'adéquation [(UE) 2023/1795](https://eur-lex.europa.eu/eli/dec_impl/2023/1795/oj) (cadre UE-États-Unis) | Le site est hébergé par GitHub Pages (GitHub, Inc., groupe Microsoft, États-Unis), qui reçoit les adresses IP des visiteurs. Ce n'est dit nulle part. | Prototype : le dire dans les mentions légales et dans « Vos données ». Production : hébergement en France ou dans l'Union, avec contrat de sous-traitance. Si un prestataire américain subsiste, vérifier sa certification au cadre UE-États-Unis et le mentionner. Ce cadre fait l'objet d'un pourvoi pendant (affaire C-703/25 P) : à suivre par le DPO. | Obligatoire |
| T5 | Important | [RGPD art. 13(1)(e)](https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre3#Article13), art. 28 | Si `VITE_LLM_ENDPOINT` ou `VITE_STT_ENDPOINT` sont activés, le texte de la réponse (ou le son, pour la transcription serveur) part vers un prestataire. La notice dit « hébergé en France » sans nommer personne. Avec la transcription serveur, la promesse « le son ne quitte pas l'appareil » devient fausse, alors que le texte du cycle de vie dit « jamais l'image ni le son ». | Nommer le prestataire et le pays. Lier le texte affiché à la configuration réelle : si la transcription serveur est active, l'écran d'accord et le cycle de vie doivent le dire. Recueillir un accord distinct pour l'envoi du texte à un modèle de langage. | Obligatoire |

### 2.3 Stockage sur l'appareil et traceurs

| # | Priorité | Référence | Constat | Recommandation | Nature |
|---|---|---|---|---|---|
| S1 | Important | [Loi Informatique et libertés, art. 82](https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000886460) ; [CNIL, « Cookies et autres traceurs : que dit la loi ? »](https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/que-dit-la-loi) ; lignes directrices CNIL du 17 sept. 2020 | L'article 82 vise toute écriture ou lecture sur le terminal, pas seulement les cookies. Le site écrit dans `localStorage` (`larepet.v1`, `larepet.warmup.CODE`), dans IndexedDB (`larepet`, vidéos) et dans le cache du navigateur (modèles, environ 85 Mo). Ces usages sont **strictement nécessaires au service demandé** : pas de consentement, pas de bandeau. Mais aucune page ne les explique. | Ne pas ajouter de bandeau cookies : il serait inutile et trompeur. Ajouter une rubrique « Ce qui est gardé sur cet appareil » (texte en 5.6) avec la liste, l'utilité et la façon d'effacer. Maintenir l'absence de tout traceur de mesure d'audience ou de tiers ; si une mesure d'audience est ajoutée un jour, choisir une solution exemptée et la documenter. | Obligatoire (pas de consentement requis), Recommandé (information) |
| S2 | Important | Idem | Le parcours d'essai `REPETE` est écrit dans `localStorage` dès le premier chargement de n'importe quelle page, avant toute action. | Créer le parcours d'essai au moment où la personne saisit le code, pas au chargement. À défaut, le signaler dans la rubrique. | Recommandé |
| S3 | Recommandé | [RGPD art. 12(1)](https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre3#Article12) | Le téléchargement des modèles (environ 85 Mo) n'est pas annoncé avant de commencer. Pour un public qui utilise souvent un forfait mobile limité, c'est une information utile. Certains navigateurs effacent seuls les données d'un site peu visité : la personne peut perdre ses entraînements sans comprendre. | Avant le premier retour : « La première fois, votre appareil télécharge un outil d'analyse (85 Mo). Préférez le Wi-Fi. » Dans « Vos données » : « Votre navigateur peut effacer vos entraînements si vous ne venez pas pendant plusieurs semaines. » | Recommandé |

### 2.4 Règlement sur l'IA (AI Act)

| # | Priorité | Référence | Constat | Recommandation | Nature |
|---|---|---|---|---|---|
| A1 | Bloquant | [Règlement (UE) 2024/1689, art. 6(2) à 6(4), annexe III points 3 et 4](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/fra), modifié par le [règlement (UE) 2026/1744](https://eur-lex.europa.eu/eli/reg/2026/1744/oj/fra) | La notice affiche : « Système classé haut risque au sens de l'AI Act (usage en contexte d'emploi). Les obligations associées [...] sont intégrées à la conception. » La FAQ dit au contraire que la qualification « reste à faire ». Les deux phrases se contredisent, et la première est doublement risquée : la qualification n'est pas établie (analyse en 2.5), et si elle l'était, les obligations ne sont pas remplies (pas d'évaluation de conformité, pas de documentation technique, pas de journalisation). | Retirer cette phrase de la notice destinée aux bénéficiaires. Documenter la qualification dans un dossier interne signé par le juridique. Garder dans l'interface des engagements vérifiables : pas d'émotion, pas de note, un humain relit. | Obligatoire (ne pas afficher une information inexacte), À valider (qualification) |
| A2 | Important | [AI Act art. 50(1) et 50(5)](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/fra), applicable depuis le 2 août 2026 | Les personnes doivent savoir qu'elles interagissent avec un système d'IA, de façon claire, au plus tard à la première interaction. L'interface parle d'« assistant » sans jamais dire nettement « c'est un programme, pas une personne ». Le titre de l'onglet dit « Coach IA », alors que le coach est un humain : confusion possible. | Écrire au premier contact : « L'assistant est un programme informatique (IA). Ce n'est pas une personne. » Sur le retour : « Retour préparé automatiquement. Aucune personne ne l'a relu. » Sur le rapport du coach : « Écrit par votre coach ». Remplacer « Coach IA d'entretien » dans `index.html` par « Entraînement à l'entretien, avec un assistant IA et votre coach ». | Obligatoire (dès qu'un système d'IA interagit avec la personne), Recommandé pour le moteur local à règles |
| A3 | Important | [AI Act art. 50(2)](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/fra) ; délai de mise en conformité au 2 déc. 2026 pour les systèmes déjà sur le marché ([règlement (UE) 2026/1744](https://eur-lex.europa.eu/eli/reg/2026/1744/oj/fra), art. 111(4) modifié) | Si la reformulation par un modèle de langage est activée, le texte du retour est un contenu généré. L'obligation de marquage pèse sur le fournisseur du système génératif ; l'intégrateur doit au minimum ne pas l'effacer et informer. Le champ `analysis.source` (`"llm"` ou `"local"`) existe mais n'est pas affiché. | Afficher sous le retour : « Texte reformulé par un modèle de langage » quand `source === "llm"`. Conserver ce champ dans le rapport envoyé au coach et dans l'export. | Recommandé (intégrateur), À valider |
| A4 | Recommandé | [AI Act art. 5(1)(f), art. 3(39)](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/fra) (applicable depuis le 2 févr. 2025, non modifié par le règlement 2026/1744) | L'exclusion des émotions est réelle dans le code (`gaze.js` ne lit que les coefficients du regard, `isCompliant` filtre les sorties). Le texte dit que l'inférence d'émotions est interdite « en contexte d'emploi et de formation ». Le texte exact vise « le lieu de travail et les établissements d'enseignement », sauf raisons médicales ou de sécurité. | Garder l'engagement, qui est plus large que la loi et c'est très bien. Citer le texte avec ses mots, et présenter d'abord l'engagement, ensuite la loi : « Nous avons choisi de ne pas le faire. La loi européenne l'interdit aussi au travail et à l'école. » | Recommandé |
| A5 | Important | [AI Act art. 4](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/fra), dans sa rédaction issue du [règlement (UE) 2026/1744](https://eur-lex.europa.eu/eli/reg/2026/1744/oj/fra) | Fournisseurs et déployeurs prennent des mesures pour favoriser la maîtrise de l'IA par leur personnel. Rien n'est prévu pour les coachs. | Une fiche d'une page et un temps de formation pour les coachs : ce que l'assistant mesure, ses limites (accents, bruit, lumière, handicap), comment le contredire. La ressource « relire une prise et préparer le débriefing » peut servir de base. | Obligatoire (mesures), Recommandé (forme) |
| A6 | Important | [AI Act art. 10, 26, 27](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/fra) si le système est à haut risque ; [RGPD art. 5(1)(d)](https://eur-lex.europa.eu/eli/reg/2016/679/oj/fra) | Les seuils de `analysis.js` et `gaze.js` ne sont pas validés sur des prises réelles (README, point 6). Les repères de débit, de pauses ou de regard peuvent désavantager des personnes avec un accent, un bégaiement, un trouble de la vision, un handicap, ou une autre culture du regard. | Mener l'audit de biais prévu. En attendant, l'écrire à la personne : « Ces repères sont des habitudes d'entretien en France. Ils ne conviennent pas à tout le monde. Si un repère ne vous correspond pas, parlez-en à votre coach. » Permettre de désactiver le suivi du regard seul. | Recommandé maintenant, Obligatoire si haut risque |

### 2.5 Catégorie de risque : analyse

Cette analyse est une aide à la décision. Elle ne remplace pas la qualification par le juridique.

**Ce qui est acquis.**

- **Pratique interdite (art. 5(1)(f)) : non.** Le système ne déduit aucune émotion. C'est vérifiable dans le code et testé (`tests/analysis.test.mjs`). Il faut le maintenir, y compris avec un modèle de langage : le filtre `isCompliant` (`src/lib/compliance.js`) est un garde-fou lexical, pas une garantie. La liste des coefficients lus par le suivi du regard est dans `src/lib/gazeKeys.js` ; `tests/analysis.test.mjs` échoue si une clé ne commence pas par `eyeLook`.
- **Annexe III, point 1 (biométrie) : non.** Pas d'identification, pas de catégorisation, pas de reconnaissance d'émotions. Le suivi du regard utilise des repères du visage, donc des données biométriques au sens large, mais pour aucun de ces usages.

**Ce qui est discutable.**

- **Annexe III, point 4 (emploi).** Le point 4 vise le recrutement et la sélection (annonces ciblées, tri, évaluation des candidats) et la gestion des travailleurs (conditions, promotion, licenciement, attribution de tâches, suivi des performances). La Répét' ne fait rien de cela : aucun employeur ne voit les prises, aucune candidature n'est évaluée, la personne n'est pas dans une relation de travail avec l'organisme. **Le point 4 ne paraît pas applicable**, tant que les prises et les retours ne sont jamais transmis à un employeur, à un prescripteur ou à un financeur, et ne servent pas à décider d'une orientation ou d'un droit. L'affirmation actuelle « haut risque (usage en contexte d'emploi) » est donc probablement mal fondée.
- **Annexe III, point 3(b) (éducation et formation professionnelle).** Il vise les systèmes destinés à évaluer les acquis d'apprentissage, y compris quand cette évaluation oriente le parcours d'apprentissage, dans les établissements d'enseignement et de formation professionnelle. **C'est le rattachement le plus sérieux.** Si l'organisme est un organisme de formation, et si l'on considère qu'un retour qui classe des observations en « points d'appui » et « points à explorer » évalue un acquis, le système entre dans le champ. L'absence de note réduit ce risque sans l'écarter.

**La dérogation de l'article 6(3).** Un système de l'annexe III n'est pas à haut risque s'il ne présente pas de risque important, notamment parce qu'il n'influence pas de façon significative une décision. Ici aucune décision n'est prise : le retour va à la personne, puis au coach si elle le veut. Deux réserves :

1. La dérogation est **exclue** si le système effectue un **profilage** (dernier alinéa de l'article 6(3)). Le profilage, au sens du RGPD (art. 4(4)), est un traitement automatisé qui évalue des aspects personnels, par exemple le comportement. Décrire la façon de parler et de regarder d'une personne peut y être assimilé. C'est le point qui demande l'avis du juriste.
2. Le fournisseur qui invoque la dérogation doit **documenter** son évaluation avant la mise en service (art. 6(4)) et **enregistrer** le système dans la base de données de l'Union (art. 49(2), contenu allégé par le règlement 2026/1744).

**Qui porte les obligations.** Un organisme qui développe l'outil en interne et le met en service sous son nom est à la fois **fournisseur** et **déployeur**. S'il est à haut risque, il doit notamment : gestion des risques, gouvernance des données, documentation technique, journalisation, contrôle humain, exactitude et robustesse (art. 9 à 15), système de qualité, évaluation de conformité, déclaration UE, marquage, enregistrement (art. 16, 17, 43, 47 à 49), puis, comme déployeur, information des personnes (art. 26(11)) et analyse d'impact sur les droits fondamentaux s'il est un organisme public ou chargé d'un service public (art. 27).

**Calendrier.** Les obligations des systèmes à haut risque de l'annexe III s'appliquent à partir du **2 décembre 2027** (et non plus du 2 août 2026), depuis le règlement (UE) 2026/1744 entré en vigueur le 27 juillet 2026. L'interdiction de l'article 5(1)(f) s'applique depuis le 2 février 2025. L'article 50 s'applique depuis le 2 août 2026.

**Recommandation.**

1. Écrire une note de qualification de deux pages (destination, utilisateurs, ce que le système fait et ne fait pas, analyse des points 3 et 4, position sur le profilage, conclusion). La faire signer.
2. Verrouiller la destination dans les CGU et le contrat avec chaque organisme : usage d'entraînement seulement, jamais de transmission à un employeur ou à un prescripteur, jamais d'usage pour décider.
3. Continuer à concevoir « comme si » le système était à haut risque (contrôle humain, journalisation, audit de biais) : c'est cohérent avec le public et cela protège si la qualification est contestée.
4. Ne rien affirmer dans l'interface tant que la note n'est pas validée.

### 2.6 Mentions légales et CGU

| # | Priorité | Référence | Constat | Recommandation | Nature |
|---|---|---|---|---|---|
| L1 | Bloquant | [Loi n° 2004-575 du 21 juin 2004 (LCEN), art. 1-1](https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000801164) (ancien art. 6, III, déplacé par la loi n° 2024-449 du 21 mai 2024) ; sanction à l'art. 1-2 | Aucune page de mentions légales. Le site public est en ligne sans éditeur identifié, sans directeur de la publication, sans hébergeur. | Créer `#/mentions-legales` (gabarit en 5.9) : éditeur (nom ou raison sociale, forme, adresse, téléphone ou courriel, numéro d'immatriculation s'il existe), directeur de la publication, hébergeur (nom, adresse, téléphone). Lien dans le pied de page de toutes les pages. Un éditeur particulier non professionnel peut ne donner que l'hébergeur, s'il lui a communiqué son identité. | Obligatoire |
| L2 | Important | [Code civil, art. 1119](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032040926) ; loyauté de l'information | Les CGU sont un « résumé », en fenêtre modale, acceptées par la phrase « En continuant, vous confirmez avoir pris connaissance ». Elles mélangent des règles d'usage et des promesses sur les données. | Une page `#/conditions`, courte, en langage clair (texte en 5.8), datée et versionnée. Y laisser les règles d'usage et renvoyer à « Vos données » pour le reste. | Recommandé, À valider |
| L3 | Recommandé | AGENTS.md, règle « aucun nom inventé présenté comme réel » | La connexion coach simulée pré-remplit `s.martin@famickael.fr`, une adresse d'apparence réelle sur un nom de domaine qui peut exister. | Utiliser un domaine réservé aux exemples (`sophie.m@exemple.fr` ou `.example`) et afficher « Connexion de démonstration : aucun mot de passe n'est vérifié ». | Recommandé |

### 2.7 Accessibilité

| # | Priorité | Référence | Constat | Recommandation | Nature |
|---|---|---|---|---|---|
| X1 | Bloquant si l'organisme est assujetti | [Loi n° 2005-102, art. 47](https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000809647) ; décret n° 2019-768 ; [champ d'application](https://accessibilite.numerique.gouv.fr/obligations/champ-application/) ; [mentions et pages obligatoires](https://accessibilite.numerique.gouv.fr/obligations/mentions-et-pages-obligatoires/) | Sont assujettis : les personnes publiques, les organismes privés chargés d'une mission de service public ou d'intérêt général financés ou contrôlés par le public, et les entreprises de plus de 250 millions d'euros de chiffre d'affaires. Beaucoup d'organismes d'accompagnement vers l'emploi entrent dans la deuxième catégorie. Le site n'a ni mention en page d'accueil, ni page « Accessibilité », ni déclaration. | Créer `#/accessibilite` (gabarit en 5.10) avec la déclaration, le schéma pluriannuel et le plan annuel (ou leurs liens). Afficher sur toutes les pages la mention exacte « Accessibilité : non conforme » tant qu'aucun audit n'est valide, puis « partiellement conforme » à partir de 50 % de critères respectés. Donner un moyen de signaler un problème. | Obligatoire si assujetti, Recommandé sinon |
| X2 | Important | [RGAA 4.1.2](https://accessibilite.numerique.gouv.fr/), thèmes 7 (scripts) et 12 (navigation) ; WCAG 2.1, critères 4.1.2 et 2.4.3 | `LegalModal` (`src/legal.jsx`) n'a ni `role="dialog"`, ni `aria-modal`, ni nom accessible, ni piège de focus, ni retour du focus à la fermeture. Le lecteur d'écran continue de lire la page derrière. | Si les fenêtres sont conservées pour le niveau « résumé » : `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus placé sur le titre, focus retenu, retour au bouton d'origine. Le menu mobile de `App.jsx` fait déjà tout cela et peut servir de modèle. | Obligatoire si assujetti |
| X3 | Important | RGAA 4.1.2, critère 8.6 (titre de page pertinent) ; WCAG 2.4.2 | Le titre du document ne change jamais (`document.title` n'est jamais mis à jour). Toutes les pages s'appellent « La Répét' · Coach IA d'entretien ». | Mettre à jour `document.title` à chaque changement de route, y compris pour les nouvelles pages légales. | Obligatoire si assujetti |
| X4 | Important | RGAA 4.1.2, critères 9.1 (titres), 9.3 (listes), 10.4 (agrandissement) ; [RGPD art. 12(1)](https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre3#Article12) | Les textes légaux sont en 11 à 13,5 px, avec des intertitres en capitales qui sont des `div` et non des titres, et des paires libellé et valeur qui ne sont pas des listes de définitions. La mention « Responsable de traitement » est en 11 px gris clair. Les émojis (cadenas, balance) sont lus de façon variable par les lecteurs d'écran. | Corps de texte à 16 px minimum, interligne 1,6, lignes de 70 caractères au plus. Vrais titres (`h2`, `h3`), listes `dl`. Pas de capitales pour des phrases. Pictogrammes en SVG décoratifs (`aria-hidden`), jamais porteurs seuls du sens. | Obligatoire si assujetti, Recommandé sinon |
| X5 | Recommandé | [CNIL, « Information des personnes et transparence »](https://www.cnil.fr/fr/conformite-rgpd-information-des-personnes-et-transparence) (vocabulaire simple, phrases courtes, plusieurs niveaux, attention aux personnes vulnérables) ; règles européennes du facile à lire et à comprendre (Inclusion Europe) | Vocabulaire à remplacer : « cycle de vie », « consentement granulaire », « inférence », « responsable de traitement », « notice », « prise », « horodaté », « traitement local ». L'écriture avec point médian (« stressé·e », « seul·e », « prêt·e », « recontacté·e ») gêne les lecteurs d'écran et les personnes en difficulté avec l'écrit. | Lexique en 5.11. Tournures sans point médian : « si vous ressentez du stress », « c'est vous qui décidez », « quand vous voulez ». | Recommandé |
| X6 | Recommandé | [RGPD art. 12(1)](https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre3#Article12) (l'information peut être donnée par d'autres moyens, y compris oralement) | Une partie du public lit difficilement le français. | Un bouton « Écouter » sur les résumés (synthèse vocale du navigateur, `speechSynthesis`, qui reste locale), une version imprimable d'une page que le coach remet et lit avec la personne, puis des traductions des résumés dans les langues les plus fréquentes du public. | Recommandé |

### 2.8 Formulaire de démo, assistant, durées proposées

| # | Priorité | Référence | Constat | Recommandation | Nature |
|---|---|---|---|---|---|
| D1 | Important | [RGPD art. 13](https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre3#Article13), art. 6(1)(b) ou (f) | Aujourd'hui le formulaire n'envoie rien : la phrase « Le site ne conserve ni ne transmet vos coordonnées » est exacte et bien placée. Avec `VITE_CONTACT_EMAIL`, les coordonnées partent par la messagerie de la personne vers l'organisme, qui devient responsable de leur traitement : il manque alors qui reçoit, pour quoi faire, combien de temps, quels droits. | Sous le bouton, quand l'envoi est actif : le texte 5.7. Durée proposée : 3 ans après le dernier contact pour un prospect professionnel (référentiel CNIL de gestion commerciale, à confirmer), ou moins. | Obligatoire dès que l'envoi est actif |
| D2 | Important | [RGPD art. 6, art. 7(4)](https://eur-lex.europa.eu/eli/reg/2016/679/oj/fra) | La case obligatoire « J'accepte d'être recontacté·e » fait du consentement la condition de la demande. Répondre à une demande de démonstration ne repose pas sur le consentement mais sur la demande elle-même (mesures précontractuelles ou intérêt légitime). Un consentement obligatoire n'est pas libre. | Supprimer la case. La remplacer par une phrase d'information. Ne garder une case, décochée et facultative, que pour un usage distinct (recevoir des nouvelles du projet). | Obligatoire (cohérence de la base légale) |
| D3 | Recommandé | [RGPD art. 5(1)(c)](https://eur-lex.europa.eu/eli/reg/2016/679/oj/fra) (minimisation) | Sept champs obligatoires, dont « personnes accompagnées par an ». | Rendre facultatifs la fonction et le volume. | Recommandé |
| D4 | Recommandé | [AI Act art. 50(1)](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/fra) ; [RGPD art. 13](https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre3#Article13) | L'assistant affiche déjà une mention exacte et adaptée à la configuration (« Les réponses sont préparées sur cet appareil : vos questions n'en sortent pas » ou « transmises au service de l'assistant »). C'est une bonne pratique. Elle est en 11,5 px, sous le champ. Les questions ne sont pas conservées (état en mémoire, perdu en quittant l'écran) : ce n'est pas dit. Le métier visé est joint à chaque appel au modèle de langage : ce n'est pas dit non plus. | Remonter la mention au-dessus du champ, à 14 px au moins, avec les textes 5.5. Avec un modèle de langage : nommer le prestataire dans « Vos données » et préciser ce qui est envoyé (les derniers messages et le métier visé) et la durée de conservation chez lui. | Recommandé (local), Obligatoire (modèle de langage) |

**Durées de conservation proposées (hypothèses de travail, à valider par le DPO).**

| Donnée | Prototype (réalité actuelle) | Proposition pour la production |
|---|---|---|
| Échauffement (image, son) | Jamais enregistré | Jamais enregistré |
| Réponses au questionnaire de fin d'échauffement | Sur l'appareil, jusqu'à suppression | Sur l'appareil seulement, effacées au retrait de l'accord |
| Entraînements non envoyés | Sur l'appareil, jusqu'à suppression ou effacement par le navigateur | Sur l'appareil seulement ; suppression automatique proposée après 3 mois sans visite |
| Entraînements envoyés au coach et rapports | Sur l'appareil | Serveur : jusqu'à la fin de l'accompagnement, plus 3 mois ; 12 mois au plus après l'envoi |
| Code d'accès et parcours | Sans limite | Expiration à la fin de l'accompagnement ; 6 mois sans activité au plus |
| Preuve de l'accord et de son retrait | Date de l'accord seulement | Durée de l'accompagnement plus la durée de prescription retenue par le juridique |
| Journaux d'accès | Aucun | 6 mois à 1 an (recommandation CNIL sur la journalisation, non vérifiée à la source) |
| Demandes de démonstration | Rien n'est conservé | 3 ans après le dernier contact au plus |

---

## 3. Réponse à la question 1 : où mettre « Cycle de vie de la vidéo » ?

**Réponse courte.** Le lien de pied de page est utile, mais il ne peut pas être le lieu principal de cette information, et il ne doit pas ouvrir une fenêtre modale. Il faut une **page dédiée**, rangée dans un centre **« Vos données »**, avec une adresse que l'on peut partager. Il ne faut **pas** ajouter « Cycle de vie de la vidéo » à la navigation principale : il faut y ajouter **une seule entrée, « Vos données »**, dans l'espace bénéficiaire et dans le pied de page. Et surtout, l'information doit rester **là où la question se pose** : sous la caméra, sur l'écran d'accord, sur l'écran d'envoi.

**Pourquoi le lien discret en bas à droite ne suffit pas.**

1. **Ce n'est pas l'endroit où l'on se pose la question.** Personne ne descend en pied de page au moment d'allumer sa caméra. Le bouton « Que devient ma vidéo ? » sous la caméra est, lui, exactement au bon endroit : c'est lui le lieu principal, il faut le garder et s'en inspirer.
2. **Le libellé est un terme d'ingénieur.** « Cycle de vie » ne dit rien à quelqu'un qui cherche « est-ce que mon coach va voir ça ? ». Le site utilise déjà la bonne formule ailleurs : « Que devient ma vidéo ? ». Il faut un seul libellé partout.
3. **Le bas à droite est la position la moins lue**, et sur téléphone le lien arrive en dernier, après onze autres liens.
4. **Une fenêtre modale n'a pas d'adresse.** Le coach ne peut pas envoyer le lien, l'écran d'accord ne peut pas renvoyer vers une version datée, le bouton Retour du navigateur ne ferme pas la fenêtre, on ne peut pas l'imprimer proprement. L'article 12 du RGPD demande une information « aisément accessible », et la CNIL recommande un accès direct et permanent.
5. **Trois liens côte à côte** (« Conditions d'utilisation », « Protection des données », « Cycle de vie de la vidéo ») obligent la personne à deviner dans lequel se trouve sa réponse.

**Pourquoi pas dans la navigation principale.** L'en-tête public compte déjà trois liens et deux boutons, et s'adresse surtout aux organismes. Une entrée par sujet légal la surchargerait. En revanche, dans l'**espace bénéficiaire**, l'en-tête ne montre aujourd'hui que la pastille de l'espace : c'est là qu'une entrée « Vos données » a toute sa place, visible en permanence, à un clic.

**Ce que je recommande.** Voir l'architecture en section 4. En résumé :

| Emplacement | Aujourd'hui | Recommandé |
|---|---|---|
| Sous la caméra (entraînement, échauffement) | Bouton « Que devient ma vidéo ? » qui ouvre une fenêtre | Le garder. Il ouvre le résumé en cinq étapes, avec un lien « Tout lire » vers la page. |
| Écran d'accord | Trois liens dans une phrase | Le résumé en trois pictogrammes sur l'écran lui-même, puis un lien « Tout lire sur vos données ». |
| Écran d'envoi au coach | Une phrase | Trois puces : qui voit, combien de temps, comment revenir en arrière. |
| En-tête de l'espace bénéficiaire et coach | Rien | Un lien « Vos données » avec le pictogramme bouclier. |
| Pied de page | Trois boutons qui ouvrent des fenêtres | Des liens vers des pages : « Vos données », « Que devient ma vidéo ? », « Conditions d'utilisation », « Mentions légales », « Accessibilité : non conforme ». |
| Page d'accueil et page Solutions | Bandeau d'engagements non cliquable | Chaque engagement devient un lien vers la rubrique correspondante de « Vos données ». |
| Assistant | Répond déjà à « Que devient ma vidéo ? » | Sa réponse se termine par le lien vers la page. |

---

## 4. Architecture de l'information légale recommandée

### 4.1 Principe : trois niveaux, un seul fonds de textes

| Niveau | Forme | Où | Longueur |
|---|---|---|---|
| **1. La phrase** | Une ligne avec un pictogramme, toujours visible | Sur l'écran où la question se pose | 15 mots au plus |
| **2. Le résumé** | 3 à 5 puces avec pictogrammes, dans un panneau ou une fenêtre accessible, et en haut de chaque page | Ouvert depuis la phrase (« En savoir plus ») | Lisible en 30 secondes |
| **3. Le texte complet** | Une page avec une adresse, datée, imprimable | Centre « Vos données » | Complet au sens de l'article 13 |

Les trois niveaux sortent d'un **même fichier de contenu** (par exemple `src/content/legal.js`), pour qu'une phrase ne contredise jamais la page. Chaque texte porte une version et une date ; la version acceptée est enregistrée avec l'accord.

### 4.2 Pages et routes

Les routes suivent la convention du site (ancre, minuscules, tirets).

| Route | Titre de la page | Libellé du lien | Contenu | Remplace |
|---|---|---|---|---|
| `#/vos-donnees` | Vos données, vos choix | Vos données | Page d'entrée : l'essentiel en six cartes avec pictogrammes, puis les actions (« Supprimer un entraînement », « Tout supprimer », « Nous écrire ») | Le lien « Protection des données » |
| `#/vos-donnees/video` | Que devient ma vidéo ? | Que devient ma vidéo ? | Les cinq étapes, en version prototype ou production | Fenêtre `lifecycle` |
| `#/vos-donnees/assistant` | Ce que fait l'assistant, et ce qu'il ne fait pas | L'assistant et l'IA | C'est un programme ; ce qu'il observe ; pas de note ; pas d'émotion ; les repères ne conviennent pas à tout le monde ; le coach peut contredire | Fenêtre `emotion`, mention de transparence IA |
| `#/vos-donnees/droits` | Vos droits | Vos droits | Supprimer, récupérer, corriger, changer d'avis, se plaindre ; à qui écrire ; délai d'un mois | Ligne « Vos droits » de la notice |
| `#/vos-donnees/appareil` | Ce qui est gardé sur cet appareil | Sur cet appareil (pas de cookies publicitaires) | Stockage local, cache des modèles, appareil partagé, comment effacer | Rien aujourd'hui |
| `#/vos-donnees/notice` | Information complète sur vos données | Le texte complet | Notice au sens de l'article 13 : responsable, DPO, finalités, base, destinataires, sous-traitants, transferts, durées, droits, CNIL | Fenêtre `rgpd` |
| `#/vos-donnees/coachs` | Coachs : vos données | Coachs : vos données | Notice courte pour les coachs | Rien aujourd'hui |
| `#/conditions` | Règles d'utilisation | Conditions d'utilisation | CGU en langage clair | Fenêtre `cgu` |
| `#/mentions-legales` | Mentions légales | Mentions légales | Éditeur, directeur de la publication, hébergeur, crédits | Rien aujourd'hui |
| `#/accessibilite` | Accessibilité | Accessibilité : non conforme | Déclaration, schéma, plan, contact | Rien aujourd'hui |

Remarques de mise en œuvre :

- Dans `routeFromHash` (`src/App.jsx`), ajouter un motif sur le modèle de `a-propos` : `^#\/vos-donnees(?:\/([a-z-]+))?$`, et trois routes simples.
- Ajouter ces rôles à la liste `PUBLIC` et mettre à jour `document.title` pour chaque route.
- Depuis l'espace bénéficiaire, ouvrir ces pages **sans perdre l'entraînement en cours** : au milieu d'un parcours (enregistrement, envoi), ouvrir le résumé dans un panneau ; le lien « Tout lire » s'ouvre dans un nouvel onglet, avec la mention « (nouvel onglet) ». Hors parcours, navigation normale, avec un lien « Retour à mon espace ».
- Conserver un composant de dialogue pour le niveau 2, mais accessible (écart X2).

### 4.3 Navigation

| Zone | Contenu recommandé |
|---|---|
| **En-tête public** | Inchangé : À propos, Solutions, Ressources. Pas d'entrée légale. |
| **En-tête de l'espace bénéficiaire** | À gauche de la pastille de l'espace : lien « Vos données » (pictogramme bouclier et texte ; sur téléphone, le pictogramme avec un nom accessible). Remplacer le nom accessible « Se déconnecter » par « Quitter mon espace », avec l'infobulle « Vos entraînements restent sur cet appareil ». |
| **En-tête de l'espace coach** | Lien « Vos données » vers `#/vos-donnees/coachs`. |
| **Menu mobile** | Après les trois pages : un groupe « Vos données » (Vos données, Que devient ma vidéo ?, Mentions légales, Accessibilité). |
| **Pied de page** | Trois groupes titrés, de gauche à droite : **Le site** (À propos, Solutions, Ressources, FAQ, Demander une démo) ; **Vos données** (Vos données, Que devient ma vidéo ?, L'assistant et l'IA, Vos droits) ; **Informations légales** (Conditions d'utilisation, Mentions légales, Accessibilité : non conforme). De vrais liens `<a href>`, pas des boutons. Sur téléphone, les groupes s'empilent, « Vos données » en premier. |
| **Bandeau d'engagements du pied de page** | Chaque engagement devient un lien : « La vidéo reste sur votre appareil » vers `/video`, « Envoi au coach seulement si vous le décidez » vers `/video`, « Sans note ni classement » et « Aucune émotion déduite » vers `/assistant`. |

### 4.4 Dans les parcours : la bonne phrase au bon moment

| Moment | Écran (composant) | Niveau 1 affiché | Niveau 2 ouvert par |
|---|---|---|---|
| Saisie du code | `CodeEntry`, `Espace` | « Aucun compte, aucun mot de passe. Votre code suffit. » | Lien « Vos données » |
| Accord | `Consent` | Trois pictogrammes : reste sur l'appareil ; vous décidez d'envoyer ; vous pouvez tout supprimer | « Tout lire sur vos données » |
| Choix du métier | `JobField` | « Le métier sert à adapter les questions. Votre coach le voit. » | Aucun |
| Échauffement | `WarmupStage` | « Rien n'est enregistré pendant l'échauffement. » | « Que devient ma vidéo ? » |
| Assistant | `Assistant` | « L'assistant est un programme, pas une personne. Vos questions restent sur cet appareil. » | « L'assistant et l'IA » |
| Avant d'enregistrer | `Recorder` | « Votre vidéo reste sur cet appareil. Vous décidez après. » | « Que devient ma vidéo ? » (déjà en place) |
| Premier retour (téléchargement) | `Processing` | « La première fois : téléchargement de 85 Mo. Préférez le Wi-Fi. » | « Sur cet appareil » |
| Retour de l'assistant | `TakeReport`, `ReportBody` | « Retour préparé automatiquement. Il décrit, il ne note pas. » | « L'assistant et l'IA » |
| Envoi au coach | `Share` | Trois puces : qui voit, combien de temps, comment reprendre | « Que devient ma vidéo ? » |
| Après l'envoi | `Sent` | « Vous pouvez reprendre votre envoi quand vous voulez, depuis votre espace. » | Aucun |
| Espace personnel | `Home` (bénéficiaire) | Sur chaque entraînement : « Sur cet appareil seulement » ou « Envoyé à votre coach » (déjà en place, à garder) | « Vos données » |
| Connexion coach | `Login` | « Vous ne voyez que les réponses que l'on vous envoie. » | « Coachs : vos données » |
| Demande de démo | `Demo` | Texte 5.7 sous le bouton | « Vos données » |

---

## 5. Textes en langage clair, prêts à intégrer

Règles suivies : vouvoiement, une idée par phrase, phrases de 15 mots au plus quand c'est possible, mots courants, verbes à l'actif, pas de point médian, pas de tiret cadratin, ton positif. Les pictogrammes sont indiqués entre crochets : ils correspondent aux icônes de `src/ui.jsx` (`I.lock`, `I.send`, `I.trash`, `I.shield`, `I.user`, `I.mic`, `I.ban`, `I.chat`) et sont décoratifs.

Les mentions `{{...}}` sont à remplacer par l'organisme. Les passages **[prototype]** et **[production]** sont deux variantes : n'en afficher qu'une.

### 5.1 Que devient ma vidéo ?

**Niveau 1, la phrase.**

- Sous la caméra : [cadenas] **Votre vidéo reste sur cet appareil. C'est vous qui décidez de l'envoyer.**
- À l'échauffement : [cadenas] **Rien n'est enregistré pendant l'échauffement.**

**Niveau 2, le résumé.**

- [cadenas] Votre vidéo est gardée **sur cet appareil**. Elle ne part nulle part.
- [bouclier] L'assistant la regarde **sur cet appareil**, pour préparer votre retour.
- [avion] Vous pouvez l'envoyer à votre coach. **Seulement si vous le voulez**, réponse par réponse.
- [personne] Votre coach est **la seule personne** qui la voit.
- [corbeille] Vous pouvez la **supprimer** quand vous voulez.

**Niveau 3, le texte complet.**

> **Que devient ma vidéo ?**
>
> **1. Vous vous enregistrez.**
> Votre vidéo et votre voix sont gardées sur cet appareil, dans votre navigateur. Rien n'est envoyé.
>
> **2. L'assistant prépare votre retour.**
> L'assistant est un programme. Il transforme votre voix en texte et regarde la direction de votre regard. Tout cela se passe sur cet appareil.
> **[production, si un modèle de langage est activé]** Pour mieux rédiger le retour, le texte de votre réponse est envoyé à {{prestataire}}, en {{pays}}. Jamais votre image. Jamais votre voix.
>
> **3. Vous gardez votre vidéo pour vous.**
> Si vous ne faites rien, votre vidéo reste sur cet appareil. Personne d'autre ne la voit. Vous pouvez la revoir ou la supprimer.
>
> **4. Vous décidez de l'envoyer à votre coach, ou non.**
> **[prototype]** Dans cette version d'essai, rien n'est envoyé sur internet. Votre coach voit votre réponse seulement s'il utilise le même appareil que vous.
> **[production]** Quand vous appuyez sur « Envoyer », votre vidéo part vers les serveurs de {{organisme}}, en France. L'envoi est protégé. Seul votre coach, {{prénom du coach}}, peut la voir.
>
> **5. Vous pouvez tout arrêter.**
> Vous pouvez supprimer une réponse. Vous pouvez aussi tout supprimer d'un coup. Vous n'avez pas à expliquer pourquoi.
> **[production]** Sans action de votre part, vos réponses envoyées sont supprimées {{durée}} après la fin de votre accompagnement.
>
> **Sur un ordinateur partagé ?**
> Supprimez vos entraînements avant de partir. Sinon, la personne suivante pourrait les ouvrir.
>
> **À retenir.** Rien ne quitte votre appareil sans votre accord.

### 5.2 L'assistant et l'IA

**Niveau 1, la phrase.**

- Au-dessus du retour : [bulle] **Retour préparé automatiquement par l'assistant. Il décrit, il ne note pas.**
- Avant d'enregistrer : [bouclier] **L'assistant ne cherche pas à savoir ce que vous ressentez.**
- Dans la conversation : [bulle] **L'assistant est un programme, pas une personne.**

**Niveau 2, le résumé.**

- [bulle] L'assistant est **un programme informatique** (une IA). Ce n'est pas une personne.
- [micro] Il observe **des faits** : la vitesse de votre voix, vos pauses, vos exemples, la direction de votre regard.
- [interdit] Il **ne met pas de note**. Il ne vous compare à personne.
- [bouclier] Il **ne devine pas vos émotions**. Il ne dit jamais si vous avez l'air à l'aise ou non.
- [personne] Votre **coach** peut compléter le retour, ou dire qu'il n'est pas d'accord.

**Niveau 3, le texte complet.**

> **Ce que fait l'assistant, et ce qu'il ne fait pas**
>
> **L'assistant est un programme.**
> C'est une intelligence artificielle (IA). Aucune personne ne lit son retour avant vous.
> Votre coach, lui, est une vraie personne. Ses remarques sont toujours signalées par « Votre coach ».
>
> **Ce qu'il observe.**
> - La vitesse à laquelle vous parlez.
> - Vos pauses.
> - Les exemples que vous donnez.
> - Les petits mots qui reviennent souvent, comme « euh » ou « du coup ».
> - L'ordre de vos idées.
> - La direction de votre regard, si vous utilisez la caméra.
>
> **Ce qu'il ne fait pas.**
> - Il ne met pas de note.
> - Il ne fait pas de classement.
> - Il ne devine pas vos émotions, ni votre caractère.
> - Il ne regarde pas les expressions de votre visage.
> - Il ne décide de rien. Son retour ne change rien à vos droits ni à votre accompagnement.
>
> **Pourquoi pas les émotions ?**
> Nous avons choisi de ne pas le faire. Une machine ne sait pas ce que vous ressentez.
> La loi européenne l'interdit aussi au travail et à l'école (règlement européen sur l'IA, article 5).
>
> **Ses limites.**
> L'assistant peut se tromper. Il comprend moins bien quand il y a du bruit, ou certains accents.
> Ses repères sont des habitudes d'entretien en France. Ils ne conviennent pas à tout le monde.
> Si un repère ne vous correspond pas, parlez-en à votre coach. C'est son avis qui compte.
>
> **Vous pouvez vous en passer.**
> Vous pouvez vous enregistrer et vous revoir sans le retour de l'assistant. Vous pouvez aussi vous entraîner avec la voix seulement, sans caméra.
>
> **[si un modèle de langage est activé]** Le retour est rédigé avec l'aide d'un modèle de langage, {{nom}}, fourni par {{prestataire}}. Il reçoit le texte de votre réponse et le métier que vous visez. Il ne reçoit ni votre image, ni votre voix, ni votre nom.

### 5.3 Votre accord (écran « Avant de commencer »)

**Niveau 1, la phrase** (sous le titre).

**Cet espace est le vôtre. Rien n'est noté. Rien n'est envoyé sans vous.**

**Niveau 2, le résumé** (sur l'écran, avant les cases).

- [cadenas] Vos entraînements restent **sur cet appareil**.
- [avion] Vous choisissez **ce que vous envoyez** à votre coach.
- [corbeille] Vous pouvez **tout supprimer** quand vous voulez.

**Les deux cases** (les deux décochées au départ).

> ☐ **Je veux m'enregistrer sur cet appareil.** (nécessaire pour s'entraîner)
> Ma vidéo et ma voix restent sur cet appareil.
>
> ☐ **Je veux recevoir un retour de l'assistant.** (au choix)
> L'assistant est un programme. Il décrit des faits : rythme, pauses, regard. Il ne met pas de note. Il ne devine pas les émotions.
> Sans cette case, vous pouvez quand même vous enregistrer et vous revoir.

**Sous les cases.**

> Vous pouvez refuser. Cela ne change rien à votre accompagnement : vous pouvez préparer votre entretien avec votre coach.
> Vous pouvez changer d'avis à tout moment, dans « Vos données ».
> [lien] Tout lire sur vos données · [lien] Règles d'utilisation

**Bouton.** « Je suis d'accord, je commence »

**Niveau 3.** La page « Information complète sur vos données » (5.6).

### 5.4 Envoyer une réponse au coach

**Niveau 1, la phrase.** [avion] **Seul votre coach verra cette réponse.**

**Niveau 2, le résumé** (sur l'écran d'envoi).

- [personne] **Qui la voit ?** Votre coach, {{prénom}}. Personne d'autre.
- [avion] **Qu'est-ce qui part ?** Votre vidéo (ou votre voix), le texte de votre réponse, le retour de l'assistant et votre mot.
- [corbeille] **Et si je change d'avis ?** Vous pouvez reprendre votre envoi ou supprimer la réponse, depuis votre espace.

**[prototype]** Dans cette version d'essai, rien ne part sur internet. Votre coach doit utiliser le même appareil que vous.

**Bouton.** « Envoyer à mon coach ». **Lien secondaire.** « Je la garde pour moi »

**Après l'envoi.** « C'est envoyé. {{Prénom}} va regarder votre réponse et vous écrire. Vous pouvez reprendre votre envoi quand vous voulez, depuis votre espace. »

**Niveau 3.** La page « Que devient ma vidéo ? », étape 4.

### 5.5 Assistant de conversation

**Niveau 1, la phrase** (au-dessus du champ de saisie).

- Moteur local : [cadenas] **Vos questions restent sur cet appareil. Elles sont effacées quand vous quittez cet écran.**
- Avec un modèle de langage : [bulle] **Vos questions sont envoyées à un service d'IA pour préparer la réponse. Ni image, ni son.**

Dans les deux cas, à la suite : **N'écrivez pas votre nom, votre adresse ou des informations sur votre santé.**

**Niveau 2, le résumé.**

- [bulle] Vous parlez à **un programme**, pas à une personne.
- [cadenas] Vos questions **ne sont pas gardées**.
- [personne] Pour une question sur votre situation, **votre coach** est la bonne personne.

**Niveau 3.** La page « L'assistant et l'IA » (5.2), complétée par ce paragraphe :

> **L'assistant de conversation.**
> Il répond à vos questions sur le site et sur la préparation d'un entretien.
> **[local]** Ses réponses viennent d'une liste préparée à l'avance, sur cet appareil. Vos questions ne sont envoyées nulle part. Elles ne sont pas enregistrées.
> **[modèle de langage]** Vos derniers messages et le métier que vous visez sont envoyés à {{prestataire}}, en {{pays}}, pour préparer la réponse. {{Prestataire}} les garde {{durée}} et ne s'en sert pas pour autre chose.

### 5.6 Vos données : page d'entrée, droits, appareil, texte complet

**Page d'entrée `#/vos-donnees` : six cartes.**

| Pictogramme | Titre | Une phrase | Lien |
|---|---|---|---|
| [cadenas] | Que devient ma vidéo ? | Elle reste sur cet appareil. Vous décidez de l'envoyer. | Que devient ma vidéo ? |
| [bulle] | L'assistant et l'IA | Un programme qui décrit des faits. Pas de note, pas d'émotion. | L'assistant et l'IA |
| [personne] | Qui voit quoi ? | Votre coach voit seulement ce que vous lui envoyez. | Que devient ma vidéo ? |
| [corbeille] | Supprimer | Une réponse, ou tout. Quand vous voulez. | Vos droits |
| [bouclier] | Sur cet appareil | Pas de publicité, pas de pistage. | Sur cet appareil |
| [avion] | Nous écrire | Une question ? Parlez-en à votre coach ou écrivez-nous. | Vos droits |

Sous les cartes, dans l'espace bénéficiaire : les boutons « Supprimer un entraînement » et « Tout supprimer et retirer mon accord ».

**Vos droits `#/vos-donnees/droits` : niveau 2.**

- [corbeille] **Supprimer** : une réponse, ou tout, depuis votre espace.
- [flèche] **Récupérer** : téléchargez votre vidéo ou imprimez votre rapport.
- [crayon] **Corriger** : votre coach peut corriger votre prénom ou votre métier.
- [retour] **Changer d'avis** : retirez votre accord quand vous voulez, sans explication.
- [personne] **Demander de l'aide** : votre coach, ou {{contact}}. Réponse en un mois au plus.

**Vos droits : niveau 3.**

> **Vos droits**
>
> Vos données vous appartiennent. Voici ce que vous pouvez faire.
>
> **Voir vos données.** Tout ce que nous avons sur vous est dans votre espace : vos entraînements, vos retours, les rapports de votre coach.
> **Les supprimer.** Ouvrez une réponse, puis appuyez sur « Supprimer ». Pour tout effacer : « Tout supprimer et retirer mon accord ».
> **Les récupérer.** Vous pouvez télécharger votre vidéo et imprimer votre rapport.
> **Les corriger.** Demandez à votre coach de corriger votre prénom ou votre métier.
> **Changer d'avis.** Vous pouvez retirer votre accord à tout moment. Vos entraînements sont alors effacés. Votre accompagnement continue normalement.
> **Faire une pause.** Vous pouvez demander que vos données ne soient plus utilisées pendant un temps.
>
> **Besoin d'aide ?**
> Parlez-en à votre coach. Vous pouvez aussi écrire à {{nom du DPO ou du service}} : {{courriel}}, {{adresse postale}}.
> Nous vous répondons en un mois au plus.
>
> **Pas d'accord avec notre réponse ?**
> Vous pouvez écrire à la CNIL, l'autorité qui protège les données en France : [cnil.fr/fr/plaintes](https://www.cnil.fr/fr/plaintes). C'est gratuit.

**Sur cet appareil `#/vos-donnees/appareil`.**

- **Niveau 1** (à l'accueil de l'espace, une seule fois) : [bouclier] **Ce site n'utilise pas de cookies publicitaires et ne vous suit pas.**
- **Niveau 2 :**
  - [cadenas] Vos entraînements sont gardés **dans ce navigateur, sur cet appareil**.
  - [interdit] **Pas de publicité. Pas de pistage. Pas de mesure d'audience.**
  - [corbeille] Vous effacez tout avec « Tout supprimer ».
- **Niveau 3 :**

> **Ce qui est gardé sur cet appareil**
>
> Pour fonctionner, le site garde des informations dans votre navigateur. Elles servent seulement à vous rendre le service.
>
> | Quoi | Pourquoi | Jusqu'à quand |
> |---|---|---|
> | Votre code, votre prénom, votre métier, votre accord | Pour ouvrir votre espace | Jusqu'à ce que vous supprimiez tout |
> | Vos vidéos et vos enregistrements de voix | Pour vous revoir | Jusqu'à ce que vous les supprimiez |
> | Le texte de vos réponses et les retours | Pour afficher vos retours | Jusqu'à ce que vous les supprimiez |
> | Vos réponses au petit questionnaire d'échauffement | Pour vous les montrer la fois suivante | Jusqu'à ce que vous supprimiez tout |
> | L'outil d'analyse (85 Mo) | Pour préparer votre retour sans envoyer votre vidéo | Gardé par le navigateur |
>
> Nous n'avons pas besoin de votre accord pour cela, car ces informations sont nécessaires au service que vous demandez. Nous vous le disons quand même.
>
> **Le téléchargement de l'outil d'analyse.**
> La première fois, votre appareil télécharge un outil d'analyse de 85 Mo. Préférez le Wi-Fi.
> Votre vidéo et votre voix ne sont pas envoyées.
> **[prototype]** Les fichiers viennent des serveurs de Hugging Face, de Google et de jsDelivr. Comme pour tout site, ces serveurs voient l'adresse internet (IP) de votre appareil.
> **[production]** Les fichiers viennent des serveurs de {{organisme}}.
>
> **Sur un ordinateur partagé.**
> Supprimez vos entraînements avant de partir. Le bouton « Quitter mon espace » ne les efface pas.
>
> **À savoir.**
> Votre navigateur peut effacer vos entraînements tout seul si vous ne venez pas pendant plusieurs semaines. Ils sont aussi effacés si vous videz les données de navigation.

**Information complète `#/vos-donnees/notice` (niveau 3, au sens de l'article 13).**

> **Information complète sur vos données**
> Version {{n}} du {{date}}.
>
> **Qui est responsable ?**
> {{Nom de l'organisme}}, {{adresse}}. Contact : {{courriel}}, {{téléphone}}.
> Délégué à la protection des données : {{nom ou service}}, {{courriel}}.
>
> **À quoi servent vos données ?**
> À vous entraîner à l'entretien d'embauche, seul puis avec votre coach. À rien d'autre.
>
> **Sur quelle base ?**
> {{À valider par le DPO. Variante consentement :}} Votre accord. Vous le donnez au début. Vous pouvez le retirer quand vous voulez. Utiliser La Répét' n'est pas obligatoire. Refuser ne change rien à votre accompagnement.
>
> **Quelles données ?**
> - Votre prénom et l'initiale de votre nom, donnés par votre coach.
> - Le métier que vous visez.
> - Vos enregistrements (vidéo ou voix), si vous vous enregistrez.
> - Le texte de vos réponses et le retour de l'assistant.
> - La direction de votre regard pendant la réponse, si vous utilisez la caméra et le retour de l'assistant.
> - Le mot que vous écrivez à votre coach, et son rapport.
> - La date de votre accord.
>
> Nous ne demandons pas votre adresse, votre courriel ni aucun numéro. Évitez de parler de votre santé dans vos réponses.
>
> **Qui voit vos données ?**
> - Vous.
> - Votre coach, seulement pour les réponses que vous lui envoyez.
> - **[production]** Nos prestataires techniques, qui n'ont pas le droit de s'en servir : {{hébergeur, pays}} ; {{prestataire du modèle de langage, pays}}.
> - Personne d'autre. Jamais un employeur. Jamais de publicité.
>
> **Où sont vos données ?**
> **[prototype]** Sur votre appareil seulement. Le site lui-même est fourni par GitHub (États-Unis), qui voit l'adresse internet (IP) de votre appareil, comme tout hébergeur. Les États-Unis sont couverts par une décision de la Commission européenne pour les entreprises certifiées.
> **[production]** Sur votre appareil, puis en France, chez {{hébergeur}}, pour les réponses que vous envoyez. {{Aucune donnée ne sort de l'Union européenne / ou : détail du transfert et de sa garantie.}}
>
> **Combien de temps ?**
> {{Reprendre le tableau des durées validé.}}
>
> **Une machine décide-t-elle pour vous ?**
> Non. L'assistant prépare un retour. Il ne décide de rien. Voir « L'assistant et l'IA ».
>
> **Vos droits.**
> Voir, supprimer, récupérer, corriger, retirer votre accord, demander une pause. Voir « Vos droits ».
> Réclamation : CNIL, 3 place de Fontenoy, 75007 Paris, cnil.fr.

### 5.7 Demande de démonstration

**Niveau 1, la phrase** (sous le bouton).

- Envoi inactif : [cadenas] **Ce formulaire n'envoie rien. Vos coordonnées restent sur votre écran.** (texte actuel, à garder dans l'esprit)
- Envoi par messagerie : [avion] **Votre messagerie va s'ouvrir. C'est vous qui envoyez le message. Le site ne garde rien.**
- Envoi en ligne (production) : [avion] **Vos coordonnées servent seulement à vous répondre.**

**Niveau 2, le résumé** (sous la phrase, quand un envoi est actif).

- [personne] **Qui les reçoit ?** {{Organisme}}, l'équipe qui déploie La Répét'.
- [calendrier] **Pour quoi faire ?** Vous proposer une date de démonstration. Rien d'autre.
- [corbeille] **Combien de temps ?** {{Durée}} au plus. Vous pouvez demander leur suppression avant : {{courriel}}.

**Niveau 3.** Un paragraphe « Demandes de démonstration » dans la notice complète :

> **Si vous demandez une démonstration.**
> Nous utilisons votre nom, votre organisme et votre adresse électronique pour vous répondre. Nous le faisons parce que vous nous le demandez.
> Seule l'équipe de {{organisme}} les voit. Nous les gardons {{durée}} après notre dernier échange, puis nous les supprimons.
> Vous pouvez demander à les voir, les corriger ou les supprimer : {{courriel}}.

**Remplacement de la case à cocher.** Supprimer « J'accepte d'être recontacté·e… » et afficher à la place la phrase de niveau 1.

### 5.8 Règles d'utilisation (CGU)

**Niveau 1, la phrase.** **La Répét' sert à vous entraîner. Elle ne décide de rien.**

**Niveau 2, le résumé.**

- [micro] Vous vous entraînez **pour vous**, autant de fois que vous voulez.
- [interdit] Pas de note, pas de classement, **aucune conséquence** sur vos droits.
- [personne] Filmez **vous seulement**. Pas d'autre personne sans son accord.
- [cadenas] Votre code est **personnel**. Ne le partagez pas.

**Niveau 3, le texte complet.**

> **Règles d'utilisation de La Répét'**
> Version {{n}} du {{date}}. Proposé par {{organisme}}.
>
> **1. À quoi sert La Répét' ?**
> À vous entraîner à l'entretien d'embauche. C'est un outil d'entraînement. Il ne vous évalue pas. Il ne décide de rien. Il ne change rien à vos droits ni à votre accompagnement.
>
> **2. Comment y accéder ?**
> Avec le code que votre coach vous a donné. Il n'y a pas de compte ni de mot de passe. Ce code est personnel : gardez-le pour vous.
>
> **3. Ce que vous faites.**
> Vous vous enregistrez pour vous entraîner. Vous décidez seul d'envoyer une réponse à votre coach.
> Enregistrez-vous seulement vous. Ne filmez pas une autre personne sans son accord.
>
> **4. Ce que fait l'assistant.**
> L'assistant est un programme. Son retour s'affiche tout de suite, sans relecture par une personne. Il décrit des faits. Il ne met pas de note. Il ne devine pas vos émotions. Il peut se tromper.
>
> **5. Ce que fait votre coach.**
> Votre coach voit seulement les réponses que vous lui envoyez. Il peut compléter le retour de l'assistant ou le contredire. Vos réponses ne sont jamais transmises à un employeur.
>
> **6. Vos données.**
> Tout est expliqué dans « Vos données ». Vous pouvez tout supprimer quand vous voulez.
>
> **7. Qui propose cet outil ?**
> {{Organisme}}, {{adresse}}. Voir les mentions légales.
>
> **[prototype]** Cette version est un prototype de démonstration. Elle peut changer ou s'arrêter. Vos entraînements sont gardés sur votre appareil seulement.

### 5.9 Mentions légales (gabarit)

> **Mentions légales**
>
> **Qui publie ce site ?**
> {{Nom ou raison sociale}}, {{forme juridique}}, {{adresse du siège}}.
> {{Numéro SIREN ou RNA, s'il existe.}}
> Contact : {{courriel}}, {{téléphone}}.
> Responsable de la publication : {{prénom et nom}}.
>
> **Qui héberge ce site ?**
> **[prototype]** GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis. Site : pages.github.com. {{Téléphone à vérifier et à compléter.}}
> **[production]** {{Hébergeur, adresse, téléphone.}}
>
> **Ce site est un prototype.**
> La Répét' est en cours de construction. Les noms de personnes dans les exemples sont inventés.
>
> **Photos.**
> Photos Unsplash : Vitaly Gariev, Ewan Buck, Christina @ wocintechchat.com, Brooke Cagle, Mina Rad. {{Reprendre la table « Crédits photos » du README.}}
>
> **Vos données.** Voir « Vos données ». **Accessibilité.** Voir « Accessibilité ».

### 5.10 Accessibilité (gabarit de déclaration)

> **Accessibilité**
>
> {{Organisme}} veut que La Répét' soit utilisable par tout le monde.
>
> **Où en sommes-nous ?**
> **Accessibilité : non conforme.** Le site n'a pas encore été vérifié par un audit complet. Un audit selon le référentiel RGAA est prévu avant la mise en service. {{Après audit : date, auteur, taux de critères respectés, liste des écarts.}}
>
> **Ce qui est déjà fait.**
> - Vous pouvez utiliser le site au clavier.
> - Les couleurs sont choisies pour être lisibles.
> - Les animations s'arrêtent si vous l'avez demandé dans les réglages de votre appareil.
> - Vous pouvez vous entraîner avec la voix seulement, sans caméra.
>
> **Ce qui n'est pas encore accessible.**
> {{À compléter après audit. Connu à ce jour : fenêtres d'information non annoncées aux lecteurs d'écran, titre de page identique partout, textes d'information trop petits, vidéos sans sous-titres en relecture.}}
>
> **Un problème ?**
> Écrivez-nous : {{courriel}}. Dites-nous la page et ce qui vous bloque. Nous vous répondons et nous cherchons une solution.
>
> **Si nous ne répondons pas.**
> Vous pouvez écrire au Défenseur des droits : [formulaire en ligne](https://formulaire.defenseurdesdroits.fr/), ou par courrier gratuit, sans timbre : Défenseur des droits, Libre réponse 71120, 75342 Paris CEDEX 07.
>
> {{Lien vers le schéma pluriannuel et le plan d'actions de l'année.}}

L'adresse du Défenseur des droits reprend le modèle officiel de déclaration ; elle n'a pas été revérifiée à la source pendant cet audit.

### 5.11 Lexique : les mots à remplacer

| Mot actuel | Mot recommandé |
|---|---|
| Cycle de vie de la vidéo | Que devient ma vidéo ? |
| Protection des données, notice RGPD | Vos données |
| Consentement, je consens | Accord, je suis d'accord |
| Retirer mon consentement | Retirer mon accord, changer d'avis |
| Responsable de traitement | Qui est responsable ? |
| Inférence d'émotions | Deviner vos émotions |
| Traitement local | Sur cet appareil |
| Prise | Réponse (côté bénéficiaire), enregistrement |
| Notes horodatées | Remarques à un moment précis de la vidéo |
| Destinataires | Qui voit vos données ? |
| Durée de conservation | Combien de temps ? |
| Transmis de façon chiffrée | L'envoi est protégé |
| Se déconnecter (bénéficiaire) | Quitter mon espace |
| Coach IA | Assistant (le programme), coach (la personne) |
| stressé·e, seul·e, prêt·e | Tournures sans point médian |

---

## 6. Liste priorisée des changements de code

Un autre agent harmonise `src/` en ce moment : les éléments sont désignés par leur composant et leur texte, pas par un numéro de ligne. Après chaque changement : `npm run build`, `npm run test:analysis`, `node tests/assistant.test.mjs`, `npm run test:site`, `npm run test:e2e`. Les tests de bout en bout cliquent sur les cases de l'écran d'accord et sur des libellés : ils sont à adapter avec les points 1, 4 et 7.

### 6.1 Bloquant avant production

| # | Fichier | Élément | Avant | Après |
|---|---|---|---|---|
| 1 | `src/Beneficiary.jsx` | `Consent`, état initial | `useState({ local: false, ai: true })` | `useState({ local: false, ai: false })`. Ajouter « Vous pouvez refuser. Cela ne change rien à votre accompagnement. » Adapter `tests/e2e.cjs` (cocher la seconde case). |
| 2 | `src/ui.jsx` | `GStyle`, chargement des polices | `@import url('https://fonts.googleapis.com/css2?family=Manrope…')` | Polices auto-hébergées : `import "@fontsource/manrope/…"` dans `main.jsx`, ou `@font-face` vers `public/fonts/*.woff2`. Aucun appel à `fonts.googleapis.com` ni `fonts.gstatic.com`. |
| 3 | `src/legal.jsx` | `MODAL_CONTENT.rgpd`, encart final | « Système classé haut risque au sens de l'AI Act […] obligations […] intégrées à la conception. » | Supprimer. Remplacer par : « Aucune décision n'est prise par une machine. L'assistant décrit, il ne note pas et ne devine pas les émotions. » |
| 4 | `src/legal.jsx` | `MODAL_CONTENT.lifecycle`, étapes 2, 4, 5 ; `rgpd`, lignes « Hébergement », « Durée », « Vos droits », « Base légale » ; `cgu`, articles 6 et 7 | Textes décrivant des serveurs en France, l'absence de transfert, une médiation systématique du coach, un hébergement par l'organisme | Textes de la section 5, avec les variantes **[prototype]** et **[production]** choisies par une constante de configuration (par exemple `MODE = import.meta.env.VITE_BACKEND_URL ? "production" : "prototype"`). |
| 5 | `src/App.jsx`, nouveau `src/Legal.jsx` (pages), nouveau `src/content/legal.js` (textes) | `routeFromHash`, `PUBLIC`, rendu des routes | Fenêtres modales sans adresse (`LegalModal`, `setModal`) | Routes `#/vos-donnees(/video|assistant|droits|appareil|notice|coachs)`, `#/conditions`, `#/mentions-legales`, `#/accessibilite`. Pages construites avec `Section`, `PageHero` et `Accordion` de `site.jsx`. |
| 6 | `src/App.jsx` | `Footer`, tableau `links` | Trois `Link onClick={() => setModal(k)}` : « Conditions d'utilisation », « Protection des données », « Cycle de vie de la vidéo » | Trois groupes de liens `href` (section 4.3) : « Vos données », « Que devient ma vidéo ? », « L'assistant et l'IA », « Vos droits », « Conditions d'utilisation », « Mentions légales », « Accessibilité : non conforme ». |
| 7 | `src/ui.jsx`, `src/legal.jsx` | `ORG_NAME`, pied de `LegalModal` | « Responsable de traitement : l'organisme qui vous accompagne » en 11 px | Objet de configuration `ORG = { name, address, email, phone, dpo, publisher, host }`, affiché dans la notice, les mentions légales et « Vos droits ». Si un champ manque, afficher « à compléter » et bloquer la construction en mode production. |
| 8 | `src/lib/gaze.js`, `src/lib/background.js`, `src/lib/whisper.worker.js`, `.env.example` | Adresses par défaut des modèles | `cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm`, `storage.googleapis.com/…`, Hugging Face par défaut | Tout de suite : remplacer `@latest` par la version installée. Production : fichiers servis depuis le même domaine (copie dans `public/` au moment de la construction), variables obligatoires. |
| 9 | `src/lib/store.js` et futur backend | Durées de conservation | Aucune purge | Champ `expiresAt` sur les prises et les parcours, purge au chargement (prototype) et côté serveur (production), selon le tableau validé. |
| 10 | Hors code | AIPD, note de qualification AI Act, contrats de sous-traitance, registre | Absents | À produire par l'organisme avant la production (écarts R9, R10, A1). |

### 6.2 Important

| # | Fichier | Élément | Avant | Après |
|---|---|---|---|---|
| 11 | `src/App.jsx` | `Nav`, zone de droite quand `inSpace` | Pastille de l'espace et bouton `aria-label="Se déconnecter"` | Ajouter un lien « Vos données ». Renommer le bouton : « Quitter mon espace », `title="Vos entraînements restent sur cet appareil"`. |
| 12 | `src/App.jsx` | Changement de route | `document.title` fixe | `document.title = "<Titre de la page> · La Répét'"` à chaque route. |
| 13 | `index.html` | `<title>` | « La Répét' · Coach IA d'entretien » | « La Répét' · S'entraîner à l'entretien d'embauche ». |
| 14 | `src/Beneficiary.jsx` | `Consent`, phrase de liens | « En continuant, vous confirmez avoir pris connaissance des conditions d'utilisation, de la notice de protection des données et du cycle de vie de la vidéo. » | Résumé à trois pictogrammes (5.3), puis « Tout lire sur vos données » et « Règles d'utilisation ». Bouton « Je suis d'accord, je commence ». Enregistrer `consent.version`. |
| 15 | `src/Beneficiary.jsx` | `Share`, paragraphe | « Votre réponse enregistrée et le retour de l'assistant seront transmis uniquement à votre coach. Vous pouvez la supprimer à tout moment. » | Les trois puces de 5.4, la variante prototype, le lien « Que devient ma vidéo ? », le lien secondaire « Je la garde pour moi ». |
| 16 | `src/Beneficiary.jsx` | `Home`, fonction `withdraw` et bouton de bas de page | `window.confirm("Retirer votre consentement supprime tous vos entraînements et vos rapports sur cet appareil. Continuer ?")` ; bouton « Retirer mon consentement et supprimer mes données » | Boîte de dialogue accessible : « Tout supprimer ? Vos entraînements et les rapports de votre coach seront effacés de cet appareil. Vous pourrez recommencer quand vous voulez. » Boutons « Tout supprimer » et « Annuler ». Libellé du lien : « Tout supprimer et retirer mon accord ». Enregistrer la date du retrait. |
| 17 | `src/Beneficiary.jsx`, `src/Report.jsx` | En-tête du retour de l'assistant | Aucun marquage explicite | « Retour préparé automatiquement par l'assistant. Il décrit, il ne note pas. » Si `analysis.source === "llm"` : « Texte reformulé par un modèle de langage. » Sur les commentaires du coach : « Votre coach ». |
| 18 | `src/Assistant.jsx` | Mention sous le champ, sous-titre | Mention en 11,5 px sous le champ ; « Assistant · fonctionnement du site et préparation d'entretien » | Mention au-dessus du champ, 14 px, textes 5.5. Sous-titre : « Assistant automatique · ce n'est pas une personne ». |
| 19 | `src/Beneficiary.jsx` | `EmotionNote` | « On ne juge pas vos émotions. L'assistant ne cherche pas à savoir si vous êtes stressé·e : il décrit seulement des faits. Pourquoi ? » | « L'assistant ne cherche pas à savoir ce que vous ressentez. Il décrit seulement des faits. En savoir plus » (lien vers `#/vos-donnees/assistant`). |
| 20 | `src/Beneficiary.jsx` | `Processing`, avant le premier téléchargement | Barre de progression sans annonce préalable | « La première fois, votre appareil télécharge un outil d'analyse (85 Mo). Préférez le Wi-Fi. Votre vidéo n'est pas envoyée. » |
| 21 | `src/About.jsx` | `FAQ`, « Ma vidéo est-elle envoyée quelque part ? » | « Ce téléchargement ne transmet aucune donnée personnelle. » | « Votre vidéo et votre voix ne sont pas envoyées. Comme pour tout site, le serveur qui fournit ces fichiers voit l'adresse internet (IP) de votre appareil. » Même correction dans `README.md`. |
| 22 | `src/About.jsx`, `src/Solutions.jsx` | `FAQ` « Une analyse d'impact (AIPD) est-elle nécessaire ? » ; onglet « Juridique et DPO » | « Elle est recommandée avant tout déploiement. » | « Oui. Le public accompagné et l'usage d'une technologie nouvelle la rendent nécessaire avant tout déploiement. » |
| 23 | `src/Demo.jsx` | `Checkbox` `demo-consent`, `validate`, `ORDER` | Case obligatoire « J'accepte d'être recontacté·e au sujet de cette demande… » | Supprimer la case et sa validation. Afficher les textes 5.7 selon le mode d'envoi. Rendre « Fonction » et « Personnes accompagnées par an » facultatifs. |
| 24 | `src/legal.jsx` | `LegalModal` (si conservé pour le niveau 2) | `div` sans rôle, fermeture par Échap seulement | `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus retenu, retour du focus, corps à 16 px, vrais titres, `dl` pour les paires, bouton « Tout lire » vers la page. |
| 25 | `src/Counselor.jsx`, `src/lib/store.js` | `Login`, `TRIAL_LOGIN` | `s.martin@famickael.fr` pré-rempli | `sophie.m@exemple.fr`, bandeau « Connexion de démonstration : aucun mot de passe n'est vérifié », lien « Coachs : vos données ». |
| 26 | `src/lib/store.js` | Création du parcours d'essai | Écriture dans `localStorage` au chargement du module | Création au moment où le code `REPETE` est saisi ou ouvert par lien. |
| 27 | `src/lib/assistant.js` | Sujets `confidentialite`, `video-devenir`, `supprimer` ; `SYSTEM_PROMPT` | « Le bouton « Que devient ma vidéo ? » […] résume le cycle de vie complet » ; « vous pouvez lui demander de la supprimer de son côté » | Aligner sur les textes de la section 5 et citer la page « Vos données ». Ajouter un sujet « L'assistant est-il une personne ? ». Vérifier avec `node tests/assistant.test.mjs`. |

### 6.3 Recommandé

| # | Fichier | Élément | Avant | Après |
|---|---|---|---|---|
| 28 | `src/Beneficiary.jsx`, `src/lib/store.js` | Envoi au coach | Irréversible sauf suppression | Action « Reprendre mon envoi » (`shared: false`, `sharedAt: null`), tant qu'aucun rapport n'est envoyé ; au-delà, suppression. |
| 29 | `src/Beneficiary.jsx`, `src/Report.jsx` | Portabilité | Impression du rapport seulement | Bouton « Télécharger ma vidéo » (à partir de `loadVideoUrl`). |
| 30 | `src/Beneficiary.jsx` | `Consent` ou accueil de l'espace | Rien sur l'appareil partagé | Question « Cet appareil est-il seulement à vous ? ». Si non : rappel de supprimer en partant, et pas de mémorisation de `lastSpace`. |
| 31 | Pages « Vos données » | Résumés | Texte seul | Bouton « Écouter » (`speechSynthesis`, local), feuille d'impression d'une page, puis traductions des résumés. |
| 32 | `src/App.jsx` | `Footer`, bandeau d'engagements | Quatre `span` | Quatre liens vers les rubriques correspondantes. |
| 33 | Tous les écrans bénéficiaire | Point médian | « stressé·e », « seul·e », « prêt·e », « recontacté·e » | Tournures sans point médian (5.11). |
| 34 | `tests/` | Garde-fous | Aucun test sur les textes légaux | Un test qui échoue si le site construit contient `fonts.googleapis.com`, `@latest`, « haut risque », ou si un champ de `ORG` est vide en mode production. |
| 35 | `README.md` | Règles de conception, « Passage en production » | Point 8 : « DPIA et validation des textes » | Renvoyer à ce document ; ajouter la note de qualification AI Act, les mentions légales, la déclaration d'accessibilité et la formation des coachs. |
| 36 | Hors code | Test avec le public | Aucun | Faire relire les résumés par cinq personnes accompagnées, dont deux peu à l'aise avec l'écrit, et corriger ce qui n'est pas compris. C'est la seule vraie validation du langage clair. |

---

## 7. Références : ce qui a été vérifié

Vérification faite le 20 novembre 2026 avec un outil de lecture web.

| Référence | Source consultée | État |
|---|---|---|
| RGPD, art. 12, 13, 20, 21 | [CNIL, texte du RGPD, chapitre III](https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre3) | Vérifié |
| RGPD, art. 4, 5, 6, 7, 8, 9, 22, 25, 28, 30, 32, 35, 44 et suivants, considérants 32, 43, 51 | [EUR-Lex, règlement (UE) 2016/679](https://eur-lex.europa.eu/eli/reg/2016/679/oj/fra) | Cités de mémoire, non relus à la source pendant cet audit |
| AI Act, art. 3(39), 4, 5(1)(f), 6(2) à 6(4), 26(7), 26(11), 27(1), 49(2), 50(1) à 50(5), 86 | [EUR-Lex, règlement (UE) 2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/fra) | Vérifié (version d'origine) |
| AI Act, annexe III, points 1, 3 et 4 | artificialintelligenceact.eu (reproduction non officielle) | Vérifié sur une source secondaire ; le chargement d'EUR-Lex s'est arrêté avant les annexes |
| Règlement (UE) 2026/1744 du 8 juillet 2026 (« omnibus numérique sur l'IA ») : art. 4 réécrit, art. 4 bis, art. 111(4), art. 113 (2 déc. 2027 pour l'annexe III, 2 août 2028 pour l'annexe I) | [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2026/1744/oj/fra) | Vérifié. L'allègement de l'enregistrement prévu à l'art. 49(2) n'a été lu que dans le considérant 22. |
| Lignes directrices de la Commission sur les pratiques interdites (févr. 2025) | Non consultées | Non vérifié ; non citées dans le tableau |
| Loi Informatique et libertés, art. 82 ; lignes directrices CNIL du 17 sept. 2020 | [CNIL, « Que dit la loi ? »](https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/que-dit-la-loi) | Vérifié sur la page CNIL. Le numéro de délibération (2020-091) et le texte sur Légifrance n'ont pas été vérifiés (accès refusé). |
| Loi Informatique et libertés, art. 45 (âge de 15 ans) | Légifrance | Non vérifié (accès refusé) |
| LCEN, art. 1-1 et 1-2 (ancien art. 6, III) | Légifrance inaccessible ; confirmé par des sources secondaires (cabinets d'avocats) | Partiellement vérifié : faire confirmer le numéro d'article et le contenu exact sur Légifrance |
| Loi n° 2005-102, art. 47 ; décret n° 2019-768 ; mentions et page obligatoires | [accessibilite.numerique.gouv.fr, champ d'application](https://accessibilite.numerique.gouv.fr/obligations/champ-application/) et [mentions obligatoires](https://accessibilite.numerique.gouv.fr/obligations/mentions-et-pages-obligatoires/) | Vérifié. Le site annonce une version 5 du RGAA en préparation pour fin 2026 : vérifier la version en vigueur au moment de l'audit. |
| CNIL, AIPD (délibération n° 2018-327, neuf critères) | [CNIL](https://www.cnil.fr/fr/ce-quil-faut-savoir-sur-lanalyse-dimpact-relative-la-protection-des-donnees-aipd) | Vérifié |
| CNIL, information en plusieurs niveaux, vocabulaire simple | [CNIL](https://www.cnil.fr/fr/conformite-rgpd-information-des-personnes-et-transparence) | Vérifié |
| Décision d'adéquation (UE) 2023/1795 ; Tribunal, 3 sept. 2025, T-553/23 ; pourvoi C-703/25 P | Recherche web (sources secondaires) | Partiellement vérifié : l'état du pourvoi en 2026 n'a pas été trouvé |
| CJUE, Planet49 (C-673/17) et Breyer (C-582/14) ; LG München I, 3 O 17493/20 ; lignes directrices CEPD 05/2020 ; Code civil, art. 1119 ; recommandation CNIL sur la journalisation ; référentiel CNIL de gestion commerciale (3 ans) | Non consultés | Non vérifié : cités de mémoire, à confirmer |
| Certification de GitHub, Google, Hugging Face et jsDelivr au cadre UE-États-Unis | Non consultée | Non vérifié : à contrôler sur dataprivacyframework.gov |

**Ce qui relève du DPO et du juridique, et que cet audit ne tranche pas :** la base légale (R6), le recours à l'article 9 (R7), l'âge minimal (R13), les durées (2.8), la qualification AI Act et la position sur le profilage (2.5), la qualité de responsable de traitement de l'éditeur du prototype public pour des données qui restent sur l'appareil, l'assujettissement de chaque organisme au RGAA (X1), et la validation mot à mot des textes de la section 5.
