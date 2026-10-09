import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

/**
 * Callable Cloud Function that permanently deletes a user's account
 * and all associated data (businesses, lawyers, verification requests).
 *
 * Reviews the user wrote are **anonymized** ("Deleted User") rather than
 * deleted, so business/lawyer ratings stay accurate — this is the standard
 * practice used by Yelp, Google, TripAdvisor, etc.
 *
 * Reviews left **on** the user's businesses/lawyers are deleted together
 * with those entities (orphaned reviews make no sense).
 *
 * Must be called by the authenticated user who owns the account.
 */
export const deleteAccount = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }

  const uid = request.auth.uid;
  const db = admin.firestore();

  logger.info(`Account deletion requested by ${uid} (${request.auth.token.email})`);

  try {
    // ── 1. Delete businesses owned by this user ──────────────────────
    //    Also delete reviews left on those businesses (they'd be orphaned).
    const businessSnap = await db
      .collection("businesses")
      .where("ownerId", "==", uid)
      .get();

    for (const bizDoc of businessSnap.docs) {
      // Delete all reviews on this business
      const bizReviews = await db
        .collection("reviews")
        .where("businessId", "==", bizDoc.id)
        .get();

      await deleteDocs(db, bizReviews.docs);
      logger.info(`Deleted ${bizReviews.size} reviews on business ${bizDoc.id}`);
    }

    await deleteDocs(db, businessSnap.docs);
    logger.info(`Deleted ${businessSnap.size} businesses for ${uid}`);

    // ── 2. Delete lawyers owned by this user ─────────────────────────
    //    Also delete reviews left on those lawyers.
    const lawyerSnap = await db
      .collection("lawyers")
      .where("ownerId", "==", uid)
      .get();

    for (const lawDoc of lawyerSnap.docs) {
      const lawReviews = await db
        .collection("reviews")
        .where("lawyerId", "==", lawDoc.id)
        .get();

      await deleteDocs(db, lawReviews.docs);
      logger.info(`Deleted ${lawReviews.size} reviews on lawyer ${lawDoc.id}`);
    }

    await deleteDocs(db, lawyerSnap.docs);
    logger.info(`Deleted ${lawyerSnap.size} lawyers for ${uid}`);

    // ── 3. Anonymize reviews this user wrote on OTHER entities ────────
    //    Keep the rating & comment so averages stay accurate; wipe identity.
    const userReviews = await db
      .collection("reviews")
      .where("userId", "==", uid)
      .get();

    const entitiesToRecalc = new Set<string>(); // "businesses/abc" or "lawyers/xyz"

    if (!userReviews.empty) {
      const batches: admin.firestore.WriteBatch[] = [];
      let batch = db.batch();
      let opCount = 0;

      for (const reviewDoc of userReviews.docs) {
        const data = reviewDoc.data();
        batch.update(reviewDoc.ref, {
          userId: "deleted",
          userName: "Deleted User",
        });
        opCount++;

        // Track parent entity for rating recalc isn't needed here since
        // we're not changing the rating, but note the entity for logging.
        if (data.businessId) entitiesToRecalc.add(`businesses/${data.businessId}`);
        if (data.lawyerId) entitiesToRecalc.add(`lawyers/${data.lawyerId}`);

        if (opCount >= 500) {
          batches.push(batch);
          batch = db.batch();
          opCount = 0;
        }
      }
      if (opCount > 0) batches.push(batch);
      await Promise.all(batches.map((b) => b.commit()));

      logger.info(`Anonymized ${userReviews.size} reviews written by ${uid}`);
    }

    // ── 4. Delete verification requests ──────────────────────────────
    const verifySnap = await db
      .collection("verificationRequests")
      .where("submittedBy", "==", uid)
      .get();

    await deleteDocs(db, verifySnap.docs);
    logger.info(`Deleted ${verifySnap.size} verification requests for ${uid}`);

    // ── 5. Delete user profile ───────────────────────────────────────
    const userRef = db.doc(`users/${uid}`);
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      await userRef.delete();
      logger.info(`Deleted user profile for ${uid}`);
    }

    // ── 6. Delete Firebase Auth account ──────────────────────────────
    await admin.auth().deleteUser(uid);
    logger.info(`Deleted Firebase Auth account for ${uid}`);

    return { success: true };
  } catch (error: any) {
    logger.error(`Account deletion failed for ${uid}:`, error);
    throw new HttpsError(
      "internal",
      "Failed to delete account. Please try again or contact support.",
    );
  }
});

/**
 * Batch-delete an array of Firestore document snapshots.
 * Handles the 500-operation limit per batch automatically.
 */
async function deleteDocs(
  db: admin.firestore.Firestore,
  docs: admin.firestore.QueryDocumentSnapshot[],
): Promise<void> {
  if (docs.length === 0) return;

  const batches: admin.firestore.WriteBatch[] = [];
  let batch = db.batch();
  let opCount = 0;

  for (const d of docs) {
    batch.delete(d.ref);
    opCount++;
    if (opCount >= 500) {
      batches.push(batch);
      batch = db.batch();
      opCount = 0;
    }
  }
  if (opCount > 0) batches.push(batch);
  await Promise.all(batches.map((b) => b.commit()));
}
