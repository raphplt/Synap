# 🧠 MEMEX

> Le TikTok de l'intelligence. Plateforme de micro-learning social basée sur un feed hybride et de la neuro-gamification.

Ce dépôt contient le monorepo (Turborepo + npm workspaces) décrit dans `docs/project.md` et `docs/tasks.md`. Il fournit :
- une API NestJS avec ingestion Wikipédia filtrée et endpoint `/feed`
- une app mobile Expo (React Native) avec feed plein écran, flip cards et cache TanStack Query
- des types partagés pour garantir la cohérence back/front

## Structure

```
/
├── apps/
│   ├── api/        # API NestJS + TypeORM (PostgreSQL)
│   └── mobile/     # App Expo Router + NativeWind + FlashList
├── packages/
│   ├── shared/     # Types/DTOs communs
│   └── config/     # Bases TS/ESLint (extensibles)
├── docs/           # Vision produit + roadmap
├── turbo.json      # Pipelines Turborepo
└── package.json    # Workspaces + scripts racine
```

## Prérequis
- Node.js (LTS) + npm
- Docker (pour PostgreSQL)

## Installation

```bash
# Cloner puis installer
npm install
```

## Démarrage (dev)

```bash
# API + Mobile en parallèle
npm run dev
```

- API : `http://localhost:3000`
- Mobile : Expo (QR code dans les logs)

## Base de données
1. Copier `.env.example` vers `apps/api/.env` et ajuster si besoin.
2. Démarrer Postgres :
   ```bash
   docker compose up -d
   ```

### Mobile (Expo)
- Variable optionnelle : `EXPO_PUBLIC_API_URL` (par défaut `http://localhost:3000`, `http://10.0.2.2:3000` sur émulateur Android).
- Lancement : `npm run dev -- --filter=@memex/mobile` pour ouvrir uniquement l'app Expo.

## Scripts utiles
- `npm run dev` : API + Mobile en dev
- `npm run lint` : lint API + Mobile
- `npm run typecheck` : vérification TS
- `npm run api:ingest -- --title="Albert Einstein"` : ingère une fiche Wikipédia filtrée

## Licences & attribution
- Contenu Wikipédia : CC BY-SA 3.0 (attribution incluse dans les cartes)
- Code source : MIT

**Mainteneur :** Raphaël P.
