import type { HTMLAttributes, ReactNode } from 'react';

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
      className={['section-heading', 'relative', className]
        .filter(Boolean)
        .join(' ')}
    >
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </header>
  );
}
