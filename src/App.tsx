import { EffectsMotion } from '@/components/EffectsMotion';
import { routes } from '@/routes';
import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';

export function App() {
  return (
    <>
      <EffectsMotion />
      <Suspense fallback={null}>{useRoutes(routes)}</Suspense>
    </>
  );
}
