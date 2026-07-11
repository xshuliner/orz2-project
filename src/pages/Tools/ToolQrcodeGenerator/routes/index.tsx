import { lazyNavigationRoute } from '@/utils/loadingPriority';
import type { RouteObject } from 'react-router-dom';

const QrcodeGenerator = lazyNavigationRoute('/tools/qrcode-generator', () =>
  import('@/pages/Tools/ToolQrcodeGenerator/pages/Home').then(module => ({
    default: module.QrcodeGenerator,
  }))
);

export const routesToolQrcodeGenerator: RouteObject[] = [
  { path: 'qrcode-generator', element: <QrcodeGenerator /> },
];
