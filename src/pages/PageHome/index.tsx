import { SectionHero } from '@/components/SectionHero';
import { SectionProducts } from '@/components/SectionProducts';
import { SectionTools } from '@/components/SectionTools';
import { Seo } from '@/components/Seo';
import { pageSeo } from '@/config/seo';
import { homeSections } from '@/config/site';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const SectionTestimonial = lazy(() =>
  import('@/components/SectionTestimonial').then(module => ({
    default: module.SectionTestimonial,
  }))
);

function LazySectionTestimonial() {
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
            title={homeSections.testimonials.title}
            subtitle={homeSections.testimonials.subtitle}
          />
        </Suspense>
      ) : null}
    </div>
  );
}

export function PageHome() {
  return (
    <>
      <Seo config={pageSeo.home} />
      <SectionHero />
      <SectionTools
        compact
        title={homeSections.tools.title}
        subtitle={homeSections.tools.subtitle}
      />
      <SectionProducts
        compact
        title={homeSections.products.title}
        subtitle={homeSections.products.subtitle}
      />
      <LazySectionTestimonial />
    </>
  );
}
