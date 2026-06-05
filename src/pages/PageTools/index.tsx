import { OPageHero } from '@/components/OPageHero';
import { SectionTools } from '@/components/SectionTools';
import { Seo } from '@/components/Seo';
import { getPageSeo } from '@/config/seo';
import { useI18n } from '@/i18n';

export function PageTools() {
  const { locale, messages } = useI18n();
  const pageSeo = getPageSeo(locale);
  const homeSections = messages.homeSections;
  const pageTitles = messages.pageTitles;
  return (
    <>
      <Seo config={pageSeo.tools} />
      <OPageHero
        title={pageTitles.onlineTools}
        description={homeSections.tools.subtitle}
      />
      <SectionTools />
    </>
  );
}
