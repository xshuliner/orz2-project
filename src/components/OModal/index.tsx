import { Dialog as DialogPrimitive } from 'radix-ui';
import { type HTMLAttributes, type ReactNode, type Ref } from 'react';
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
  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={['o-modal-overlay', overlayClassName]
            .filter(Boolean)
            .join(' ')}
        />
        <div className='o-modal-positioner'>
          <DialogPrimitive.Content
            {...props}
            ref={panelRef}
            className={['o-modal-panel', className].filter(Boolean).join(' ')}
            aria-label={ariaLabel}
            aria-labelledby={titleId}
            onInteractOutside={event => {
              if (!closeOnBackdrop) event.preventDefault();
            }}
          >
            {children}
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
