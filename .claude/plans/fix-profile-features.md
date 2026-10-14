# Fix 5 Broken Profile Menu Items

## Summary
All 5 profile menu items (`Saved Businesses`, `My Reviews`, `Notifications`, `Help & Support`, `About DiaspoAfricConnect`) have empty `onPress={() => {}}` handlers and no backing screens.

## Plan

### 1. Create `app/profile/_layout.tsx` — new profile Stack
- Follows identical pattern as `app/business/_layout.tsx` and `app/legal/_layout.tsx`
- Register `profile` as a Stack.Screen in `app/_layout.tsx`

### 2. Saved Businesses — `app/profile/saved-businesses.tsx`
- **Service**: Add `toggleSavedBusiness(uid, businessId)` and `getSavedBusinessIds(uid)` to `authService.ts` (uses the existing `savedBusinesses: string[]` field on the User doc)
- **Service**: Add `getBusinessesByIds(ids: string[])` to `businessService.ts` (fetch multiple businesses by ID)
- **Screen**: List of saved businesses (reuse the BusinessCard UI pattern from the business tab). Empty state if none saved. Tap navigates to `/business/[id]`. Unsave via swipe or icon.
- **Wire up**: `onPress={() => router.push('/profile/saved-businesses')}` in profile.tsx

### 3. My Reviews — `app/profile/my-reviews.tsx`
- **Service**: Add `getReviewsByUser(userId, cursor?)` to `reviewService.ts` — query `reviews` collection where `userId == uid`, ordered by `createdAt desc`, paginated
- **Screen**: List of user's reviews showing business/lawyer name, rating stars, comment, date. Tap navigates to the reviewed business/lawyer. Empty state if none.
- **Wire up**: `onPress={() => router.push('/profile/my-reviews')}` in profile.tsx

### 4. Notifications — `app/profile/notifications.tsx`
- **Approach**: Use Expo's `getPresentedNotificationsAsync()` to show notifications that have been delivered to the device. This doesn't require a new Firestore collection — it uses the device's notification tray.
- **Screen**: List delivered notifications with title, body, timestamp. Empty state with message "No notifications yet". 
- **Fallback**: If in Expo Go or no notifications module, show a message that notifications are available in the production build.
- **Wire up**: `onPress={() => router.push('/profile/notifications')}` in profile.tsx

### 5. Help & Support — `app/profile/help-support.tsx`
- **Static screen** following the same pattern as `privacy-policy.tsx`
- Content: FAQ section (common questions about the app), Contact section (email: `infos@weskillupcenter.com` with `Linking.openURL`), links to Privacy Policy & Terms of Service
- **Wire up**: `onPress={() => router.push('/profile/help-support')}` in profile.tsx

### 6. About DiaspoAfricConnect — `app/profile/about.tsx`
- **Static screen** following the same pattern as `privacy-policy.tsx`
- Content: App description, version (1.0.0 from app.config.js), mission statement, team/credits, links to Privacy Policy, Terms of Service, and contact email
- **Wire up**: `onPress={() => router.push('/profile/about')}` in profile.tsx

### 7. Analytics events
- Add new events to `analyticsEvents.ts`: `BUSINESS_SAVED`, `BUSINESS_UNSAVED`, `MY_REVIEWS_VIEWED`, `NOTIFICATIONS_VIEWED`, `HELP_VIEWED`, `ABOUT_VIEWED`

### Files to create (6):
1. `app/profile/_layout.tsx`
2. `app/profile/saved-businesses.tsx`
3. `app/profile/my-reviews.tsx`
4. `app/profile/notifications.tsx`
5. `app/profile/help-support.tsx`
6. `app/profile/about.tsx`

### Files to modify (5):
1. `app/_layout.tsx` — register `profile` stack screen
2. `app/(tabs)/profile.tsx` — update 5 onPress handlers to router.push
3. `src/services/authService.ts` — add toggleSavedBusiness, getSavedBusinessIds
4. `src/services/businessService.ts` — add getBusinessesByIds
5. `src/services/reviewService.ts` — add getReviewsByUser
6. `src/constants/analyticsEvents.ts` — add new events
