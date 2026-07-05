import {
  defaultLocale,
  localeHtmlLang,
  localeNames,
  locales,
  localizePath,
  parseLocalizedPath,
  switchLocaleInPath,
  type Locale,
} from '@/i18n/locale';
import { getMessages, type Messages } from '@/i18n/messages';
import { toSiteUrl } from '@/utils/siteUrl';
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export interface I18nContextValue {
  locale: Locale;
  localeName: string;
  locales: readonly Locale[];
  messages: Messages;
  localizePath: (to: string) => string;
  routeUrl: (to: string) => string;
  switchLocale: (locale: Locale) => void;
}

const localeStorageKey = 'orz2:locale';

export const I18nContext = createContext<I18nContextValue | null>(null);

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
  const toRouteUrl = useCallback(
    (to: string) => toSiteUrl(localizePath(to, locale)),
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
      routeUrl: toRouteUrl,
      switchLocale,
    }),
    [locale, switchLocale, toLocalizedPath, toRouteUrl]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
