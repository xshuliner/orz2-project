export type ReportType = 'daily' | 'weekly';

export type CachedReportPolishForm = {
  referenceContent?: string;
  reportType?: ReportType;
  source?: string;
};

export const reportPolisherToolId = 'tool-work-report-polisher';
export const reportPolisherSeoKey = 'work-report-polisher';
export const reportPolisherPolishMode = 'daily_weekly_report';
