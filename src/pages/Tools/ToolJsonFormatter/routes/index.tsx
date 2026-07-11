import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const JsonFormatter = lazy(() =>
  import('@/pages/Tools/ToolJsonFormatter/pages/Home').then(module => ({
    default: module.JsonFormatter,
  }))
);

export const routesToolJsonFormatter: RouteObject[] = [
  { path: 'json-formatter', element: <JsonFormatter /> },
];
