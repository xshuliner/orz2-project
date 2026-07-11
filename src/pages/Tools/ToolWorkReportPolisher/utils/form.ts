import {
  type CachedReportPolishForm,
  type ReportType,
} from '@/pages/Tools/ToolWorkReportPolisher/config';
import CacheManager, { cacheKeys } from '@/utils/CacheManager';

export function normalizeReportType(value: unknown): ReportType {
  return value === 'weekly' ? 'weekly' : 'daily';
}

export function getInitialReportPolishForm(): Required<CachedReportPolishForm> {
  const cached = CacheManager.getLocalStorage<CachedReportPolishForm>(
    cacheKeys.workReportPolisherForm
  );

  return {
    referenceContent:
      typeof cached?.referenceContent === 'string'
        ? cached.referenceContent
        : '',
    reportType: normalizeReportType(cached?.reportType),
    source: typeof cached?.source === 'string' ? cached.source : '',
  };
}

export function persistReportPolishForm(form: CachedReportPolishForm) {
  CacheManager.setLocalStorage(cacheKeys.workReportPolisherForm, form);
}
