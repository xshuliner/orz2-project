import managerCache, { cacheKeys } from '@/utils/manager/cache';

export type DevicePerformanceTier = 'constrained' | 'standard' | 'capable';

type LocalRumMetrics = {
  cls?: number;
  inp?: number;
  lcp?: number;
  longTaskCount?: number;
  moduleLoadFailures?: number;
  moduleLoadTime?: number;
  navigationTime?: number;
};

export type LocalRumProfile = {
  deviceTier: DevicePerformanceTier;
  metrics: LocalRumMetrics;
  updatedAt: number;
  version: 1;
};

type NavigatorConnection = {
  effectiveType?: string;
  saveData?: boolean;
};

type PerformanceEntryWithInput = PerformanceEntry & {
  duration: number;
  hadRecentInput?: boolean;
  value?: number;
};

const profileMaxAge = 1000 * 60 * 60 * 24 * 14;

function isBrowser() {
  return typeof window !== 'undefined';
}

function readNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined;
}

function readMetrics(value: unknown): LocalRumMetrics | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const source = value as Record<string, unknown>;
  return {
    cls: readNumber(source.cls),
    inp: readNumber(source.inp),
    lcp: readNumber(source.lcp),
    longTaskCount: readNumber(source.longTaskCount),
    moduleLoadFailures: readNumber(source.moduleLoadFailures),
    moduleLoadTime: readNumber(source.moduleLoadTime),
    navigationTime: readNumber(source.navigationTime),
  };
}

function getConnection() {
  if (!isBrowser()) return undefined;
  return (navigator as Navigator & { connection?: NavigatorConnection })
    .connection;
}

function getCapabilityTier() {
  if (!isBrowser()) return 'constrained' as const;

  const connection = getConnection();
  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;
  const cores = navigator.hardwareConcurrency;
  const slowNetwork = ['slow-2g', '2g', '3g'].includes(
    connection?.effectiveType ?? ''
  );

  if (
    connection?.saveData ||
    slowNetwork ||
    cores <= 2 ||
    (memory !== undefined && memory <= 2)
  ) {
    return 'constrained' as const;
  }

  if (
    memory !== undefined &&
    memory >= 8 &&
    cores >= 8 &&
    connection?.effectiveType === '4g'
  ) {
    return 'capable' as const;
  }

  return 'standard' as const;
}

function hasPoorHistoricalPerformance(metrics: LocalRumMetrics) {
  return (
    (metrics.lcp !== undefined && metrics.lcp >= 4000) ||
    (metrics.inp !== undefined && metrics.inp >= 500) ||
    (metrics.longTaskCount !== undefined && metrics.longTaskCount >= 6) ||
    (metrics.moduleLoadFailures ?? 0) > 0
  );
}

export function getLocalRumProfile(): LocalRumProfile | undefined {
  if (!isBrowser()) return undefined;

  try {
    const parsed = managerCache.getLocalStorage<unknown>(cacheKeys.localRum);
    if (!parsed || typeof parsed !== 'object') return undefined;
    const source = parsed as Record<string, unknown>;
    const metrics = readMetrics(source.metrics);
    const updatedAt = readNumber(source.updatedAt);
    const deviceTier = source.deviceTier;

    if (
      source.version !== 1 ||
      !metrics ||
      !updatedAt ||
      Date.now() - updatedAt > profileMaxAge ||
      !['constrained', 'standard', 'capable'].includes(String(deviceTier))
    ) {
      return undefined;
    }

    return {
      deviceTier: deviceTier as DevicePerformanceTier,
      metrics,
      updatedAt,
      version: 1,
    };
  } catch {
    return undefined;
  }
}

export function getDevicePerformanceTier(): DevicePerformanceTier {
  const profile = getLocalRumProfile();
  if (profile && hasPoorHistoricalPerformance(profile.metrics)) {
    return 'constrained';
  }
  return profile?.deviceTier ?? getCapabilityTier();
}

function persistProfile(metrics: LocalRumMetrics) {
  if (!isBrowser()) return;

  const profile: LocalRumProfile = {
    deviceTier: hasPoorHistoricalPerformance(metrics)
      ? 'constrained'
      : getCapabilityTier(),
    metrics,
    updatedAt: Date.now(),
    version: 1,
  };

  try {
    managerCache.setLocalStorage(cacheKeys.localRum, profile);
  } catch {
    // Private browsing and storage quotas must not affect page loading.
  }
}

export function startLocalRum() {
  if (!isBrowser() || !('PerformanceObserver' in window))
    return () => undefined;

  const metrics: LocalRumMetrics = {};
  const observers: PerformanceObserver[] = [];
  const navigation = performance.getEntriesByType('navigation')[0];
  if (navigation) metrics.navigationTime = Math.round(navigation.duration);

  function observe(
    type: string,
    handleEntries: (entries: PerformanceEntry[]) => void
  ) {
    try {
      const observer = new PerformanceObserver(list =>
        handleEntries(list.getEntries())
      );
      observer.observe({ type, buffered: true });
      observers.push(observer);
    } catch {
      // Unsupported performance entry types are expected on older browsers.
    }
  }

  observe('largest-contentful-paint', entries => {
    const entry = entries[entries.length - 1];
    if (entry) metrics.lcp = Math.round(entry.startTime);
  });
  observe('layout-shift', entries => {
    metrics.cls =
      (metrics.cls ?? 0) +
      entries.reduce((total, entry) => {
        const layoutShift = entry as PerformanceEntryWithInput;
        return layoutShift.hadRecentInput
          ? total
          : total + (layoutShift.value ?? 0);
      }, 0);
  });
  observe('event', entries => {
    const maxDuration = Math.max(
      metrics.inp ?? 0,
      ...entries.map(
        entry => (entry as PerformanceEntryWithInput).duration ?? 0
      )
    );
    if (maxDuration > 0) metrics.inp = Math.round(maxDuration);
  });
  observe('longtask', entries => {
    metrics.longTaskCount = (metrics.longTaskCount ?? 0) + entries.length;
  });

  const persist = () => persistProfile(metrics);
  window.addEventListener('pagehide', persist, { once: true });

  return () => {
    observers.forEach(observer => observer.disconnect());
    window.removeEventListener('pagehide', persist);
    persist();
  };
}

export function recordModuleLoad(duration: number) {
  const profile = getLocalRumProfile();
  persistProfile({
    ...profile?.metrics,
    moduleLoadTime: Math.round(duration),
  });
}

export function recordModuleLoadFailure() {
  const profile = getLocalRumProfile();
  persistProfile({
    ...profile?.metrics,
    moduleLoadFailures: (profile?.metrics.moduleLoadFailures ?? 0) + 1,
  });
}
