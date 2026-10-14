import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;

/**
 * Records a profile view on a business or lawyer listing.
 *
 * - Authenticated users: dedup 1 view per hour (tracked via `_viewLog/{uid}`).
 * - Anonymous users: must provide a `deviceId`; dedup 1 view per day
 *   (tracked via `_viewLog/device_{deviceId}`).
 * - Skips views by the entity's own owner (authenticated only).
 * - Increments `totalViews` on the entity document.
 */
export const recordProfileView = onCall(async (request) => {
  const { entityType, entityId, deviceId } = request.data as {
    entityType?: string;
    entityId?: string;
    deviceId?: string;
  };

  // Must be authenticated OR provide a deviceId
  const visitorUid = request.auth?.uid;
  if (!visitorUid && !deviceId) {
    throw new HttpsError(
      "unauthenticated",
      "Sign in or provide a deviceId.",
    );
  }

  if (!entityType || !["business", "lawyer"].includes(entityType)) {
    throw new HttpsError(
      "invalid-argument",
      'entityType must be "business" or "lawyer".',
    );
  }
  if (!entityId || typeof entityId !== "string") {
    throw new HttpsError("invalid-argument", "entityId is required.");
  }

  const db = admin.firestore();
  const collectionName = entityType === "business" ? "businesses" : "lawyers";
  const entityRef = db.collection(collectionName).doc(entityId);

  // ── Verify entity exists & skip owner views ──
  const entitySnap = await entityRef.get();
  if (!entitySnap.exists) {
    throw new HttpsError("not-found", `${entityType} not found.`);
  }

  const ownerId: string | undefined = entitySnap.data()?.ownerId;
  if (visitorUid && ownerId === visitorUid) {
    return { counted: false };
  }

  // ── Deduplication ──
  // Authenticated users: keyed by uid, 1-hour window
  // Anonymous users: keyed by device_{deviceId}, 24-hour window
  const isAnonymous = !visitorUid;
  const viewLogKey = visitorUid ? visitorUid : `device_${deviceId}`;
  const dedupWindow = isAnonymous ? ONE_DAY : ONE_HOUR;

  const viewLogRef = entityRef.collection("_viewLog").doc(viewLogKey);
  const viewLogSnap = await viewLogRef.get();

  if (viewLogSnap.exists) {
    const lastViewed = viewLogSnap.data()?.lastViewed?.toMillis?.() ?? 0;
    if (Date.now() - lastViewed < dedupWindow) {
      return { counted: false };
    }
  }

  // ── Record the view ──
  const batch = db.batch();
  batch.set(viewLogRef, {
    lastViewed: admin.firestore.FieldValue.serverTimestamp(),
    ...(isAnonymous ? { anonymous: true } : {}),
  });
  batch.update(entityRef, {
    totalViews: admin.firestore.FieldValue.increment(1),
  });
  await batch.commit();

  const viewer = visitorUid ?? `device:${deviceId?.slice(0, 8)}`;
  logger.info(
    `Profile view recorded: ${collectionName}/${entityId} by ${viewer}`,
  );

  return { counted: true };
});
