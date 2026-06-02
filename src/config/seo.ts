import { siteConfig } from '@/config';
import { products, tools } from '@/config/site';
import type { SeoConfig, Tool } from '@/types';

export const siteUrl = 'https://orz2.com';
export const siteName = 'ORZ2';
export const defaultImageOg =
  'https://cos.orz2.online/Orz2/Logo/logo_light_320x320.webp';
export const defaultImageLogo =
  'https://cos.orz2.online/Orz2/Logo/logo_light_320x320.webp';

export function routeUrl(path: string) {
  return path === '/' ? `${siteUrl}/` : `${siteUrl}${path}`;
}

export const pageSeo: Record<string, SeoConfig> = {
  home: {
    title: 'ORZ2 - 在线 AI 工具与效率工具平台',
    description:
      'ORZ2 汇集 AI 写作、图片处理、开发调试、营销和办公效率工具，并提供可定制的商业化工具站方案。',
    canonicalPath: '/',
    ogImage: defaultImageOg,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteName,
        url: routeUrl('/'),
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
        url: routeUrl('/'),
        potentialAction: {
          '@type': 'SearchAction',
          target: `${routeUrl('/tools')}?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  },
  products: {
    title: '产品展示 - ORZ2',
    description:
      '浏览 ORZ2 已落地的产品实践，包括智能小程序、浏览器与编辑器扩展和互动游戏。',
    canonicalPath: '/products',
    ogImage: defaultImageOg,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'ORZ2 产品展示',
        itemListElement: products.map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: product.name,
        })),
      },
    ],
  },
  tools: {
    title: '在线工具 - ORZ2',
    description:
      '浏览 ORZ2 在线工具目录，查找公众号自动发布、JSON 格式化、配色和图片压缩工具。',
    canonicalPath: '/tools',
    ogImage: defaultImageOg,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'ORZ2 在线工具目录',
        itemListElement: tools.map((tool, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          ...(tool.href ? { url: routeUrl(tool.href) } : {}),
          name: tool.name,
        })),
      },
    ],
  },
  team: {
    title: '团队 - ORZ2',
    description:
      '认识 ORZ2 团队：项目、研发、产品、设计、财务和 HR 一起打造稳定、合规、可扩展的在线工具平台。',
    canonicalPath: '/team',
    ogImage: defaultImageOg,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'ORZ2 团队',
        url: routeUrl('/team'),
      },
    ],
  },
  privacy: {
    title: '隐私协议 - ORZ2',
    description:
      '了解 ORZ2 如何处理必要信息、Cookie、第三方服务、广告合规和用户隐私权利。',
    canonicalPath: '/privacy',
    ogImage: defaultImageOg,
  },
  designSystem: {
    title: '设计系统 - ORZ2',
    description:
      '浏览 ORZ2 公共组件、视觉 token、卡片、按钮、标签、空状态与弹窗实例。',
    canonicalPath: '/design-system',
    ogImage: defaultImageOg,
  },
};

export const toolSeo = Object.fromEntries(
  tools
    .filter((tool): tool is Tool & { href: string } => Boolean(tool.href))
    .map(tool => [
      tool.slug,
      {
        title: tool.seoTitle,
        description: tool.seoDescription,
        canonicalPath: tool.href,
        ogImage: tool.ogImage,
        keywords: tool.keywords,
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': tool.schemaType,
            name: tool.name,
            applicationCategory: tool.category,
            operatingSystem: 'Web',
            url: routeUrl(tool.href),
            description: tool.seoDescription,
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
