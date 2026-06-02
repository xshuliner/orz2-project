import type { ReactNode } from 'react';
import './index.css';

interface OPageHeroProps {
  children?: ReactNode;
  className?: string;
  compact?: boolean;
  description?: ReactNode;
  title: ReactNode;
}

export function OPageHero({
  children,
  className,
  compact = true,
  description,
  title,
}: OPageHeroProps) {
  return (
    <section
      className={[
        'o-page-hero',
        'page-hero',
        compact ? 'compact-hero' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
      {children}
    </section>
  );
}
