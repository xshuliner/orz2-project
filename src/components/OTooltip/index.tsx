import {
  Popover as PopoverPrimitive,
  Tooltip as TooltipPrimitive,
} from 'radix-ui';
import { useEffect, useRef, useState, type ReactNode } from 'react';

type OTooltipPlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-start'
  | 'bottom-start'
  | 'top-end'
  | 'bottom-end';

interface OTooltipProps {
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
  closeDelay?: number;
  content: ReactNode;
  contentClassName?: string;
  interactive?: boolean;
  maxWidth?: number;
  offset?: number;
  onTriggerClick?: () => void;
  placement?: OTooltipPlacement;
}

function getPlacement(placement: OTooltipPlacement) {
  const [side, alignment] = placement.split('-') as [
    'top' | 'bottom' | 'left' | 'right',
    'start' | 'end' | undefined,
  ];
  return { align: alignment, side };
}

function triggerClassName(className: string | undefined) {
  return [
    'inline-block cursor-pointer outline-none aria-disabled:cursor-not-allowed',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

function contentStyle(maxWidth: number) {
  return { maxWidth: `min(${maxWidth}px, calc(100vw - 32px))` };
}

/**
 * A shadcn/Radix-backed hint. Interactive content uses a Popover so its tabs
 * and links remain keyboard reachable; ordinary explanatory content is a
 * standard Tooltip.
 */
export function OTooltip({
  ariaLabel,
  children,
  className,
  closeDelay = 120,
  content,
  contentClassName,
  interactive = false,
  maxWidth = 320,
  offset = 10,
  onTriggerClick,
  placement = 'top',
}: OTooltipProps) {
  const { align, side } = getPlacement(placement);
  const [isOpen, setIsOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  function cancelClose() {
    if (closeTimerRef.current === null) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }

  function scheduleClose() {
    cancelClose();
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
      closeTimerRef.current = null;
    }, closeDelay);
  }

  useEffect(() => () => cancelClose(), []);
  const trigger = (
    <span
      className={triggerClassName(className)}
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={onTriggerClick}
      onFocus={() => {
        if (interactive) {
          cancelClose();
          setIsOpen(true);
        }
      }}
      onPointerEnter={() => {
        if (interactive) {
          cancelClose();
          setIsOpen(true);
        }
      }}
      onPointerLeave={() => {
        if (interactive) scheduleClose();
      }}
    >
      {children}
    </span>
  );

  if (interactive) {
    return (
      <PopoverPrimitive.Root
        modal={false}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            aria-label={ariaLabel}
            className={['z-[var(--z-tooltip)] outline-none', contentClassName]
              .filter(Boolean)
              .join(' ')}
            side={side}
            align={align}
            sideOffset={offset}
            style={contentStyle(maxWidth)}
            onOpenAutoFocus={event => event.preventDefault()}
            onPointerEnter={cancelClose}
            onPointerLeave={scheduleClose}
          >
            {content}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  }

  return (
    <TooltipPrimitive.Provider delayDuration={0} skipDelayDuration={0}>
      <TooltipPrimitive.Root delayDuration={0}>
        <TooltipPrimitive.Trigger asChild>{trigger}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            className={['z-[var(--z-tooltip)]', contentClassName]
              .filter(Boolean)
              .join(' ')}
            side={side}
            align={align}
            sideOffset={offset}
            style={contentStyle(maxWidth)}
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
