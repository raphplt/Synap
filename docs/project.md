# 🧠 MEMEX (Project Name)

> **Le TikTok de l'intelligence.**
> Une plateforme de micro-learning social qui transforme le doomscrolling en apprentissage actif.

![Status](https://img.shields.io/badge/Status-Development-blue)
![Stack](https://img.shields.io/badge/Stack-Fullstack-yellow)
![License](https://img.shields.io/badge/License-MIT%20%2F%20CC%20BY--SA-green)

## 📋 À Propos

**MEMEX** est une application mobile visant à démocratiser l'excellence culturelle et scolaire. Contrairement aux réseaux sociaux classiques, notre algorithme ne maximise pas seulement l'engagement, mais **l'acquisition de connaissances**.

### Core Concept : Le "Smart Feed"

Un flux infini et hybride qui mélange intelligemment :

1. **🔭 Découverte (70%)** : Micro-fiches (Maths, Histoire, Tech, Culture G).
2. **🧠 Répétition (20%)** : Fiches déjà vues réapparaissant au moment critique (SRS - Spaced Repetition) pour l'ancrage mémoriel.
3. **🎮 Challenge (10%)** : Quiz et Flashcards interactifs intégrés directement dans le scroll.

---

## ✨ Fonctionnalités Clés

- **Feed Haute Performance :** Scroll vertical fluide type TikTok (basé sur `@shopify/flash-list`).
- **Contenu Multi-Sources :** Agrégation de Wikipédia (via API) et de contenus éducatifs certifiés (Maths, Grammaire, Code).
- **Filtres de Niveau :** Personnalisation du contenu selon le profil (Collège, Lycée, Expert).
- **Gamification :** XP, Streaks (série de jours), et Badges de connaissances.
- **Social Learning :** Commentaires, partages, et favoris (Collections).

---

## 🛠️ Architecture & Stack Technique

Le projet est structuré en **Monorepo** utilisant **Turborepo** et **pnpm workspaces**.

### 📂 Structure du Projet

```bash
.
├── apps
│   ├── mobile          # React Native (Expo SDK 50+)
│   └── api             # NestJS (Backend REST API)
├── packages
│   ├── shared          # Types TypeScript partagés (DTOs, Interfaces)
│   ├── config          # Configurations partagées (ESLint, TSConfig)
│   └── ui              # (Optionnel) Composants UI partagés
└── turbo.json          # Pipeline de build
```
