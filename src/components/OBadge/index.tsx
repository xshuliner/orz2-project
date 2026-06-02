import type { HTMLAttributes, ReactNode } from 'react';
import './index.css';

export type OBadgeTone = 'neutral' | 'brand' | 'warning' | 'danger';

interface OBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  pill?: boolean;
  tone?: OBadgeTone;
}

export function OBadge({
  children,
  className,
  pill = false,
  tone = 'neutral',
  ...props
}: OBadgeProps) {
  return (
    <span
      {...props}
      className={[
        'o-badge',
        `o-badge--${tone}`,
        pill ? 'o-badge--pill' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
