export type CatalogIconName =
  | 'Braces'
  | 'ClipboardPenLine'
  | 'Gamepad2'
  | 'Globe2'
  | 'ImageDown'
  | 'Palette'
  | 'Send'
  | 'Smartphone'
  | 'Sparkles'
  | 'Workflow';

export type CatalogPlatform = 'web' | 'h5' | 'weapp' | 'app' | 'extension';

export type CatalogStage = 'LIVE' | 'BETA' | 'PLANNING';

export interface CatalogStageMeta {
  tone: 'live' | 'beta' | 'planning';
}

export interface CatalogLifecycle {
  stage: CatalogStage;
  version: string;
  updatedAt: string;
}

export type CatalogMedia =
  | {
      kind: 'image';
      src: string;
      alt?: string;
    }
  | {
      kind: 'icon';
      name: CatalogIconName;
    };

export type CatalogEntry =
  | {
      id: string;
      kind: 'link';
      label: string;
      href: string;
      qrValue?: string;
      primary?: boolean;
    }
  | {
      id: string;
      kind: 'sunCode';
      label: string;
      imageUrl: string;
      primary?: boolean;
    };

export type CatalogBaseEntry =
  | {
      id: string;
      kind: 'link';
      href: string;
      qrValue?: string;
      primary?: boolean;
    }
  | {
      id: string;
      kind: 'sunCode';
      imageUrl: string;
      primary?: boolean;
    };

export interface CatalogSeo {
  slug?: string;
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  schemaType?: 'SoftwareApplication';
}

export interface CatalogBaseSeo {
  slug?: string;
  ogImage?: string;
  schemaType?: 'SoftwareApplication';
}

export interface CatalogBaseItem {
  id: string;
  group: string;
  media: CatalogMedia;
  lifecycle: CatalogLifecycle;
  platform: CatalogPlatform[];
  entries: CatalogBaseEntry[];
  compact?: boolean;
  seo?: CatalogBaseSeo;
}

export interface CatalogItem {
  id: string;
  name: string;
  group: string;
  summary: string;
  media: CatalogMedia;
  badges: string[];
  lifecycle: CatalogLifecycle;
  platform: CatalogPlatform[];
  entries: CatalogEntry[];
  compact?: boolean;
  seo?: CatalogSeo;
}

export interface CatalogGroup {
  name: string;
  description: string;
}
