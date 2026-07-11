import CacheManager, { cacheKeys } from '@/utils/CacheManager';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  cycleTheme: () => void;
}

export const themeStorageKey = cacheKeys.themePreference;
const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === 'system' ? getSystemTheme() : preference;
}

function readInitialPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  const stored = CacheManager.getLocalStorage<ThemePreference>(themeStorageKey);
  return isThemePreference(stored) ? stored : 'system';
}

function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  const themeColor = theme === 'dark' ? '#0d120f' : '#ffffff';
  let themeColorMeta = document.head.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]'
  );
  if (!themeColorMeta) {
    themeColorMeta = document.createElement('meta');
    themeColorMeta.name = 'theme-color';
    document.head.appendChild(themeColorMeta);
  }
  themeColorMeta.content = themeColor;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(
    readInitialPreference
  );
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(readInitialPreference())
  );

  useEffect(() => {
    const sync = () => {
      const nextResolved = resolveTheme(preference);
      setResolvedTheme(nextResolved);
      applyTheme(nextResolved);
    };

    sync();
    if (preference !== 'system') return;

    const query = window.matchMedia('(prefers-color-scheme: dark)');
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, [preference]);

  const setPreference = useCallback((nextPreference: ThemePreference) => {
    setPreferenceState(nextPreference);
    CacheManager.setLocalStorage(themeStorageKey, nextPreference);
  }, []);

  const cycleTheme = useCallback(() => {
    setPreferenceState(current => {
      const next =
        current === 'system'
          ? 'light'
          : current === 'light'
            ? 'dark'
            : 'system';
      CacheManager.setLocalStorage(themeStorageKey, next);
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ preference, resolvedTheme, setPreference, cycleTheme }),
    [cycleTheme, preference, resolvedTheme, setPreference]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
}
