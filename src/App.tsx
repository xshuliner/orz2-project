import { EffectsMotion } from '@/components/EffectsMotion';
import { LayoutApp } from '@/components/LayoutApp';
import { PageHome } from '@/pages/PageHome';
import { PagePrivacy } from '@/pages/PagePrivacy';
import { PageProducts } from '@/pages/PageProducts';
import { PageTeam } from '@/pages/PageTeam';
import { PageTools } from '@/pages/PageTools';
import { PageWechatPublisher } from '@/pages/PageWechatPublisher';
import { Route, Routes } from 'react-router-dom';

export function App() {
  return (
    <>
      <EffectsMotion />
      <Routes>
        <Route element={<LayoutApp />}>
          <Route index element={<PageHome />} />
          <Route path='/products' element={<PageProducts />} />
          <Route path='/tools' element={<PageTools />} />
          <Route path='/team' element={<PageTeam />} />
          <Route path='/privacy' element={<PagePrivacy />} />
          <Route
            path='/tools/wechat-auto-publisher'
            element={<PageWechatPublisher />}
          />
        </Route>
      </Routes>
    </>
  );
}
