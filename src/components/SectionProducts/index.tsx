import { OButton } from '@/components/OButton';
import { OCardCatalog } from '@/components/OCardCatalog';
import { OEmptyState } from '@/components/OEmptyState';
import { OSectionHeading } from '@/components/OSectionHeading';
import { OTab } from '@/components/OTab';
import { productGroups, products } from '@/config/site';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const showFilters = !compact;
  const query = showFilters ? (searchParams.get('q') ?? '') : '';
  const category = showFilters
    ? (searchParams.get('category') ?? '全部')
    : '全部';
  const baseProducts = useMemo(
    () => (compact ? products.filter(product => product.compact) : products),
    [compact]
  );
  const groupMeta = new Map(productGroups.map(group => [group.name, group]));
  const categoryOptions = [
    { label: '全部', value: '全部' },
    ...productGroups.map(group => ({ label: group.name, value: group.name })),
  ];

  function updateFilters(nextQuery: string, nextCategory = category) {
    const next = new URLSearchParams();
    if (nextQuery.trim()) next.set('q', nextQuery.trim());
    if (nextCategory !== '全部') next.set('category', nextCategory);
    setSearchParams(next, { replace: true });
  }

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return baseProducts.filter(product => {
      const matchesCategory = category === '全部' || product.group === category;
      const haystack = [
        product.id,
        product.name,
        product.group,
        product.summary,
        product.lifecycle.stage,
        ...product.badges,
        ...product.platform,
      ]
        .join(' ')
        .toLowerCase();
      return matchesCategory && (!normalized || haystack.includes(normalized));
    });
  }, [baseProducts, category, query]);

  const categories = productGroups
    .map(group => group.name)
    .filter(group => visibleProducts.some(product => product.group === group));

  return (
    <section
      className={compact ? 'product-directory compact' : 'product-directory'}
      aria-label='产品展示'
    >
      {title ? <OSectionHeading description={subtitle} title={title} /> : null}
      {showFilters ? (
        <div className='directory-controls'>
          <label className='search-box'>
            <Search size={18} aria-hidden='true' />
            <span className='sr-only'>搜索产品</span>
            <input
              value={query}
              onChange={event => updateFilters(event.target.value)}
              placeholder='搜索 H5、WEAPP、AI、游戏...'
            />
          </label>
          <OTab
            ariaLabel='产品分类'
            className='category-tabs'
            options={categoryOptions}
            value={category}
            onChange={nextCategory => updateFilters(query, nextCategory)}
          />
        </div>
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
                  <OCardCatalog item={product} key={product.id} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
      {!visibleProducts.length ? (
        <OEmptyState>暂时没有匹配的产品，换个关键词试试。</OEmptyState>
      ) : null}
      {compact ? (
        <div className='section-action'>
          <OButton to='/products'>查看全部产品</OButton>
        </div>
      ) : null}
    </section>
  );
}
