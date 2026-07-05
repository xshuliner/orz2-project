import type { ReportType } from '@/pages/Tools/ToolWorkReportPolisher/config';

export function buildPolishContent({
  referenceContent,
  reportType,
  source,
}: {
  referenceContent: string;
  reportType: ReportType;
  source: string;
}) {
  const reportTypeLabel = reportType === 'weekly' ? '周报' : '日报';
  const blocks = [
    `汇报类型：${reportTypeLabel}`,
    [
      '润色要求：',
      '请只润色「原始记录」里的内容。',
      '如果提供了「参考示例」，只参考它的结构、语气、详略和表达方式，不复制参考示例中的具体事实。',
      '最终只输出润色后的汇报正文。',
    ].join('\n'),
    `原始记录：\n${source.trim()}`,
  ];

  const reference = referenceContent.trim();
  if (reference) {
    blocks.push(`参考示例：\n${reference}`);
  }

  return blocks.join('\n\n');
}
