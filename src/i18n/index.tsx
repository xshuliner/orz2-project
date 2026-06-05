import { messages as enMessages } from '@/i18n/locales/en';
import { messages as jaMessages } from '@/i18n/locales/ja';
import { messages as zhCNMessages } from '@/i18n/locales/zh-CN';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// ---------- 共享类型 ----------

export interface CatalogStageCopy {
  label: string;
  description: string;
}

// ---------- locale 元数据 ----------

const localeMeta = {
  'zh-CN': {
    prefix: '',
    html: 'zh-CN',
    name: '中文',
    short: '中',
    openGraph: 'zh_CN',
  },
  en: {
    prefix: 'en',
    html: 'en',
    name: 'English',
    short: 'EN',
    openGraph: 'en_US',
  },
  ja: {
    prefix: 'ja',
    html: 'ja',
    name: '日本語',
    short: '日',
    openGraph: 'ja_JP',
  },
} as const;

export const locales = Object.keys(localeMeta) as Array<
  keyof typeof localeMeta
>;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'zh-CN';

const project = <K extends keyof (typeof localeMeta)[Locale]>(
  key: K
): Record<Locale, (typeof localeMeta)[Locale][K]> =>
  Object.fromEntries(locales.map(l => [l, localeMeta[l][key]])) as Record<
    Locale,
    (typeof localeMeta)[Locale][K]
  >;

export const localePrefixes = project('prefix');
export const localeHtmlLang = project('html');
export const localeNames = project('name');
export const localeShortNames = project('short');
export const localeOpenGraph = project('openGraph');

// ---------- 路由本地化 ----------

const prefixedLocales = locales.filter(locale => locale !== defaultLocale);

function splitPath(pathname: string) {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const [first = '', ...rest] = normalized.split('/').filter(Boolean);
  return { first, rest, normalized };
}

export function localeFromPrefix(prefix: string | undefined): Locale | null {
  if (!prefix) return defaultLocale;
  const match = locales.find(locale => localePrefixes[locale] === prefix);
  return match ?? null;
}

export function parseLocalizedPath(pathname: string): {
  locale: Locale;
  path: string;
  prefix: string;
} {
  const { first, rest, normalized } = splitPath(pathname);
  const matchedLocale = localeFromPrefix(first);

  if (matchedLocale && matchedLocale !== defaultLocale) {
    return {
      locale: matchedLocale,
      path: rest.length ? `/${rest.join('/')}` : '/',
      prefix: first,
    };
  }

  return {
    locale: defaultLocale,
    path: normalized,
    prefix: '',
  };
}

export function stripLocalePrefix(pathname: string) {
  return parseLocalizedPath(pathname).path;
}

export function localizePath(to: string, locale: Locale) {
  if (!to || to.startsWith('http') || to.startsWith('mailto:')) return to;
  if (to.startsWith('#')) return to;

  const [pathWithMaybeQuery, hash = ''] = to.split('#');
  const [pathname = '/', query = ''] = pathWithMaybeQuery.split('?');
  const basePath = stripLocalePrefix(pathname || '/');
  const prefix = localePrefixes[locale];
  const localizedPath =
    prefix && basePath !== '/'
      ? `/${prefix}${basePath}`
      : prefix
        ? `/${prefix}`
        : basePath;
  const search = query ? `?${query}` : '';
  const hashPart = hash ? `#${hash}` : '';
  return `${localizedPath}${search}${hashPart}`;
}

export function switchLocaleInPath(
  pathname: string,
  search: string,
  hash: string,
  locale: Locale
) {
  const basePath = stripLocalePrefix(pathname);
  return `${localizePath(basePath, locale)}${search}${hash}`;
}

export function isPrefixedLocalePath(pathname: string) {
  const { first } = splitPath(pathname);
  return prefixedLocales.some(locale => localePrefixes[locale] === first);
}

export function isInvalidLocaleLikePrefix(prefix: string | undefined) {
  if (!prefix) return false;
  if (localeFromPrefix(prefix)) return false;
  return /^[a-z]{2}(-[A-Z]{2})?$/.test(prefix);
}

// ---------- 字典聚合 ----------

export const messages = {
  'zh-CN': zhCNMessages,
  en: enMessages,
  ja: jaMessages,
} as const;

export type Messages = (typeof messages)[Locale];

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

export function getMessages(locale: Locale) {
  return messages[locale];
}

// ---------- React Context ----------

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
