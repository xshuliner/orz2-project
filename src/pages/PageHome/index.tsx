import { SectionContact } from '@/components/SectionContact';
import { SectionHeroVideo } from '@/components/SectionHeroVideo';
import { SectionProduct } from '@/components/SectionProduct';
import { SectionTestimonial } from '@/components/SectionTestimonial';
import { Seo } from '@/components/Seo';
import { siteConfig } from '@/config';
import { pageSeo } from '@/config/seo';
import { heroMedia } from '@/config/site';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import './index.css';

export function PageHome() {
  return (
    <>
      <Seo config={pageSeo.home} />
      <section className='hero-section'>
        <div className='hero-copy'>
          <h1>工具驱动增长</h1>
          <p>
            ORZ2 汇集
            AI、开发、设计、营销和办公效率工具，也支持为商业化场景定制独立工具站、信息架构与合规模块。
          </p>
          <div className='hero-actions'>
            <Link className='button primary interactive' to='/products'>
              查看产品
              <ArrowRight size={18} aria-hidden='true' />
            </Link>
            <a
              className='button secondary interactive'
              href={`mailto:${siteConfig.contactEmail}`}
            >
              定制合作
            </a>
          </div>
          <div className='hero-points' aria-label='ORZ2 特点'>
            <span>
              <Zap size={16} aria-hidden='true' />
              快速入口
            </span>
            <span>
              <ShieldCheck size={16} aria-hidden='true' />
              合规清晰
            </span>
          </div>
        </div>
        <SectionHeroVideo media={heroMedia} />
      </section>
      <SectionProduct compact />
      <section
        className='testimonial-section'
        aria-labelledby='testimonials-title'
      >
        <SectionTestimonial />
      </section>
      <SectionContact />
    </>
  );
}
