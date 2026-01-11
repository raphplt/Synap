# 🧠 Synap : Analyse de la Boucle d'Utilisation & Propositions d'Évolution

## 1. Constats et Frustrations Actuelles

- **Déséquilibre du Feed :** Le ratio actuel (70% Découverte) génère une surcharge cognitive. L'utilisateur consomme beaucoup mais ne sent pas qu'il "possède" le savoir.
- **Friction d'Interaction :** Le système de flip systématique (recto/verso) pour accéder au contenu détaillé ralentit le scroll en mode découverte.
- **Problème de la "Niche" Wikipédia :** L'import brut de Wikipédia ramène des sujets trop obscurs (ex: ministres oubliés, routes secondaires), dégradant la perception de qualité. Il a été désactivé, mais il faudrait revoir la stratégie pour le reactiver.
- **Manque d'Attractivité Visuelle :** L'absence d'images sur les cartes curées réduit l'engagement émotionnel durant le scroll.

---

## 2. Stratégie de Contenu

- **Filtrage Drastique :** Utiliser une "Whitelist" de sujets (Articles de qualité) pour éviter le contenu poubelle. Concrètement il faudrait se limiter aux articles de qualité et bons articles de Wikipédia.
- **Images Automatisées :** Récupération automatique de l'image principale via l'API Wikimedia ou Unsplash pour habiller les cartes sans effort manuel.
- Sur les données Curées (on a environ 3000 cards, avec 20 themes de 10 decks chacun, contenant une vingtaines de cartes), il est impératif d'afficher les cards dans l'ordre (normalement les cards sont triées par ordre croissant dans la BDD, sinon il faut modifier les seeds pour qu'elles soient triées par ordre croissant pendant l'importation).

---

## 3. Optimisation de la Boucle d'Engagement (Loop)

### A. La Théorie des "Séries" (Contextualisation)

Au lieu de cartes isolées, injecter des clusters thématiques dans le feed.

- _Exemple :_ Si l'utilisateur voit une carte sur Napoléon, les 3 cartes suivantes traitent du même sujet pour créer une satisfaction de compréhension immédiate.

### B. Réduction de la Friction (Progressive Disclosure)

- **Scroll Fluide :** En mode découverte, afficher Titre + Image + Résumé court.
- **Interaction Intentionnelle :** Le passage au "verso" (détails longs) ne doit se faire que si l'utilisateur s'arrête ou clique, évitant le double-mouvement systématique.

### C. User Agency (Pouvoir à l'utilisateur)

- **Bouton "Maîtriser ce sujet" :** Permet à l'utilisateur de signaler à l'algorithme qu'il veut voir plus de cartes de ce deck/série en priorité.
- **Import Personnel :** Permettre aux utilisateurs de coller un texte pour que l'app en fasse un deck de révision.

---

## 4. Évolutions Techniques & Gamification

### A. Refonte de l'Algorithme du Feed

- **Phase de "Warm-up" :** Commencer chaque session par 2-3 cartes SRS (révisions) faciles pour donner un sentiment de réussite immédiat.
- **La Carte "Boss" :** Finir une session par un mini-quiz récapitulatif des cartes vues.

### B. L'Atlas comme "Jardin"

- Faire de la page `atlas.tsx` une représentation visuelle de la mémoire.
- Les catégories maîtrisées (Gold) doivent évoluer graphiquement (brillance, taille, icônes spéciales).

### C. Mode "Focus"

- Introduction d'un timer de session (ex: 5 min) pour transformer le scroll compulsif en rituel d'apprentissage sain.

---

## 5. Roadmap Actionnable (Priorités)

1. **Backend :** Modifier l'entité `Card` pour inclure `origin` et `seriesId`.
2. **Ingestion :** Créer un premier deck test "Wiki-Premium" basé sur un Article de Qualité.
3. **Mobile UI :** Implémenter le badge de distinction de source (`CURATED` vs `WIKI`) et tester le délai de révélation auto du contenu (Progressive Disclosure).
4. **Feedback :** Ajouter l'écran de récapitulatif de fin de session.

---

**Veux-tu que je transforme l'une de ces sections en une "User Story" technique ou en un script de migration pour ta base de données ?**
