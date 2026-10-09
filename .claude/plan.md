# Plan: Email Verification on Sign Up

## Problem
Users can create accounts with fake emails. No verification step exists.

## Approach
Use Firebase's built-in `sendEmailVerification()` to require email verification before users can access the app.

## Flow

### Sign Up
1. Account is created normally (Firebase requires a signed-in user to send verification)
2. `sendEmailVerification(user)` is called immediately after account creation
3. User is redirected to a new **Verify Email** screen instead of home

### Verify Email Screen (`app/(auth)/verify-email.tsx`)
- Shows a mail icon, the user's email, and instructions to check their inbox
- **"Resend Email"** button (with cooldown to prevent spam)
- **"I've Verified My Email"** button → calls `user.reload()` then checks `user.emailVerified`
  - If verified → navigate to home
  - If not → show error "Email not yet verified"
- **"Sign Out"** link to go back to login

### Login Gate
- In `app/_layout.tsx` (`InnerLayout`): after auth resolves, if `user` exists but `user.emailVerified === false`, redirect to the verify-email screen
- This catches returning users who haven't verified yet

### Login Screen
- After successful sign-in, check `user.emailVerified` — if false, redirect to verify-email instead of home

## Files to Change

1. **`src/services/authService.ts`**
   - Import `sendEmailVerification` from Firebase Auth
   - Call it at the end of `signUp()` after profile creation
   - Add `resendVerificationEmail()` helper

2. **`app/(auth)/verify-email.tsx`** (NEW)
   - Verification pending screen with resend + check buttons
   - Styled consistently with login/signup screens

3. **`app/(auth)/_layout.tsx`**
   - Add `verify-email` route to the Stack

4. **`app/(auth)/signup.tsx`**
   - Change redirect from `/(tabs)/home` to `/(auth)/verify-email`

5. **`app/(auth)/login.tsx`**
   - After successful login, check `emailVerified` — route to verify-email if false

6. **`app/_layout.tsx`**
   - In `InnerLayout`, add effect: if `user && !user.emailVerified`, redirect to verify-email
