# 🗺️ ROADMAP : CAP SUR LA BÊTA (v0.9)

> **Objectif Unique :** Livrer une application fonctionnelle, "installable", avec une boucle de rétention complète (Auth + Feed + SRS + Gamification) et un contenu de haute qualité (Multi-sources).

---

## 🏗️ 1. ARCHITECTURE & REFACTO (Fondations)
*Avant de construire plus haut, on solidifie les bases actuelles.*

- [x] **Internationalisation (i18n) Stricte**
  - [x] Installer `i18next` + `react-i18next` sur le mobile.
  - [x] Créer la structure `locales/fr.json` et `locales/en.json`.
  - [ ] **Action :** Extraire *toutes* les strings hardcodées du POC actuel (Titres, boutons, erreurs) vers les fichiers JSON.
- [/] **Standardisation API/DTO**
  - [x] Vérifier que chaque endpoint utilise un DTO validé par `class-validator`.
  - [ ] Refactoriser les contrôleurs : Interdire le retour d'entités TypeORM brutes (Mapper systématique `Entity -> ResponseDTO`).

---

## 🔐 2. AUTHENTIFICATION & UTILISATEURS
*Passage d'un mode "visiteur anonyme" à "joueur identifié".*

### Backend (NestJS)
- [x] **Module `Auth`**
  - [x] Installer et configurer `Passport-JWT` + `Argon2` (hashing).
  - [x] Implémenter les endpoints : `POST /auth/signup`, `POST /auth/login`, `GET /auth/me`.
  - [x] **Guard Global :** Sécuriser toutes les routes par défaut (APP_GUARD), sauf `/auth/*` et `/health`.
- [x] **Module `User`**
  - [x] Mettre à jour l'Entity `User` : Ajouter `xp` (int), `streak` (int), `lastActivityAt` (Date).
  - [x] **Onboarding Data :** Stocker les `interests` (tags JSONB) sélectionnés à l'inscription.

### Mobile (Expo)
- [x] **État Global (Session)**
  - [x] Créer un store Zustand `useAuthStore` (token, user, actions login/logout).
  - [x] Persistance du Token : Implémenter `expo-secure-store`.
- [x] **Écrans d'Auth (Design System V2)**
  - [x] **Landing :** Écran d'accueil "Cinématique" (Vidéo/Lottie + CTA).
  - [x] **Login / Signup :** Refonte des formulaires (Dark mode, Input minimalistes).
  - [x] **Onboarding :** Écran de sélection de thèmes (Tags sélectionnables).
- [x] **Profile & Logout**
  - [x] Affichage du profil utilisateur (username, email, XP, streak, interests).
  - [x] Bouton logout fonctionnel avec redirection.

---

## 💾 3. DATA ENGINE : "BEYOND WIKIPEDIA"
*Le cœur du changement. On ne dépend plus uniquement de l'API Wiki. On crée un pipeline d'ingestion agnostique.*

### Backend (Ingestion Pipeline)
- [x] **Refacto du Modèle de Données**
  - [x] Update Entity `Card` : Ajouter colonne `origin` ('WIKIPEDIA', 'CURATED_JSON', 'AI_GENERATED') et `externalId`.
  - [x] **Qualité :** Ajouter colonne `qualityScore` (0-100) pour prioriser les meilleures cartes dans l'algo.
  - [x] Créer Entity `Deck` : id, name, slug, description, imageUrl, categoryId, cardCount.
  - [x] Créer Entity `Category` (Theme/Sub-theme).
- [ ] **Service `IngestionFactory`**
  - [ ] Créer une interface générique `ContentProvider`.
  - [ ] **Adapter Wikipedia (Existant) :** Améliorer le nettoyage du wikitext (supprimer artefacts visuels, templates cassés).
  - [ ] **Adapter "Curated" (Nouveau) :** Script d'import pour ingérer des fichiers JSON/Markdown locaux.
    - *Format cible :* `data/curated/biais-cognitifs.json` (ex: "Les 50 Biais Cognitifs").
- [x] **Seeding Initial**
  - [x] Préparer un dataset "Gold" de ~200 cartes manuelles/vérifiées (JSON) pour le lancement Bêta.
  - [x] **Système de Séries** : Le but est d'avoir des "séries" de cartes, avec des thèmes globaux (exemple : histoire -> theme, "18eme siècle" -> sub-theme, qui contient 50 cartes. si on a toutes les cartes d'un sub-theme, on peut les marquer comme "gold".)
  - [ ] **XP :** Il faut que le joueur puisse gagner de l'expérience, et avoir un "niveau" général , et des niveaux par theme, et un "streak" de jours consécutifs.

---

## 🧠 4. ALGORITHME & LOGIQUE MÉTIER
*Le "cerveau" invisible de l'application.*

### Backend
- [x] **Algorithme SRS (Spaced Repetition)**
  - [x] Implémenter la logique SuperMemo-2 (SM2) ou FSRS simplifié dans un `SrsService`.
  - [x] Calcul du `nextReviewDate` basé sur le feedback utilisateur (Easy/Good/Hard/Again).
  - [x] **Logique "Gold" :** Compteur de succès consécutifs. Au 5ème succès -> Statut `GOLD`.
- [x] **Endpoint `/atlas`**
  - [x] Aggregation : Retourner les stats par Deck (Total cartes, % progression, nb cartes Gold).
- [x] **Endpoint `/feed` Intelligent**
  - [x] **Feed Mixer (Règle 70/20/10) :**
    - 70% **New** / 20% **Review** / 10% **Challenge**.
  - [x] **Anti-doublon :** Exclusion stricte des cartes récentes.

---

## 🎨 5. FRONTEND REBOOT (UI/UX COMPLET)
*Refonte totale de l'interface mobile selon la nouvelle D.A. (Dark Mode / Electric Cyan / Immersif).*

- [x] **Design System (NativeWind)**
  - [x] Configurer les tokens couleurs : `bg-synap-teal`, `text-synap-pink`, `border-synap-gold`, etc.
  - [x] Configurer les typos : Inter (Body) & Geist (Headers).
  - [x] **Tab Bar Custom :** Créer une barre de navigation flottante (blur effect) avec icônes actives/inactives.

- [x] **Page 1 : Smart Feed (Home)**
  - [x] **Layout :** Refaire `FeedList` en plein écran (supprimer les marges).
  - [x] **HUD :** Overlay minimaliste pour les actions (Like, Share, XP gain).
  - [x] **Interactions :** Gestures avancées (Tap to flip, Long press to pause).
  - [x] **SRS Feedback :** Pop-up fluide après le flip ("Oublié" vs "Retenu").

- [x] **Page 2 : L'Atlas (Collections)**
  - [x] **Layout Grille :** Affichage des "Decks" (Thématiques) façon album.
  - [x] **Visualisation :** Jauge de complétion circulaire par deck.
  - [x] **Effets :** Bordure dorée/brillante pour les Decks "Mastered" (100% Gold).

- [x] **Page 3 : Brain Profile (Gamification)**
  - [x] Affichage du profil avec données réelles (XP, streak, interests).
  - [x] **Avatar :** Intégration du visuel "Cerveau" (SVG/Lottie) qui change d'état selon le niveau.
  - [x] **Dashboard :** Stats clés (KRu, Streak) stylisées.
  - [x] **Heatmap :** Grille d'activité (Contribution graph) façon GitHub.

---

## 🚀 6. DEVOPS & QUALITÉ (Ship It)

- [x] **Environnements**
  - [x] Séparer strictement `API_URL` pour Dev (localhost) et Prod (VPS/Cloud).
- [x] **CI/CD**
  - [x] Pipeline GitHub Actions : Lint + Build + Test (Jest sur l'algo SRS).
  - [x] **EAS Build :** Configurer `eas.json` pour générer les APK/IPA de preview.
- [x] **Analytics**
  - [x] Installer **PostHog**.
  - [x] Tracker événements clés : `SIGNUP`, `CARD_VIEW`, `CARD_FLIP`, `QUIZ_COMPLETE`.