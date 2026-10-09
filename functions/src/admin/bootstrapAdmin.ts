import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

/**
 * Bootstrap function to grant admin privileges to the FIRST user who calls it,
 * but ONLY if no admin exists yet.  This solves the chicken-and-egg problem:
 * you need an admin to create an admin.
 *
 * After you've called it once, it permanently refuses further calls.
 * Delete or comment out this export after initial setup for safety.
 */
export const bootstrapAdmin = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }

  // Check if ANY user already has admin claim by looking for a sentinel doc.
  const sentinelRef = admin.firestore().doc("_internal/adminBootstrapped");
  const sentinel = await sentinelRef.get();

  if (sentinel.exists) {
    throw new HttpsError(
      "already-exists",
      "Admin has already been bootstrapped. This function is disabled.",
    );
  }

  // Grant admin claim
  await admin.auth().setCustomUserClaims(request.auth.uid, { admin: true });

  // Write sentinel so this can never be called again
  await sentinelRef.set({
    adminUid: request.auth.uid,
    bootstrappedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  logger.info(
    `Admin bootstrapped: ${request.auth.uid} (${request.auth.token.email})`,
  );

  return {
    success: true,
    message: "You are now an admin. Sign out and back in for the claim to take effect.",
  };
});
