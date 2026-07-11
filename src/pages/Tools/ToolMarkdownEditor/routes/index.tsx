import { lazyNavigationRoute } from '@/utils/loadingPriority';
import type { RouteObject } from 'react-router-dom';

const MarkdownEditor = lazyNavigationRoute('/tools/markdown-editor', () =>
  import('@/pages/Tools/ToolMarkdownEditor/pages/Home').then(module => ({
    default: module.MarkdownEditor,
  }))
);

export const routesToolMarkdownEditor: RouteObject[] = [
  { path: 'markdown-editor', element: <MarkdownEditor /> },
];
