import type { HTMLAttributes, ReactNode } from 'react';

interface OEmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function OEmptyState({
  children,
  className,
  ...props
}: OEmptyStateProps) {
  return (
    <div
      {...props}
      className={[
        'empty-state',
        'rounded-[var(--radius-card)] bg-[var(--surface-soft)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
