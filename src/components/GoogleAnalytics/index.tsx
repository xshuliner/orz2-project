import {
  getGoogleAnalyticsInitialReferrer,
  getGoogleAnalyticsPageLocation,
  trackGoogleAnalyticsPageView,
} from '@/utils/googleAnalytics';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function GoogleAnalytics() {
  const location = useLocation();
  const lastPageLocationRef = useRef('');
  const lastPageTitleRef = useRef('');
  const initialReferrerRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    initialReferrerRef.current ??= getGoogleAnalyticsInitialReferrer();
    const pageLocation = getGoogleAnalyticsPageLocation();
    if (pageLocation === lastPageLocationRef.current) return;

    let fallbackTimeoutId: number;
    let readyTimeoutId: number;
    let hasTracked = false;

    const trackPageView = () => {
      if (hasTracked || !document.title) return;
      hasTracked = true;

      const pageReferrer =
        lastPageLocationRef.current || initialReferrerRef.current || '';
      trackGoogleAnalyticsPageView(pageLocation, pageReferrer);
      lastPageLocationRef.current = pageLocation;
      lastPageTitleRef.current = document.title;
      observer.disconnect();
      window.clearTimeout(fallbackTimeoutId);
      window.clearTimeout(readyTimeoutId);
    };

    const trackWhenTitleIsReady = () => {
      if (document.title !== lastPageTitleRef.current) trackPageView();
    };

    const observer = new MutationObserver(trackWhenTitleIsReady);
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    readyTimeoutId = window.setTimeout(trackWhenTitleIsReady, 0);
    fallbackTimeoutId = window.setTimeout(trackPageView, 3000);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallbackTimeoutId);
      window.clearTimeout(readyTimeoutId);
    };
  }, [location.pathname]);

  return null;
}
