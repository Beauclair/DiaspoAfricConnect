import { onDocumentDeleted } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { recalculateRatingStats } from "./recalculateRatingStats";

/**
 * Runs after a review document is deleted.
 *
 * Recalculates the parent entity's averageRating and reviewCount
 * so stats stay accurate after review removal.
 */
export const onReviewDelete = onDocumentDeleted(
  "reviews/{reviewId}",
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const data = snap.data();
    const targetId: string = data.businessId || data.lawyerId;

    if (!targetId) {
      logger.warn(`Deleted review ${snap.id} had no businessId or lawyerId — skipping stats recalc`);
      return;
    }

    const parentCollection = data.businessId ? "businesses" : "lawyers";

    await recalculateRatingStats(
      parentCollection as "businesses" | "lawyers",
      targetId,
    );

    logger.info(`Review ${snap.id} deleted — recalculated stats for ${parentCollection}/${targetId}`);
  },
);
