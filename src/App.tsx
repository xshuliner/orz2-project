import { EffectsMotion } from '@/components/EffectsMotion';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { LocalPerformanceMonitor } from '@/components/LocalPerformanceMonitor';
import { routes } from '@/routes';
import { preloadNavigationPath } from '@/utils/loadingPriority';
import { Suspense, useEffect } from 'react';
import { useRoutes } from 'react-router-dom';

function routePathFromAnchor(anchor: HTMLAnchorElement) {
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return undefined;

  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const pathWithoutBase =
    base && url.pathname.startsWith(base)
      ? url.pathname.slice(base.length) || '/'
      : url.pathname;
  return pathWithoutBase.replace(/^\/(en|ja)(?=\/|$)/, '') || '/';
}

function useNavigationPrefetch() {
  useEffect(() => {
    function prefetch(event: Event) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>('a[href]');
      if (
        !anchor ||
        anchor.hasAttribute('download') ||
        anchor.target === '_blank'
      )
        return;

      const path = routePathFromAnchor(anchor);
      if (path) preloadNavigationPath(path);
    }

    document.addEventListener('pointerover', prefetch, { passive: true });
    document.addEventListener('focusin', prefetch);
    return () => {
      document.removeEventListener('pointerover', prefetch);
      document.removeEventListener('focusin', prefetch);
    };
  }, []);
}

export function App() {
  useNavigationPrefetch();

  return (
    <>
      <EffectsMotion />
      <GoogleAnalytics />
      <LocalPerformanceMonitor />
      <Suspense fallback={null}>{useRoutes(routes)}</Suspense>
    </>
  );
}
