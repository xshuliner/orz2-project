import {
  initGoogleAnalytics,
  trackGoogleAnalyticsPageView,
} from '@/utils/googleAnalytics';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    initGoogleAnalytics();
  }, []);

  useEffect(() => {
    const path = `${location.pathname}${location.search}${location.hash}`;
    const timeoutId = window.setTimeout(() => {
      trackGoogleAnalyticsPageView(path);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [location.hash, location.pathname, location.search]);

  return null;
}
