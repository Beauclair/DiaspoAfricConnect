import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { sendPushNotification } from "../notifications/sendNotification";

const db = admin.firestore();

/**
 * Admin-only callable function to review (approve / reject) a verification
 * request.  Updates both the request document and the target entity
 * (business or lawyer) in a single atomic batch.
 *
 * Caller must have the custom claim `admin: true` set on their Firebase Auth
 * account.  Set it once from the Firebase console or via a script:
 *
 *   admin.auth().setCustomUserClaims(uid, { admin: true });
 *
 * Parameters (passed as `data`):
 *   requestId  – ID of the verificationRequests document
 *   decision   – "approved" | "rejected"
 *   reason     – optional human-readable note (stored on rejection)
 */
export const reviewVerificationRequest = onCall(async (request) => {
  // ── Auth check ──
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }
  if (!request.auth.token.admin) {
    throw new HttpsError(
      "permission-denied",
      "Only admins can review verification requests.",
    );
  }

  const { requestId, decision, reason } = request.data as {
    requestId?: string;
    decision?: string;
    reason?: string;
  };

  // ── Input validation ──
  if (!requestId || typeof requestId !== "string") {
    throw new HttpsError("invalid-argument", "requestId is required.");
  }
  if (decision !== "approved" && decision !== "rejected") {
    throw new HttpsError(
      "invalid-argument",
      'decision must be "approved" or "rejected".',
    );
  }

  // ── Load the request ──
  const requestRef = db.collection("verificationRequests").doc(requestId);
  const requestSnap = await requestRef.get();

  if (!requestSnap.exists) {
    throw new HttpsError("not-found", "Verification request not found.");
  }

  const data = requestSnap.data()!;
  if (data.status !== "pending") {
    throw new HttpsError(
      "failed-precondition",
      `Request is already "${data.status}", cannot review again.`,
    );
  }

  // ── Resolve target entity ──
  const entityCollection =
    data.entityType === "business" ? "businesses" : "lawyers";
  const entityRef = db.collection(entityCollection).doc(data.entityId);

  const newEntityStatus = decision === "approved" ? "verified" : "rejected";

  // ── Atomic batch update ──
  const batch = db.batch();

  batch.update(requestRef, {
    status: decision === "approved" ? "approved" : "rejected",
    reviewedBy: request.auth.uid,
    reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
    ...(reason ? { reason } : {}),
  });

  batch.update(entityRef, {
    verificationStatus: newEntityStatus,
    ...(decision === "approved" ? { isVerified: true } : {}),
  });

  await batch.commit();

  logger.info(
    `Verification request ${requestId} ${decision} by admin ${request.auth.uid}. ` +
      `${data.entityType} ${data.entityId} → ${newEntityStatus}.`,
  );

  // ── Notify the entity owner ──
  const entityName = data.entityName || "your listing";
  const entityUrl =
    data.entityType === "business"
      ? `/business/${data.entityId}`
      : `/legal/lawyer/${data.entityId}`;

  if (decision === "approved") {
    await sendPushNotification({
      recipientUid: data.submittedBy,
      title: "Verified ✅",
      body: `${entityName} has been verified!`,
      url: entityUrl,
    }).catch((e: any) =>
      logger.error(`Notification failed for verification ${requestId}:`, e),
    );
  } else {
    await sendPushNotification({
      recipientUid: data.submittedBy,
      title: "Verification Update",
      body: `Your verification request for ${entityName} was declined${reason ? ": " + reason : ""}`,
      url: entityUrl,
    }).catch((e: any) =>
      logger.error(`Notification failed for verification ${requestId}:`, e),
    );
  }

  return {
    success: true,
    entityType: data.entityType,
    entityId: data.entityId,
    entityName: data.entityName,
    newStatus: newEntityStatus,
  };
});
