import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { isRateLimited } from "../rateLimit";
import { sendPushNotification } from "../notifications/sendNotification";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
const MAX_VERIFICATION_REQUESTS_PER_DAY = 5;

/**
 * Runs after a new verification request document is created.
 *
 * - Rate-limits users to 5 verification requests per 24 hours.
 */
export const onVerificationRequestCreate = onDocumentCreated(
  "verificationRequests/{requestId}",
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const data = snap.data();
    const submittedBy: string = data.submittedBy;

    // ── Rate limit ──
    const overLimit = await isRateLimited({
      collection: "verificationRequests",
      userField: "submittedBy",
      uid: submittedBy,
      windowMs: TWENTY_FOUR_HOURS,
      maxCount: MAX_VERIFICATION_REQUESTS_PER_DAY,
    });

    if (overLimit) {
      logger.warn(
        `Rate limit exceeded: user ${submittedBy} submitted >` +
          `${MAX_VERIFICATION_REQUESTS_PER_DAY} verification requests in 24h. ` +
          `Deleting ${snap.id}.`,
      );
      await snap.ref.delete();
      return;
    }

    logger.info(
      `Verification request ${snap.id} by ${submittedBy} for ` +
        `${data.entityType} "${data.entityName}" — OK`,
    );

    // ── Notify all admins ──
    const entityName = data.entityName || "a listing";
    const entityType = data.entityType === "business" ? "business" : "lawyer";

    try {
      // Find users with admin custom claims by listing all users.
      // For a small user base this is fine; for scale, maintain an "admins" collection.
      const listResult = await admin.auth().listUsers(100);
      const adminUids = listResult.users
        .filter((u) => u.customClaims?.admin === true)
        .map((u) => u.uid);

      await Promise.allSettled(
        adminUids.map((uid) =>
          sendPushNotification({
            recipientUid: uid,
            title: "New Verification Request 📋",
            body: `${entityName} (${entityType}) needs verification review`,
          }),
        ),
      );
    } catch (e: any) {
      logger.error(`Failed to notify admins for verification ${snap.id}:`, e);
    }
  },
);
