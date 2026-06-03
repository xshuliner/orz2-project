import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const mode = process.argv[2] || 'prod';
const env = loadEnv(mode, rootDir, 'SITE_');
const siteUrl = env.SITE_URL || 'https://orz2.com';

const routeUrl = path => (path === '/' ? `${siteUrl}/` : `${siteUrl}${path}`);
const pages = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/products', changefreq: 'weekly', priority: '0.9' },
  { path: '/tools', changefreq: 'weekly', priority: '0.9' },
  { path: '/team', changefreq: 'monthly', priority: '0.7' },
  { path: '/privacy', changefreq: 'monthly', priority: '0.6' },
  { path: '/design-system', changefreq: 'monthly', priority: '0.6' },
];

const tools = JSON.parse(
  await readFile(new URL('../src/config/tools.json', import.meta.url), 'utf8')
);

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

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    url => `  <url>
    <loc>${routeUrl(url.path)}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

await writeFile(new URL('../public/sitemap.xml', import.meta.url), xml);
