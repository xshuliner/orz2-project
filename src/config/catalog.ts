import type { CatalogStage, CatalogStageMeta } from '@/types/catalog';

export const catalogStages = {
  LIVE: {
    tone: 'live',
  },
  BETA: {
    tone: 'beta',
  },
  PLANNING: {
    tone: 'planning',
  },
} satisfies Record<CatalogStage, CatalogStageMeta>;
