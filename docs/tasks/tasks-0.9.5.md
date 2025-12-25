# 🗺️ ROADMAP : FINITION & GAMIFICATION (v0.9.5)

> **Constat :** L'architecture est saine, mais l'expérience utilisateur est incomplète. Il manque la boucle de gameplay (XP, Niveaux), la profondeur de l'Atlas, et une gestion élégante des contenus "texte seul".

---

## 🎨 1. UI & ROBUSTESSE VISUELLE ✅

_Gérer le cas "Pas d'image" pour éviter l'effet "carte vide"._

- [x] **Design "Text-Only" (Fallback Visuel)**

  - [x] Modifier `CardItem.tsx` pour détecter si `!card.mediaUrl`.
  - [x] **Si pas d'image :** Gradient dynamique basé sur le titre + texte agrandi centré.
  - [x] **Si image cassée (Error) :** Fallback via `onError` sur Image.

- [ ] **Empty States & Feedbacks**
  - [ ] **Feed Vide :** Si l'utilisateur a tout vu ou n'a pas d'intérêts, afficher une belle illustration + bouton "Explorer l'Atlas".
  - [ ] **Loading Skeletons :** Remplacer le spinner par un effet "Shimmer" (forme de carte grise qui brille) pendant le chargement du feed.

---

## 🗺️ 2. ATLAS & NAVIGATION (La Bibliothèque)

_Transformer la liste statique en outil de navigation._

- [ ] **Composant `DeckCard` Enrichi**

  - [ ] Ajouter une **Jauge de Progression** circulaire (SVG) sur la couverture du deck (ex: 12/50 cartes vues).
  - [ ] Ajouter un badge "Gold" si le deck est maîtrisé à 100%.

- [ ] **Page Détail Deck (`/deck/[id]`)**
  - [ ] Créer la route dynamique.
  - [ ] **Contenu :** Grille de toutes les cartes du deck.
    - Cartes non découvertes = Grisées / Cadenas.
    - Cartes découvertes = Actives.
    - Cartes Gold = Bordure brillante.
  - [ ] **Action :** Bouton "Lancer Révision" (lance un mode feed filtré uniquement sur ce deck).

---

## 🎮 3. MOTEUR DE QUIZ (Le Game Loop) ✅

_L'onglet Quiz est maintenant fonctionnel avec une mécanique de révision._

- [x] **Logique de Session (`useQuizStore`)**

  - [x] Algo de sélection : Tirer 10 cartes parmi celles du feed/learning.
  - [x] State Machine : `IDLE` -> `INTRO` -> `QUESTION` -> `REVEAL` -> `RESULT`.

- [x] **Interface de Jeu**
  - [x] **Question :** Afficher "Te souviens-tu de..." + Titre de la carte.
  - [x] **Interaction :**
    - Bouton "Révéler la réponse".
    - Auto-évaluation : "❌ Oublié" / "✅ Retenu".
  - [x] **Result Screen :** Score, XP gagné, boutons Recommencer/Fermer.

---

## 📈 4. GAMIFICATION & XP (Le Moteur de Dopamine) ✅

_Récompenser chaque interaction pour créer l'habitude._

### Backend (NestJS)

- [x] **Service `GamificationService`**
  - [x] **Système d'XP :**
    - `CARD_VIEW` : +5 XP.
    - `CARD_RETAINED` : +10 XP.
    - `CARD_GOLD` : +50 XP.
    - `STREAK_BONUS` : +200/1000 XP (7/30 jours).
  - [x] **Calcul de Niveau :** Formule exponentielle (level = sqrt(xp/100) + 1).
  - [x] **Endpoint :** `POST /gamification/action`, `GET /gamification/stats`, `GET /gamification/heatmap`.

### Frontend (Page Profil)

- [x] **Intégration UI**
  - [x] Remplacer les données mockées par les vraies stats (`user.xp`, `user.level`).
  - [x] **Niveau Évolutif :** Couleur avatar change selon palier (Gris → Bleu → Vert → Or).
  - [x] **Heatmap d'Activité :** Données réelles depuis `/gamification/heatmap`.

---

## ⚙️ 5. INGESTION & CONTENU (Le Carburant)

_Sans contenu propre, l'app ne sert à rien._

- [ ] **Script `ingest-curated`**
  - [ ] Finaliser le script pour importer les JSONs locaux (ex: `data/curated/biais-cognitifs.json`).
  - [ ] Gérer l'upsert (mise à jour sans doublon) pour pouvoir modifier les JSONs et relancer le script.
