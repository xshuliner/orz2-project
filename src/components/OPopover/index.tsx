import { Popover as PopoverPrimitive } from 'radix-ui';
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

export type OPopoverSide = 'top' | 'right' | 'bottom' | 'left';
export type OPopoverAlign = 'start' | 'center' | 'end';

interface OPopoverProps {
  align?: OPopoverAlign;
  ariaLabel?: string;
  children: ReactElement;
  content: ReactNode;
  contentClassName?: string;
  hoverCloseDelay?: number;
  side?: OPopoverSide;
  sideOffset?: number;
}

type OpenMode = 'click' | 'hover' | null;

/**
 * A shadcn/Radix popover with deliberate desktop hover and touch/click modes.
 * Hover opens are transient; click opens stay open until Radix dismisses them.
 */
export function OPopover({
  align = 'center',
  ariaLabel,
  children,
  content,
  contentClassName,
  hoverCloseDelay = 100,
  side = 'bottom',
  sideOffset = 8,
}: OPopoverProps) {
  const [openMode, setOpenMode] = useState<OpenMode>(null);
  const closeTimerRef = useRef<number | null>(null);
  const isOpen = openMode !== null;

  function clearCloseTimer() {
    if (closeTimerRef.current === null) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }

  function openFromHover() {
    clearCloseTimer();
    setOpenMode(current => current ?? 'hover');
  }

  function closeHoverPopover() {
    if (openMode !== 'hover') return;
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpenMode(current => (current === 'hover' ? null : current));
      closeTimerRef.current = null;
    }, hoverCloseDelay);
  }

  function toggleClickPopover(event: MouseEvent<HTMLElement>) {
    // Keep Radix's default trigger toggle from turning a hovered popover off
    // before it can be promoted to the persistent click-open state.
    event.preventDefault();
    clearCloseTimer();
    setOpenMode(current => (current === 'click' ? null : 'click'));
  }

  useEffect(() => () => clearCloseTimer(), []);

  return (
    <PopoverPrimitive.Root
      modal={false}
      open={isOpen}
      onOpenChange={nextOpen => {
        if (!nextOpen) setOpenMode(null);
      }}
    >
      <PopoverPrimitive.Trigger
        asChild
        onClick={toggleClickPopover}
        onPointerEnter={openFromHover}
        onPointerLeave={closeHoverPopover}
      >
        {children}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          aria-label={ariaLabel}
          className={['z-[var(--z-popover)] outline-none', contentClassName]
            .filter(Boolean)
            .join(' ')}
          side={side}
          align={align}
          sideOffset={sideOffset}
          collisionPadding={12}
          onOpenAutoFocus={event => event.preventDefault()}
          onPointerEnter={clearCloseTimer}
          onPointerLeave={closeHoverPopover}
        >
          {content}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
