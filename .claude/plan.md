# Add "Nearby Businesses" Location Feature

## Current State
- `expo-location` is **already installed** (v18.0.0) and **configured** in `app.config.js` with permission text
- `Business` type already has `coordinates: { latitude: number; longitude: number }` field
- Businesses are currently saved with hardcoded `coordinates: { latitude: 0, longitude: 0 }`
- Business detail screen already links to Maps for directions (address-based)
- All queries currently filter by `hostCountry` only — no proximity sorting

## What We'll Add

### 1. Location utility — `src/utils/location.ts` (new file)
- `getCurrentLocation()` — wraps `expo-location` to request permission and return `{ latitude, longitude }`
- `getDistanceKm(lat1, lon1, lat2, lon2)` — Haversine formula to compute distance between two points
- `sortByDistance(businesses, userLat, userLon)` — sorts a list of businesses by distance and adds a `distance` field

### 2. Geocode business address at creation — `app/business/add.tsx`
- After submitting the business, use `expo-location`'s `geocodeAsync()` to convert the address → coordinates
- Update the business doc with real coordinates (instead of `0, 0`)
- This is best-effort: if geocoding fails, coordinates stay `0, 0` — no blocker

### 3. "Near Me" toggle on business list — `app/(tabs)/business.tsx`
- Add a "Near Me" chip/toggle button near the search bar
- When tapped:
  1. Request location permission
  2. Get user's current coordinates
  3. After fetching businesses, sort them client-side by distance
  4. Show distance badge on each BusinessCard (e.g., "2.3 km")
- When toggled off: revert to default `createdAt` order

### 4. Distance badge on BusinessCard — `src/components/business/BusinessCard.tsx`
- Accept optional `distance?: number` prop
- If provided, show a small "📍 2.3 km" badge next to the location text

### 5. Update privacy policy — `public/privacy-policy.html`
- Re-add section 1.5 "Location" with accurate description
- Re-add "Show nearby businesses" row in usage table
- Re-add section 5.3 "Location" in Your Rights
- Deploy to Firebase Hosting

## What We Won't Do (keep it simple)
- No map view (would need `react-native-maps` — big dependency)
- No server-side geoqueries (would need GeoFirestore or Firestore GeoHash — complex)
- No background location — foreground only, on demand
- All sorting is client-side on the already-fetched page of businesses

## Files Changed
| File | Change |
|------|--------|
| `src/utils/location.ts` | **New** — location helpers |
| `app/business/add.tsx` | Geocode address → real coordinates on submit |
| `app/(tabs)/business.tsx` | "Near Me" toggle + distance sorting |
| `src/components/business/BusinessCard.tsx` | Optional distance badge |
| `public/privacy-policy.html` | Re-add location sections |

## Effort: ~30 minutes
Low effort because `expo-location` is already installed/configured, the `coordinates` field already exists in the data model, and all sorting is client-side.
