import type { OfficialPublisherMode, OfficialPublisherProvider } from '@/api';
import type { WechatPublisherForm } from '@/pages/Tools/ToolOfficialPublisher/types';

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

export type AutoFillKeyPattern =
  | 'promptSystem'
  | 'promptContent'
  | 'digest'
  | 'imageCover.value'
  | 'imagesInlineList.*.value';

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
  accent: string;
  defaultCheckedPatterns: AutoFillKeyPattern[];
}

export interface PromptTemplate
  extends PromptTemplateConfig, PromptTemplateCopy {}

export type PromptTemplateCopyMap = Record<
  PromptTemplateId,
  PromptTemplateCopy
>;

const defaultCheckedPatterns: AutoFillKeyPattern[] = [
  'promptSystem',
  'promptContent',
  'digest',
  'imageCover.value',
  'imagesInlineList.*.value',
];

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

export const defaultForm: WechatPublisherForm = {
  publishMode: 'create',
  appId: '',
  appSecret: '',
  provider: 'AGNES',
  promptSystem: '',
  promptContent: '',
  sourceArticleUrl: '',
  rewriteRequirement: '',
  imageCover: { type: 'ai', value: '' },
  imagesInlineList: [],
  author: '',
  digest: '',
  sourceUrl: '',
  comment: { open: 1, fansOnly: 0 },
};

export const promptTemplateConfigs: PromptTemplateConfig[] = [
  { id: 'general', accent: '🗞️', defaultCheckedPatterns },
  { id: 'insurance_advisor', accent: '🛡️', defaultCheckedPatterns },
  { id: 'culture', accent: '🏮', defaultCheckedPatterns },
  { id: 'tech', accent: '💻', defaultCheckedPatterns },
  { id: 'lifestyle', accent: '🌿', defaultCheckedPatterns },
  { id: 'business', accent: '📈', defaultCheckedPatterns },
  { id: 'education', accent: '📚', defaultCheckedPatterns },
  { id: 'emotion', accent: '🌙', defaultCheckedPatterns },
  { id: 'travel', accent: '🗺️', defaultCheckedPatterns },
  { id: 'food', accent: '🍜', defaultCheckedPatterns },
  { id: 'fitness', accent: '🏃', defaultCheckedPatterns },
];

export function getPromptTemplates(
  copyMap: PromptTemplateCopyMap
): PromptTemplate[] {
  return promptTemplateConfigs.map(config => ({
    ...config,
    ...copyMap[config.id],
  }));
}
