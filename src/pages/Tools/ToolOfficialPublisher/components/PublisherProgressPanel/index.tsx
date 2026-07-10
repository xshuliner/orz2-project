import { OCard } from '@/components/OCard';
import type {
  PublisherCopy,
  PublishPhase,
  PublishStep,
} from '@/pages/Tools/ToolOfficialPublisher/types';
import { formatDuration } from '@/pages/Tools/ToolOfficialPublisher/utils/progress';
import {
  CheckCircle2,
  Circle,
  Clock3,
  Loader2,
  TriangleAlert,
  Workflow,
} from 'lucide-react';

export function PublisherProgressPanel({
  copy,
  elapsedMs,
  phase,
  steps,
}: {
  copy: PublisherCopy;
  elapsedMs: number;
  phase: Exclude<PublishPhase, 'idle'>;
  steps: PublishStep[];
}) {
  const completedCount = steps.filter(
    step => step.status === 'completed'
  ).length;
  const activeStep = steps.find(
    step => step.status === 'running' || step.status === 'warning'
  );
  const progress =
    phase === 'completed'
      ? 100
      : Math.round(
          ((completedCount + (activeStep ? 0.46 : 0)) / steps.length) * 100
        );
  const phaseLabel = copy.progress.phases[phase];

  return (
    <OCard
      as='section'
      className={`publish-progress-card is-${phase}`}
      aria-label={copy.progress.ariaLabel}
      padding='md'
      tone='brand'
    >
      <div className='publish-progress-head'>
        <div className='summary-heading'>
          <Workflow size={18} aria-hidden='true' />
          <h2>{copy.progress.title}</h2>
        </div>
        <span className='publish-live-chip'>
          <i aria-hidden='true' />
          {phaseLabel}
        </span>
      </div>
      <div className='publish-progress-meter' aria-hidden='true'>
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className='publish-progress-meta'>
        <span>
          {completedCount}/{steps.length} {copy.progress.completedSuffix}
        </span>
        <span>
          <Clock3 size={13} aria-hidden='true' />
          {formatDuration(elapsedMs)}
        </span>
      </div>
      <ol className='publish-timeline'>
        {steps.map(step => (
          <li
            className={`publish-timeline-step is-${step.status}`}
            key={step.key}
          >
            <span className='publish-step-marker'>
              {step.status === 'completed' ? (
                <CheckCircle2 size={17} aria-hidden='true' />
              ) : step.status === 'failed' || step.status === 'warning' ? (
                <TriangleAlert size={16} aria-hidden='true' />
              ) : step.status === 'running' ? (
                <Loader2 className='spin' size={16} aria-hidden='true' />
              ) : (
                <Circle size={14} aria-hidden='true' />
              )}
            </span>
            <div className='publish-step-body'>
              <strong>
                <em>{String(step.index).padStart(2, '0')}</em>
                {step.name}
              </strong>
              <p>
                {step.message ||
                  (step.status === 'pending'
                    ? copy.progress.pending
                    : step.status === 'completed'
                      ? copy.progress.completed
                      : copy.progress.running)}
              </p>
            </div>
            {step.durationMs !== undefined ? (
              <small>{formatDuration(step.durationMs)}</small>
            ) : null}
          </li>
        ))}
      </ol>
    </OCard>
  );
}
