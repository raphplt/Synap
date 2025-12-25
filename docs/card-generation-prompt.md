# 🧠 SYNAP - Card Generation Prompt

> Ce document sert de base pour générer des cartes pédagogiques à grande échelle pour l'application SYNAP.

---

## 📋 Philosophie produit

SYNAP est une **base de connaissances mentales**, pas un coach, pas un cours scolaire, pas un outil de développement personnel.

Le contenu doit être **descriptif et explicatif uniquement**, jamais prescriptif.

---

## 🚨 Règles absolues

> [!CAUTION]
> Ces règles ne sont **jamais négociables**. En cas de doute, appliquer la **contrainte la plus stricte**.

1. **Ne jamais inventer** de catégorie, de deck ou de sujet
2. **Travailler exclusivement** à partir des catégories et decks fournis
3. **Sortie JSON uniquement** — Aucun commentaire, explication ou texte annexe
4. **Tous les champs sont obligatoires** — Aucun champ ne peut être omis, renommé ou restructuré
5. **Contenu descriptif uniquement** — Interdire "Antidote", "Conseil", "À faire", "Comment l'utiliser"

---

## � Workflow de génération

1. L'utilisateur fournit **une catégorie** (parmi les catégories fournies)
2. Le modèle génère **tous les decks de cette catégorie**, un par un (chaque réponse : un deck), dans l'ordre
3. **Sans en ajouter ni en retirer**
4. Chaque deck génère **15 à 25 cartes**

---

## 🗂️ Structure JSON (non négociable)

```json
{
	"deck": {
		"name": "Nom du deck",
		"slug": "slug-du-deck",
		"categorySlug": "slug-de-la-categorie"
	},
	"cards": [
		{
			"title": "Titre court (2-4 mots)",
			"summary": "Résumé en 1-2 phrases (max 200 caractères)",
			"content": "Contenu détaillé (3-5 paragraphes, ~300-500 mots)",
			"mediaUrl": "",
			"sourceLink": "synap://curated/slug-du-deck/card-slug",
			"sourceAttribution": "Source originale si applicable",
			"origin": "CURATED",
			"quizAnswers": [
				"Réponse correcte",
				"Distracteur 1",
				"Distracteur 2",
				"Distracteur 3"
			],
			"quizCorrectIndex": 0
		}
	]
}
```

---

## 📝 Schéma Card (tous les champs obligatoires)

| Champ               | Type             | Description                                       |
| ------------------- | ---------------- | ------------------------------------------------- |
| `title`             | string (max 255) | Titre court : 2-4 mots, hook, français naturel    |
| `summary`           | text             | Hook en 1-2 phrases, max 200 caractères           |
| `content`           | text             | Explication descriptive, 3-5 paragraphes          |
| `mediaUrl`          | text             | URL image (laisser vide `""`)                     |
| `sourceLink`        | text             | Format: `synap://curated/{deck-slug}/{card-slug}` |
| `sourceAttribution` | string           | Citation de la source                             |
| `origin`            | enum             | Toujours `"CURATED"`                              |
| `quizAnswers`       | string[]         | 4 réponses (1 correcte + 3 distracteurs)          |
| `quizCorrectIndex`  | int              | Index de la bonne réponse (0-3)                   |

---

## 🎯 Contraintes de contenu

### Titres (STRICT)

- **2 à 4 mots maximum**
- Français naturel et compréhensible seul
- Fonctionne comme un **hook**

**Interdit** :

- Anglicismes non nécessaires
- Labels techniques mal francisés (ex: "Bayes simple", "Prédiction test")

✅ Exemples valides : "Biais d'ancrage", "Illusion transparence", "Effet halo"
❌ Exemples invalides : "Le biais d'ancrage expliqué", "Introduction au..."

### Summary (Hook)

- 1-2 phrases, max 200 caractères
- Créer une tension narrative
- Pas de conseil ni d'action

✅ "Le cerveau confond simplicité et vérité."
❌ "Ce biais pousse à... Voici comment l'éviter."

### Content (Détail)

- **Descriptif et explicatif uniquement**
- 3-5 paragraphes, ~300-500 mots
- Style clair, pas de jargon non expliqué

**Sections interdites** :

- "Antidote :"
- "Conseil :"
- "À faire :"
- "Comment l'éviter :"
- Toute forme prescriptive

### Quiz Answers

- La bonne réponse est **indiscutablement correcte**
- Les distracteurs sont **plausibles mais faux**
- Jamais "Toutes les réponses" / "Aucune des réponses"

---

## 📊 Contraintes quantitatives (verrouillées)

| Contrainte                    | Valeur        |
| ----------------------------- | ------------- |
| Cartes par deck               | 15 à 25       |
| Minimum absolu                | 12 (si forcé) |
| Redondance conceptuelle       | Zéro          |
| Nombre annoncé = nombre livré | Obligatoire   |

---

## 📐 Logique taxonomique

> Un deck correspond à **un domaine identifié dans la taxonomie**, pas à une compétence transverse.

Les concepts transversaux doivent rester intégrés aux decks existants, pas devenir des decks autonomes.

---

## 📚 Atlas des catégories et decks

### 1. Sciences Cognitives & Psychologie (`sciences-cognitives`)

- Biais Cognitifs (`biais-cognitifs`)
- Modèles Mentaux (`modeles-mentaux`)
- Neurosciences de base (`neurosciences-base`)
- Psychologie Sociale (`psychologie-sociale`)
- Dopamine & Addiction (`dopamine-addiction`)
- Intelligence Émotionnelle (`intelligence-emotionnelle`)
- Mémoire & Apprentissage (`memoire-apprentissage`)
- Perception & Illusions (`perception-illusions`)
- Psychologie du Développement (`psychologie-developpement`)
- Grands Expérimentateurs (`grands-experimentateurs`)

### 2. Efficacité & Meta-Learning (`efficacite-meta-learning`)

- Techniques de Mémorisation (`techniques-memorisation`)
- Gestion du Temps (`gestion-temps`)
- Deep Work (`deep-work`)
- Prise de Notes (`prise-notes`)
- Lecture Rapide (`lecture-rapide`)
- Habitudes Atomiques (`habitudes-atomiques`)
- Pensée Critique (`pensee-critique`)
- Apprentissage Accéléré (`apprentissage-accelere`)
- Organisation Digitale (`organisation-digitale`)
- Créativité & Idéation (`creativite-ideation`)

### 3. Philosophie & Sagesse (`philosophie-sagesse`)

- Stoïcisme (`stoicisme`)
- Épicurisme (`epicurisme`)
- Existentialisme (`existentialisme`)
- Philosophie Politique (`philosophie-politique`)
- Éthique & Morale (`ethique-morale`)
- Philosophies d'Orient (`philosophies-orient`)
- Épistémologie (`epistemologie`)
- Le Siècle des Lumières (`siecle-lumieres`)
- Phénoménologie (`phenomenologie`)
- Logique Formelle (`logique-formelle`)

### 4. Histoire du Monde (`histoire-monde`)

- Égypte Ancienne (`egypte-ancienne`)
- Grèce & Rome (`grece-rome`)
- Moyen Âge Européen (`moyen-age-europeen`)
- Renaissance & Explorations (`renaissance-explorations`)
- Révolutions Industrielles (`revolutions-industrielles`)
- Première Guerre Mondiale (`premiere-guerre-mondiale`)
- Seconde Guerre Mondiale (`seconde-guerre-mondiale`)
- Guerre Froide (`guerre-froide`)
- Histoire du Japon (`histoire-japon`)
- Décolonisation & Indépendances (`decolonisation-independances`)

### 5. Sciences Physiques & Naturelles (`sciences-physiques`)

- Physique Quantique (`physique-quantique`)
- Relativité (`relativite`)
- Astronomie (`astronomie`)
- Cosmologie (`cosmologie`)
- Chimie Moléculaire (`chimie-moleculaire`)
- Thermodynamique (`thermodynamique`)
- Géologie (`geologie`)
- Météorologie (`meteorologie`)
- Optique (`optique`)
- Physique des Particules (`physique-particules`)

### 6. Technologie & Futurisme (`technologie-futurisme`)

- Intelligence Artificielle (`intelligence-artificielle`)
- Blockchain & Crypto (`blockchain-crypto`)
- Internet des Objets (`iot`)
- Cybersécurité (`cybersecurite`)
- Exploration Spatiale (`exploration-spatiale`)
- Biotechnologies (`biotechnologies`)
- Robotique (`robotique`)
- Réalité Virtuelle & Augmentée (`realite-virtuelle`)
- Énergies du Futur (`energies-futur`)
- Histoire de l'Informatique (`histoire-informatique`)

### 7. Économie & Finance (`economie-finance`)

- Macroéconomie (`macroeconomie`)
- Microéconomie (`microeconomie`)
- Histoire de la Monnaie (`histoire-monnaie`)
- Finance de Marché (`finance-marche`)
- Finance Personnelle (`finance-personnelle`)
- Économie Comportementale (`economie-comportementale`)
- Théorie des Jeux (`theorie-jeux`)
- Commerce International (`commerce-international`)
- Banques Centrales (`banques-centrales`)
- Inégalités & Développement (`inegalites-developpement`)

### 8. Communication & Relations (`communication-relations`)

- Rhétorique & Éloquence (`rhetorique-eloquence`)
- Négociation (`negociation`)
- Communication Non-Violente (`communication-non-violente`)
- Langage Corporel (`langage-corporel`)
- Storytelling (`storytelling`)
- Leadership (`leadership`)
- Intelligence Sociale (`intelligence-sociale`)
- Gestion des Conflits (`gestion-conflits`)
- Art de l'Écoute (`art-ecoute`)
- Prise de Parole en Public (`prise-parole-public`)

### 9. Arts & Esthétique (`arts-esthetique`)

- Histoire de la Peinture (`histoire-peinture`)
- Architecture (`architecture`)
- Photographie (`photographie`)
- Design Industriel (`design-industriel`)
- Théorie des Couleurs (`theorie-couleurs`)
- Art Contemporain (`art-contemporain`)
- Cinéma : Technique (`cinema-technique`)
- Graphisme & Typographie (`graphisme-typographie`)
- Sculpture (`sculpture`)
- Mode & Haute Couture (`mode-haute-couture`)

### 10. Géopolitique & Société (`geopolitique-societe`)

- Relations Internationales (`relations-internationales`)
- Conflits du Moyen-Orient (`conflits-moyen-orient`)
- L'Union Européenne (`union-europeenne`)
- Démographie (`demographie`)
- Ressources Énergétiques (`ressources-energetiques`)
- Religions Mondiales (`religions-mondiales`)
- Systèmes Politiques (`systemes-politiques`)
- Médias & Propagande (`medias-propagande`)
- Géo-économie (`geo-economie`)
- L'Arctique & les Océans (`arctique-oceans`)

### 11. Littérature & Narration (`litterature-narration`)

- Classiques Français (`classiques-francais`)
- Littérature US (`litterature-us`)
- Science-Fiction (`science-fiction`)
- Fantasy (`fantasy`)
- Analyse de Récit (`analyse-recit`)
- Poésie (`poesie`)
- Littérature Japonaise (`litterature-japonaise`)
- Le Roman Noir (`roman-noir`)
- Dramaturgie (`dramaturgie`)
- Littérature Russe (`litterature-russe`)

### 12. Santé & Biologie Humaine (`sante-biologie`)

- Anatomie de base (`anatomie-base`)
- Système Immunitaire (`systeme-immunitaire`)
- Génétique & ADN (`genetique-adn`)
- Nutrition (`nutrition`)
- Microbiote (`microbiote`)
- Physiologie du Sport (`physiologie-sport`)
- Sommeil (`sommeil`)
- Microbiologie (`microbiologie`)
- Santé Mentale (`sante-mentale`)
- Biochimie (`biochimie`)

### 13. Entrepreneuriat & Business (`entrepreneuriat-business`)

- Lean Startup (`lean-startup`)
- Marketing Stratégique (`marketing-strategique`)
- Vente & Closing (`vente-closing`)
- Product Management (`product-management`)
- Growth Hacking (`growth-hacking`)
- Branding (`branding`)
- Management d'Équipe (`management-equipe`)
- Comptabilité de base (`comptabilite-base`)
- Levée de Fonds (`levee-fonds`)
- Éthique des Affaires (`ethique-affaires`)

### 14. Mathématiques & Logique (`mathematiques-logique`)

- Arithmétique (`arithmetique`)
- Algèbre (`algebre`)
- Géométrie (`geometrie`)
- Probabilités (`probabilites`)
- Statistiques (`statistiques`)
- Théorie des Graphes (`theorie-graphes`)
- Cryptographie (`cryptographie`)
- Calcul Différentiel (`calcul-differentiel`)
- Logique Formelle Math (`logique-formelle-math`)
- Histoire des Maths (`histoire-maths`)

### 15. Environnement & Écologie (`environnement-ecologie`)

- Biodiversité (`biodiversite`)
- Changement Climatique (`changement-climatique`)
- Cycle de l'Eau (`cycle-eau`)
- Énergies Renouvelables (`energies-renouvelables`)
- Agriculture Durable (`agriculture-durable`)
- Gestion des Déchets (`gestion-dechets`)
- Écologie Urbaine (`ecologie-urbaine`)
- Faune Menacée (`faune-menacee`)
- Empreinte Carbone (`empreinte-carbone`)
- Éthique Environnementale (`ethique-environnementale`)

### 16. Droit & Justice (`droit-justice`)

- Droit Civil (`droit-civil`)
- Droit Pénal (`droit-penal`)
- Droit Constitutionnel (`droit-constitutionnel`)
- Droits de l'Homme (`droits-homme`)
- Propriété Intellectuelle (`propriete-intellectuelle`)
- Droit du Travail (`droit-travail`)
- Droit du Numérique (`droit-numerique`)
- Droit de la Famille (`droit-famille`)
- Philosophie du Droit (`philosophie-droit`)
- Grands Procès de l'Histoire (`grands-proces`)

### 17. Culture Pop & Loisirs (`culture-pop-loisirs`)

- Histoire du Cinéma (`histoire-cinema`)
- Jeux Vidéo (`jeux-video`)
- Séries TV (`series-tv`)
- Anime & Manga (`anime-manga`)
- Icônes de la Musique Pop (`icones-musique-pop`)
- Bande Dessinée (`bande-dessinee`)
- Le Jeu de Plateau (`jeu-plateau`)
- Énigmes & Casse-têtes (`enigmes-casse-tetes`)
- Culture Internet (`culture-internet`)
- Science-Fiction au Cinéma (`sf-cinema`)

### 18. Musique & Son (`musique-son`)

- Théorie Musicale (`theorie-musicale`)
- Musique Classique (`musique-classique`)
- Jazz (`jazz`)
- Histoire du Rock (`histoire-rock`)
- Musique Électronique (`musique-electronique`)
- Instruments du Monde (`instruments-monde`)
- Acoustique (`acoustique`)
- Opéra (`opera`)
- Hip-Hop (`hip-hop`)
- Production Audio (`production-audio`)

### 19. Spiritualité & Mythologie (`spiritualite-mythologie`)

- Mythologie Grecque (`mythologie-grecque`)
- Mythologie Nordique (`mythologie-nordique`)
- Histoire des Religions (`histoire-religions`)
- Spiritualités Orientales (`spiritualites-orientales`)
- Mysticisme (`mysticisme`)
- Symbolisme (`symbolisme`)
- Mythologie Égyptienne (`mythologie-egyptienne`)
- Mythologie Celte (`mythologie-celte`)
- Philosophie de la Religion (`philosophie-religion`)
- Spiritualités Laïques (`spiritualites-laiques`)

### 20. Langues & Linguistique (`langues-linguistique`)

- Étymologie (`etymologie`)
- Phonétique (`phonetique`)
- Évolution des Langues (`evolution-langues`)
- Sémantique (`semantique`)
- Langues en Danger (`langues-danger`)
- Langages Informatiques (`langages-informatiques`)
- Linguistique Comparative (`linguistique-comparative`)
- Argot & Slang (`argot-slang`)
- Langues des Signes (`langues-signes`)
- Traduction (`traduction`)

---

## 🚀 Instructions de génération

1. Recevoir **une catégorie** de l'utilisateur
2. Générer **tous les decks** de cette catégorie, **dans l'ordre**
3. Pour chaque deck : **15 à 25 cartes**
4. Livrer **uniquement le JSON**, sans texte autour
5. **Nommer le fichier** : `{deck-slug}.json`

---

## 📊 Statistiques cibles

- **20 catégories**
- **200 decks**
- **15-25 cartes par deck**
- **3000-5000 cartes totales**
