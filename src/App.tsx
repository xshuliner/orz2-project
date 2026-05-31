import { useRoutes } from 'react-router-dom';
import { EffectsMotion } from '@/components/EffectsMotion';
import { routes } from '@/routes';

export function App() {
  return (
    <>
      <EffectsMotion />
      {useRoutes(routes)}
    </>
  );
}
