import { OButton, type OButtonVariant } from '@/components/OButton';
import { OModal } from '@/components/OModal';
import type { ReactNode } from 'react';
import './index.css';

interface OModalConfirmProps {
  ariaLabel?: string;
  cancelLabel: string;
  children?: ReactNode;
  className?: string;
  closeOnBackdrop?: boolean;
  confirmIcon?: ReactNode;
  confirmLabel: string;
  confirmVariant?: OButtonVariant;
  description?: ReactNode;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: ReactNode;
}

export function OModalConfirm({
  ariaLabel,
  cancelLabel,
  children,
  className,
  closeOnBackdrop = true,
  confirmIcon,
  confirmLabel,
  confirmVariant = 'primary',
  description,
  isOpen,
  onCancel,
  onConfirm,
  title,
}: OModalConfirmProps) {
  return (
    <OModal
      ariaLabel={ariaLabel}
      className={['o-modal-confirm', className].filter(Boolean).join(' ')}
      closeOnBackdrop={closeOnBackdrop}
      isOpen={isOpen}
      onClose={onCancel}
    >
      {children ?? (
        <div className='o-modal-confirm-copy'>
          {title ? <h2>{title}</h2> : null}
          {description ? <p>{description}</p> : null}
        </div>
      )}
      <div className='o-modal-confirm-actions'>
        <OButton type='button' variant='ghost' onClick={onCancel}>
          {cancelLabel}
        </OButton>
        <OButton type='button' variant={confirmVariant} onClick={onConfirm}>
          {confirmIcon}
          {confirmLabel}
        </OButton>
      </div>
    </OModal>
  );
}
