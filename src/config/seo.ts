import { siteConfig } from '@/config';
import { defaultLocale, getMessages, localizePath, type Locale } from '@/i18n';
import { getProducts, getTools } from '@/i18n/catalog';
import type { CatalogEntry, CatalogItem, SeoConfig } from '@/types';

export const siteUrl = 'https://orz2.com';
export const siteName = 'ORZ2';
export const defaultImageOg =
  'https://cos.orz2.online/Logo/orz2/logo_light_320x320.webp';
export const defaultImageLogo =
  'https://cos.orz2.online/Logo/orz2/logo_light_320x320.webp';

export function routeUrl(path: string, locale: Locale = defaultLocale) {
  const localized = localizePath(path, locale);
  return localized === '/' ? `${siteUrl}/` : `${siteUrl}${localized}`;
}

function getPrimaryLink(item: CatalogItem) {
  return (
    item.entries.find(
      (entry): entry is Extract<CatalogEntry, { kind: 'link' }> =>
        entry.kind === 'link' && Boolean(entry.primary)
    ) ??
    item.entries.find(
      (entry): entry is Extract<CatalogEntry, { kind: 'link' }> =>
        entry.kind === 'link'
    )
  );
}

function entryUrl(
  entry: Extract<CatalogEntry, { kind: 'link' }>,
  locale: Locale
) {
  return entry.href.startsWith('/') ? routeUrl(entry.href, locale) : entry.href;
}

export function getPageSeo(locale: Locale): Record<string, SeoConfig> {
  const m = getMessages(locale);
  const products = getProducts(locale);
  const tools = getTools(locale);

  return {
    home: {
      title: m.seo.home.title,
      description: m.seo.home.description,
      canonicalPath: '/',
      ogImage: defaultImageOg,
      locale,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: siteName,
          url: routeUrl('/', locale),
          logo: defaultImageLogo,
          contactPoint: {
            '@type': 'ContactPoint',
            email: siteConfig.contactEmail,
            contactType: 'customer support',
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: siteName,
          url: routeUrl('/', locale),
          potentialAction: {
            '@type': 'SearchAction',
            target: `${routeUrl('/tools', locale)}?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        },
      ],
    },
    products: {
      title: m.seo.products.title,
      description: m.seo.products.description,
      canonicalPath: '/products',
      ogImage: defaultImageOg,
      locale,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: m.seo.products.itemListName,
          itemListElement: products.map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: product.name,
          })),
        },
      ],
    },
    tools: {
      title: m.seo.tools.title,
      description: m.seo.tools.description,
      canonicalPath: '/tools',
      ogImage: defaultImageOg,
      locale,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: m.seo.tools.itemListName,
          itemListElement: tools.map((tool, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            ...(getPrimaryLink(tool)
              ? { url: entryUrl(getPrimaryLink(tool)!, locale) }
              : {}),
            name: tool.name,
          })),
        },
      ],
    },
    team: {
      title: m.seo.team.title,
      description: m.seo.team.description,
      canonicalPath: '/team',
      ogImage: defaultImageOg,
      locale,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: m.seo.team.pageName,
          url: routeUrl('/team', locale),
        },
      ],
    },
    privacy: {
      title: m.seo.privacy.title,
      description: m.seo.privacy.description,
      canonicalPath: '/privacy',
      ogImage: defaultImageOg,
      locale,
    },
    designSystem: {
      title: m.seo.designSystem.title,
      description: m.seo.designSystem.description,
      canonicalPath: '/design-system',
      ogImage: defaultImageOg,
      locale,
    },
    buildInfo: {
      title: m.seo.buildInfo.title,
      description: m.seo.buildInfo.description,
      canonicalPath: '/build-info',
      ogImage: defaultImageOg,
      locale,
      robots: 'noindex, follow',
    },
  };
}

export function getToolSeo(locale: Locale) {
  const tools = getTools(locale);
  return Object.fromEntries(
    tools
      .filter(tool => Boolean(tool.seo?.slug && getPrimaryLink(tool)))
      .map(tool => [
        tool.seo!.slug,
        {
          title: tool.seo!.title,
          description: tool.seo!.description,
          canonicalPath: getPrimaryLink(tool)!.href,
          ogImage: tool.seo!.ogImage,
          keywords: tool.seo!.keywords,
          locale,
          jsonLd: [
            {
              '@context': 'https://schema.org',
              '@type': tool.seo!.schemaType ?? 'SoftwareApplication',
              name: tool.name,
              applicationCategory: tool.group,
              operatingSystem: 'Web',
              url: entryUrl(getPrimaryLink(tool)!, locale),
              description: tool.seo!.description,
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            },
          ],
        } satisfies SeoConfig,
      ])
  );
}

export const pageSeo = getPageSeo(defaultLocale);
export const toolSeo = getToolSeo(defaultLocale);
