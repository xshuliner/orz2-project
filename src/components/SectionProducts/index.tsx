import { CardCatalog } from '@/components/CardCatalog';
import { OButton } from '@/components/OButton';
import { OSectionHeading } from '@/components/OSectionHeading';
import { products } from '@/config/site';
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
  const displayedProducts = compact
    ? products.filter(product => product.compact)
    : products;
  const categories = Array.from(
    new Set(displayedProducts.map(product => product.category))
  );

  return (
    <section
      className={compact ? 'product-directory compact' : 'product-directory'}
      aria-label='产品展示'
    >
      {title ? <OSectionHeading description={subtitle} title={title} /> : null}
      <div className='product-groups'>
        {categories.map(category => {
          const categoryProducts = displayedProducts.filter(
            product => product.category === category
          );

          return (
            <section className='product-group' key={category}>
              <div className='product-group-heading'>
                <h3>{category}</h3>
                <span>
                  {categoryProducts.length.toString().padStart(2, '0')}
                </span>
              </div>
              <div className='catalog-grid'>
                {categoryProducts.map(product => (
                  <CardCatalog item={product} key={product.id} type='product' />
                ))}
              </div>
            </section>
          );
        })}
      </div>
      {compact ? (
        <div className='section-action'>
          <OButton to='/products'>查看全部产品</OButton>
        </div>
      ) : null}
    </section>
  );
}
