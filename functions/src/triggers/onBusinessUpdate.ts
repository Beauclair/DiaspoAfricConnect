import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { validateText } from "../contentValidation";

/**
 * Runs after a business document is updated.
 *
 * Re-validates name and description — if the user edits content to inject
 * spam or blocked terms, revert those fields to their previous values.
 */
export const onBusinessUpdate = onDocumentUpdated(
  "businesses/{businessId}",
  async (event) => {
    const before = event.data?.before;
    const after = event.data?.after;
    if (!before || !after) return;

    const oldData = before.data();
    const newData = after.data();

    // Only validate if text fields actually changed
    const nameChanged = newData.name !== oldData.name;
    const descChanged = newData.description !== oldData.description;

    if (!nameChanged && !descChanged) return;

    const revert: Record<string, unknown> = {};

    if (nameChanged) {
      const err = validateText(newData.name, "Business name", 200);
      if (err) {
        logger.warn(
          `Business ${after.id} update rejected (name): ${err}`,
        );
        revert.name = oldData.name;
      }
    }

    if (descChanged) {
      const err = validateText(newData.description, "Description", 2000);
      if (err) {
        logger.warn(
          `Business ${after.id} update rejected (description): ${err}`,
        );
        revert.description = oldData.description;
      }
    }

    if (Object.keys(revert).length > 0) {
      await after.ref.update(revert);
      logger.info(`Reverted fields [${Object.keys(revert).join(", ")}] on business ${after.id}`);
    }
  },
);
