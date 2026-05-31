export interface HeroMedia {
  id: string;
  videoSrc: string;
  posterSrc: string;
  label: string;
}

export interface Tool {
  id: string;
  slug: string;
  name: string;
  icon: 'Braces' | 'ImageDown' | 'Palette' | 'Send';
  category: string;
  description: string;
  href?: string;
  status: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  ogImage: string;
  schemaType: 'SoftwareApplication';
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  logo: string;
  tags: string[];
  href?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  color: string;
  bio: string;
  avatarUrl: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  title: string;
}

export interface SeoConfig {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  keywords?: string[];
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}
