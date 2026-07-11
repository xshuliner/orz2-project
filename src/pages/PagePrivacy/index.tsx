import { LayoutPage } from '@/components/LayoutPage';
import { OCard } from '@/components/OCard';
import { getPageSeo } from '@/config/seo';
import { siteConfig } from '@/config/site';
import { useI18n } from '@/hooks/useI18n';
import { Fragment } from 'react';
import './index.css';

const URL_PATTERN = /(https?:\/\/[^\s]+)/g;
const URL_TRAILING_PUNCTUATION = /[.\u3001\u3002\uff0c]+$/u;

function renderLinkedText(text: string) {
  return text.split(URL_PATTERN).map((part, index) => {
    if (!part.match(URL_PATTERN))
      return <Fragment key={index}>{part}</Fragment>;
    const href = part.replace(URL_TRAILING_PUNCTUATION, '');
    const suffix = part.slice(href.length);

    return (
      <Fragment key={index}>
        <a
          className='interactive font-bold text-green-dark underline-offset-[3px] hover:text-green-deep hover:underline'
          href={href}
          rel='noopener noreferrer'
          target='_blank'
        >
          {href}
        </a>
        {suffix}
      </Fragment>
    );
  });
}

export function PagePrivacy() {
  const { locale, messages } = useI18n();
  const pageSeo = getPageSeo(locale);
  const copy = messages.privacy;
  return (
    <LayoutPage
      backLink={false}
      description={copy.heroDescription}
      seoConfig={pageSeo.privacy}
      title={copy.heroTitle}
    >
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
                  renderLinkedText(section.body)
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
    </LayoutPage>
  );
}
