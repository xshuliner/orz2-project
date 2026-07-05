import type { Locale } from '@/i18n';

export interface SeoConfig {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  keywords?: string[];
  locale?: Locale;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  robots?: string;
}
