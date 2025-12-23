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
  - [ ] Persistance du Token : Implémenter `expo-secure-store` (Ne jamais utiliser AsyncStorage pour les tokens).
- [ ] **Écrans d'Auth**
  - [ ] **Landing :** Écran d'accueil "Non connecté" (Vidéo/Image d'ambiance + Boutons CTA).
  - [ ] **Login / Signup :** Formulaires simples (Email/Pass) avec validation Zod.
  - [ ] **Onboarding :** Écran de sélection de 3 thèmes favoris (détermine le seed initial du feed).

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

---

## 🧠 4. ALGORITHME & FEED (Le Cerveau)
*Implémentation de la promesse "Smart Feed".*

### Backend
- [ ] **Algorithme SRS (Spaced Repetition)**
  - [ ] Implémenter la logique SuperMemo-2 (SM2) ou FSRS simplifié dans un `SrsService`.
  - [ ] Calcul du `nextReviewDate` basé sur le feedback utilisateur (Easy/Good/Hard/Again).
- [ ] **Endpoint `/feed` Intelligent**
  - [ ] **Feed Mixer (Règle 70/20/10) :**
    - 70% **New** : Cartes jamais vues (filtrées par intérêts user).
    - 20% **Review** : Cartes dont `nextReviewDate < NOW`.
    - 10% **Challenge** : Quiz sur des cartes "Learning".
  - [ ] **Anti-doublon :** Exclure (via Redis ou Query SQL complexe) les cartes vues < 24h (hors Review).

### Mobile
- [ ] **Interactions Carte**
  - [ ] Tracking du temps de lecture ("View" validée uniquement si > 3s).
  - [ ] **Actions SRS :** Après le flip, afficher les boutons d'auto-évaluation (ex: "Oublié" vs "Retenu") qui appellent l'API SRS.

---

## 🎮 5. GAMIFICATION & ENGAGEMENT
*Rendre l'apprentissage addictif.*

### Mobile (UI)
- [ ] **Jauge de Progression**
  - [ ] Barre d'XP fluide en haut du feed.
  - [ ] Animation + Haptic Feedback à chaque carte validée/lue.
- [ ] **Streak (Série)**
  - [ ] Indicateur visuel "Flamme/Connexion" dans le header.
  - [ ] Logique locale : Si `lastActivity` = hier, Streak +1. Si avant-hier, Streak reset.
- [ ] **Profil Joueur**
  - [ ] Créer page Profil : Afficher Stats simples ("Cartes maîtrisées", "Série actuelle", "Niveau Cerveau").

---

## 🚀 6. DEVOPS & QUALITÉ (Ship It)

- [ ] **Environnements**
  - [ ] Séparer strictement `API_URL` pour Dev (localhost) et Prod (VPS/Cloud).
- [ ] **CI/CD**
  - [ ] Pipeline GitHub Actions : Lint + Build + Test (Jest sur l'algo SRS).
  - [ ] **EAS Build :** Configurer `eas.json` pour générer les APK/IPA de preview.
- [ ] **Analytics (Indispensable Bêta)**
  - [ ] Installer **PostHog** (ou Amplitude).
  - [ ] Tracker événements clés : `SIGNUP`, `CARD_VIEW`, `CARD_FLIP`, `QUIZ_COMPLETE`.