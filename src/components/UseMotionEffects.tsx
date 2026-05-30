import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { prefersReducedMotion } from "../utils/motion";

gsap.registerPlugin(ScrollTrigger);

export function UseMotionEffects() {
  const location = useLocation();

  useLayoutEffect(() => {
    const reduceMotion = prefersReducedMotion();
    const cleanupFns: Array<() => void> = [];
    const ctx = gsap.context(() => {
      const header = document.querySelector<HTMLElement>(".site-header");
      if (header) {
        let headerIsScrolled = header.classList.contains("is-scrolled");
        let syncHeaderFrame: number | null = null;

        const syncHeader = (force = false) => {
          const shouldBeScrolled = headerIsScrolled ? window.scrollY > 8 : window.scrollY > 28;
          if (!force && shouldBeScrolled === headerIsScrolled) return;

          headerIsScrolled = shouldBeScrolled;
          header.classList.toggle("is-scrolled", shouldBeScrolled);
        };

        const queueHeaderSync = () => {
          if (syncHeaderFrame !== null) return;
          syncHeaderFrame = window.requestAnimationFrame(() => {
            syncHeaderFrame = null;
            syncHeader();
          });
        };

        syncHeader(true);
        window.addEventListener("scroll", queueHeaderSync, { passive: true });
        cleanupFns.push(() => {
          window.removeEventListener("scroll", queueHeaderSync);
          if (syncHeaderFrame !== null) window.cancelAnimationFrame(syncHeaderFrame);
        });
      }

      if (reduceMotion) {
        ScrollTrigger.refresh();
        return;
      }

      const introTargets = gsap.utils.toArray<HTMLElement>(
        [
          ".hero-copy > *",
          ".page-hero > *",
          ".tool-form-hero > *",
          ".tool-placeholder > .back-link",
          ".tool-placeholder-card",
        ].join(","),
      );
      gsap.fromTo(
        introTargets,
        { y: 26, opacity: 0, filter: "blur(10px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.95,
          ease: "power3.out",
          stagger: 0.08,
          clearProps: "transform,opacity,filter",
        },
      );

      const revealTargets = gsap.utils.toArray<HTMLElement>(
        [
          ".section-heading",
          ".reveal-on-scroll",
          ".privacy-article section",
          ".footer-grid > *",
        ].join(","),
      );
      gsap.set(revealTargets, { y: 34, opacity: 0, filter: "blur(12px)" });

      ScrollTrigger.batch(revealTargets, {
        start: "top 86%",
        once: true,
        interval: 0.08,
        batchMax: 4,
        onEnter: (batch) => {
          batch.forEach((element) => {
            (element as HTMLElement).dataset.motionShown = "true";
          });
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.85,
            ease: "power3.out",
            stagger: 0.09,
            clearProps: "transform,opacity,filter",
          });
        },
      });

      const revealVisibleDynamicItems = () => {
        const visibleHiddenItems = gsap.utils.toArray<HTMLElement>(".reveal-on-scroll").filter((element) => {
          if (element.dataset.motionShown === "true") return false;
          const rect = element.getBoundingClientRect();
          return rect.top < window.innerHeight * 0.9 && rect.bottom > 0;
        });

        if (!visibleHiddenItems.length) return;
        visibleHiddenItems.forEach((element) => {
          element.dataset.motionShown = "true";
        });
        gsap.to(visibleHiddenItems, {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.62,
          ease: "power3.out",
          stagger: 0.06,
          clearProps: "transform,opacity,filter",
        });
        ScrollTrigger.refresh();
      };

      const observerTarget = document.querySelector("main") ?? document.body;
      const dynamicRevealObserver = new MutationObserver(() => {
        window.requestAnimationFrame(revealVisibleDynamicItems);
      });
      dynamicRevealObserver.observe(observerTarget, { childList: true, subtree: true });
      cleanupFns.push(() => dynamicRevealObserver.disconnect());

      const tiltCards = gsap.utils.toArray<HTMLElement>(
        [
          ".tool-card",
          ".testimonial-card",
          ".team-card",
          ".contact-section",
        ].join(","),
      );

      tiltCards.forEach((card) => {
        const moveCard = (event: PointerEvent) => {
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width;
          const y = (event.clientY - rect.top) / rect.height;
          card.style.setProperty("--pointer-x", `${x * 100}%`);
          card.style.setProperty("--pointer-y", `${y * 100}%`);
          gsap.to(card, {
            rotationX: (0.5 - y) * 5,
            rotationY: (x - 0.5) * 5,
            y: -5,
            duration: 0.35,
            ease: "power3.out",
            transformPerspective: 900,
          });
        };
        const resetCard = () => {
          gsap.to(card, {
            rotationX: 0,
            rotationY: 0,
            y: 0,
            duration: 0.45,
            ease: "power3.out",
          });
        };
        card.addEventListener("pointermove", moveCard);
        card.addEventListener("pointerleave", resetCard);
        cleanupFns.push(() => {
          card.removeEventListener("pointermove", moveCard);
          card.removeEventListener("pointerleave", resetCard);
        });
      });

      const refreshTimer = window.setTimeout(() => {
        ScrollTrigger.refresh();
        revealVisibleDynamicItems();
      }, 80);
      cleanupFns.push(() => window.clearTimeout(refreshTimer));
    });

    return () => {
      cleanupFns.forEach((cleanup) => cleanup());
      ctx.revert();
    };
  }, [location.pathname]);

  return null;
}
