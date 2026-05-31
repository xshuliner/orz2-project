import { lazy, Suspense, useEffect, useState } from 'react';

const DeferredEffectsMotion = lazy(() =>
  import('./DeferredEffectsMotion').then(module => ({
    default: module.DeferredEffectsMotion,
  }))
);

export function EffectsMotion() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadMotion = () => setIsReady(true);

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(loadMotion, { timeout: 1200 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = globalThis.setTimeout(loadMotion, 400);
    return () => globalThis.clearTimeout(timeoutId);
  }, []);

  return isReady ? (
    <Suspense fallback={null}>
      <DeferredEffectsMotion />
    </Suspense>
  ) : null;
}
