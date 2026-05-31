import productsData from '@/config/products.json';
import toolsData from '@/config/tools.json';
import type {
  HeroMedia,
  Product,
  TeamMember,
  Testimonial,
  Tool,
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

export const tools = toolsData as Tool[];
export const products = productsData as Product[];

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
  ...Array.from(new Set(tools.map(tool => tool.category))),
];
