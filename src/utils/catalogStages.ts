import { catalogStages } from '@/config/catalog';
import { defaultLocale, getMessages, type Locale } from '@/i18n';
import type { CatalogStage } from '@/types/catalog';

export function getStageLabel(stage: CatalogStage, locale?: Locale): string {
  return getMessages(locale ?? defaultLocale).catalogStages[stage].label;
}

export function getStageToneClass(stage: CatalogStage): string {
  return `catalog-card-stage--${catalogStages[stage].tone}`;
}
