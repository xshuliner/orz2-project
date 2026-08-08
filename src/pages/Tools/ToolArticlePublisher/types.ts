import type {
  ArticlePublisherMode,
  ArticlePublisherProgressStep,
  ArticlePublisherProvider,
  ArticleTemplate,
  OfficialCommentConfig,
  OfficialImageConfig,
} from '@/api';
import type { I18nContextValue } from '@/i18n/context';

export interface PublisherModeSetting {
  isCustomizationOpen: boolean;
  templateId: string;
  customTemplate?: ArticleTemplate;
}

export interface ArticlePublisherForm {
  publishMode: ArticlePublisherMode;
  modeSettings: Record<ArticlePublisherMode, PublisherModeSetting>;
  deliveryWechat: boolean;
  deliveryEmail: boolean;
  appId: string;
  appSecret: string;
  finalReportEmails: string;
  provider: ArticlePublisherProvider;
  promptSystem: string;
  promptContent: string;
  sourceArticleUrl: string;
  rewriteRequirement: string;
  imageCover: OfficialImageConfig;
  imagesInlineList: OfficialImageConfig[];
  author: string;
  comment: OfficialCommentConfig;
}

export interface CompletionItem {
  label: string;
  done: boolean;
}

export type PublishPhase =
  | 'idle'
  | 'connecting'
  | 'publishing'
  | 'completed'
  | 'failed';

export type PublishStepStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'warning'
  | 'failed';

export interface PublishStep {
  index: number;
  key: string;
  name: string;
  status: PublishStepStatus;
  message?: string;
  durationMs?: number;
  requestedCount?: number;
}

export type PublishTimelineStep = ArticlePublisherProgressStep;

export type PublisherCopy = I18nContextValue['messages']['publisher'];
