# Instructions pour les agents IA (Codex, Claude et autres)

Ce dépôt est travaillé par plusieurs assistants IA. Ce fichier est leur point d'entrée commun ; `CLAUDE.md` renvoie ici.

## 1. À lire avant toute modification

1. `README.md` : sections « Règles de conception à respecter », « Passage en production », « Reprise du travail ».
2. `docs/design-system.md` : référentiel UI/UX (couleurs, typographie, espacements, composants). Toute interface s'y conforme ; toute nouvelle règle s'y ajoute.
3. Les briefs de la mission dans `docs/briefs/` quand l'issue y renvoie.

## 2. Règles non négociables

- Aucune note, score, classement, jauge ni courbe de progression ; aucune inférence d'émotion ou de personnalité (AI Act, art. 5(1)(f)). Voir `isCompliant` dans `src/lib/analysis.js`.
- Aucun chiffre, résultat, témoignage, nom de personne ou d'organisme inventé présenté comme réel.
- Textes en français, vouvoiement côté bénéficiaire, ton positif et non évaluatif, **pas de tiret cadratin**.
- La vidéo reste sur l'appareil tant que la personne ne décide pas de l'envoyer.
- Aucun secret (clé d'API, mot de passe) dans le dépôt.

## 3. Répartition des rôles

| Agent | Rôle |
|---|---|
| Claude (Claude Code) | Développement de l'application, relecture, rédaction des missions, fusion après accord du propriétaire |
| Codex | Exécution des missions confiées par issue : images, recherche d'information, rédaction de contenus (articles de `src/content/resources/`), petites corrections ciblées |
| Le propriétaire | Décide, valide, fusionne ou demande la fusion |

## 4. File de missions (issues GitHub)

- Une mission = une issue ouverte par Claude, dont le titre commence par `[Codex]`.
- Le corps de l'issue contient : contexte, résultat attendu, fichiers concernés, critères de validation, hors périmètre.
- L'agent exécutant lit le corps **et** les commentaires avant d'agir. Si la provenance, le résultat ou la validation restent ambigus, il pose la question **une seule fois** en commentaire de l'issue et s'arrête.
- Une piste dans le README, un brief ou une pull request ne suffit pas à lancer une mission : seule une issue `[Codex]` ouverte le fait.

## 5. Branches et pull requests

- Ne jamais pousser sur `main`. Une branche par mission : `codex/<numéro-issue>-<sujet-court>` (Codex) ou `claude/<sujet>` (Claude).
- Une pull request par mission, qui référence l'issue (`Closes #<numéro>`), décrit ce qui a été fait et coche chaque critère de validation.
- Ne modifier que les fichiers du périmètre de la mission. Ne pas reformater ni « améliorer » le reste.
- Ne jamais fusionner sa propre pull request : la fusion revient au propriétaire (ou à Claude sur sa demande).

## 6. Vérifications avant pull request

```bash
npm ci
npm run build
npm run test:analysis
node tests/assistant.test.mjs
# si Chromium est disponible :
npm run test:e2e
E2E_VIEWPORT=390x844 npm run test:e2e
```

## 7. Où se trouvent les contenus

| Contenu | Emplacement | Format |
|---|---|---|
| Articles et scénarios d'usage (Ressources) | `src/content/resources/` | voir `docs/briefs/chatgpt-ressources.md` |
| Images du site | `public/img/` | voir `docs/briefs/chatgpt-images.md` (noms de fichiers imposés) |
| Questions d'entraînement | `src/lib/questions.js` | |
| Base de connaissances de l'assistant | `src/lib/assistant.js` | |
| Métiers proposés | `src/lib/jobs.js` | |

Les images : formats web (webp ou jpg), largeur 1200 px maximum, 150 Ko maximum chacune, sans texte ni logo incrusté, licences permettant l'usage libre (indiquer la provenance dans la pull request et dans le README, section crédits).
