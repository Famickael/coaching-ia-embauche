# Instructions Claude Code

Lire d'abord `AGENTS.md` (règles communes à tous les agents IA, file de missions, branches), puis `README.md`, en particulier les sections « Règles de conception à respecter », « Passage en production » et « Reprise du travail avec Claude Code », et `docs/design-system.md` avant toute modification d'interface.

- Vérifier chaque changement avec `npm run build`, `npm run test:analysis`, `node tests/assistant.test.mjs` et, si l’environnement le permet, `npm run test:e2e` (aussi avec `E2E_VIEWPORT=390x844`).
- Ne jamais introduire de note, de score ni d’inférence émotionnelle (voir `src/lib/analysis.js`, `isCompliant`).
- Textes d’interface en français, sans tiret cadratin.
- Missions pour Codex : ouvrir une issue par mission, titre commençant par `[Codex]`, avec contexte, résultat attendu, fichiers concernés, critères de validation et hors périmètre (voir `AGENTS.md`, section 4). Relire ensuite la pull request de Codex avant toute fusion.
