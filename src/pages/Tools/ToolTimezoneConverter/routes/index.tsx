import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const TimezoneConverter = lazy(() =>
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
