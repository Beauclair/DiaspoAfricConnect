import * as Sentry from '@sentry/react-native';

/**
 * Capture an error from a service call with structured tags.
 *
 * Usage:
 *   catch (e) { captureServiceError(e, 'businessService', 'fetchBusiness'); }
 */
export function captureServiceError(
  error: unknown,
  service: string,
  operation: string,
) {
  Sentry.withScope((scope) => {
    scope.setTag('service', service);
    scope.setTag('operation', operation);

    if (error instanceof Error && 'code' in error) {
      scope.setTag('errorCode', String((error as any).code));
    }

    Sentry.captureException(error);
  });
}

/**
 * Record a manual breadcrumb for important user actions
 * (Sentry auto-tracks navigation via expoRouterIntegration).
 */
export function addBreadcrumb(
  message: string,
  category: string = 'app',
  data?: Record<string, string>,
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data,
  });
}
