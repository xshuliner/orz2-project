import { lazyNavigationRoute } from '@/utils/loadingPriority';
import { RouteObject } from 'react-router-dom';

const PageArticlePublisher = lazyNavigationRoute(
  '/tools/article-publisher',
  () =>
    import('@/pages/Tools/ToolArticlePublisher/pages/Home').then(module => ({
      default: module.PageArticlePublisher,
    }))
);

export const routesToolArticlePublisher: RouteObject[] = [
  {
    path: 'article-publisher',
    element: <PageArticlePublisher />,
  },
];
