import { lazyNavigationRoute } from '@/utils/loadingPriority';
import { RouteObject } from 'react-router-dom';

const ImageStudio = lazyNavigationRoute('/tools/smart-image-compressor', () =>
  import('@/pages/Tools/ToolImageStudio/pages/Home').then(module => ({
    default: module.ImageStudio,
  }))
);

export const routesToolImageStudio: RouteObject[] = [
  {
    path: 'smart-image-compressor',
    element: <ImageStudio />,
  },
];
