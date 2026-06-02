import type { HTMLAttributes, ReactNode } from 'react';
import './index.css';

interface OSectionHeadingProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
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
    <div
      {...props}
      className={['o-section-heading', 'section-heading', className]
        .filter(Boolean)
        .join(' ')}
    >
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
