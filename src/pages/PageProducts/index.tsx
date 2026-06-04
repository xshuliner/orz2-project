import { OPageHero } from '@/components/OPageHero';
import { SectionProducts } from '@/components/SectionProducts';
import { Seo } from '@/components/Seo';
import { pageSeo } from '@/config/seo';
import { homeSections } from '@/config/site';

export function PageProducts() {
  return (
    <>
      <Seo config={pageSeo.products} />
      <OPageHero
        title={homeSections.products.title}
        description={homeSections.products.subtitle}
      />
      <SectionProducts />
    </>
  );
}
