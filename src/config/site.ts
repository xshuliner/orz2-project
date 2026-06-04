import productsData from '@/config/products.json';
import toolsData from '@/config/tools.json';
import type {
  CatalogGroup,
  CatalogItem,
  HeroMedia,
  TeamMember,
  Testimonial,
} from '@/types';

const heroBase = 'https://cos.orz2.online/Orz2/Hero';

export const heroMedia: HeroMedia[] = [
  {
    id: 'shuxiaolan',
    label: '鼠小蓝',
    videoSrc: `${heroBase}/hero_video_shuxiaolan.mp4`,
    posterSrc: `${heroBase}/hero_poster_shuxiaolan.webp`,
  },
  {
    id: 'shuxiaolv',
    label: '鼠小绿',
    videoSrc: `${heroBase}/hero_video_shuxiaolv.mp4`,
    posterSrc: `${heroBase}/hero_poster_shuxiaolv.webp`,
  },
  {
    id: 'shuxiaozi',
    label: '鼠小紫',
    videoSrc: `${heroBase}/hero_video_shuxiaozi.mp4`,
    posterSrc: `${heroBase}/hero_poster_shuxiaozi.webp`,
  },
  {
    id: 'shuxiaohong',
    label: '鼠小红',
    videoSrc: `${heroBase}/hero_video_shuxiaohong.mp4`,
    posterSrc: `${heroBase}/hero_poster_shuxiaohong.webp`,
  },
  {
    id: 'shuxiaohuang',
    label: '鼠小黄',
    videoSrc: `${heroBase}/hero_video_shuxiaohuang.mp4`,
    posterSrc: `${heroBase}/hero_poster_shuxiaohuang.webp`,
  },
  {
    id: 'shuxiaocheng',
    label: '鼠小橙',
    videoSrc: `${heroBase}/hero_video_shuxiaocheng.mp4`,
    posterSrc: `${heroBase}/hero_poster_shuxiaocheng.webp`,
  },
];

export const tools = toolsData as CatalogItem[];
export const products = productsData as CatalogItem[];

/**
 * 跨页面共用的简短中文标签。
 * 用于导航、面包屑、页面标题等需要多处保持一致的地方，
 * 避免在多个组件里各自写死。
 */
export const pageTitles = {
  home: '首页',
  onlineTools: '在线工具',
  products: '产品展示',
  team: '核心团队',
  privacy: '隐私协议',
  designSystem: '设计系统',
} as const;

/**
 * 首页各 Section 的标题与副标题。
 * 集中在这里管理，方便文案改版时只改一处；
 * `title` 引用 `pageTitles` 保证与导航/面包屑一致。
 */
export const homeSections = {
  tools: {
    title: pageTitles.onlineTools,
    subtitle: '把高频任务整理成清晰直接的入口，需要时随手打开，用完即可离开。',
    ariaLabel: pageTitles.onlineTools,
    searchPlaceholder: '搜索 AI、图片、JSON、营销...',
    searchAriaLabel: '搜索工具',
    categoryAriaLabel: '工具分类',
    emptyState: '暂时没有匹配的工具，换个关键词试试。',
    allButton: '查看全部工具',
  },
  products: {
    title: pageTitles.products,
    subtitle: '记录已经落地的产品实践，也保留每个项目独立而清晰的入口。',
    ariaLabel: pageTitles.products,
    searchPlaceholder: '搜索 H5、WEAPP、AI、游戏...',
    searchAriaLabel: '搜索产品',
    categoryAriaLabel: '产品分类',
    emptyState: '暂时没有匹配的产品，换个关键词试试。',
    allButton: '查看全部产品',
  },
  testimonials: {
    title: '用户反馈',
    subtitle: '真实的使用感受，帮助我们持续打磨更直接、更好用的工具体验。',
    ariaLabel: '用户反馈',
  },
  hero: {
    title: '工具驱动增长',
    description:
      'ORZ2 汇集 AI、开发、设计、营销和办公效率工具，也支持为商业化场景定制独立工具站、信息架构与合规模块。',
    primaryCta: '查看产品',
    secondaryCta: '定制合作',
    highlightsAriaLabel: 'ORZ2 特点',
    highlights: [{ label: '快速入口' }, { label: '合规清晰' }],
  },
  contact: {
    title: '你的商业工具入口',
    description:
      '我们可以围绕你的行业、团队流程和商业化目标，定制工具页面、数据接入、广告合规内容与独立站点架构。',
    capabilities: '工具目录设计、AI 流程接入、企业落地页、隐私合规模块',
    ctaLabel: '查看可扩展入口',
  },
} as const;

/**
 * 站点底部 Footer 的全部文案。
 * 包括品牌描述、栏目标题、版权信息等。
 */
export const footerCopy = {
  brandDescription:
    'ORZ2 专注在线 AI 工具、效率工具与可定制工具站方案，帮助团队把重复工作交给更稳定的流程。',
  sections: {
    nav: '导航',
    contact: '联系',
    compliance: '合规',
  },
  navAriaLabel: '页脚导航',
  contactSupport: '支持工具定制、商业化落地与效率工作流搭建。',
  complianceNote: '清晰标注数据使用、第三方服务、广告说明与用户权利。',
  viewPrivacy: '查看隐私协议',
  copyright: '© 2026 ORZ2. All rights reserved.',
  tagline: 'Built for useful, compliant online tools.',
} as const;

/**
 * 登录弹窗的全部文案（ContextAuth 使用）。
 */
export const loginCopy = {
  closeAriaLabel: '关闭登录窗口',
  kicker: '微信扫码登录',
  title: '欢迎回来',
  description: '使用微信扫描太阳码，完成授权后将自动登录。',
  qrAlt: '微信小程序登录太阳码',
  loading: '正在生成太阳码...',
  expired: '太阳码已过期',
  noQr: '暂未获取到太阳码',
  hint: '请在微信中扫码，并按提示完成授权',
  refreshButton: '刷新太阳码',
  errors: {
    loginFailed: '登录失败，请刷新二维码后重试',
    qrLoadFailed: '二维码加载失败，请稍后刷新重试',
  },
} as const;

/**
 * 顶部导航栏（Header）相关文案。
 */
export const headerCopy = {
  brandAriaLabel: 'ORZ2 首页',
  navAriaLabel: '主导航',
  openNavAriaLabel: '打开导航',
  closeNavAriaLabel: '关闭导航',
  loggedOut: '未登录',
  loggedIn: '已登录',
  defaultAvatar: '测',
  defaultUserName: '测试用户',
  logoutAriaLabel: '退出登录',
} as const;

export const testimonials: Testimonial[] = [
  {
    id: 'ops',
    quote:
      'ORZ2 的工具入口足够直接，不需要培训，新同事也能很快找到该用的功能。',
    name: '林青',
    title: '增长运营负责人',
  },
  {
    id: 'studio',
    quote:
      '我们喜欢这种轻量但完整的产品感，既能做日常任务，也适合接入自有流程。',
    name: 'Mia Chen',
    title: '独立工作室主理人',
  },
  {
    id: 'dev',
    quote: '页面信息和合规内容摆得很清楚，对准备商业化的工具站来说很省心。',
    name: '周远',
    title: '全栈开发者',
  },
  {
    id: 'pm',
    quote: '工具站结构清晰，信息架构做得很扎实，用户上手零成本。',
    name: '张明',
    title: '产品经理',
  },
  {
    id: 'design',
    quote: '配色和动效都很克制，整体感很强，是难得的设计驱动的工具产品。',
    name: '李薇',
    title: 'UI设计师',
  },
  {
    id: 'startup',
    quote: '上线周期快，合规文档完备，团队接入后几乎没有踩坑。',
    name: '王浩',
    title: '创业公司CTO',
  },
  {
    id: 'freelance',
    quote: '个人工作室没有技术团队也能拥有自己的工具站，省了大几万。',
    name: '陈静',
    title: '独立开发者',
  },
  {
    id: 'marketing',
    quote: '内置的合规模块对营销场景很友好，审核流程顺畅多了。',
    name: '刘洋',
    title: '市场营销总监',
  },
  {
    id: 'ecommerce',
    quote: '定制化能力强，二开后完全看不出是模板站，很满意。',
    name: '赵鹏',
    title: '电商运营',
  },
  {
    id: 'saas',
    quote: '作为 SaaS 销售工具很称手，客户演示时专业感拉满。',
    name: '孙怡',
    title: '企业销售',
  },
  {
    id: 'agency',
    quote: '帮客户做了三四个工具站了，交付质量稳定，出活快。',
    name: '周婷',
    title: '数字代理商',
  },
  {
    id: 'enterprise',
    quote: '企业内部效率工具定制，符合我们内部的合规要求，好评。',
    name: '吴磊',
    title: '企业IT负责人',
  },
  {
    id: 'blogger',
    quote: '工具站加载速度很快 SEO 也友好，引流效果比预期好。',
    name: '郑凯',
    title: '内容创作者',
  },
  {
    id: 'investor',
    quote: '看了几个工具站方案，这个的商业化路径最清晰，值得关注。',
    name: '马可',
    title: '投资人',
  },
  {
    id: 'support',
    quote: '服务响应及时，需求沟通顺畅，合作体验超过预期。',
    name: '林晓',
    title: '客户服务经理',
  },
];

export const teamMembers: TeamMember[] = [
  {
    id: 'lan',
    name: '鼠小蓝',
    role: '项目经理',
    color: '#3b82f6',
    bio: '负责项目节奏、需求拆解和交付质量，让想法稳定变成可上线产品。',
    avatarUrl: `${heroBase}/hero_poster_shuxiaolan.webp`,
  },
  {
    id: 'lv',
    name: '鼠小绿',
    role: '全栈开发',
    color: '#16a34a',
    bio: '打通前端、服务端与部署链路，关注性能、可维护性和工程扩展。',
    avatarUrl: `${heroBase}/hero_poster_shuxiaolv.webp`,
  },
  {
    id: 'zi',
    name: '鼠小紫',
    role: '产品经理',
    color: '#8b5cf6',
    bio: '把用户场景翻译成清晰功能，平衡商业目标、体验和上线成本。',
    avatarUrl: `${heroBase}/hero_poster_shuxiaozi.webp`,
  },
  {
    id: 'hong',
    name: '鼠小红',
    role: 'UI设计师',
    color: '#ef4444',
    bio: '建立一致的界面语言，让工具网站既专业、易用，也有品牌记忆点。',
    avatarUrl: `${heroBase}/hero_poster_shuxiaohong.webp`,
  },
  {
    id: 'huang',
    name: '鼠小黄',
    role: '财务',
    color: '#eab308',
    bio: '关注成本、收入与商业化指标，帮助产品走向长期健康运营。',
    avatarUrl: `${heroBase}/hero_poster_shuxiaohuang.webp`,
  },
  {
    id: 'cheng',
    name: '鼠小橙',
    role: 'HR',
    color: '#f97316',
    bio: '维护团队协作、人才成长和文化建设，让每个人在合适的位置发光。',
    avatarUrl: `${heroBase}/hero_poster_shuxiaocheng.webp`,
  },
];

export const toolCategories = [
  '全部',
  ...Array.from(new Set(tools.map(tool => tool.group))),
];

export const productGroups: CatalogGroup[] = [
  {
    name: 'AI 社区',
    description: '围绕 Agent、身份与长期互动体验沉淀的产品实验。',
  },
  {
    name: 'Saas多端应用',
    description: '覆盖 H5 与小程序等移动入口，适合轻量业务快速触达。',
  },
  {
    name: '浏览器与编辑器扩展',
    description: '贴近开发与工作流场景，把常用能力放到触手可及的位置。',
  },
  {
    name: '互动游戏',
    description: '以网页为入口的小型互动体验，保留完整可玩的产品形态。',
  },
  {
    name: '个人博客',
    description: '承载工程实践、产品思考和长期内容沉淀的 Web 站点。',
  },
];

export const toolGroups: CatalogGroup[] = [
  {
    name: '公众号工具',
    description: '面向内容运营与自动化发布流程的效率工具。',
  },
  {
    name: '图片处理',
    description: '处理素材体积、质量与网页性能之间的平衡。',
  },
  {
    name: '开发工具',
    description: '减少调试与整理成本，让开发任务更直接。',
  },
  {
    name: '设计工具',
    description: '辅助配色、对比度与前端可交付资产的生成。',
  },
];
