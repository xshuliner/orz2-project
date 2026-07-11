import type { CatalogBaseItem } from '@/types/catalog';

const tools = [
  {
    id: 'tool-wechat-publisher',
    group: 'ops-productivity',
    media: {
      kind: 'icon',
      name: 'Send',
    },
    lifecycle: {
      stage: 'LIVE',
      version: '0.6.0',
      updatedAt: '2026-06-03',
    },
    platform: ['web'],
    heroBadges: [
      { id: 'ai-content', icon: 'Sparkles' },
      { id: 'wechat-drafts', icon: 'Send' },
      { id: 'one-click-publish', icon: 'CheckCircle2' },
    ],
    entries: [
      {
        id: 'web',
        kind: 'link',
        href: '/tools/official-publisher',
        qrValue: 'https://orz2.online/tools/official-publisher',
        primary: true,
      },
    ],
    seo: {
      slug: 'official-publisher',
      ogImage: 'https://cos.orz2.online/Logo/orz2/logo_dark_320x320.webp',
      schemaType: 'SoftwareApplication',
    },
    compact: true,
  },
  {
    id: 'tool-image',
    group: 'image-design',
    media: {
      kind: 'icon',
      name: 'ImageDown',
    },
    lifecycle: {
      stage: 'LIVE',
      version: '0.2.0',
      updatedAt: '2026-06-08',
    },
    platform: ['web'],
    heroBadges: [
      { id: 'batch-process', icon: 'Images' },
      { id: 'resize-convert', icon: 'Maximize2' },
      { id: 'zip-download', icon: 'Download' },
    ],
    entries: [
      {
        id: 'web',
        kind: 'link',
        href: '/tools/smart-image-compressor',
        qrValue: 'https://orz2.online/tools/smart-image-compressor',
        primary: true,
      },
    ],
    seo: {
      slug: 'smart-image-compressor',
      ogImage: 'https://cos.orz2.online/Logo/orz2/logo_dark_320x320.webp',
      schemaType: 'SoftwareApplication',
    },
    compact: true,
  },
  {
    id: 'tool-timezone',
    group: 'ops-productivity',
    media: {
      kind: 'icon',
      name: 'Globe2',
    },
    lifecycle: {
      stage: 'LIVE',
      version: '0.1.0',
      updatedAt: '2026-07-03',
    },
    platform: ['web'],
    heroBadges: [
      { id: 'country-presets', icon: 'Globe2' },
      { id: 'two-way-convert', icon: 'CalendarClock' },
      { id: 'dst-aware', icon: 'CheckCircle2' },
    ],
    entries: [
      {
        id: 'web',
        kind: 'link',
        href: '/tools/timezone-converter',
        qrValue: 'https://orz2.online/tools/timezone-converter',
        primary: true,
      },
    ],
    seo: {
      slug: 'timezone-converter',
      ogImage: 'https://cos.orz2.online/Logo/orz2/logo_dark_320x320.webp',
      schemaType: 'SoftwareApplication',
    },
    compact: true,
  },
  {
    id: 'tool-work-report-polisher',
    group: 'ops-productivity',
    media: {
      kind: 'icon',
      name: 'ClipboardPenLine',
    },
    lifecycle: {
      stage: 'LIVE',
      version: '0.1.0',
      updatedAt: '2026-07-04',
    },
    platform: ['web'],
    heroBadges: [
      { id: 'natural-wording', icon: 'Sparkles' },
      { id: 'facts-intact', icon: 'CheckCircle2' },
      { id: 'daily-weekly', icon: 'FileText' },
    ],
    entries: [
      {
        id: 'web',
        kind: 'link',
        href: '/tools/work-report-polisher',
        qrValue: 'https://orz2.online/tools/work-report-polisher',
        primary: true,
      },
    ],
    seo: {
      slug: 'work-report-polisher',
      ogImage: 'https://cos.orz2.online/Logo/orz2/logo_dark_320x320.webp',
      schemaType: 'SoftwareApplication',
    },
    compact: true,
  },
  {
    id: 'tool-json',
    group: 'developer-debugging',
    media: {
      kind: 'icon',
      name: 'Braces',
    },
    lifecycle: {
      stage: 'LIVE',
      version: '1.0.0',
      updatedAt: '2026-07-11',
    },
    platform: ['web'],
    heroBadges: [
      { id: 'json-input', icon: 'Braces' },
      { id: 'format-minify', icon: 'Wand2' },
      { id: 'syntax-validate', icon: 'CheckCircle2' },
    ],
    entries: [
      {
        id: 'web',
        kind: 'link',
        href: '/tools/json-formatter',
        qrValue: 'https://orz2.online/tools/json-formatter',
        primary: true,
      },
    ],
    seo: {
      slug: 'json-formatter',
      ogImage: 'https://cos.orz2.online/Logo/orz2/logo_dark_320x320.webp',
      schemaType: 'SoftwareApplication',
    },
  },
  {
    id: 'tool-color',
    group: 'image-design',
    media: {
      kind: 'icon',
      name: 'Palette',
    },
    lifecycle: {
      stage: 'LIVE',
      version: '1.0.0',
      updatedAt: '2026-07-11',
    },
    platform: ['web'],
    heroBadges: [
      { id: 'color-picker', icon: 'Palette' },
      { id: 'contrast-check', icon: 'Eye' },
      { id: 'accessibility', icon: 'CheckCircle2' },
    ],
    entries: [
      {
        id: 'web',
        kind: 'link',
        href: '/tools/palette-lab',
        qrValue: 'https://orz2.online/tools/palette-lab',
        primary: true,
      },
    ],
    seo: {
      slug: 'palette-lab',
      ogImage: 'https://cos.orz2.online/Logo/orz2/logo_dark_320x320.webp',
      schemaType: 'SoftwareApplication',
    },
  },
  {
    id: 'tool-base64',
    group: 'developer-debugging',
    media: {
      kind: 'icon',
      name: 'Workflow',
    },
    lifecycle: {
      stage: 'LIVE',
      version: '1.0.0',
      updatedAt: '2026-07-11',
    },
    platform: ['web'],
    heroBadges: [
      { id: 'text-convert', icon: 'Workflow' },
      { id: 'unicode-compatible', icon: 'CheckCircle2' },
      { id: 'instant-result', icon: 'Wand2' },
    ],
    entries: [
      {
        id: 'web',
        kind: 'link',
        href: '/tools/base64-converter',
        qrValue: 'https://orz2.online/tools/base64-converter',
        primary: true,
      },
    ],
    seo: {
      slug: 'base64-converter',
      ogImage: 'https://cos.orz2.online/Logo/orz2/logo_dark_320x320.webp',
      schemaType: 'SoftwareApplication',
    },
  },
  {
    id: 'tool-markdown',
    group: 'developer-debugging',
    media: {
      kind: 'icon',
      name: 'Workflow',
    },
    lifecycle: {
      stage: 'LIVE',
      version: '1.0.0',
      updatedAt: '2026-07-11',
    },
    platform: ['web'],
    heroBadges: [
      { id: 'live-editor', icon: 'Clipboard' },
      { id: 'instant-preview', icon: 'Eye' },
      { id: 'code-blocks', icon: 'Braces' },
    ],
    entries: [
      {
        id: 'web',
        kind: 'link',
        href: '/tools/markdown-editor',
        qrValue: 'https://orz2.online/tools/markdown-editor',
        primary: true,
      },
    ],
    seo: {
      slug: 'markdown-editor',
      ogImage: 'https://cos.orz2.online/Logo/orz2/logo_dark_320x320.webp',
      schemaType: 'SoftwareApplication',
    },
  },
  {
    id: 'tool-qrcode',
    group: 'developer-debugging',
    media: {
      kind: 'icon',
      name: 'Workflow',
    },
    lifecycle: {
      stage: 'LIVE',
      version: '1.0.0',
      updatedAt: '2026-07-11',
    },
    platform: ['web'],
    heroBadges: [
      { id: 'custom-content', icon: 'QrCode' },
      { id: 'size-control', icon: 'Maximize2' },
      { id: 'png-download', icon: 'Download' },
    ],
    entries: [
      {
        id: 'web',
        kind: 'link',
        href: '/tools/qrcode-generator',
        qrValue: 'https://orz2.online/tools/qrcode-generator',
        primary: true,
      },
    ],
    seo: {
      slug: 'qrcode-generator',
      ogImage: 'https://cos.orz2.online/Logo/orz2/logo_dark_320x320.webp',
      schemaType: 'SoftwareApplication',
    },
  },
] satisfies CatalogBaseItem[];

export default tools;
