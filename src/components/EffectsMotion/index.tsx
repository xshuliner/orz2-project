import { useEffect } from 'react';
// This import must stay eager: reveal targets need their initial state before
// the browser's first paint, otherwise visible content flashes and re-enters.
import { GlobalEffectsMotion } from './GlobalEffectsMotion';

export function EffectsMotion() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('.site-header');
    if (!header) return;

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

    return () => {
      window.removeEventListener('scroll', queueHeaderSync);
      if (syncHeaderFrame !== null)
        window.cancelAnimationFrame(syncHeaderFrame);
    };
  }, []);

  return <GlobalEffectsMotion />;
}
