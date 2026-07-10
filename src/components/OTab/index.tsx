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
      className={['inline-flex flex-wrap items-center gap-1.5', className]
        .filter(Boolean)
        .join(' ')}
      role='tablist'
      aria-label={ariaLabel}
    >
      {options.map(option => (
        <button
          key={option.value}
          className={[
            'interactive min-h-[var(--control-height-sm)] rounded-lg border border-[var(--color-line)] bg-[color:color-mix(in_srgb,var(--color-panel)_88%,transparent)] px-3 text-xs leading-none font-[720] whitespace-nowrap text-[var(--color-text-tab)]',
            'hover:border-[color:color-mix(in_srgb,var(--color-green)_42%,transparent)] hover:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-green)_8%,transparent),transparent),var(--color-green-soft-tab)] hover:text-[var(--color-green-tab)] hover:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-green)_8%,transparent)]',
            option.value === value &&
              'active border-[color:color-mix(in_srgb,var(--color-green)_42%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-green)_8%,transparent),transparent),var(--color-green-soft-tab)] text-[var(--color-green-tab)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-green)_8%,transparent)]',
          ]
            .filter(Boolean)
            .join(' ')}
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
