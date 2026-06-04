import type { CatalogStage } from '@/types';

/**
 * CatalogStage 仅以大写英文枚举存于 JSON（避免 i18n 漂移和拼写差异）。
 * 渲染时一律通过本字典查 label / tone，UI 不直接使用枚举原文。
 */
export interface CatalogStageMeta {
  /** 渲染给用户看的中文标签 */
  label: string;
  /** 描述性短语，可用于 tooltip 等辅助场景 */
  description: string;
  /** 用于 CSS 的 tone 标识，配合 `.catalog-card-stage--{tone}` */
  tone: 'live' | 'beta' | 'planning';
}

export const catalogStages: Record<CatalogStage, CatalogStageMeta> = {
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
};

/** 取渲染文本的便捷访问方法 */
export function getStageLabel(stage: CatalogStage): string {
  return catalogStages[stage].label;
}

/** 取 tone class 的便捷访问方法（OCardCatalog 直接消费） */
export function getStageToneClass(stage: CatalogStage): string {
  return `catalog-card-stage--${catalogStages[stage].tone}`;
}
