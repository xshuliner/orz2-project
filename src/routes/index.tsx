import { LayoutApp } from '@/components/LayoutApp';
import { defaultLocale, localePrefixes, type Locale } from '@/i18n';
import { PageHome } from '@/pages/PageHome';
import { routesProductSilicon } from '@/pages/Products/ProductSilicon/routes';
import { routesToolImageStudio } from '@/pages/Tools/ToolImageStudio/routes';
import { routesToolOfficialPublisher } from '@/pages/Tools/ToolOfficialPublisher/routes';
import { lazy } from 'react';
import { Navigate, RouteObject, useParams } from 'react-router-dom';

const PagePrivacy = lazy(() =>
  import('@/pages/PagePrivacy').then(module => ({
    default: module.PagePrivacy,
  }))
);
const PageDesignSystem = lazy(() =>
  import('@/pages/PageDesignSystem').then(module => ({
    default: module.PageDesignSystem,
  }))
);
const PageProducts = lazy(() =>
  import('@/pages/PageProducts').then(module => ({
    default: module.PageProducts,
  }))
);
const PageTeam = lazy(() =>
  import('@/pages/PageTeam').then(module => ({ default: module.PageTeam }))
);
const PageTools = lazy(() =>
  import('@/pages/PageTools').then(module => ({ default: module.PageTools }))
);

function InvalidLocaleRedirect() {
  const params = useParams();
  const rest = params['*'];
  return <Navigate replace to={rest ? `/${rest}` : '/'} />;
}

function createAppChildren(): RouteObject[] {
  return [
    {
      index: true,
      element: <PageHome />,
    },
    {
      path: 'products',
      children: [
        {
          index: true,
          element: <PageProducts />,
        },
        ...routesProductSilicon,
      ],
    },
    {
      path: 'tools',
      children: [
        {
          index: true,
          element: <PageTools />,
        },
        ...routesToolImageStudio,
        ...routesToolOfficialPublisher,
      ],
    },
    {
      path: 'team',
      element: <PageTeam />,
    },
    {
      path: 'privacy',
      element: <PagePrivacy />,
    },
    {
      path: 'design-system',
      element: <PageDesignSystem />,
    },
  ];
}

function createLocaleBranch(locale: Locale): RouteObject {
  const prefix = localePrefixes[locale];
  return {
    path: prefix || '/',
    element: <LayoutApp />,
    children: createAppChildren(),
  };
}

export const routes: RouteObject[] = [
  createLocaleBranch(defaultLocale),
  createLocaleBranch('en'),
  createLocaleBranch('ja'),
  {
    path: ':locale/*',
    element: <InvalidLocaleRedirect />,
  },
];
