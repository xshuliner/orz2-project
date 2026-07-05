import type { CatalogStage, CatalogStageMeta } from '@/types/catalog';

export const catalogStages = {
  LIVE: {
    label: '已上线',
    description: '已对外开放，可直接体验。',
    tone: 'live',
  },
  BETA: {
    label: '内测中',
    description: '正在内测，部分能力可能调整。',
    tone: 'beta',
  },
  PLANNING: {
    label: '规划中',
    description: '尚未开放，正在设计或开发。',
    tone: 'planning',
  },
} satisfies Record<CatalogStage, CatalogStageMeta>;
