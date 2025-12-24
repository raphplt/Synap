# 🗺️ ROADMAP : CAP SUR LA BÊTA (v0.9)

> **Objectif Unique :** Livrer une application fonctionnelle, "installable", avec une boucle de rétention complète (Auth + Feed + SRS + Gamification) et un contenu de haute qualité (Multi-sources).

---

## 🏗️ 1. ARCHITECTURE & REFACTO (Fondations)
*Avant de construire plus haut, on solidifie les bases actuelles.*

- [ ] **Internationalisation (i18n) Stricte**
  - [ ] Installer `i18next` + `react-i18next` sur le mobile.
  - [ ] Créer la structure `locales/fr.json` et `locales/en.json`.
  - [ ] **Action :** Extraire *toutes* les strings hardcodées du POC actuel (Titres, boutons, erreurs) vers les fichiers JSON.
- [ ] **Standardisation API/DTO**
  - [ ] Vérifier que chaque endpoint utilise un DTO validé par `class-validator`.
  - [ ] Refactoriser les contrôleurs : Interdire le retour d'entités TypeORM brutes (Mapper systématique `Entity -> ResponseDTO`).

---

## 🔐 2. AUTHENTIFICATION & UTILISATEURS
*Passage d'un mode "visiteur anonyme" à "joueur identifié".*

### Backend (NestJS)
- [ ] **Module `Auth`**
  - [ ] Installer et configurer `Passport-JWT` + `Argon2` (hashing).
  - [ ] Implémenter les endpoints : `POST /auth/signup`, `POST /auth/login`, `GET /auth/me`.
  - [ ] **Guard Global :** Sécuriser toutes les routes par défaut (APP_GUARD), sauf `/auth/*` et `/health`.
- [ ] **Module `User`**
  - [ ] Mettre à jour l'Entity `User` : Ajouter `xp` (int), `streak` (int), `lastActivityAt` (Date).
  - [ ] **Onboarding Data :** Stocker les `interests` (tags JSONB) sélectionnés à l'inscription.

### Mobile (Expo)
- [ ] **État Global (Session)**
  - [ ] Créer un store Zustand `useAuthStore` (token, user, actions login/logout).
  - [ ] Persistance du Token : Implémenter `expo-secure-store`.
- [ ] **Écrans d'Auth (Design System V2)**
  - [ ] **Landing :** Écran d'accueil "Cinématique" (Vidéo/Lottie + CTA).
  - [ ] **Login / Signup :** Refonte des formulaires (Dark mode, Input minimalistes).
  - [ ] **Onboarding :** Écran de sélection de thèmes (Tags sélectionnables).

---

## 💾 3. DATA ENGINE : "BEYOND WIKIPEDIA"
*Le cœur du changement. On ne dépend plus uniquement de l'API Wiki. On crée un pipeline d'ingestion agnostique.*

### Backend (Ingestion Pipeline)
- [ ] **Refacto du Modèle de Données**
  - [ ] Update Entity `Card` : Ajouter colonne `origin` ('WIKIPEDIA', 'CURATED_JSON', 'AI_GENERATED') et `externalId`.
  - [ ] **Qualité :** Ajouter colonne `qualityScore` (0-100) pour prioriser les meilleures cartes dans l'algo.
- [ ] **Service `IngestionFactory`**
  - [ ] Créer une interface générique `ContentProvider`.
  - [ ] **Adapter Wikipedia (Existant) :** Améliorer le nettoyage du wikitext (supprimer artefacts visuels, templates cassés).
  - [ ] **Adapter "Curated" (Nouveau) :** Script d'import pour ingérer des fichiers JSON/Markdown locaux.
    - *Format cible :* `data/curated/biais-cognitifs.json` (ex: "Les 50 Biais Cognitifs").
- [ ] **Seeding Initial**
  - [ ] Préparer un dataset "Gold" de ~200 cartes manuelles/vérifiées (JSON) pour le lancement Bêta.
  - [ ] **Système de Séries** : Le but est d'avoir des "séries" de cartes, avec des thèmes globaux (exemple : histoire -> theme, "18eme siècle" -> sub-theme, qui contient 50 cartes. si on a toutes les cartes d'un sub-theme, on peut les marquer comme "gold".)
  - [ ] **XP :** Il faut que le joueur puisse gagner de l'expérience, et avoir un "niveau" général , et des niveaux par theme, et un "streak" de jours consécutifs.

---

## 🧠 4. ALGORITHME & LOGIQUE MÉTIER
*Le "cerveau" invisible de l'application.*

### Backend
- [ ] **Algorithme SRS (Spaced Repetition)**
  - [ ] Implémenter la logique SuperMemo-2 (SM2) ou FSRS simplifié dans un `SrsService`.
  - [ ] Calcul du `nextReviewDate` basé sur le feedback utilisateur (Easy/Good/Hard/Again).
  - [ ] **Logique "Gold" :** Compteur de succès consécutifs. Au 5ème succès -> Statut `GOLD`.
- [ ] **Endpoint `/atlas`**
  - [ ] Aggregation : Retourner les stats par Deck (Total cartes, % progression, nb cartes Gold).
- [ ] **Endpoint `/feed` Intelligent**
  - [ ] **Feed Mixer (Règle 70/20/10) :**
    - 70% **New** / 20% **Review** / 10% **Challenge**.
  - [ ] **Anti-doublon :** Exclusion stricte des cartes récentes.

---

## 🎨 5. FRONTEND REBOOT (UI/UX COMPLET)
*Refonte totale de l'interface mobile selon la nouvelle D.A. (Dark Mode / Electric Cyan / Immersif).*

- [ ] **Design System (NativeWind)**
  - [ ] Configurer les tokens couleurs : `bg-synap-charcoal`, `text-synap-cyan`, `border-synap-gold`.
  - [ ] Configurer les typos : Inter (Body) & Geist (Headers).
  - [ ] **Tab Bar Custom :** Créer une barre de navigation flottante (blur effect) avec icônes actives/inactives.

- [ ] **Page 1 : Smart Feed (Home)**
  - [ ] **Layout :** Refaire `FeedList` en plein écran (supprimer les marges).
  - [ ] **HUD :** Overlay minimaliste pour les actions (Like, Share, XP gain).
  - [ ] **Interactions :** Gestures avancées (Tap to flip, Long press to pause).
  - [ ] **SRS Feedback :** Pop-up fluide après le flip ("Oublié" vs "Retenu").

- [ ] **Page 2 : L'Atlas (Collections)**
  - [ ] **Layout Grille :** Affichage des "Decks" (Thématiques) façon album.
  - [ ] **Visualisation :** Jauge de complétion circulaire par deck.
  - [ ] **Effets :** Bordure dorée/brillante pour les Decks "Mastered" (100% Gold).

- [ ] **Page 3 : Brain Profile (Gamification)**
  - [ ] **Avatar :** Intégration du visuel "Cerveau" (SVG/Lottie) qui change d'état selon le niveau.
  - [ ] **Dashboard :** Stats clés (KRu, Streak) stylisées.
  - [ ] **Heatmap :** Grille d'activité (Contribution graph) façon GitHub.

---

## 🚀 6. DEVOPS & QUALITÉ (Ship It)

- [ ] **Environnements**
  - [ ] Séparer strictement `API_URL` pour Dev (localhost) et Prod (VPS/Cloud).
- [ ] **CI/CD**
  - [ ] Pipeline GitHub Actions : Lint + Build + Test (Jest sur l'algo SRS).
  - [ ] **EAS Build :** Configurer `eas.json` pour générer les APK/IPA de preview.
- [ ] **Analytics**
  - [ ] Installer **PostHog**.
  - [ ] Tracker événements clés : `SIGNUP`, `CARD_VIEW`, `CARD_FLIP`, `QUIZ_COMPLETE`.