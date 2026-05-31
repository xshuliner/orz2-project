import { SectionHero } from '@/components/SectionHero';
import { SectionProducts } from '@/components/SectionProducts';
import { SectionTestimonial } from '@/components/SectionTestimonial';
import { SectionTools } from '@/components/SectionTools';
import { Seo } from '@/components/Seo';
import { pageSeo } from '@/config/seo';

export function PageHome() {
  return (
    <>
      <Seo config={pageSeo.home} />
      <SectionHero />
      <SectionTools
        compact
        title='在线工具'
        subtitle='把高频任务整理成清晰直接的入口，需要时随手打开，用完即可离开。'
      />
      <SectionProducts
        compact
        title='产品展示'
        subtitle='记录已经落地的产品实践，也保留每个项目独立而清晰的入口。'
      />
      <SectionTestimonial
        title='用户反馈'
        subtitle='真实的使用感受，帮助我们持续打磨更直接、更好用的工具体验。'
      />
    </>
  );
}
