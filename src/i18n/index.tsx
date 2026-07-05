import productsData from '@/config/products';
import toolsData from '@/config/tools';
import { messages as enMessages } from '@/i18n/locales/en';
import { messages as jaMessages } from '@/i18n/locales/ja';
import { messages as zhCNMessages } from '@/i18n/locales/zh-CN';
import type { CatalogGroup, CatalogItem } from '@/types/catalog';
import type { HeroMedia, TeamMember, Testimonial } from '@/types/site';
import { toSiteUrl } from '@/utils/siteUrl';
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

export interface CatalogItemTranslation {
  name?: string;
  group?: string;
  summary?: string;
  badges?: readonly string[];
  entries?: Readonly<Record<string, string>>;
  mediaAlt?: string;
  seo?: {
    title: string;
    description: string;
    keywords?: readonly string[];
  };
}

export type CatalogTeamMemberProfile = readonly [
  name: string,
  role: string,
  bio: string,
];

export interface CatalogLocaleCatalog {
  groupTranslations: Readonly<Record<string, string>>;
  tools: Readonly<Record<string, CatalogItemTranslation>>;
  products: Readonly<Record<string, CatalogItemTranslation>>;
  toolGroups: readonly CatalogGroup[];
  productGroups: readonly CatalogGroup[];
  heroMediaLabels: readonly string[];
  testimonials: readonly Testimonial[];
  teamMemberProfiles: readonly CatalogTeamMemberProfile[];
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

// ---------- catalog 本地化 ----------

const heroBase = 'https://cos.orz2.online/Orz2/Hero';
const baseTools: CatalogItem[] = toolsData;
const baseProducts: CatalogItem[] = productsData;
const heroMediaIds = [
  'shuxiaolan',
  'shuxiaolv',
  'shuxiaozi',
  'shuxiaohong',
  'shuxiaohuang',
  'shuxiaocheng',
];
const teamAvatarIds = heroMediaIds;
const teamMemberIds = ['lan', 'lv', 'zi', 'hong', 'huang', 'cheng'];
const teamMemberColors = [
  '#3b82f6',
  '#16a34a',
  '#8b5cf6',
  '#ef4444',
  '#eab308',
  '#f97316',
];

function getCatalog(locale: Locale): CatalogLocaleCatalog {
  return messages[locale].catalog;
}

function toCatalogGroup(group: CatalogGroup): CatalogGroup {
  return {
    name: group.name,
    description: group.description,
  };
}

function localizeCatalogItem(
  item: CatalogItem,
  catalog: CatalogLocaleCatalog,
  translations: Readonly<Record<string, CatalogItemTranslation>>
): CatalogItem {
  const translation = translations[item.id] ?? {};
  return {
    ...item,
    name: translation.name ?? item.name,
    group:
      translation.group ?? catalog.groupTranslations[item.group] ?? item.group,
    summary: translation.summary ?? item.summary,
    media:
      item.media.kind === 'image'
        ? { ...item.media, alt: translation.mediaAlt ?? item.media.alt }
        : item.media,
    badges: translation.badges ? [...translation.badges] : item.badges,
    entries: item.entries.map(entry => ({
      ...entry,
      label: translation.entries?.[entry.id] ?? entry.label,
    })),
    seo: translation.seo
      ? {
          ...item.seo,
          title: translation.seo.title,
          description: translation.seo.description,
          keywords: translation.seo.keywords
            ? [...translation.seo.keywords]
            : undefined,
        }
      : item.seo,
  };
}

export function getTools(locale: Locale) {
  const catalog = getCatalog(locale);
  return baseTools.map(tool =>
    localizeCatalogItem(tool, catalog, catalog.tools)
  );
}

export function getProducts(locale: Locale) {
  const catalog = getCatalog(locale);
  return baseProducts.map(product =>
    localizeCatalogItem(product, catalog, catalog.products)
  );
}

export function getToolGroups(locale: Locale): CatalogGroup[] {
  return getCatalog(locale).toolGroups.map(toCatalogGroup);
}

export function getProductGroups(locale: Locale): CatalogGroup[] {
  return getCatalog(locale).productGroups.map(toCatalogGroup);
}

export function getToolCategories(locale: Locale, allLabel: string) {
  return [
    allLabel,
    ...Array.from(new Set(getTools(locale).map(tool => tool.group))),
  ];
}

export function getHeroMedia(locale: Locale): HeroMedia[] {
  const { heroMediaLabels } = getCatalog(locale);
  return heroMediaIds.map((id, index) => ({
    id,
    label: heroMediaLabels[index],
    videoSrc: `${heroBase}/hero_video_${id}.mp4`,
    posterSrc: `${heroBase}/hero_poster_${id}.webp`,
  }));
}

export function getTestimonials(locale: Locale): Testimonial[] {
  return getCatalog(locale).testimonials.map(testimonial => ({
    ...testimonial,
  }));
}

export function getTeamMembers(locale: Locale): TeamMember[] {
  return getCatalog(locale).teamMemberProfiles.map(
    ([name, role, bio], index) => ({
      id: teamMemberIds[index],
      name,
      role,
      bio,
      color: teamMemberColors[index],
      avatarUrl: `${heroBase}/hero_poster_${teamAvatarIds[index]}.webp`,
    })
  );
}

// ---------- React Context ----------

interface I18nContextValue {
  locale: Locale;
  localeName: string;
  locales: readonly Locale[];
  messages: Messages;
  localizePath: (to: string) => string;
  routeUrl: (to: string) => string;
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

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider');
  }
  return context;
}
