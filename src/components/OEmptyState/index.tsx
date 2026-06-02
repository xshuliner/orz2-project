import type { HTMLAttributes, ReactNode } from 'react';
import './index.css';

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
      className={['o-empty-state', 'empty-state', className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
