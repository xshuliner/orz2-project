import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const WorkReportPolisher = lazy(() =>
  import('@/pages/Tools/ToolWorkReportPolisher/pages/Home').then(module => ({
    default: module.WorkReportPolisher,
  }))
);

export const routesToolWorkReportPolisher: RouteObject[] = [
  {
    path: 'work-report-polisher',
    element: <WorkReportPolisher />,
  },
];
