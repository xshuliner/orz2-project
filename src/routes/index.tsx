import { LayoutApp } from '@/components/LayoutApp';
import { defaultLocale, localePrefixes, type Locale } from '@/i18n';
import { PageHome } from '@/pages/PageHome';
import { routesProductSilicon } from '@/pages/Products/ProductSilicon/routes';
import { routesToolBase64Converter } from '@/pages/Tools/ToolBase64Converter/routes';
import { routesToolImageStudio } from '@/pages/Tools/ToolImageStudio/routes';
import { routesToolJsonFormatter } from '@/pages/Tools/ToolJsonFormatter/routes';
import { routesToolMarkdownEditor } from '@/pages/Tools/ToolMarkdownEditor/routes';
import { routesToolOfficialPublisher } from '@/pages/Tools/ToolOfficialPublisher/routes';
import { routesToolPaletteLab } from '@/pages/Tools/ToolPaletteLab/routes';
import { routesToolQrcodeGenerator } from '@/pages/Tools/ToolQrcodeGenerator/routes';
import { routesToolTimezoneConverter } from '@/pages/Tools/ToolTimezoneConverter/routes';
import { routesToolWorkReportPolisher } from '@/pages/Tools/ToolWorkReportPolisher/routes';
import { lazyNavigationRoute } from '@/utils/loadingPriority';
import { Navigate, RouteObject, useParams } from 'react-router-dom';

const PagePrivacy = lazyNavigationRoute('/privacy', () =>
  import('@/pages/PagePrivacy').then(module => ({
    default: module.PagePrivacy,
  }))
);
const PageDesignSystem = lazyNavigationRoute('/design-system', () =>
  import('@/pages/PageDesignSystem').then(module => ({
    default: module.PageDesignSystem,
  }))
);
const PageBuildInfo = lazyNavigationRoute('/build-info', () =>
  import('@/pages/PageBuildInfo').then(module => ({
    default: module.PageBuildInfo,
  }))
);
const PageProducts = lazyNavigationRoute('/products', () =>
  import('@/pages/PageProducts').then(module => ({
    default: module.PageProducts,
  }))
);
const PageTeam = lazyNavigationRoute('/team', () =>
  import('@/pages/PageTeam').then(module => ({ default: module.PageTeam }))
);
const PageTools = lazyNavigationRoute('/tools', () =>
  import('@/pages/PageTools').then(module => ({ default: module.PageTools }))
);
const PageMemberDetail = lazyNavigationRoute('/member/detail', () =>
  import('@/pages/PageMemberDetail').then(module => ({
    default: module.PageMemberDetail,
  }))
);
const PageMemberScoreList = lazyNavigationRoute('/member/score-list', () =>
  import('@/pages/PageMemberScoreList').then(module => ({
    default: module.PageMemberScoreList,
  }))
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
        ...routesToolTimezoneConverter,
        ...routesToolWorkReportPolisher,
        ...routesToolJsonFormatter,
        ...routesToolPaletteLab,
        ...routesToolBase64Converter,
        ...routesToolMarkdownEditor,
        ...routesToolQrcodeGenerator,
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
      path: 'member/detail',
      element: <PageMemberDetail />,
    },
    {
      path: 'member/score-list',
      element: <PageMemberScoreList />,
    },
    {
      path: 'design-system',
      element: <PageDesignSystem />,
    },
    {
      path: 'build-info',
      element: <PageBuildInfo />,
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
