import { catalogStages } from '@/config/catalog';
import { getMessages, type Locale } from '@/i18n';
import type { CatalogStage } from '@/types/catalog';

export function getStageLabel(stage: CatalogStage, locale?: Locale): string {
  return locale
    ? getMessages(locale).catalogStages[stage].label
    : catalogStages[stage].label;
}

export function getStageToneClass(stage: CatalogStage): string {
  return `catalog-card-stage--${catalogStages[stage].tone}`;
}
