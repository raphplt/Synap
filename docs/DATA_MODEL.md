# Data Model SYNAP

## Hiérarchie

```
📁 Category (ex: "Psychologie")
   └── 📚 Deck (ex: "Biais Cognitifs")
         ├── 🃏 Card ("Biais de confirmation")
         ├── 🃏 Card ("Effet Dunning-Kruger")
         └── 🃏 Card ("Biais d'ancrage")
```

## Comparatif

| | **Card** | **Deck** | **Category** |
|---|----------|----------|--------------|
| **Rôle** | Flashcard unique | Collection thématique | Regroupement de decks |
| **Parent** | Deck (optionnel) | Category | — |
| **Table** | `cards` | `decks` | `categories` |

## Schéma des entités

### Category
```typescript
id: UUID
name: string           // "Psychologie"
slug: string           // "psychologie"
description?: string
imageUrl?: string      // URL ou emoji 🧠
sortOrder: number
```

### Deck
```typescript
id: UUID
name: string           // "Biais Cognitifs"
slug: string           // "biais-cognitifs"
description: string
imageUrl: string
categoryId: UUID       // FK → Category
cardCount: number      // Calculé automatiquement
isActive: boolean
sortOrder: number
```

### Card
```typescript
id: UUID
title: string          // "Biais de confirmation"
summary: string        // Face A (aperçu)
content: string        // Face B (détails)
mediaUrl: string       // Image de fond
sourceLink: string     // URL source
sourceType?: string    // WIKI_TOP, CURATED, etc.
origin: CardOrigin     // WIKIPEDIA | CURATED | AI_GENERATED
qualityScore: number   // 0-100
deckId?: UUID          // FK → Deck (optionnel)
```

## Relations TypeORM

```
Category (1) ←—→ (N) Deck (1) ←—→ (N) Card
                          ↑
                    cardCount++
```

## API Endpoints

| Entité | Endpoints |
|--------|-----------|
| **Categories** | `GET /decks/categories` |
| **Decks** | `GET /decks`, `GET /decks/:slug` |
| **Cards** | via Feed: `GET /feed/personalized` |
