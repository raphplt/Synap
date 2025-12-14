C'est entendu. Voici le **README.md Master** définitif.

Il consolide absolument tout : la vision produit, l'architecture technique (Monorepo/Nest/Expo), la stratégie d'ingestion (Wikipédia filtré), et la mécanique complète de gamification. C'est le document de référence pour construire le projet de A à Z.

-----

````markdown
# 🧠 MEMEX

> **Le TikTok de l'intelligence.**
> Une plateforme de micro-learning social qui transforme le temps d'écran passif en acquisition de connaissances active.

![Status](https://img.shields.io/badge/Status-Development-blue)
![Stack](https://img.shields.io/badge/Stack-Fullstack-yellow)
![License](https://img.shields.io/badge/License-MIT%20%2F%20CC%20BY--SA-green)

## 📋 Vision & Concept

**MEMEX** est une réponse au déficit d'attention moderne. Nous utilisons les codes addictifs des réseaux sociaux (Scroll infini, Short-form) pour servir l'éducation. L'objectif n'est pas seulement de *voir* du contenu, mais de le *retenir*.

### Les 3 Piliers du Produit
1.  **Smart Feed Hybride :** Un flux algorithmique qui alterne entre Découverte (Nouveautés) et Rétention (Répétition espacée).
2.  **Qualité "Curated" :** Un hub de connaissance qui agrège Wikipédia (filtré pour la qualité visuelle) et des contenus éducatifs structurés.
3.  **Neuro-Gamification :** Un système de progression visuel qui récompense l'effort cognitif et l'ancrage mémoriel.

---

## 🎮 Gamification : "Grow Your Brain"

Contrairement aux jeux classiques, MEMEX récompense la mémorisation réelle. L'avatar de l'utilisateur est un **Cerveau** qui se complexifie visuellement (nouvelles connexions synaptiques) au fil de la progression.

* **Brain Score (XP Pondérée) :**
    * *Lecture passive* = Gain faible.
    * *Active Recall (Quiz)* = Gain élevé.
    * *Rappel SRS (Long terme)* = Gain maximal (Jackpot).
* **Collection (Mastery Decks) :**
    * Les fiches sont organisées en "Decks" (thèmes).
    * Maîtriser une fiche (réussir les rappels) la transforme en version **Gold**.
    * Compléter un thème débloque des badges de spécialiste.
* **Synapse Streak (Série) :**
    * La régularité est représentée par une connexion électrique.
    * Ne pas pratiquer affaiblit la connexion (visuellement).

---

## ⚙️ Architecture & Data Flow

Le projet repose sur un **Monorepo** (Turborepo) strict, garantissant une séparation des responsabilités et un partage de code (Types) optimal.

### 1. Le Moteur d'Ingestion (Quality Gate)
Le Backend ne sert pas le contenu brut. Il agit comme un sas de validation :
* **Sources :** API Wikipédia (via script d'ingestion) + Sources manuelles/IA (V2).
* **Filtrage Strict :** Rejet automatique des articles sans image haute résolution ou au contenu trop court.
* **Enrichissement :** Stockage en base de données propriétaire pour garantir une latence nulle au chargement.

### 2. Le "Feed Mixer" (Algorithme)
Le contenu servi à l'utilisateur est généré dynamiquement pour maximiser la rétention :
* **70% Discovery :** Contenu frais basé sur les centres d'intérêt.
* **20% Recall (SRS) :** Contenu à réviser (calculé selon la courbe de l'oubli).
* **10% Challenge :** Quiz "Pop-up" interactifs intégrés au scroll.

---

## 🛠️ Stack Technique

Nous utilisons les **dernières versions stables** des technologies suivantes.

### 📂 Structure du Monorepo
* **Turborepo :** Orchestration du build et des tâches.
* **npm Workspaces :** Gestion des dépendances partagées.

### 📱 Frontend (Mobile)
* **Framework :** React Native avec **Expo** (Managed Workflow).
* **Navigation :** **Expo Router** (File-based routing).
* **Performance :** **`@shopify/flash-list`** (Liste virtuelles haute performance 60fps).
* **Styling :** **NativeWind** (TailwindCSS pour Mobile) + `clsx`.
* **Animations :** **Reanimated** (Flip cards, Micro-interactions).
* **Data :** **TanStack Query** (Server State) + **Zustand** (Client State).

### 🔌 Backend (API)
* **Framework :** **NestJS** (Architecture modulaire).
* **Base de Données :** **PostgreSQL**.
* **ORM :** **TypeORM**.
* **Sécurité :**
    * Auth : **Passport-JWT**.
    * Hashing : **Argon2** (Standard robuste).
    * Protection : Helmet & Rate Limiting.

---

## 📂 Structure des Dossiers

```text
/
├── apps/
│   ├── api/                 # NestJS Application
│   │   ├── src/
│   │   │   ├── modules/     # (Wiki, Feed, Auth, Cards, Users)
│   │   │   └── common/      # (Guards, Interceptors)
│   │
│   └── mobile/              # Expo Application
│       ├── app/             # Routes (Expo Router)
│       └── src/             # Components, Hooks, Stores
│
├── packages/
│   ├── shared/              # "Source of Truth"
│   │   ├── types/           # Interfaces TypeScript (ICard, IUser)
│   │   └── dtos/            # DTOs partagés Back/Front
│   │
│   └── config/              # ESLint, TSConfig presets
│
├── turbo.json               # Pipeline configuration
└── package.json             # Root scripts
````

-----

## 🚀 Installation & Démarrage

### Pré-requis

  * Node.js (LTS) & npm
  * Docker (pour la base de données PostgreSQL)

### 1\. Installation

```bash
# Cloner le dépôt
git clone <repo_url>
cd memex

# Installer les dépendances (depuis la racine)
npm install
```

### 2\. Configuration Environnement

Créez un fichier `.env` dans `apps/api` (basé sur `.env.example`) :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/memex"
JWT_SECRET="votre_secret_ultra_securise"
```

### 3\. Infrastructure

Démarrez la base de données via Docker :

```bash
docker-compose up -d
```

### 4\. Démarrage (Dev Mode)

Lancer l'API et l'Application Mobile en parallèle :

```bash
npm run dev
```

  * **API :** `http://localhost:3000`
  * **Mobile :** Scannez le QR Code via Expo Go.

-----


## ⚖️ Mentions Légales & Attribution

**MEMEX** respecte scrupuleusement les licences libres.

  * **Contenu Wikipédia :** Utilisé sous licence **CC BY-SA 3.0**. Chaque fiche inclut une attribution claire et un lien vers l'article source.
  * **Code Source :** Propriété exclusive.

-----

**Mainteneur :** Raphaël P.