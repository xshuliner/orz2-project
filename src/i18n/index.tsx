import {
  defaultLocale,
  getMessages,
  localeHtmlLang,
  localeNames,
  locales,
  type Locale,
  type Messages,
} from '@/i18n/messages';
import {
  localizePath,
  parseLocalizedPath,
  switchLocaleInPath,
} from '@/i18n/routes';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface I18nContextValue {
  locale: Locale;
  localeName: string;
  locales: readonly Locale[];
  messages: Messages;
  localizePath: (to: string) => string;
  switchLocale: (locale: Locale) => void;
}

const localeStorageKey = 'orz2:locale';
const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const parsed = parseLocalizedPath(location.pathname);
  const locale = parsed.locale;

  useEffect(() => {
    document.documentElement.lang = localeHtmlLang[locale];
    window.localStorage.setItem(localeStorageKey, locale);
  }, [locale]);

  const toLocalizedPath = useCallback(
    (to: string) => localizePath(to, locale),
    [locale]
  );

  const switchLocale = useCallback(
    (nextLocale: Locale) => {
      if (nextLocale === locale) return;
      navigate(
        switchLocaleInPath(
          location.pathname,
          location.search,
          location.hash,
          nextLocale
        )
      );
    },
    [locale, location.hash, location.pathname, location.search, navigate]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      localeName: localeNames[locale] ?? localeNames[defaultLocale],
      locales,
      messages: getMessages(locale),
      localizePath: toLocalizedPath,
      switchLocale,
    }),
    [locale, switchLocale, toLocalizedPath]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider');
  }
  return context;
}

export { defaultLocale, locales, localizePath };
export type { Locale };
