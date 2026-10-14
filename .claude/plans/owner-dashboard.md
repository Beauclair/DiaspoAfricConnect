# Owner Dashboard — Implementation Plan

## Overview
Add an activity dashboard for business and lawyer owners showing profile views, contact taps, saves, and review stats. Only visible to users who own at least one business or attorney profile.

## Architecture

### Data Collection (Cloud Functions)
Instead of relying on PostHog analytics (complex to query from the app), we'll use **Firestore counters** updated by Cloud Functions (Admin SDK). This gives real-time data with zero client-side trust issues.

**New Cloud Function: `functions/src/triggers/onProfileView.ts`**
- An HTTPS callable function that the client calls when viewing a business/lawyer detail page
- Increments counters on the entity document itself
- Rate-limited: 1 counted view per user per entity per hour (prevent refresh-spam)
- Uses a lightweight `_viewLog` subcollection to track recent views for dedup

**Stats fields added to Business & Lawyer docs** (written by Admin SDK only):
```
totalViews: number
totalContactTaps: number      // phone + email + website + directions combined
totalSaves: number
viewsThisWeek: number         // reset weekly by a scheduled function (future)
```

**New Cloud Function: `functions/src/triggers/onContactTap.ts`**
- Callable function for recording contact taps (call, website, directions, email)
- Increments `totalContactTaps` on the entity

**New Cloud Function: `functions/src/triggers/onSaveChange.ts`**
- Triggered when a user updates their `savedBusinesses` array
- Increments/decrements `totalSaves` on the affected business doc

### Frontend

**New files:**
1. `app/profile/dashboard.tsx` — The main dashboard screen
2. `src/services/dashboardService.ts` — Service to call the Cloud Functions + fetch stats

**Modified files:**
3. `app/(tabs)/profile.tsx` — Add "Dashboard" menu item (only shown to owners)
4. `app/business/[id].tsx` — Call `recordProfileView()` on load (instead of just analytics)
5. `app/legal/lawyer/[id].tsx` — Same: call `recordProfileView()` on load
6. `src/types/index.ts` — Add stat fields to Business and Lawyer interfaces
7. `src/constants/analyticsEvents.ts` — Add `DASHBOARD_VIEWED` event
8. `firestore.rules` — No changes needed (stats written by Admin SDK only)
9. `functions/src/index.ts` — Export new functions

## Dashboard Screen Design

```
┌─────────────────────────────────────┐
│  ← Activity Dashboard               │
├─────────────────────────────────────┤
│                                     │
│  Select Listing:                    │
│  ┌─────────────────────────────────┐│
│  │ 🏪 My Restaurant          ▾   ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │ 👁 Views │  │ ⭐ Rating│        │
│  │   342    │  │   4.5    │        │
│  └──────────┘  └──────────┘        │
│  ┌──────────┐  ┌──────────┐        │
│  │ 📞 Taps  │  │ 🔖 Saves│        │
│  │    28    │  │   15    │        │
│  └──────────┘  └──────────┘        │
│                                     │
│  ┌──────────┐                       │
│  │ 📝 Reviews│                      │
│  │    12    │                       │
│  └──────────┘                       │
│                                     │
│  Recent Activity                    │
│  ─────────────                      │
│  ⭐ New 5-star review        2h ago│
│  👁 3 profile views today          │
│  📞 Someone called you      1d ago │
│                                     │
└─────────────────────────────────────┘
```

## Implementation Steps (in order)

### Step 1: Types
- Add `totalViews`, `totalContactTaps`, `totalSaves` to `Business` and `Lawyer` interfaces (optional fields, default 0)

### Step 2: Cloud Functions
- `recordProfileView` — callable, increments view count with dedup
- `recordContactTap` — callable, increments contact tap count
- Both use `FieldValue.increment(1)` on the entity doc
- Dedup via a `_viewLog/{visitorUid}` subcollection doc with a TTL timestamp

### Step 3: Dashboard Service
- `getOwnerStats(entityType, entityId)` — reads stats from the entity doc
- `getOwnerListings(uid)` — fetches all businesses + lawyers owned by user
- `recordProfileView(entityType, entityId)` — calls the Cloud Function
- `recordContactTap(entityType, entityId, tapType)` — calls the Cloud Function

### Step 4: Dashboard Screen
- Picker to select which listing to view stats for
- 5 stat cards in a 2×2+1 grid (views, rating, taps, saves, reviews)
- Pull-to-refresh
- Only accessible if user owns at least one listing

### Step 5: Wire Up View & Contact Tracking
- In `business/[id].tsx`: call `recordProfileView('business', id)` when a non-owner views
- In `legal/lawyer/[id].tsx`: same for lawyers
- In contact tap handlers (phone, website, directions): call `recordContactTap()`

### Step 6: Profile Menu
- Add "Dashboard" menu item with `dashboard` icon, between "My Attorney Profiles" and "Saved Businesses"
- Only show when user has `isOwner` flag (check on mount: does user own any businesses or lawyers)

### Step 7: Deploy & Index
- Deploy Cloud Functions
- Deploy Firestore indexes if needed
- No new composite indexes required (stats are on entity docs)

## Simplification Decisions
- **No time-series charts** in v1 — just totals. Charts can be added later with a `dailyStats` subcollection.
- **No "views this week"** counter in v1 — would need a scheduled Cloud Function. Total views is enough to start.
- **Save count**: Instead of a trigger on user doc changes (complex to diff arrays), we'll increment/decrement directly in the `toggleSavedBusiness` flow via a callable.
- **Dedup views**: Simple approach — one `_viewLog` doc per visitor with a `lastViewed` timestamp. If <1 hour old, skip the increment.
