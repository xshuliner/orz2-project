import { OButton } from '@/components/OButton';
import { siteConfig } from '@/config';
import { useI18n } from '@/i18n';
import { getHeroMedia } from '@/i18n/catalog';
import type { HeroMedia } from '@/types';
import { prefersReducedMotion } from '@/utils/motion';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import './index.css';

interface HeroVideoRotatorProps {
  media: HeroMedia[];
}

const CROSSFADE_MS = 1400;
const SWITCH_LEAD_SECONDS = 2.2;
const READY_WAIT_MS = 700;

function randomIndex(length: number, except?: number) {
  if (length <= 1) return 0;
  let next = Math.floor(Math.random() * length);
  while (next === except) {
    next = Math.floor(Math.random() * length);
  }
  return next;
}

function waitForVideoReady(video: HTMLVideoElement) {
  if (video.readyState >= 2) return Promise.resolve();

  return new Promise<void>(resolve => {
    let timeout: number | null = null;

    const finish = () => {
      video.removeEventListener('loadeddata', finish);
      video.removeEventListener('canplay', finish);
      if (timeout !== null) window.clearTimeout(timeout);
      resolve();
    };

    video.addEventListener('loadeddata', finish, { once: true });
    video.addEventListener('canplay', finish, { once: true });
    timeout = window.setTimeout(finish, READY_WAIT_MS);
    video.load();
  });
}

function SectionHeroVideo({ media }: HeroVideoRotatorProps) {
  const { messages } = useI18n();
  const heroCopy = messages.homeSections.hero;
  const initialIndex = 0;
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  const [shouldLoadVideos, setShouldLoadVideos] = useState(false);
  const [playbackAllowed, setPlaybackAllowed] = useState(true);
  const [activeLayer, setActiveLayer] = useState(0);
  const [layers, setLayers] = useState([
    initialIndex,
    randomIndex(media.length, initialIndex),
  ]);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const frameRef = useRef<HTMLElement | null>(null);
  const activeLayerRef = useRef(activeLayer);
  const playbackAllowedRef = useRef(playbackAllowed);
  const switchingRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const activeMediaIndex = layers[activeLayer] ?? 0;

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotionPreference = () => setReducedMotion(motionQuery.matches);
    motionQuery.addEventListener('change', syncMotionPreference);
    return () =>
      motionQuery.removeEventListener('change', syncMotionPreference);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    let idleId: number | null = null;
    let timeoutId: ReturnType<typeof globalThis.setTimeout> | null = null;
    const loadVideos = () => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(() => setShouldLoadVideos(true), {
          timeout: 1500,
        });
        return;
      }
      timeoutId = globalThis.setTimeout(() => setShouldLoadVideos(true), 500);
    };

    if (document.readyState === 'complete') {
      loadVideos();
    } else {
      window.addEventListener('load', loadVideos, { once: true });
    }

    return () => {
      window.removeEventListener('load', loadVideos);
      if (idleId !== null) window.cancelIdleCallback(idleId);
      if (timeoutId !== null) globalThis.clearTimeout(timeoutId);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    let isIntersecting = true;
    const syncPlayback = () => {
      const nextPlaybackAllowed =
        isIntersecting && document.visibilityState === 'visible';
      playbackAllowedRef.current = nextPlaybackAllowed;
      setPlaybackAllowed(nextPlaybackAllowed);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        syncPlayback();
      },
      { rootMargin: '120px 0px' }
    );

    observer.observe(frame);
    document.addEventListener('visibilitychange', syncPlayback);
    syncPlayback();

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
    };
  }, []);

  useEffect(() => {
    activeLayerRef.current = activeLayer;
  }, [activeLayer]);

  const switchToNext = useCallback(async () => {
    if (
      switchingRef.current ||
      reducedMotion ||
      !playbackAllowed ||
      media.length <= 1
    )
      return;
    switchingRef.current = true;

    const previousLayer = activeLayerRef.current;
    const nextLayer = previousLayer === 0 ? 1 : 0;
    const nextVideo = videoRefs.current[nextLayer];

    if (!nextVideo) {
      switchingRef.current = false;
      return;
    }

    nextVideo.currentTime = 0;

    await Promise.race([
      waitForVideoReady(nextVideo),
      new Promise(resolve => window.setTimeout(resolve, READY_WAIT_MS)),
    ]);

    if (!mountedRef.current || !playbackAllowedRef.current) {
      switchingRef.current = false;
      return;
    }

    nextVideo.play().catch(() => undefined);

    setActiveLayer(nextLayer);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setLayers(current => {
        const updated = [...current];
        updated[previousLayer] = randomIndex(media.length, current[nextLayer]);
        return updated;
      });
      switchingRef.current = false;
    }, CROSSFADE_MS);
  }, [media.length, playbackAllowed, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !playbackAllowed) {
      videoRefs.current.forEach(video => video?.pause());
      return;
    }

    const activeVideo = videoRefs.current[activeLayer];
    if (!activeVideo) return;

    const playActiveVideo = () => activeVideo.play().catch(() => undefined);
    const shouldSwitch = () => {
      if (switchingRef.current) return false;
      if (activeVideo.ended) return true;
      if (!Number.isFinite(activeVideo.duration)) return false;
      return (
        activeVideo.duration - activeVideo.currentTime <= SWITCH_LEAD_SECONDS
      );
    };
    const handleProgress = () => {
      if (shouldSwitch()) switchToNext();
    };

    activeVideo.currentTime = 0;
    playActiveVideo();

    activeVideo.addEventListener('timeupdate', handleProgress);
    activeVideo.addEventListener('ended', handleProgress);

    return () => {
      activeVideo.removeEventListener('timeupdate', handleProgress);
      activeVideo.removeEventListener('ended', handleProgress);
    };
  }, [
    activeLayer,
    activeMediaIndex,
    playbackAllowed,
    reducedMotion,
    switchToNext,
  ]);

  useEffect(() => {
    if (reducedMotion) return;
    const currentActiveLayer = activeLayerRef.current;
    videoRefs.current.forEach((video, layerIndex) => {
      if (!video || layerIndex === currentActiveLayer) return;
      video.load();
    });
  }, [layers, reducedMotion]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  if (reducedMotion) {
    const current = media[initialIndex];
    return (
      <figure
        className='hero-video-frame static'
        aria-label={heroCopy.videoFrameLabel}
      >
        <img
          src={current.posterSrc}
          alt={`${current.label} ${heroCopy.videoPosterAlt}`}
          {...{ fetchpriority: 'high' }}
        />
      </figure>
    );
  }

  return (
    <figure
      ref={frameRef}
      className={
        playbackAllowed ? 'hero-video-frame' : 'hero-video-frame is-paused'
      }
      aria-label={heroCopy.videoShowcaseLabel}
    >
      <img
        className='hero-poster-fallback'
        src={media[activeMediaIndex].posterSrc}
        alt=''
        aria-hidden='true'
        {...{ fetchpriority: 'high' }}
      />
      {shouldLoadVideos
        ? layers.map((mediaIndex, layerIndex) => {
            const item = media[mediaIndex];
            const isActive = layerIndex === activeLayer;
            const className = ['hero-video-layer', isActive ? 'active' : '']
              .filter(Boolean)
              .join(' ');

            return (
              <video
                key={`${layerIndex}-${item.id}`}
                ref={element => {
                  videoRefs.current[layerIndex] = element;
                }}
                className={className}
                muted
                playsInline
                autoPlay={isActive}
                preload={isActive ? 'auto' : 'metadata'}
                poster={item.posterSrc}
                aria-label={`${item.label} ${heroCopy.videoBackgroundLabel}`}
              >
                <source src={item.videoSrc} type='video/mp4' />
              </video>
            );
          })
        : null}
      <div className='video-sweep' aria-hidden='true' />
    </figure>
  );
}

export function SectionHero() {
  const { locale, messages } = useI18n();
  const heroCopy = messages.homeSections.hero;
  const heroMedia = getHeroMedia(locale);
  return (
    <section className='hero-section'>
      <div className='hero-copy'>
        <h1>{heroCopy.title}</h1>
        <p>{heroCopy.description}</p>
        <div className='hero-actions'>
          <OButton size='lg' to='/products'>
            {heroCopy.primaryCta}
            <ArrowRight size={18} aria-hidden='true' />
          </OButton>
          <OButton
            size='lg'
            href={`mailto:${siteConfig.contactEmail}`}
            variant='secondary'
          >
            {heroCopy.secondaryCta}
          </OButton>
        </div>
        <div className='hero-points' aria-label={heroCopy.highlightsAriaLabel}>
          {heroCopy.highlights.map((item, index) => (
            <span key={item.label}>
              {index === 0 ? (
                <Zap size={16} aria-hidden='true' />
              ) : (
                <ShieldCheck size={16} aria-hidden='true' />
              )}
              {item.label}
            </span>
          ))}
        </div>
      </div>
      <SectionHeroVideo media={heroMedia} />
    </section>
  );
}
