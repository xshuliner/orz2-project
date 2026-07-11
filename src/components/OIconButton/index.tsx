import { cn } from '@/utils/classNames';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type OIconButtonVariant = 'default' | 'ghost';
export type OIconButtonSize = 'sm' | 'md' | 'lg';

interface OIconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label'
> {
  'aria-label': string;
  children: ReactNode;
  hoverTranslate?: boolean;
  size?: OIconButtonSize;
  variant?: OIconButtonVariant;
}

export function OIconButton({
  children,
  className,
  hoverTranslate = true,
  size = 'md',
  type = 'button',
  variant = 'default',
  ...props
}: OIconButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        'rounded-[var(--radius-control)]',
        'icon-button',
        'interactive',
        variant === 'ghost' && 'border-transparent bg-transparent shadow-none',
        {
          sm: 'size-[var(--control-height-sm)]',
          md: 'size-[var(--control-height-md)]',
          lg: 'size-[var(--control-height-lg)]',
        }[size],
        !hoverTranslate &&
          'o-icon-button--no-hover-translate hover:!transform-none',
        className
      )}
      type={type}
    >
      {children}
    </button>
  );
}
