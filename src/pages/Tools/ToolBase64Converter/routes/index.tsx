import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const Base64Converter = lazy(() =>
  import('@/pages/Tools/ToolBase64Converter/pages/Home').then(module => ({
    default: module.Base64Converter,
  }))
);

export const routesToolBase64Converter: RouteObject[] = [
  { path: 'base64-converter', element: <Base64Converter /> },
];
