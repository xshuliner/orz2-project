import type { ReportType } from '@/pages/Tools/ToolWorkReportPolisher/config';

export interface ReportPolishPromptCopy {
  reportTypes: Record<ReportType, string>;
  typeLabel: string;
  instructionsTitle: string;
  instructions: readonly string[];
  sourceTitle: string;
  referenceTitle: string;
}

export function buildPolishContent({
  promptCopy,
  referenceContent,
  reportType,
  source,
}: {
  promptCopy: ReportPolishPromptCopy;
  referenceContent: string;
  reportType: ReportType;
  source: string;
}) {
  const reportTypeLabel = promptCopy.reportTypes[reportType];
  const blocks = [
    `${promptCopy.typeLabel}: ${reportTypeLabel}`,
    [promptCopy.instructionsTitle, ...promptCopy.instructions].join('\n'),
    `${promptCopy.sourceTitle}:\n${source.trim()}`,
  ];

  const reference = referenceContent.trim();
  if (reference) {
    blocks.push(`${promptCopy.referenceTitle}:\n${reference}`);
  }

  return blocks.join('\n\n');
}
