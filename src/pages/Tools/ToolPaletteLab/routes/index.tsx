import { lazyNavigationRoute } from '@/utils/loadingPriority';
import type { RouteObject } from 'react-router-dom';

const PaletteLab = lazyNavigationRoute('/tools/palette-lab', () =>
  import('@/pages/Tools/ToolPaletteLab/pages/Home').then(module => ({
    default: module.PaletteLab,
  }))
);

export const routesToolPaletteLab: RouteObject[] = [
  { path: 'palette-lab', element: <PaletteLab /> },
];
