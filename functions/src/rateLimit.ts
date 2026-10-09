import * as admin from "firebase-admin";

/**
 * Check whether a user has exceeded the allowed write rate for a collection.
 *
 * @returns `true` if the user is OVER the limit (should be rejected).
 */
export async function isRateLimited(params: {
  /** Firestore collection name */
  collection: string;
  /** Field that stores the user/owner id */
  userField: string;
  /** The uid to check */
  uid: string;
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum allowed writes inside the window */
  maxCount: number;
}): Promise<boolean> {
  const { collection, userField, uid, windowMs, maxCount } = params;
  const db = admin.firestore();
  const cutoff = admin.firestore.Timestamp.fromMillis(Date.now() - windowMs);

  // Find a timestamp field — prefer createdAt, fall back to submittedAt
  const timestampField = collection === "verificationRequests"
    ? "submittedAt"
    : "createdAt";

  const snap = await db
    .collection(collection)
    .where(userField, "==", uid)
    .where(timestampField, ">", cutoff)
    .limit(maxCount + 1)
    .get();

  return snap.size > maxCount;
}
