import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { sendEmail } from "./transporter";
import { passwordResetEmailHtml } from "./templates";
import { isEmailRateLimited } from "./rateLimit";

const ACTION_CODE_SETTINGS = {
  url: "https://diaspoafricconnect.web.app",
  handleCodeInApp: false,
};

/**
 * Callable Cloud Function that generates a branded password-reset email.
 *
 * Does NOT require authentication — the user is trying to recover access.
 * Rate-limited by email address to prevent abuse.
 */
export const sendPasswordResetEmail = onCall(
  { secrets: ["SMTP_HOST", "SMTP_PORT", "SMTP_EMAIL", "SMTP_PASSWORD"] },
  async (request) => {
    const email = request.data?.email;

    if (!email || typeof email !== "string") {
      throw new HttpsError(
        "invalid-argument",
        "An email address is required.",
      );
    }

    // Rate-limit: 3 reset emails per 15 minutes per email address.
    if (await isEmailRateLimited(`reset_pw:${email}`, 3, 15 * 60 * 1000)) {
      throw new HttpsError(
        "resource-exhausted",
        "Too many reset requests. Please wait a few minutes.",
      );
    }

    try {
      // Attempt to fetch user — silently succeed even if not found
      // to avoid leaking which emails are registered.
      let userRecord: admin.auth.UserRecord;
      try {
        userRecord = await admin.auth().getUserByEmail(email);
      } catch {
        // User not found — return success anyway (no information leak).
        logger.info(`Password reset requested for unknown email: ${email}`);
        return { success: true };
      }

      const displayName = userRecord.displayName || "there";

      const link = await admin.auth().generatePasswordResetLink(
        email,
        ACTION_CODE_SETTINGS,
      );

      const html = passwordResetEmailHtml(displayName, link);
      await sendEmail(email, "Reset your password — DiaspoAfricConnect", html);

      logger.info(`Password reset email sent to ${email}`);
      return { success: true };
    } catch (error: any) {
      logger.error(`Failed to send password reset email to ${email}:`, error);
      throw new HttpsError(
        "internal",
        "Failed to send reset email. Please try again.",
      );
    }
  },
);
