import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { sendEmail } from "./transporter";
import { verificationEmailHtml } from "./templates";
import { isEmailRateLimited } from "./rateLimit";

const ACTION_CODE_SETTINGS = {
  url: "https://diaspoafricconnect.web.app/email-verified.html",
  handleCodeInApp: false,
};

/**
 * Callable Cloud Function that generates a branded verification email.
 *
 * Requires the caller to be authenticated (they just signed up or are
 * requesting a resend from the verify-email screen).
 */
export const sendVerificationEmail = onCall(
  { secrets: ["SMTP_HOST", "SMTP_PORT", "SMTP_EMAIL", "SMTP_PASSWORD"] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be signed in.");
    }

    const uid = request.auth.uid;
    const email = request.auth.token.email;

    if (!email) {
      throw new HttpsError(
        "failed-precondition",
        "No email address associated with this account.",
      );
    }

    // Rate-limit: 3 verification emails per 5 minutes per user.
    if (await isEmailRateLimited(`verify_email:${uid}`, 3, 5 * 60 * 1000)) {
      throw new HttpsError(
        "resource-exhausted",
        "Too many verification emails. Please wait a few minutes.",
      );
    }

    try {
      // Fetch user record for display name
      const userRecord = await admin.auth().getUser(uid);
      const displayName = userRecord.displayName || "there";

      const link = await admin.auth().generateEmailVerificationLink(
        email,
        ACTION_CODE_SETTINGS,
      );

      const html = verificationEmailHtml(displayName, link);
      await sendEmail(email, "Verify your email — DiaspoAfricConnect", html);

      logger.info(`Verification email sent to ${email} (uid: ${uid})`);
      return { success: true };
    } catch (error: any) {
      logger.error(`Failed to send verification email to ${email}:`, error);
      throw new HttpsError(
        "internal",
        "Failed to send verification email. Please try again.",
      );
    }
  },
);
