import { Seo } from '@/components/Seo';
import { pageSeo, toolSeo } from '@/config/seo';
import { productTools } from '@/config/site';
import { PageWechatPublisher } from '@/pages/PageWechatPublisher';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import './index.css';

export function PageTool() {
  const { slug = '' } = useParams();
  const tool = productTools.find(item => item.slug === slug);

  if (slug === 'wechat-auto-publisher') {
    return <PageWechatPublisher />;
  }

  if (!tool) {
    return (
      <>
        <Seo config={pageSeo.products} />
        <section className='page-hero compact-hero'>
          <h1>未找到</h1>
          <p>这个工具入口可能还在整理中，可以先返回在线工具查看已有入口。</p>
          <Link className='button primary interactive' to='/tools'>
            <ArrowLeft size={18} aria-hidden='true' />
            返回工具
          </Link>
        </section>
      </>
    );
  }

  return (
    <>
      <Seo config={toolSeo[tool.slug]} />
      <section className='tool-placeholder'>
        <Link className='back-link interactive' to='/tools'>
          <ArrowLeft size={16} aria-hidden='true' />
          在线工具
        </Link>
        <div className='tool-placeholder-card'>
          <span className='font-bold text-green-dark'>{tool.category}</span>
          <h1 className='!m-[14px_0_12px] text-[clamp(38px,6vw,64px)] leading-[1.02] whitespace-nowrap'>
            {tool.name}
          </h1>
          <p>{tool.description}</p>
          <div className='tag-row'>
            {tool.tags.map(tag => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <p className='placeholder-note'>
            首版保留工具详情页结构与独立发布能力，真实工具功能可在后续迭代中接入。
          </p>
        </div>
      </section>
    </>
  );
}
