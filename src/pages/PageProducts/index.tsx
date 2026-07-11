import { LayoutPage } from '@/components/LayoutPage';
import { SectionProducts } from '@/components/SectionProducts';
import { getPageSeo } from '@/config/seo';
import { useI18n } from '@/hooks/useI18n';

export function PageProducts() {
  const { locale, messages } = useI18n();
  const pageSeo = getPageSeo(locale);
  const homeSections = messages.homeSections;
  const pageTitles = messages.pageTitles;
  return (
    <LayoutPage
      backLink={false}
      description={homeSections.products.subtitle}
      seoConfig={pageSeo.products}
      title={pageTitles.products}
    >
      <SectionProducts />
    </LayoutPage>
  );
}
