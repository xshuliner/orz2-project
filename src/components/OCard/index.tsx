import { cn } from '@/utils/classNames';
import {
  createElement,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import './index.css';

export type OCardTone = 'default' | 'soft' | 'brand' | 'warm' | 'danger';
export type OCardElement = 'div' | 'article' | 'section' | 'aside';
export type OCardPadding = 'none' | 'sm' | 'md' | 'lg';

interface OCardProps extends HTMLAttributes<HTMLElement> {
  accentBar?: boolean;
  as?: OCardElement;
  children: ReactNode;
  interactive?: boolean;
  padding?: OCardPadding;
  tone?: OCardTone;
}

export const OCard = forwardRef<HTMLElement, OCardProps>(function OCard(
  {
    accentBar = false,
    as = 'div',
    children,
    className,
    interactive = false,
    padding = 'none',
    tone = 'default',
    ...props
  },
  ref
) {
  return createElement(
    as,
    {
      ...props,
      ref,
      className: cn(
        'o-card',
        `o-card--${tone}`,
        `o-card--padding-${padding}`,
        interactive ? 'o-card--interactive interactive' : '',
        accentBar ? 'o-card--accent' : '',
        className
      ),
      'data-o-card-interactive': interactive ? 'true' : undefined,
    },
    children
  );
});
