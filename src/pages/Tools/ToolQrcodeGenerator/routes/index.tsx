import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const QrcodeGenerator = lazy(() =>
  import('@/pages/Tools/ToolQrcodeGenerator/pages/Home').then(module => ({
    default: module.QrcodeGenerator,
  }))
);

export const routesToolQrcodeGenerator: RouteObject[] = [
  { path: 'qrcode-generator', element: <QrcodeGenerator /> },
];
