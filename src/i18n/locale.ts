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
  Object.fromEntries(
    locales.map(locale => [locale, localeMeta[locale][key]])
  ) as Record<Locale, (typeof localeMeta)[Locale][K]>;

export const localePrefixes = project('prefix');
export const localeHtmlLang = project('html');
export const localeNames = project('name');
export const localeShortNames = project('short');
export const localeOpenGraph = project('openGraph');

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
