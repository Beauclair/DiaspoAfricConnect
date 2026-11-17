import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { isRateLimited } from "../rateLimit";
import { validateText } from "../contentValidation";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
const MAX_BUSINESSES_PER_DAY = 5;

const LISTING_BASE_URL = "https://diaspoafricconnect.web.app/business";

/**
 * Runs after a new business document is created.
 *
 * - Rate-limits users to 5 businesses per 24 hours.
 * - Validates name/description content.
 * - Sends a branded registration confirmation email with a shareable link.
 *
 * If the rate-limit or content check fails the document is deleted.
 */
export const onBusinessCreate = onDocumentCreated(
  {
    document: "businesses/{businessId}",
    secrets: ["SMTP_HOST", "SMTP_PORT", "SMTP_EMAIL", "SMTP_PASSWORD"],
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const data = snap.data();
    const ownerId: string = data.ownerId;

    // ── Rate limit ──
    try {
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
    } catch (rateLimitErr: any) {
      // If the rate-limit query fails (e.g. missing index), log but continue
      // so the business creation and confirmation email are not blocked.
      logger.error(
        `Rate limit check failed for business ${snap.id} — skipping:`,
        rateLimitErr,
      );
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

    // ── Send confirmation email (best-effort — failures don't block creation) ──
    try {
      const userRecord = await admin.auth().getUser(ownerId);
      const email = userRecord.email;
      if (!email) {
        logger.info(`No email for user ${ownerId} — skipping confirmation email`);
        return;
      }

      // Dynamic imports to avoid loading nodemailer at module scope,
      // which causes initialization timeouts during deployment.
      const { sendEmail } = await import("../email/transporter");
      const { businessRegistrationEmailHtml } = await import("../email/templates");

      const ownerName = userRecord.displayName || "there";
      const businessName = data.name || "Your business";
      const category = data.category || "other";
      const city = data.city || "";
      const listingUrl = `${LISTING_BASE_URL}/${snap.id}`;

      const html = businessRegistrationEmailHtml(
        ownerName,
        businessName,
        category,
        city,
        listingUrl,
      );

      await sendEmail(
        email,
        `Your business "${businessName}" is now on DiaspoAfricConnect! 🎉`,
        html,
      );

      logger.info(`Registration confirmation email sent to ${email} for business ${snap.id}`);
    } catch (error: any) {
      // Email failure is non-critical — log and move on
      logger.error(
        `Failed to send registration email for business ${snap.id}:`,
        error,
      );
    }
  },
);
