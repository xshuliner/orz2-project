import type {
  OfficialCommentConfig,
  OfficialImageConfig,
  OfficialPublisherMode,
  OfficialPublisherProvider,
} from '@/api';
import type { I18nContextValue } from '@/i18n/context';
import type {
  PromptTemplate,
  PromptTemplateId,
} from '@/pages/Tools/ToolOfficialPublisher/config';

export type PublisherEditorMode = 'simple' | 'advanced';

export interface PublisherModeSetting {
  editorMode: PublisherEditorMode;
  templateId: PromptTemplateId;
}

export interface WechatPublisherForm {
  publishMode: OfficialPublisherMode;
  modeSettings: Record<OfficialPublisherMode, PublisherModeSetting>;
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
  | `imageCover.value`
  | `imagesInlineList.${number}.value`;

export interface AutoFillSnapshot {
  templateId: PromptTemplate['id'];
  templateLabel: string;
  previousValues: Partial<Record<AutoFillKey, string>>;
  filledValues: Partial<Record<AutoFillKey, string>>;
  filledKeys: AutoFillKey[];
}
