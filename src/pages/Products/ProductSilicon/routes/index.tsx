import { ProductSilicon } from '@/pages/Products/ProductSilicon/pages/Home';
import { MemberDetailPage } from '@/pages/Products/ProductSilicon/pages/MemberDetail';
import { MemberListPage } from '@/pages/Products/ProductSilicon/pages/MemberList';
import { RouteObject } from 'react-router-dom';

export const routesProductSilicon: RouteObject[] = [
  {
    path: 'silicon',
    element: <ProductSilicon />,
  },
  {
    path: 'silicon/member-list',
    element: <MemberListPage />,
  },
  {
    path: 'silicon/member-detail',
    element: <MemberDetailPage />,
  },
];
