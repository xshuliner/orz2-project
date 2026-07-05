import { EffectsMotion } from '@/components/EffectsMotion';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { routes } from '@/routes';
import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';

export function App() {
  return (
    <>
      <EffectsMotion />
      <GoogleAnalytics />
      <Suspense fallback={null}>{useRoutes(routes)}</Suspense>
    </>
  );
}
