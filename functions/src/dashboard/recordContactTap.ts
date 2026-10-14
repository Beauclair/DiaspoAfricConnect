import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

const VALID_TAP_TYPES = ["call", "website", "directions", "email", "save", "unsave"] as const;

/**
 * Records a contact tap (phone call, website visit, directions, email)
 * on a business or lawyer listing.
 *
 * - Requires authentication.
 * - Skips taps by the entity's own owner.
 * - No deduplication — each tap is a distinct user action.
 * - Increments `totalContactTaps` on the entity document.
 */
export const recordContactTap = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }

  const { entityType, entityId, tapType } = request.data as {
    entityType?: string;
    entityId?: string;
    tapType?: string;
  };

  if (!entityType || !["business", "lawyer"].includes(entityType)) {
    throw new HttpsError(
      "invalid-argument",
      'entityType must be "business" or "lawyer".',
    );
  }
  if (!entityId || typeof entityId !== "string") {
    throw new HttpsError("invalid-argument", "entityId is required.");
  }
  if (!tapType || !(VALID_TAP_TYPES as readonly string[]).includes(tapType)) {
    throw new HttpsError(
      "invalid-argument",
      `tapType must be one of: ${VALID_TAP_TYPES.join(", ")}.`,
    );
  }

  const visitorUid = request.auth.uid;
  const db = admin.firestore();
  const collectionName = entityType === "business" ? "businesses" : "lawyers";
  const entityRef = db.collection(collectionName).doc(entityId);

  // ── Verify entity exists & skip owner taps ──
  const entitySnap = await entityRef.get();
  if (!entitySnap.exists) {
    throw new HttpsError("not-found", `${entityType} not found.`);
  }

  const ownerId: string | undefined = entitySnap.data()?.ownerId;
  if (ownerId === visitorUid) {
    return { recorded: false };
  }

  // ── Increment counter ──
  const updates: Record<string, any> = {};

  if (tapType === "save") {
    updates.totalSaves = admin.firestore.FieldValue.increment(1);
  } else if (tapType === "unsave") {
    updates.totalSaves = admin.firestore.FieldValue.increment(-1);
  } else {
    updates.totalContactTaps = admin.firestore.FieldValue.increment(1);
  }

  await entityRef.update(updates);

  logger.info(
    `Contact tap recorded: ${collectionName}/${entityId} ` +
      `type=${tapType} by ${visitorUid}`,
  );

  return { recorded: true };
});
