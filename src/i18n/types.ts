import type { CatalogGroup } from '@/types/catalog';
import type { Testimonial } from '@/types/site';

export interface CatalogStageCopy {
  label: string;
  description: string;
}

export interface CatalogItemTranslation {
  name: string;
  group?: string;
  summary: string;
  badges: readonly string[];
  heroBadges?: Readonly<Record<string, string>>;
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
