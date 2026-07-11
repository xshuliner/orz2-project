import { OPageHero } from '@/components/OPageHero';
import { Seo } from '@/components/Seo';
import { getToolSeo } from '@/config/seo';
import { useI18n } from '@/hooks/useI18n';
import { getTools } from '@/i18n';
import { ArrowLeft, type LucideIcon } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './index.css';

interface UtilityToolPageLayoutProps {
  children: ReactNode;
  icon: LucideIcon;
  seoKey: keyof ReturnType<typeof getToolSeo>;
  toolId: string;
}

export function UtilityToolPageLayout({
  children,
  icon: Icon,
  seoKey,
  toolId,
}: UtilityToolPageLayoutProps) {
  const { locale, localizePath, messages } = useI18n();
  const tool = useMemo(
    () => getTools(locale).find(item => item.id === toolId),
    [locale, toolId]
  );
  const seo = useMemo(() => getToolSeo(locale), [locale]);

  return (
    <>
      <Seo config={seo[seoKey]} />
      <section className='utility-tool-page'>
        <Link
          className='utility-back-link interactive'
          to={localizePath('/tools')}
        >
          <ArrowLeft size={16} aria-hidden='true' />
          {messages.utilityTool.backToTools}
        </Link>
        <OPageHero
          className='utility-tool-hero'
          description={tool?.summary}
          title={tool?.name ?? String(seoKey)}
        >
          <span className='utility-tool-chip'>
            <Icon size={16} aria-hidden='true' />
            {tool?.badges[0]}
          </span>
        </OPageHero>
        {children}
      </section>
    </>
  );
}
