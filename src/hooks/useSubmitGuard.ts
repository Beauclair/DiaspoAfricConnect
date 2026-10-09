import { useCallback, useRef } from 'react';

/**
 * Prevents rapid-fire form submissions.
 *
 * Wraps an async handler so that:
 * 1. Concurrent calls are ignored while one is in-flight.
 * 2. After completion, a cooldown period blocks re-submission.
 *
 * @param handler  The async submit function.
 * @param cooldownMs  Minimum gap between successful submissions (default 3 s).
 * @returns A guarded version of `handler` — safe to pass directly to `onPress`.
 */
export function useSubmitGuard<Args extends unknown[]>(
  handler: (...args: Args) => Promise<void>,
  cooldownMs: number = 3000,
): (...args: Args) => Promise<void> {
  const busyRef = useRef(false);
  const lastSubmitRef = useRef(0);

  return useCallback(
    async (...args: Args) => {
      // Already in-flight
      if (busyRef.current) return;

      // Cooldown not elapsed
      const elapsed = Date.now() - lastSubmitRef.current;
      if (elapsed < cooldownMs) return;

      busyRef.current = true;
      try {
        await handler(...args);
      } finally {
        lastSubmitRef.current = Date.now();
        busyRef.current = false;
      }
    },
    [handler, cooldownMs],
  );
}
