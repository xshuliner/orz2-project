import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer, loadEnv } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const mode = process.argv[2] || 'prod';
const env = {
  ...loadEnv(mode, rootDir, 'SITE_'),
  ...loadEnv(mode, rootDir, 'VITE_'),
};

function defaultSiteUrl(mode) {
  return mode === 'uat' ? 'https://orz2.online/uat' : 'https://orz2.online';
}

const siteUrl = env.SITE_URL || env.VITE_SITE_URL || defaultSiteUrl(mode);

const locales = ['zh-CN', 'en', 'ja'];
const defaultLocale = 'zh-CN';
const localePrefixes = {
  'zh-CN': '',
  en: 'en',
  ja: 'ja',
};

const stripTrailingSlash = value => value.replace(/\/$/, '');
const normalizedSiteUrl = stripTrailingSlash(siteUrl);

function localizePath(path, locale) {
  const prefix = localePrefixes[locale];
  if (!prefix) return path;
  return path === '/' ? `/${prefix}` : `/${prefix}${path}`;
}

function routeUrl(path, locale = defaultLocale) {
  const localizedPath = localizePath(path, locale);
  return localizedPath === '/'
    ? `${normalizedSiteUrl}/`
    : `${normalizedSiteUrl}${localizedPath}`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

const pages = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/products', changefreq: 'weekly', priority: '0.9' },
  { path: '/tools', changefreq: 'weekly', priority: '0.9' },
  { path: '/team', changefreq: 'monthly', priority: '0.7' },
  { path: '/privacy', changefreq: 'monthly', priority: '0.6' },
  { path: '/design-system', changefreq: 'monthly', priority: '0.6' },
];

async function loadTools() {
  const server = await createServer({
    root: rootDir,
    logLevel: 'error',
    optimizeDeps: {
      include: [],
      noDiscovery: true,
    },
    server: { middlewareMode: true },
    appType: 'custom',
  });

  try {
    const module = await server.ssrLoadModule('/src/config/tools.ts');
    return module.default;
  } finally {
    await server.close();
  }
}

const tools = await loadTools();

const urls = [
  ...pages,
  ...tools
    .map(tool =>
      tool.entries?.find(
        entry =>
          entry.kind === 'link' && entry.primary && entry.href.startsWith('/')
      )
    )
    .filter(Boolean)
    .map(entry => ({
      path: entry.href,
      changefreq: 'weekly',
      priority: '0.8',
    })),
];

function alternateLinks(path) {
  const alternates = [
    ...locales.map(locale => ({
      hrefLang: locale,
      href: routeUrl(path, locale),
    })),
    { hrefLang: 'x-default', href: routeUrl(path, defaultLocale) },
  ];

  return alternates
    .map(
      alternate =>
        `    <xhtml:link rel="alternate" hreflang="${escapeXml(alternate.hrefLang)}" href="${escapeXml(alternate.href)}" />`
    )
    .join('\n');
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
  .flatMap(url => locales.map(locale => ({ ...url, locale })))
  .map(
    url => `  <url>
    <loc>${escapeXml(routeUrl(url.path, url.locale))}</loc>
${alternateLinks(url.path)}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

await writeFile(new URL('../public/sitemap.xml', import.meta.url), xml);
