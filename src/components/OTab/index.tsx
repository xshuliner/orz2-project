import './index.css';

export interface OTabOption {
  label: string;
  value: string;
}

interface OTabProps {
  ariaLabel: string;
  className?: string;
  onChange: (value: string) => void;
  options: OTabOption[];
  value: string;
}

export function OTab({
  ariaLabel,
  className,
  onChange,
  options,
  value,
}: OTabProps) {
  return (
    <div
      className={['o-tab', className].filter(Boolean).join(' ')}
      role='tablist'
      aria-label={ariaLabel}
    >
      {options.map(option => (
        <button
          key={option.value}
          className={
            option.value === value ? 'active interactive' : 'interactive'
          }
          type='button'
          role='tab'
          aria-selected={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
