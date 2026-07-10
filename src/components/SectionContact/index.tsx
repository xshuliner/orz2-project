import { OButton } from '@/components/OButton';
import { OCard } from '@/components/OCard';
import { siteConfig } from '@/config/site';
import { useI18n } from '@/hooks/useI18n';
import { ArrowUpRight, Mail, Sparkles } from 'lucide-react';

export function SectionContact() {
  const { messages } = useI18n();
  const contactCopy = messages.homeSections.contact;
  return (
    <OCard
      as='section'
      className='contact-section reveal-on-scroll mx-auto mb-[var(--space-24)] grid w-[var(--page-content-width)] grid-cols-1 items-center gap-[var(--space-8)] [--o-card-padding:var(--space-6)] min-[961px]:grid-cols-[1fr_0.82fr] md:[--o-card-padding:var(--space-10)]'
      aria-labelledby='contact-title'
      interactive
      tone='brand'
    >
      <div>
        <h2
          id='contact-title'
          className='m-0 leading-[1.05] tracking-normal text-[var(--color-ink)] text-[var(--text-section-title)]'
        >
          {contactCopy.title}
        </h2>
        <p className='mt-3.5 mb-0 text-base leading-[var(--line-height-body)] text-[var(--color-muted)] sm:text-[var(--text-lead)]'>
          {contactCopy.description}
        </p>
      </div>
      <div className='grid justify-items-start gap-3.5'>
        <div className='flex items-start gap-2.5 leading-[1.55] text-[var(--color-text-accent)]'>
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
