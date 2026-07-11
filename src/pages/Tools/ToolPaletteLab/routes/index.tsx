import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const PaletteLab = lazy(() =>
  import('@/pages/Tools/ToolPaletteLab/pages/Home').then(module => ({
    default: module.PaletteLab,
  }))
);

export const routesToolPaletteLab: RouteObject[] = [
  { path: 'palette-lab', element: <PaletteLab /> },
];
