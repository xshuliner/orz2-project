import type { ArticlePublisherMode, ArticlePublisherProvider } from '@/api';
import type { ArticlePublisherForm } from '@/pages/Tools/ToolArticlePublisher/types';

export const articlePublisherToolId = 'tool-article-publisher';
export const articlePublisherSeoKey = 'article-publisher';
export const articlePublisherScheduleEmail = 'agjgj187076081@gmail.com';
export const customArticleTemplateId = '__local_custom__';
export const defaultInlineImageCount = 3;
export const maxInlineImageCount = 9;
export const articleTemplateCacheTtlSeconds = 7 * 24 * 60 * 60;
export const wechatConsoleUrl =
  'https://developers.weixin.qq.com/console/index';
export const wechatDraftBoxUrl =
  'https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_list&action=list&begin=0&count=10&type=10&lang=zh_CN';
export const apiWhitelistIp = '43.167.247.143';
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
    create: { isCustomizationOpen: false, templateId: '' },
    rewrite: {
      isCustomizationOpen: false,
      templateId: '',
    },
  },
  deliveryWechat: false,
  deliveryEmail: false,
  appId: '',
  appSecret: '',
  finalReportEmails: '',
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
