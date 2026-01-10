# Fonctionnement Technique & Architecture Synap

Ce document détaille le fonctionnement interne de l'application Synap tel qu'il est implémenté actuellement.

## 🏛️ Architecture & Philosophie

Synap est une application de type "Flashcards 2.0" avec une architecture **Offline-First** (ou pseudo) côté mobile, reposant sur une API NestJS robuste. L'objectif est l'acquisition de connaissances par fragmentation (micro-learning) et répétition (SRS).

---

## 📱 Les 4 Piliers (Pages Principales)

### 1. Le Flux Principal (`(tabs)/index.tsx`)

Point d'entrée de l'application. Contrairement à un feed social classique, il est **curaté algorithmiquement** pour maximiser l'apprentissage.

- **Composition du Feed** :
  - **70% Découverte** : Nouvelles cartes jamais vues (triées par `qualityScore`).
  - **20% Révision (SRS)** : Cartes dues selon l'algorithme de répétition espacée.
  - **10% Challenge** : Cartes déjà "maîtrisées" (Mastered/Gold) pour rafraîchir la mémoire à long terme.
- **Interactions** : Chaque carte permet un feedback immédiat (Like/Bookmark) ou une évaluation rapide type SRS (Oublié / Retenu).
- **Implémentation** : `FeedService` génère ce mix en combinant plusieurs requêtes base de données (cartes nouvelles vs interactions existantes).

#### 🎡 UX & Mécanique de Navigation

Le feed n'est pas une simple liste, c'est un **carrousel vertical** (Snap List).

- **Une carte à la fois** : Pour forcer la concentration (Focus Mode). L'utilisateur ne voit qu'une seule information à l'écran.
- **Flip Mechanic (Retournement)** :
  - **État initial** : Carte côté **Recto** (Question / Concept clé). L'utilisateur est invité à faire un effort de mémoire ("Active Recall").
  - **Interaction** : Un **Tape (Tap)** sur la carte déclenche une animation de rotation 3D.
  - **État final** : Carte côté **Verso** (Réponse / Explication détaillée).
- **Validation SRS** :
  - Une fois la carte retournée, les contrôles d'évaluation apparaissent (Easy, Good, Hard, Again).
  - L'action de l'utilisateur sur ces contrôles déclenche :
    1.  La mise à jour de l'algo SRS pour cette carte.
    2.  Le passage automatique à la carte suivante (Auto-advance).

### 2. L'Atlas (`(tabs)/atlas.tsx`)

Explorateur de connaissances structurant le contenu en une bibliothèque ordonnée.

- **Structure** : Hiérarchie à deux niveaux : **Catégories** (Thèmes) -> **Decks** (Sujets spécifiques).
- **Fonctionnement** : Récupère les métadonnées via `/decks/categories`. Affiche une grille visuelle permettant à l'utilisateur de choisir activement son sujet d'apprentissage.

### 3. Le Quiz / Loop (`(tabs)/quiz.tsx`)

Le "cœur" actif de l'application pour les sessions de travail focalisées (Deep Work).

- **La Game Loop** :
  1.  **IDLE** : Écran d'accueil "Prêt ?".
  2.  **INTRO** : Animation de chargement / mise en condition.
  3.  **QUESTION** : Affichage du recto de la carte (Question/Titre).
  4.  **REVEAL** : Révélation du verso (Réponse/Résumé).
  5.  **INPUT** : Choix binaire de l'utilisateur : **AGAIN** (Oublié) ou **GOOD** (Retenu).
  6.  **RESULT** : Résumé de la session + Gain d'XP.
- **Source des données** : Priorise les cartes en statut `LEARNING` (en cours d'apprentissage) via l'endpoint `/srs/learning`. Si vide, bascule sur des cartes du feed.

### 4. Profil & Progression (`(tabs)/profile.tsx`)

Hub de gamification et de rétention utilisateur.

- **Visualisation** :
  - **Heatmap** : Type GitHub, affichant l'activité des 12 dernières semaines.
  - **Statistiques Globales** : XP total, niveau actuel, nombre de cartes vues.
  - **Progression par Thème** : Niveau détaillé par catégorie (ex: Niveau 5 en Histoire, Niveau 2 en Science).
- **Données** : Agrégation en temps réel des événements d'XP (`GamificationService`).

---

## 🧠 Logique Core (Backend)

### 🔄 Algorithme SRS (Spaced Repetition System)

Implémentation stricte de l'algorithme **SM-2 (SuperMemo-2)** dans `srs.service.ts`.

- **Objectif** : Calculer l'intervalle idéal avant la prochaine révision basé sur la qualité de la réponse (0-5) et l'historique.
- **Cycle de Vie d'une Carte** :
  1.  `NEW` : Jamais vue.
  2.  `LEARNING` : En cours d'acquisition (intervalles courts).
  3.  `REVIEW` : Acquise, en entretien (intervalles longs).
  4.  `MASTERED` : Maîtrisée (intervalle > 21 jours).
  5.  `GOLD` : Maîtrise parfaite (5 succès consécutifs en mode Mastered).
- **Ease Factor (EF)** : Variable dynamique ajustant la difficulté d'une carte. Si l'utilisateur échoue, le facteur diminue et la carte revient plus souvent.

### 🎮 Gamification & Économie (XP)

Système complet pour stimuler l'engagement, géré par `gamification.service.ts`.

- **Calcul de Niveau** : Progression non-linéaire (`Niveau = sqrt(XP / 100)`). La difficulté augmente avec le niveau.
- **Barème des Récompenses (Events)** :
  - Vue passive : **+5 XP**
  - Rétention active (Quiz) : **+10 XP**
  - Quiz réussi : **+25 XP**
  - Carte passée en GOLD : **+50 XP**
- **Système de Streak (Série)** :
  - Multiplicateur d'XP récompensant la régularité quotidienne.
  - **Paliers** :
    - Standard : **x1.0**
    - 7 jours : **x1.7**
    - 30 jours : **x3.0**
  - Briser la série (1 jour sans activité) remet le multiplicateur à 1.

### 📡 Pipeline d'Ingestion (Content)

Le contenu est dynamique et auto-généré.

- **Mécanisme** : `FeedService` surveille le stock de cartes disponibles.
- **Auto-Fill** : Si le stock descend sous un seuil (ex: 200 cartes), le système déclenche l'ingestion automatique.
- **Sources** : Wikipedia (Featured articles & Top pageviews).
- **Process** : Scupping -> Nettoyage -> Génération IA -> Base de données.
