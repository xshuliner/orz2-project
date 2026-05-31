import { EffectsMotion } from '@/components/EffectsMotion';
import { LayoutApp } from '@/components/LayoutApp';
import { PageHome } from '@/pages/PageHome';
import { PagePrivacy } from '@/pages/PagePrivacy';
import { PageProducts } from '@/pages/PageProducts';
import { PageTeam } from '@/pages/PageTeam';
import { PageTool } from '@/pages/PageTool';
import { Route, Routes } from 'react-router-dom';

export function App() {
  return (
    <>
      <EffectsMotion />
      <Routes>
        <Route element={<LayoutApp />}>
          <Route index element={<PageHome />} />
          <Route path='/products' element={<PageProducts />} />
          <Route path='/team' element={<PageTeam />} />
          <Route path='/privacy' element={<PagePrivacy />} />
          <Route path='/tools/:slug' element={<PageTool />} />
        </Route>
      </Routes>
    </>
  );
}
