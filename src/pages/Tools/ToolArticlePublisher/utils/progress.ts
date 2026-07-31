import type {
  PublishStep,
  PublishTimelineStep,
} from '@/pages/Tools/ToolArticlePublisher/types';

export function createInitialPublishSteps(
  timeline: readonly PublishTimelineStep[] = []
): PublishStep[] {
  return timeline.map((step, index) => ({
    key: step.key,
    name: step.name,
    index: index + 1,
    status: 'pending',
  }));
}

export function formatDuration(durationMs: number) {
  if (durationMs < 1000) return `${durationMs}ms`;
  return `${(durationMs / 1000).toFixed(durationMs < 10000 ? 1 : 0)}s`;
}
