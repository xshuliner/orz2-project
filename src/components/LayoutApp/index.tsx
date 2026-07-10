import { OFooter } from '@/components/OFooter';
import { OHeader } from '@/components/OHeader';
import { useCallback, useEffect, useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

export function LayoutApp() {
  const { pathname, search } = useLocation();
  const routeKey = `${pathname}?${search}`;

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  const resetPageScroll = useCallback(() => {
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlScrollBehavior = html.style.scrollBehavior;
    const previousBodyScrollBehavior = body.style.scrollBehavior;

    html.style.scrollBehavior = 'auto';
    body.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    document.scrollingElement?.scrollTo(0, 0);
    html.style.scrollBehavior = previousHtmlScrollBehavior;
    body.style.scrollBehavior = previousBodyScrollBehavior;
  }, []);

  useLayoutEffect(() => {
    resetPageScroll();
  }, [resetPageScroll, routeKey]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(resetPageScroll);
    const timer = window.setTimeout(resetPageScroll, 80);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [resetPageScroll, routeKey]);

  return (
    <div className='app-shell'>
      <OHeader />
      <main id='main-content'>
        <Outlet />
      </main>
      <OFooter />
    </div>
  );
}
