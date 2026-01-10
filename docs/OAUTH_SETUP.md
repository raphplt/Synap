# Configuration OAuth pour Synap (Google & Apple Sign In)

Ce guide détaille la configuration nécessaire pour activer l'authentification via Google et Apple dans l'application Synap.

## Table des matières

1. [Prérequis](#prérequis)
2. [Configuration Google](#configuration-google)
3. [Configuration Apple](#configuration-apple)
4. [Variables d'environnement](#variables-denvironnement)
5. [Installation des dépendances](#installation-des-dépendances)
6. [Build EAS](#build-eas)

---

## Prérequis

- Compte Google Cloud avec facturation activée
- Compte Apple Developer ($99/an) - requis pour Apple Sign In
- EAS CLI installé : `npm install -g eas-cli`

---

## Configuration Google

### 1. Créer un projet Google Cloud

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet ou sélectionner un existant
3. Activer l'API "Google Identity Toolkit API"

### 2. Configurer l'écran de consentement OAuth

1. Aller dans **APIs & Services > OAuth consent screen**
2. Choisir "External" (utilisateurs en dehors de l'organisation)
3. Remplir les informations :
   - Nom de l'application : `SYNAP`
   - Email d'assistance utilisateur : votre email
   - Logo de l'application (optionnel)
4. Ajouter les scopes : `email`, `profile`, `openid`
5. Ajouter vos emails de test si en mode "Testing"

### 3. Créer les identifiants OAuth

1. Aller dans **APIs & Services > Credentials**
2. Cliquer sur **Create Credentials > OAuth client ID**

#### Pour iOS :
- Type : iOS
- Bundle ID : `com.synap.app`
- Récupérer le **Client ID iOS**

#### Pour Android :
- Type : Android
- Package name : `com.synap.app`
- SHA-1 certificate fingerprint : 
  ```bash
  # Développement (debug)
  keytool -keystore ~/.android/debug.keystore -list -v -storepass android
  
  # Production (via EAS)
  eas credentials -p android
  ```
- Récupérer le **Client ID Android**

#### Pour le Web (API Backend) :
- Type : Web application
- Nom : `SYNAP API`
- Récupérer le **Client ID Web** → C'est celui à utiliser dans `GOOGLE_CLIENT_ID` de l'API

### 4. Noter les Client IDs

Vous aurez besoin de :
- **Client ID iOS** → pour `EXPO_PUBLIC_GOOGLE_CLIENT_ID` (mobile iOS)
- **Client ID Android** → pour `EXPO_PUBLIC_GOOGLE_CLIENT_ID` (mobile Android) 
- **Client ID Web** → pour `GOOGLE_CLIENT_ID` (API backend)

> **Note** : Expo utilise un client ID unique. Pour simplifier, vous pouvez utiliser le Client ID Web avec l'option `webClientId` dans la configuration.

---

## Configuration Apple

### 1. Configurer l'App ID

1. Aller sur [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list)
2. Cliquer sur votre App ID ou en créer un nouveau
3. App ID : `com.synap.app`
4. Cocher **Sign In with Apple** dans les capabilities
5. Cliquer **Configure** et sauvegarder

### 2. Créer une clé Sign In with Apple (pour le backend)

1. Aller dans **Certificates, Identifiers & Profiles > Keys**
2. Créer une nouvelle clé
3. Nom : `SYNAP Auth Key`
4. Cocher **Sign In with Apple**
5. Configurer avec votre App ID principal
6. Télécharger la clé `.p8` (vous ne pourrez le faire qu'une fois !)
7. Noter le **Key ID**

### 3. Noter les identifiants

- **Bundle ID** : `com.synap.app` → `APPLE_CLIENT_ID` (API)
- **Team ID** : visible dans le portail développeur
- **Key ID** : de la clé créée
- **Fichier .p8** : à garder en sécurité pour une éventuelle validation serveur

> **Important** : Pour un MVP, la validation basique du token (issuer, audience, expiration) suffit. Une validation complète utiliserait la clé pour vérifier la signature JWKS.

---

## Variables d'environnement

### API (`apps/api/.env`)

```env
# OAuth Providers
GOOGLE_CLIENT_ID=123456789-xxx.apps.googleusercontent.com
APPLE_CLIENT_ID=com.synap.app
```

### Mobile (`apps/mobile/.env`)

```env
# Google OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID=123456789-xxx.apps.googleusercontent.com

# API URL
EXPO_PUBLIC_API_URL=https://api.synap.app
```

---

## Installation des dépendances

Dans le dossier `apps/mobile`, installer les nouvelles dépendances :

```bash
cd apps/mobile

# Dépendances OAuth
npx expo install expo-auth-session expo-crypto expo-web-browser expo-apple-authentication
```

---

## Build EAS

Les fonctionnalités OAuth natives (notamment Apple Sign In) nécessitent un build EAS, pas Expo Go.

### 1. Initialiser EAS

```bash
cd apps/mobile
eas init
```

### 2. Configurer le build

Mettre à jour `eas.json` si nécessaire :

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

### 3. Lancer un build de développement

```bash
# iOS simulateur
eas build --profile development --platform ios

# iOS device
eas build --profile development --platform ios --local

# Android
eas build --profile development --platform android
```

### 4. Installer et lancer

```bash
# Installer le build sur simulateur iOS
eas build:run --platform ios

# Ou télécharger l'APK pour Android
```

---

## Test en local

### Sans OAuth (Expo Go)

L'app fonctionnera en Expo Go mais les boutons OAuth ne seront pas visibles car les modules natifs ne seront pas disponibles.

```bash
cd apps/mobile
npm run dev
```

### Avec OAuth (Development Build)

Utiliser le build de développement installé et lancer le serveur metro :

```bash
cd apps/mobile
npx expo start --dev-client
```

---

## Troubleshooting

### Erreur "Invalid client_id"
- Vérifier que le Client ID correspond à la plateforme (iOS/Android/Web)
- Vérifier que le Bundle ID / Package name est correct

### Erreur "redirect_uri_mismatch" (Google)
- Ajouter le redirect URI dans la console Google :
  - Format Expo : `com.synap.app:/oauth2redirect/google`
  - Format custom : `synap://oauth-callback`

### Apple Sign In ne fonctionne pas
- Vérifier que vous utilisez un build EAS (pas Expo Go)
- Vérifier que "Sign In with Apple" est activé dans les capabilities
- Tester sur un appareil réel ou TestFlight (pas le simulateur)

### Erreur "EMAIL_ALREADY_REGISTERED_WITH_PASSWORD"
- L'utilisateur a déjà un compte avec email/mot de passe
- Pour l'instant, la migration de compte n'est pas supportée

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Mobile App    │     │   NestJS API    │     │   PostgreSQL    │
│  (Expo + RN)    │────▶│   /auth/oauth   │────▶│    users        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  Google OAuth   │     │ Token Verify    │
│  Apple Auth     │     │ (tokeninfo API) │
└─────────────────┘     └─────────────────┘
```

1. L'utilisateur clique sur "Continuer avec Google/Apple"
2. L'app mobile initie le flux OAuth via `expo-auth-session` ou `expo-apple-authentication`
3. L'utilisateur se connecte chez le provider
4. Le mobile reçoit un ID token
5. L'app envoie le token à `POST /auth/oauth`
6. L'API vérifie le token avec le provider
7. L'API crée/trouve l'utilisateur et retourne un JWT + user

---

## Checklist avant mise en production

- [ ] Créer les Client IDs de production (Google)
- [ ] Activer le mode "Production" dans l'écran de consentement Google
- [ ] Configurer les App Store Connect credentials (iOS)
- [ ] Ajouter les SHA-1 de production (Android)
- [ ] Tester les deux flows sur appareils réels
- [ ] Mettre à jour les variables d'environnement de production
