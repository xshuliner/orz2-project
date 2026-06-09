import { OButton } from '@/components/OButton';
import { OCardCatalog } from '@/components/OCardCatalog';
import { OEmptyState } from '@/components/OEmptyState';
import { OSectionHeading } from '@/components/OSectionHeading';
import { OTab } from '@/components/OTab';
import { SectionCatalogRecent } from '@/components/SectionCatalogRecent';
import { getStageLabel } from '@/config/catalog-stages';
import { useCatalogRecentItems } from '@/hooks/useCatalogRecentUsage';
import { useI18n } from '@/i18n';
import { getToolCategories, getToolGroups, getTools } from '@/i18n/catalog';
import { mergeCatalogItemsWithRecent } from '@/utils/catalogRecentUsage';
import { Search } from 'lucide-react';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import './index.css';

interface SectionToolsProps {
  compact?: boolean;
  subtitle?: string;
  title?: string;
}

export function SectionTools({
  compact = false,
  subtitle,
  title,
}: SectionToolsProps) {
  const { locale, messages } = useI18n();
  const sectionCopy = messages.homeSections.tools;
  const tools = useMemo(() => getTools(locale), [locale]);
  const recentTools = useCatalogRecentItems('tool', tools, 3);
  const toolGroups = useMemo(() => getToolGroups(locale), [locale]);
  const toolCategories = useMemo(
    () => getToolCategories(locale, messages.common.all),
    [locale, messages.common.all]
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const showFilters = !compact;
  const query = showFilters ? (searchParams.get('q') ?? '') : '';
  const category = showFilters
    ? (searchParams.get('category') ?? messages.common.all)
    : messages.common.all;
  const baseTools = useMemo(
    () =>
      compact
        ? mergeCatalogItemsWithRecent(
            recentTools,
            tools.filter(tool => tool.compact)
          )
        : tools,
    [compact, recentTools, tools]
  );
  const groupMeta = new Map(toolGroups.map(group => [group.name, group]));
  const categoryOptions = toolCategories.map(item => ({
    label: item,
    value: item,
  }));

  function updateFilters(nextQuery: string, nextCategory = category) {
    const next = new URLSearchParams();
    if (nextQuery.trim()) next.set('q', nextQuery.trim());
    if (nextCategory !== messages.common.all)
      next.set('category', nextCategory);
    setSearchParams(next, { replace: true });
  }

  const visibleTools = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return baseTools.filter(tool => {
      const matchesCategory =
        category === messages.common.all || tool.group === category;
      const haystack = [
        tool.id,
        tool.name,
        tool.group,
        tool.summary,
        getStageLabel(tool.lifecycle.stage, locale),
        ...tool.badges,
        ...tool.platform,
      ]
        .join(' ')
        .toLowerCase();
      return matchesCategory && (!normalized || haystack.includes(normalized));
    });
  }, [baseTools, category, locale, messages.common.all, query]);
  const groups = compact
    ? Array.from(new Set(visibleTools.map(tool => tool.group)))
    : toolGroups
        .map(group => group.name)
        .filter(group => visibleTools.some(tool => tool.group === group));

  return (
    <section
      className={compact ? 'tool-directory compact' : 'tool-directory'}
      aria-label={sectionCopy.ariaLabel}
    >
      {title ? <OSectionHeading description={subtitle} title={title} /> : null}
      {showFilters ? (
        <div className='directory-controls'>
          <label className='search-box'>
            <Search size={18} aria-hidden='true' />
            <span className='sr-only'>{sectionCopy.searchAriaLabel}</span>
            <input
              value={query}
              onChange={event => updateFilters(event.target.value)}
              placeholder={sectionCopy.searchPlaceholder}
            />
          </label>
          <OTab
            ariaLabel={sectionCopy.categoryAriaLabel}
            className='category-tabs'
            options={categoryOptions}
            value={category}
            onChange={nextCategory => updateFilters(query, nextCategory)}
          />
        </div>
      ) : null}
      {showFilters ? (
        <SectionCatalogRecent
          catalogType='tool'
          copy={sectionCopy.recent}
          items={recentTools}
        />
      ) : null}
      <div className='tool-groups'>
        {groups.map(group => {
          const groupTools = visibleTools.filter(tool => tool.group === group);
          const meta = groupMeta.get(group);

          return (
            <section className='tool-group' key={group}>
              <div className='tool-group-heading'>
                <div>
                  <h3>{group}</h3>
                  {meta?.description ? <p>{meta.description}</p> : null}
                </div>
              </div>
              <div className='tool-grid'>
                {groupTools.map(tool => (
                  <OCardCatalog catalogType='tool' item={tool} key={tool.id} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
      {!visibleTools.length ? (
        <OEmptyState>{sectionCopy.emptyState}</OEmptyState>
      ) : null}
      {compact ? (
        <div className='section-action'>
          <OButton to='/tools'>{sectionCopy.allButton}</OButton>
        </div>
      ) : null}
    </section>
  );
}
