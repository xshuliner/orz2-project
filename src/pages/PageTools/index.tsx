import { LayoutPage } from '@/components/LayoutPage';
import { SectionTools } from '@/components/SectionTools';
import { getPageSeo } from '@/config/seo';
import { useI18n } from '@/hooks/useI18n';

export function PageTools() {
  const { locale, messages } = useI18n();
  const pageSeo = getPageSeo(locale);
  const homeSections = messages.homeSections;
  const pageTitles = messages.pageTitles;
  return (
    <LayoutPage
      backLink={false}
      description={homeSections.tools.subtitle}
      seoConfig={pageSeo.tools}
      title={pageTitles.onlineTools}
    >
      <SectionTools />
    </LayoutPage>
  );
}
