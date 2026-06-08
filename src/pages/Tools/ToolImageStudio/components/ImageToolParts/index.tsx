import { OButton } from '@/components/OButton';
import { OIconButton } from '@/components/OIconButton';
import { Clipboard, ClipboardCheck, Code2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface Base64Copy {
  copied: string;
  copy: string;
  import: string;
  inputLabel: string;
  inputPlaceholder: string;
  outputLabel: string;
  outputPlaceholder: string;
  subtitle: string;
  title: string;
}

interface Base64TransferProps {
  copied: boolean;
  copy: Base64Copy;
  error?: string;
  inputValue: string;
  outputValue: string;
  onCopy: () => void;
  onImport: () => void;
  onInputChange: (value: string) => void;
}

export function ToggleRow({
  checked,
  children,
  label,
  onChange,
}: {
  checked: boolean;
  children?: ReactNode;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className='image-toggle-row interactive'>
      <span className='image-switch' aria-hidden='true'>
        <input
          checked={checked}
          type='checkbox'
          onChange={event => onChange(event.target.checked)}
        />
        <i />
      </span>
      <span>
        <strong>{label}</strong>
        {children ? <small>{children}</small> : null}
      </span>
    </label>
  );
}

export function MetricItem({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className='image-metric-item'>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function Base64Transfer({
  copied,
  copy,
  error,
  inputValue,
  outputValue,
  onCopy,
  onImport,
  onInputChange,
}: Base64TransferProps) {
  return (
    <div className='image-base64-panel'>
      <div className='image-base64-heading'>
        <span aria-hidden='true'>
          <Code2 size={15} />
        </span>
        <div>
          <strong>{copy.title}</strong>
          <small>{copy.subtitle}</small>
        </div>
      </div>

      <label className='image-base64-input'>
        <span>{copy.inputLabel}</span>
        <textarea
          value={inputValue}
          placeholder={copy.inputPlaceholder}
          spellCheck={false}
          onChange={event => onInputChange(event.target.value)}
        />
      </label>

      <div className='image-base64-actions'>
        <OButton size='sm' type='button' variant='secondary' onClick={onImport}>
          <Code2 size={15} aria-hidden='true' />
          {copy.import}
        </OButton>
        {error ? <span role='alert'>{error}</span> : null}
      </div>

      <label className='image-base64-output'>
        <span>{copy.outputLabel}</span>
        <div>
          <input
            readOnly
            value={outputValue}
            placeholder={copy.outputPlaceholder}
            spellCheck={false}
          />
          <OIconButton
            aria-label={copied ? copy.copied : copy.copy}
            disabled={!outputValue}
            size='sm'
            variant='ghost'
            onClick={onCopy}
          >
            {copied ? (
              <ClipboardCheck size={15} aria-hidden='true' />
            ) : (
              <Clipboard size={15} aria-hidden='true' />
            )}
          </OIconButton>
        </div>
      </label>
    </div>
  );
}
