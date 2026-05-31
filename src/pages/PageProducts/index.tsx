import { SectionProducts } from '@/components/SectionProducts';
import { Seo } from '@/components/Seo';
import { pageSeo } from '@/config/seo';

export function PageProducts() {
  return (
    <>
      <Seo config={pageSeo.products} />
      <section className='page-hero compact-hero'>
        <h1>产品展示</h1>
        <p>记录已经落地的产品实践，也保留每个项目独立而清晰的入口。</p>
      </section>
      <SectionProducts />
    </>
  );
}
