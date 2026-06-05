import {
  Check,
  ChevronDown,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import './index.css';

export interface OSelectorOption<TValue extends string> {
  value: TValue;
  label: string;
  ariaLabel?: string;
  description?: string;
  icon?: LucideIcon;
}

interface OSelectorProps<TValue extends string> {
  ariaLabel: string;
  className?: string;
  options: readonly OSelectorOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  renderValue?: (option: OSelectorOption<TValue>) => ReactNode;
}

function renderIcon(Icon: LucideIcon | undefined, props: LucideProps) {
  return Icon ? <Icon {...props} /> : null;
}

export function OSelector<TValue extends string>({
  ariaLabel,
  className,
  options,
  value,
  onChange,
  renderValue,
}: OSelectorProps<TValue>) {
  const selectorId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const selectedIndex = Math.max(
    options.findIndex(option => option.value === value),
    0
  );
  const selectedOption = options[selectedIndex];
  const listboxId = `${selectorId}-listbox`;
  const activeOptionId = `${selectorId}-option-${highlightedIndex}`;

  useEffect(() => {
    if (!isOpen) return;
    setHighlightedIndex(selectedIndex);
  }, [isOpen, selectedIndex]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  const valueContent = useMemo(() => {
    if (!selectedOption) return null;
    if (renderValue) return renderValue(selectedOption);
    return (
      <>
        {renderIcon(selectedOption.icon, { size: 16, 'aria-hidden': 'true' })}
        <span>{selectedOption.label}</span>
      </>
    );
  }, [renderValue, selectedOption]);

  function selectOption(option: OSelectorOption<TValue>) {
    onChange(option.value);
    setIsOpen(false);
    buttonRef.current?.focus();
  }

  function moveHighlight(direction: 1 | -1) {
    setHighlightedIndex(current => {
      const next = current + direction;
      if (next < 0) return options.length - 1;
      if (next >= options.length) return 0;
      return next;
    });
  }

  function handleButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      moveHighlight(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(open => !open);
    }
  }

  function handleListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      buttonRef.current?.focus();
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveHighlight(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectOption(options[highlightedIndex]);
    }
  }

  return (
    <div
      ref={rootRef}
      className={['o-selector', isOpen ? 'is-open' : undefined, className]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        ref={buttonRef}
        className='o-selector-trigger interactive'
        type='button'
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup='listbox'
        aria-controls={listboxId}
        onClick={() => setIsOpen(open => !open)}
        onKeyDown={handleButtonKeyDown}
      >
        <span className='o-selector-value'>{valueContent}</span>
        <ChevronDown
          className='o-selector-chevron'
          size={16}
          aria-hidden='true'
        />
      </button>
      {isOpen ? (
        <div
          id={listboxId}
          className='o-selector-menu'
          role='listbox'
          tabIndex={-1}
          aria-label={ariaLabel}
          aria-activedescendant={activeOptionId}
          onKeyDown={handleListKeyDown}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <button
                id={`${selectorId}-option-${index}`}
                key={option.value}
                className={[
                  'o-selector-option',
                  isSelected ? 'is-selected' : undefined,
                  index === highlightedIndex ? 'is-highlighted' : undefined,
                ]
                  .filter(Boolean)
                  .join(' ')}
                type='button'
                role='option'
                aria-label={option.ariaLabel}
                aria-selected={isSelected}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => selectOption(option)}
              >
                <span className='o-selector-option-icon' aria-hidden='true'>
                  {renderIcon(option.icon, { size: 16 })}
                </span>
                <span className='o-selector-option-copy'>
                  <span>{option.label}</span>
                  {option.description ? <small>{option.description}</small> : null}
                </span>
                <Check
                  className='o-selector-check'
                  size={16}
                  aria-hidden='true'
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
