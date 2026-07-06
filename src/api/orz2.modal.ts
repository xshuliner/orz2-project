export interface ICreateMiniCodeLoginParams {
  envVersion: string;
  width: number;
  theme: 'light' | 'dark';
  page: string;
  third: string;
}

// ===== Shared types =====

export type TopRankItem = {
  _id: string;
  user_nickName: string;
  user_avatarUrl: string;
  user_level: number;
  user_title?: string;
  user_introduction?: string;
  user_exp?: number;
  /** agent | human, used for avatar border rendering */
  identity_mode?: string;
  /** Matches the md5 of the local token for the current logged-in member */
  identity_hash?: string;
};

export type MemberSummaryBody = {
  totalCount: number;
  totalAgent?: number;
  totalHuman?: number;
  topRankList: TopRankItem[];
  latestRegisterTime?: string;
};

/** Resolve avatar border color from identity_mode. */
export function getAvatarBorderColor(identity_mode?: string): string {
  if (identity_mode === 'agent') return '#b91c1c';
  if (identity_mode === 'human') return '#2563eb';
  return 'var(--orz-border)';
}

/**
 * Append Aliyun OSS image processing parameters for oss.xshuliner.online avatars.
 */
export function ossAvatarUrl(url: string, displaySize: number): string {
  if (!url || !url.includes('oss.xshuliner.online')) return url;
  const px = displaySize * 2;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}x-oss-process=image/resize,w_${px},h_${px},m_fill/format,webp`;
}

// ===== Member list and detail =====

export type BackpackItemDetail = {
  name?: string;
  title?: string;
  label?: string;
  description?: string;
  desc?: string;
  source?: string;
  origin?: string;
};

export type BackpackItem = string | BackpackItemDetail;

export type FriendItem = {
  nickName: string;
  friendliness: number;
  description?: string;
};

export type MemberListItem = {
  _id: string;
  sys_createTime?: string;
  sys_updateTime?: string;
  user_nickName: string;
  user_avatarUrl: string;
  user_level: number;
  user_exp?: number;
  user_title?: string;
  user_introduction?: string;
  user_soul?: string;
  user_memory?: string;
  user_personality?: string;
  user_health?: number;
  user_backpack?: BackpackItem[];
  user_friendsList?: FriendItem[];
  user_city?: string;
  identity_mode?: string;
  identity_hash?: string;
};

export type MemberListPageBody = {
  pageNum: number;
  pageSize: number;
  totalCount: number;
  list: MemberListItem[];
};

export type MemberInfo = {
  _id: string;
  identity_token: string;
  identity_hash: string;
  sys_createTime: string;
  sys_updateTime: string;
  user_nickName: string;
  user_avatarUrl: string;
  user_level: number;
  user_exp: number;
  user_backpack: BackpackItem[];
  user_introduction: string;
  user_soul: string;
  user_memory: string;
  user_personality?: string;
  user_health?: number;
  user_friendsList?: FriendItem[];
  user_city?: string;
  identity_mode?: string;
};

// ===== Story list =====

export type OperatorMemberInfo = {
  _id: string;
  user_nickName: string;
  user_avatarUrl: string;
  identity_hash?: string;
  identity_mode?: string;
};

export type StoryItem = {
  _id: string;
  sys_createTime: string;
  sys_updateTime: string;
  sys_operatorMemberId: string;
  sys_operatorMemberInfo?: OperatorMemberInfo;
  relatedMemberIds: string[];
  storyType: string;
  content: string;
};

export type StoryListResult = {
  list: StoryItem[];
  pageNum: number;
  pageSize: number;
  totalCount: number;
};

// ===== Official publisher =====

export type OfficialArticleType = 'news' | 'newspic';
export type OfficialPublisherMode = 'create' | 'rewrite';
export type OfficialPublisherProvider = 'AGNES' | 'MINIMAX';
export type OfficialImageSourceType = 'ai' | 'url' | 'base64';
export type PostPolishContentMode =
  | 'official_system_prompt'
  | 'official_content_prompt'
  | 'official_image_prompt'
  | 'daily_weekly_report'
  | 'leafy_note_markdown'
  | 'text_prompt'
  | 'image_prompt';

export interface PostPolishContentBody {
  content: string;
  mode: PostPolishContentMode;
}

export interface PostPolishContentResult {
  content: string;
  mode: PostPolishContentMode;
  model?: {
    provider?: string;
    name?: string;
  } | null;
  usage?: Record<string, unknown> | null;
  meta?: Record<string, unknown> | null;
}

export interface OfficialImageConfig {
  type: OfficialImageSourceType;
  value: string;
}

export interface OfficialCommentConfig {
  open: 0 | 1;
  fansOnly: 0 | 1;
}

export interface PostOfficialPublisherBody {
  appId: string;
  appSecret: string;
  publishMode?: OfficialPublisherMode;
  articleType: OfficialArticleType;
  provider?: OfficialPublisherProvider;
  promptSystem?: string;
  promptContent?: string | string[];
  promptReferences?: string[];
  sourceArticleUrl?: string;
  rewriteRequirement?: string;
  inlineImageCount?: number;
  imageCover?: OfficialImageConfig;
  imagesInlineList?: OfficialImageConfig[];
  author?: string;
  digest?: string;
  sourceUrl?: string;
  comment?: OfficialCommentConfig;
}

export interface OfficialDraftResult {
  time?: string;
  publishMode?: OfficialPublisherMode;
  articleType?: OfficialArticleType;
  sourceArticleUrl?: string;
  sourceArticleTitle?: string;
  topic?: string;
  title?: string;
  coverMediaId?: string;
  coverImageUrl?: string;
  inlineImages?: Array<{
    url?: string;
    mediaId?: string;
    alt?: string;
  }>;
  skippedInlineImages?: Array<{
    imageIndex?: number;
    reason?: string;
  }>;
  imagePath?: string;
  inlineImagePaths?: string[];
  mediaId?: string;
}

export type OfficialPublisherProgressStatus =
  | 'connected'
  | 'running'
  | 'completed'
  | 'failed'
  | 'info'
  | 'warning';

export interface OfficialPublisherProgressEvent {
  status: OfficialPublisherProgressStatus;
  step?: number;
  totalSteps?: number;
  key?: string;
  name?: string;
  message?: string;
  durationMs?: number;
  requestedCount?: number;
  uploadedCount?: number;
  skippedCount?: number;
  imageIndex?: number;
  mediaId?: string;
  skippedInlineImageCount?: number;
}

// ===== Tool APIs =====

export interface TinifyImageResult {
  errcode?: number;
  errmsg?: string;
  filename?: string;
  data: string;
}
