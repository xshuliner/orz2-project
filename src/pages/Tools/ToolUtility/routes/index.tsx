import { utilityTools } from '@/pages/Tools/ToolUtility/config';
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const UtilityTool = lazy(() =>
  import('@/pages/Tools/ToolUtility/pages/Home').then(module => ({
    default: module.UtilityToolPage,
  }))
);

export const routesToolUtility: RouteObject[] = Object.keys(utilityTools).map(
  path => ({ path, element: <UtilityTool /> })
);
