import { captureServiceError } from './sentryHelpers';

// ─── Firebase Auth error codes → user-friendly messages ───────────────────────

const AUTH_ERRORS: Record<string, string> = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/operation-not-allowed': 'This sign-in method is currently disabled.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
  'auth/user-disabled': 'This account has been disabled. Contact support.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-credential': 'Invalid email or password. Please try again.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/requires-recent-login': 'Please log out and log back in to perform this action.',
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
};

// ─── Firestore error codes → user-friendly messages ───────────────────────────

const FIRESTORE_ERRORS: Record<string, string> = {
  'permission-denied': 'You don\'t have permission to do this. Please log in and try again.',
  'not-found': 'The requested item was not found. It may have been deleted.',
  'already-exists': 'This item already exists.',
  'resource-exhausted': 'Too many requests. Please wait a moment and try again.',
  'failed-precondition': 'This action can\'t be completed right now. Please try again later.',
  'unavailable': 'The service is temporarily unavailable. Check your connection and try again.',
  'deadline-exceeded': 'The request timed out. Check your connection and try again.',
  'cancelled': 'The request was cancelled.',
  'unauthenticated': 'You need to be logged in to do this.',
  'data-loss': 'Something went wrong on our end. Please try again.',
  'internal': 'A server error occurred. Please try again later.',
};

// ─── Cloud Functions error codes (callable) ───────────────────────────────────

const FUNCTIONS_ERRORS: Record<string, string> = {
  'functions/not-found': 'This feature is temporarily unavailable.',
  'functions/permission-denied': 'You don\'t have permission to do this.',
  'functions/unauthenticated': 'Please log in to continue.',
  'functions/resource-exhausted': 'Too many requests. Please wait and try again.',
  'functions/internal': 'A server error occurred. Please try again later.',
  'functions/unavailable': 'The service is temporarily unavailable. Try again shortly.',
};

// ─── Network detection ────────────────────────────────────────────────────────

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message === 'Network request failed') return true;
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('network') ||
      msg.includes('fetch') ||
      msg.includes('timeout') ||
      msg.includes('econnrefused') ||
      msg.includes('enotfound')
    );
  }
  return false;
}

const NETWORK_MESSAGE = 'No internet connection. Please check your network and try again.';

// ─── Main resolver ────────────────────────────────────────────────────────────

/**
 * Turn any caught error into a user-friendly message.
 *
 * Also reports non-trivial errors to Sentry (skips validation/auth-input mistakes).
 *
 * @param error     The caught value (usually `Error`, but could be anything)
 * @param context   Where it happened, e.g. "addBusiness" — used for Sentry tags
 * @param fallback  Optional custom fallback message (default generic)
 */
export function getUserMessage(
  error: unknown,
  context: string = 'unknown',
  fallback: string = 'Something went wrong. Please try again.',
): string {
  // ── Network ──
  if (isNetworkError(error)) {
    return NETWORK_MESSAGE;
  }

  // ── Firebase / Firestore / Functions errors carry a `code` property ──
  const code = getErrorCode(error);
  if (code) {
    // Auth errors
    if (code.startsWith('auth/')) {
      const mapped = AUTH_ERRORS[code];
      if (mapped) return mapped;
    }

    // Cloud Functions errors
    if (code.startsWith('functions/')) {
      const mapped = FUNCTIONS_ERRORS[code];
      if (mapped) {
        // Report server errors to Sentry
        if (code === 'functions/internal' || code === 'functions/unavailable') {
          captureServiceError(error, 'cloudFunctions', context);
        }
        return mapped;
      }
    }

    // Firestore errors (code without prefix)
    const firestoreMsg = FIRESTORE_ERRORS[code];
    if (firestoreMsg) {
      // Report server-side Firestore errors
      if (['internal', 'data-loss', 'unavailable'].includes(code)) {
        captureServiceError(error, 'firestore', context);
      }
      return firestoreMsg;
    }
  }

  // ── Thrown strings or Error with a useful message ──
  const rawMessage = error instanceof Error ? error.message : String(error || '');
  if (rawMessage && rawMessage !== '[object Object]') {
    // Report unexpected errors to Sentry (not user-input validation)
    captureServiceError(error, 'app', context);
    // Don't expose raw Firebase internals to user — use fallback
    if (rawMessage.includes('Firebase') || rawMessage.includes('firestore') || rawMessage.includes('INTERNAL')) {
      return fallback;
    }
    return rawMessage;
  }

  captureServiceError(error, 'app', context);
  return fallback;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract a `.code` string from Firebase error objects. */
function getErrorCode(error: unknown): string | null {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as any).code;
    return typeof code === 'string' ? code : null;
  }
  return null;
}

/** Quick check if the error is a permission / auth issue (useful for redirect logic). */
export function isAuthError(error: unknown): boolean {
  const code = getErrorCode(error);
  if (!code) return false;
  return (
    code.startsWith('auth/') ||
    code === 'permission-denied' ||
    code === 'unauthenticated' ||
    code === 'functions/unauthenticated' ||
    code === 'functions/permission-denied'
  );
}
