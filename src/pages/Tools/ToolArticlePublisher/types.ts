import type {
  ArticlePublisherMode,
  ArticlePublisherProvider,
  OfficialCommentConfig,
  OfficialImageConfig,
} from '@/api';
import type { I18nContextValue } from '@/i18n/context';
import type { PromptTemplateId } from '@/pages/Tools/ToolArticlePublisher/config';

export interface PublisherModeSetting {
  isCustomizationOpen: boolean;
  templateId: PromptTemplateId;
}

export type DeliveryChannel = 'wechat' | 'email';

export type DeliveryChannelSettings = Record<DeliveryChannel, boolean>;

export interface ArticlePublisherForm {
  publishMode: ArticlePublisherMode;
  modeSettings: Record<ArticlePublisherMode, PublisherModeSetting>;
  appId: string;
  appSecret: string;
  finalReportEmails: string;
  deliveryChannels: DeliveryChannelSettings;
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

export interface PublishTimelineStep {
  key: string;
  name: string;
}

export type PublisherCopy = I18nContextValue['messages']['publisher'];
