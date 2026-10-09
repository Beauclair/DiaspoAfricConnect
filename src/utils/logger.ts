import * as Sentry from '@sentry/react-native';

/**
 * Production-safe logger.
 *
 * - `__DEV__` → passes through to console (normal dev experience)
 * - Production → silences `log`/`warn`, routes `error` to Sentry
 *
 * Usage:  import { logger } from '../utils/logger';
 *         logger.log('debug info');
 *         logger.error('Something broke', error);
 */

function devOnly(method: 'log' | 'warn') {
  return (...args: unknown[]) => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console[method](...args);
    }
    // In production: silently dropped — no device log leaks
  };
}

function captureError(...args: unknown[]) {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.error(...args);
    return;
  }

  // In production, send to Sentry
  const firstError = args.find((a) => a instanceof Error);
  if (firstError) {
    Sentry.captureException(firstError);
  } else {
    const message = args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
    Sentry.captureMessage(message, 'error');
  }
}

export const logger = {
  log: devOnly('log'),
  warn: devOnly('warn'),
  error: captureError,
} as const;
