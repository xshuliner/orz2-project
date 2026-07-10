import {
  Check,
  ChevronDown,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
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
  /**
   * Controls where the menu opens relative to the trigger.
   * `auto` flips between `bottom` and `top` based on viewport space.
   */
  placement?: OSelectorPlacement;
}

interface MenuGeometry {
  placement: 'bottom' | 'top';
  top: number;
  left: number;
  width: number;
  maxHeight: number;
}

const MENU_GAP = 8;
const VIEWPORT_PADDING = 8;

function renderIcon(Icon: LucideIcon | undefined, props: LucideProps) {
  return Icon ? <Icon {...props} /> : null;
}

function computeGeometry(
  triggerRect: DOMRect,
  placement: OSelectorPlacement,
  menuHeight: number
): MenuGeometry {
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const spaceBelow = viewportHeight - triggerRect.bottom - VIEWPORT_PADDING;
  const spaceAbove = triggerRect.top - VIEWPORT_PADDING;

  let resolved: 'bottom' | 'top';
  if (placement === 'top') {
    resolved = 'top';
  } else if (placement === 'bottom') {
    resolved = 'bottom';
  } else {
    if (spaceBelow >= menuHeight) {
      resolved = 'bottom';
    } else if (spaceAbove >= menuHeight) {
      resolved = 'top';
    } else {
      resolved = spaceBelow >= spaceAbove ? 'bottom' : 'top';
    }
  }

  const desiredWidth = triggerRect.width;
  const maxLeft = viewportWidth - desiredWidth - VIEWPORT_PADDING;
  const left = Math.max(VIEWPORT_PADDING, Math.min(triggerRect.left, maxLeft));

  if (resolved === 'bottom') {
    const available = Math.max(spaceBelow - MENU_GAP, 120);
    return {
      placement: 'bottom',
      top: triggerRect.bottom + MENU_GAP,
      left,
      width: desiredWidth,
      maxHeight: available,
    };
  }

  const top = triggerRect.top - MENU_GAP;
  const available = Math.max(spaceAbove - MENU_GAP, 120);
  return {
    placement: 'top',
    top,
    left,
    width: desiredWidth,
    maxHeight: available,
  };
}

export function OSelector<TValue extends string>({
  ariaLabel,
  className,
  options,
  value,
  onChange,
  renderValue,
  placement = 'bottom',
}: OSelectorProps<TValue>) {
  const selectorId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [geometry, setGeometry] = useState<MenuGeometry | null>(null);
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

  const updateGeometry = useCallback(() => {
    if (!isOpen) return;
    const trigger = buttonRef.current;
    const menu = menuRef.current;
    if (!trigger) return;
    const triggerRect = trigger.getBoundingClientRect();
    const menuRect = menu?.getBoundingClientRect();
    const measuredHeight = menuRect?.height ?? 240;
    setGeometry(computeGeometry(triggerRect, placement, measuredHeight));
  }, [isOpen, placement]);

  useLayoutEffect(() => {
    if (!isOpen) {
      setGeometry(null);
      return;
    }
    updateGeometry();
  }, [isOpen, updateGeometry]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setIsOpen(false);
    }

    function handleScroll() {
      updateGeometry();
    }

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen, updateGeometry]);

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

  const menuStyle: CSSProperties | undefined = geometry
    ? {
        position: 'fixed',
        top: geometry.top,
        left: geometry.left,
        width: geometry.width,
        maxHeight: geometry.maxHeight,
        visibility: 'visible',
      }
    : { visibility: 'hidden' };

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
      {isOpen
        ? createPortal(
            <div
              ref={menuRef}
              id={listboxId}
              className={[
                'o-selector-menu',
                geometry ? `is-placement-${geometry.placement}` : undefined,
              ]
                .filter(Boolean)
                .join(' ')}
              style={menuStyle}
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
                      {option.description ? (
                        <small>{option.description}</small>
                      ) : null}
                    </span>
                    <Check
                      className='o-selector-check'
                      size={16}
                      aria-hidden='true'
                    />
                  </button>
                );
              })}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
