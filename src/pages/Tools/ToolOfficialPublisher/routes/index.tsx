import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const PageOfficialPublisher = lazy(() =>
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
