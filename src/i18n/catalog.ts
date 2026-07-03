import productsData from '@/config/products.json';
import toolsData from '@/config/tools.json';
import { defaultLocale, type Locale } from '@/i18n';
import type {
  CatalogGroup,
  CatalogItem,
  HeroMedia,
  TeamMember,
  Testimonial,
} from '@/types';

const heroBase = 'https://cos.orz2.online/Orz2/Hero';

const baseTools = toolsData as CatalogItem[];
const baseProducts = productsData as CatalogItem[];
type NonDefaultLocale = Exclude<Locale, 'zh-CN'>;

const groupTranslations = {
  en: {
    运营与效率: 'Ops and Productivity',
    图片与设计: 'Image and Design',
    开发调试: 'Developer Debugging',
    公众号工具: 'WeChat Tools',
    图片处理: 'Image Processing',
    效率工具: 'Productivity Tools',
    开发工具: 'Developer Tools',
    设计工具: 'Design Tools',
    'AI 社区': 'AI Community',
    Saas多端应用: 'SaaS Multi-Platform Apps',
    浏览器与编辑器扩展: 'Browser and Editor Extensions',
    互动游戏: 'Interactive Games',
    个人博客: 'Personal Blog',
  },
  ja: {
    运营与效率: '運用・効率化',
    图片与设计: '画像・デザイン',
    开发调试: '開発・デバッグ',
    公众号工具: 'WeChat ツール',
    图片处理: '画像処理',
    效率工具: '効率化ツール',
    开发工具: '開発ツール',
    设计工具: 'デザインツール',
    'AI 社区': 'AI コミュニティ',
    Saas多端应用: 'SaaS マルチプラットフォーム',
    浏览器与编辑器扩展: 'ブラウザ・エディタ拡張',
    互动游戏: 'インタラクティブゲーム',
    个人博客: '個人ブログ',
  },
} as const;

type EntryTranslation = Partial<Record<string, string>>;

interface CatalogItemTranslation {
  name?: string;
  group?: string;
  summary?: string;
  badges?: string[];
  entries?: EntryTranslation;
  mediaAlt?: string;
  seo?: {
    title: string;
    description: string;
    keywords?: string[];
  };
}

type CatalogTranslations = Record<string, CatalogItemTranslation>;

const toolTranslations: Record<NonDefaultLocale, CatalogTranslations> = {
  en: {
    'tool-wechat-publisher': {
      name: 'WeChat Auto Publisher',
      summary:
        'Configure official account credentials, article prompts, cover image, and inline images in one task sheet for automated draft publishing.',
      badges: ['AI', 'WeChat', 'Auto publish', 'LLM', 'Content ops'],
      entries: { web: 'Tool entry' },
      seo: {
        title: 'WeChat Auto Publisher - ORZ2 Content Ops Tool',
        description:
          'Use ORZ2 WeChat Auto Publisher to configure appId, appSecret, article prompts, cover images, and assets for automated draft publishing.',
        keywords: [
          'WeChat publisher',
          'WeChat official account tool',
          'AI article generation',
          'content operations tool',
        ],
      },
    },
    'tool-image': {
      name: 'Batch Image Studio',
      summary:
        'Upload multiple images, apply one conversion, resize, and TinyPNG compression setup, then download the results as a ZIP.',
      badges: ['Image', 'Batch', 'Convert', 'Resize', 'ZIP'],
      entries: { web: 'Tool entry' },
      seo: {
        title: 'Batch Image Studio - ORZ2 Online Image Tool',
        description:
          'ORZ2 Batch Image Studio supports multi-image upload previews, unified format conversion, resizing, TinyPNG compression, and ZIP downloads.',
        keywords: [
          'batch image processing',
          'image compression',
          'format conversion',
          'image resize',
          'ZIP download',
        ],
      },
    },
    'tool-json': {
      name: 'JSON Formatter',
      summary:
        'Format, validate, and beautify JSON data with syntax highlighting and error detection.',
      badges: ['JSON', 'Dev', 'Validation'],
      seo: {
        title: 'JSON Formatter - ORZ2 Developer Tool',
        description:
          'Use ORZ2 JSON Formatter to organize, validate, and inspect JSON data online.',
        keywords: ['JSON formatter', 'developer tool', 'JSON validation'],
      },
    },
    'tool-color': {
      name: 'Palette Lab',
      summary:
        'A professional color picker with multiple color formats and palette support.',
      badges: ['Palette', 'Design', 'Accessibility'],
      seo: {
        title: 'Palette Lab - ORZ2 Online Design Tool',
        description:
          'ORZ2 Palette Lab helps designers and developers generate brand colors, check contrast, and export color values.',
        keywords: ['online palette', 'design tool', 'color contrast'],
      },
    },
    'tool-base64': {
      name: 'Base64 Converter',
      summary: 'Encode and decode text and files with Base64.',
      badges: ['Base64', 'Encode', 'Decode'],
      seo: {
        title: 'Base64 Converter - ORZ2 Developer Tool',
        description:
          'ORZ2 Base64 Converter supports Base64 encoding and decoding for text and files during development and debugging.',
        keywords: ['Base64 converter', 'encoding decoding', 'developer tool'],
      },
    },
    'tool-markdown': {
      name: 'Markdown Editor',
      summary: 'A rich Markdown editor with live preview and export features.',
      badges: ['Markdown', 'Editor', 'Preview'],
      seo: {
        title: 'Markdown Editor - ORZ2 Developer Tool',
        description:
          'ORZ2 Markdown Editor provides live preview, HTML export, file import, and practical editing features.',
        keywords: ['Markdown editor', 'online editing', 'HTML export'],
      },
    },
    'tool-qrcode': {
      name: 'QR Code Generator',
      summary:
        'Create and customize QR codes for URLs, text, and contact information.',
      badges: ['QR Code', 'Generator', 'Online'],
      seo: {
        title: 'QR Code Generator - ORZ2 Online Tool',
        description:
          'ORZ2 QR Code Generator creates QR codes for URLs, text, and contact information with customizable size.',
        keywords: ['QR code generator', 'QR Code', 'online tool'],
      },
    },
  },
  ja: {
    'tool-wechat-publisher': {
      name: '公众号 自動投稿',
      summary:
        '公众号の認証情報、記事プロンプト、カバー画像、本文画像を一つのタスクシートで設定し、自動草稿作成を準備します。',
      badges: ['AI', '公众号', '自動投稿', 'LLM', 'コンテンツ運用'],
      entries: { web: 'ツール入口' },
      seo: {
        title: '公众号 自動投稿ツール - ORZ2 コンテンツ運用ツール',
        description:
          'ORZ2 公众号自動投稿ツールで appId、appSecret、記事プロンプト、カバー画像、素材を設定し、自動草稿作成を準備できます。',
        keywords: [
          '公众号自動投稿',
          'WeChat ツール',
          'AI 記事生成',
          'コンテンツ運用ツール',
        ],
      },
    },
    'tool-image': {
      name: '一括画像処理スタジオ',
      summary:
        '複数画像をアップロードし、同じ変換、リサイズ、TinyPNG 圧縮設定を適用して ZIP でダウンロードできます。',
      badges: ['画像', '一括', '変換', 'リサイズ', 'ZIP'],
      entries: { web: 'ツール入口' },
      seo: {
        title: '一括画像処理スタジオ - ORZ2 オンライン画像ツール',
        description:
          'ORZ2 一括画像処理スタジオは、複数画像アップロード、統一形式変換、リサイズ、TinyPNG 圧縮、ZIP ダウンロードに対応します。',
        keywords: [
          '一括画像処理',
          '画像圧縮',
          '形式変換',
          '画像リサイズ',
          'ZIP ダウンロード',
        ],
      },
    },
    'tool-json': {
      name: 'JSON フォーマッター',
      summary:
        'シンタックスハイライトとエラー検出に対応した JSON 整形・検証ツール。',
      badges: ['JSON', '開発', '検証'],
      seo: {
        title: 'JSON フォーマッター - ORZ2 開発者ツール',
        description:
          'ORZ2 JSON フォーマッターで JSON データをオンラインで整形、検証、閲覧できます。',
        keywords: ['JSON 整形', '開発者ツール', 'JSON 検証'],
      },
    },
    'tool-color': {
      name: '配色ラボ',
      summary: '複数の色形式とパレットに対応したプロ向けカラー選択ツール。',
      badges: ['配色', 'デザイン', 'アクセシビリティ'],
      seo: {
        title: '配色ラボ - ORZ2 オンラインデザインツール',
        description:
          'ORZ2 配色ラボはブランド色生成、コントラスト確認、色値エクスポートを支援します。',
        keywords: ['オンライン配色', 'デザインツール', '色コントラスト'],
      },
    },
    'tool-base64': {
      name: 'Base64 コンバーター',
      summary: 'テキストとファイルの Base64 エンコード・デコード変換ツール。',
      badges: ['Base64', 'エンコード', 'デコード'],
      seo: {
        title: 'Base64 コンバーター - ORZ2 開発者ツール',
        description:
          'ORZ2 Base64 コンバーターは、開発とデバッグに便利なテキスト・ファイルの Base64 変換を提供します。',
        keywords: ['Base64 変換', 'エンコード デコード', '開発者ツール'],
      },
    },
    'tool-markdown': {
      name: 'Markdown エディター',
      summary:
        'リアルタイムプレビューとエクスポートに対応した多機能 Markdown エディター。',
      badges: ['Markdown', 'エディター', 'プレビュー'],
      seo: {
        title: 'Markdown エディター - ORZ2 開発者ツール',
        description:
          'ORZ2 Markdown エディターはリアルタイムプレビュー、HTML エクスポート、ファイル読み込みを提供します。',
        keywords: [
          'Markdown エディター',
          'オンライン編集',
          'HTML エクスポート',
        ],
      },
    },
    'tool-qrcode': {
      name: 'QR コード生成',
      summary:
        'URL、テキスト、連絡先情報の QR コードを作成・カスタマイズできます。',
      badges: ['QR コード', '生成', 'オンライン'],
      seo: {
        title: 'QR コード生成 - ORZ2 オンラインツール',
        description:
          'ORZ2 QR コード生成は URL、テキスト、連絡先情報の QR コードを作成し、サイズ調整にも対応します。',
        keywords: ['QR コード生成', 'QR Code', 'オンラインツール'],
      },
    },
  },
};

const productTranslations: Record<NonDefaultLocale, CatalogTranslations> = {
  en: {
    silicon: {
      name: 'Silicon Realm',
      summary:
        'Grant Agents identity and permission so they can seek, train, and prove themselves between virtual and real worlds.',
      badges: ['AI Agent', 'Silicon Heroes', 'Realm Training'],
      entries: { web: 'Web experience' },
    },
    weather: {
      name: 'Rime Explorer',
      summary:
        'An interactive science app combining natural aesthetics and knowledge, with rime albums, simulation, quizzes, and articles.',
      entries: { h5: 'H5 page', 'wechat-mini': 'WeChat mini program' },
    },
    zero: {
      name: 'Toolbox Ready To Fly',
      summary:
        'An innovative app combining AI chat and game simulation calculators for both utility and playful interaction.',
      entries: { h5: 'H5 page', 'wechat-mini': 'WeChat mini program' },
    },
    carbon: {
      name: 'Toolkit Foundation',
      summary:
        'A foundation app that demonstrates SaaS infrastructure, cross-platform components, authentication, social sharing, and poster generation.',
      entries: { h5: 'H5 page', 'wechat-mini': 'WeChat mini program' },
    },
    'code-maker': {
      name: 'Code Assistant',
      summary:
        'A VS Code extension for improving development efficiency, including template generation, opening VS Code windows, and detecting unused assets.',
    },
    'chrome-maker': {
      name: 'Chrome Assistant',
      summary:
        'A Chrome extension for office productivity with page optimization and quick actions.',
    },
    fiveball: {
      name: 'Five Ball Lines',
      summary:
        'A classic puzzle game where you line up five or more same-colored balls to clear them and score before the board fills up.',
      entries: { 'h5-game': 'H5 game' },
    },
    mathcookies: {
      name: 'Math Cookies',
      summary:
        'A click-and-find game where players eat cookies matching the rule within limited time, making math more playful.',
      entries: { 'h5-game': 'H5 game' },
    },
    'orz2-blog': {
      name: 'Personal Blog',
      summary:
        'A web blog for engineering practice, product thinking, and long-term craft notes.',
      entries: { web: 'Website' },
    },
  },
  ja: {
    silicon: {
      name: 'シリコン江湖',
      summary:
        'Agent に知性と権限を与え、虚実の間で道を求め、鍛え、行いを証明させます。',
      badges: ['AI Agent', 'シリコン侠客', '江湖修行'],
      entries: { web: 'Web 体験' },
    },
    weather: {
      name: '霧氷サイエンス',
      summary:
        '自然美と科学知識を融合したインタラクティブアプリ。霧氷アルバム、シミュレーション、クイズ、記事を備えます。',
      entries: { h5: 'H5 ページ', 'wechat-mini': 'WeChat ミニプログラム' },
    },
    zero: {
      name: '理想を放つツール箱',
      summary:
        'AI チャットとゲームシミュレーション計算を中心に、実用性と楽しさを組み合わせたアプリです。',
      entries: { h5: 'H5 ページ', 'wechat-mini': 'WeChat ミニプログラム' },
    },
    carbon: {
      name: '理想を放つ小ツール',
      summary:
        'SaaS 基盤を構築・展示するアプリ。跨端コンポーネント、認証、共有、ポスター生成などを統合します。',
      entries: { h5: 'H5 ページ', 'wechat-mini': 'WeChat ミニプログラム' },
    },
    'code-maker': {
      name: 'コードアシスタント',
      summary:
        'テンプレート生成、VS Code window の新規作成、未使用静的リソース検出などを備えた VS Code 拡張です。',
    },
    'chrome-maker': {
      name: 'Chrome アシスタント',
      summary:
        'Web 最適化や快捷操作でブラウジング体験を高める Chrome 拡張です。',
    },
    fiveball: {
      name: '五子連珠',
      summary:
        '同じ色の球を五つ以上並べて消すクラシックなミニゲーム。盤面が埋まらないように注意します。',
      entries: { 'h5-game': 'H5 ゲーム' },
    },
    mathcookies: {
      name: '数学クッキー',
      summary:
        '制限時間内に条件を満たすクッキーをクリックして食べるゲーム。数学をもっと楽しくします。',
      entries: { 'h5-game': 'H5 ゲーム' },
    },
    'orz2-blog': {
      name: '個人ブログ',
      summary:
        '工程実践、プロダクト思考、長期的な改善過程を記録する Web ブログです。',
      entries: { web: 'Web サイト' },
    },
  },
};

const productGroupDescriptions = {
  en: [
    [
      'AI Community',
      'Product experiments around Agents, identity, and long-running interaction.',
    ],
    [
      'SaaS Multi-Platform Apps',
      'Mobile entries across H5 and mini programs for lightweight business reach.',
    ],
    [
      'Browser and Editor Extensions',
      'Workflow-adjacent capabilities placed close to development and everyday work.',
    ],
    [
      'Interactive Games',
      'Small web-playable experiences that keep complete product shape.',
    ],
    [
      'Personal Blog',
      'A place for engineering practice, product thinking, and long-term content.',
    ],
  ],
  ja: [
    [
      'AI コミュニティ',
      'Agent、身份、長期インタラクションをめぐるプロダクト実験。',
    ],
    [
      'SaaS マルチプラットフォーム',
      'H5 とミニプログラムなどのモバイル入口で軽量ビジネスに届きます。',
    ],
    [
      'ブラウザ・エディタ拡張',
      '開発と作業フローに近い能力を、すぐ使える場所に置きます。',
    ],
    ['インタラクティブゲーム', 'Web を入口にした小型インタラクション体験。'],
    ['個人ブログ', '工程実践、プロダクト思考、長期コンテンツを蓄積します。'],
  ],
} as const;

const toolGroupDescriptions = {
  en: [
    [
      'Ops and Productivity',
      'Tools for publishing, scheduling, coordination, and everyday decisions.',
    ],
    [
      'Image and Design',
      'Handle images, palettes, visual checks, and frontend-ready assets.',
    ],
    [
      'Developer Debugging',
      'Reduce formatting, conversion, validation, and debugging overhead.',
    ],
  ],
  ja: [
    ['運用・効率化', '投稿、予定調整、連携、日常判断をすばやく支えるツール。'],
    [
      '画像・デザイン',
      '画像、配色、視覚チェック、フロントエンド素材を扱います。',
    ],
    ['開発・デバッグ', '整形、変換、検証、デバッグの手間を減らします。'],
  ],
} as const;

function translateGroup(group: string, locale: Locale) {
  if (locale === defaultLocale) return group;
  const nonDefaultLocale = locale as NonDefaultLocale;
  return (
    groupTranslations[nonDefaultLocale][
      group as keyof (typeof groupTranslations)[typeof nonDefaultLocale]
    ] ?? group
  );
}

function localizeItem(
  item: CatalogItem,
  locale: Locale,
  translations: Record<NonDefaultLocale, CatalogTranslations>
): CatalogItem {
  if (locale === defaultLocale) return item;
  const nonDefaultLocale = locale as NonDefaultLocale;
  const translation = translations[nonDefaultLocale][item.id] ?? {};
  return {
    ...item,
    name: translation.name ?? item.name,
    group: translation.group ?? translateGroup(item.group, locale),
    summary: translation.summary ?? item.summary,
    media:
      item.media.kind === 'image'
        ? { ...item.media, alt: translation.mediaAlt ?? item.media.alt }
        : item.media,
    badges: translation.badges ?? item.badges,
    entries: item.entries.map(entry => ({
      ...entry,
      label: translation.entries?.[entry.id] ?? entry.label,
    })),
    seo: translation.seo
      ? {
          ...item.seo,
          title: translation.seo.title,
          description: translation.seo.description,
          keywords: translation.seo.keywords,
        }
      : item.seo,
  };
}

export function getTools(locale: Locale) {
  return baseTools.map(tool => localizeItem(tool, locale, toolTranslations));
}

export function getProducts(locale: Locale) {
  return baseProducts.map(product =>
    localizeItem(product, locale, productTranslations)
  );
}

export function getToolGroups(locale: Locale): CatalogGroup[] {
  if (locale === defaultLocale) {
    return [
      {
        name: '运营与效率',
        description: '覆盖发布、排期、协作和日常判断的高频小工具。',
      },
      {
        name: '图片与设计',
        description: '处理图片、配色、视觉检查与前端可交付素材。',
      },
      {
        name: '开发调试',
        description: '减少格式化、转换、校验和调试成本。',
      },
    ];
  }
  const nonDefaultLocale = locale as NonDefaultLocale;
  return toolGroupDescriptions[nonDefaultLocale].map(([name, description]) => ({
    name,
    description,
  }));
}

export function getProductGroups(locale: Locale): CatalogGroup[] {
  if (locale === defaultLocale) {
    return [
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
  }
  const nonDefaultLocale = locale as NonDefaultLocale;
  return productGroupDescriptions[nonDefaultLocale].map(
    ([name, description]) => ({
      name,
      description,
    })
  );
}

export function getToolCategories(locale: Locale, allLabel: string) {
  return [
    allLabel,
    ...Array.from(new Set(getTools(locale).map(tool => tool.group))),
  ];
}

export function getHeroMedia(locale: Locale): HeroMedia[] {
  const labels = {
    'zh-CN': ['鼠小蓝', '鼠小绿', '鼠小紫', '鼠小红', '鼠小黄', '鼠小橙'],
    en: [
      'Blue Shu',
      'Green Shu',
      'Purple Shu',
      'Red Shu',
      'Yellow Shu',
      'Orange Shu',
    ],
    ja: ['鼠小蓝', '鼠小绿', '鼠小紫', '鼠小红', '鼠小黄', '鼠小橙'],
  } satisfies Record<Locale, string[]>;
  const ids = [
    'shuxiaolan',
    'shuxiaolv',
    'shuxiaozi',
    'shuxiaohong',
    'shuxiaohuang',
    'shuxiaocheng',
  ];

  return ids.map((id, index) => ({
    id,
    label: labels[locale][index],
    videoSrc: `${heroBase}/hero_video_${id}.mp4`,
    posterSrc: `${heroBase}/hero_poster_${id}.webp`,
  }));
}

export function getTestimonials(locale: Locale): Testimonial[] {
  if (locale === 'en') {
    return [
      {
        id: 'ops',
        quote:
          'ORZ2 is direct enough that new teammates find the right tool without training.',
        name: 'Lin Qing',
        title: 'Growth Ops Lead',
      },
      {
        id: 'studio',
        quote:
          'It feels light but complete, useful for everyday tasks and custom workflows.',
        name: 'Mia Chen',
        title: 'Studio Founder',
      },
      {
        id: 'dev',
        quote:
          'The information and compliance notes are clear, which saves time for commercial tool sites.',
        name: 'Zhou Yuan',
        title: 'Full-stack Developer',
      },
      {
        id: 'pm',
        quote:
          'The structure is clear and users get started with almost no friction.',
        name: 'Zhang Ming',
        title: 'Product Manager',
      },
      {
        id: 'design',
        quote:
          'The color and motion are restrained, with a strong product feel.',
        name: 'Li Wei',
        title: 'UI Designer',
      },
      {
        id: 'startup',
        quote:
          'Fast launch, complete compliance docs, and almost no integration surprises.',
        name: 'Wang Hao',
        title: 'Startup CTO',
      },
      {
        id: 'freelance',
        quote:
          'A solo studio can have its own tool site without a full engineering team.',
        name: 'Chen Jing',
        title: 'Independent Developer',
      },
      {
        id: 'marketing',
        quote:
          'The built-in compliance module works well for marketing review.',
        name: 'Liu Yang',
        title: 'Marketing Director',
      },
    ];
  }
  if (locale === 'ja') {
    return [
      {
        id: 'ops',
        quote:
          'ORZ2 の入口は直感的で、新しいメンバーもすぐ必要な機能を見つけられます。',
        name: '林青',
        title: '成長運用責任者',
      },
      {
        id: 'studio',
        quote:
          '軽量なのに完成度があり、日常業務にも自社フロー連携にも合います。',
        name: 'Mia Chen',
        title: '独立スタジオ代表',
      },
      {
        id: 'dev',
        quote: '情報と合規内容が明確で、商用ツールサイトの準備が楽になります。',
        name: '周遠',
        title: 'フルスタック開発者',
      },
      {
        id: 'pm',
        quote: '構造が明快で、ユーザーは迷わず使い始められます。',
        name: '張明',
        title: 'プロダクトマネージャー',
      },
      {
        id: 'design',
        quote: '配色と動きが抑制され、全体のプロダクト感が強いです。',
        name: '李薇',
        title: 'UI デザイナー',
      },
      {
        id: 'startup',
        quote: '公開が速く、合規文書も揃い、導入時のつまずきがほぼありません。',
        name: '王浩',
        title: 'スタートアップ CTO',
      },
      {
        id: 'freelance',
        quote: '個人スタジオでも技術チームなしで自分のツールサイトを持てます。',
        name: '陳静',
        title: '独立開発者',
      },
      {
        id: 'marketing',
        quote: '内蔵の合規モジュールはマーケティング審査に向いています。',
        name: '劉洋',
        title: 'マーケティング責任者',
      },
    ];
  }
  return [
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
  ];
}

export function getTeamMembers(locale: Locale): TeamMember[] {
  const avatars = [
    'shuxiaolan',
    'shuxiaolv',
    'shuxiaozi',
    'shuxiaohong',
    'shuxiaohuang',
    'shuxiaocheng',
  ];
  const colors = [
    '#3b82f6',
    '#16a34a',
    '#8b5cf6',
    '#ef4444',
    '#eab308',
    '#f97316',
  ];
  const zh = [
    [
      '鼠小蓝',
      '项目经理',
      '负责项目节奏、需求拆解和交付质量，让想法稳定变成可上线产品。',
    ],
    [
      '鼠小绿',
      '全栈开发',
      '打通前端、服务端与部署链路，关注性能、可维护性和工程扩展。',
    ],
    [
      '鼠小紫',
      '产品经理',
      '把用户场景翻译成清晰功能，平衡商业目标、体验和上线成本。',
    ],
    [
      '鼠小红',
      'UI设计师',
      '建立一致的界面语言，让工具网站既专业、易用，也有品牌记忆点。',
    ],
    [
      '鼠小黄',
      '财务',
      '关注成本、收入与商业化指标，帮助产品走向长期健康运营。',
    ],
    [
      '鼠小橙',
      'HR',
      '维护团队协作、人才成长和文化建设，让每个人在合适的位置发光。',
    ],
  ];
  const en = [
    [
      'Shu Xiaolan',
      'Project Manager',
      'Keeps project rhythm, requirement breakdown, and delivery quality steady from idea to launch.',
    ],
    [
      'Shu Xiaolv',
      'Full-stack Developer',
      'Connects frontend, backend, and deployment while caring about performance and maintainability.',
    ],
    [
      'Shu Xiaozi',
      'Product Manager',
      'Translates user scenes into clear features and balances business goals, experience, and cost.',
    ],
    [
      'Shu Xiaohong',
      'UI Designer',
      'Builds a consistent interface language that feels professional, usable, and memorable.',
    ],
    [
      'Shu Xiaohuang',
      'Finance',
      'Tracks cost, revenue, and commercial metrics for healthy long-term operation.',
    ],
    [
      'Shu Xiaocheng',
      'HR',
      'Supports collaboration, growth, and team culture so people can work in the right place.',
    ],
  ];
  const ja = [
    [
      '鼠小蓝',
      'プロジェクトマネージャー',
      '進行、要件分解、納品品質を担い、アイデアを安定して公開可能なプロダクトにします。',
    ],
    [
      '鼠小绿',
      'フルスタック開発',
      'フロント、サーバー、デプロイをつなぎ、性能と保守性を重視します。',
    ],
    [
      '鼠小紫',
      'プロダクトマネージャー',
      'ユーザー場面を明確な機能へ翻訳し、ビジネス、体験、コストを調整します。',
    ],
    [
      '鼠小红',
      'UI デザイナー',
      '一貫した界面言語を築き、専門性、使いやすさ、記憶に残るブランド感を作ります。',
    ],
    [
      '鼠小黄',
      '財務',
      'コスト、収益、商用指標を見て、長期的に健全な運営を支えます。',
    ],
    [
      '鼠小橙',
      'HR',
      'チーム協作、成長、文化づくりを支え、それぞれが適した場所で力を出せるようにします。',
    ],
  ];
  const rows = locale === 'en' ? en : locale === 'ja' ? ja : zh;
  return rows.map(([name, role, bio], index) => ({
    id: ['lan', 'lv', 'zi', 'hong', 'huang', 'cheng'][index],
    name,
    role,
    bio,
    color: colors[index],
    avatarUrl: `${heroBase}/hero_poster_${avatars[index]}.webp`,
  }));
}
