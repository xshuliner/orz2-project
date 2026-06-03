import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import './index.css';

type OTooltipPlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-start'
  | 'bottom-start'
  | 'top-end'
  | 'bottom-end';

interface TooltipPosition {
  left: number;
  top: number;
}

interface OTooltipProps {
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
  content: ReactNode;
  contentClassName?: string;
  maxWidth?: number;
  offset?: number;
  placement?: OTooltipPlacement;
}

const viewportPadding = 16;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function calculatePosition({
  maxWidth,
  offset,
  placement,
  tooltipRect,
  triggerRect,
}: {
  maxWidth: number;
  offset: number;
  placement: OTooltipPlacement;
  tooltipRect: DOMRect;
  triggerRect: DOMRect;
}): TooltipPosition {
  const width = Math.min(tooltipRect.width || maxWidth, window.innerWidth - 32);
  const height = tooltipRect.height || 0;
  const align = placement.split('-')[1];
  const side = placement.split('-')[0];
  let left = triggerRect.left + triggerRect.width / 2 - width / 2;
  let top = triggerRect.top - height - offset;

  if (side === 'bottom') {
    top = triggerRect.bottom + offset;
  }

  if (side === 'left') {
    left = triggerRect.left - width - offset;
    top = triggerRect.top + triggerRect.height / 2 - height / 2;
  }

  if (side === 'right') {
    left = triggerRect.right + offset;
    top = triggerRect.top + triggerRect.height / 2 - height / 2;
  }

  if (align === 'start') {
    left = triggerRect.left;
  }

  if (align === 'end') {
    left = triggerRect.right - width;
  }

  return {
    left: clamp(
      left,
      viewportPadding,
      window.innerWidth - width - viewportPadding
    ),
    top: clamp(
      top,
      viewportPadding,
      Math.max(viewportPadding, window.innerHeight - height - viewportPadding)
    ),
  };
}

export function OTooltip({
  ariaLabel,
  children,
  className,
  content,
  contentClassName,
  maxWidth = 320,
  offset = 10,
  placement = 'top',
}: OTooltipProps) {
  const tooltipId = useId();
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<TooltipPosition | null>(null);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;
    if (!trigger || !tooltip) return;

    setPosition(
      calculatePosition({
        maxWidth,
        offset,
        placement,
        tooltipRect: tooltip.getBoundingClientRect(),
        triggerRect: trigger.getBoundingClientRect(),
      })
    );
  }, [maxWidth, offset, placement]);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    updatePosition();
    const frame = window.requestAnimationFrame(updatePosition);
    return () => window.cancelAnimationFrame(frame);
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    const tooltip = tooltipRef.current;
    if (!open || !tooltip || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => updatePosition());
    observer.observe(tooltip);
    return () => observer.disconnect();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  function handleBlur(event: FocusEvent<HTMLSpanElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setOpen(false);
    }
  }

  const tooltipStyle: CSSProperties = {
    left: position?.left ?? -9999,
    maxWidth: `min(${maxWidth}px, calc(100vw - 32px))`,
    top: position?.top ?? -9999,
  };

  return (
    <span
      ref={triggerRef}
      className={['o-tooltip-trigger', className].filter(Boolean).join(' ')}
      tabIndex={0}
      aria-describedby={open ? tooltipId : undefined}
      aria-label={ariaLabel}
      onBlur={handleBlur}
      onClick={() => setOpen(true)}
      onFocus={() => setOpen(true)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onMouseMove={() => setOpen(true)}
    >
      {children}
      {open
        ? createPortal(
            <div
              ref={tooltipRef}
              id={tooltipId}
              className={['o-tooltip', contentClassName]
                .filter(Boolean)
                .join(' ')}
              role='tooltip'
              style={tooltipStyle}
            >
              {content}
            </div>,
            document.body
          )
        : null}
    </span>
  );
}
