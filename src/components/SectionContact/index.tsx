import { OButton } from '@/components/OButton';
import { OCard } from '@/components/OCard';
import { siteConfig } from '@/config/site';
import { useI18n } from '@/hooks/useI18n';
import { ArrowUpRight, Mail, Sparkles } from 'lucide-react';
import './index.css';

export function SectionContact() {
  const { messages } = useI18n();
  const contactCopy = messages.homeSections.contact;
  return (
    <OCard
      as='section'
      className='contact-section reveal-on-scroll'
      aria-labelledby='contact-title'
      interactive
      tone='brand'
    >
      <div>
        <h2 id='contact-title'>{contactCopy.title}</h2>
        <p>{contactCopy.description}</p>
      </div>
      <div className='contact-panel'>
        <div className='contact-line'>
          <Sparkles size={20} aria-hidden='true' />
          <span>{contactCopy.capabilities}</span>
        </div>
        <OButton href={`mailto:${siteConfig.contactEmail}`}>
          <Mail size={18} aria-hidden='true' />
          {siteConfig.contactEmail}
        </OButton>
        <OButton to='/products' variant='ghost'>
          {contactCopy.ctaLabel}
          <ArrowUpRight size={16} aria-hidden='true' />
        </OButton>
      </div>
    </OCard>
  );
}
