import type { HeroMedia } from '@/types';
import { prefersReducedMotion } from '@/utils/motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

export function SectionHeroVideo({ media }: HeroVideoRotatorProps) {
  const initialIndex = useMemo(() => randomIndex(media.length), [media.length]);
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  const [activeLayer, setActiveLayer] = useState(0);
  const [layers, setLayers] = useState([
    initialIndex,
    randomIndex(media.length, initialIndex),
  ]);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const activeLayerRef = useRef(activeLayer);
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
    activeLayerRef.current = activeLayer;
  }, [activeLayer]);

  const switchToNext = useCallback(async () => {
    if (switchingRef.current || reducedMotion || media.length <= 1) return;
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

    if (!mountedRef.current) {
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
  }, [media.length, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;

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
    activeVideo.addEventListener('pause', handleProgress);

    const progressTimer = window.setInterval(handleProgress, 500);

    return () => {
      activeVideo.removeEventListener('timeupdate', handleProgress);
      activeVideo.removeEventListener('ended', handleProgress);
      activeVideo.removeEventListener('pause', handleProgress);
      window.clearInterval(progressTimer);
    };
  }, [activeLayer, activeMediaIndex, reducedMotion, switchToNext]);

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
      <figure className='hero-video-frame static' aria-label='ORZ2 视频封面'>
        <img src={current.posterSrc} alt={`${current.label} 视频封面`} />
      </figure>
    );
  }

  return (
    <figure className='hero-video-frame' aria-label='ORZ2 自动随机视频展示'>
      <img
        className='hero-poster-fallback'
        src={media[activeMediaIndex].posterSrc}
        alt=''
        aria-hidden='true'
      />
      {layers.map((mediaIndex, layerIndex) => {
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
            aria-label={`${item.label} 背景视频`}
          >
            <source src={item.videoSrc} type='video/mp4' />
          </video>
        );
      })}
      <div className='video-sweep' aria-hidden='true' />
    </figure>
  );
}
