import { publisherStepKeys } from '@/pages/Tools/ToolArticlePublisher/config';
import type { PublishStep } from '@/pages/Tools/ToolArticlePublisher/types';

export function createInitialPublishSteps(
  stepNames: readonly string[]
): PublishStep[] {
  return publisherStepKeys.map((key, index) => ({
    key,
    name: stepNames[index] ?? key,
    index: index + 1,
    status: 'pending',
  }));
}

export function formatDuration(durationMs: number) {
  if (durationMs < 1000) return `${durationMs}ms`;
  return `${(durationMs / 1000).toFixed(durationMs < 10000 ? 1 : 0)}s`;
}
