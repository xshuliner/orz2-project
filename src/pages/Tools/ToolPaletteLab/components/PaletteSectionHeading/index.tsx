import type { LucideIcon } from 'lucide-react';

interface PaletteSectionHeadingProps {
  description: string;
  icon: LucideIcon;
  title: string;
}

export function PaletteSectionHeading({
  description,
  icon: Icon,
  title,
}: PaletteSectionHeadingProps) {
  return (
    <header className='palette-section-heading'>
      <span className='palette-section-heading__icon' aria-hidden='true'>
        <Icon size={19} strokeWidth={1.9} />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </header>
  );
}
