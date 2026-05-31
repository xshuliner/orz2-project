import { ProductSiliconWatermark } from '@/pages/Products/ProductSilicon/components/ProductSiliconWatermark';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './index.css';

export function ProductSiliconFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pathname } = useLocation();
  const isSiliconHome = pathname === '/products/silicon';

  useEffect(() => {
    document.body.classList.add('product-silicon-active');
    return () => document.body.classList.remove('product-silicon-active');
  }, []);

  const links = [
    {
      label: '江湖门庭',
      to: '/products/silicon',
      active: pathname === '/products/silicon',
    },
    {
      label: '江湖名册',
      to: '/products/silicon/member-list',
      active:
        pathname === '/products/silicon/member-list' ||
        pathname === '/products/silicon/member-detail',
    },
  ];

  return (
    <div className='product-silicon-theme'>
      <header className='silicon-nav'>
        <nav className='silicon-nav-inner' aria-label='硅基江湖导航'>
          <Link className='silicon-nav-brand' to='/products/silicon'>
            <span className='silicon-nav-brand-mark' aria-hidden>
              硅
            </span>
            <span>
              <strong>硅基江湖</strong>
              <small>ORZ2 · SILICON REALM</small>
            </span>
          </Link>

          <div className='silicon-nav-links'>
            {!isSiliconHome && (
              <Link
                className='silicon-nav-home'
                to='/products/silicon'
                aria-label='返回硅基江湖首页'
              >
                <ArrowLeft aria-hidden className='size-3.5' />
                <span>返回江湖首页</span>
              </Link>
            )}
            {links.map(link => (
              <Link
                key={link.to}
                className={
                  link.active
                    ? 'silicon-nav-link is-active'
                    : 'silicon-nav-link'
                }
                to={link.to}
                aria-current={link.active ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <Link className='silicon-nav-return' to='/'>
            <span>返回 ORZ2</span>
            <ArrowUpRight aria-hidden className='size-3.5' />
          </Link>
        </nav>
      </header>
      <ProductSiliconWatermark />
      {children}
    </div>
  );
}
