import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { isRateLimited } from "../rateLimit";
import { validateText } from "../contentValidation";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
const MAX_BUSINESSES_PER_DAY = 5;

/**
 * Runs after a new business document is created.
 *
 * - Rate-limits users to 5 businesses per 24 hours.
 * - Validates name/description content.
 *
 * If the check fails the document is deleted.
 */
export const onBusinessCreate = onDocumentCreated(
  "businesses/{businessId}",
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const data = snap.data();
    const ownerId: string = data.ownerId;

    // ── Rate limit ──
    const overLimit = await isRateLimited({
      collection: "businesses",
      userField: "ownerId",
      uid: ownerId,
      windowMs: TWENTY_FOUR_HOURS,
      maxCount: MAX_BUSINESSES_PER_DAY,
    });

    if (overLimit) {
      logger.warn(
        `Rate limit exceeded: user ${ownerId} tried to create >` +
          `${MAX_BUSINESSES_PER_DAY} businesses in 24h. Deleting ${snap.id}.`,
      );
      await snap.ref.delete();
      return;
    }

    // ── Content validation ──
    const nameErr = validateText(data.name, "Business name", 200);
    const descErr = validateText(data.description, "Description", 2000);

    if (nameErr || descErr) {
      logger.warn(
        `Content validation failed for business ${snap.id}: ${nameErr || descErr}`,
      );
      await snap.ref.delete();
      return;
    }

    logger.info(`Business ${snap.id} created by ${ownerId} — OK`);
  },
);
