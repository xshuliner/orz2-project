import { OPageHero } from '@/components/OPageHero';
import { SectionProducts } from '@/components/SectionProducts';
import { Seo } from '@/components/Seo';
import { getPageSeo } from '@/config/seo';
import { useI18n } from '@/hooks/useI18n';

export function PageProducts() {
  const { locale, messages } = useI18n();
  const pageSeo = getPageSeo(locale);
  const homeSections = messages.homeSections;
  const pageTitles = messages.pageTitles;
  return (
    <>
      <Seo config={pageSeo.products} />
      <OPageHero
        title={pageTitles.products}
        description={homeSections.products.subtitle}
      />
      <SectionProducts />
    </>
  );
}
