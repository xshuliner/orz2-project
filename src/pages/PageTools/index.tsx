import { SectionTools } from '@/components/SectionTools';
import { Seo } from '@/components/Seo';
import { pageSeo } from '@/config/seo';

export function PageTools() {
  return (
    <>
      <Seo config={pageSeo.tools} />
      <section className='page-hero compact-hero'>
        <h1>在线工具</h1>
        <p>把高频任务整理成清晰直接的入口，需要时随手打开，用完即可离开。</p>
      </section>
      <SectionTools />
    </>
  );
}
