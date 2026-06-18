const fallbackSiteUrl = 'https://orz2.online';

export const siteUrl = (
  import.meta.env.VITE_SITE_URL || fallbackSiteUrl
).replace(/\/$/, '');

export function isAbsoluteUrl(value: string) {
  return /^[a-z][a-z\d+.-]*:/i.test(value);
}

export function toSiteUrl(path = '/') {
  if (!path) return `${siteUrl}/`;
  if (isAbsoluteUrl(path)) return path;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return normalizedPath === '/' ? `${siteUrl}/` : `${siteUrl}${normalizedPath}`;
}
