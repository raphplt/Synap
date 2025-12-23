### 🔐 1. Stack d'Authentification & Onboarding

_Ce flux est isolé du reste de l'app. C'est le sas d'entrée._

#### **A. Landing Screen (Accueil Visiteur)**

- **Objectif :** Convertir le visiteur en moins de 5 secondes.
- **Contenu :**
- **Hero Section :** Animation minimaliste du "Cerveau" qui pulse (Lottie ou Rive).
- **UVP (Unique Value Proposition) :** "Le scroll qui rend intelligent".
- **Actions :** Boutons "Commencer" (Signup) et "J'ai déjà un compte" (Login).
- **Social Proof :** (Futur) "X connaissances maîtrisées aujourd'hui par la communauté".

#### **B. Onboarding "Cold Start" (Séquence Critique)**

- **Objectif :** Résoudre le problème du "feed vide" et personnaliser l'algo dès la première seconde.
- **Étapes :**

1. **Identity :** Nom d'utilisateur (unique) + Avatar (généré ou upload).
2. **Interest Picker :** Sélection de 3+ thématiques (ex: _Histoire, Biais Cognitifs, Tech, Philosophie_). Ces tags alimenteront le seed initial du `FeedService`.
3. **Objective :** "Combien de temps par jour ?" (5min, 15min, 30min). Définit l'objectif de Streak.

#### **C. Auth Screen (Login/Signup)**

- **Contenu :**
- Email / Mot de passe (Validation via Zod/React Hook Form).
- **Social Auth :** Continuer avec Apple / Google (Indispensable pour iOS).
- Gestion mot de passe oublié.

---

### 📱 2. Main App (Tab Navigator)

_C'est le cœur de l'application, accessible uniquement avec un Token JWT valide._

#### **Tab 1: Le Smart Feed (L'écran d'accueil)**

_C'est ici que l'utilisateur passe 90% de son temps. Doit tourner à 60fps constants._

- **Tech :** `@shopify/flash-list` impératif pour la performance.
- **Structure Visuelle :** Plein écran (immersive), overlay minimaliste.
- **Contenu des Items (Les Cartes) :**
- **Face A (Découverte) :** Média HD (Image/Gradient), Titre accrocheur, Label de catégorie, Temps de lecture estimé.
- **Face B (Savoir) :** Le contenu dense (<150 mots), structuré, source (Lien Wikipédia/Auteur).
- **Mode Quiz (Challenge) :** Une carte spéciale qui demande une interaction (Vrai/Faux ou QCM) avant de pouvoir scroller.

- **Interactions (HUD) :**
- **Jauge de Session :** Barre de progression discrète en haut (XP gagnée dans la session).
- **Actions Latérales :** Like (Sauvegarder), Share, **Rate (SRS)**.
- **Zone SRS :** Une fois la carte retournée, boutons d'auto-évaluation ("Oublié", "Difficile", "Facile") qui envoient le feedback à l'API.

#### **Tab 2: Explore / Library (Le "Knowledge Graph")**

_Pour sortir du flux passif et rechercher activement. C'est la structure qui manque aux réseaux sociaux._

- **Contenu :**
- **Barre de Recherche :** Recherche Full-text (Elastic/MeiliSearch à terme) sur les titres et contenus.
- **Featured Decks :** Collections curées (ex: "Les modèles mentaux", "Histoire de la Rome Antique").
- **Catégories :** Grille visuelle des thématiques.
- **Ma Bibliothèque :** Accès aux cartes "Sauvegardées" et "Maîtrisées" (Mastered).

#### **Tab 3: Brain Profile (La Gamification)**

_L'endroit où l'utilisateur visualise son capital cognitif._

- **Hero Element :** **L'Avatar Cerveau Vectoriel**. Il évolue visuellement (plus complexe, plus brillant) selon le niveau global.
- **Métriques Clés (KPIs User) :**
- **KRu (Knowledge Retained) :** Nombre total de cartes au statut "Mastered".
- **Current Streak :** Série de jours consécutifs.
- **Accuracy :** % de réussite aux Quiz.

- **Heatmap :** Grille de contribution (style GitHub) montrant l'activité des 365 derniers jours.
- **Settings Entry :** Petit engrenage pour accéder aux paramètres.

---

### ⚙️ 3. Écrans Modaux & Utilitaires

_Accessibles par dessus les Tabs._

#### **Details View (Deep Dive)**

_Quand une carte ne suffit pas._

- Accessible via un bouton "En savoir plus" sur une carte.
- Affiche la page Wikipédia complète (Webview optimisée ou Parsed content) ou le contenu étendu de la source.
- Permet de signaler une erreur (Crowdsourcing qualité).

#### **Settings & Preferences**

- **Compte :** Changer email, suppression de compte (GDPR), Export des données.
- **Notifications :**
- "Rappel Quotidien" (Push intelligent à l'heure habituelle).
- "SRS Due" (Quand trop de cartes sont à réviser).

- **Accessibilité :** Taille de police, Mode Dyslexie, Contraste.
- **Abonnement (Futur) :** Gestion du statut Premium/Pro.

#### **SRS Review Session (Mode Focus)**

_Un mode spécial déclenché quand l'utilisateur a beaucoup de cartes "À revoir"._

- Design différent du Feed (plus sobre, focus total).
- Enchaînement rapide de cartes en mode "Flashcard" pur (Question -> Réponse -> Note).
- Bilan de session à la fin (+XP bonus).

---

### 💡 Le Conseil "Expert" pour la Longévité

Pour que cette structure tienne des années, **ne codez pas la logique métier dans les composants UI**.

1. **Architecture "Headless" :** Vos écrans (Profile, Feed) ne doivent être que des "coquilles vides" qui affichent des données provenant de **Custom Hooks** (`useFeed`, `useUserStats`).
2. **Design System Atomique :** Créez des composants `Typography`, `Button`, `CardContainer` dès maintenant. Si dans 2 ans vous voulez changer tout le look de l'app ("Rebranding"), vous ne modifiez que ces atomes, pas les 20 pages.
3. **Feature Flags :** Prévoyez un mécanisme pour activer/désactiver des fonctionnalités à distance (ex: cacher l'onglet "Explore" tant qu'il n'est pas prêt) sans republier sur les Stores.
