import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { validateText } from "../contentValidation";

/**
 * Runs after a lawyer document is updated.
 *
 * Re-validates the name field — if content fails validation,
 * revert to the previous value.
 */
export const onLawyerUpdate = onDocumentUpdated(
  "lawyers/{lawyerId}",
  async (event) => {
    const before = event.data?.before;
    const after = event.data?.after;
    if (!before || !after) return;

    const oldData = before.data();
    const newData = after.data();

    const nameChanged = newData.name !== oldData.name;

    if (!nameChanged) return;

    const err = validateText(newData.name, "Lawyer name", 200);
    if (err) {
      logger.warn(`Lawyer ${after.id} update rejected (name): ${err}`);
      await after.ref.update({ name: oldData.name });
      logger.info(`Reverted name on lawyer ${after.id}`);
    }
  },
);
