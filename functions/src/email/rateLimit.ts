import * as admin from "firebase-admin";

/**
 * Lightweight rate limiter for email sending.
 *
 * Tracks timestamps in a `_rateLimits` Firestore collection keyed by a
 * caller-chosen bucket (e.g. `"verify_email:<uid>"`).  Old entries are
 * pruned on every check so the documents don't grow forever.
 *
 * @returns `true` if the caller has EXCEEDED the limit (should be rejected).
 */
export async function isEmailRateLimited(
  bucket: string,
  maxCount: number,
  windowMs: number,
): Promise<boolean> {
  const db = admin.firestore();
  const ref = db.collection("_rateLimits").doc(bucket);
  const now = Date.now();
  const cutoff = now - windowMs;

  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data();
    const timestamps: number[] = (data?.timestamps ?? []).filter(
      (t: number) => t > cutoff,
    );

    if (timestamps.length >= maxCount) {
      return true; // over limit
    }

    timestamps.push(now);
    tx.set(ref, { timestamps, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    return false;
  });

  return result;
}
