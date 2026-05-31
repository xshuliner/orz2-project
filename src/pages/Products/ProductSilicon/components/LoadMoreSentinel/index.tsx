import type { CSSProperties } from 'react';

type LoadMoreSentinelProps = {
  as?: 'div' | 'li';
  onVisible: () => void;
  disabled: boolean;
  className?: string;
  style?: CSSProperties;
  rootMargin?: string;
  threshold?: number;
};

import { useEffect, useRef } from 'react';

export function LoadMoreSentinel({
  as = 'div',
  onVisible,
  disabled,
  className,
  style,
  rootMargin = '120px',
  threshold = 0.1,
}: LoadMoreSentinelProps) {
  const elementRef = useRef<HTMLDivElement | HTMLLIElement | null>(null);
  const firedRef = useRef(false);
  const onVisibleRef = useRef(onVisible);
  const prevDisabledRef = useRef(disabled);
  onVisibleRef.current = onVisible;

  useEffect(() => {
    if (prevDisabledRef.current && !disabled) {
      firedRef.current = false;
    }
    prevDisabledRef.current = disabled;
  }, [disabled]);

  useEffect(() => {
    if (disabled) return;
    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (!entry?.isIntersecting || firedRef.current) return;
        firedRef.current = true;
        onVisibleRef.current();
      },
      { rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [disabled, rootMargin, threshold]);

  const Component = as;

  return (
    <Component ref={elementRef as never} className={className} style={style} />
  );
}
