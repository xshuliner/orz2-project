import { lazyNavigationRoute } from '@/utils/loadingPriority';
import type { RouteObject } from 'react-router-dom';

const JsonFormatter = lazyNavigationRoute('/tools/json-formatter', () =>
  import('@/pages/Tools/ToolJsonFormatter/pages/Home').then(module => ({
    default: module.JsonFormatter,
  }))
);

export const routesToolJsonFormatter: RouteObject[] = [
  { path: 'json-formatter', element: <JsonFormatter /> },
];
