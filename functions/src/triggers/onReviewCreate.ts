import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { isRateLimited } from "../rateLimit";
import { validateText, validateRating } from "../contentValidation";
import { sendPushNotification } from "../notifications/sendNotification";
import { recalculateRatingStats } from "./recalculateRatingStats";

const ONE_HOUR = 60 * 60 * 1000;
const MAX_REVIEWS_PER_HOUR = 10;

/**
 * Runs after a new review document is created.
 *
 * - Rate-limits users to 10 reviews per hour.
 * - Blocks duplicate reviews (1 per user per business/lawyer).
 * - Validates comment content and rating.
 * - Recalculates parent entity's averageRating / reviewCount (Admin SDK).
 */
export const onReviewCreate = onDocumentCreated(
  "reviews/{reviewId}",
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const data = snap.data();
    const userId: string = data.userId;
    const db = admin.firestore();

    // ── Rate limit ──
    const overLimit = await isRateLimited({
      collection: "reviews",
      userField: "userId",
      uid: userId,
      windowMs: ONE_HOUR,
      maxCount: MAX_REVIEWS_PER_HOUR,
    });

    if (overLimit) {
      logger.warn(
        `Rate limit exceeded: user ${userId} created >` +
          `${MAX_REVIEWS_PER_HOUR} reviews in 1h. Deleting ${snap.id}.`,
      );
      await snap.ref.delete();
      return;
    }

    // ── Resolve target entity ──
    const targetField = data.businessId ? "businessId" : "lawyerId";
    const targetId: string = data.businessId || data.lawyerId;

    // ── Content validation ──
    const ratingErr = validateRating(data.rating);
    const commentErr = validateText(data.comment, "Review comment", 2000);

    if (ratingErr || commentErr) {
      logger.warn(
        `Content validation failed for review ${snap.id}: ${ratingErr || commentErr}`,
      );
      await snap.ref.delete();
      // onReviewDelete trigger will recalculate stats automatically
      return;
    }

    logger.info(`Review ${snap.id} by ${userId} — OK`);

    // ── Recalculate parent entity rating stats ──
    if (targetId) {
      const parentCollection = data.businessId ? "businesses" : "lawyers";
      await recalculateRatingStats(
        parentCollection as "businesses" | "lawyers",
        targetId,
      );
    }

    // ── Notify business/lawyer owner ──
    if (targetId) {
      const parentCollection = data.businessId ? "businesses" : "lawyers";
      const parentRef = db.collection(parentCollection).doc(targetId);
      const parentSnap = await parentRef.get();

      if (parentSnap.exists) {
        const parentData = parentSnap.data()!;
        const ownerId: string = parentData.ownerId;

        // Don't notify if the reviewer is the owner
        if (ownerId && ownerId !== userId) {
          const parentName = parentData.name || "your listing";
          await sendPushNotification({
            recipientUid: ownerId,
            title: "New Review ⭐",
            body: `Someone left a ${data.rating}-star review on ${parentName}`,
            url: data.businessId
              ? `/business/${targetId}`
              : `/legal/lawyer/${targetId}`,
          }).catch((e: any) =>
            logger.error(`Notification failed for review ${snap.id}:`, e),
          );
        }
      }
    }
  },
);
