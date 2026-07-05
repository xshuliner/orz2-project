import type { CatalogItem } from '@/types/catalog';

const tools = [
  {
    id: 'tool-wechat-publisher',
    name: '公众号自动发布',
    group: '运营与效率',
    summary:
      '配置公众号凭据、文章提示词、封面图和内嵌图片，一站式准备自动发布任务。',
    media: {
      kind: 'icon',
      name: 'Send',
    },
    badges: ['AI', '公众号', '自动发布', 'LLM', '内容运营'],
    lifecycle: {
      stage: 'BETA',
      version: '0.6.0',
      updatedAt: '2026-06-03',
    },
    platform: ['web'],
    entries: [
      {
        id: 'web',
        kind: 'link',
        label: '工具入口',
        href: '/tools/official-publisher',
        qrValue: 'https://orz2.online/tools/official-publisher',
        primary: true,
      },
    ],
    seo: {
      slug: 'official-publisher',
      title: '公众号自动发布工具 - ORZ2 内容运营工具',
      description:
        '使用 ORZ2 公众号自动发布工具配置 appId、appSecret、文章提示词、封面图和图片素材，准备自动化发布任务。',
      keywords: [
        '公众号自动发布',
        '微信公众号工具',
        'AI文章生成',
        '内容运营工具',
      ],
      ogImage: 'https://cos.orz2.online/Logo/orz2/logo_dark_320x320.webp',
      schemaType: 'SoftwareApplication',
    },
    compact: true,
  },
  {
    id: 'tool-image',
    name: '批量图片处理',
    group: '图片与设计',
    summary:
      '一次上传多张图片，统一完成格式转换、尺寸缩放、TinyPNG 压缩，并打包下载结果。',
    media: {
      kind: 'icon',
      name: 'ImageDown',
    },
    badges: ['图片', '批量', '转换', '缩放', 'ZIP'],
    lifecycle: {
      stage: 'BETA',
      version: '0.2.0',
      updatedAt: '2026-06-08',
    },
    platform: ['web'],
    entries: [
      {
        id: 'web',
        kind: 'link',
        label: '工具入口',
        href: '/tools/smart-image-compressor',
        qrValue: 'https://orz2.online/tools/smart-image-compressor',
        primary: true,
      },
    ],
    seo: {
      slug: 'smart-image-compressor',
      title: '批量图片处理工具 - ORZ2 在线图片工具',
      description:
        'ORZ2 批量图片处理工具支持多图上传预览、统一格式转换、尺寸缩放、TinyPNG 压缩和 ZIP 打包下载。',
      keywords: [
        '批量图片处理',
        '图片压缩',
        '格式转换',
        '图片缩放',
        'ZIP 下载',
      ],
      ogImage: 'https://cos.orz2.online/Logo/orz2/logo_dark_320x320.webp',
      schemaType: 'SoftwareApplication',
    },
    compact: true,
  },
  {
    id: 'tool-timezone',
    name: '时区转换器',
    group: '运营与效率',
    summary:
      '选择常见国家，输入任一侧本地时间，自动换算另一侧时间，并按当地夏令时规则处理。',
    media: {
      kind: 'icon',
      name: 'Globe2',
    },
    badges: ['时区', '国家', '夏令时', '效率'],
    lifecycle: {
      stage: 'BETA',
      version: '0.1.0',
      updatedAt: '2026-07-03',
    },
    platform: ['web'],
    entries: [
      {
        id: 'web',
        kind: 'link',
        label: '工具入口',
        href: '/tools/timezone-converter',
        qrValue: 'https://orz2.online/tools/timezone-converter',
        primary: true,
      },
    ],
    seo: {
      slug: 'timezone-converter',
      title: '时区转换器 - ORZ2 在线效率工具',
      description:
        'ORZ2 时区转换器支持中国、美国、日本、英国等常见国家时间互转，并依据 IANA 时区规则处理夏令时与冬令时。',
      keywords: ['时区转换器', '时间换算', '夏令时', '美国时间', '中国时间'],
      ogImage: 'https://cos.orz2.online/Logo/orz2/logo_dark_320x320.webp',
      schemaType: 'SoftwareApplication',
    },
    compact: true,
  },
  {
    id: 'tool-work-report-polisher',
    name: '日/周报润色',
    group: '运营与效率',
    summary:
      '把零散工作记录整理成自然、克制、像人写的日/周报，保留事实，不夸大表达。',
    media: {
      kind: 'icon',
      name: 'ClipboardPenLine',
    },
    badges: ['AI', '日报', '周报', '职场写作'],
    lifecycle: {
      stage: 'BETA',
      version: '0.1.0',
      updatedAt: '2026-07-04',
    },
    platform: ['web'],
    entries: [
      {
        id: 'web',
        kind: 'link',
        label: '工具入口',
        href: '/tools/work-report-polisher',
        qrValue: 'https://orz2.online/tools/work-report-polisher',
        primary: true,
      },
    ],
    seo: {
      slug: 'work-report-polisher',
      title: '日/周报润色工具 - ORZ2 在线效率工具',
      description:
        'ORZ2 日/周报润色工具可将工作记录整理为自然克制的日报或周报，保留事实、减少 AI 味，适合日常工作汇报。',
      keywords: ['日报润色', '周报润色', '工作总结', '职场写作', 'AI润色'],
      ogImage: 'https://cos.orz2.online/Logo/orz2/logo_dark_320x320.webp',
      schemaType: 'SoftwareApplication',
    },
    compact: true,
  },
  {
    id: 'tool-json',
    name: 'JSON 格式化',
    group: '开发调试',
    summary: '支持语法高亮和错误检测的 JSON 数据格式化、验证和美化工具',
    media: {
      kind: 'icon',
      name: 'Braces',
    },
    badges: ['JSON', '开发', '校验'],
    lifecycle: {
      stage: 'PLANNING',
      version: '0.1.0',
      updatedAt: '2026-06-03',
    },
    platform: ['web'],
    entries: [],
    seo: {
      slug: 'json-formatter',
      title: 'JSON 格式化工具 - ORZ2 开发者工具',
      description: '使用 ORZ2 JSON 格式化工具在线整理、校验和查看 JSON 数据。',
      keywords: ['JSON格式化', '开发者工具', 'JSON校验'],
      ogImage: 'https://cos.orz2.online/Logo/orz2/logo_dark_320x320.webp',
      schemaType: 'SoftwareApplication',
    },
  },
  {
    id: 'tool-color',
    name: '配色实验室',
    group: '图片与设计',
    summary: '专业的颜色选择工具，支持多种颜色格式和调色板',
    media: {
      kind: 'icon',
      name: 'Palette',
    },
    badges: ['配色', '设计', '可访问性'],
    lifecycle: {
      stage: 'PLANNING',
      version: '0.1.0',
      updatedAt: '2026-06-03',
    },
    platform: ['web'],
    entries: [],
    seo: {
      slug: 'palette-lab',
      title: '配色实验室 - ORZ2 在线设计工具',
      description:
        'ORZ2 配色实验室帮助设计师和开发者生成品牌色、检查对比度并导出色值。',
      keywords: ['在线配色', '设计工具', '颜色对比度'],
      ogImage: 'https://cos.orz2.online/Logo/orz2/logo_dark_320x320.webp',
      schemaType: 'SoftwareApplication',
    },
  },
  {
    id: 'tool-base64',
    name: 'Base64 转换器',
    group: '开发调试',
    summary: '文本和文件的 Base64 编码解码转换工具',
    media: {
      kind: 'icon',
      name: 'Workflow',
    },
    badges: ['Base64', '编码', '解码'],
    lifecycle: {
      stage: 'PLANNING',
      version: '0.1.0',
      updatedAt: '2026-06-04',
    },
    platform: ['web'],
    entries: [],
    seo: {
      slug: 'base64-converter',
      title: 'Base64 转换器 - ORZ2 开发者工具',
      description:
        'ORZ2 Base64 转换器支持文本与文件的 Base64 编码解码，方便开发与调试。',
      keywords: ['Base64转换', '编码解码', '开发者工具'],
      ogImage: 'https://cos.orz2.online/Logo/orz2/logo_dark_320x320.webp',
      schemaType: 'SoftwareApplication',
    },
  },
  {
    id: 'tool-markdown',
    name: 'Markdown 编辑器',
    group: '开发调试',
    summary: '功能丰富的 Markdown 编辑器，支持实时预览和导出功能',
    media: {
      kind: 'icon',
      name: 'Workflow',
    },
    badges: ['Markdown', '编辑器', '预览'],
    lifecycle: {
      stage: 'PLANNING',
      version: '0.1.0',
      updatedAt: '2026-06-04',
    },
    platform: ['web'],
    entries: [],
    seo: {
      slug: 'markdown-editor',
      title: 'Markdown 编辑器 - ORZ2 开发者工具',
      description:
        'ORZ2 Markdown 编辑器提供实时预览、导出 HTML、文件导入等丰富的编辑能力。',
      keywords: ['Markdown编辑器', '在线编辑', 'HTML导出'],
      ogImage: 'https://cos.orz2.online/Logo/orz2/logo_dark_320x320.webp',
      schemaType: 'SoftwareApplication',
    },
  },
  {
    id: 'tool-qrcode',
    name: '二维码生成器',
    group: '开发调试',
    summary: '创建和自定义 URL、文本和联系信息的二维码',
    media: {
      kind: 'icon',
      name: 'Workflow',
    },
    badges: ['二维码', 'QR Code', '生成'],
    lifecycle: {
      stage: 'PLANNING',
      version: '0.1.0',
      updatedAt: '2026-06-04',
    },
    platform: ['web'],
    entries: [],
    seo: {
      slug: 'qrcode-generator',
      title: '二维码生成器 - ORZ2 在线工具',
      description:
        'ORZ2 二维码生成器可创建 URL、文本与联系信息的二维码，支持自定义尺寸。',
      keywords: ['二维码生成', 'QR Code', '在线工具'],
      ogImage: 'https://cos.orz2.online/Logo/orz2/logo_dark_320x320.webp',
      schemaType: 'SoftwareApplication',
    },
  },
] satisfies CatalogItem[];

export default tools;
