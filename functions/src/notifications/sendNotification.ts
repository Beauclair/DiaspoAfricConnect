import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

interface SendNotificationParams {
  recipientUid: string;
  title: string;
  body: string;
  /** In-app route path, e.g. "/business/abc123" */
  url?: string;
  /** Additional data payload */
  data?: Record<string, string>;
}

/**
 * Sends a push notification to a user via the Expo Push API.
 * Looks up the user's `expoPushToken` from Firestore.
 *
 * This is an internal utility — not an exported Cloud Function.
 */
export async function sendPushNotification({
  recipientUid,
  title,
  body,
  url,
  data = {},
}: SendNotificationParams): Promise<boolean> {
  const db = admin.firestore();

  // Look up the recipient's push token
  const userDoc = await db.doc(`users/${recipientUid}`).get();
  const token = userDoc.data()?.expoPushToken;

  if (!token || typeof token !== "string") {
    logger.info(`No push token for user ${recipientUid} — skipping notification`);
    return false;
  }

  // Validate it looks like an Expo push token
  if (!token.startsWith("ExponentPushToken[") && !token.startsWith("ExpoPushToken[")) {
    logger.warn(`Invalid push token format for user ${recipientUid}: ${token}`);
    return false;
  }

  const message = {
    to: token,
    sound: "default" as const,
    title,
    body,
    data: {
      ...data,
      ...(url ? { url } : {}),
    },
  };

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();

    if (result.data?.status === "error") {
      logger.error(`Expo push error for ${recipientUid}:`, result.data.message);
      return false;
    }

    logger.info(`Push notification sent to ${recipientUid}: "${title}"`);
    return true;
  } catch (error: any) {
    logger.error(`Failed to send push notification to ${recipientUid}:`, error);
    return false;
  }
}
