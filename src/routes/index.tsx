import { LayoutApp } from '@/components/LayoutApp';
import { PageHome } from '@/pages/PageHome';
import { PagePrivacy } from '@/pages/PagePrivacy';
import { PageProducts } from '@/pages/PageProducts';
import { PageTeam } from '@/pages/PageTeam';
import { PageTools } from '@/pages/PageTools';
import { routesProductSilicon } from '@/pages/Products/ProductSilicon/routes';
import { routesToolOfficialPublisher } from '@/pages/Tools/ToolOfficialPublisher/routes';
import { RouteObject } from 'react-router-dom';

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
