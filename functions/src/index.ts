import * as admin from "firebase-admin";

admin.initializeApp();

// ── Firestore triggers — create ──────────────────────────────────────
export { onBusinessCreate } from "./triggers/onBusinessCreate";
export { onReviewCreate } from "./triggers/onReviewCreate";
export { onLawyerCreate } from "./triggers/onLawyerCreate";
export { onVerificationRequestCreate } from "./triggers/onVerificationRequestCreate";

// ── Firestore triggers — update (content re-validation) ─────────────
export { onBusinessUpdate } from "./triggers/onBusinessUpdate";
export { onReviewUpdate } from "./triggers/onReviewUpdate";
export { onLawyerUpdate } from "./triggers/onLawyerUpdate";

// ── Firestore triggers — delete ─────────────────────────────────────
export { onReviewDelete } from "./triggers/onReviewDelete";

// ── Admin callable functions ─────────────────────────────────────────
export { reviewVerificationRequest } from "./admin/reviewVerification";
export { listPendingVerifications } from "./admin/listPendingVerifications";
export { bootstrapAdmin } from "./admin/bootstrapAdmin";

// ── Account management ──────────────────────────────────────────────
export { deleteAccount } from "./account/deleteAccount";
