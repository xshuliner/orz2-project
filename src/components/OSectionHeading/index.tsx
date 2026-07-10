import type { HTMLAttributes, ReactNode } from 'react';
import './index.css';

interface OSectionHeadingProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'title'
> {
  description?: ReactNode;
  title: ReactNode;
}

export function OSectionHeading({
  className,
  description,
  title,
  ...props
}: OSectionHeadingProps) {
  return (
    <header
      {...props}
      className={['o-section-heading', 'section-heading', className]
        .filter(Boolean)
        .join(' ')}
    >
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </header>
  );
}
