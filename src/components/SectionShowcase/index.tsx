import { CatalogCard } from '@/components/CatalogCard';
import { productShowcases } from '@/config/site';
import './index.css';

const categories = Array.from(
  new Set(productShowcases.map(product => product.category))
);

export function SectionShowcase() {
  return (
    <section className='showcase-directory' aria-labelledby='showcase-title'>
      <div className='showcase-groups'>
        {categories.map(category => {
          const products = productShowcases.filter(
            product => product.category === category
          );

          return (
            <section className='showcase-group' key={category}>
              <div className='showcase-group-heading'>
                <h3>{category}</h3>
                <span>{products.length.toString().padStart(2, '0')}</span>
              </div>
              <div className='catalog-grid'>
                {products.map(product => (
                  <CatalogCard item={product} key={product.id} type='product' />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
