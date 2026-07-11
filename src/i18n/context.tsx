import {
  defaultLocale,
  localeHtmlLang,
  locales,
  localizePath,
  parseLocalizedPath,
  switchLocaleInPath,
  type Locale,
} from '@/i18n/locale';
import { loadMessages, type Messages } from '@/i18n/messages';
import managerCache, { cacheKeys } from '@/utils/managerCache';
import { toSiteUrl } from '@/utils/siteUrl';
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
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

export const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const parsed = parseLocalizedPath(location.pathname);
  const locale = parsed.locale;
  const [loadedLocale, setLoadedLocale] = useState<Locale | null>(null);
  const [messages, setMessages] = useState<Messages | null>(null);

  useEffect(() => {
    let cancelled = false;

    void loadMessages(locale).then(localeMessages => {
      if (cancelled) return;
      setMessages(localeMessages);
      setLoadedLocale(locale);
    });

    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => {
    document.documentElement.lang = localeHtmlLang[locale];
    managerCache.setLocalStorage(cacheKeys.locale, locale);
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

  const value = useMemo<I18nContextValue | null>(() => {
    if (loadedLocale !== locale || !messages) return null;

    return {
      locale,
      localeName: messages.locale.names[locale] ?? defaultLocale,
      locales,
      messages,
      localizePath: toLocalizedPath,
      routeUrl: toRouteUrl,
      switchLocale,
    };
  }, [
    loadedLocale,
    locale,
    messages,
    switchLocale,
    toLocalizedPath,
    toRouteUrl,
  ]);

  if (!value) return null;

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
