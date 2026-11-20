---
title: Déployer La Répét' dans votre organisme
category: organismes
type: guide
summary: Les questions à se poser avant un déploiement, pour la direction, la DSI, le juridique et le DPO, et les étapes d'un déploiement.
image: ressources/deployer-la-repet-dans-votre-organisme.webp
imageAlt: Deux femmes discutent à un bureau près d’une fenêtre.
date: 2026-11-20
readingTime: 8
author: Équipe La Répét'
order: 9
---

La Répét' est conçue pour être **construite et hébergée par l'organisme d'accompagnement lui-même**, plutôt qu'achetée à un éditeur. Ce guide résume ce qu'un déploiement implique pour chaque fonction.

## Pour la direction

- **Le besoin** : permettre aux personnes accompagnées de s'entraîner entre deux rendez-vous, et rendre les ateliers plus concrets grâce aux réponses envoyées.
- **Le parti pris** : décrire sans noter, garder le coach au centre. L'outil complète l'accompagnement, il ne le remplace pas.
- **Le pilotage** : des indicateurs agrégés uniquement (réponses à relire, rapports envoyés, délai de relecture), sans mesure individuelle.
- **Les moyens** : une petite équipe technique interne ou un prestataire de développement pour l'installation, puis l'exploitation courante.

## Pour la DSI

- **Architecture** : une application web React construite avec Vite, servie comme un site statique. Les entraînements sont gardés dans le navigateur de la personne (localStorage et IndexedDB).
- **Raccordement** : votre serveur (API) se branche derrière les fonctions de stockage existantes, avec l'authentification des coachs, l'expiration des codes, la purge automatique et la journalisation.
- **Modèles** : la transcription (Whisper) et le suivi du regard (MediaPipe) tournent dans le navigateur. Leurs fichiers peuvent être hébergés chez vous.
- **Options** : une transcription serveur ou une reformulation par un modèle de langage de votre choix peuvent être branchées par configuration. Seul du texte leur est alors transmis.

> [!conseil] Commencer par un pilote
> Un pilote sur un site, avec quelques coachs volontaires, permet de valider les usages, les seuils de l'analyse et l'accessibilité avant d'étendre.

## Pour le juridique et le DPO

- **Règlement européen sur l'IA (AI Act)** : l'outil n'infère aucune émotion ni trait de personnalité, ce que l'article 5 interdit sur le lieu de travail et dans les établissements d'enseignement. La qualification complète du système selon votre usage reste à faire avec vous.
- **Transparence et supervision humaine** : la personne sait qu'un assistant produit le retour, et rien ne lui parvient de la part du coach sans envoi explicite.
- **RGPD** : consentement donné option par option et retirable, minimisation (prénom et initiale, poste visé), vidéo conservée sur l'appareil tant que la personne ne décide pas de l'envoyer. Une analyse d'impact (AIPD) est obligatoire avant le déploiement, et les textes de « Vos données » sont à valider par votre DPO.

## Les étapes d'un déploiement

1. Cadrage : besoins, publics, règles de conservation, hébergement.
2. Analyse d'impact et validation des textes d'information.
3. Installation technique : serveur, authentification, hébergement des modèles.
4. Pilote avec quelques coachs, puis ajustements.
5. Formation des équipes et déploiement progressif.

Les détails par fonction sont sur la page [Solutions, organismes](#/solutions/organismes).
