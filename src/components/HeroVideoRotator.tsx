import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { HeroMedia } from "../types";
import { prefersReducedMotion } from "../utils/motion";

interface HeroVideoRotatorProps {
  media: HeroMedia[];
}

function randomIndex(length: number, except?: number) {
  if (length <= 1) return 0;
  let next = Math.floor(Math.random() * length);
  while (next === except) {
    next = Math.floor(Math.random() * length);
  }
  return next;
}

export function HeroVideoRotator({ media }: HeroVideoRotatorProps) {
  const initialIndex = useMemo(() => randomIndex(media.length), [media.length]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeLayer, setActiveLayer] = useState(0);
  const [layers, setLayers] = useState([initialIndex, randomIndex(media.length, initialIndex)]);
  const [phase, setPhase] = useState<"fadeIn" | "visible" | "fadeOut">("fadeIn");
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const switchingRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setReducedMotion(prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setTimeout(() => setPhase("visible"), 1000);
    return () => window.clearTimeout(timer);
  }, [activeLayer, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const video = videoRefs.current[activeLayer];
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(() => undefined);
  }, [activeLayer, layers, reducedMotion]);

  const switchToNext = useCallback(() => {
    if (switchingRef.current || reducedMotion) return;
    switchingRef.current = true;
    setPhase("fadeOut");
    timeoutRef.current = window.setTimeout(() => {
      setLayers((current) => {
        const nextLayer = activeLayer === 0 ? 1 : 0;
        const nextMedia = randomIndex(media.length, current[activeLayer]);
        const updated = [...current];
        updated[nextLayer] = nextMedia;
        return updated;
      });
      setActiveLayer((layer) => (layer === 0 ? 1 : 0));
      setPhase("fadeIn");
      switchingRef.current = false;
    }, 1000);
  }, [activeLayer, media.length, reducedMotion]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  if (reducedMotion) {
    const current = media[initialIndex];
    return (
      <figure className="hero-video-frame static" aria-label="ORZ2 视频封面">
        <img src={current.posterSrc} alt={`${current.label} 视频封面`} />
      </figure>
    );
  }

  return (
    <figure className="hero-video-frame" aria-label="ORZ2 自动随机视频展示">
      <img className="hero-poster-fallback" src={media[layers[activeLayer]].posterSrc} alt="" aria-hidden="true" />
      {layers.map((mediaIndex, layerIndex) => {
        const item = media[mediaIndex];
        const isActive = layerIndex === activeLayer;
        const className = ["hero-video-layer", isActive ? "active" : "", isActive ? phase : ""].filter(Boolean).join(" ");

        return (
          <video
            key={`${layerIndex}-${item.id}`}
            ref={(element) => {
              videoRefs.current[layerIndex] = element;
            }}
            className={className}
            muted
            playsInline
            preload="metadata"
            poster={item.posterSrc}
            aria-label={`${item.label} 背景视频`}
            onTimeUpdate={(event) => {
              const video = event.currentTarget;
              if (!isActive || !Number.isFinite(video.duration)) return;
              if (video.duration - video.currentTime <= 1) switchToNext();
            }}
            onEnded={switchToNext}
          >
            <source src={item.videoSrc} type="video/mp4" />
          </video>
        );
      })}
      <div className="video-sweep" aria-hidden="true" />
    </figure>
  );
}
