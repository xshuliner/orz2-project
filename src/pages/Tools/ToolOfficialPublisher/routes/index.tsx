import { lazyNavigationRoute } from '@/utils/loadingPriority';
import { RouteObject } from 'react-router-dom';

const PageOfficialPublisher = lazyNavigationRoute(
  '/tools/official-publisher',
  () =>
    import('@/pages/Tools/ToolOfficialPublisher/pages/Home').then(module => ({
      default: module.PageOfficialPublisher,
    }))
);

export const routesToolOfficialPublisher: RouteObject[] = [
  {
    path: 'official-publisher',
    element: <PageOfficialPublisher />,
  },
];
