import {
  type CachedReportPolishForm,
  type ReportType,
} from '@/pages/Tools/ToolWorkReportPolisher/config';
import managerCache, { cacheKeys } from '@/utils/managerCache';

export function normalizeReportType(value: unknown): ReportType {
  return value === 'weekly' ? 'weekly' : 'daily';
}

export function getInitialReportPolishForm(): Required<CachedReportPolishForm> {
  const cached = managerCache.getLocalStorage<CachedReportPolishForm>(
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
  managerCache.setLocalStorage(cacheKeys.workReportPolisherForm, form);
}
