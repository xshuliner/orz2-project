import { OPageHero } from '@/components/OPageHero';
import { Seo } from '@/components/Seo';
import { getToolSeo } from '@/config/seo';
import { useI18n } from '@/hooks/useI18n';
import { getTools } from '@/i18n';
import type { ToolHeroBadgeIconName } from '@/types/catalog';
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

interface LayoutToolPageProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  heroSlot?: ReactNode;
  icon: LucideIcon;
  seoKey: keyof ReturnType<typeof getToolSeo>;
  toolId: string;
  topbarSlot?: ReactNode;
}

export function LayoutToolPage({
  children,
  className,
  contentClassName,
  heroSlot,
  icon: Icon,
  seoKey,
  toolId,
  topbarSlot,
}: LayoutToolPageProps) {
  const { locale, localizePath, messages } = useI18n();
  const tool = useMemo(
    () => getTools(locale).find(item => item.id === toolId),
    [locale, toolId]
  );
  const seo = useMemo(() => getToolSeo(locale), [locale]);

  return (
    <>
      <Seo config={seo[seoKey]} />
      <section
        className={['layout-tool-page', className].filter(Boolean).join(' ')}
      >
        <div className='layout-tool-page__topbar'>
          <Link
            className='layout-tool-page__back-link interactive'
            to={localizePath('/tools')}
          >
            <ArrowLeft size={16} aria-hidden='true' />
            {messages.utilityTool.backToTools}
          </Link>
          {topbarSlot}
        </div>
        <OPageHero
          className='layout-tool-page__hero'
          description={tool?.summary}
          title={tool?.name ?? String(seoKey)}
        >
          {tool?.heroBadges?.length ? (
            <div className='layout-tool-page__badges'>
              {tool.heroBadges.map(badge => {
                const BadgeIcon = heroBadgeIconMap[badge.icon] ?? Icon;
                return (
                  <span className='layout-tool-page__badge' key={badge.id}>
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
          className={['layout-tool-page__content', contentClassName]
            .filter(Boolean)
            .join(' ')}
        >
          {children}
        </div>
      </section>
    </>
  );
}
