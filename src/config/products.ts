import type { CatalogBaseItem } from '@/types/catalog';

const products = [
  {
    id: 'silicon',
    group: 'ai-community',
    media: {
      kind: 'image',
      src: 'https://cos.orz2.online/Logo/silicon/silicon_160x160.webp',
    },
    lifecycle: {
      stage: 'LIVE',
      version: '1.4.0',
      updatedAt: '2026-06-03',
    },
    platform: ['web'],
    entries: [
      {
        id: 'web',
        kind: 'link',
        href: '/products/silicon',
        qrValue: 'https://orz2.online/products/silicon',
        primary: true,
      },
    ],
    compact: true,
  },
  {
    id: 'weather',
    group: 'saas-multi-platform',
    media: {
      kind: 'image',
      src: 'https://cos.orz2.online/Logo/weather/weather_160x160.webp',
    },
    lifecycle: {
      stage: 'LIVE',
      version: '1.2.0',
      updatedAt: '2026-06-03',
    },
    platform: ['h5', 'weapp'],
    entries: [
      {
        id: 'h5',
        kind: 'link',
        href: 'https://orz2.online/portal/smart-app/weather/',
        qrValue: 'https://orz2.online/portal/smart-app/weather/',
      },
      {
        id: 'wechat-mini',
        kind: 'sunCode',
        imageUrl:
          'https://cos.orz2.online/Orz2/Projects/weather/weapp_release_430x430.webp',
        primary: true,
      },
    ],
    compact: true,
  },
  {
    id: 'zero',
    group: 'saas-multi-platform',
    media: {
      kind: 'image',
      src: 'https://cos.orz2.online/Logo/zero/zero_160x160.webp',
    },
    lifecycle: {
      stage: 'LIVE',
      version: '1.1.0',
      updatedAt: '2026-06-03',
    },
    platform: ['h5', 'weapp'],
    entries: [
      {
        id: 'h5',
        kind: 'link',
        href: 'https://orz2.online/portal/smart-app/zero/',
        qrValue: 'https://orz2.online/portal/smart-app/zero/',
      },
      {
        id: 'wechat-mini',
        kind: 'sunCode',
        imageUrl:
          'https://cos.orz2.online/Orz2/Projects/zero/weapp_release_430x430.webp',
        primary: true,
      },
    ],
    compact: true,
  },
  {
    id: 'carbon',
    group: 'saas-multi-platform',
    media: {
      kind: 'image',
      src: 'https://cos.orz2.online/Logo/carbon/carbon_160x160.webp',
    },
    lifecycle: {
      stage: 'LIVE',
      version: '1.1.0',
      updatedAt: '2026-06-03',
    },
    platform: ['h5', 'weapp'],
    entries: [
      {
        id: 'h5',
        kind: 'link',
        href: 'https://orz2.online/portal/smart-app/carbon/',
        qrValue: 'https://orz2.online/portal/smart-app/carbon/',
      },
      {
        id: 'wechat-mini',
        kind: 'sunCode',
        imageUrl:
          'https://cos.orz2.online/Orz2/Projects/carbon/weapp_release_430x430.webp',
        primary: true,
      },
    ],
    compact: true,
  },
  {
    id: 'code-maker',
    group: 'browser-editor-extensions',
    media: {
      kind: 'image',
      src: 'https://cos.orz2.online/Logo/code-maker/code-maker_160x160.webp',
    },
    lifecycle: {
      stage: 'LIVE',
      version: '0.3.0',
      updatedAt: '2026-06-03',
    },
    platform: ['extension'],
    entries: [
      {
        id: 'marketplace',
        kind: 'link',
        href: 'https://marketplace.visualstudio.com/items?itemName=gengjian1203.code-maker',
        primary: true,
      },
    ],
  },
  {
    id: 'leafy-note',
    group: 'browser-editor-extensions',
    media: {
      kind: 'image',
      src: 'https://cos.orz2.online/Logo/leafy-note/leafy-note_160x160.webp',
    },
    lifecycle: {
      stage: 'LIVE',
      version: '0.6.0',
      updatedAt: '2026-07-04',
    },
    platform: ['extension'],
    entries: [
      {
        id: 'chrome-web-store',
        kind: 'link',
        href: 'https://leafy-note.xshuliner.online',
        primary: true,
      },
    ],
  },
  {
    id: 'fiveball',
    group: 'interactive-games',
    media: {
      kind: 'image',
      src: 'https://cos.orz2.online/Logo/fiveball/fiveball_160x160.webp',
    },
    lifecycle: {
      stage: 'LIVE',
      version: '1.0.0',
      updatedAt: '2026-06-03',
    },
    platform: ['h5'],
    entries: [
      {
        id: 'h5-game',
        kind: 'link',
        href: 'https://orz2.online/portal/fiveball',
        qrValue: 'https://orz2.online/portal/fiveball',
        primary: true,
      },
    ],
  },
  {
    id: 'mathcookies',
    group: 'interactive-games',
    media: {
      kind: 'image',
      src: 'https://cos.orz2.online/Logo/mathcookies/mathcookies_160x160.webp',
    },
    lifecycle: {
      stage: 'LIVE',
      version: '1.0.0',
      updatedAt: '2026-06-03',
    },
    platform: ['h5'],
    entries: [
      {
        id: 'h5-game',
        kind: 'link',
        href: 'https://orz2.online/portal/mathcookies',
        qrValue: 'https://orz2.online/portal/mathcookies',
        primary: true,
      },
    ],
  },
  {
    id: 'orz2-blog',
    group: 'personal-blog',
    media: {
      kind: 'image',
      src: 'https://orz2.online/gengjian1203/images/head.jpg',
    },
    lifecycle: {
      stage: 'LIVE',
      version: '1.0.0',
      updatedAt: '2026-06-03',
    },
    platform: ['web', 'h5'],
    entries: [
      {
        id: 'web',
        kind: 'link',
        href: 'https://orz2.online/gengjian1203',
        qrValue: 'https://orz2.online/gengjian1203',
        primary: true,
      },
    ],
  },
] satisfies CatalogBaseItem[];

export default products;
