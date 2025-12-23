# 🧠 SYNAP

> **Transformer le scroll compulsif en intelligence cumulée.**

SYNAP est une application de **micro-learning cognitif** qui transforme le réflexe universel du *scroll* en un **entraînement intellectuel quotidien**. C'est le "scroll utile", addictif et cumulatif.

---

## 🚀 La Vision
**"Devenir plus intelligent un peu chaque jour, sans y penser."**

SYNAP exploite les mécaniques des réseaux sociaux au service de la cognition. L'objectif est de transformer le temps mort quotidien en capital cognitif durable. Chaque minute passée sur l'application laisse une trace mesurable dans le cerveau.

## 🎯 Points Clés
- **UVP :** "Scroller sans culpabilité."
- **North Star Metric :** Knowledge Retained per User (KRu).
- **Formule :** TikTok × Spaced Repetition × Game Design.

## 🛠️ Piliers Fonctionnels
1. **Smart Feed Cognitif :** Scroll vertical fluide mixant découverte, rappels (SRS) et validation.
2. **Unité Atomique :** Une idée = une carte. Conçue pour une compréhension en moins de 15s.
3. **Validation Active :** Micro-quiz intégrés pour transformer la consommation passive en mémoire active.
4. **Progression Visible :** L'utilisateur voit son intelligence progresser via des streaks et un système d'XP.

---

## 💻 Structure Technique
Le projet est organisé en monorepo (Turborepo + npm workspaces) :

- **apps/api** : API NestJS, ingestion Wikipédia, gestion du feed et de la rétention.
- **apps/mobile** : Application Expo (React Native) avec feed fluide et interaction par cartes.
- **packages/shared** : Contrats d'interface et types partagés.
- **packages/config** : Configurations partagées (ESLint, TypeScript).

## ⚙️ Installation & Démarrage

```bash
# 1. Installation des dépendances
npm install

# 2. Configuration (PostgreSQL via Docker)
docker compose up -d

# 3. Lancement du développement (API + Mobile)
npm run dev
```

### Scripts utiles
- `npm run api:ingest -- --title="Sujet"` : Ingestion manuelle d'une fiche Wikipédia.
- `npm run lint` : Vérification du code.
- `npm run typecheck` : Vérification des types TypeScript.

---
---

## 📄 Licence
- Contenu Wikipédia : CC BY-SA 3.0
- Code source : MIT

**Mainteneur :** Raphaël P.
