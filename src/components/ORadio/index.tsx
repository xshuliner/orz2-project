import type { LucideIcon } from 'lucide-react';
import { useId, type CSSProperties, type KeyboardEvent } from 'react';
import './index.css';

export interface ORadioOption<TValue extends string> {
  value: TValue;
  label: string;
  ariaLabel?: string;
  description?: string;
  icon?: LucideIcon;
}

interface ORadioProps<TValue extends string> {
  ariaLabel: string;
  className?: string;
  options: readonly ORadioOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
}

export function ORadio<TValue extends string>({
  ariaLabel,
  className,
  options,
  value,
  onChange,
}: ORadioProps<TValue>) {
  const radioId = useId();
  const selectedIndex = Math.max(
    options.findIndex(option => option.value === value),
    0
  );

  function moveSelection(direction: 1 | -1) {
    const nextIndex =
      (selectedIndex + direction + options.length) % options.length;
    onChange(options[nextIndex].value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      moveSelection(1);
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveSelection(-1);
    }
  }

  return (
    <div
      className={['o-radio', className].filter(Boolean).join(' ')}
      role='radiogroup'
      aria-label={ariaLabel}
      style={
        {
          '--o-radio-count': options.length,
          '--o-radio-index': selectedIndex,
        } as CSSProperties
      }
      onKeyDown={handleKeyDown}
    >
      <span className='o-radio-thumb' aria-hidden='true' />
      {options.map((option, index) => {
        const Icon = option.icon;
        const isSelected = option.value === value;

        return (
          <button
            id={`${radioId}-${option.value}`}
            key={option.value}
            className={['o-radio-option', isSelected ? 'is-selected' : null]
              .filter(Boolean)
              .join(' ')}
            type='button'
            role='radio'
            aria-label={option.ariaLabel}
            aria-checked={isSelected}
            tabIndex={index === selectedIndex ? 0 : -1}
            onClick={() => onChange(option.value)}
          >
            {Icon ? (
              <span className='o-radio-icon' aria-hidden='true'>
                <Icon size={16} />
              </span>
            ) : null}
            <span className='o-radio-copy'>
              <span>{option.label}</span>
              {option.description ? <small>{option.description}</small> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
