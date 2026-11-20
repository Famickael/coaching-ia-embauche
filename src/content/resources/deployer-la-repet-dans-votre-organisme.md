---
title: Déployer La Répét' dans votre organisme
category: organismes
type: guide
summary: Les questions à se poser avant un déploiement, pour la direction, la DSI, le juridique et le DPO, et l'état actuel du prototype.
image: ressources/deployer-la-repet-dans-votre-organisme.webp
imageAlt: Deux femmes discutent à un bureau près d’une fenêtre.
date: 2026-11-20
readingTime: 8
author: Équipe La Répét'
order: 9
---

La Répét' est conçue pour être **construite et hébergée par l'organisme d'accompagnement lui-même**, plutôt qu'achetée à un éditeur. Ce guide résume ce qu'un déploiement implique pour chaque fonction. Il décrit honnêtement l'état actuel : un prototype fonctionnel, qui demande encore un travail de mise en production.

## Pour la direction

- **Le besoin** : permettre aux personnes accompagnées de s'entraîner entre deux rendez-vous, et rendre les ateliers plus concrets grâce aux prises partagées.
- **Le parti pris** : décrire sans noter, garder le coach au centre. L'outil complète l'accompagnement, il ne le remplace pas.
- **Le pilotage** : des indicateurs agrégés uniquement (prises à relire, rapports envoyés, réentraînement, délai de relecture), sans mesure individuelle.
- **Les moyens** : une petite équipe technique interne ou un prestataire de développement pour la mise en production, puis l'exploitation courante.

## Pour la DSI

- **Architecture actuelle** : une application web React construite avec Vite, servie comme un site statique. Les données sont stockées dans le navigateur (localStorage et IndexedDB).
- **Ce qui manque pour un usage réel** : un backend (API) branché derrière les fonctions de stockage existantes, une authentification forte des coachs, l'expiration des codes, la purge automatique et la journalisation.
- **Modèles** : la transcription (Whisper) et le suivi du regard (MediaPipe) tournent dans le navigateur. En production, leurs fichiers doivent être auto-hébergés.
- **Options** : une transcription serveur ou une reformulation par un modèle de langage hébergé en France peuvent être branchées par configuration. Seul du texte leur est alors transmis.

> [!conseil] Commencer par un pilote
> Un pilote sur un site, avec quelques coachs volontaires, permet de valider les usages, les seuils de l'analyse et l'accessibilité avant d'étendre.

## Pour le juridique et le DPO

- **Règlement européen sur l'IA (AI Act)** : l'outil n'infère aucune émotion ni trait de personnalité, ce que l'article 5 interdit notamment dans les contextes de travail et d'éducation. La qualification complète du système selon votre usage reste à faire avec vous.
- **Transparence et supervision humaine** : la personne sait qu'un assistant produit le retour, et rien ne lui parvient de la part du coach sans envoi explicite.
- **RGPD** : consentement granulaire et retirable, minimisation (prénom et initiale, poste visé), vidéo conservée sur l'appareil tant que la personne ne décide pas de l'envoyer. Une analyse d'impact (AIPD) est à mener, et les textes d'information fournis sont des documents de travail à valider.

## Les étapes d'un déploiement

1. Cadrage : besoins, publics, règles de conservation, hébergement.
2. Analyse d'impact et validation des textes d'information.
3. Mise en production technique : backend, authentification, auto-hébergement des modèles.
4. Pilote avec quelques coachs, puis ajustements.
5. Formation des équipes et déploiement progressif.

Pour en parler avec l'équipe, utilisez la page [Demander une démo](#/demo).
