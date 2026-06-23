import { useI18n } from '@/i18n';
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import './index.css';

export type OButtonVariant = 'primary' | 'secondary' | 'ghost';
export type OButtonSize = 'sm' | 'md' | 'lg';

type OButtonCommonProps = {
  children: ReactNode;
  className?: string;
  hoverTranslate?: boolean;
  size?: OButtonSize;
  variant?: OButtonVariant;
};

type OButtonNativeProps = OButtonCommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
    to?: never;
  };

type OButtonLinkProps = OButtonCommonProps &
  Omit<LinkProps, 'className' | 'to'> & {
    href?: never;
    to: string;
  };

type OButtonAnchorProps = OButtonCommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    to?: never;
  };

export type OButtonProps =
  | OButtonNativeProps
  | OButtonLinkProps
  | OButtonAnchorProps;

function buttonClassName(
  size: OButtonSize,
  variant: OButtonVariant,
  hoverTranslate: boolean,
  className: string | undefined
) {
  return [
    'o-button',
    `o-button--${size}`,
    !hoverTranslate && 'o-button--no-hover-translate',
    'button',
    variant,
    'interactive',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

export const OButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  OButtonProps
>(function OButton(props, ref) {
  const {
    className,
    hoverTranslate = false,
    size = 'md',
    variant = 'primary',
  } = props;
  const { localizePath } = useI18n();
  const resolvedClassName = buttonClassName(
    size,
    variant,
    hoverTranslate,
    className
  );

  if ('to' in props && props.to) {
    const {
      children: linkChildren,
      className: _className,
      hoverTranslate: _hoverTranslate,
      size: _size,
      to,
      variant: _variant,
      ...linkProps
    } = props;
    return (
      <Link
        {...linkProps}
        ref={ref as Ref<HTMLAnchorElement>}
        className={resolvedClassName}
        to={localizePath(to)}
      >
        {linkChildren}
      </Link>
    );
  }

  if ('href' in props && props.href) {
    const {
      children: anchorChildren,
      className: _className,
      href,
      hoverTranslate: _hoverTranslate,
      size: _size,
      variant: _variant,
      ...anchorProps
    } = props;
    return (
      <a
        {...anchorProps}
        ref={ref as Ref<HTMLAnchorElement>}
        className={resolvedClassName}
        href={href}
      >
        {anchorChildren}
      </a>
    );
  }

  const {
    children: buttonChildren,
    className: _className,
    hoverTranslate: _hoverTranslate,
    size: _size,
    variant: _variant,
    ...buttonProps
  } = props as OButtonNativeProps;
  return (
    <button
      {...buttonProps}
      ref={ref as Ref<HTMLButtonElement>}
      className={resolvedClassName}
    >
      {buttonChildren}
    </button>
  );
});
