# Référentiel UI/UX de La Répét'

Source unique de vérité pour l'interface. Version 3.1 (20 novembre 2026). Remplace le paragraphe « Couleurs (design system v2) » du README, qui doit désormais renvoyer ici.

## 0. Mode d'emploi (à lire en premier)

1. **Avant toute modification d'interface, lire ce document.** Aucune valeur visuelle (couleur, taille, graisse, rayon, ombre, espacement, durée) ne s'écrit à la main dans un écran : elle vient d'un jeton ou d'un composant de base.
2. **Toute nouvelle règle s'ajoute ici d'abord**, dans la section concernée, sous la forme « règle + pourquoi + jeton », puis dans `src/tokens.js`, puis dans le code. Jamais l'inverse.
3. **Un besoin non couvert ne justifie pas une valeur hors échelle.** On choisit la valeur existante la plus proche ; si elle ne convient vraiment pas, on modifie l'échelle ici (une ligne dans le journal, section 13) et partout à la fois.
4. **Vérification** : `npm run test:design` (section 11) doit passer, en plus de `npm run build`, `npm run test:analysis` et `npm run test:e2e`.
5. Les règles non négociables du README (ni note, ni score, ni émotion déduite, appui avant exploration, textes en français sans tiret cadratin) priment sur ce document.

Emplacement des jetons : `src/tokens.js` (JavaScript pur, sans JSX, importable par le script de vérification), réexporté par `src/ui.jsx`. Les écrans n'importent que depuis `src/ui.jsx`.

Statut des jetons cités : **existant** (déjà dans `ui.jsx`), **modifié**, **nouveau** (à créer, voir section 12).

---

## 1. Couleurs

### 1.1 Un rôle par couleur

| Rôle | Jeton | Valeur | Où l'utiliser | Où ne jamais l'utiliser |
|---|---|---|---|---|
| Structure et marque (dominante) | `T.primary` | `#386097` | Navigation, liens, bouton neutre fort, bordure du bouton secondaire, icônes d'interface, notes du coach, barre de lecture, focus | Action principale de l'écran, points d'appui, contenu de l'assistant |
| Structure, survol et texte sur fond teinté | `T.primaryDk` | `#2C4D7C` | Survol de `primary`, lien survolé | Fond de grande surface |
| Bordure du bouton secondaire | `T.primaryLt` | `#4A72A8` | Bordure au repos du bouton secondaire uniquement | Texte |
| Secondaire décoratif | `T.blue` | `#3893CD` | Dégradés, halos, icônes décoratives de 16 px et plus, illustrations | Texte, fond de bouton, bordure de champ (3,4:1 sur blanc) |
| Secondaire sous texte blanc | `T.blueDk` | `#2E7CB0` | Milieu des dégradés qui portent du texte blanc | Texte sur fond clair (4,5:1 de justesse, 4,3:1 sur `bg`) |
| Action principale et points d'appui | `T.accent` | `#0B7A75` | Bouton `objective` (un seul par écran), étape en cours du rail, étiquette et repère « Point d'appui », ligne « à traiter » | Liens, titres, décor, état « validé » (c'est le rôle du vert) |
| Action principale, survol | `T.accentDk` | `#0A6663` | Survol du bouton `objective` | Ailleurs |
| Sarcelle sur fond sombre | `T.accentLt` | `#7FD6CF` | Texte ou icône d'appui posé sur `navy` ou sur la vidéo | Sur fond clair |
| Assistant (IA) et points à explorer | `T.violet` | `#5C4BB9` | Bouton `ai`, étiquette `ai`, repère « À explorer », encart « ce que fait l'assistant », chargement de l'analyse | Liens, actions sans IA, icônes génériques, statut |
| Assistant, dégradé seulement | `T.lavender` | `#736BDE` | Sélection de texte, illustrations | Texte, fond sous texte blanc (4,3:1) |
| Validation (décor) | `T.success` | `#41C77A` | Pastille pleine décorative, point « en ligne », illustration | Texte, icône porteuse de sens sur fond clair (2,2:1) |
| Validation (lisible) | `T.successDk` **nouveau** | `#1E7A4A` | Texte, icône et coche de validation, étape terminée du rail | Bouton |
| Attention, en attente | `T.warningDk` **nouveau** | `#8A5A0A` | Texte et icône des messages et étiquettes d'attente | Fond |
| Attention (décor) | `T.warning` | `#FFB547` | Pastille décorative | Texte (1,8:1) |
| Erreur, destruction (lisible) | `T.errorDk` | `#C62F47` | Texte d'erreur, bordure de champ en erreur, action destructive, fond du bouton de confirmation destructive | Décor |
| Enregistrement en cours (décor) | `T.error` | `#FF5A72` | Point rouge d'enregistrement, trait barré | Texte, fond de bouton (3,0:1) |
| Titres et texte fort | `T.navy` | `#1B3A66` | Titres, texte de contenu à lire, valeur des champs | Fond de bouton |
| Texte courant | `T.body` | `#4A5568` | Paragraphes, descriptions | Titres |
| Texte secondaire | `T.muted` | `#64748B` | Légendes, aides, métadonnées, espace réservé des champs, lien « Retour » | Texte de moins de 12 px, texte sur `lineLt` ou `line` |
| Décor neutre | `T.faint` | `#A4AFBF` | Icônes décoratives, flèches entre étapes, pointillés | Texte, bordure de champ (2,2:1) |
| Bordure des contrôles | `T.lineStrong` **nouveau** | `#7C8AA0` | Bordure des champs, cases à cocher, pastille d'étape à venir | Séparateurs |
| Bordure et séparateur | `T.line` | `#E7EBF2` | Contour des cartes, séparateurs de section, fond du bouton désactivé | Bordure de champ |
| Séparateur interne | `T.lineLt` | `#F0F3F8` | Lignes entre rangées d'une même carte, piste de la barre de lecture, fond d'étiquette neutre | |
| Fond de page | `T.bg` | `#F8FAFC` | Fond de l'application, bloc « conseil » dans une carte | Fond de champ |
| Surface | `T.surface` | `#FFFFFF` | Cartes, champs, modales, pied de page, texte sur fond plein | |
| Voile de modale | `T.overlay` **nouveau** | `rgba(27,58,102,.45)` | Fond assombri des modales | |
| Fond vidéo | `T.videoBg` **nouveau** | `#000000` | Derrière un lecteur vidéo | Ailleurs |
| En-tête translucide | `T.glass` **nouveau** | `rgba(248,250,252,.9)` | Fond de l'en-tête collant (avec flou d'arrière-plan) | Ailleurs |
| Fond uni de la caméra | `T.studio` **nouveau** | `#DCE6F2` | Couleur de remplacement du fond de l'aperçu caméra (échauffement) | Interface |

**Pourquoi** : une couleur qui a deux rôles n'en signale plus aucun. Aujourd'hui « Se connecter » est bleu, « Accéder à mon espace » sarcelle, « Démarrer l'enregistrement » bleu clair : la personne ne peut pas apprendre où est la suite.

`T.ink` (doublon de `navy`) est supprimé. Le blanc s'écrit `T.surface`, jamais `"#fff"`.

### 1.2 Fonds teintés (un seul par teinte, opaque)

| Jeton | Valeur | Emploi unique |
|---|---|---|
| `T.primaryBg` **nouveau** | `#EEF2F8` | Message d'information, état sélectionné (bascule, case de consentement), bloc « code d'accès », commentaire du coach, avatar à initiale, pastille d'icône neutre |
| `T.accentBg` | `#ECF5F4` | Étiquette et pastille « Point d'appui », rangée « à traiter », observation d'appui active |
| `T.violetBg` **nouveau** | `#F2F1F9` | Étiquette `ai`, encart sur l'assistant, observation « à explorer » active |
| `T.successBg` | `#E9F8F0` | Message de succès, rond de confirmation |
| `T.warningBg` | `#FFF6E8` | Message d'attention, étiquette d'attente |
| `T.errorBg` | `#FFECEF` | Message d'erreur |

**Règle** : la concaténation d'opacité (`${T.primary}0D`, `${c}10`, `${T.accent}08`…) est interdite hors de `tokens.js`. **Pourquoi** : on compte aujourd'hui huit teintes de bleu, sarcelle et violet différentes pour le même usage.

### 1.3 Dégradés

| Jeton | Composition | Emploi unique |
|---|---|---|
| `GRAD` (= `GRAD_PREMIUM`) **modifié** | `primary` 0 %, `blueDk` 50 %, `violet` 100 % | `GradHead`, en-tête de modale, bandeau d'appel final. Milieu en `blueDk` et non `blue` : le texte blanc y passe de 3,4:1 à 4,5:1 |
| `GRAD_MAIN` | `blue` vers `violet` | Barre supérieure de 4 px des cartes côté bénéficiaire (`topbar`) |
| `GRAD_COACH` | `blue` vers `accent` | Barre supérieure des cartes côté coach (`topbar="coach"`) |
| `GRAD_AI` **modifié** | `blueDk` vers `violet` | Bouton `ai`, barre `topbar="ai"`, indicateur de chargement de l'analyse |
| `GRAD_SOFT` | `primary` 8 % vers `violet` 7 % | `GradHead soft` et en-tête de modale `soft` uniquement |
| `GRAD_NIGHT` **nouveau** | `navy`, `primaryDk` 60 %, `violet` | Fond de scène vidéo simulée (accueil) et fond d'attente de l'enregistreur |

#### Profondeur et marque (v3.1, pages publiques)

Demande du propriétaire : plus de profondeur et de présence de la marque sur l'accueil, sans surcharger.

| Jeton | Composition | Emploi unique |
|---|---|---|
| `GRAD_TITLE` | `navy` vers `primary` | Début du titre d'accroche (texte découpé), contraste AA sur toute la longueur |
| `GRAD_ACCROCHE` | `blueDk` vers `violet` | Fin d'accroche qui change et mots-clés de la phrase qui se colore (texte de 32 px et plus, seuil 3:1 vérifié par `PAIRS`) |
| `GRAD_HERO` | `surface` vers `primaryBg` | Fond du héros de l'accueil |
| `GRAD_SECTION` | `bg`, `primaryBg` au milieu, `bg` | Fond de la strate épinglée (section clé) |
| `GRAD_PAGE` | `primaryBg` vers `bg` | Fond de `PageHero` (pages secondaires) |
| `GLOW.blue`, `GLOW.violet` | bleu clair 22 %, violet 20 % | Halos (`Halo`) derrière les photos et le héros : décor, jamais sous du texte |
| `HL.appui`, `HL.ai`, `HL.primary` | teintes de fond des rôles | Surlignage progressif d'un passage (cartes animées, strate) |

Le bleu et le violet de ces dégradés et halos relèvent de l'exception « dégradé de la marque » ci-dessous : ils ne signalent ni l'assistant ni une action.

Interdits : dégradé au survol d'un bouton non IA (le bouton `primary` devient `primaryDk` uni), `GRAD_AI` sur un élément sans rapport avec l'assistant (ex. vignette d'une prise), `GRAD_AI_SOFT` (supprimé).

Le violet présent dans `GRAD` et `GRAD_MAIN` est la seule exception à « violet = IA » : c'est le dégradé de la marque (logo).

### 1.4 Texte sur fond sombre ou dégradé

| Jeton **nouveau** | Valeur | Emploi |
|---|---|---|
| `ON.text` | `#FFFFFF` | Tout texte sur `GRAD`, `GRAD_NIGHT`, vidéo. Pas de blanc à 85 % ou 70 % pour du texte de moins de 18 px |
| `ON.chip` | `rgba(255,255,255,.2)` | Fond d'étiquette, de bouton rond, de bouton `ghostDark` |
| `ON.line` | `rgba(255,255,255,.3)` | Bordure sur fond sombre |
| `ON.glow` | `rgba(255,255,255,.16)` | Halo décoratif |
| `ON.scrim` | `rgba(0,0,0,.5)` | Fond de pastille posée sur la vidéo (minuteur) |
| `ON.soft` | `rgba(255,255,255,.08)` | Fond de bloc translucide sur `GRAD_NIGHT` |

### 1.5 Combinaisons texte/fond autorisées (ratios calculés, WCAG 2.1)

Seuils : 4,5:1 pour le texte, 3:1 pour le texte de 24 px et plus (ou 19 px gras), les icônes porteuses de sens et les bordures de contrôle.

**Exception validée par le propriétaire : engagements du pied de page.** Les quatre icônes du bandeau d'engagements gardent chacune leur couleur (demande explicite du propriétaire, qui préfère ce rendu) : « La vidéo reste sur votre appareil » en `T.successDk`, « Envoi au coach seulement si vous le décidez » en `T.blue`, « Sans note ni classement » en `T.violet`, « Aucune émotion déduite » en `T.accent`. Le texte reste en `T.body`. C'est le seul endroit où ces couleurs servent de décor d'icône ; la règle « une couleur, un rôle » s'applique partout ailleurs.

| Texte | sur `surface` | sur `bg` | Autres fonds vérifiés | Verdict |
|---|---|---|---|---|
| `navy` | 11,4 | 10,9 | `primaryBg` 10,1 · `accentBg` 10,3 · `violetBg` 10,2 · `successBg` 10,4 · `warningBg` 10,6 · `errorBg` 10,0 | Partout |
| `body` | 7,5 | 7,2 | `primaryBg` 6,7 · `accentBg` 6,8 · `successBg` 6,9 · `lineLt` 6,8 | Partout |
| `muted` | 4,8 | 4,6 | `lineLt` 4,3 · `line` 4,0 | Sur `surface` et `bg` seulement |
| `primary` | 6,4 | 6,1 | `primaryBg` 5,7 | OK |
| `primaryDk` | 8,5 | 8,2 | `primaryBg` 7,6 | OK |
| `accent` | 5,2 | 5,0 | `accentBg` 4,7 | OK |
| `violet` | 6,6 | 6,4 | `violetBg` 5,9 | OK |
| `successDk` | 5,3 | | `successBg` 4,9 | OK |
| `warningDk` | 5,9 | | `warningBg` 5,5 | OK |
| `errorDk` | 5,4 | 5,2 | `errorBg` 4,7 | OK |
| `surface` (blanc) | | | sur `primary` 6,4 · `primaryDk` 8,5 · `accent` 5,2 · `accentDk` 6,8 · `violet` 6,6 · `errorDk` 5,4 · `successDk` 5,3 · `blueDk` 4,5 · `navy` 11,4 | OK |
| `accentLt` | | | sur `navy` 6,7 | OK sur `navy` seulement (3,8 sur `primary`) |
| `lineStrong` (bordure) | 3,5 | 3,4 | | OK pour une bordure |

Combinaisons **interdites** (mesurées dans le code actuel) : blanc sur `blue` 3,4 (bouton `blue`, milieu de `GRAD`), blanc sur `lavender` 4,3 (fin de `GRAD_AI`), blanc sur `error` 3,0 (bouton `danger`), blanc sur `success` 2,2 (coche du rail), `success` en texte 2,2 (rail), `faint` en texte 2,2 (rail), `#B5791A` sur `warningBg` 3,4 (étiquette `warning`), `blueDk` sur bleu teinté 4,2 (étiquette `blue`), `muted` sur `lineLt` 4,3 (étiquette `muted`), blanc à 85 % sur `blue` 2,9 (sous-titre de `GradHead`), bordure `line` sur blanc 1,2 (champs).

### 1.6 États

| État | Règle | Jeton |
|---|---|---|
| Survol d'un bouton plein | Fond de la variante « Dk » (`primaryDk`, `accentDk`), ombre du niveau supérieur, déplacement de 1 px vers le haut | section 5.1 |
| Survol d'un bouton secondaire ou d'une carte cliquable | Bordure `primary` (bouton), ombre `SH.lg` et déplacement de 2 px (carte) | |
| Focus clavier | Contour 2 px `primary`, décalage 2 px, sur tout élément interactif (`button`, `a`, `summary`, `[role=button]`, `[tabindex]`). Sur fond sombre : contour `ON.text` | `FOCUS` **nouveau** |
| Focus d'un champ | Bordure `primary` 1,5 px + halo `SH.ring` (`0 0 0 4px` `primaryBg`) | `SH.ring` **nouveau** |
| Sélectionné | Fond `primaryBg`, bordure 1,5 px `primary`, texte `primary` | |
| Désactivé | Fond `line`, texte `muted`, aucune ombre, curseur `not-allowed`. Pas d'opacité | |
| Erreur de champ | Bordure `errorDk`, message `TY.small` en `errorDk` avec `role="alert"`, précédé de l'icône `I.ban` | |
| Chargement | Indicateur rotatif 2 couleurs (`lineLt` + couleur du rôle), libellé visible | |

---

## 2. Typographie

Trois familles, sans exception : **Manrope** (`FD`) pour les titres, **Inter** (`FB`) pour le texte et l'interface, **JetBrains Mono** (`FM`) pour les chiffres, codes et horodatages.

**Règle** : hors de `tokens.js`, il est interdit d'écrire `font:`, `fontSize`, `fontWeight`, `fontFamily`, `lineHeight` ou `letterSpacing`. On écrit `style={{ ...TY.h2, color: T.navy }}` ou `<Txt v="h2">`. **Pourquoi** : le code actuel contient 91 combinaisons taille/graisse/interlignage différentes, dont sept tailles de titre de page (24, 26, 27, 28, 30, 32, 34) et des demi-pixels (10,5 · 11,5 · 12,5 · 13,5 · 14,5 · 15,5).

### 2.1 Échelle unique (`TY`, **nouveau**)

| Niveau | Jeton | Famille | Graisse | Taille / interligne | Espacement | Mobile (≤ 760 px) | Usage unique |
|---|---|---|---|---|---|---|---|
| Titre d'accroche | `TY.display` | Manrope | 800 | 54 / 1,05 | -0,035em | 38 | Titre du héros de l'accueil, une fois dans le site |
| Titre de section éditoriale | `TY.xl` | Manrope | 800 | 32 / 1,15 | -0,03em | 26 | `h2` des pages Accueil et Fonctionnement, bandeau d'appel final |
| Titre de page | `TY.h1` | Manrope | 800 | 28 / 1,15 | -0,02em | 24 | Le `h1` de chaque écran d'application, titre de `GradHead`, titre d'étape du défilement de l'accueil |
| Titre de section | `TY.h2` | Manrope | 800 | 20 / 1,25 | -0,01em | 20 | Sections d'un écran (« Mes prises »), titre de modale, titre d'une carte vedette |
| Titre de carte | `TY.h3` | Manrope | 700 | 16 / 1,3 | 0 | 16 | Cartes de grille, observation, nom dans une liste, état vide |
| Titre de bloc | `TY.h4` | Manrope | 700 | 14 / 1,4 | 0 | 14 | Intitulé d'un bloc dans une carte, question d'une prise dans une liste |
| Surtitre | `TY.overline` | Inter | 700 | 11 / 1,3 | 0,08em, capitales | 11 | Au-dessus d'un titre ou d'une valeur ; jamais plus de 4 mots |
| Chapeau | `TY.lead` | Inter | 400 | 18 / 1,6 | 0 | 16 | Paragraphe sous `display` ou `xl` |
| Corps de lecture | `TY.bodyLg` | Inter | 400 | 16 / 1,6 | 0 | 16 | Ce que la personne doit lire attentivement : mot du coach, synthèse, phrase sous un `h1` |
| Corps | `TY.body` | Inter | 400 | 14 / 1,6 | 0 | 14 | Texte par défaut de l'interface et des cartes |
| Corps fort | `TY.bodyStrong` | Inter | 600 | 14 / 1,5 | 0 | 14 | Texte d'une tuile cliquable, intitulé d'option |
| Petit | `TY.small` | Inter | 400 | 13 / 1,5 | 0 | 13 | Métadonnées, conseil, message de champ, contenu de message |
| Légende | `TY.caption` | Inter | 400 | 12 / 1,5 | 0 | 12 | Aide de champ, mention, pied de page. Taille plancher du texte |
| Libellé de champ | `TY.label` | Inter | 600 | 13 / 1,3 | 0 | 13 | `label` de formulaire, sous-titre coloré d'une carte |
| Bouton | `TY.btnSm` · `TY.btn` · `TY.btnLg` | Inter | 600 | 13 / 1 · 14 / 1 · 16 / 1 | 0 | idem | Texte des boutons selon la taille |
| Lien | `TY.link` | Inter | 600 | taille héritée | 0 | idem | Souligné, voir 5.2 |
| Champ | `TY.input` | Inter | 400 | 16 / 1,5 | 0 | 16 | Valeur et espace réservé. 16 px obligatoire : en dessous, iOS zoome à la saisie |
| Étiquette | `TY.tag` | Inter | 600 | 12 / 1 | 0,02em | 12 | Composant `Tag` |
| Chiffre | `TY.num` | JetBrains Mono | 700 | 28 / 1 | 0 | 28 | Indicateurs agrégés, code d'accès affiché |
| Code saisi | `TY.code` | JetBrains Mono | 700 | 24 / 1 | 0,25em | 24 | Champ du code à 6 caractères |
| Horodatage | `TY.time` | JetBrains Mono | 700 | 11 / 1 | 0 | 11 | Pastille « 0:03 », numéro d'étape |
| Mono | `TY.mono` | JetBrains Mono | 500 | 12 / 1,5 | 0 | 12 | Code dans une liste, durée, lien affiché, message technique |
| Titre de page secondaire | `TY.pageTitle` | Manrope | 800 | 38 / 1,1 | -0,03em | 26 | `h1` de `PageHero` et titre d'article (rendu validé) |
| Citation | `TY.quote` | Manrope | 700 | 20 / 1,45 | 0 | 18 | Citation d'article |
| Mise en avant | `TY.strong` | | 700 | | | | `<strong>` dans un paragraphe |

Tailles autorisées (px) : **11, 12, 13, 14, 16, 18, 20, 24, 26, 28, 32, 38, 54**. Graisses autorisées : Manrope 700 et 800 ; Inter 400, 600, 700 ; JetBrains Mono 500 et 700. Toute autre valeur est une erreur (Inter 500 disparaît : `body` ou `bodyStrong`).

Règles d'emploi :
- Un seul `h1` par écran, et l'ordre des niveaux HTML suit l'ordre visuel (le composant `Txt` sépare la balise `as` du style `v`).
- Mise en avant dans un paragraphe : `<strong>` (Inter 700, couleur `navy`). Pas d'italique sauf citation de la personne.
- Couleurs de texte : titres `navy` ; corps `body` ; lecture attentive `navy` ; secondaire `muted`. Le titre `display` est le seul titre en `primary`.
- Longueur de ligne : 75 caractères maximum (`maxWidth: 640` sur un paragraphe isolé).

---

## 3. Espacement

Base 4. `sp(n) = 4n`. **Échelle autorisée (px) : 0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80.** La valeur 2 est réservée aux micro-ajustements optiques. Les valeurs 6, 7, 9, 10, 11, 13, 14, 15, 18, 22, 26, 28, 30, 36, 52, 84 présentes aujourd'hui disparaissent.

### 3.1 Paddings (`PAD`, **nouveau**)

| Élément | Jeton | Ordinateur | Mobile | Remarque |
|---|---|---|---|---|
| Carte standard | `pad="md"` | 24 | 20 | Valeur par défaut de `Card` |
| Carte de focalisation (formulaire, confirmation, modale, `GradHead`) | `pad="lg"` | 32 | 24 | Remplace 26, 28, 32, 36, 40, 48 |
| Tuile compacte (question, observation, bloc interne) | `pad="sm"` | 16 | 16 | Remplace 14, 16, 18 |
| Carte à contenu bord à bord (liste, lecteur, en-tête dégradé) | `pad="none"` | 0 | 0 | Les rangées internes prennent `PAD.row` |
| Rangée de liste | `PAD.row` | 16 × 24 | 16 × 20 | |
| Message (`Notice`) | `PAD.notice` | 12 × 16 | 12 × 16 | |
| Page d'application (`main`) | `PAD.page` | 40 haut, 24 côtés, 64 bas | 24 haut, 16 côtés, 48 bas | Remplace 36/48 en haut |
| En-tête et pied de page | | 0 × 24, hauteur 64 | 0 × 16, hauteur 56 | |
| Bandeau d'appel final | | 48 | 32 × 24 | |

### 3.2 Espacements verticaux et gouttières (`GAP`, **nouveau**)

| Situation | Valeur | Jeton |
|---|---|---|
| Entre deux sections éditoriales (Accueil, Fonctionnement) | 80 (mobile 48) | `GAP.section` |
| Héros : haut et bas | 80 (mobile 40) | `GAP.section` |
| Entre deux blocs d'un écran d'application (carte puis titre de section) | 32 | `GAP.block` |
| Gouttière d'une grille de cartes | 24 (mobile 16) | `GAP.grid` |
| Gouttière d'une grille de tuiles ou cartes empilées d'une liste | 12 | `GAP.stack` |
| Deux colonnes de travail (lecteur + observations) | 24 | `GAP.grid` |
| Surtitre ou étiquette vers titre | 12 | |
| Titre vers sous-titre | 8 | |
| Sous-titre ou paragraphe vers contenu | 24 | |
| Titre de section (`h2`) vers son contenu | 16 | |
| Entre boutons d'un même groupe | 12 (8 en taille `sm`) | `GAP.actions` |
| Icône vers texte | 8 | |
| Formulaire : libellé vers aide | 4 | |
| Formulaire : libellé ou aide vers champ | 8 | |
| Formulaire : champ vers message d'erreur | 8 | |
| Formulaire : entre deux champs | 20 | `GAP.field` |
| Formulaire : dernier champ vers actions | 24 | |

**Règle** : les composants de base n'ont pas de marge externe. L'espacement est porté par le parent (`display: grid` ou `flex` avec `gap`). **Pourquoi** : les `marginBottom` de 10, 12, 14, 16 et 18 dispersés aujourd'hui produisent des rythmes différents d'un écran à l'autre.

---

## 4. Formes

### 4.1 Rayons (`RAD`, existant)

| Jeton | Valeur | Éléments |
|---|---|---|
| `RAD.xs` | 6 | Case à cocher, repère carré, coin d'un commentaire à filet |
| `RAD.sm` | 10 | Bloc interne d'une carte (conseil), pastille d'icône |
| `RAD.md` | 16 | Boutons, champs, zones de texte, bascules, tuiles (`pad="sm"`), observations, messages |
| `RAD.lg` | 24 | Cartes, modales, zone vidéo |
| `RAD.xl` | 32 | Carte de démonstration du héros et bandeau d'appel final, rien d'autre |
| `RAD.pill` | 999 | Étiquettes, pastilles horaires, capsule de session, puces |
| `"50%"` | | Avatars, ronds de confirmation, boutons icône, repères ronds |

Les valeurs littérales de 0 à 4 restent permises pour les micro-éléments de moins de 12 px (curseur, trait). Tout autre nombre (3 sur un repère de note, 5, 13, 20) est remplacé par un jeton.

### 4.2 Ombres (`SH`, existant + `ring`)

| Niveau | Jeton | Emploi |
|---|---|---|
| 1, repos | `SH.xs` | Toute carte (valeur par défaut) |
| 2, focalisation | `SH.sm` | La carte principale de l'écran : `level={2}` sur `Card`. Une par écran au plus |
| 3, flottant | `SH.lg` | Modale, carte survolée, élément flottant du héros, bandeau d'appel final |
| Halo de champ | `SH.ring` **nouveau** | Focus d'un champ |
| Repère actif | `ringOf(couleur)` **nouveau** | `0 0 0 4px` de la teinte de fond associée |
| Lueur colorée (v3.1) | `SH.glow` | Ombre diffuse teintée bleu (large flou, faible opacité) : photos des pages publiques, scènes et cartes flottantes du héros, visuel de la strate, carte animée survolée |
| Lueur assistant (v3.1) | `SH.glowAi` | Même ombre teintée violet : carte « Repères de l'assistant » du héros, bandeau d'appel final (dégradé de marque) |
| Ombres des boutons | `SH.btn.*` | `[repos, survol]` des boutons pleins, utilisées par `Btn` uniquement |

Les ombres colorées des boutons sont définies dans `Btn` et nulle part ailleurs. Hors de `tokens.js` et `ui.jsx`, `boxShadow` ne prend que `SH.*`, `ringOf()` ou `"none"`.

### 4.3 Bordures

| Emploi | Règle |
|---|---|
| Carte, séparateur de section | 1 px `line` |
| Séparateur entre rangées d'une carte | 1 px `lineLt` |
| Contrôle (champ, bouton secondaire, bascule, tuile sélectionnable) | 1,5 px (`lineStrong` au repos pour les champs, `primaryLt` pour le bouton secondaire) |
| Filet d'accent d'un commentaire ou d'un encart | 3 px à gauche, couleur du rôle, sans autre bordure |
| Élément sur fond sombre | 1 px `ON.line` |

---

## 5. Composants

### 5.1 Boutons (`Btn`)

| Variante `kind` | Aspect | Emploi unique |
|---|---|---|
| `objective` | Fond `accent`, texte blanc | **L'action qui fait avancer** : une seule par écran (et par modale) |
| `ai` | Fond `GRAD_AI`, texte blanc | L'action lance ou relance l'assistant. Elle tient alors lieu d'action principale de l'écran |
| `primary` | Fond `primary`, texte blanc | Action neutre forte hors parcours : « Mon espace » dans l'en-tête, fermeture d'une modale d'information, onglet actif |
| `secondary` | Fond blanc, bordure 1,5 px `primaryLt`, texte `primary` | Toute autre action |
| `ghost` | Transparent, texte `primary` | Action tertiaire, utilitaire (imprimer, copier) |
| `danger` | Transparent, texte `errorDk` | Suppression, retrait du consentement. Fond plein `errorDk` uniquement dans la fenêtre de confirmation |
| `white` | Fond blanc, texte `primary` | Action principale sur `GRAD` |
| `ghostDark` | Fond `ON.chip`, bordure `ON.line`, texte blanc | Action secondaire sur `GRAD` ou sur la vidéo |

Variantes supprimées : `blue` (contraste 3,4:1), `dark` (doublon de `primary`).

| Taille | Hauteur | Padding horizontal | Texte | Icône | Emploi |
|---|---|---|---|---|---|
| `sm` | 40 (zone tactile 44 sur mobile) | 16 | `TY.btnSm` | 16 | Dans une rangée de liste, une barre d'outils, l'en-tête |
| `md` | 48 | 24 | `TY.btn` | 16 | Valeur par défaut |
| `lg` | 56 | 32 | `TY.btnLg` | 20 | Héros et bandeau d'appel final uniquement |

Règles :
- **Une seule action pleine colorée par écran.** Si deux actions semblent principales, l'une est `secondary`.
- **Ordre** : action de retour ou d'annulation à gauche (lien `Back`), puis `secondary`, puis l'action principale à droite. Sur mobile, les boutons d'un groupe passent en pleine largeur, l'action principale en premier.
- **Icônes** : passées par les propriétés `icon` (à gauche) et `iconRight` (flèche de progression uniquement), couleur `currentColor`, écart 8. Plus de `&nbsp;` ni de couleur d'icône écrite à la main.
- Libellé : verbe à l'infinitif ou à la première personne, 4 mots au plus, sans point.
- Rayon `RAD.md`, transition `MO.base`, survol et désactivé selon 1.6.
- Bouton icône seul : composant `IconBtn`, 44 × 44, rond, `aria-label` obligatoire.

### 5.2 Liens (`Link`, **nouveau**)

Un seul style : `TY.link` (Inter 600, taille héritée), couleur `primary`, souligné, décalage du soulignement 3 px, survol `primaryDk`. Sur fond sombre : blanc souligné. Jamais de lien violet, jamais de lien non souligné dans un texte.

Deux exceptions nommées : `navlink` (en-tête, non souligné au repos, souligné quand actif) et `Back` (retour, `TY.body` en `muted`, icône flèche à gauche, zone tactile 44). Tous les « Retour », « Annuler » et « Changer de code » utilisent `Back`.

### 5.3 Champs (`Field`, `Input`, `Textarea`, **nouveaux**)

Un seul style, défini par `INPUT` :

| Propriété | Valeur |
|---|---|
| Hauteur | 48 (zone de texte : 96 minimum, padding 12 × 16, redimensionnable verticalement) |
| Padding | 0 × 16 |
| Rayon | `RAD.md` |
| Bordure | 1,5 px `lineStrong` |
| Fond | `surface` (jamais `bg`) |
| Texte | `TY.input`, couleur `navy` ; espace réservé `muted` |
| Focus, erreur, désactivé | Voir 1.6 (désactivé : fond `lineLt`) |

Seule variante : `variant="code"` (hauteur 56, `TY.code`, centré). Les hauteurs 40, 42, 54 et les tailles de texte 13, 13,5 et 15 disparaissent.

`Field` porte le libellé (`TY.label`, `navy`, lié par `htmlFor`), l'aide facultative (`TY.caption`, `muted`, sous le libellé, reliée par `aria-describedby`) et le message d'erreur. Un champ sans libellé visible reçoit un `aria-label`. La mention « facultatif » s'écrit dans le libellé ; on ne marque pas les champs obligatoires par une couleur.

`Toggle` (choix exclusif en ligne) : hauteur 48, `RAD.md`, `TY.label`, états repos et sélectionné selon 1.6, `role="radio"` dans un `role="radiogroup"`.

### 5.4 Étiquettes (`Tag`)

Hauteur 24, padding 0 × 12, `RAD.pill`, `TY.tag`, icône 12 facultative. Non cliquable.

| `tone` | Texte / fond | Signification unique |
|---|---|---|
| `primary` | `primary` / `primaryBg` | Contexte, rôle, étape (« Coach », « Entraînement », « S'entraîne ») |
| `appui` | `accent` / `accentBg` | « Point d'appui » uniquement |
| `ai` | `violet` / `violetBg` | Assistant, « À explorer » |
| `success` | `successDk` / `successBg` | Fait, reçu, envoyé |
| `warning` | `warningDk` / `warningBg` | En attente d'une action (« À relire ») |
| `error` | `errorDk` / `errorBg` | Échec |
| `muted` | `body` / `lineLt` | État neutre, inactif |

Tons supprimés : `blue`, `indigo`, `violet`, `lavender`. Un même statut porte le même ton des deux côtés : « Rapport reçu » (bénéficiaire) et « Rapport envoyé » (coach) sont tous deux `success`.

### 5.5 Cartes (`Card`)

`<Card pad="md" level={1}>` : fond `surface`, bordure 1 px `line`, `RAD.lg`, ombre selon `level`. Propriétés : `pad` (`none`, `sm`, `md`, `lg`, plus de nombre), `level` (1 ou 2), `topbar` (`true`, `"coach"`, `"ai"`), `hover`, `onClick`.

- Une carte cliquable est rendue en `button` (ou reçoit `role="button"`, `tabIndex={0}` et la gestion de Entrée et Espace). Pas de `div` cliquable.
- `pad="sm"` entraîne `RAD.md` (tuile).
- Pas de carte dans une carte : à l'intérieur, on utilise un bloc `bg` en `RAD.sm` ou un `Notice`.
- Variante teintée interdite sauf par `Notice`.

### 5.6 Fenêtres modales (`Modal`, **nouveau**, une seule implémentation)

Voile `T.overlay` avec flou de 4 px ; panneau `surface`, `RAD.lg`, `SH.lg`, largeur `W.form` (600) ou `W.read` (760), hauteur maximale 86 % de l'écran, corps défilant. Trois zones au padding `lg` : en-tête (titre `TY.h2`, bouton de fermeture `IconBtn` 44), corps, pied (action principale à droite). En-tête dégradé facultatif (`head="grad"` ou `"soft"`).

Comportement obligatoire : `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, fermeture par Échap et par clic sur le voile, défilement de la page bloqué, focus envoyé dans la modale à l'ouverture, retenu à l'intérieur, rendu à l'élément d'origine à la fermeture. Sur mobile : marge extérieure 16, padding 24.

### 5.7 En-tête dégradé (`GradHead`)

Un seul par écran, toujours en haut de la carte principale (`pad="none"`). Padding `lg` (32, mobile 24 × 20). Contenu : étiquette facultative (fond `ON.chip`), titre `TY.h1` blanc, sous-titre `TY.body` blanc plein, action facultative en `ghostDark` taille `sm`. Propriété `as` pour la balise du titre. Version `soft` : réservée aux contenus d'information (modale « émotions »).

### 5.8 Messages (`Notice`, **nouveau**)

`RAD.md`, `PAD.notice`, icône 16 à gauche (écart 12), texte `TY.small`, pas de bordure, pas d'emoji.

| `tone` | Fond | Icône | Texte | Emploi | Rôle ARIA |
|---|---|---|---|---|---|
| `info` | `primaryBg` | `primary` | `navy` | Explication, cadre légal, synthèse | aucun |
| `success` | `successBg` | `successDk` | `navy` | Confirmation, nouveauté reçue | `status` |
| `warning` | `warningBg` | `warningDk` | `warningDk` | Texte provisoire, point d'attention | `status` |
| `error` | `errorBg` | `errorDk` | `errorDk` | Échec, avec la marche à suivre | `alert` |
| `ai` | `violetBg` | `violet` | `navy` | Ce que fait ou ne fait pas l'assistant | aucun |

Le commentaire du coach est un cas nommé (`Quote`) : fond `primaryBg`, filet gauche 3 px `primary`, `RAD.xs`, texte `navy`.

### 5.9 État vide (`Empty`, **nouveau**)

`Card pad="lg"`, contenu centré : pastille d'icône 48 (`primaryBg`, icône 24 `primary`), titre `TY.h3`, une phrase `TY.body` (ce qui apparaîtra ici et comment), une action au plus. Même gabarit pour « Aucun parcours », « Aucune prise partagée », « Pas encore de prise ».

### 5.10 Autres éléments normalisés

| Élément | Règle |
|---|---|
| Rond de confirmation | 56, fond `successBg`, coche 28 `successDk` |
| Pastille d'icône, avatar | 40, `RAD.sm` (icône) ou rond (avatar), fond `primaryBg`, contenu `primary` |
| Pastille horaire | Hauteur 24, padding 0 × 8, `RAD.pill`, `TY.time`, fond de la couleur du rôle, texte blanc. Si cliquable : zone tactile 44 |
| Rail d'étapes (`Rail`) | Pastille 28. Terminée : fond `successDk`, coche blanche, libellé `successDk`. En cours : fond `accent`, libellé `accent` gras, `aria-current="step"`. À venir : fond blanc, bordure `lineStrong`, libellé `muted`. Mobile : seul le libellé de l'étape en cours est affiché, précédé de « Étape 2 sur 4 » |
| Repères de lecture | Appui : rond plein `accent`. À explorer : rond `violet` évidé. Note du coach : carré `primary` (`RAD.xs`). La forme distingue autant que la couleur |
| Icônes (`Icon`) | Tailles 12 (dans `Tag`), 16 (bouton, ligne), 20 (défaut), 24 (pastille), 40 (illustration). Trait 2. `aria-hidden` par défaut |

---

## 6. Mise en page

| Type de page | Largeur maximale | Jeton `W` **nouveau** | Écrans |
|---|---|---|---|
| Éditoriale, en-tête, pied de page | 1200 | `W.page` | Accueil, Fonctionnement |
| Travail en deux colonnes | 1120 | `W.wide` | Espace coach, relecture, rapport avec vidéo |
| Lecture et parcours | 760 | `W.read` | Espace bénéficiaire, choix de question, enregistrement, rapport écrit, consentement, choix du mode, « Mon espace », modale large |
| Formulaire et confirmation | 600 | `W.form` | Partage, envoi confirmé, analyse en cours, modale |
| Accès | 440 | `W.narrow` | Saisie du code, connexion |

Remplace 1000, 920, 820, 720, 680, 640, 580, 560, 460.

- Le contenu est centré dans la page ; le texte est aligné à gauche. Le centrage du texte est réservé aux écrans de confirmation, d'accès et aux états vides.
- Grilles : 2 ou 3 colonnes égales, gouttière `GAP.grid`. Les proportions libres (1,2fr / 1fr, 1,15fr / 1fr, 1,3fr / 1fr) sont ramenées à deux : égales, ou 3/2 pour lecteur + panneau.
- Point de rupture unique : 760 px. En dessous : une colonne, gouttière latérale 16, cartes en `pad` mobile, groupes de boutons en pleine largeur, titres en taille mobile. Aucun défilement horizontal de page.
- En-tête collant de 64 (mobile 56), `z-index` 50 ; modale 100 (`Z.nav`, `Z.modal`).
- Impression : en-tête, pied et éléments `.noprint` masqués, fond blanc.

---

## 7. Mouvement (`MO`, **nouveau**)

| Jeton | Valeur | Emploi |
|---|---|---|
| `MO.fast` | 120 ms | Changement de couleur au survol |
| `MO.base` | 200 ms | Survol avec déplacement, bascule, sélection |
| `MO.enter` | 450 ms | Apparition d'un écran ou d'un bloc (`.up`, `.rv`) |
| `MO.ease` | `cubic-bezier(.2,.7,.3,1)` | Courbe de l'interface (survol, sélection, apparition d'écran) |
| `MO.reveal` (v3.1) | 700 ms | Apparition au défilement (`.rv`), éléments qui entrent dans une scène (`.rs-pop`, `.rs-in`), phrase qui se colore |
| `MO.slow` (v3.1) | 900 ms | Fin d'accroche qui change, étapes et visuels de la strate épinglée |
| `MO.fade` (v3.1) | 1,1 s | Fondu entre deux scènes du héros |
| `MO.soft` (v3.1) | `cubic-bezier(.45,0,.55,1)` | Courbe douce (ease-in-out) des transitions lentes ci-dessus |
| `PACE.scene` (v3.1) | 7 000 ms | Durée d'une scène du héros |
| `PACE.accroche` (v3.1) | 3 600 ms | Durée de chaque fin d'accroche |
| Écran de chargement (v3.1) | 1,9 s minimum, fondu de sortie 0,6 s | Durée comptée depuis le début de la navigation, pour jouer une fois l'animation complète (bulles qui se rejoignent, puis trois points). « Réduire les animations » : écran statique, 0,6 s. Navigateur piloté : retrait immédiat. Retrait de secours en CSS à 10 s (`index.html`, `src/Loader.jsx`) |

Les pages publiques (accueil, à propos, solutions, ressources) utilisent les durées lentes ; l'application (espaces bénéficiaire et coach) garde `MO.fast`, `MO.base` et `MO.enter` pour rester réactive.

- `transition: all` est interdit : on nomme les propriétés (`background-color`, `border-color`, `box-shadow`, `transform`, `opacity`).
- Amplitudes : bouton 1 px vers le haut, carte cliquable 2 px, apparition 12 px. On n'anime que `transform` et `opacity`.
- Animations en boucle limitées à deux : point d'enregistrement (`blink`) et indicateur de chargement (`spin`).
- `prefers-reduced-motion: reduce` neutralise toutes les animations et transitions (règle globale de `GStyle`, à conserver). Le contenu doit rester complet sans animation : rien n'est révélé uniquement par le mouvement.
- Aucune animation pendant l'enregistrement autre que le point rouge.

---

## 8. Accessibilité

| Sujet | Règle |
|---|---|
| Contraste | Seules les combinaisons de 1.5 sont permises |
| Cibles tactiles | 44 × 44 au minimum sur mobile pour tout élément interactif ; 8 d'écart entre deux cibles. Un visuel plus petit (repère, pastille horaire) étend sa zone par un padding transparent |
| Focus | Toujours visible (1.6). Interdit de retirer un contour sans le remplacer |
| Clavier | Tout ce qui se clique s'atteint à la tabulation et s'active par Entrée ou Espace. Ordre de tabulation égal à l'ordre visuel |
| Sémantique | `button` pour une action, `a` pour une navigation, un `h1` par écran, `main`, `nav`, `header`, `footer` |
| Textes alternatifs | Icône décorative : `aria-hidden`. Bouton icône : `aria-label`. Logo cliquable : libellé « La Répét', accueil ». Vidéo : transcription accessible à côté |
| Couleur seule | Jamais porteuse unique de sens : appui et exploration diffèrent par le libellé, la forme du repère et l'icône |
| Formulaires | Libellé lié, aide reliée, erreur annoncée (`role="alert"`) et formulée avec la marche à suivre |
| Messages d'état | `role="status"` pour une confirmation, `role="alert"` pour une erreur |
| Zoom | La page reste utilisable à 200 % ; tailles en px mais aucun conteneur à hauteur fixe pour du texte |
| Langue et ton | Français, vouvoiement, écriture inclusive au point médian déjà en place, pas de tiret cadratin, pas d'emoji en guise d'icône |

---

## 9. Voix de l'interface (rappel)

Décrire, ne jamais noter. Formulation positive, appui avant exploration. Un bouton dit ce qui va se passer (« Envoyer à mon coach », pas « Valider »). Une erreur dit quoi faire. Les mentions rassurantes (« reste sur votre appareil ») s'écrivent en `TY.caption` sous l'action concernée.

---

## 10. Ce qui est interdit (résumé)

1. Couleur écrite à la main (`#…`, `rgb`, `rgba`, `hsl`, concaténation d'opacité) hors de `tokens.js`.
2. `font`, `fontSize`, `fontWeight`, `fontFamily`, `lineHeight`, `letterSpacing` hors de `tokens.js`.
3. Padding, marge ou écart hors de l'échelle de la section 3.
4. Rayon ou ombre hors des jetons `RAD` et `SH`.
5. `input`, `textarea`, `select` ou `button` natif hors de `ui.jsx`.
6. Deux actions pleines colorées sur le même écran.
7. Violet sans rapport avec l'assistant ; sarcelle hors action principale et points d'appui ; vert `success` ou rouge `error` en texte.
8. `div` cliquable, `transition: all`, emoji utilisé comme icône, `&nbsp;` pour espacer une icône.

---

## 11. Vérification automatique : `tests/design-lint.mjs`

À implémenter par le développeur. Script Node sans dépendance, lancé par `npm run test:design` (à ajouter dans `package.json` et dans la liste de vérifications de `CLAUDE.md`). Il sort avec le code 1 à la première règle violée, après avoir listé toutes les violations au format `fichier:ligne  règle  extrait  correction attendue`.

**Entrées** : tous les fichiers `src/**/*.{js,jsx}`. Le script importe `src/tokens.js` pour lire les échelles (aucune valeur dupliquée dans le script).

**Préparation de chaque fichier** : retirer les commentaires (`/* */`, `//`), les URI `data:` et les chemins SVG (`d="…"`, `points="…"`), en conservant les numéros de ligne.

**Fichiers sources de jetons** (exemptés des règles C, T, S, R, O, M) : `src/tokens.js` et `src/ui.jsx`. Ils sont soumis à la règle X.

| Code | Le script échoue si, hors fichiers de jetons… | Motif de recherche indicatif | Exceptions |
|---|---|---|---|
| C1 | une couleur hexadécimale est présente | `#[0-9a-fA-F]{3,8}\b` dans une chaîne | Les routes `#/…` ne correspondent pas au motif |
| C2 | une fonction de couleur est présente | `\b(rgba?\|hsla?)\(` | aucune |
| C3 | une opacité est concaténée à un jeton | `\$\{[^}]+\}[0-9a-fA-F]{2}(?![0-9a-zA-Z])` | aucune |
| C4 | un nom de couleur CSS est utilisé | `:\s*"(white\|black\|red\|green\|blue\|gray\|grey)"` | `"transparent"`, `"currentColor"`, `"inherit"`, `"none"` |
| T1 | une propriété typographique est écrite | `\b(font\|fontSize\|fontWeight\|fontFamily\|lineHeight\|letterSpacing)\s*:` dans un objet de style | `fontStyle`, `font: "inherit"` |
| T2 | une famille est nommée | `Manrope\|Inter\|JetBrains\|Segoe\|sans-serif\|monospace` | aucune |
| S1 | `padding*`, `margin*`, `gap`, `rowGap`, `columnGap` contient un nombre de px hors de l'échelle `SPACE` | tout nombre, isolé ou dans une chaîne `"12px 16px"` ; signe négatif admis | `auto`, `%`, `vh`, `svh`, `em`, `calc()` ; les valeurs `PAD.*`, `GAP.*`, `sp(n)` |
| S2 | `sp(n)` est appelé avec un `n` tel que `4n` est hors échelle | `sp\(([\d.]+)\)` | aucune |
| S3 | `<Card pad=` reçoit autre chose que `"none"`, `"sm"`, `"md"`, `"lg"` | `<Card[^>]*\bpad=\{` | aucune |
| S4 | `maxWidth` vaut un nombre de 600 ou plus | `maxWidth:\s*(\d+)` | utiliser `W.*` |
| R1 | `borderRadius` (et variantes par coin) reçoit autre chose que `RAD.*`, `"50%"` ou un nombre de 0 à 4 | `border\w*Radius:\s*([^,}]+)` | expressions composées uniquement de `RAD.*` et de 0 |
| O1 | `boxShadow` reçoit autre chose que `SH.*`, `ringOf(…)` ou `"none"` | `boxShadow:\s*([^,}]+)` | ternaire dont les deux branches sont permises |
| M1 | une transition est écrite à la main | `transition:\s*["'\`]` sans `MO.` ; tout `transition` contenant `all` | aucune |
| K1 | un élément natif de formulaire ou un bouton natif est utilisé | `<(input\|textarea\|select\|button)\b` | `<input type="file">` s'il apparaît un jour |
| K2 | `<Btn kind=` vaut autre chose que `objective`, `ai`, `primary`, `secondary`, `ghost`, `danger`, `white`, `ghostDark` ; `size` autre que `sm`, `md`, `lg` | valeur littérale ou branches d'un ternaire | aucune |
| K3 | `<Tag tone=` vaut autre chose que `primary`, `appui`, `ai`, `success`, `warning`, `error`, `muted` | idem, y compris les tons renvoyés par `lib/store.js` (`tone: "…"`) | aucune |
| K4 | un élément non interactif porte `onClick` | `<(div\|span\|p\|li)\b[^>]*\bonClick=` | voile de modale dans `ui.jsx` |
| K5 | une icône est espacée à la main | `&nbsp;\s*<Icon` ou `<Icon[^>]*/>\s*&nbsp;` | aucune |
| L1 | un tiret cadratin ou un emoji figure dans une chaîne | le caractère U+2014 ; `\p{Extended_Pictographic}` (drapeau `u`) | aucune ; s'applique aussi à `docs/*.md` pour le tiret |
| X1 | dans `tokens.js` et `ui.jsx` : une taille de police hors de `SIZES`, une graisse hors de `WEIGHTS` | `(\d+(?:\.\d+)?)px` dans les valeurs `font`, `font-size` ; `\b[1-9]00\b` en tête de `font` | logos (`RepetLogo`, `OrgLogo`) dont la taille est calculée à partir de `s` ; les valeurs non littérales (`${TY.h3.font}`) ne sont pas contrôlées |
| X2 | dans `ui.jsx` : une couleur hexadécimale ou `rgba` hors de l'import de `tokens.js` | motifs C1 et C2 | ombres colorées de `Btn`, à déplacer dans `tokens.js` (`SH.btn*`) pour ramener l'exception à zéro |
| A1 | une paire texte/fond déclarée dans `tokens.js` (`PAIRS`) a un contraste inférieur à son seuil | calcul WCAG de la luminance relative | aucune |

Dans les motifs du tableau, `\|` se lit `|` (échappement imposé par le format du tableau).

**Dérogation ponctuelle** : commentaire `// design-lint-disable-next-line CODE -- raison` sur la ligne précédente. La raison est obligatoire. Le script affiche le nombre de dérogations et échoue au-delà de `MAX_WAIVERS = 5`.

**Règle A1** : `tokens.js` exporte `PAIRS`, la liste des combinaisons de la section 1.5 sous la forme `[texte, fond, seuil]`. Le script recalcule chaque ratio : modifier une couleur sans vérifier ses contrastes devient impossible.

**Sortie attendue en cas de succès** : `design-lint : 0 violation, N fichiers, D dérogation(s)`.

**Limites connues** : le script ne voit pas « une seule action principale par écran », la hiérarchie des titres ni les cibles tactiles réelles. Ces trois points se contrôlent en revue, sur les captures de `tests/screenshots/` (ordinateur et 390 × 844).

---

## 12. Implémentation : jetons et composants

### 12.1 `src/tokens.js` (nouveau fichier, JavaScript pur)

```js
export const T = { /* jetons existants */
  successDk: "#1E7A4A", warningDk: "#8A5A0A", lineStrong: "#7C8AA0",
  primaryBg: "#EEF2F8", violetBg: "#F2F1F9",
  overlay: "rgba(27,58,102,.45)", videoBg: "#000000",
};                                  // supprimer T.ink
export const ON = { text: "#FFFFFF", chip: "rgba(255,255,255,.2)", line: "rgba(255,255,255,.3)", glow: "rgba(255,255,255,.16)", scrim: "rgba(0,0,0,.5)" };
export const FD = "'Manrope', 'Segoe UI', sans-serif", FB = "'Inter', 'Segoe UI', sans-serif", FM = "'JetBrains Mono', monospace";
export const SIZES = [11, 12, 13, 14, 16, 18, 20, 24, 26, 28, 32, 38, 54];
export const WEIGHTS = { [FD]: [700, 800], [FB]: [400, 600, 700], [FM]: [500, 700] };
export const TY = {
  display:  { font: `800 54px/1.05 ${FD}`, letterSpacing: "-.035em" },
  xl:       { font: `800 32px/1.15 ${FD}`, letterSpacing: "-.03em" },
  h1:       { font: `800 28px/1.15 ${FD}`, letterSpacing: "-.02em" },
  h2:       { font: `800 20px/1.25 ${FD}`, letterSpacing: "-.01em" },
  h3:       { font: `700 16px/1.3 ${FD}` },
  h4:       { font: `700 14px/1.4 ${FD}` },
  overline: { font: `700 11px/1.3 ${FB}`, letterSpacing: ".08em", textTransform: "uppercase" },
  lead:     { font: `400 18px/1.6 ${FB}` },
  bodyLg:   { font: `400 16px/1.6 ${FB}` },
  body:     { font: `400 14px/1.6 ${FB}` },
  bodyStrong: { font: `600 14px/1.5 ${FB}` },
  small:    { font: `400 13px/1.5 ${FB}` },
  caption:  { font: `400 12px/1.5 ${FB}` },
  label:    { font: `600 13px/1.3 ${FB}` },
  btnSm:    { font: `600 13px/1 ${FB}` }, btn: { font: `600 14px/1 ${FB}` }, btnLg: { font: `600 16px/1 ${FB}` },
  link:     { fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 },
  input:    { font: `400 16px/1.5 ${FB}` },
  tag:      { font: `600 12px/1 ${FB}`, letterSpacing: ".02em" },
  num:      { font: `700 28px/1 ${FM}` },
  code:     { font: `700 24px/1 ${FM}`, letterSpacing: ".25em" },
  time:     { font: `700 11px/1 ${FM}` },
  mono:     { font: `500 12px/1.5 ${FM}` },
};
export const TY_MOBILE = { display: 38, xl: 26, h1: 24, lead: 16 };   // appliqué par les classes .ty-* de GStyle
export const SPACE = [0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80];
export const sp = n => n * 4;
export const PAD = { sm: 16, md: 24, lg: 32, row: "16px 24px", notice: "12px 16px", page: "40px 24px 64px" };
export const PAD_MOBILE = { sm: 16, md: 20, lg: 24, row: "16px 20px", page: "24px 16px 48px" };
export const GAP = { section: 80, block: 32, grid: 24, stack: 12, field: 20, actions: 12 };
export const W = { page: 1200, wide: 1120, read: 760, form: 600, narrow: 440 };
export const RAD = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32, pill: 999 };
export const SH = { /* xs, sm, lg existants */ ring: `0 0 0 4px ${T.primaryBg}` };
export const ringOf = bg => `0 0 0 4px ${bg}`;
export const MO = { fast: ".12s", base: ".2s", enter: ".45s", ease: "cubic-bezier(.2,.7,.3,1)" };
export const Z = { nav: 50, modal: 100 };
export const INPUT = { width: "100%", height: 48, padding: "0 16px", borderRadius: RAD.md, border: `1.5px solid ${T.lineStrong}`, background: T.surface, color: T.navy, ...TY.input };
export const TONE = {              // rôle → couleurs, pour Tag, Notice, repères, observations
  primary: { fg: T.primary, bg: T.primaryBg }, appui: { fg: T.accent, bg: T.accentBg }, ai: { fg: T.violet, bg: T.violetBg },
  success: { fg: T.successDk, bg: T.successBg }, warning: { fg: T.warningDk, bg: T.warningBg }, error: { fg: T.errorDk, bg: T.errorBg }, muted: { fg: T.body, bg: T.lineLt },
};
export const PAIRS = [ /* [T.navy, T.surface, 4.5], … toutes les lignes de la section 1.5 */ ];
```

Dégradés : `GRAD` et `GRAD_AI` recomposés selon 1.3, `GRAD_NIGHT` ajouté, `GRAD_AI_SOFT` supprimé.

### 12.2 `src/ui.jsx`

| Composant | Action | Signature |
|---|---|---|
| `Txt` | créer | `<Txt v="h1" as="h2" color={T.navy} style>` : applique `TY[v]` et la classe `ty-{v}` (tailles mobiles) |
| `Btn` | modifier | `kind`, `size`, `icon`, `iconRight`, `full`, `disabled`, `type`, `aria-label` ; variantes et tailles de 5.1 ; survol uni ; désactivé sans opacité ; `transition` nommée ; classe `rp-btn-sm` (hauteur 44 sur mobile) |
| `IconBtn` | créer | `<IconBtn icon={I.trash} label="Supprimer la note" tone="muted" onDark>` : 44 × 44 |
| `Link`, `Back` | créer / modifier | `<Link onClick\|href onDark>` ; `Back` reçoit `children` (défaut « Retour »), icône flèche, zone 44 |
| `Field`, `Input`, `Textarea`, `Toggle` | créer | `<Field label hint error id>` ; `<Input variant="code" invalid>` ; styles `INPUT` |
| `Tag` | modifier | tons de 5.4 via `TONE`, `TY.tag`, hauteur 24 |
| `Card` | modifier | `pad` nommé (classes `rp-pad-sm\|md\|lg` pour le mobile), `level`, rendu `button` si `onClick`, `transition` nommée, déplacement 2 px |
| `Modal` | créer (fusion de `Counselor.Modal` et `legal.LegalModal`) | `<Modal title sub icon head="grad\|soft\|none" width="form\|read" footer close>` |
| `Notice`, `Quote` | créer | `<Notice tone="info" icon={I.shield}>` |
| `Empty` | créer | `<Empty icon title text action>` |
| `Confirm` | créer | Rond de confirmation 56 + titre + texte + actions (écrans « envoyé », « parcours prêt ») |
| `TimeChip` | créer | `<TimeChip t={12.3} tone="appui\|ai\|primary" onClick>` |
| `Rail` | modifier | couleurs de 5.10, `aria-current`, libellés mobiles |
| `GradHead` | modifier | padding `lg`, `TY.h1`, sous-titre blanc plein, propriété `as` |
| `Icon` | modifier | `aria-hidden` par défaut, propriété `title` facultative |
| `GStyle` | modifier | focus global (`:focus-visible` sur tous les interactifs, couleur `primary`), classes `.ty-display`, `.ty-xl`, `.ty-h1`, `.ty-lead`, `.rp-pad-*`, `.rp-page`, `.rp-actions` (boutons en colonne sur mobile) ; suppression de `.rp-h1`, `.rp-h2`, `.rp-h3`, `.rp-head`, `.rp-card-pad`, `.rp-cta` devenues inutiles ; focus des champs en `primary` |

---

## 13. Journal des décisions

| Date | Décision | Pourquoi |
|---|---|---|
| 2026-11-20 | Création du référentiel (v3.0) à partir de l'audit du code | Harmoniser couleurs, typographie, espacements |
| 2026-11-20 | Action principale toujours sarcelle (`objective`) ; bleu plein réservé aux actions neutres hors parcours | Le bleu et la sarcelle se disputaient le rôle |
| 2026-11-20 | Texte de validation en `successDk`, d'attention en `warningDk` ; `success`, `warning`, `error` clairs réservés au décor | Contrastes de 1,8 à 3,0:1 |
| 2026-11-20 | Milieu de `GRAD` en `blueDk`, `GRAD_AI` de `blueDk` à `violet` | Texte blanc à 3,4:1 sur `blue` |
| 2026-11-20 | Bordure des champs en `lineStrong` | Bordure `line` à 1,2:1, invisible pour une partie du public |
| 2026-11-20 | Texte des champs à 16 px | Zoom automatique d'iOS en dessous |
| 2026-11-20 | Échelle typographique à 13 tailles, Inter 500 supprimé | 91 combinaisons relevées |
| 2026-11-20 | Trois paddings de carte (16, 24, 32), cinq largeurs de page | 9 paddings et 12 largeurs relevés |

| 2026-11-20 | Icônes du pied de page en couleur (exception documentée en section 1) | Préférence explicite du propriétaire |
| 2026-11-20 | Implémentation : jetons dans `src/tokens.js`, composants dans `src/ui.jsx` ; `site.jsx` supprimé (plus de doublon `TT`, `TY`, `W`, `MO`, `Field`…) | Une seule définition par jeton et par composant |
| 2026-11-20 | `tests/design-lint.mjs` (`npm run test:design`) bloquant, ajouté à `CLAUDE.md` et `AGENTS.md` | Garantie automatique |
| 2026-11-20 | Nouveaux jetons : `T.glass` (en-tête), `T.studio` (fond uni caméra), `ON.soft`, `HL.*`, `GRAD_PAGE`, `TY.pageTitle`, `TY.quote`, `TY.strong`, `TY.inherit`, `SH.btn.*`, `PACE`, `HEADER_H` | Valeurs présentes dans des rendus validés, désormais nommées |
| 2026-11-20 | Composants ajoutés : `Bare` (bouton nu pour options, repères, onglets), `CheckTile` (tuile à cocher), `Chip` (`role` radio ou checkbox, `tone="ai"` pour les suggestions de l'assistant) | Supprimer tout `button` natif des écrans (règle K1) |
| 2026-11-20 | Bouton « Arrêter » : le glyphe ■ devient l'icône `I.stop` ; boutons d'envoi : icône à gauche (seule la flèche de progression va à droite) | Section 5.1, pas de glyphe en guise d'icône |
| 2026-11-20 | Pied de page : bloc de liens de navigation retiré (pages déjà dans l'en-tête) ; FAQ et liens légaux conservés | Demande du propriétaire |
| 2026-11-20 | Emplacement du logo d'organisme (« Famickael », cadre pointillé) retiré de l'en-tête, du menu mobile et du pied de page ; `OrgLogo` reste dans `ui.jsx` pour un usage futur | Demande du propriétaire |
| 2026-11-20 | v3.1 : profondeur et marque (`GRAD_TITLE`, `GRAD_ACCROCHE`, `GRAD_HERO`, `GRAD_SECTION`, `GLOW`, `SH.glow`, `SH.glowAi`) et transitions plus calmes (`MO.reveal`, `MO.slow`, `MO.fade`, `MO.soft`, `PACE`) sur les pages publiques | Demande du propriétaire : plus de dégradés et d'effets, fondus plus lents |
| 2026-11-20 | Écran de chargement : 1,9 s minimum, fondu 0,6 s ; 0,6 s si « réduire les animations » | Demande du propriétaire : laisser voir l'animation |

Ajouter une ligne à chaque évolution d'une règle ou d'une échelle.
