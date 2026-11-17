import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { sendEmail } from "./transporter";
import { passwordResetEmailHtml } from "./templates";
import { isEmailRateLimited } from "./rateLimit";

const CUSTOM_ACTION_PAGE =
  "https://diaspoafricconnect.web.app/auth-action.html";

/**
 * Rewrite a Firebase-generated action link so it points to our custom
 * auth-action.html page instead of the default `__/auth/action` handler.
 *
 * The Firebase link looks like:
 *   https://…/__/auth/action?mode=resetPassword&oobCode=…&apiKey=…&lang=en
 *
 * We keep every query parameter and just swap the base URL.
 */
function rewriteActionLink(firebaseLink: string): string {
  const url = new URL(firebaseLink);
  const custom = new URL(CUSTOM_ACTION_PAGE);
  // Carry over all query params (mode, oobCode, apiKey, continueUrl, lang…)
  url.searchParams.forEach((value, key) => {
    custom.searchParams.set(key, value);
  });
  return custom.toString();
}

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

      // Generate the Firebase reset link, then rewrite it to our custom page
      const firebaseLink = await admin.auth().generatePasswordResetLink(email);
      const resetLink = rewriteActionLink(firebaseLink);

      const html = passwordResetEmailHtml(displayName, resetLink);
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
