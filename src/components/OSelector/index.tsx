import {
  Check,
  ChevronDown,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';
import { Select as SelectPrimitive } from 'radix-ui';
import { useMemo, useState, type ReactNode } from 'react';
import './index.css';

export interface OSelectorOption<TValue extends string> {
  value: TValue;
  label: string;
  ariaLabel?: string;
  description?: string;
  icon?: LucideIcon;
}

export type OSelectorPlacement = 'bottom' | 'top' | 'auto';

interface OSelectorProps<TValue extends string> {
  ariaLabel: string;
  className?: string;
  options: readonly OSelectorOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  renderValue?: (option: OSelectorOption<TValue>) => ReactNode;
  /** `auto` delegates collision-aware placement to the Radix popper. */
  placement?: OSelectorPlacement;
}

function renderIcon(Icon: LucideIcon | undefined, props: LucideProps) {
  return Icon ? <Icon {...props} /> : null;
}

/** A shadcn/Radix select preserving the ORZ2 trigger and option presentation. */
export function OSelector<TValue extends string>({
  ariaLabel,
  className,
  options,
  value,
  onChange,
  renderValue,
  placement = 'bottom',
}: OSelectorProps<TValue>) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = useMemo(
    () => options.find(option => option.value === value) ?? options[0],
    [options, value]
  );
  const valueContent = selectedOption
    ? (renderValue?.(selectedOption) ?? (
        <>
          {renderIcon(selectedOption.icon, { size: 16, 'aria-hidden': 'true' })}
          <span>{selectedOption.label}</span>
        </>
      ))
    : null;
  const side = placement === 'auto' ? 'bottom' : placement;

  return (
    <div
      className={['o-selector', isOpen ? 'is-open' : undefined, className]
        .filter(Boolean)
        .join(' ')}
    >
      <SelectPrimitive.Root
        value={value}
        onOpenChange={setIsOpen}
        onValueChange={nextValue => onChange(nextValue as TValue)}
      >
        <SelectPrimitive.Trigger
          aria-label={ariaLabel}
          className='o-selector-trigger interactive'
        >
          <span className='o-selector-value'>{valueContent}</span>
          <SelectPrimitive.Icon asChild>
            <ChevronDown
              className='o-selector-chevron'
              size={16}
              aria-hidden='true'
            />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className='o-selector-menu'
            position='popper'
            side={side}
            sideOffset={8}
            collisionPadding={8}
          >
            <SelectPrimitive.Viewport>
              {options.map(option => {
                const Icon = option.icon;
                return (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    aria-label={option.ariaLabel}
                    className='o-selector-option'
                  >
                    <span className='o-selector-option-icon' aria-hidden='true'>
                      {Icon ? <Icon size={16} /> : null}
                    </span>
                    <SelectPrimitive.ItemText>
                      <span className='o-selector-option-copy'>
                        <span>{option.label}</span>
                        {option.description ? (
                          <small>{option.description}</small>
                        ) : null}
                      </span>
                    </SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator className='o-selector-check'>
                      <Check size={16} aria-hidden='true' />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                );
              })}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}
