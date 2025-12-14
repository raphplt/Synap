# 🗺️ ROADMAP & TASKS : MEMEX

> **Document de Suivi de Projet**
> Ce fichier liste les tâches techniques précises pour mener le projet du POC jusqu'à la scalabilité SaaS.
> **Méthodologie :** Modular Monolith, Feature-First, DevOps dès le J1.

---

## 🗓️ PHASE 1 : THE THIN SLICE (POC)

**Objectif :** Valider la fluidité technique (60fps) et la qualité du contenu visuel.
**Est. Durée :** 2-3 semaines.

### 🔌 BACKEND (API - NestJS)

- [ ] **Init Monorepo :** Configuration Turborepo + pnpm workspaces + Shared Types (Strict Mode).
- [ ] **DB Setup :** Container Docker PostgreSQL + TypeORM Config + Migration Initiale.
- [ ] **Entity `Card` :** Création du schéma (UUID, title, summary, content, mediaUrl, sourceLink).
- [ ] **Service `WikiIngest` (v0.1) :**
  - [ ] Implémenter le fetch sur l'API `fr.wikipedia.org`.
  - [ ] **Filtre Bloquant :** Rejeter tout article sans `thumbnail` ou dont la width < 500px.
  - [ ] **Cleaning :** Regex pour nettoyer le HTML/Wikitext (retirer les `[1]`, `{{...}}`).
  - [ ] **Upsert :** Sauvegarder en base uniquement si non existant.
- [ ] **Endpoint `GET /feed` :**
  - [ ] Logique de pagination par curseur (`take: 10`, `skip: cursor`).
  - [ ] Retourner 10 cartes aléatoires de la DB (pas d'algo complexe pour le moment).

### 📱 MOBILE (Frontend - Expo)

- [ ] **Init Project :** Expo SDK Latest + NativeWind v4 + Reanimated 3.
- [ ] **Navigation :** Setup Expo Router v3 (Stack de base : Feed / Details).
- [ ] **Component `FeedList` :**
  - [ ] Implémenter `@shopify/flash-list`.
  - [ ] Configurer `estimatedItemSize` (hauteur écran).
  - [ ] Activer `pagingEnabled` pour le snap effect "TikTok".
- [ ] **Component `CardItem` :**
  - [ ] Layout Plein Écran (Image background + Linear Gradient overlay).
  - [ ] Typographie lisible (NativeWind classes).
- [ ] **Animation "Flip" :**
  - [ ] Utiliser `useAnimatedStyle` et `withSpring` pour retourner la carte sur un tap.
  - [ ] Afficher le contenu détaillé au verso (ScrollView).
- [ ] **Offline Cache :** Configurer TanStack Query avec un `staleTime` infini pour le feed chargé.

### ☁️ DEVOPS / INFRA

- [ ] **Dockerisation :** Créer un `Dockerfile` optimisé pour l'API (Multi-stage build : Build TS -> Node Alpine).
- [ ] **CI Pipeline (Github Actions) :**
  - [ ] Job `Lint` (ESLint + Prettier).
  - [ ] Job `Typecheck` (tsc --noEmit).
- [ ] **CD Staging :** Déploiement auto sur Railway/Render au push sur `main`.
- [ ] **Mobile Build :** Configurer EAS Build (Expo Application Services) pour générer un APK de dev.

---

## 🗓️ PHASE 2 : MVP (MARKET READY)

**Objectif :** Rétention & Gamification. Lancement Stores.

### 🔌 BACKEND

- [ ] **Auth Module :**
  - [ ] Setup Passport-JWT + Argon2.
  - [ ] Endpoints `/auth/register`, `/auth/login`.
  - [ ] **Social Auth :** Google & Apple (Requis pour iOS).
- [ ] **User Domain :**
  - [ ] Entity `User` (email, username, avatar, xp, level, streak).
  - [ ] Entity `UserCardInteraction` (userId, cardId, status, nextReviewDate).
- [ ] **Service `SRSAlgorithm` :**
  - [ ] Implémenter la logique de rappel (SuperMemo-2 simplifié).
  - [ ] Mettre à jour `/feed` pour mixer : 70% New / 20% Review / 10% Quiz.
- [ ] **Interactions API :**
  - [ ] `POST /cards/:id/view` (Tracking temps passé).
  - [ ] `POST /cards/:id/like`.

### 📱 MOBILE

- [ ] **Onboarding Flow :** 3 écrans (Centres d'intérêt -> Auth -> Tuto).
- [ ] **Gamification UI :**
  - [ ] Jauge XP animée en haut du feed.
  - [ ] Animation "Level Up" (Lottie ou Reanimated).
  - [ ] Visualisation "Synapse Streak" (Série en cours).
- [ ] **Quiz Components :**
  - [ ] UI "Vrai/Faux" (Swipe gesture).
  - [ ] UI "QCM" (4 boutons).
  - [ ] Feedback Haptic (Vibration) sur succès/échec.
- [ ] **In-App Review :** Trigger natif après 5 jours de streak.

### ☁️ DEVOPS

- [ ] **Environnements :** Séparation stricte des variables (`.env.production` vs `.env.staging`).
- [ ] **Monitoring :**
  - [ ] Intégration **Sentry** (API & Mobile) pour les crashs.
  - [ ] Intégration **PostHog** pour l'analytique produit (Funnel d'inscription, Rétention).
- [ ] **Backups :** Dump automatique de la DB vers S3 chaque nuit (PGDump).
- [ ] **Rate Limiting :** Configurer `@nestjs/throttler` (Global + Strict sur Auth).

---

## 🗓️ PHASE 3 : SCALE & MONETIZATION

**Objectif :** Rentabilité et Volume (10k+ users).

### 🔌 BACKEND

- [ ] **Ingestion Avancée :**
  - [ ] Scripts d'import pour sources JSON (Maths, Code).
  - [ ] Auto-Tagging (NLP basique pour catégoriser les articles Wiki).
- [ ] **Search Engine :** Implémenter Full-Text Search (Postgres `tsvector` ou MeiliSearch).
- [ ] **Monétisation :**
  - [ ] Webhooks RevenueCat (Gestion abonnements).
  - [ ] Unlock Features (Mode Offline, Stats).

### 📱 MOBILE

- [ ] **Social Features :**
  - [ ] Espace Commentaires (Bottom Sheet).
  - [ ] Partage Deep Link (Ouvrir l'app sur une carte spécifique).
- [ ] **Mode "Focus" :** Filtres par tags (ex: afficher que "Histoire").
- [ ] **Perf Tuning :**
  - [ ] Optimiser le TTI (Time to Interactive).
  - [ ] Réduire le bundle size.

### ☁️ DEVOPS

- [ ] **Caching Layer :** Ajouter Redis pour cacher les réponses de `/feed` et les sessions.
- [ ] **CDN :** Servir les images via Cloudflare ou AWS CloudFront.
- [ ] **Tests E2E :** Script Maestro pour tester le parcours critique (Login -> Scroll -> Quiz) avant chaque release.

---

## 🗓️ PHASE 4 : MATURITY (SAAS)

**Objectif :** Plateforme UGC & IA.

### 🔌 BACKEND

- [ ] **UGC Platform :** CRUD pour création de cartes par les users.
- [ ] **Moderation :** Queue de validation (Back-office Admin).
- [ ] **AI Recommendation :** Vecteurs (PgVector) pour recommander du contenu sémantiquement proche.

### ☁️ DEVOPS

- [ ] **Infrastructure as Code :** Terraform pour gérer l'infra AWS.
- [ ] **Kubernetes :** Migration vers K8s si auto-scaling nécessaire.
- [ ] **Security Audit :** Pentest externe.
