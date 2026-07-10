import { OCard } from '@/components/OCard';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface PublisherModuleCardProps {
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  description: ReactNode;
  headingExtra?: ReactNode;
  icon: LucideIcon;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  title: ReactNode;
  titleId?: string;
  tone?: 'default' | 'soft' | 'brand' | 'warm' | 'danger';
}

/** Shared card frame for the publisher workflow's top-level modules. */
export function PublisherModuleCard({
  action,
  children,
  className = '',
  description,
  headingExtra,
  icon: Icon,
  padding = 'md',
  title,
  titleId,
  tone = 'default',
}: PublisherModuleCardProps) {
  return (
    <OCard
      as='section'
      aria-labelledby={titleId}
      className={`form-panel publisher-module-card ${className}`.trim()}
      padding={padding}
      tone={tone}
    >
      <div className='form-panel-heading publisher-module-heading'>
        <span className='panel-icon publisher-module-icon' aria-hidden='true'>
          <Icon size={19} />
        </span>
        <div className='form-panel-heading-main'>
          <div className='publisher-module-title'>
            <h2 id={titleId}>{title}</h2>
            {headingExtra}
          </div>
          <p>{description}</p>
        </div>
      </div>
      {children ? <div className='form-panel-content'>{children}</div> : null}
      {action ? <div className='publisher-module-action'>{action}</div> : null}
    </OCard>
  );
}
