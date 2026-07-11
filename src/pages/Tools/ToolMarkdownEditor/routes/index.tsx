import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const MarkdownEditor = lazy(() =>
  import('@/pages/Tools/ToolMarkdownEditor/pages/Home').then(module => ({
    default: module.MarkdownEditor,
  }))
);

export const routesToolMarkdownEditor: RouteObject[] = [
  { path: 'markdown-editor', element: <MarkdownEditor /> },
];
