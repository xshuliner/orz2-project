import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const OfficialPublisher = lazy(() =>
  import('@/pages/Tools/ToolOfficialPublisher/pages/Home').then(module => ({
    default: module.OfficialPublisher,
  }))
);

export const routesToolOfficialPublisher: RouteObject[] = [
  {
    path: 'official-publisher',
    element: <OfficialPublisher />,
  },
];
