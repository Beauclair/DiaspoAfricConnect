import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { isRateLimited } from "../rateLimit";
import { validateText } from "../contentValidation";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
const MAX_LAWYERS_PER_DAY = 3;

/**
 * Runs after a new lawyer document is created.
 *
 * - Rate-limits users to 3 lawyer registrations per 24 hours.
 * - Validates name content.
 */
export const onLawyerCreate = onDocumentCreated(
  "lawyers/{lawyerId}",
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const data = snap.data();
    const ownerId: string = data.ownerId;

    // ── Rate limit ──
    const overLimit = await isRateLimited({
      collection: "lawyers",
      userField: "ownerId",
      uid: ownerId,
      windowMs: TWENTY_FOUR_HOURS,
      maxCount: MAX_LAWYERS_PER_DAY,
    });

    if (overLimit) {
      logger.warn(
        `Rate limit exceeded: user ${ownerId} tried to register >` +
          `${MAX_LAWYERS_PER_DAY} lawyers in 24h. Deleting ${snap.id}.`,
      );
      await snap.ref.delete();
      return;
    }

    // ── Content validation ──
    const nameErr = validateText(data.name, "Lawyer name", 200);

    if (nameErr) {
      logger.warn(
        `Content validation failed for lawyer ${snap.id}: ${nameErr}`,
      );
      await snap.ref.delete();
      return;
    }

    logger.info(`Lawyer ${snap.id} registered by ${ownerId} — OK`);
  },
);
