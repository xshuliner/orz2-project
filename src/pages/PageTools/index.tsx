import { OPageHero } from '@/components/OPageHero';
import { SectionTools } from '@/components/SectionTools';
import { Seo } from '@/components/Seo';
import { pageSeo } from '@/config/seo';
import { homeSections } from '@/config/site';

export function PageTools() {
  return (
    <>
      <Seo config={pageSeo.tools} />
      <OPageHero
        title={homeSections.tools.title}
        description={homeSections.tools.subtitle}
      />
      <SectionTools />
    </>
  );
}
