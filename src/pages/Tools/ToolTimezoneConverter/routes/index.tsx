import { lazyNavigationRoute } from '@/utils/loadingPriority';
import { RouteObject } from 'react-router-dom';

const TimezoneConverter = lazyNavigationRoute('/tools/timezone-converter', () =>
  import('@/pages/Tools/ToolTimezoneConverter/pages/Home').then(module => ({
    default: module.TimezoneConverter,
  }))
);

export const routesToolTimezoneConverter: RouteObject[] = [
  {
    path: 'timezone-converter',
    element: <TimezoneConverter />,
  },
];
