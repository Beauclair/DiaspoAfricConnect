/**
 * Lightweight server-side content validation utilities.
 *
 * These run in Cloud Functions after a document is created/updated so we can
 * reject spam or abusive content that slipped past the client.
 */

/** Strip HTML tags from a string. */
function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}

// Blocked terms — kept focused to avoid over-blocking legitimate users.
// Each entry is lower-cased; matching is substring-based.
const BLOCKED_WORDS: string[] = [
  // Slurs & hate speech
  "nigger", "nigga", "faggot", "chink", "spic", "wetback", "kike",
  "coon", "gook", "raghead", "towelhead", "beaner",
  // Spam / scam keywords
  "buy followers", "free money", "click here now", "act now",
  "earn cash fast", "work from home guaranteed",
  "100% free", "no risk", "wire transfer",
  "crypto invest", "double your money",
];

/**
 * Check for spam-like patterns (excessive repetition, all caps, URL flooding).
 * @returns An error message if spam is detected, or null.
 */
function checkSpamPatterns(
  text: string,
  fieldName: string,
): string | null {
  // All caps (only check strings long enough to be intentional)
  if (text.length > 20 && text === text.toUpperCase() && /[A-Z]/.test(text)) {
    return `${fieldName} should not be entirely uppercase`;
  }

  // Excessive character repetition (e.g. "aaaaaaa" or "!!!!!!!")
  if (/(.)\1{9,}/i.test(text)) {
    return `${fieldName} contains excessive repeated characters`;
  }

  // URL flooding — more than 3 URLs in one field
  const urlCount = (text.match(/https?:\/\/[^\s]+/gi) || []).length;
  if (urlCount > 3) {
    return `${fieldName} contains too many links`;
  }

  return null;
}

/**
 * Validate a user-supplied text field.
 *
 * @returns An error message string if invalid, or `null` if OK.
 */
export function validateText(
  text: unknown,
  fieldName: string,
  maxLength: number,
): string | null {
  if (typeof text !== "string") {
    return `${fieldName} must be a string`;
  }

  const cleaned = stripHtml(text).trim();

  if (cleaned.length === 0) {
    return `${fieldName} cannot be empty`;
  }
  if (cleaned.length > maxLength) {
    return `${fieldName} exceeds ${maxLength} characters`;
  }

  // Blocked words check
  const lower = cleaned.toLowerCase();
  for (const word of BLOCKED_WORDS) {
    if (lower.includes(word)) {
      return `${fieldName} contains prohibited content`;
    }
  }

  // Spam pattern check
  const spamErr = checkSpamPatterns(cleaned, fieldName);
  if (spamErr) return spamErr;

  return null;
}

/**
 * Validate a numeric rating value.
 */
export function validateRating(rating: unknown): string | null {
  if (typeof rating !== "number" || !Number.isInteger(rating)) {
    return "Rating must be an integer";
  }
  if (rating < 1 || rating > 5) {
    return "Rating must be between 1 and 5";
  }
  return null;
}
