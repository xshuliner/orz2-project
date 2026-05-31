import { ProductSiliconFrame } from '@/pages/Products/ProductSilicon/components/ProductSiliconFrame';
import { ProductSilicon } from '@/pages/Products/ProductSilicon/pages/Home';
import { MemberDetailPage } from '@/pages/Products/ProductSilicon/pages/MemberDetail';
import { MemberListPage } from '@/pages/Products/ProductSilicon/pages/MemberList';
import { RouteObject } from 'react-router-dom';

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
