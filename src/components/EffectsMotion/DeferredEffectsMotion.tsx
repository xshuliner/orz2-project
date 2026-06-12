import { prefersReducedMotion } from '@/utils/motion';
import gsap from 'gsap';
import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

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

      const revealSelector = [
        '.section-heading',
        '.reveal-on-scroll',
        '.privacy-article section',
        '.footer-grid > *',
      ].join(',');

      const observedRevealTargets = new WeakSet<HTMLElement>();
      const revealObserver =
        'IntersectionObserver' in window
          ? new IntersectionObserver(
              (entries, observer) => {
                const enteredTargets = entries
                  .filter(entry => entry.isIntersecting)
                  .map(entry => entry.target as HTMLElement)
                  .filter(element => element.dataset.motionShown !== 'true');

                if (!enteredTargets.length) return;

                enteredTargets.forEach(element => {
                  element.dataset.motionShown = 'true';
                  observer.unobserve(element);
                });

                gsap.to(enteredTargets, {
                  y: 0,
                  opacity: 1,
                  duration: 0.68,
                  ease: 'power3.out',
                  stagger: 0.09,
                  onComplete: () => {
                    enteredTargets.forEach(element => {
                      element.classList.add('is-revealed');
                    });
                  },
                });
              },
              {
                rootMargin: '0px 0px -5% 0px',
                threshold: 0,
              }
            )
          : null;

      const getRevealTargets = (root: ParentNode = document) => {
        const targets = gsap.utils.toArray<HTMLElement>(revealSelector, root);

        if (root instanceof HTMLElement && root.matches(revealSelector)) {
          targets.unshift(root);
        }

        return targets;
      };

      const registerRevealTargets = (root?: ParentNode) => {
        const nextTargets = getRevealTargets(root).filter(
          element =>
            !observedRevealTargets.has(element) &&
            element.dataset.motionShown !== 'true'
        );

        if (!nextTargets.length) return;

        nextTargets.forEach(element => {
          observedRevealTargets.add(element);
        });

        gsap.set(nextTargets, { y: 26, opacity: 0 });

        if (!revealObserver) {
          nextTargets.forEach(element => {
            element.dataset.motionShown = 'true';
            element.classList.add('is-revealed');
          });
          gsap.set(nextTargets, { y: 0, opacity: 1 });
          return;
        }

        nextTargets.forEach(element => revealObserver.observe(element));
      };

      registerRevealTargets();
      cleanupFns.push(() => revealObserver?.disconnect());

      let dynamicRevealFrame: number | null = null;
      const observerTarget = document.querySelector('main') ?? document.body;
      const dynamicRevealObserver = new MutationObserver(mutations => {
        if (dynamicRevealFrame !== null) return;
        dynamicRevealFrame = window.requestAnimationFrame(() => {
          dynamicRevealFrame = null;
          mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
              if (node instanceof HTMLElement) registerRevealTargets(node);
            });
          });
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
        let cardBounds: DOMRect | null = null;
        let latestPointerEvent: PointerEvent | null = null;
        let pointerFrame: number | null = null;
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

        const readCardBounds = () => {
          cardBounds = card.getBoundingClientRect();
        };
        const updateCard = () => {
          pointerFrame = null;
          if (!cardBounds || !latestPointerEvent) return;

          const x =
            (latestPointerEvent.clientX - cardBounds.left) / cardBounds.width;
          const y =
            (latestPointerEvent.clientY - cardBounds.top) / cardBounds.height;
          card.style.setProperty('--pointer-x', `${x * 100}%`);
          card.style.setProperty('--pointer-y', `${y * 100}%`);
          rotateXTo((0.5 - y) * 4);
          rotateYTo((x - 0.5) * 4);
          yTo(-4);
        };
        const enterCard = (event: PointerEvent) => {
          readCardBounds();
          latestPointerEvent = event;
          updateCard();
        };
        const moveCard = (event: PointerEvent) => {
          latestPointerEvent = event;
          if (!cardBounds) readCardBounds();
          if (pointerFrame !== null) return;
          pointerFrame = window.requestAnimationFrame(updateCard);
        };
        const resetCard = () => {
          cardBounds = null;
          latestPointerEvent = null;
          if (pointerFrame !== null) {
            window.cancelAnimationFrame(pointerFrame);
            pointerFrame = null;
          }
          rotateXTo(0);
          rotateYTo(0);
          yTo(0);
        };
        card.addEventListener('pointerenter', enterCard, { passive: true });
        card.addEventListener('pointermove', moveCard, { passive: true });
        card.addEventListener('pointerleave', resetCard);
        cleanupFns.push(() => {
          card.removeEventListener('pointerenter', enterCard);
          card.removeEventListener('pointermove', moveCard);
          card.removeEventListener('pointerleave', resetCard);
          if (pointerFrame !== null) window.cancelAnimationFrame(pointerFrame);
        });
      });
    });

    return () => {
      cleanupFns.forEach(cleanup => cleanup());
      ctx.revert();
    };
  }, [location.pathname]);

  return null;
}
