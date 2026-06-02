import {
  useEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { createPortal } from 'react-dom';
import './index.css';

interface OModalProps extends HTMLAttributes<HTMLDivElement> {
  ariaLabel?: string;
  children: ReactNode;
  closeOnBackdrop?: boolean;
  isOpen: boolean;
  onClose: () => void;
  overlayClassName?: string;
  panelRef?: Ref<HTMLDivElement>;
  titleId?: string;
}

export function OModal({
  ariaLabel,
  children,
  className,
  closeOnBackdrop = true,
  isOpen,
  onClose,
  overlayClassName,
  panelRef,
  titleId,
  ...props
}: OModalProps) {
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousActiveElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      previousActiveElementRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={['o-modal-overlay', overlayClassName]
        .filter(Boolean)
        .join(' ')}
      role='presentation'
      onMouseDown={event => {
        if (closeOnBackdrop && event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        {...props}
        ref={panelRef}
        className={['o-modal-panel', className].filter(Boolean).join(' ')}
        role='dialog'
        aria-label={ariaLabel}
        aria-labelledby={titleId}
        aria-modal='true'
        onMouseDown={event => {
          event.stopPropagation();
          props.onMouseDown?.(event);
        }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
