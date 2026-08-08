import type {
  PublishStep,
  PublishTimelineStep,
} from '@/pages/Tools/ToolArticlePublisher/types';

export function createInitialPublishSteps(
  timeline: readonly PublishTimelineStep[] = []
): PublishStep[] {
  return timeline.map((step, index) => {
    const status =
      step.status === 'completed' ||
      step.status === 'failed' ||
      step.status === 'running' ||
      step.status === 'warning'
        ? step.status
        : step.status === 'retrying'
          ? 'running'
          : 'pending';
    return {
      key: step.key,
      name: step.name,
      index: index + 1,
      status,
      message: step.message,
      durationMs: step.durationMs,
      requestedCount: step.totalImageCount ?? step.requestedCount,
    };
  });
}

export function formatDuration(durationMs: number) {
  if (durationMs < 1000) return `${durationMs}ms`;
  return `${(durationMs / 1000).toFixed(durationMs < 10000 ? 1 : 0)}s`;
}
