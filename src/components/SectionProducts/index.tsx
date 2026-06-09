import { OButton } from '@/components/OButton';
import { OCardCatalog } from '@/components/OCardCatalog';
import { OEmptyState } from '@/components/OEmptyState';
import { OSectionHeading } from '@/components/OSectionHeading';
import { OTab } from '@/components/OTab';
import { SectionCatalogRecent } from '@/components/SectionCatalogRecent';
import { getStageLabel } from '@/config/catalog-stages';
import { useCatalogRecentItems } from '@/hooks/useCatalogRecentUsage';
import { useI18n } from '@/i18n';
import { getProductGroups, getProducts } from '@/i18n/catalog';
import { mergeCatalogItemsWithRecent } from '@/utils/catalogRecentUsage';
import { Search } from 'lucide-react';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import './index.css';

interface SectionProductsProps {
  compact?: boolean;
  subtitle?: string;
  title?: string;
}

export function SectionProducts({
  compact = false,
  subtitle,
  title,
}: SectionProductsProps) {
  const { locale, messages } = useI18n();
  const sectionCopy = messages.homeSections.products;
  const products = useMemo(() => getProducts(locale), [locale]);
  const recentProducts = useCatalogRecentItems('product', products, 3);
  const productGroups = useMemo(() => getProductGroups(locale), [locale]);
  const [searchParams, setSearchParams] = useSearchParams();
  const showFilters = !compact;
  const query = showFilters ? (searchParams.get('q') ?? '') : '';
  const category = showFilters
    ? (searchParams.get('category') ?? messages.common.all)
    : messages.common.all;
  const baseProducts = useMemo(
    () =>
      compact
        ? mergeCatalogItemsWithRecent(
            recentProducts,
            products.filter(product => product.compact)
          )
        : products,
    [compact, products, recentProducts]
  );
  const groupMeta = new Map(productGroups.map(group => [group.name, group]));
  const categoryOptions = [
    { label: messages.common.all, value: messages.common.all },
    ...productGroups.map(group => ({ label: group.name, value: group.name })),
  ];

  function updateFilters(nextQuery: string, nextCategory = category) {
    const next = new URLSearchParams();
    if (nextQuery.trim()) next.set('q', nextQuery.trim());
    if (nextCategory !== messages.common.all)
      next.set('category', nextCategory);
    setSearchParams(next, { replace: true });
  }

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return baseProducts.filter(product => {
      const matchesCategory =
        category === messages.common.all || product.group === category;
      const haystack = [
        product.id,
        product.name,
        product.group,
        product.summary,
        getStageLabel(product.lifecycle.stage, locale),
        ...product.badges,
        ...product.platform,
      ]
        .join(' ')
        .toLowerCase();
      return matchesCategory && (!normalized || haystack.includes(normalized));
    });
  }, [baseProducts, category, locale, messages.common.all, query]);

  const categories = compact
    ? Array.from(new Set(visibleProducts.map(product => product.group)))
    : productGroups
        .map(group => group.name)
        .filter(group =>
          visibleProducts.some(product => product.group === group)
        );

  return (
    <section
      className={compact ? 'product-directory compact' : 'product-directory'}
      aria-label={sectionCopy.ariaLabel}
    >
      {title ? <OSectionHeading description={subtitle} title={title} /> : null}
      {showFilters ? (
        <div className='directory-controls'>
          <label className='search-box'>
            <Search size={18} aria-hidden='true' />
            <span className='sr-only'>{sectionCopy.searchAriaLabel}</span>
            <input
              value={query}
              onChange={event => updateFilters(event.target.value)}
              placeholder={sectionCopy.searchPlaceholder}
            />
          </label>
          <OTab
            ariaLabel={sectionCopy.categoryAriaLabel}
            className='category-tabs'
            options={categoryOptions}
            value={category}
            onChange={nextCategory => updateFilters(query, nextCategory)}
          />
        </div>
      ) : null}
      {showFilters ? (
        <SectionCatalogRecent
          catalogType='product'
          copy={sectionCopy.recent}
          items={recentProducts}
        />
      ) : null}
      <div className='product-groups'>
        {categories.map(category => {
          const categoryProducts = visibleProducts.filter(
            product => product.group === category
          );
          const meta = groupMeta.get(category);

          return (
            <section className='product-group' key={category}>
              <div className='product-group-heading'>
                <div>
                  <h3>{category}</h3>
                  {meta?.description ? <p>{meta.description}</p> : null}
                </div>
              </div>
              <div className='catalog-grid'>
                {categoryProducts.map(product => (
                  <OCardCatalog
                    catalogType='product'
                    item={product}
                    key={product.id}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
      {!visibleProducts.length ? (
        <OEmptyState>{sectionCopy.emptyState}</OEmptyState>
      ) : null}
      {compact ? (
        <div className='section-action'>
          <OButton to='/products'>{sectionCopy.allButton}</OButton>
        </div>
      ) : null}
    </section>
  );
}
