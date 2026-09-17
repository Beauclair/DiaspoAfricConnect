# DiaspoAfricConnect

A mobile platform connecting the African diaspora community across **the United States, Canada, the United Kingdom, France, and Germany**. DiaspoAfricConnect combines a **directory of African-owned businesses** with an **immigration resource hub** — two services the community needs most, in one app.

Users select their host country at signup, and the entire experience adapts: address formats, immigration categories, document checklists, postal code validation, and Firestore queries all flow from a single country configuration. Adding a new country requires only data changes — zero code modifications.

Built with React Native, Expo SDK 57, and Firebase.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Models](#data-models)
- [Getting Started](#getting-started)
- [Firebase Setup](#firebase-setup)
- [Running the App](#running-the-app)
- [Building for Production](#building-for-production)
- [Publishing to Google Play Store](#publishing-to-google-play-store)
- [Publishing to Apple App Store](#publishing-to-apple-app-store)
- [OTA Updates After Launch](#ota-updates-after-launch)
- [Environment Variables](#environment-variables)
- [Seed Data](#seed-data)
- [Adding a New Country](#adding-a-new-country)

---

## Features

### Multi-Country Support
- **5 host countries**: United States, Canada, United Kingdom, France, Germany
- Country selection at signup with flag-emoji picker
- Switch host country from Profile at any time
- Country-aware address forms (State/Province/County/Département/Bundesland, ZIP/postal code formats)
- Per-country postal code validation with regex patterns
- Per-country immigration categories and document checklists
- All Firestore queries filter by selected host country
- Data-driven architecture: add a new country by editing `countries.ts`, `checklists.ts`, and `seedData.ts` — no code changes

### Business Directory
- Browse African-owned businesses by category (restaurants, grocery, beauty, fashion, services, health, education, entertainment)
- Search by name, city, country of origin, or description
- Detailed business profiles with photos, contact info, and languages spoken
- Review and rating system with star picker
- Add your own business with photo uploads (up to 3 images)
- Map integration ready (Google Maps API)

### Business Owner Dashboard
- **My Businesses** screen listing all businesses you own
- **Edit Business** — update name, description, category, photos, address, contact info
- **Delete Business** with confirmation dialog
- **Respond to Reviews** — inline response form visible to all users
- Owner banner on business detail page ("You own this business")
- Owners cannot review their own business

### Immigration Resource Hub
- Step-by-step immigration guides adapted per country (visas, permanent residence, asylum, citizenship, work permits, family-based, student)
- Country-specific categories: Green Card (US), Express Entry (CA), Indefinite Leave to Remain (UK), Carte de Séjour (FR), Aufenthaltstitel (DE)
- Each guide includes: process steps, required documents, estimated timeline, and cost
- Immigration lawyer directory with specializations, languages, and contact info
- Per-country document checklist with persistent progress tracking (progress isolated per country)
- Legal disclaimer on all guides

### Platform Features
- Email/password authentication with password reset
- User profiles with country of origin, host country, and languages spoken
- Offline support with Firestore persistence
- Network status detection with offline banner
- Error boundaries and user-facing error messages with retry
- Crash reporting via Sentry (production only)
- OTA updates via expo-updates
- Accessibility labels on all interactive components
- Pan-African themed UI (green, gold, red)

---

## Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────┐
│                    Mobile App                        │
│  ┌───────────────────────────────────────────────┐  │
│  │              Expo Router (File-based)          │  │
│  │  ┌──────────┬──────────┬───────────┬───────┐  │  │
│  │  │  (auth)  │  (tabs)  │ business/ │ immi/ │  │  │
│  │  │  login   │  home    │  [id]     │ guide │  │  │
│  │  │  signup  │  biz     │  add      │ laws  │  │  │
│  │  │  forgot  │  immig   │  edit     │ check │  │  │
│  │  │          │  profile │  my-biz   │       │  │  │
│  │  └──────────┴──────────┴───────────┴───────┘  │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │              Service Layer                     │  │
│  │  authService │ businessService │ reviewService │  │
│  │  immigrationService │ storageService           │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │           Cross-Cutting Concerns               │  │
│  │  AuthContext │ CountryContext │ ErrorBoundary  │  │
│  │  OfflineBanner │ useNetworkStatus │ Sentry    │  │
│  │  Validation │ Country Config                   │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                   Firebase                           │
│  ┌────────────┬──────────────┬───────────────────┐  │
│  │    Auth     │  Firestore   │    Storage        │  │
│  │ Email/Pass  │  businesses  │  business photos  │  │
│  │             │  reviews     │                   │  │
│  │             │  users       │                   │  │
│  │             │  immGuides   │                   │  │
│  │             │  lawyers     │                   │  │
│  └────────────┴──────────────┴───────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Routing Architecture

The app uses **Expo Router v5** with file-based routing. The `app/` directory defines all routes:

- **`app/_layout.tsx`** — Root layout. Wraps the entire app with Sentry, ErrorBoundary, AuthProvider, CountryProvider, OfflineBanner, and StatusBar.
- **`app/index.tsx`** — Entry redirect. Checks auth state and redirects to `/(tabs)/home` or `/(auth)/login`.
- **`app/(auth)/`** — Auth stack (login, signup with country picker, forgot-password). No tab bar.
- **`app/(tabs)/`** — Main tab navigator with 4 tabs: Home, Business, Immigration, Profile.
- **`app/business/`** — Business stack (view detail, add, edit, my-businesses). Navigated from the Business tab or Profile.
- **`app/immigration/`** — Immigration detail stack (guide list, guide detail, lawyer directory, document checklist). Navigated from the Immigration tab.

### State Management

- **AuthContext** — React Context + `onAuthStateChanged` listener. Provides `user` and `loading` to all screens.
- **CountryContext** — React Context providing `hostCountry`, `countryConfig`, and `setHostCountry`. Persists selection to AsyncStorage and syncs with Firestore user profile. All screens and services consume this to adapt per country.
- **Local state** — Each screen manages its own data fetching with `useState` + `useEffect`. No global state library needed at MVP scale.
- **AsyncStorage** — Used for Firebase auth persistence, host country preference, and per-country document checklist state (`@checklist_state_US`, `@checklist_state_CA`, etc.).
- **Firestore persistence** — IndexedDB persistence enabled for offline data access.

### Service Layer

All Firebase operations are encapsulated in service modules (`src/services/`):

| Service | Responsibility |
|---------|---------------|
| `authService` | Sign up (with host country), sign in, sign out, password reset, user profile CRUD |
| `businessService` | Business CRUD, search, category filtering, owner queries, delete (limited to 100 results) |
| `reviewService` | Add reviews with incremental rating calculation, owner responses |
| `immigrationService` | Guide CRUD, lawyer CRUD, category filtering, search — all filterable by host country |
| `storageService` | Image upload to Firebase Storage |

### Error Handling Strategy

1. **ErrorBoundary** (class component) wraps the root — catches render errors, shows "Try Again" UI.
2. **ErrorView** component — reusable inline error display with retry button.
3. Every screen that fetches data has `error` state — no silent `catch {}` blocks.
4. **Sentry** captures unhandled errors in production (disabled in `__DEV__`).

### Production Hardening

| Concern | Solution |
|---------|----------|
| Secrets | Firebase config read from `app.json > extra` via `expo-constants` |
| Crashes | ErrorBoundary + Sentry crash reporting |
| Offline | Firestore IndexedDB persistence + NetInfo banner |
| Validation | `src/utils/validation.ts` — email, password, phone, URL, country-aware postal code |
| Persistence | Document checklist saved to AsyncStorage (per-country keys) |
| Performance | Firestore queries limited to 100 docs; review rating uses incremental math |
| Accessibility | `accessibilityRole`, `accessibilityLabel`, `accessibilityState` on all interactive components |
| OTA Updates | `expo-updates` configured with `appVersion` runtime policy |

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React Native | 0.86.3 |
| Platform | Expo SDK | 57 |
| Language | TypeScript | 6.0 |
| React | React | 19.2.3 |
| Routing | Expo Router | 5.0 |
| Backend | Firebase | 10.14 |
| Auth | Firebase Auth | (via firebase) |
| Database | Cloud Firestore | (via firebase) |
| Storage | Firebase Storage | (via firebase) |
| Maps | react-native-maps | 2.3 |
| Crash Reporting | Sentry | 6.5 |
| OTA Updates | expo-updates | 0.27 |
| Image Picker | expo-image-picker | 16.0 |
| Network Info | @react-native-community/netinfo | 11.4 |
| Local Storage | @react-native-async-storage/async-storage | 2.1 |

---

## Project Structure

```
DiaspoAfricConnect/
├── app/                              # Expo Router screens (file-based routing)
│   ├── _layout.tsx                   # Root layout (Sentry, ErrorBoundary, Auth, Country, Offline)
│   ├── index.tsx                     # Auth redirect
│   ├── (auth)/                       # Auth screens (no tab bar)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── signup.tsx                # Includes host country picker
│   │   └── forgot-password.tsx
│   ├── (tabs)/                       # Main tab navigator
│   │   ├── _layout.tsx               # Tab bar config (Home, Business, Immigration, Profile)
│   │   ├── home.tsx                  # Dashboard (country-filtered)
│   │   ├── business.tsx              # Business list with search/filter (country-filtered)
│   │   ├── immigration.tsx           # Immigration hub home (country-aware categories)
│   │   └── profile.tsx               # User profile with country picker + My Businesses link
│   ├── business/                     # Business stack
│   │   ├── _layout.tsx
│   │   ├── [id].tsx                  # Business detail with reviews + owner controls
│   │   ├── add.tsx                   # Add business form with photo upload
│   │   ├── edit.tsx                  # Edit business form (owner only)
│   │   └── my-businesses.tsx         # Owner's business listing dashboard
│   └── immigration/                  # Immigration detail stack
│       ├── _layout.tsx
│       ├── guides.tsx                # Guide list by category (country-aware)
│       ├── guide/[id].tsx            # Guide detail (steps, docs, cost)
│       ├── lawyers.tsx               # Lawyer directory (country-filtered)
│       └── checklist.tsx             # Per-country persistent document checklist
│
├── src/                              # Core application code
│   ├── types/index.ts                # TypeScript interfaces (with hostCountry, ownerResponse)
│   ├── config/firebase.ts            # Firebase initialization (reads env from app.json)
│   ├── contexts/
│   │   ├── AuthContext.tsx            # Auth state provider
│   │   └── CountryContext.tsx         # Host country provider (AsyncStorage + Firestore sync)
│   ├── services/
│   │   ├── authService.ts            # Auth operations (signup with host country)
│   │   ├── businessService.ts        # Business CRUD + search + owner queries + delete
│   │   ├── reviewService.ts          # Reviews with incremental rating + owner responses
│   │   ├── immigrationService.ts     # Guides + lawyers CRUD (country-filterable)
│   │   └── storageService.ts         # Firebase Storage image upload
│   ├── components/
│   │   ├── common/                   # Shared UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── CategoryChip.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── ErrorView.tsx
│   │   │   └── OfflineBanner.tsx
│   │   ├── business/
│   │   │   ├── BusinessCard.tsx
│   │   │   └── ReviewCard.tsx        # Displays owner responses when present
│   │   └── immigration/
│   │       ├── GuideCard.tsx
│   │       └── ChecklistItem.tsx
│   ├── hooks/
│   │   └── useNetworkStatus.ts       # Network connectivity hook
│   ├── utils/
│   │   ├── validation.ts             # Input validators (country-aware postal codes)
│   │   └── helpers.ts                # Formatting utilities
│   ├── constants/
│   │   ├── colors.ts                 # Pan-African theme colors
│   │   ├── categories.ts             # Business + immigration categories, countries, languages
│   │   └── countries.ts              # Host country configs (address fields, postal regex, immigration categories)
│   └── data/
│       ├── seedData.ts               # Sample data for all 5 countries + migration helper
│       └── checklists.ts             # Per-country immigration document checklists
│
├── assets/                           # App icons, splash screen
├── app.json                          # Expo configuration
├── package.json
├── tsconfig.json
├── babel.config.js
├── index.ts                          # Expo Router entry point
└── .env.example                      # Environment variable template
```

---

## Data Models

### Firestore Collections

**`users`**
| Field | Type | Description |
|-------|------|-------------|
| uid | string | Firebase Auth UID |
| email | string | User email |
| displayName | string | Display name |
| photoURL | string? | Profile photo URL |
| countryOfOrigin | string? | African country of origin |
| hostCountry | HostCountryCode? | Selected host country (US, CA, UK, FR, DE). Defaults to US |
| languagesSpoken | string[] | Languages the user speaks |
| savedBusinesses | string[] | Bookmarked business IDs |
| createdAt | Timestamp | Account creation date |

**`businesses`**
| Field | Type | Description |
|-------|------|-------------|
| name | string | Business name |
| description | string | Business description |
| category | string | restaurant, grocery, beauty, fashion, services, health, education, entertainment, other |
| countryOfOrigin | string | Country (e.g. Nigeria, Ethiopia) |
| hostCountry | HostCountryCode | Country where the business is located (US, CA, UK, FR, DE) |
| address, city, state, zipCode | string | Address (labels adapt per country) |
| coordinates | { latitude, longitude } | Map coordinates |
| phone, website | string? | Contact info |
| languagesSpoken | string[] | Languages spoken at business |
| photos | string[] | Firebase Storage URLs |
| ownerId | string | Owner's user UID |
| averageRating | number | Calculated average (1-5) |
| reviewCount | number | Total review count |
| isVerified | boolean | Admin verification status |

**`reviews`**
| Field | Type | Description |
|-------|------|-------------|
| businessId | string | Reference to business |
| userId | string | Reviewer's UID |
| userName | string | Reviewer's display name |
| rating | number | 1-5 stars |
| comment | string | Review text |
| ownerResponse | string? | Business owner's reply to the review |
| ownerResponseAt | Timestamp? | When the owner responded |
| createdAt | Timestamp | Review date |

**`immigrationGuides`**
| Field | Type | Description |
|-------|------|-------------|
| title | string | Guide title |
| category | string | visa, greencard, permanent-residence, asylum, citizenship, work-permit, family, student, indefinite-leave, carte-de-sejour, aufenthaltstitel, other |
| hostCountry | HostCountryCode | Which country this guide applies to |
| summary | string | Short description |
| content | string | Full guide content |
| steps | string[] | Step-by-step process |
| requiredDocuments | string[] | Document list |
| estimatedTimeline | string | e.g. "6-24 months" |
| estimatedCost | string | e.g. "$1,760-$2,500" |

**`lawyers`**
| Field | Type | Description |
|-------|------|-------------|
| name | string | Lawyer name |
| firm | string | Law firm name |
| specializations | string[] | Immigration categories |
| languagesSpoken | string[] | Languages |
| hostCountry | HostCountryCode | Country where the lawyer practices |
| city, state | string | Location |
| phone, email | string | Contact |
| website | string? | Website URL |
| averageRating | number | Rating (1-5) |
| consultationFee | string? | e.g. "$150/hour" |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Expo CLI**: `npm install -g eas-cli`
- **Expo Go** app on your phone (for development)
- A **Firebase** project (see [Firebase Setup](#firebase-setup))
- For store builds: **Apple Developer** account ($99/year) and/or **Google Play Console** account ($25 one-time)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd DiaspoAfricConnect

# Install dependencies
npm install
```

---

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com) and create a new project.

2. **Enable Authentication**:
   - Go to Authentication > Sign-in method
   - Enable **Email/Password**

3. **Create Firestore Database**:
   - Go to Firestore Database > Create database
   - Start in **test mode** (update security rules before production)

4. **Enable Storage**:
   - Go to Storage > Get started
   - Default rules are fine for development

5. **Get your config**:
   - Go to Project Settings > General > Your apps > Web app
   - Copy the Firebase config values

6. **Add config to app.json**:
   ```json
   "extra": {
     "firebaseApiKey": "AIzaSy...",
     "firebaseAuthDomain": "your-project.firebaseapp.com",
     "firebaseProjectId": "your-project-id",
     "firebaseStorageBucket": "your-project.appspot.com",
     "firebaseMessagingSenderId": "123456789",
     "firebaseAppId": "1:123456789:web:abc123"
   }
   ```

7. **Firestore Security Rules** (for production):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
       match /businesses/{businessId} {
         allow read: if true;
         allow create: if request.auth != null;
         allow update: if request.auth != null
           && resource.data.ownerId == request.auth.uid;
         allow delete: if request.auth != null
           && resource.data.ownerId == request.auth.uid;
       }
       match /reviews/{reviewId} {
         allow read: if true;
         allow create: if request.auth != null;
         allow update: if request.auth != null
           && request.resource.data.diff(resource.data).affectedKeys()
              .hasOnly(['ownerResponse', 'ownerResponseAt']);
       }
       match /immigrationGuides/{guideId} {
         allow read: if true;
       }
       match /lawyers/{lawyerId} {
         allow read: if true;
       }
     }
   }
   ```

---

## Running the App

### Development (Expo Go)

```bash
# Start the development server
npx expo start

# Or target a specific platform
npx expo start --android
npx expo start --ios

# Run on a connected device or emulator
npx expo run:android
npx expo run:ios
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS).

### Local Development Workflow

1. **Install dependencies**: `npm install`
2. **Configure Firebase**: Add your Firebase config to `app.json > extra` (see [Firebase Setup](#firebase-setup))
3. **Start dev server**: `npx expo start`
4. **Seed the database** (first run only):
   ```typescript
   import { seedDatabase } from './src/data/seedData';
   await seedDatabase();
   ```
5. **Create a test account** via the signup screen — select a host country
6. **Test multi-country**: Change host country in Profile > Edit Profile to verify all screens adapt
7. **Test owner flows**: Add a business, then verify you see Edit/Delete/Respond controls on its detail page

### Seed the Database

On first run, the database will be empty. To add sample data, import and call the seed function in your app or run it manually:

```typescript
import { seedDatabase } from './src/data/seedData';
// Call once — it checks if data already exists before inserting
await seedDatabase();

// If you have existing US-only data, run the migration helper:
import { migrateExistingData } from './src/data/seedData';
await migrateExistingData();
```

---

## Building for Production

DiaspoAfricConnect uses **EAS Build** (Expo Application Services) for production builds.

### One-Time Setup

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Log in to your Expo account
eas login

# Configure your project for EAS Build
eas build:configure
```

This creates an `eas.json` file. Recommended configuration:

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Build Commands

```bash
# Build for Android (produces .aab file)
eas build --platform android --profile production

# Build for iOS (produces .ipa file)
eas build --platform ios --profile production

# Build for both platforms
eas build --platform all --profile production
```

Build times: ~10-20 minutes. Check status at [expo.dev](https://expo.dev).

---

## Publishing to Google Play Store

### Prerequisites
- Google Play Console account ($25 one-time fee): [play.google.com/console](https://play.google.com/console)
- Production build (`.aab` file) from EAS Build

### Step-by-Step

#### 1. Create the App Listing

1. Go to Google Play Console > **Create app**
2. Fill in:
   - App name: **DiaspoAfricConnect**
   - Default language: English (US)
   - App type: App
   - Free or paid: Free

#### 2. Complete Store Listing

Navigate to **Grow > Store listing** and fill in:

| Field | Value |
|-------|-------|
| Short description | Connect with African-owned businesses and immigration resources across 5 countries |
| Full description | DiaspoAfricConnect is the go-to app for the African diaspora community... (write 300+ words) |
| App icon | 512x512 PNG (use Pan-African colors: green #1B5E20, gold #F9A825, red #C62828) |
| Feature graphic | 1024x500 PNG |
| Screenshots | At least 2 phone screenshots per device type (take from Expo Go) |
| App category | Social / Lifestyle |

#### 3. Complete the Data Safety Form

Navigate to **Policy > App content > Data safety**:
- The app collects: email, name, location (optional), photos (optional)
- Data is stored in Firebase (Google Cloud)
- Users can request deletion

#### 4. Set Up Signing

EAS Build handles app signing automatically. If you need the signing key:
```bash
eas credentials
```

#### 5. Submit the Build

**Option A: EAS Submit (recommended)**
```bash
# Automatically uploads to Google Play Console
eas submit --platform android --profile production
```

You'll need a **Google Service Account JSON key**:
1. Go to Google Cloud Console > IAM & Admin > Service Accounts
2. Create a service account with the "Service Account User" role
3. Create a JSON key and download it
4. Link it in `eas.json`:
   ```json
   "submit": {
     "production": {
       "android": {
         "serviceAccountKeyPath": "./google-service-account.json"
       }
     }
   }
   ```

**Option B: Manual Upload**
1. Download the `.aab` file from [expo.dev](https://expo.dev)
2. Go to Play Console > **Production** > **Create new release**
3. Upload the `.aab` file
4. Add release notes
5. **Review and roll out**

#### 6. Review Process

- Google reviews take **1-7 days** (longer for first submission)
- Common rejection reasons: missing privacy policy, incomplete data safety form, misleading screenshots
- After approval, the app goes live on Google Play

---

## Publishing to Apple App Store

### Prerequisites
- Apple Developer Program membership ($99/year): [developer.apple.com](https://developer.apple.com)
- Production build (`.ipa` file) from EAS Build
- A Mac is **not required** when using EAS Build

### Step-by-Step

#### 1. Register App ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account) > Certificates, Identifiers & Profiles
2. Register a new identifier:
   - Type: App ID
   - Bundle ID: `com.diaspoafricconnect.app` (matches `app.json`)

#### 2. Create App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com) > My Apps > **+** New App
2. Fill in:
   - Platform: iOS
   - Name: DiaspoAfricConnect
   - Primary language: English (US)
   - Bundle ID: `com.diaspoafricconnect.app`
   - SKU: `diaspoafricconnect-001`

#### 3. Complete App Information

| Section | Requirements |
|---------|-------------|
| **App Information** | Privacy policy URL (required), category: Social Networking or Lifestyle |
| **Pricing** | Free |
| **App Privacy** | Declare: email, name, user ID, photos, location. Purpose: App Functionality |
| **Screenshots** | 6.7" (iPhone 15 Pro Max): at least 3 screenshots. 6.5" and 5.5" also recommended. iPad if supporting tablets. |
| **Description** | App description, keywords, support URL, marketing URL |
| **Age Rating** | Fill out the questionnaire (likely 4+) |
| **Review Information** | Provide demo account credentials for the Apple reviewer |

#### 4. Set Up Signing

EAS handles code signing. On first build for iOS:
```bash
eas build --platform ios --profile production
```
EAS will prompt you to log in to your Apple Developer account and will create/manage provisioning profiles and certificates automatically.

#### 5. Submit the Build

**Option A: EAS Submit (recommended)**
```bash
eas submit --platform ios --profile production
```

You'll need your **Apple ID** and an **app-specific password**:
1. Go to [appleid.apple.com](https://appleid.apple.com) > Security > App-Specific Passwords
2. Generate a password
3. EAS will prompt for it, or add to `eas.json`:
   ```json
   "submit": {
     "production": {
       "ios": {
         "appleId": "your@email.com",
         "ascAppId": "1234567890"
       }
     }
   }
   ```

**Option B: Manual Upload**
1. Download the `.ipa` from [expo.dev](https://expo.dev)
2. Use **Transporter** app (Mac App Store) to upload the `.ipa`
3. In App Store Connect, select the build and submit for review

#### 6. App Review Process

- Apple review takes **1-3 days** (can be longer for first submission)
- **Must provide demo credentials** — create a test account the reviewer can use
- Common rejection reasons:
  - Broken functionality (Firebase not configured)
  - No demo account provided
  - Missing privacy policy
  - Guideline 4.2: "Minimum Functionality" — make sure the app has real content/features
- After approval, you choose to release immediately or on a specific date

---

## OTA Updates After Launch

Once the app is on the stores, you can push JavaScript updates without going through the review process:

```bash
# Push an update to all users
eas update --branch production --message "Fixed business search bug"

# Check update status
eas update:list
```

OTA updates can change JavaScript/TypeScript code but **cannot** change:
- Native dependencies (new npm packages with native code)
- `app.json` configuration
- App icons or splash screens

For native changes, you must submit a new build through the stores.

---

## Environment Variables

All sensitive configuration is stored in `app.json` under `expo.extra` and accessed at runtime via `expo-constants`. Never hardcode API keys in source files.

| Variable | Where to set | Purpose |
|----------|-------------|---------|
| `firebaseApiKey` | `app.json > extra` | Firebase API key |
| `firebaseAuthDomain` | `app.json > extra` | Firebase Auth domain |
| `firebaseProjectId` | `app.json > extra` | Firestore project ID |
| `firebaseStorageBucket` | `app.json > extra` | Storage bucket |
| `firebaseMessagingSenderId` | `app.json > extra` | FCM sender ID |
| `firebaseAppId` | `app.json > extra` | Firebase app ID |
| `googleMapsApiKey` | `app.json > ios/android config` | Google Maps |
| Sentry DSN | `app/_layout.tsx` | Crash reporting |

For CI/CD, use EAS Secrets:
```bash
eas secret:create --name FIREBASE_API_KEY --value "your-key" --scope project
```

---

## Seed Data

The app includes sample data in `src/data/seedData.ts`:

- **9 businesses** across 5 countries:
  - US: Mama Africa Kitchen (DC), Abyssinia Market (DC), Fatou Braiding Salon (MD), Ankara Fashion House (MD), Ubuntu Tech Solutions (VA)
  - CA: Taste of Lagos (Toronto)
  - UK: Nollywood Lounge (London)
  - FR: Chez Mariama (Paris)
  - DE: Afro Lebensmittel (Berlin)
- **8 immigration guides**: Family-Based Green Card, H-1B Work Visa, Path to Citizenship, Asylum (US), Express Entry (CA), Skilled Worker Visa (UK), Titre de Séjour (FR), EU Blue Card (DE)
- **8 lawyers**: Specialists across all 5 countries
- **`migrateExistingData()`**: Sets `hostCountry: 'US'` on any existing Firestore documents missing the field (backward compatibility)

To seed your Firestore database, call `seedDatabase()` once after configuring Firebase. The function checks if data already exists before inserting.

---

## Adding a New Country

The multi-country architecture is fully data-driven. To add support for a new host country (e.g. South Africa):

1. **`src/constants/countries.ts`** — Add the country code to the `HostCountryCode` union type and add a full entry to `HOST_COUNTRIES` with: name, flag emoji, currency, address field labels (region, postal code, keyboard type, regex), immigration system label, and immigration categories.

2. **`src/data/checklists.ts`** — Add a checklist entry for the new country code with sections and items relevant to that country's immigration documents.

3. **`src/data/seedData.ts`** — Add sample businesses, immigration guides, and lawyers for the new country.

No screen, component, service, or routing changes are needed.

---

## Theme

The app uses Pan-African inspired colors:

| Color | Hex | Usage |
|-------|-----|-------|
| Primary (Green) | `#1B5E20` | Headers, buttons, accents |
| Secondary (Gold) | `#F9A825` | Highlights, secondary actions |
| Accent (Red) | `#C62828` | Errors, warnings, logout |
| Background | `#FAFAFA` | Screen backgrounds |
| Card | `#FFFFFF` | Card surfaces |
| Text | `#212121` | Primary text |
| Text Light | `#757575` | Secondary text |

---

## License

This project is proprietary. All rights reserved.
