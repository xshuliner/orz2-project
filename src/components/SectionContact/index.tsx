import { OButton } from '@/components/OButton';
import { OCard } from '@/components/OCard';
import { siteConfig } from '@/config';
import { ArrowUpRight, Mail, Sparkles } from 'lucide-react';
import './index.css';

export function SectionContact() {
  return (
    <OCard
      as='section'
      className='contact-section reveal-on-scroll'
      aria-labelledby='contact-title'
      interactive
      tone='brand'
    >
      <div>
        <h2 id='contact-title'>你的商业工具入口</h2>
        <p>
          我们可以围绕你的行业、团队流程和商业化目标，定制工具页面、数据接入、广告合规内容与独立站点架构。
        </p>
      </div>
      <div className='contact-panel'>
        <div className='contact-line'>
          <Sparkles size={20} aria-hidden='true' />
          <span>工具目录设计、AI 流程接入、企业落地页、隐私合规模块</span>
        </div>
        <OButton href={`mailto:${siteConfig.contactEmail}`}>
          <Mail size={18} aria-hidden='true' />
          {siteConfig.contactEmail}
        </OButton>
        <OButton to='/products' variant='ghost'>
          查看可扩展入口
          <ArrowUpRight size={16} aria-hidden='true' />
        </OButton>
      </div>
    </OCard>
  );
}
