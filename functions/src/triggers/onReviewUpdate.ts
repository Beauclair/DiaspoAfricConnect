import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { validateText, validateRating } from "../contentValidation";
import { sendPushNotification } from "../notifications/sendNotification";
import { recalculateRatingStats } from "./recalculateRatingStats";

/**
 * Runs after a review document is updated.
 *
 * Re-validates comment, rating, and ownerResponse — if content fails
 * validation, revert the changed fields to their previous values.
 * Recalculates parent entity rating if the rating changed.
 */
export const onReviewUpdate = onDocumentUpdated(
  "reviews/{reviewId}",
  async (event) => {
    const before = event.data?.before;
    const after = event.data?.after;
    if (!before || !after) return;

    const oldData = before.data();
    const newData = after.data();

    const commentChanged = newData.comment !== oldData.comment;
    const ratingChanged = newData.rating !== oldData.rating;
    const responseChanged = newData.ownerResponse !== oldData.ownerResponse;

    if (!commentChanged && !ratingChanged && !responseChanged) return;

    const revert: Record<string, unknown> = {};

    if (commentChanged) {
      const err = validateText(newData.comment, "Review comment", 2000);
      if (err) {
        logger.warn(`Review ${after.id} update rejected (comment): ${err}`);
        revert.comment = oldData.comment;
      }
    }

    if (ratingChanged) {
      const err = validateRating(newData.rating);
      if (err) {
        logger.warn(`Review ${after.id} update rejected (rating): ${err}`);
        revert.rating = oldData.rating;
      }
    }

    if (responseChanged && newData.ownerResponse) {
      const err = validateText(newData.ownerResponse, "Owner response", 2000);
      if (err) {
        logger.warn(`Review ${after.id} update rejected (ownerResponse): ${err}`);
        revert.ownerResponse = oldData.ownerResponse ?? null;
        revert.ownerResponseAt = oldData.ownerResponseAt ?? null;
      }
    }

    if (Object.keys(revert).length > 0) {
      await after.ref.update(revert);
      logger.info(`Reverted fields [${Object.keys(revert).join(", ")}] on review ${after.id}`);
      return; // Content was invalid — don't notify or recalc
    }

    // ── Recalculate parent entity rating if rating changed ──
    if (ratingChanged) {
      const targetId: string = newData.businessId || newData.lawyerId;
      if (targetId) {
        const parentCollection = newData.businessId ? "businesses" : "lawyers";
        await recalculateRatingStats(
          parentCollection as "businesses" | "lawyers",
          targetId,
        );
      }
    }

    // ── Notify review author when owner responds ──
    if (
      responseChanged &&
      newData.ownerResponse &&
      !oldData.ownerResponse
    ) {
      const reviewAuthorUid: string = newData.userId;
      const targetId: string = newData.businessId || newData.lawyerId;
      const targetCollection = newData.businessId ? "businesses" : "lawyers";

      let entityName = "a listing";
      if (targetId) {
        const db = admin.firestore();
        const parentSnap = await db.collection(targetCollection).doc(targetId).get();
        if (parentSnap.exists) {
          entityName = parentSnap.data()?.name || entityName;
        }
      }

      const url = newData.businessId
        ? `/business/${targetId}`
        : `/legal/lawyer/${targetId}`;

      await sendPushNotification({
        recipientUid: reviewAuthorUid,
        title: "New Reply 💬",
        body: `${entityName} responded to your review`,
        url,
      }).catch((e: any) =>
        logger.error(`Notification failed for review response ${after.id}:`, e),
      );
    }
  },
);
