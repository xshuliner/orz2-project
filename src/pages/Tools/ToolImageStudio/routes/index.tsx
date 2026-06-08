import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const ImageStudio = lazy(() =>
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
