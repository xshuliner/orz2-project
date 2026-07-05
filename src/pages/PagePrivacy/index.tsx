import { OCard } from '@/components/OCard';
import { OPageHero } from '@/components/OPageHero';
import { Seo } from '@/components/Seo';
import { getPageSeo } from '@/config/seo';
import { siteConfig } from '@/config/site';
import { useI18n } from '@/i18n';
import './index.css';

export function PagePrivacy() {
  const { locale, messages } = useI18n();
  const pageSeo = getPageSeo(locale);
  const copy = messages.privacy;
  return (
    <>
      <Seo config={pageSeo.privacy} />
      <OPageHero title={copy.heroTitle} description={copy.heroDescription} />
      <section className='privacy-layout'>
        <OCard
          as='aside'
          className='privacy-toc'
          aria-label={copy.tocAriaLabel}
          padding='sm'
          tone='soft'
        >
          {copy.sections.map(section => (
            <a
              className='interactive rounded-lg px-2 py-[10px] text-sm text-text-toc hover:bg-green-soft-toc hover:text-ink'
              href={`#${section.id}`}
              key={section.id}
            >
              {section.title}
            </a>
          ))}
        </OCard>
        <article className='privacy-article'>
          {copy.sections.map(section => (
            <section id={section.id} key={section.id}>
              <h2 className='!m-0 !mb-[10px] text-[28px]'>{section.title}</h2>
              <p className='!m-0'>
                {'body' in section ? (
                  section.body
                ) : (
                  <>
                    {section.bodyBeforeEmail}
                    <a
                      className='interactive font-bold text-green-dark underline-offset-[3px] hover:text-green-deep hover:underline'
                      href={`mailto:${siteConfig.contactEmail}`}
                    >
                      {siteConfig.contactEmail}
                    </a>
                    {section.bodyAfterEmail}
                  </>
                )}
              </p>
            </section>
          ))}
        </article>
      </section>
    </>
  );
}
