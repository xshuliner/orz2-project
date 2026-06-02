import { OPageHero } from '@/components/OPageHero';
import { SectionTools } from '@/components/SectionTools';
import { Seo } from '@/components/Seo';
import { pageSeo } from '@/config/seo';

export function PageTools() {
  return (
    <>
      <Seo config={pageSeo.tools} />
      <OPageHero
        title='在线工具'
        description='把高频任务整理成清晰直接的入口，需要时随手打开，用完即可离开。'
      />
      <SectionTools />
    </>
  );
}
