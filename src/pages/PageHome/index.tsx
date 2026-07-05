import { SectionHero } from '@/components/SectionHero';
import { SectionProducts } from '@/components/SectionProducts';
import { SectionTools } from '@/components/SectionTools';
import { Seo } from '@/components/Seo';
import { getPageSeo } from '@/config/seo';
import { useI18n } from '@/hooks/useI18n';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const SectionTestimonial = lazy(() =>
  import('@/components/SectionTestimonial').then(module => ({
    default: module.SectionTestimonial,
  }))
);

function LazySectionTestimonial() {
  const { messages } = useI18n();
  const testimonialsCopy = messages.homeSections.testimonials;
  const [isVisible, setIsVisible] = useState(false);
  const placeholderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const placeholder = placeholderRef.current;
    if (!placeholder) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin: '360px 0px' }
    );

    observer.observe(placeholder);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={placeholderRef} style={{ minHeight: '28rem' }}>
      {isVisible ? (
        <Suspense fallback={null}>
          <SectionTestimonial
            title={testimonialsCopy.title}
            subtitle={testimonialsCopy.subtitle}
          />
        </Suspense>
      ) : null}
    </div>
  );
}

export function PageHome() {
  const { locale, messages } = useI18n();
  const pageSeo = getPageSeo(locale);
  const homeSections = messages.homeSections;
  const pageTitles = messages.pageTitles;
  return (
    <>
      <Seo config={pageSeo.home} />
      <SectionHero />
      <SectionTools
        compact
        title={pageTitles.onlineTools}
        subtitle={homeSections.tools.subtitle}
      />
      <SectionProducts
        compact
        title={pageTitles.products}
        subtitle={homeSections.products.subtitle}
      />
      <LazySectionTestimonial />
    </>
  );
}
