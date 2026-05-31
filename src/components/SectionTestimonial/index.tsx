import { testimonials } from '@/config/site';
import { prefersReducedMotion } from '@/utils/motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMemo, useRef } from 'react';
import './index.css';

gsap.registerPlugin(ScrollTrigger);

const MAX_VISIBLE_ITEMS = 8;
const MIN_CYCLE_DURATION_SECONDS = 12.5;
const MAX_CYCLE_DURATION_SECONDS = 20;
const TOP_BANDS = [
  [7, 15],
  [16, 27],
  [28, 39],
  [40, 48],
] as const;
const BOTTOM_BANDS = [
  [52, 60],
  [61, 72],
  [73, 84],
  [85, 96],
] as const;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createBalancedTopPercents(totalItems: number) {
  const positions: number[] = [];
  const halfHistory: Array<'top' | 'bottom'> = [];
  const bandUsage = new Map<number, number>();
  const recentWindow = MAX_VISIBLE_ITEMS;

  for (let i = 0; i < totalItems; i += 1) {
    const recentHalves = halfHistory.slice(-recentWindow);
    const recentTopCount = recentHalves.filter(half => half === 'top').length;
    const recentBottomCount = recentHalves.length - recentTopCount;
    const targetHalf =
      recentTopCount === recentBottomCount
        ? i % 2 === 0
          ? 'top'
          : 'bottom'
        : recentTopCount < recentBottomCount
          ? 'top'
          : 'bottom';
    const bands = targetHalf === 'top' ? TOP_BANDS : BOTTOM_BANDS;
    const bandStartIndex = targetHalf === 'top' ? 0 : TOP_BANDS.length;
    const lowestUsage = Math.min(
      ...bands.map(
        (_, bandIndex) => bandUsage.get(bandStartIndex + bandIndex) ?? 0
      )
    );
    const candidateBands = bands
      .map((band, bandIndex) => ({
        band,
        globalIndex: bandStartIndex + bandIndex,
      }))
      .filter(
        ({ globalIndex }) => (bandUsage.get(globalIndex) ?? 0) === lowestUsage
      );
    const selected =
      candidateBands[Math.floor(randomBetween(0, candidateBands.length))];

    bandUsage.set(
      selected.globalIndex,
      (bandUsage.get(selected.globalIndex) ?? 0) + 1
    );
    halfHistory.push(targetHalf);
    positions.push(randomBetween(selected.band[0], selected.band[1]));
  }

  return positions;
}

interface DanmakuItemProps {
  quote: string;
  name: string;
  title: string;
  delay: number;
  fontSize: number;
  opacity: number;
  topPercent: number;
  index: number;
}

function DanmakuItem({
  quote,
  name,
  title,
  delay,
  fontSize,
  opacity,
  topPercent,
  index,
}: DanmakuItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      if (!itemRef.current) return;

      const el = itemRef.current;
      const container = el.closest<HTMLElement>('.danmaku-container');
      if (prefersReducedMotion()) {
        gsap.set(el, { x: 0, yPercent: -50, opacity });
        return;
      }

      const containerWidth = container?.clientWidth ?? window.innerWidth;
      const itemWidth = el.scrollWidth;
      const cycleDuration = Math.min(
        MAX_CYCLE_DURATION_SECONDS,
        Math.max(MIN_CYCLE_DURATION_SECONDS, containerWidth / 75 + 5)
      );
      const startX = containerWidth - 8;
      const endX = -itemWidth - 40;
      let startCall: gsap.core.Tween | null = null;

      gsap.set(el, { x: startX, yPercent: -50, opacity: 0, zIndex: 1 });

      const tween = gsap.to(el, {
        id: 'danmaku-tween-' + index,
        x: endX,
        duration: cycleDuration,
        ease: 'none',
        paused: true,
        repeat: -1,
        onStart: () => {
          gsap.to(el, { opacity, duration: 0.45, ease: 'power2.out' });
        },
      });
      tweenRef.current = tween;

      const revealTrigger = container
        ? ScrollTrigger.create({
            trigger: container,
            start: 'top 84%',
            once: true,
            onEnter: () => {
              startCall = gsap.delayedCall(delay, () => tween.play(0));
            },
          })
        : null;

      return () => {
        startCall?.kill();
        tween.kill();
        revealTrigger?.kill();
      };
    },
    { dependencies: [delay, index, opacity], scope: itemRef }
  );

  const handleMouseEnter = () => {
    tweenRef.current?.pause();
    if (itemRef.current) {
      gsap.to(itemRef.current, {
        opacity: 1,
        scale: 1.03,
        zIndex: 20,
        duration: 0.2,
      });
    }
  };

  const handleMouseLeave = () => {
    tweenRef.current?.play();
    if (itemRef.current) {
      gsap.to(itemRef.current, { opacity, scale: 1, zIndex: 1, duration: 0.2 });
    }
  };

  return (
    <div
      ref={itemRef}
      className='danmaku-item'
      style={{ fontSize, opacity: 0, top: `${topPercent}%` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className='danmaku-text'>{quote}</span>
      <span className='danmaku-author'>
        —— {name} · {title}
      </span>
    </div>
  );
}

export function SectionTestimonial() {
  const containerRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => {
    const topPercents = createBalancedTopPercents(MAX_VISIBLE_ITEMS);
    const cycleDuration = MAX_CYCLE_DURATION_SECONDS;
    const spawnInterval = cycleDuration / MAX_VISIBLE_ITEMS;

    return Array.from({ length: MAX_VISIBLE_ITEMS }, (_, i) => {
      const testimonial = testimonials[i % testimonials.length];
      return {
        ...testimonial,
        delay: i * spawnInterval,
        fontSize: randomBetween(13, 17),
        opacity: randomBetween(0.5, 0.85),
        topPercent: topPercents[i],
        index: i,
      };
    });
  }, []);

  return (
    <div className='danmaku-container' ref={containerRef} aria-hidden='true'>
      {items.map(item => (
        <DanmakuItem key={`${item.name}-${item.index}`} {...item} />
      ))}
    </div>
  );
}
