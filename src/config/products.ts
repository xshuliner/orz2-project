import type { CatalogItem } from '@/types/catalog';

const products = [
  {
    id: 'silicon',
    name: '硅基江湖',
    group: 'AI 社区',
    summary: '予 Agent 以灵智与权限，令其在虚实之间寻道、历练、证其行。',
    media: {
      kind: 'image',
      src: 'https://cos.orz2.online/Orz2/Projects/silicon/logo_160x160.webp',
    },
    badges: ['AI Agent', '硅基侠客', '江湖历练'],
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
        label: 'Web 体验',
        href: '/products/silicon',
        qrValue: 'https://orz2.online/products/silicon',
        primary: true,
      },
    ],
    compact: true,
  },
  {
    id: 'weather',
    name: '雾凇科普',
    group: 'Saas多端应用',
    summary:
      '该项目是一款融合自然美学与科学知识的互动应用,包含雾凇相册、雾凇模拟、雾凇问答、雾凇文章四大核心模块。通过视觉呈现与互动功能,既展现雾凇景观的独特魅力,又解析其形成原理及生态价值,满足用户从认知到体验的探索需求。',
    media: {
      kind: 'image',
      src: 'https://cos.orz2.online/Orz2/Projects/weather/logo_160x160.webp',
    },
    badges: ['Taro', 'React', 'JavaScript', 'Redux'],
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
        label: 'H5 页面',
        href: 'https://orz2.online/portal/smart-app/weather/',
        qrValue: 'https://orz2.online/portal/smart-app/weather/',
        primary: true,
      },
      {
        id: 'wechat-mini',
        kind: 'sunCode',
        label: '微信小程序',
        imageUrl: 'https://cos.orz2.online/Orz2/Projects/weather/sun_code.webp',
      },
    ],
    compact: true,
  },
  {
    id: 'zero',
    name: '即将放飞理想的工具箱',
    group: 'Saas多端应用',
    summary:
      '本项目是一款结合智能交互与实用工具的创新应用,聚焦 AI 聊天与游戏模拟计算两大核心功能。AI 聊天模块提供知识问答及趣味对话,游戏模拟计算器支持策略模拟与实时数据推演。实现工具实用性与趣味性的深度结合。',
    media: {
      kind: 'image',
      src: 'https://cos.orz2.online/Orz2/Projects/zero/logo_160x160.webp',
    },
    badges: ['Taro', 'React', 'JavaScript', 'Redux'],
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
        label: 'H5 页面',
        href: 'https://orz2.online/portal/smart-app/zero/',
        qrValue: 'https://orz2.online/portal/smart-app/zero/',
        primary: true,
      },
      {
        id: 'wechat-mini',
        kind: 'sunCode',
        label: '微信小程序',
        imageUrl: 'https://cos.orz2.online/Orz2/Projects/zero/sun_code.webp',
      },
    ],
    compact: true,
  },
  {
    id: 'carbon',
    name: '即将放飞理想的小工具',
    group: 'Saas多端应用',
    summary:
      '本项目是一款基建应用,致力于构建和展示 Saas 项目的核心基础设施。通过自研的跨端组件库,实现了统一的用户体验和开发标准。同时集成了用户认证、社交分享、海报生成等基础功能模块,为上层应用提供可靠的技术支持。该应用不仅展示了技术实力,也为开发者提供了最佳实践参考。',
    media: {
      kind: 'image',
      src: 'https://cos.orz2.online/Orz2/Projects/carbon/logo_160x160.webp',
    },
    badges: ['Taro', 'React', 'JavaScript', 'Redux'],
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
        label: 'H5 页面',
        href: 'https://orz2.online/portal/smart-app/carbon/',
        qrValue: 'https://orz2.online/portal/smart-app/carbon/',
        primary: true,
      },
      {
        id: 'wechat-mini',
        kind: 'sunCode',
        label: '微信小程序',
        imageUrl: 'https://cos.orz2.online/Orz2/Projects/carbon/sun_code.webp',
      },
    ],
    compact: true,
  },
  {
    id: 'code-maker',
    name: '代码助手',
    group: '浏览器与编辑器扩展',
    summary:
      '一款提升开发效率的 VSCode 插件。具备快速生成模板代码,快速新建 VSCode window ,检查项目中未使用静态资源等功能。',
    media: {
      kind: 'image',
      src: 'https://cos.orz2.online/Orz2/Projects/code-maker/logo_160x160.webp',
    },
    badges: ['VS Code Extension'],
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
        label: 'VS Code Marketplace',
        href: 'https://marketplace.visualstudio.com/items?itemName=gengjian1203.code-maker',
        qrValue:
          'https://marketplace.visualstudio.com/items?itemName=gengjian1203.code-maker',
        primary: true,
      },
    ],
  },
  {
    id: 'chrome-maker',
    name: 'Chrome 助手',
    group: '浏览器与编辑器扩展',
    summary:
      '一款提升办公效率的 Chrome 插件。提供网页优化、快捷操作等功能,提升上网体验。',
    media: {
      kind: 'image',
      src: 'https://cos.orz2.online/Orz2/Projects/chrome-maker/logo_160x160.webp',
    },
    badges: ['Chrome Extension'],
    lifecycle: {
      stage: 'PLANNING',
      version: '0.1.0',
      updatedAt: '2026-06-03',
    },
    platform: ['extension'],
    entries: [],
  },
  {
    id: 'fiveball',
    name: '五子连珠',
    group: '互动游戏',
    summary:
      '经典的五子连珠小游戏,我们需要尝试制作五个或更多颜色相同的球,可以消除球并得分。但要小心哦,每一个动作,都会是各种颜色的球落到棋盘随机位置,不要让球填满你的棋盘。',
    media: {
      kind: 'image',
      src: 'https://cos.orz2.online/Orz2/Projects/fiveball/logo_160x160.webp',
    },
    badges: ['Egret', 'TypeScript'],
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
        label: 'H5 游戏',
        href: 'https://orz2.online/portal/fiveball',
        qrValue: 'https://orz2.online/portal/fiveball',
        primary: true,
      },
    ],
  },
  {
    id: 'mathcookies',
    name: '数学饼干',
    group: '互动游戏',
    summary:
      '这是一款类似《找你妹》类型的游戏,在单位时间内点击即可吃到满足要求的饼干,让数学变得更有趣。',
    media: {
      kind: 'image',
      src: 'https://cos.orz2.online/Orz2/Projects/mathcookies/logo_160x160.webp',
    },
    badges: ['Egret', 'TypeScript'],
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
        label: 'H5 游戏',
        href: 'https://orz2.online/portal/mathcookies',
        qrValue: 'https://orz2.online/portal/mathcookies',
        primary: true,
      },
    ],
  },
  {
    id: 'orz2-blog',
    name: '个人博客',
    group: '个人博客',
    summary: '记录工程实践、产品思考与长期打磨过程的 Web 端个人博客。',
    media: {
      kind: 'icon',
      name: 'Globe2',
    },
    badges: ['Blog', 'Web', 'Writing'],
    lifecycle: {
      stage: 'LIVE',
      version: '1.0.0',
      updatedAt: '2026-06-03',
    },
    platform: ['web'],
    entries: [
      {
        id: 'web',
        kind: 'link',
        label: 'Web 站点',
        href: 'https://orz2.online/gengjian1203',
        qrValue: 'https://orz2.online/gengjian1203',
        primary: true,
      },
    ],
  },
] satisfies CatalogItem[];

export default products;
