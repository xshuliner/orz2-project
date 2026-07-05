import { OCardCatalog } from '@/components/OCardCatalog';
import type { CatalogItem } from '@/types/catalog';
import type { CatalogRecentKind } from '@/utils/catalogRecentUsage';
import { Clock3 } from 'lucide-react';
import './index.css';

interface SectionCatalogRecentCopy {
  description: string;
  title: string;
}

interface SectionCatalogRecentProps {
  catalogType: CatalogRecentKind;
  copy: SectionCatalogRecentCopy;
  items: CatalogItem[];
}

export function SectionCatalogRecent({
  catalogType,
  copy,
  items,
}: SectionCatalogRecentProps) {
  if (!items.length) return null;

  return (
    <section className='catalog-recent' aria-label={copy.title}>
      <div className='catalog-recent-heading reveal-on-scroll'>
        <span className='catalog-recent-icon' aria-hidden='true'>
          <Clock3 size={18} strokeWidth={2} />
        </span>
        <div>
          <h3>{copy.title}</h3>
          <p>{copy.description}</p>
        </div>
      </div>

      <div className='catalog-recent-grid'>
        {items.map(item => (
          <OCardCatalog catalogType={catalogType} item={item} key={item.id} />
        ))}
      </div>
    </section>
  );
}
