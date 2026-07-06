import productsData from '@/config/products';
import toolsData from '@/config/tools';
import type { Locale } from '@/i18n/locale';
import { getMessages } from '@/i18n/messages';
import type {
  CatalogItemTranslation,
  CatalogLocaleCatalog,
} from '@/i18n/types';
import type {
  CatalogBaseItem,
  CatalogGroup,
  CatalogItem,
} from '@/types/catalog';
import type { HeroMedia, TeamMember, Testimonial } from '@/types/site';

const heroBase = 'https://cos.orz2.online/Orz2/Hero';
const baseTools: CatalogBaseItem[] = toolsData;
const baseProducts: CatalogBaseItem[] = productsData;
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
  return getMessages(locale).catalog;
}

function toCatalogGroup(group: CatalogGroup): CatalogGroup {
  return {
    name: group.name,
    description: group.description,
  };
}

function localizeCatalogItem(
  item: CatalogBaseItem,
  catalog: CatalogLocaleCatalog,
  translations: Readonly<Record<string, CatalogItemTranslation>>
): CatalogItem {
  const translation = translations[item.id];
  if (!translation) {
    throw new Error(`Missing catalog i18n mapping for "${item.id}".`);
  }
  if (!translation.name || !translation.summary || !translation.badges) {
    throw new Error(`Incomplete catalog i18n mapping for "${item.id}".`);
  }
  if (item.seo && !translation.seo) {
    throw new Error(`Missing catalog SEO i18n mapping for "${item.id}".`);
  }
  const group = catalog.groupTranslations[item.group];
  if (!group) {
    throw new Error(`Missing catalog group i18n mapping for "${item.group}".`);
  }

  return {
    ...item,
    name: translation.name,
    group: translation.group ?? group,
    summary: translation.summary,
    media:
      item.media.kind === 'image'
        ? { ...item.media, alt: translation.mediaAlt ?? translation.name }
        : item.media,
    badges: [...translation.badges],
    entries: item.entries.map(entry => {
      const label = translation.entries?.[entry.id];
      if (!label) {
        throw new Error(
          `Missing catalog entry i18n mapping for "${item.id}.${entry.id}".`
        );
      }

      return {
        ...entry,
        label,
      };
    }),
    seo: item.seo
      ? {
          ...item.seo,
          title: translation.seo!.title,
          description: translation.seo!.description,
          keywords: translation.seo!.keywords
            ? [...translation.seo!.keywords]
            : undefined,
        }
      : undefined,
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
