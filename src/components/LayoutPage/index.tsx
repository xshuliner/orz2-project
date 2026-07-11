import { OPageHero } from '@/components/OPageHero';
import { Seo } from '@/components/Seo';
import { getToolSeo } from '@/config/seo';
import { useI18n } from '@/hooks/useI18n';
import { getTools } from '@/i18n';
import type { ToolHeroBadgeIconName } from '@/types/catalog';
import type { SeoConfig } from '@/types/seo';
import {
  ArrowLeft,
  Braces,
  CalendarClock,
  CheckCircle2,
  Clipboard,
  Download,
  Eye,
  FileText,
  Globe2,
  Images,
  Maximize2,
  Palette,
  QrCode,
  Send,
  Sparkles,
  Wand2,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './index.css';

const heroBadgeIconMap: Record<ToolHeroBadgeIconName, LucideIcon> = {
  Braces,
  CalendarClock,
  CheckCircle2,
  Clipboard,
  Download,
  Eye,
  FileText,
  Globe2,
  Images,
  Maximize2,
  Palette,
  QrCode,
  Send,
  Sparkles,
  Wand2,
  Workflow,
};

interface LayoutPageProps {
  backLink?: false | { label: ReactNode; to: string };
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  description?: ReactNode;
  heroSlot?: ReactNode;
  icon?: LucideIcon;
  seoConfig?: SeoConfig;
  seoKey?: keyof ReturnType<typeof getToolSeo>;
  title?: ReactNode;
  topbarSlot?: ReactNode;
  toolId?: string;
}

export function LayoutPage({
  backLink,
  children,
  className,
  contentClassName,
  description,
  heroSlot,
  icon: Icon = Sparkles,
  seoConfig,
  seoKey,
  title,
  toolId,
  topbarSlot,
}: LayoutPageProps) {
  const { locale, localizePath, messages } = useI18n();
  const tool = useMemo(
    () => getTools(locale).find(item => item.id === toolId),
    [locale, toolId]
  );
  const seo = useMemo(() => getToolSeo(locale), [locale]);
  const resolvedSeo = seoConfig ?? (seoKey ? seo[seoKey] : undefined);
  const resolvedBackLink =
    backLink === undefined && toolId
      ? { label: messages.utilityTool.backToTools, to: localizePath('/tools') }
      : backLink;

  return (
    <>
      {resolvedSeo ? <Seo config={resolvedSeo} /> : null}
      <section className={['layout-page', className].filter(Boolean).join(' ')}>
        {resolvedBackLink || topbarSlot ? (
          <div className='layout-page__topbar'>
            {resolvedBackLink ? (
              <Link
                className='layout-page__back-link interactive'
                to={resolvedBackLink.to}
              >
                <ArrowLeft size={16} aria-hidden='true' />
                {resolvedBackLink.label}
              </Link>
            ) : null}
            {topbarSlot}
          </div>
        ) : null}
        <OPageHero
          className='layout-page__hero'
          description={description ?? tool?.summary}
          title={title ?? tool?.name ?? String(seoKey ?? '')}
        >
          {tool?.heroBadges?.length ? (
            <div className='layout-page__badges'>
              {tool.heroBadges.map(badge => {
                const BadgeIcon = heroBadgeIconMap[badge.icon] ?? Icon;
                return (
                  <span className='layout-page__badge' key={badge.id}>
                    <BadgeIcon size={16} aria-hidden='true' />
                    {badge.label}
                  </span>
                );
              })}
            </div>
          ) : null}
          {heroSlot}
        </OPageHero>
        <div
          className={['layout-page__content', contentClassName]
            .filter(Boolean)
            .join(' ')}
        >
          {children}
        </div>
      </section>
    </>
  );
}
