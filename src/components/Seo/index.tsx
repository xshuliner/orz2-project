import { defaultImageOg, routeUrl, siteName } from '@/config/seo';
import { defaultLocale, localeOpenGraph, locales, type Locale } from '@/i18n';
import type { SeoConfig } from '@/types/seo';
import { toSiteUrl } from '@/utils/siteUrl';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface SeoProps {
  config: SeoConfig;
}

function absoluteUrl(path = defaultImageOg) {
  return toSiteUrl(path);
}

export function Seo({ config }: SeoProps) {
  const locale = config.locale ?? defaultLocale;
  const titlePrefix = `${siteName} - `;
  const pageTitle = config.title.startsWith(titlePrefix)
    ? config.title
    : `${titlePrefix}${config.title}`;
  const canonical = routeUrl(config.canonicalPath, locale);
  const image = absoluteUrl(config.ogImage);
  const jsonLd = Array.isArray(config.jsonLd)
    ? config.jsonLd
    : config.jsonLd
      ? [config.jsonLd]
      : [];

  useEffect(() => {
    const setMeta = (selector: string, attribute: 'content', value: string) => {
      const element = document.head.querySelector<HTMLMetaElement>(selector);
      if (element) element.setAttribute(attribute, value);
    };

    setMeta('meta[name="description"]', 'content', config.description);
    setMeta('meta[property="og:title"]', 'content', pageTitle);
    setMeta('meta[property="og:description"]', 'content', config.description);
    setMeta('meta[property="og:locale"]', 'content', localeOpenGraph[locale]);
    setMeta('meta[property="og:image"]', 'content', image);
    setMeta('meta[name="twitter:title"]', 'content', pageTitle);
    setMeta('meta[name="twitter:description"]', 'content', config.description);
    setMeta('meta[name="twitter:image"]', 'content', image);
    setMeta('meta[name="robots"]', 'content', config.robots ?? 'index, follow');
  }, [config.description, config.robots, image, locale, pageTitle]);

  const alternateLocales: Array<Locale | 'x-default'> = [
    ...locales,
    'x-default',
  ];

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name='description' content={config.description} />
      {config.keywords?.length ? (
        <meta name='keywords' content={config.keywords.join(', ')} />
      ) : null}
      <meta name='robots' content={config.robots ?? 'index, follow'} />
      <link rel='canonical' href={canonical} />
      {alternateLocales.map(item => {
        const hrefLang = item === 'x-default' ? 'x-default' : item;
        const hrefLocale = item === 'x-default' ? defaultLocale : item;
        return (
          <link
            key={hrefLang}
            rel='alternate'
            hrefLang={hrefLang}
            href={routeUrl(config.canonicalPath, hrefLocale)}
          />
        );
      })}
      <meta property='og:site_name' content={siteName} />
      <meta property='og:locale' content={localeOpenGraph[locale]} />
      {locales
        .filter(item => item !== locale)
        .map(item => (
          <meta
            key={item}
            property='og:locale:alternate'
            content={localeOpenGraph[item]}
          />
        ))}
      <meta property='og:type' content='website' />
      <meta property='og:title' content={pageTitle} />
      <meta property='og:description' content={config.description} />
      <meta property='og:url' content={canonical} />
      <meta property='og:image' content={image} />
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={pageTitle} />
      <meta name='twitter:description' content={config.description} />
      <meta name='twitter:image' content={image} />
      {jsonLd.map((item, index) => (
        <script key={index} type='application/ld+json'>
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
}
