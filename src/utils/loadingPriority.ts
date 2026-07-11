import {
  getDevicePerformanceTier,
  recordModuleLoad,
  recordModuleLoadFailure,
} from '@/utils/localRum';
import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

export type LoadPriority =
  | 'critical'
  | 'navigation'
  | 'visible'
  | 'idle'
  | 'interaction';

type ModuleLoader<T extends ComponentType<any>> = () => Promise<{ default: T }>;

type PriorityModule<T extends ComponentType<any>> = {
  Component: LazyExoticComponent<T>;
  load: () => Promise<{ default: T }>;
  priority: LoadPriority;
};

type IdleCallbackWindow = Window & {
  cancelIdleCallback?: (handle: number) => void;
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number }
  ) => number;
};

const navigationModules = new Map<string, () => Promise<unknown>>();

function canPrefetchNavigation() {
  if (typeof navigator === 'undefined') return false;
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  return !connection?.saveData && getDevicePerformanceTier() !== 'constrained';
}

export function createPriorityModule<T extends ComponentType<any>>(
  loader: ModuleLoader<T>,
  priority: LoadPriority
): PriorityModule<T> {
  let loading: Promise<{ default: T }> | undefined;

  function load() {
    if (loading) return loading;

    const start = typeof performance === 'undefined' ? 0 : performance.now();
    loading = loader()
      .then(module => {
        if (start) recordModuleLoad(performance.now() - start);
        return module;
      })
      .catch(error => {
        loading = undefined;
        recordModuleLoadFailure();
        throw error;
      });
    return loading;
  }

  return { Component: lazy(load), load, priority };
}

export function lazyWithPriority<T extends ComponentType<any>>(
  loader: ModuleLoader<T>,
  priority: LoadPriority = 'navigation'
) {
  return createPriorityModule(loader, priority).Component;
}

export function lazyNavigationRoute<T extends ComponentType<any>>(
  path: string,
  loader: ModuleLoader<T>
) {
  const module = createPriorityModule(loader, 'navigation');
  registerNavigationModule(path, module.load);
  return module.Component;
}

export function registerNavigationModule(
  path: string,
  load: () => Promise<unknown>
) {
  navigationModules.set(path, load);
}

export function preloadNavigationPath(path: string) {
  if (!canPrefetchNavigation()) return;
  void navigationModules.get(path)?.();
}

export function scheduleIdleModule(load: () => Promise<unknown>) {
  if (getDevicePerformanceTier() === 'constrained') return () => undefined;

  const idleWindow = window as IdleCallbackWindow;
  if (idleWindow.requestIdleCallback) {
    const handle = idleWindow.requestIdleCallback(() => void load(), {
      timeout: 3000,
    });
    return () => idleWindow.cancelIdleCallback?.(handle);
  }

  const timeout = window.setTimeout(() => void load(), 1500);
  return () => window.clearTimeout(timeout);
}
