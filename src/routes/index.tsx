import { LayoutApp } from '@/components/LayoutApp';
import { PageHome } from '@/pages/PageHome';
import { routesProductSilicon } from '@/pages/Products/ProductSilicon/routes';
import { routesToolOfficialPublisher } from '@/pages/Tools/ToolOfficialPublisher/routes';
import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const PagePrivacy = lazy(() =>
  import('@/pages/PagePrivacy').then(module => ({
    default: module.PagePrivacy,
  }))
);
const PageProducts = lazy(() =>
  import('@/pages/PageProducts').then(module => ({
    default: module.PageProducts,
  }))
);
const PageTeam = lazy(() =>
  import('@/pages/PageTeam').then(module => ({ default: module.PageTeam }))
);
const PageTools = lazy(() =>
  import('@/pages/PageTools').then(module => ({ default: module.PageTools }))
);

export const routes: RouteObject[] = [
  {
    element: <LayoutApp />,
    children: [
      {
        index: true,
        element: <PageHome />,
      },
      {
        path: '/products',
        children: [
          {
            index: true,
            element: <PageProducts />,
          },
          ...routesProductSilicon,
        ],
      },
      {
        path: '/tools',
        children: [
          {
            index: true,
            element: <PageTools />,
          },
          ...routesToolOfficialPublisher,
        ],
      },
      {
        path: '/team',
        element: <PageTeam />,
      },
      {
        path: '/privacy',
        element: <PagePrivacy />,
      },
    ],
  },
];
