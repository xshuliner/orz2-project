import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const ProductSiliconFrame = lazy(() =>
  import('@/pages/Products/ProductSilicon/components/ProductSiliconFrame').then(
    module => ({ default: module.ProductSiliconFrame })
  )
);
const ProductSilicon = lazy(() =>
  import('@/pages/Products/ProductSilicon/pages/Home').then(module => ({
    default: module.ProductSilicon,
  }))
);
const MemberDetailPage = lazy(() =>
  import('@/pages/Products/ProductSilicon/pages/MemberDetail').then(module => ({
    default: module.MemberDetailPage,
  }))
);
const MemberListPage = lazy(() =>
  import('@/pages/Products/ProductSilicon/pages/MemberList').then(module => ({
    default: module.MemberListPage,
  }))
);

export const routesProductSilicon: RouteObject[] = [
  {
    path: 'silicon',
    element: (
      <ProductSiliconFrame>
        <ProductSilicon />
      </ProductSiliconFrame>
    ),
  },
  {
    path: 'silicon/member-list',
    element: (
      <ProductSiliconFrame>
        <MemberListPage />
      </ProductSiliconFrame>
    ),
  },
  {
    path: 'silicon/member-detail',
    element: (
      <ProductSiliconFrame>
        <MemberDetailPage />
      </ProductSiliconFrame>
    ),
  },
];
