/**
 * Centralised analytics event names and property types.
 *
 * All instrumentation should reference these constants rather than
 * hard-coding strings — keeps tracking consistent and refactor-safe.
 */

/* ------------------------------------------------------------------ */
/*  Event name constants                                               */
/* ------------------------------------------------------------------ */

export const AnalyticsEvents = {
  // ── Auth ──
  SIGN_UP: 'sign_up',
  LOGIN: 'login',
  LOGOUT: 'logout',
  PASSWORD_RESET_REQUESTED: 'password_reset_requested',

  // ── Business ──
  BUSINESS_VIEWED: 'business_viewed',
  BUSINESS_SEARCH: 'business_search',
  BUSINESS_CATEGORY_FILTERED: 'business_category_filtered',
  BUSINESS_ADDED: 'business_added',
  BUSINESS_EDITED: 'business_edited',
  BUSINESS_DELETED: 'business_deleted',
  BUSINESS_CALL_TAPPED: 'business_call_tapped',
  BUSINESS_WEBSITE_TAPPED: 'business_website_tapped',
  BUSINESS_DIRECTIONS_TAPPED: 'business_directions_tapped',

  // ── Reviews ──
  REVIEW_SUBMITTED: 'review_submitted',
  REVIEW_EDITED: 'review_edited',
  REVIEW_DELETED: 'review_deleted',

  // ── Legal / Attorneys ──
  GUIDE_VIEWED: 'guide_viewed',
  LAWYER_VIEWED: 'lawyer_viewed',
  LAWYER_SEARCH: 'lawyer_search',
  LAWYER_REGISTERED: 'lawyer_registered',
  LAWYER_EDITED: 'lawyer_edited',
  LAWYER_DELETED: 'lawyer_deleted',
  LAWYER_CALL_TAPPED: 'lawyer_call_tapped',

  // ── Engagement ──
  SCREEN_VIEWED: 'screen_viewed',
  COUNTRY_CHANGED: 'country_changed',
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

/* ------------------------------------------------------------------ */
/*  Property types (optional — for documentation & type-safety)        */
/* ------------------------------------------------------------------ */

export interface EventProperties {
  [AnalyticsEvents.SIGN_UP]: { method: 'email'; host_country: string };
  [AnalyticsEvents.LOGIN]: { method: 'email' };
  [AnalyticsEvents.LOGOUT]: Record<string, never>;
  [AnalyticsEvents.PASSWORD_RESET_REQUESTED]: { email_provided: boolean };

  [AnalyticsEvents.BUSINESS_VIEWED]: { business_id: string; category: string };
  [AnalyticsEvents.BUSINESS_SEARCH]: { search_term: string; result_count: number };
  [AnalyticsEvents.BUSINESS_CATEGORY_FILTERED]: { category: string };
  [AnalyticsEvents.BUSINESS_ADDED]: { category: string; has_photos: boolean; host_country: string };
  [AnalyticsEvents.BUSINESS_EDITED]: { business_id: string };
  [AnalyticsEvents.BUSINESS_DELETED]: { business_id: string };
  [AnalyticsEvents.BUSINESS_CALL_TAPPED]: { business_id: string };
  [AnalyticsEvents.BUSINESS_WEBSITE_TAPPED]: { business_id: string };
  [AnalyticsEvents.BUSINESS_DIRECTIONS_TAPPED]: { business_id: string };

  [AnalyticsEvents.REVIEW_SUBMITTED]: { business_id: string; rating: number };
  [AnalyticsEvents.REVIEW_EDITED]: { business_id: string };
  [AnalyticsEvents.REVIEW_DELETED]: { business_id: string };

  [AnalyticsEvents.GUIDE_VIEWED]: { guide_id: string; category: string };
  [AnalyticsEvents.LAWYER_VIEWED]: { lawyer_id: string };
  [AnalyticsEvents.LAWYER_SEARCH]: { search_term: string; result_count: number };
  [AnalyticsEvents.LAWYER_REGISTERED]: { specialization_count: number };
  [AnalyticsEvents.LAWYER_EDITED]: { lawyer_id: string };
  [AnalyticsEvents.LAWYER_DELETED]: { lawyer_id: string };
  [AnalyticsEvents.LAWYER_CALL_TAPPED]: { lawyer_id: string };

  [AnalyticsEvents.SCREEN_VIEWED]: { screen_name: string };
  [AnalyticsEvents.COUNTRY_CHANGED]: { from: string; to: string };
}
