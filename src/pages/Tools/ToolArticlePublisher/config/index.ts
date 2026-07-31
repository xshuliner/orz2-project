import type { ArticlePublisherMode, ArticlePublisherProvider } from '@/api';
import type { ArticlePublisherForm } from '@/pages/Tools/ToolArticlePublisher/types';

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

export interface PromptTemplateFields {
  promptSystem: string;
  promptContent: string;
  digest: string;
  coverValue: string;
  inlineValueList: readonly [
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
}

export interface PromptTemplateCopy {
  label: string;
  caption: string;
  fields: PromptTemplateFields;
}

export interface PromptTemplateConfig {
  id: PromptTemplateId;
}

export interface PromptTemplate
  extends PromptTemplateConfig, PromptTemplateCopy {}

export type PromptTemplateCopyMap = Record<
  PromptTemplateId,
  PromptTemplateCopy
>;

export const articlePublisherToolId = 'tool-article-publisher';
export const articlePublisherSeoKey = 'article-publisher';
export const articlePublisherScheduleEmail = 'agjgj187076081@gmail.com';
export const defaultPromptTemplateId: PromptTemplateId = 'general';
export const defaultSimpleInlineImageCount = 3;
export const wechatConsoleUrl =
  'https://developers.weixin.qq.com/console/index';
export const wechatDraftBoxUrl =
  'https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_list&action=list&begin=0&count=10&type=10&lang=zh_CN';
export const apiWhitelistIp = '43.167.247.143';
export const publisherStepKeys = [
  'generate_article',
  'prepare_cover',
  'prepare_inline_images',
  'save_record',
  'assemble_draft',
  'submit_draft',
] as const;
export const articlePublisherProviders: ArticlePublisherProvider[] = [
  'AGNES',
  'MINIMAX',
];
export const articlePublisherModes: ArticlePublisherMode[] = [
  'create',
  'rewrite',
];
export const defaultPublisherForm: ArticlePublisherForm = {
  publishMode: 'create',
  modeSettings: {
    create: { isCustomizationOpen: false, templateId: defaultPromptTemplateId },
    rewrite: {
      isCustomizationOpen: false,
      templateId: defaultPromptTemplateId,
    },
  },
  appId: '',
  appSecret: '',
  finalReportEmails: '',
  deliveryChannels: { wechat: false, email: false },
  provider: 'MINIMAX',
  promptSystem: '',
  promptContent: '',
  sourceArticleUrl: '',
  rewriteRequirement: '',
  imageCover: { type: 'ai', value: '' },
  imagesInlineList: [],
  author: '',
  comment: { open: 1, fansOnly: 0 },
};

export const promptTemplateConfigs: PromptTemplateConfig[] = [
  { id: 'general' },
  { id: 'insurance_advisor' },
  { id: 'culture' },
  { id: 'tech' },
  { id: 'lifestyle' },
  { id: 'business' },
  { id: 'education' },
  { id: 'emotion' },
  { id: 'travel' },
  { id: 'food' },
  { id: 'fitness' },
];

export function getPromptTemplates(
  copyMap: PromptTemplateCopyMap
): PromptTemplate[] {
  return promptTemplateConfigs.map(config => ({
    ...config,
    ...copyMap[config.id],
  }));
}
