import type { HTMLAttributes, ReactNode } from 'react';

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
        'o-badge inline-flex min-h-[var(--badge-height)] items-center rounded-[var(--radius-control)] border px-[9px] text-xs font-[720]',
        pill ? 'rounded-full' : '',
        {
          neutral:
            'border-[var(--color-line-soft)] bg-[var(--color-soft)] text-[var(--color-text-status)]',
          brand:
            'border-[color:color-mix(in_srgb,var(--color-green)_20%,transparent)] bg-[var(--color-green-soft)] text-[var(--color-green-label)]',
          warning:
            'border-[color:color-mix(in_srgb,var(--color-gold)_28%,transparent)] bg-[var(--color-warning-soft)] text-[var(--color-warning-text)]',
          danger:
            'border-[color:color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[var(--color-panel-danger)] text-[var(--color-danger)]',
        }[tone],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
