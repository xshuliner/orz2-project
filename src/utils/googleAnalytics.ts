type GtagParameters =
  | ['js', Date]
  | [
      'config',
      string,
      {
        send_page_view?: boolean;
      },
    ]
  | [
      'event',
      string,
      {
        page_location?: string;
        page_path?: string;
        page_title?: string;
      },
    ];

declare global {
  interface Window {
    dataLayer?: GtagParameters[];
    gtag?: (...args: GtagParameters) => void;
  }
}

const googleAnalyticsId =
  import.meta.env.VITE_GOOGLE_ANALYTICS_ID?.trim() || '';
const googleAnalyticsScriptId = 'google-analytics-gtag';
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

export function initGoogleAnalytics() {
  if (!canUseGoogleAnalytics()) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    ((...args: GtagParameters) => {
      window.dataLayer?.push(args);
    });

  if (!document.getElementById(googleAnalyticsScriptId)) {
    const script = document.createElement('script');
    script.id = googleAnalyticsScriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
      googleAnalyticsId
    )}`;
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', googleAnalyticsId, { send_page_view: false });
  }
}

export function trackGoogleAnalyticsPageView(path: string) {
  if (!canUseGoogleAnalytics()) return;

  initGoogleAnalytics();

  window.gtag?.('event', 'page_view', {
    page_location: window.location.href,
    page_path: path,
    page_title: document.title,
  });
}
