import type { OfficialPublisherMode, OfficialPublisherProvider } from '@/api';
import type { WechatPublisherForm } from '@/pages/Tools/ToolOfficialPublisher/types';

/**
 * 公众号发布工具 · 智能填充模板配置
 *
 * 每个模板覆盖：
 *  - promptSystem      角色与文风定义
 *  - promptContent     主体内容要求与结构
 *  - digest            摘要写作指引
 *  - coverValue        封面图（AI 类型）描述
 *  - inlineValueList   内嵌文章图（AI 类型）描述列表，
 *                      下标 0..8 一一对应正文从前到后的第 1..9 张内嵌图，
 *                      建议沿着 promptContent 中的章节顺序设计画面，
 *                      让每张图都能呼应一个具体段落，避免出现「同样意象重复」的尴尬。
 *
 * 新增模板：在数组中追加一项即可，前端会自动按"当前表单可填充的字段数"
 * 重新计算每个模板的覆盖字段数。
 */

export type PromptTemplateId =
  | 'general'
  | 'insurance_advisor'
  | 'culture'
  | 'tech'
  | 'lifestyle'
  | 'business'
  | 'education'
  | 'emotion'
  | 'travel'
  | 'food'
  | 'fitness';

/**
 * 模板的「默认勾选」模式：
 *  - 所有模板默认勾选文字提示词、AI 封面和 AI 内嵌图
 *  - 'imagesInlineList.*.value' 是通配符，会被展开为「所有 AI 类型的内嵌图」
 */
export type AutoFillKeyPattern =
  | 'promptSystem'
  | 'promptContent'
  | 'digest'
  | 'imageCover.value'
  | 'imagesInlineList.*.value';

export interface PromptTemplate {
  id: PromptTemplateId;
  /** 模板名称，展示在弹层卡片标题 */
  label: string;
  /** 模板适用场景，一句话说明 */
  caption: string;
  /** 模板表情符号，作为卡片视觉锚点 */
  accent: string;
  fields: {
    promptSystem: string;
    promptContent: string;
    digest: string;
    coverValue: string;
    /**
     * 9 条内嵌图提示词，下标 0..8 对应正文中第 1..9 张图。
     * 即使表单中实际只插入 3 张，也按下标取前 3 条；
     * 超出长度则回退到末位（兜底逻辑见 newValueForKey）。
     */
    inlineValueList: [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ];
  };
  /**
   * 默认勾选的字段模式。可填充字段会按此模式预勾选，
   * 用户可在确认弹窗里手动调整。
   */
  defaultCheckedPatterns: AutoFillKeyPattern[];
}

export const officialPublisherToolId = 'tool-wechat-publisher';
export const officialPublisherSeoKey = 'official-publisher';
export const officialPublisherStorageKey = 'orz2:official-publisher-form';
export const wechatConsoleUrl =
  'https://developers.weixin.qq.com/console/index';
export const wechatDraftBoxUrl =
  'https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_list&action=list&begin=0&count=10&type=10&lang=zh_CN';
export const apiWhitelistIp = '43.167.247.143';
export const publisherStepKeys = [
  'generate_article',
  'prepare_cover',
  'prepare_inline_images',
  'assemble_draft',
  'submit_draft',
  'save_record',
] as const;
export const officialPublisherProviders: OfficialPublisherProvider[] = [
  'AGNES',
  'MINIMAX',
];
export const officialPublisherModes: OfficialPublisherMode[] = [
  'create',
  'rewrite',
];
export const defaultRewriteRequirement =
  '请在保留原文核心事实、信息价值和读者收益的基础上，重写成一篇全新的公众号文章。标题、开头、段落顺序、表达方式和案例串联都要明显区别于原文；不要逐句同义替换，不要照搬原文金句；排版要适合微信公众号阅读，整体有层次、有留白、有编辑感。';
export const defaultForm: WechatPublisherForm = {
  publishMode: 'create',
  appId: '',
  appSecret: '',
  provider: 'AGNES',
  promptSystem: '',
  promptContent: '',
  sourceArticleUrl: '',
  rewriteRequirement: defaultRewriteRequirement,
  imageCover: { type: 'ai', value: '' },
  imagesInlineList: [],
  author: '',
  digest: '',
  sourceUrl: '',
  comment: { open: 1, fansOnly: 0 },
};

export const promptTemplates: PromptTemplate[] = [
  {
    id: 'general',
    label: '通用资讯',
    caption: '新闻动态、客观报道，强调信息密度与人类观察',
    accent: '🗞️',
    defaultCheckedPatterns: [
      'promptSystem',
      'promptContent',
      'digest',
      'imageCover.value',
      'imagesInlineList.*.value',
    ],
    fields: {
      promptSystem:
        '你是一名长期写深度公众号的资讯编辑。文字要可信、克制、有现场感，不像新闻通稿，也不像AI总结。你擅长把复杂事件讲清楚，同时保留人类作者的观察、停顿和判断。避免官话、套话、空洞升华、机械排比，以及“值得思考”“引发热议”“随着时代发展”等AI味表达。多使用具体时间、人物反应、场景细节和现实影响。',

      promptContent:
        '请围绕【主题】写一篇 1500–2200 字的公众号资讯文章。不要按生硬提纲填空，而要像一个真正编辑在讲述一件值得关注的事。文章需要交代：发生了什么、为什么重要、谁会受到影响、背后更深层的变化是什么。可以从一个具体现场、人物反应、数据变化或反常细节切入。段落要适合公众号阅读，长短有变化，允许单句成段。小标题自然，不要像PPT目录。结尾给出一个克制但有价值的观察，不要强行升华。正文请输出微信公众号兼容的 HTML 片段，不要输出 html、body、head 标签，不要使用 Markdown。排版风格参考深度新闻杂志：整体克制、留白充足、信息层次清楚。正文主色使用深灰，辅助说明使用中性灰；小标题可以使用左侧细线或浅灰背景强调，但不要花哨。关键事实、时间、数据可以用 strong 加粗；重要背景可以用 blockquote 做灰底导读。段落之间保持舒适间距，避免大段密集文字。',

      digest:
        '60–100 字。像编辑写给读者的导读，讲清“发生了什么 + 为什么值得看”，不要像机器摘要，不要堆形容词。',

      coverValue:
        'premium editorial cover, topic:【文章主题】, cinematic documentary photography, realistic texture, restrained emotion, strong focal point, magazine-style composition, typography-friendly negative space, no text, no watermark',

      inlineValueList: [
        'editorial news photography, realistic scene related to【事件主体】, documentary style, natural light, subtle human presence, restrained emotion, premium magazine quality, 16:9, no text, no watermark',
        'minimal editorial infographic about【核心数字/关键数据】, clean layout, restrained colors, modern publication design, lots of negative space, 16:9, no text, no watermark',
        'cinematic urban or workplace scene related to【事件影响】, realistic photography, calm tension, natural shadows, documentary magazine style, 16:9, no text, no watermark',
        'timeline editorial illustration for【事件进展节点】, clean modern layout, subtle icons, premium magazine style, 16:9, no text, no watermark',
        'human-centered documentary image about【受影响人群】, realistic emotion, shallow depth of field, natural light, quiet storytelling, 16:9, no text, no watermark',
        'close-up documentary photo about【关键人物/关键物件】, realistic texture, strong focal point, quiet dramatic light, editorial magazine quality, 16:9, no text, no watermark',
        'wide establishing shot related to【事件发生地点】, realistic urban documentary photography, atmospheric sky, calm but serious tone, 16:9, no text, no watermark',
        'editorial data visualization about【趋势变化】, abstract bars, curves or map elements, clean premium news design, restrained palette, 16:9, no text, no watermark',
        'symbolic editorial image about【深层变化/社会影响】, realistic metaphor, restrained emotion, cinematic composition, premium publication style, 16:9, no text, no watermark',
      ],
    },
  },

  {
    id: 'insurance_advisor',
    label: '保险顾问',
    caption: '人身保障、家庭财务与资产管理，强调理性决策与长期主义',
    accent: '🛡️',

    defaultCheckedPatterns: [
      'promptSystem',
      'promptContent',
      'digest',
      'imageCover.value',
      'imagesInlineList.*.value',
    ],

    fields: {
      promptSystem:
        '你是一名拥有多年从业经验的保险顾问和家庭财务规划师。你写公众号时，不销售产品，不制造焦虑，也不刻意治愈。你的目标是帮助普通家庭理解风险、建立保障体系、管理长期资产。文字应当理性、克制、可信，像一个认真负责的专业人士在分享经验。避免鸡汤、成功学、夸张案例、情绪煽动和销售话术。不要频繁使用“万一”“后悔”“一定要买”等制造压力的表达。多使用真实场景、家庭决策逻辑、保障原理、数据事实和长期观察。',

      promptContent:
        '请围绕【主题】写一篇 1500–2200 字的保险与家庭财务公众号文章。不要写成产品宣传稿，也不要写成保险科普教材。应当像一位经验丰富的保险顾问，在认真分析一个现实问题。文章可以从一个真实家庭场景、客户咨询案例、社会现象、理赔事件、政策变化或资产配置问题切入。重点回答：问题是什么、人们为什么容易忽略它、正确的决策逻辑是什么、保障与资产管理应该如何配合。不要直接推荐具体产品，而是帮助读者建立判断框架。允许表达个人观察和行业经验，但不要刻意制造权威感。小标题自然形成，不要像培训课件。结尾给出一个务实且长期主义的观察，不要强行升华。正文请输出微信公众号兼容 HTML 片段，不要输出 html、body、head 标签，不要使用 Markdown。排版风格简洁专业，留白充足。正文主色深灰；数据、规则、定义可使用 strong 强调；重要观点可使用 blockquote 进行说明；避免大段密集文字。',

      digest:
        '60–100 字。用顾问视角告诉读者这篇文章讨论什么问题，以及为什么这件事与家庭保障或资产管理有关。不要写成营销文案。',

      coverValue:
        'professional financial advisor editorial cover, topic:【文章主题】, realistic lifestyle photography, trustworthy atmosphere, family finance planning, wealth protection, premium magazine composition, typography-friendly negative space, no text, no watermark',

      inlineValueList: [
        'realistic family financial planning scene related to【家庭场景】, natural interaction, trustworthy atmosphere, editorial photography, premium magazine quality, 16:9, no text, no watermark',
        'professional consultation scene about【保险决策】, advisor and client discussion, realistic office environment, documentary style, 16:9, no text, no watermark',
        'editorial infographic explaining【保障结构】, clean visual hierarchy, modern publication design, restrained colors, lots of negative space, 16:9, no text, no watermark',
        'realistic image illustrating【风险事件】, subtle storytelling, documentary photography, calm emotion, premium editorial style, 16:9, no text, no watermark',
        'financial planning workspace related to【资产配置】, documents, charts, laptop, clean professional atmosphere, magazine quality, 16:9, no text, no watermark',
        'human-centered portrait representing【目标人群】, authentic expression, natural light, trustworthy feeling, editorial photography, 16:9, no text, no watermark',
        'timeline illustration explaining【保障规划阶段】, minimalist editorial design, subtle icons, premium publication style, 16:9, no text, no watermark',
        'editorial visualization about【长期趋势】, demographic, medical cost or retirement related concepts, clean modern design, 16:9, no text, no watermark',
        'symbolic image about【家庭责任与风险管理】, realistic metaphor, restrained emotion, premium magazine composition, 16:9, no text, no watermark',
      ],
    },
  },

  {
    id: 'culture',
    label: '文化叙事',
    caption: '节日节气、人文故事，强调温度与余味',
    accent: '🏮',
    defaultCheckedPatterns: [
      'promptSystem',
      'promptContent',
      'digest',
      'imageCover.value',
      'imagesInlineList.*.value',
    ],
    fields: {
      promptSystem:
        '你是一名有文化感但不掉书袋的公众号作者。你擅长把传统文化写得温暖、真实、贴近日常，而不是百科式介绍。文字要有生活细节、人物温度和一点余味。避免说教、宏大空话、堆典故、强行拔高。文化不是知识点堆砌，而是今天的人如何重新感受到它。',

      promptContent:
        '请围绕【节日/节气名称】写一篇 1200–1800 字的文化叙事文章。不要写成节日百科。可以从一个当代生活场景开始，比如一顿饭、一阵风、一盏灯、一次回家路上的感觉。文章需要自然带出历史源流、传统习俗、文化意象，以及它和今天生活的关系。可以加入一个真实或半真实的人物故事。节奏要温和，有画面感，结尾留一点余味，不要喊口号。正文请输出微信公众号兼容的 HTML 片段，不要输出 html、body、head 标签，不要使用 Markdown。排版风格要有东方文化的安静感：留白多，段落不要挤，小标题可以使用淡米色、浅棕色或细边框营造雅致感。适合使用 blockquote 承载诗意引子、旧俗解释或一小段文化观察。传统意象、节令词、器物名可以适度加粗，但不要堆砌装饰。整体像一本温润的人文杂志，不像百科词条。',

      digest:
        '60–100 字。突出一个文化意象和一种情绪，让人想点开读，而不是像百科摘要。',

      coverValue:
        'premium Chinese cultural editorial cover, topic:【节日/节气】, poetic atmosphere, traditional motifs, ink wash texture, warm restrained palette, elegant negative space, magazine-style composition, no text, no watermark',

      inlineValueList: [
        'contemporary Chinese daily life scene related to【节日/节气】, warm natural light, poetic realism, subtle human presence, editorial photography style, 16:9, no text, no watermark',
        'traditional cultural still life related to【代表性习俗/器物】, elegant composition, soft light, ink wash inspired texture, premium editorial style, 16:9, no text, no watermark',
        'ancient Chinese poetic illustration about【历史源流/典故】, refined brushwork, restrained colors, cinematic composition, 16:9, no text, no watermark',
        'seasonal nature image related to【物候意象】, poetic landscape, soft atmosphere, minimal composition, elegant negative space, 16:9, no text, no watermark',
        'modern ritual scene about【今天可做的小仪式】, warm indoor light, realistic lifestyle photography, calm emotion, magazine quality, 16:9, no text, no watermark',
        'family gathering scene related to【团圆/传承】, warm realistic photography, soft indoor light, subtle emotion, premium cultural editorial style, 16:9, no text, no watermark',
        'poetic close-up of【节令食物/手作】, elegant table setting, natural texture, restrained warm colors, magazine still life photography, 16:9, no text, no watermark',
        'traditional architecture or old street related to【地域文化】, misty morning light, poetic realism, refined Chinese editorial atmosphere, 16:9, no text, no watermark',
        'symbolic cultural illustration about【文化余味/精神意象】, ink wash and modern editorial fusion, quiet negative space, elegant composition, 16:9, no text, no watermark',
      ],
    },
  },

  {
    id: 'tech',
    label: '科技数码',
    caption: '产品测评、技术解读，强调体验与判断',
    accent: '💻',
    defaultCheckedPatterns: [
      'promptSystem',
      'promptContent',
      'digest',
      'imageCover.value',
      'imagesInlineList.*.value',
    ],
    fields: {
      promptSystem:
        '你是一名真正懂产品和用户体验的科技作者。不要写成发布会文案、参数说明书或营销软文。你擅长把技术细节翻译成普通人能感知的体验差异。语言清晰、克制、有判断。允许写优点，也要写取舍和小缺点。避免“重新定义”“颠覆行业”“未来已来”等空泛科技套话。',

      promptContent:
        '请围绕【产品/技术主题】写一篇 1800–2600 字的公众号科技文章。文章要像一个认真体验过的人在分享判断，而不是复制参数表。可以从一个真实使用瞬间切入，再展开它的核心能力、体验差异、适合人群、同类对比和购买/使用建议。参数可以出现，但必须解释“对用户意味着什么”。结论要有明确立场，也要说明不适合谁。正文请输出微信公众号兼容的 HTML 片段，不要输出 html、body、head 标签，不要使用 Markdown。排版风格要偏现代科技媒体：结构清晰、模块感强、阅读效率高。可以用浅灰或深色系 section 做“体验结论”“适合人群”“不适合人群”“购买建议”等信息卡片。参数不要堆成长表，优先用短列表解释用户感知。关键结论用 strong 加粗，小标题要明确但不夸张。整体像高质量科技评测文章，不像发布会PPT。',

      digest:
        '60–100 字。提炼最关键的体验差异、适合人群和一个明确判断，不要像产品广告。',

      coverValue:
        'premium tech editorial cover, topic:【产品/技术】, cinematic lighting, realistic industrial design, dark background, subtle glow accents, futuristic but restrained, magazine-style composition, no text, no watermark',

      inlineValueList: [
        'premium editorial tech photography of【产品/技术】, cinematic industrial lighting, realistic texture, dark clean background, 16:9, no text, no watermark',
        'real-life usage scenario of【产品/技术】, human interaction, natural light, documentary lifestyle tech photography, 16:9, no text, no watermark',
        'minimal comparison infographic about【核心参数/能力对比】, clean modern layout, restrained colors, editorial style, 16:9, no text, no watermark',
        'technical breakdown illustration for【工作原理/内部结构】, modern line art, subtle highlights, premium infographic aesthetic, 16:9, no text, no watermark',
        'workspace scene using【产品/技术】, cinematic natural light, realistic productivity atmosphere, premium lifestyle-tech editorial style, 16:9, no text, no watermark',
        'close-up macro shot of【产品细节/交互界面】, realistic material texture, cinematic reflections, premium tech magazine style, 16:9, no text, no watermark',
        'user testing scene related to【真实体验/痛点】, ordinary person using device or software, natural light, documentary tech editorial style, 16:9, no text, no watermark',
        'ecosystem diagram illustration about【生态/兼容性】, clean nodes and connections, futuristic restrained design, premium publication style, 16:9, no text, no watermark',
        'buying decision visual about【适合人群/不适合人群】, split-screen editorial composition, clean modern tech aesthetic, restrained colors, 16:9, no text, no watermark',
      ],
    },
  },

  {
    id: 'lifestyle',
    label: '生活方式',
    caption: '治愈、生活美学，强调轻盈与真实感',
    accent: '🌿',
    defaultCheckedPatterns: [
      'promptSystem',
      'promptContent',
      'digest',
      'imageCover.value',
      'imagesInlineList.*.value',
    ],
    fields: {
      promptSystem:
        '你是一名生活方式类公众号作者，文字温和、克制、有呼吸感。不要假装治愈，不要贩卖焦虑，不要写鸡汤。你更擅长记录普通生活里的细节：光线、气味、声音、动作、温度和空间感。文章应该像一个真实的人在认真观察生活，而不是AI在制造情绪。',

      promptContent:
        '请围绕【生活主题】写一篇 1000–1600 字的生活方式文章。不要写成“治愈系模板文”。可以从一个清晨、午后或夜晚的具体瞬间开始，用几个生活细节慢慢展开。文章要有画面、有节奏、有轻微情绪，但不要过度文艺。可以写一个小习惯、小物件或小场景，最后自然收住，不要强行升华。正文请输出微信公众号兼容的 HTML 片段，不要输出 html、body、head 标签，不要使用 Markdown。排版风格要轻盈、干净、有呼吸感：段落短一些，留白多一些，避免信息块过重。可以使用浅米色、淡绿色、暖灰色做柔和背景；小标题不要太硬，可以像杂志栏目标题。适合用少量 blockquote 承载一句生活观察。不要做夸张渐变和复杂装饰，整体像安静的生活杂志页面。',

      digest:
        '60–100 字。捕捉一种具体生活氛围，不要使用“治愈”“松弛感”等空泛热词堆砌。',

      coverValue:
        'premium lifestyle editorial photography, topic:【生活主题】, warm natural light, relaxed composition, realistic texture, calm atmosphere, magazine cover style, typography-friendly negative space, no text, no watermark',

      inlineValueList: [
        'quiet lifestyle photography related to【生活主题】, soft morning or afternoon light, realistic home scene, calm atmosphere, 16:9, no text, no watermark',
        'close-up editorial photo of daily details related to【光影/气味/声音】, shallow depth of field, warm natural light, realistic texture, 16:9, no text, no watermark',
        'minimal interior scene about【空间/小物件】, relaxed composition, premium magazine photography, natural shadows, 16:9, no text, no watermark',
        'human solitude moment related to【独处/习惯】, back view or partial figure, cinematic soft light, emotionally restrained, 16:9, no text, no watermark',
        'ending atmosphere image related to【文末意象】, window light, plants, sky or quiet room, minimal composition, elegant negative space, 16:9, no text, no watermark',
        'slow morning routine scene about【日常小习惯】, coffee, book, blanket or desk, warm natural light, realistic lifestyle editorial style, 16:9, no text, no watermark',
        'seasonal lifestyle image related to【季节/天气】, rain, sunlight, breeze or evening sky, calm poetic realism, premium magazine composition, 16:9, no text, no watermark',
        'hands interacting with【小物件/手作/家务】, close-up lifestyle photography, natural texture, soft shadows, quiet storytelling, 16:9, no text, no watermark',
        'neighborhood walking scene related to【日常散步/城市角落】, realistic street light, gentle human presence, calm editorial photography, 16:9, no text, no watermark',
      ],
    },
  },

  {
    id: 'business',
    label: '商业财经',
    caption: '行业分析、商业洞察，强调理性与判断',
    accent: '📈',
    defaultCheckedPatterns: [
      'promptSystem',
      'promptContent',
      'digest',
      'imageCover.value',
      'imagesInlineList.*.value',
    ],
    fields: {
      promptSystem:
        '你是一名商业财经专栏作者，擅长把公司、行业和政策放进更长的周期里观察。文章要有判断，但不要情绪化；要有数据，但不要堆砌报表；要有深度，但不要写成研报。你的语言克制、有锋芒、有现实感。避免“资本寒冬”“风口已至”“下半场”等陈词滥调。',

      promptContent:
        '请围绕【商业话题】写一篇 2000–2800 字的公众号深度分析。不要写成标准研报，也不要写成财经新闻拼贴。文章需要讲清：这件事为什么发生、商业逻辑是什么、产业链谁受益谁承压、头部玩家如何选择、未来 6–12 个月可能怎么演化。可以使用数据、案例和对比，但每个数据都要服务于判断。结尾给出风险与机会，不要喊口号。正文请输出微信公众号兼容的 HTML 片段，不要输出 html、body、head 标签，不要使用 Markdown。排版风格参考高端商业杂志：理性、干净、有纵深。可以使用深灰、金色点缀、浅灰底信息卡片。核心判断、关键数据、风险提示要通过 section 或 blockquote 单独呈现。列表要短而锋利，避免长篇堆砌。小标题要像商业专栏，不要像研报目录。整体要有专业感，但不能像证券报告。',

      digest:
        '60–100 字。给出核心判断 + 一个关键事实或数据。语气专业克制，不要像投资号标题党。',

      coverValue:
        'premium business editorial cover, topic:【商业话题】, dark charcoal background, subtle golden highlights, cinematic corporate atmosphere, restrained luxury, strong focal point, magazine-style composition, no text, no watermark',

      inlineValueList: [
        'business editorial photography related to【商业话题】, city skyline or corporate environment, cinematic lighting, restrained luxury, 16:9, no text, no watermark',
        'industry landscape visualization about【赛道格局】, premium data network aesthetic, dark background, subtle gold highlights, 16:9, no text, no watermark',
        'supply chain editorial image related to【上游/中游/下游】, realistic industrial or logistics scene, documentary style, 16:9, no text, no watermark',
        'minimal strategy comparison infographic about【头部玩家对比】, clean business magazine layout, restrained colors, 16:9, no text, no watermark',
        'risk and opportunity matrix visualization about【风险/机会】, elegant financial editorial design, dark professional palette, 16:9, no text, no watermark',
        'executive meeting scene related to【关键决策】, realistic corporate photography, muted tones, glass reflection, calm tension, 16:9, no text, no watermark',
        'market trend chart visualization about【增长/下滑趋势】, premium financial editorial design, clean lines, dark restrained background, 16:9, no text, no watermark',
        'consumer behavior scene related to【用户需求变化】, realistic retail, office or digital payment moment, documentary business photography, 16:9, no text, no watermark',
        'macro economy symbolic image about【政策/周期影响】, city lights, documents, subtle data overlay, cinematic business magazine style, 16:9, no text, no watermark',
      ],
    },
  },

  {
    id: 'education',
    label: '教育培训',
    caption: '知识科普、课程学习，强调可学与可用',
    accent: '📚',
    defaultCheckedPatterns: [
      'promptSystem',
      'promptContent',
      'digest',
      'imageCover.value',
      'imagesInlineList.*.value',
    ],
    fields: {
      promptSystem:
        '你是一名懂教学设计的教育作者。你擅长把抽象知识讲成读者能理解、能练习、能立刻使用的内容。不要像教材，也不要像培训广告。表达要清楚、有层次、有例子。每个概念都要解释“它解决什么问题”。每个建议都要尽量可执行。',

      promptContent:
        '请围绕【学习主题】写一篇 1500–2200 字的公众号科普/教程文章。文章要让读者读完真的知道下一步怎么做。可以从一个常见困惑或真实学习场景切入，再解释核心概念、常见误区、练习路径和延伸资料。不要堆术语；如果出现术语，要用类比、例子或小场景解释。建议给出 3–5 步可执行路径。正文请输出微信公众号兼容的 HTML 片段，不要输出 html、body、head 标签，不要使用 Markdown。排版风格要清爽、可学习、低压力：多用小标题、短段落、编号列表和提示卡片。核心概念可以用浅蓝或浅灰背景 section 单独解释；练习步骤用 ol；误区用 ul 或对比式段落呈现。重点是让读者一眼能找到“概念、例子、方法、练习”。不要做花哨装饰，像一本好读的学习手册。',

      digest:
        '60–100 字。突出读者读完能掌握什么能力、适合谁、能解决什么具体问题。',

      coverValue:
        'premium education editorial cover, topic:【学习主题】, clean light background, elegant illustration and diagram elements, calm blue or warm white palette, clear composition, magazine-style, no text, no watermark',

      inlineValueList: [
        'editorial education illustration about【为什么要学】, clean light background, symbolic object like ladder, key or lamp, premium magazine style, 16:9, no text, no watermark',
        'concept explanation infographic about【核心概念】, simple analogy visualization, clean layout, restrained colors, 16:9, no text, no watermark',
        'realistic study scene related to【学习过程】, notebook, screen or whiteboard, natural light, calm productive atmosphere, 16:9, no text, no watermark',
        'step-by-step learning path visualization about【练习路径】, modern flowchart, 3 to 5 steps, clean editorial design, 16:9, no text, no watermark',
        'common mistakes comparison illustration about【常见误区】, left-right contrast, clear but not childish, modern education design, 16:9, no text, no watermark',
        'teacher explaining【关键知识点】 on whiteboard or tablet, realistic classroom or online learning scene, soft natural light, 16:9, no text, no watermark',
        'practice worksheet or notebook scene about【练习任务】, pencil marks, clean desk, realistic texture, calm learning atmosphere, 16:9, no text, no watermark',
        'knowledge structure mind map about【知识框架】, elegant nodes and branches, premium education editorial design, light background, 16:9, no text, no watermark',
        'learning outcome scene related to【应用场景】, student or professional using new skill in real life, warm realistic editorial photography, 16:9, no text, no watermark',
      ],
    },
  },

  {
    id: 'emotion',
    label: '情感心理',
    caption: '情感关系、心理疗愈，强调共情与分寸',
    accent: '🌙',
    defaultCheckedPatterns: [
      'promptSystem',
      'promptContent',
      'digest',
      'imageCover.value',
      'imagesInlineList.*.value',
    ],
    fields: {
      promptSystem:
        '你是一名情感心理类公众号作者。你的文字温柔但不鸡汤，共情但不讨好，克制但不冷漠。不要评判读者，不要使用“你必须”“你应该”这类命令式表达。你擅长把复杂情绪放回具体生活场景里，让读者感到被理解，而不是被教育。心理学概念可以用，但必须讲成人话。',

      promptContent:
        '请围绕【情感话题】写一篇 1200–1800 字的公众号文章。不要写成情绪鸡汤或心理学讲义。可以从一个很小的生活场景切入，比如一条没回的消息、一顿沉默的饭、一次忍住没说出口的话。文章需要描述这种情绪为什么会出现，用一个心理学视角帮助读者理解它，再给一个可以立刻尝试的小练习。结尾要温柔、克制，不要说教。正文请输出微信公众号兼容的 HTML 片段，不要输出 html、body、head 标签，不要使用 Markdown。排版风格要柔和、安静、有陪伴感：段落不要太长，允许单句成段。可以使用淡紫、暖灰、浅米色背景承载“心理学视角”“给自己的小练习”等内容。不要用过多感叹号，不要鸡汤式大字报。blockquote 适合放一两句克制的共情表达。整体像深夜读到的一篇温柔专栏。',

      digest:
        '60–100 字。传递一种“被理解”的感觉，点出情绪场景和文章能带来的一个小帮助。',

      coverValue:
        'premium emotional psychology editorial cover, topic:【情感话题】, soft muted colors, quiet negative space, subtle human silhouette, cinematic soft light, calm and restrained atmosphere, no text, no watermark',

      inlineValueList: [
        'soft editorial illustration about【生活切入场景】, muted colors, quiet human emotion, cinematic composition, 16:9, no text, no watermark',
        'symbolic psychology image about【内心状态】, double exposure silhouette, soft light, poetic but restrained, 16:9, no text, no watermark',
        'relationship distance scene related to【人与人的互动】, two figures, subtle body language, calm tension, realistic editorial photography, 16:9, no text, no watermark',
        'minimal psychology concept diagram about【心理学概念】, clean shapes, soft muted palette, easy to understand, 16:9, no text, no watermark',
        'quiet self-care practice scene related to【小练习】, writing, breathing or walking alone, warm soft light, realistic texture, 16:9, no text, no watermark',
        'phone message scene related to【未说出口的话/未回复的消息】, close-up hands, dim warm light, quiet emotional tension, 16:9, no text, no watermark',
        'night window scene about【孤独/自我对话】, soft city lights, subtle silhouette, calm muted colors, cinematic editorial style, 16:9, no text, no watermark',
        'gentle conversation scene related to【边界/沟通】, two people sitting apart, natural body language, warm restrained photography, 16:9, no text, no watermark',
        'symbolic healing image about【情绪松动/重新理解自己】, soft dawn light, open space, poetic minimal composition, premium editorial style, 16:9, no text, no watermark',
      ],
    },
  },

  {
    id: 'travel',
    label: '旅行探索',
    caption: '旅行攻略、城市探店，强调实用与画面感',
    accent: '🗺️',
    defaultCheckedPatterns: [
      'promptSystem',
      'promptContent',
      'digest',
      'imageCover.value',
      'imagesInlineList.*.value',
    ],
    fields: {
      promptSystem:
        '你是一名旅行专栏作者，既有画面感，也有实操性。不要写成景点百科，也不要堆“绝美”“宝藏”“治愈”等空泛词。你的文章要让读者真的知道怎么去、什么时候去、怎么订、哪里值得花时间、哪里可以跳过。文字里要有真实行走感、天气、光线、路程和人的状态。',

      promptContent:
        '请围绕【目的地/主题】写一篇 1800–2500 字的公众号旅行文章。不要写成流水账攻略。可以从抵达后的一个画面开始，比如清晨街口、车站出口、第一口食物或一段路。文章需要包含行程建议、必去地点、吃住建议、交通/预约/预算/避坑信息。实用信息要具体，但表达要有故事感。适合安排成两天一夜或三天两晚。结尾给出适合什么人去、不适合什么人去。正文请输出微信公众号兼容的 HTML 片段，不要输出 html、body、head 标签，不要使用 Markdown。排版风格要像旅行杂志和实用攻略的结合：开头有画面，中段信息清楚。可以使用浅蓝、沙色、浅绿色等自然色作为提示卡背景。路线、预算、交通、预约、避坑建议要用 section、ul 或 ol 单独呈现，便于收藏。小标题可以带一点地点感，但不要标题党。整体要既好看，又真的方便读者照着走。',

      digest:
        '60–100 字。点出目的地最值得去的一件事、适合谁，以及一个实用提醒。',

      coverValue:
        'premium travel magazine cover, destination:【目的地/主题】, cinematic natural light, realistic editorial travel photography, strong sense of place, airy composition, typography-friendly negative space, no text, no watermark',

      inlineValueList: [
        'editorial travel photography of【目的地标志性画面】, golden hour or soft morning light, realistic texture, cinematic atmosphere, 16:9, no text, no watermark',
        'travel route map illustration for【行程安排】, clean editorial design, subtle icons, premium magazine layout, 16:9, no text, no watermark',
        'realistic street scene in【目的地】, local life, natural light, human presence, documentary travel photography, 16:9, no text, no watermark',
        'food photography related to【本地美食】, natural side light, appetizing but realistic, editorial magazine style, 16:9, no text, no watermark',
        'travel essentials flat lay related to【出发前必带物品】, clean background, realistic texture, premium editorial composition, 16:9, no text, no watermark',
        'hotel or guesthouse scene related to【住宿建议】, warm interior light, clean realistic travel lifestyle photography, 16:9, no text, no watermark',
        'transportation scene related to【交通方式】, train station, bus stop, airport or walking route, documentary travel style, 16:9, no text, no watermark',
        'hidden local spot image about【小众地点/可跳过景点】, quiet street corner, realistic atmosphere, human-scale travel photography, 16:9, no text, no watermark',
        'budget and booking visual about【预算/预约/避坑】, elegant travel planning flat lay, tickets, calendar, map, clean editorial composition, 16:9, no text, no watermark',
      ],
    },
  },

  {
    id: 'food',
    label: '美食烹饪',
    caption: '食谱教程、餐厅评测，强调步骤与诱惑力',
    accent: '🍜',
    defaultCheckedPatterns: [
      'promptSystem',
      'promptContent',
      'digest',
      'imageCover.value',
      'imagesInlineList.*.value',
    ],
    fields: {
      promptSystem:
        '你是一名美食作者，文字要让人有食欲，但不要夸张油腻。你擅长写味道、火候、香气、口感和厨房里的细节。食谱要严谨，份量、时间、火候和判断标准都要清楚。餐厅评测要真实，不要像广告。关键是告诉读者：为什么这样做更好吃，为什么这口值得记住。',

      promptContent:
        '请围绕【菜名/餐厅】写一篇 1500–2200 字的公众号美食文章。如果是菜谱，要包含风味来源、食材清单、关键步骤、火候时间、判断标准和至少 3 个“这样做更好吃”的具体提示。如果是餐厅，要写清招牌菜、口味记忆点、环境、价格区间、适合场景和是否值得专程去。不要写成菜单介绍，要有香气、声音、动作和入口瞬间。正文请输出微信公众号兼容的 HTML 片段，不要输出 html、body、head 标签，不要使用 Markdown。排版风格要有食欲但不油腻：可以使用暖色、浅米色、木质感色系作为背景。食材清单、步骤、火候判断、好吃秘诀要用清晰的 section、ul、ol 呈现，便于读者照做。描写味道的段落可以更有画面感，步骤部分要更利落。重点提示可以用浅色卡片，但不要像菜单广告。',

      digest:
        '60–100 字。传递这道菜/这家店最有记忆点的一口，以及为什么值得看。',

      coverValue:
        'premium food editorial cover, topic:【菜名/餐厅】, warm natural side light, appetizing realistic texture, elegant table styling, magazine photography, rich but restrained colors, no text, no watermark',

      inlineValueList: [
        'premium food photography of【成品菜】, 45 degree angle, warm natural side light, steam or glossy sauce, realistic appetizing texture, 16:9, no text, no watermark',
        'ingredient flat lay for【食材清单】, natural wood or stone surface, clean arrangement, editorial food magazine style, 16:9, no text, no watermark',
        'cooking process close-up for【关键步骤】, hands in motion, pan, steam, oil shimmer, realistic kitchen light, 16:9, no text, no watermark',
        'plating detail of【摆盘/出锅瞬间】, shallow depth of field, elegant tableware, warm light, premium food editorial style, 16:9, no text, no watermark',
        'dining table scene related to【搭配建议/用餐场景】, cozy warm light, subtle human presence, realistic restaurant or home atmosphere, 16:9, no text, no watermark',
        'macro texture shot of【口感记忆点】, crispy edge, tender inside, glossy sauce or layered texture, premium food photography, 16:9, no text, no watermark',
        'restaurant environment photo related to【餐厅氛围】, warm lighting, realistic guests and table details, editorial dining photography, 16:9, no text, no watermark',
        'chef hands preparing【风味来源/关键调味】, spices, sauce, knife work or wok heat, cinematic kitchen documentary style, 16:9, no text, no watermark',
        'serving moment image related to【入口瞬间/分享场景】, chopsticks, spoon or fork lifting food, warm realistic light, appetizing editorial composition, 16:9, no text, no watermark',
      ],
    },
  },

  {
    id: 'fitness',
    label: '健身运动',
    caption: '训练计划、运动科学，强调安全与可执行',
    accent: '🏃',
    defaultCheckedPatterns: [
      'promptSystem',
      'promptContent',
      'digest',
      'imageCover.value',
      'imagesInlineList.*.value',
    ],
    fields: {
      promptSystem:
        '你是一名懂训练科学也懂普通人的健身作者。坚持“动作质量 > 强度”“循序渐进”“个体差异”三原则。不要制造身材焦虑，不要用夸张承诺吸引读者。你的文章要安全、清楚、可执行，能让普通人知道今天该怎么开始、哪里容易做错、什么时候该停止。',

      promptContent:
        '请围绕【训练目标/项目】写一篇 1800–2500 字的公众号健身文章。文章要先说明适合人群和不适合人群，再讲安全提醒、常见错误、4 周渐进计划、动作清单、饮食恢复建议。动作说明必须包含目标肌群、组数、次数、休息时间、注意事项和替代动作。语气要鼓励但不鸡血，不承诺快速逆袭。正文请输出微信公众号兼容的 HTML 片段，不要输出 html、body、head 标签，不要使用 Markdown。排版风格要清晰、有力量但不焦虑：可以使用黑白灰、浅绿色或运动感蓝色做辅助色。适合人群、安全提醒、训练计划、动作说明、恢复建议要拆成清楚模块。动作清单用列表呈现，4 周计划用分段或卡片呈现。安全提醒要醒目但不吓人。整体像专业训练指南，不像卖课海报。',

      digest: '60–100 字。说明适合人群、训练频率和最关键的安全提醒。',

      coverValue:
        'premium fitness editorial cover, topic:【训练目标/项目】, dynamic sports photography, cinematic contrast lighting, realistic athlete or ordinary person training, energetic but not aggressive, magazine-style composition, no text, no watermark',

      inlineValueList: [
        'realistic fitness editorial photography related to【训练目标】, ordinary person training safely, cinematic gym or outdoor light, 16:9, no text, no watermark',
        'exercise form comparison illustration about【常见错误动作】, correct vs incorrect posture, clean instructional design, 16:9, no text, no watermark',
        '4-week training plan calendar visualization for【训练计划】, clean modern layout, training and rest days clearly marked, 16:9, no text, no watermark',
        'exercise demonstration image for【核心动作】, clear body posture, subtle muscle highlight, professional instructional style, 16:9, no text, no watermark',
        'recovery and nutrition scene related to【饮食/恢复建议】, balanced meal, stretching or sleep routine, realistic lifestyle sports photography, 16:9, no text, no watermark',
        'warm-up routine illustration about【热身动作】, mobility drills, clean sports instructional design, realistic body posture, 16:9, no text, no watermark',
        'progressive overload visualization about【循序渐进原则】, simple chart and training icons, clean editorial fitness design, 16:9, no text, no watermark',
        'outdoor training scene related to【替代动作/低门槛开始】, ordinary person exercising safely, morning light, encouraging but realistic mood, 16:9, no text, no watermark',
        'injury prevention image related to【停止信号/安全提醒】, stretching, joint care or rest moment, calm professional sports editorial style, 16:9, no text, no watermark',
      ],
    },
  },
];
