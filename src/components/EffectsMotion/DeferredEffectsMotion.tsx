import { prefersReducedMotion } from '@/utils/motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

export function DeferredEffectsMotion() {
  const location = useLocation();

  useLayoutEffect(() => {
    const reduceMotion = prefersReducedMotion();
    const cleanupFns: Array<() => void> = [];
    const ctx = gsap.context(() => {
      const header = document.querySelector<HTMLElement>('.site-header');
      if (header) {
        let headerIsScrolled = header.classList.contains('is-scrolled');
        let syncHeaderFrame: number | null = null;

        const syncHeader = (force = false) => {
          const shouldBeScrolled = headerIsScrolled
            ? window.scrollY > 8
            : window.scrollY > 28;
          if (!force && shouldBeScrolled === headerIsScrolled) return;

          headerIsScrolled = shouldBeScrolled;
          header.classList.toggle('is-scrolled', shouldBeScrolled);
        };

        const queueHeaderSync = () => {
          if (syncHeaderFrame !== null) return;
          syncHeaderFrame = window.requestAnimationFrame(() => {
            syncHeaderFrame = null;
            syncHeader();
          });
        };

        syncHeader(true);
        window.addEventListener('scroll', queueHeaderSync, { passive: true });
        cleanupFns.push(() => {
          window.removeEventListener('scroll', queueHeaderSync);
          if (syncHeaderFrame !== null)
            window.cancelAnimationFrame(syncHeaderFrame);
        });
      }

      if (reduceMotion) {
        return;
      }

      document.documentElement.classList.add('motion-enabled');
      cleanupFns.push(() =>
        document.documentElement.classList.remove('motion-enabled')
      );

      const introTargets = gsap.utils.toArray<HTMLElement>(
        ['.hero-copy > *', '.page-hero > *', '.tool-form-hero > *'].join(',')
      );
      if (introTargets.length) {
        gsap.fromTo(
          introTargets,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.72,
            ease: 'power3.out',
            stagger: 0.08,
            clearProps: 'transform,opacity',
          }
        );
      }

      const revealTargets = gsap.utils.toArray<HTMLElement>(
        [
          '.section-heading',
          '.reveal-on-scroll',
          '.privacy-article section',
          '.footer-grid > *',
        ].join(',')
      );
      if (revealTargets.length) {
        gsap.set(revealTargets, { y: 26, opacity: 0 });

        ScrollTrigger.batch(revealTargets, {
          start: 'top 95%',
          once: true,
          interval: 0.08,
          batchMax: 4,
          onEnter: batch => {
            batch.forEach(element => {
              (element as HTMLElement).dataset.motionShown = 'true';
            });
            gsap.to(batch, {
              y: 0,
              opacity: 1,
              duration: 0.68,
              ease: 'power3.out',
              stagger: 0.09,
              onComplete: () => {
                batch.forEach(element => {
                  (element as HTMLElement).classList.add('is-revealed');
                });
              },
            });
          },
        });
      }

      const revealVisibleDynamicItems = () => {
        const visibleHiddenItems = gsap.utils
          .toArray<HTMLElement>('.reveal-on-scroll')
          .filter(element => {
            if (element.dataset.motionShown === 'true') return false;
            const rect = element.getBoundingClientRect();
            return rect.top < window.innerHeight * 0.95 && rect.bottom > 0;
          });

        if (!visibleHiddenItems.length) return;
        visibleHiddenItems.forEach(element => {
          element.dataset.motionShown = 'true';
        });
        gsap.to(visibleHiddenItems, {
          y: 0,
          opacity: 1,
          duration: 0.58,
          ease: 'power3.out',
          stagger: 0.06,
          onComplete: () => {
            visibleHiddenItems.forEach(element => {
              element.classList.add('is-revealed');
            });
          },
        });
        ScrollTrigger.refresh();
      };

      let dynamicRevealFrame: number | null = null;
      const observerTarget = document.querySelector('main') ?? document.body;
      const dynamicRevealObserver = new MutationObserver(() => {
        if (dynamicRevealFrame !== null) return;
        dynamicRevealFrame = window.requestAnimationFrame(() => {
          dynamicRevealFrame = null;
          revealVisibleDynamicItems();
        });
      });
      dynamicRevealObserver.observe(observerTarget, {
        childList: true,
        subtree: true,
      });
      cleanupFns.push(() => {
        dynamicRevealObserver.disconnect();
        if (dynamicRevealFrame !== null)
          window.cancelAnimationFrame(dynamicRevealFrame);
      });

      const canUsePointerEffects = window.matchMedia(
        '(hover: hover) and (pointer: fine)'
      ).matches;
      const tiltCards = canUsePointerEffects
        ? gsap.utils.toArray<HTMLElement>(
            [
              '.o-card[data-o-card-interactive="true"]',
              '.contact-section',
            ].join(',')
          )
        : [];

      tiltCards.forEach(card => {
        gsap.set(card, { transformPerspective: 900 });
        const rotateXTo = gsap.quickTo(card, 'rotationX', {
          duration: 0.28,
          ease: 'power3.out',
        });
        const rotateYTo = gsap.quickTo(card, 'rotationY', {
          duration: 0.28,
          ease: 'power3.out',
        });
        const yTo = gsap.quickTo(card, 'y', {
          duration: 0.28,
          ease: 'power3.out',
        });
        const moveCard = (event: PointerEvent) => {
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width;
          const y = (event.clientY - rect.top) / rect.height;
          card.style.setProperty('--pointer-x', `${x * 100}%`);
          card.style.setProperty('--pointer-y', `${y * 100}%`);
          rotateXTo((0.5 - y) * 4);
          rotateYTo((x - 0.5) * 4);
          yTo(-4);
        };
        const resetCard = () => {
          rotateXTo(0);
          rotateYTo(0);
          yTo(0);
        };
        card.addEventListener('pointermove', moveCard);
        card.addEventListener('pointerleave', resetCard);
        cleanupFns.push(() => {
          card.removeEventListener('pointermove', moveCard);
          card.removeEventListener('pointerleave', resetCard);
        });
      });

      const refreshTimer = window.setTimeout(() => {
        ScrollTrigger.refresh();
        revealVisibleDynamicItems();
      }, 80);
      cleanupFns.push(() => window.clearTimeout(refreshTimer));
    });

    return () => {
      cleanupFns.forEach(cleanup => cleanup());
      ctx.revert();
    };
  }, [location.pathname]);

  return null;
}
