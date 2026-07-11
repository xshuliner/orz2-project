import { lazyNavigationRoute } from '@/utils/loadingPriority';
import type { RouteObject } from 'react-router-dom';

const Base64Converter = lazyNavigationRoute('/tools/base64-converter', () =>
  import('@/pages/Tools/ToolBase64Converter/pages/Home').then(module => ({
    default: module.Base64Converter,
  }))
);

export const routesToolBase64Converter: RouteObject[] = [
  { path: 'base64-converter', element: <Base64Converter /> },
];
