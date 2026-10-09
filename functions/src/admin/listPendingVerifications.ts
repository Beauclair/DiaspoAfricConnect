import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Admin-only callable function that returns all pending verification requests.
 *
 * Returns an array of objects:
 *   { id, entityType, entityId, entityName, submittedBy, phone,
 *     barAssociationNumber?, submittedAt }
 */
export const listPendingVerifications = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }
  if (!request.auth.token.admin) {
    throw new HttpsError(
      "permission-denied",
      "Only admins can list verification requests.",
    );
  }

  const snapshot = await db
    .collection("verificationRequests")
    .where("status", "==", "pending")
    .orderBy("submittedAt", "asc")
    .get();

  return snapshot.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      entityType: d.entityType,
      entityId: d.entityId,
      entityName: d.entityName,
      submittedBy: d.submittedBy,
      phone: d.phone,
      ...(d.barAssociationNumber
        ? { barAssociationNumber: d.barAssociationNumber }
        : {}),
      submittedAt: d.submittedAt?.toDate?.()?.toISOString() ?? null,
    };
  });
});
