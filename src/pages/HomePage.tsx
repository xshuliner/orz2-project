import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { ContactSection } from "../components/ContactSection";
import { HeroVideoRotator } from "../components/HeroVideoRotator";
import { ProductDirectory } from "../components/ProductDirectory";
import { Seo } from "../components/Seo";
import { TestimonialMarquee } from "../components/TestimonialMarquee";
import { siteConfig } from "../config";
import { heroMedia, testimonials } from "../data/site";
import { pageSeo } from "../data/seo";

export function HomePage() {
  return (
    <>
      <Seo config={pageSeo.home} />
      <section className="hero-section">
        <div className="hero-copy">
          <h1>工具驱动增长</h1>
          <p>
            ORZ2 汇集 AI、开发、设计、营销和办公效率工具，也支持为商业化场景定制独立工具站、信息架构与合规模块。
          </p>
          <div className="hero-actions">
            <Link className="button primary interactive" to="/products">
              查看产品
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <a className="button secondary interactive" href={`mailto:${siteConfig.contactEmail}`}>
              定制合作
            </a>
          </div>
          <div className="hero-points" aria-label="ORZ2 特点">
            <span>
              <Zap size={16} aria-hidden="true" />
              快速入口
            </span>
            <span>
              <ShieldCheck size={16} aria-hidden="true" />
              合规清晰
            </span>
          </div>
        </div>
        <HeroVideoRotator media={heroMedia} />
      </section>
      <ProductDirectory compact />
      <section className="testimonial-section" aria-labelledby="testimonials-title">
        <div className="section-heading">
          <h2 id="testimonials-title">服务真实工作流，不只是收藏</h2>
          <p>工具站的价值在于稳定、清晰、可复用。ORZ2 的页面结构也围绕这件事展开。</p>
        </div>
        <TestimonialMarquee />
      </section>
      <ContactSection />
    </>
  );
}
