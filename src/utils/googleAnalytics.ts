type GoogleAnalyticsEventParameters = {
  page_location?: string;
  page_referrer?: string;
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

const campaignParameterNames = new Set([
  'dclid',
  'gbraid',
  'gclid',
  'utm_campaign',
  'utm_content',
  'utm_id',
  'utm_medium',
  'utm_source',
  'utm_term',
  'wbraid',
]);

function sanitizeGoogleAnalyticsUrl(value: string, keepCampaign = false) {
  if (!value) return '';

  try {
    const url = new URL(value, window.location.origin);
    const campaignParameters = new URLSearchParams();

    if (keepCampaign) {
      url.searchParams.forEach((parameterValue, parameterName) => {
        if (campaignParameterNames.has(parameterName.toLowerCase())) {
          campaignParameters.append(parameterName, parameterValue);
        }
      });
    }

    url.search = campaignParameters.toString();
    url.hash = '';
    return url.href;
  } catch {
    return '';
  }
}

export function getGoogleAnalyticsPageLocation() {
  return sanitizeGoogleAnalyticsUrl(window.location.href, true);
}

export function getGoogleAnalyticsInitialReferrer() {
  return sanitizeGoogleAnalyticsUrl(document.referrer);
}

export function trackGoogleAnalyticsPageView(
  pageLocation: string,
  pageReferrer: string
) {
  if (!canUseGoogleAnalytics()) return;

  window.gtag?.('event', 'page_view', {
    page_location: pageLocation,
    page_referrer: pageReferrer,
    page_title: document.title,
  });
}
