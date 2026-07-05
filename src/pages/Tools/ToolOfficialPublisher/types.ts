import type {
  OfficialCommentConfig,
  OfficialImageConfig,
  OfficialPublisherMode,
  OfficialPublisherProvider,
} from '@/api';
import type { I18nContextValue } from '@/i18n/context';
import type { PromptTemplate } from '@/pages/Tools/ToolOfficialPublisher/config';

export interface WechatPublisherForm {
  publishMode: OfficialPublisherMode;
  appId: string;
  appSecret: string;
  provider: OfficialPublisherProvider;
  promptSystem: string;
  promptContent: string;
  sourceArticleUrl: string;
  rewriteRequirement: string;
  imageCover: OfficialImageConfig;
  imagesInlineList: OfficialImageConfig[];
  author: string;
  digest: string;
  sourceUrl: string;
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

export type PublisherCopy = I18nContextValue['messages']['publisher'];

export type AutoFillKey =
  | 'promptSystem'
  | 'promptContent'
  | 'digest'
  | `imageCover.value`
  | `imagesInlineList.${number}.value`;

export interface AutoFillSnapshot {
  templateId: PromptTemplate['id'];
  templateLabel: string;
  previousValues: Partial<Record<AutoFillKey, string>>;
  filledValues: Partial<Record<AutoFillKey, string>>;
  filledKeys: AutoFillKey[];
}
