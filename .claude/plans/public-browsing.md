# Plan: Public Browsing Without Login

## Goal
Let unauthenticated users browse businesses and immigration content freely. Only require login when they try to contribute (add/edit/delete business, write review, access profile).

## Current Flow
- `app/index.tsx` redirects unauthenticated users to `/(auth)/login` — blocking all content
- Tabs (home, business, immigration, profile) are only reachable after login

## Changes

### 1. `app/index.tsx` — Always go to tabs
Remove the auth gate. Always redirect to `/(tabs)/home` (show a spinner while auth state initializes).

### 2. Create `src/utils/authGuard.ts` — Reusable auth-check helper
A small helper function that checks if user is logged in:
- If yes, run the callback action
- If no, show an Alert: "Sign in required — You need an account to do this. Sign in now?" with Cancel / Sign In buttons
- Sign In navigates to `/(auth)/login`

This avoids duplicating the check+alert logic in every screen.

### 3. `app/(tabs)/business.tsx` — Gate the "Add Business" buttons
- The FAB `+ Add Business` button and the empty-list `Add a Business` button: wrap their `onPress` with the auth guard
- Browsing the list remains fully public

### 4. `app/(tabs)/home.tsx` — Adjust welcome greeting
- Show "Welcome!" for anonymous users (already works: `user?.displayName` is null)
- No other changes needed — browsing featured businesses and guides is already public

### 5. `app/(tabs)/profile.tsx` — Show login prompt when not authenticated
- If `user` is null, render a "Sign in to access your profile" screen with Sign In / Sign Up buttons instead of the profile content
- If logged in, show the existing profile as-is

### 6. `app/business/add.tsx` — Redirect if not logged in
- At the top of the component, if `!user`, redirect to login (in case someone deep-links)

### 7. `app/business/edit.tsx` — Redirect if not logged in
- Same check as add.tsx

### 8. `app/business/my-businesses.tsx` — Redirect if not logged in
- Same check

### 9. `app/business/[id].tsx` — Gate owner actions and reviews
- Viewing the business detail stays public (no change)
- "Write a Review" button: wrap with auth guard
- Owner banner (edit/delete) already checks `isOwner` which requires `user`, so it's naturally hidden for anonymous users ✓

### 10. `app/(auth)/login.tsx` — Add "Continue as Guest" / back navigation
- After successful login, navigate to `/(tabs)/home` (already does this ✓)
- Add a "Continue without account" or back button so users who land on login from an auth guard can go back

### 11. `app/(auth)/signup.tsx` — Same guest option
- After successful signup, navigate to `/(tabs)/home` (already does this ✓)
- Add a "Continue without account" link

## Files Changed
1. `app/index.tsx`
2. `src/utils/authGuard.ts` (new)
3. `app/(tabs)/business.tsx`
4. `app/(tabs)/profile.tsx`
5. `app/business/add.tsx`
6. `app/business/edit.tsx`
7. `app/business/my-businesses.tsx`
8. `app/business/[id].tsx`
9. `app/(auth)/login.tsx`
10. `app/(auth)/signup.tsx`

## What stays the same
- Home tab — already works for anonymous
- Immigration tab — fully public, no auth references
- Business detail viewing — public
- Auth context, Firebase config — unchanged
