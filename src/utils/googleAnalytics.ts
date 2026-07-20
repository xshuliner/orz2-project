type GoogleAnalyticsEventParameters = {
  page_location?: string;
  page_path?: string;
  page_title?: string;
};

declare global {
  interface Window {
    gtag?: (
      command: 'event',
      eventName: string,
      parameters: GoogleAnalyticsEventParameters
    ) => void;
  }
}

const googleAnalyticsId =
  import.meta.env.VITE_GOOGLE_ANALYTICS_ID?.trim() || '';
const siteHostname = getSiteHostname();

function getSiteHostname() {
  try {
    const siteUrl = import.meta.env.VITE_SITE_URL;

    return siteUrl ? new URL(siteUrl).hostname : '';
  } catch {
    return '';
  }
}

function isValidGoogleAnalyticsId(id: string) {
  return /^G-[A-Z0-9]+$/.test(id);
}

function isLocalHostname(hostname: string) {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    hostname.endsWith('.local')
  );
}

function isProductionHostname(hostname: string) {
  if (!siteHostname) return false;

  return hostname === siteHostname || hostname === `www.${siteHostname}`;
}

export function canUseGoogleAnalytics() {
  if (!isValidGoogleAnalyticsId(googleAnalyticsId)) return false;
  if (import.meta.env.VITE_APP_ENV !== 'prod') return false;
  if (typeof window === 'undefined') return false;
  if (!isProductionHostname(window.location.hostname)) return false;

  return !isLocalHostname(window.location.hostname);
}

export function trackGoogleAnalyticsPageView(path: string) {
  if (!canUseGoogleAnalytics()) return;

  window.gtag?.('event', 'page_view', {
    page_location: window.location.href,
    page_path: path,
    page_title: document.title,
  });
}
