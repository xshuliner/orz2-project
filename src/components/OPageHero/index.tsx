import type { ReactNode } from 'react';

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
    <header
      className={[
        'page-hero',
        'relative [&_p]:max-w-[760px]',
        compact ? 'compact-hero' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
      {children}
    </header>
  );
}
