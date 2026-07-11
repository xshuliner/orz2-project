import { startLocalRum } from '@/utils/localRum';
import { useEffect } from 'react';

export function LocalPerformanceMonitor() {
  useEffect(() => startLocalRum(), []);
  return null;
}
