import { lazyNavigationRoute } from '@/utils/loadingPriority';
import type { RouteObject } from 'react-router-dom';

const MockAccountGenerator = lazyNavigationRoute(
  '/tools/mock-account-generator',
  () =>
    import('@/pages/Tools/ToolMockAccountGenerator/pages/Home').then(
      module => ({
        default: module.MockAccountGenerator,
      })
    )
);

export const routesToolMockAccountGenerator: RouteObject[] = [
  { path: 'mock-account-generator', element: <MockAccountGenerator /> },
];
