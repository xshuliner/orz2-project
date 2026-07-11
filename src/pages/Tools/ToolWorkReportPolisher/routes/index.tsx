import { lazyNavigationRoute } from '@/utils/loadingPriority';
import { RouteObject } from 'react-router-dom';

const WorkReportPolisher = lazyNavigationRoute(
  '/tools/work-report-polisher',
  () =>
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
