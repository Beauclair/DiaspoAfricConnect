import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

/**
 * Recalculates averageRating and reviewCount for a business or lawyer
 * by doing a full recount of all reviews.
 *
 * Uses Admin SDK so it bypasses Firestore security rules.
 * This is the ONLY path that writes averageRating / reviewCount.
 */
export async function recalculateRatingStats(
  entityCollection: "businesses" | "lawyers",
  entityId: string,
): Promise<void> {
  const db = admin.firestore();
  const parentRef = db.collection(entityCollection).doc(entityId);
  const parentSnap = await parentRef.get();

  if (!parentSnap.exists) {
    logger.warn(
      `recalculateRatingStats: ${entityCollection}/${entityId} not found — skipping`,
    );
    return;
  }

  const targetField = entityCollection === "businesses" ? "businessId" : "lawyerId";

  const reviewsSnap = await db
    .collection("reviews")
    .where(targetField, "==", entityId)
    .get();

  const count = reviewsSnap.size;
  const avg =
    count > 0
      ? reviewsSnap.docs.reduce((sum, d) => sum + (d.data().rating || 0), 0) /
        count
      : 0;

  await parentRef.update({
    averageRating: Math.round(avg * 10) / 10,
    reviewCount: count,
  });

  logger.info(
    `Rating stats updated for ${entityCollection}/${entityId}: ` +
      `avg=${Math.round(avg * 10) / 10}, count=${count}`,
  );
}
