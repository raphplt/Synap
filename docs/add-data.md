# Guide: Ajouter du Contenu Curated à SYNAP

Ce guide explique comment ajouter du contenu de haute qualité généré à la main dans SYNAP.

---

## 🚀 Option 1: Via l'endpoint API `/seed/gold`

Le plus simple pour tester. Appelle l'endpoint qui peuple la base avec les 23 cartes Gold intégrées :

```bash
curl -X POST http://localhost:3000/seed/gold
```

---

## 📝 Option 2: Modifier le fichier SeedService

### Fichier à éditer
`apps/api/src/modules/seed/seed.service.ts`

### Format des données

Le dataset est structuré en **Catégories → Decks → Cartes** :

```typescript
{
  name: "Nom de la catégorie",          // Ex: "Psychologie"
  slug: "slug-categorie",               // Ex: "psychologie" (URL-friendly)
  description: "Description courte",
  imageUrl: "https://url-image.jpg",    // Image de couverture

  decks: [
    {
      name: "Nom du deck",              // Ex: "Biais Cognitifs"
      slug: "biais-cognitifs",          // URL-friendly
      description: "Description du deck",
      imageUrl: "https://url-image.jpg",

      cards: [
        {
          title: "Titre de la carte",           // Court, percutant
          summary: "Résumé en 1 phrase",        // Affiché en face A
          content: "Contenu détaillé...",       // Affiché en face B
          mediaUrl: "https://image.jpg"         // Optionnel
        },
        // ... autres cartes
      ]
    }
  ]
}
```

### Exemple concret

Ouvre `apps/api/src/modules/seed/seed.service.ts` et trouve la méthode `getGoldDataset()`.

Ajoute ta catégorie dans le tableau retourné :

```typescript
{
  name: "Économie",
  slug: "economie",
  description: "Comprendre les mécanismes économiques",
  imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400",
  decks: [
    {
      name: "Principes Économiques",
      slug: "principes-economiques",
      description: "Les bases de l'économie moderne",
      imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400",
      cards: [
        {
          title: "L'offre et la demande",
          summary: "Le prix équilibre quantité offerte et demandée",
          content: "La loi de l'offre et de la demande est le fondement...",
        },
        // Ajoute plus de cartes ici
      ]
    }
  ]
}
```

---

## 📂 Option 3: Fichier JSON externe (recommandé pour gros volumes)

### 1. Créer un fichier JSON

```bash
mkdir -p apps/api/data/curated
touch apps/api/data/curated/mon-deck.json
```

### 2. Format du fichier JSON

```json
{
  "category": {
    "name": "Ma Catégorie",
    "slug": "ma-categorie",
    "description": "Description",
    "imageUrl": "https://..."
  },
  "deck": {
    "name": "Mon Deck",
    "slug": "mon-deck",
    "description": "Description du deck",
    "imageUrl": "https://..."
  },
  "cards": [
    {
      "title": "Titre 1",
      "summary": "Résumé court",
      "content": "Contenu détaillé en plusieurs paragraphes..."
    },
    {
      "title": "Titre 2",
      "summary": "...",
      "content": "..."
    }
  ]
}
```

### 3. Importer via script (TODO)

Le `IngestionFactory` avec un adapter JSON n'est pas encore implémenté. Tu peux :
- Étendre `SeedService` pour lire ce fichier
- Ou ajouter directement les données dans `getGoldDataset()`

---

## ✅ Bonnes pratiques

| Champ | Règles |
|-------|--------|
| **title** | 5-10 mots max, accrocheur |
| **summary** | 1 phrase (< 150 caractères) |
| **content** | 100-500 mots, pédagogique |
| **slug** | Minuscules, tirets, pas d'accents |
| **imageUrl** | Unsplash recommandé (300-500px largeur) |

---

## 🔄 Workflow recommandé

1. **Développement** : Modifie `getGoldDataset()` directement
2. **Test** : `curl -X POST http://localhost:3000/seed/gold`
3. **Production** : Migrations TypeORM ou script d'import
