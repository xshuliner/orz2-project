import type { LucideIcon } from 'lucide-react';
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import { type CSSProperties } from 'react';
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
  const selectedIndex = Math.max(
    options.findIndex(option => option.value === value),
    0
  );

  return (
    <RadioGroupPrimitive.Root
      className={['o-radio', className].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
      value={value}
      onValueChange={nextValue => onChange(nextValue as TValue)}
      style={
        {
          '--o-radio-count': options.length,
          '--o-radio-index': selectedIndex,
        } as CSSProperties
      }
    >
      <span className='o-radio-thumb' aria-hidden='true' />
      {options.map(option => {
        const Icon = option.icon;
        const isSelected = option.value === value;

        return (
          <RadioGroupPrimitive.Item
            key={option.value}
            value={option.value}
            className={['o-radio-option', isSelected ? 'is-selected' : null]
              .filter(Boolean)
              .join(' ')}
            aria-label={option.ariaLabel}
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
          </RadioGroupPrimitive.Item>
        );
      })}
    </RadioGroupPrimitive.Root>
  );
}
