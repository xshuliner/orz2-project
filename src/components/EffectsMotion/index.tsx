import { lazy, Suspense, useEffect, useState } from 'react';

const DeferredEffectsMotion = lazy(() =>
  import('./DeferredEffectsMotion').then(module => ({
    default: module.DeferredEffectsMotion,
  }))
);

export function EffectsMotion() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const header = document.querySelector<HTMLElement>('.site-header');
    if (!header) return;

    let headerIsScrolled = header.classList.contains('is-scrolled');
    let syncHeaderFrame: number | null = null;

    const syncHeader = (force = false) => {
      const shouldBeScrolled = headerIsScrolled
        ? window.scrollY > 8
        : window.scrollY > 28;
      if (!force && shouldBeScrolled === headerIsScrolled) return;

      headerIsScrolled = shouldBeScrolled;
      header.classList.toggle('is-scrolled', shouldBeScrolled);
    };

    const queueHeaderSync = () => {
      if (syncHeaderFrame !== null) return;
      syncHeaderFrame = window.requestAnimationFrame(() => {
        syncHeaderFrame = null;
        syncHeader();
      });
    };

    syncHeader(true);
    window.addEventListener('scroll', queueHeaderSync, { passive: true });

    return () => {
      window.removeEventListener('scroll', queueHeaderSync);
      if (syncHeaderFrame !== null)
        window.cancelAnimationFrame(syncHeaderFrame);
    };
  }, []);

  useEffect(() => {
    let idleId: number | null = null;
    let timeoutId: ReturnType<typeof globalThis.setTimeout> | null = null;
    let isCancelled = false;

    const loadMotion = () => {
      if (!isCancelled) setIsReady(true);
    };

    const scheduleMotion = () => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(loadMotion, { timeout: 2600 });
        return;
      }

      timeoutId = globalThis.setTimeout(loadMotion, 1800);
    };

    if (document.readyState === 'complete') {
      scheduleMotion();
    } else {
      window.addEventListener('load', scheduleMotion, { once: true });
    }

    return () => {
      isCancelled = true;
      window.removeEventListener('load', scheduleMotion);
      if (idleId !== null) window.cancelIdleCallback(idleId);
      if (timeoutId !== null) globalThis.clearTimeout(timeoutId);
    };
  }, []);

  return isReady ? (
    <Suspense fallback={null}>
      <DeferredEffectsMotion />
    </Suspense>
  ) : null;
}
