import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './index.css';

export type OIconButtonVariant = 'default' | 'ghost';
export type OIconButtonSize = 'sm' | 'md' | 'lg';

interface OIconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label'
> {
  'aria-label': string;
  children: ReactNode;
  size?: OIconButtonSize;
  variant?: OIconButtonVariant;
}

export function OIconButton({
  children,
  className,
  size = 'md',
  type = 'button',
  variant = 'default',
  ...props
}: OIconButtonProps) {
  return (
    <button
      {...props}
      className={[
        'o-icon-button',
        'icon-button',
        'interactive',
        `o-icon-button--${variant}`,
        `o-icon-button--${size}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      type={type}
    >
      {children}
    </button>
  );
}
