import PostHog from 'posthog-react-native';
import Constants from 'expo-constants';
import { logger } from '../utils/logger';
import type { AnalyticsEventName, EventProperties } from '../constants/analyticsEvents';

/* ------------------------------------------------------------------ */
/*  Singleton                                                          */
/* ------------------------------------------------------------------ */

const extra = Constants.expoConfig?.extra ?? {};

let posthog: PostHog | null = null;

/**
 * Initialise the PostHog client.
 * Safe to call multiple times — subsequent calls are no-ops.
 * Returns the client (or null if initialisation is skipped/fails).
 */
export function initAnalytics(): PostHog | null {
  if (posthog) return posthog;

  const apiKey = extra.posthogApiKey as string | undefined;
  if (!apiKey || apiKey === 'YOUR_POSTHOG_API_KEY') {
    logger.log('[analytics] PostHog API key not set — analytics disabled');
    return null;
  }

  try {
    posthog = new PostHog(apiKey, {
      host: (extra.posthogHost as string) || 'https://us.i.posthog.com',
      // Flush events in batches rather than one-by-one.
      flushInterval: 30_000, // 30 s
      flushAt: 20,           // or after 20 events
      // Do not capture network requests automatically — too noisy.
      captureNativeAppLifecycleEvents: false,
    });
    logger.log('[analytics] PostHog initialised');
    return posthog;
  } catch (e) {
    logger.error('[analytics] PostHog initialisation failed', e);
    return null;
  }
}

/** Return the live client (null if not yet initialised or disabled). */
export function getPostHog(): PostHog | null {
  return posthog;
}

/* ------------------------------------------------------------------ */
/*  Typed helpers                                                      */
/* ------------------------------------------------------------------ */

/**
 * Identify the current user after login / signup so all subsequent
 * events are attributed to them.
 */
export function identifyUser(
  uid: string,
  traits?: { email?: string | null; host_country?: string; display_name?: string },
) {
  try {
    posthog?.identify(uid, {
      email: traits?.email ?? undefined,
      host_country: traits?.host_country,
      display_name: traits?.display_name,
    });
  } catch (e) {
    logger.error('[analytics] identify failed', e);
  }
}

/** Clear user identity on logout. */
export function resetUser() {
  try {
    posthog?.reset();
  } catch (e) {
    logger.error('[analytics] reset failed', e);
  }
}

/**
 * Track an event with optional typed properties.
 *
 * Usage:
 *   trackEvent(AnalyticsEvents.BUSINESS_VIEWED, { business_id: '123', category: 'restaurant' });
 */
export function trackEvent<E extends AnalyticsEventName>(
  event: E,
  properties?: E extends keyof EventProperties ? EventProperties[E] : Record<string, unknown>,
) {
  try {
    posthog?.capture(event, properties as Record<string, unknown>);
  } catch (e) {
    logger.error('[analytics] capture failed', e);
  }
}

/**
 * Record a screen view.
 * PostHog groups these under the "$screen" event for retention / flow analysis.
 */
export function trackScreen(screenName: string, properties?: Record<string, unknown>) {
  try {
    posthog?.screen(screenName, properties);
  } catch (e) {
    logger.error('[analytics] screen failed', e);
  }
}
