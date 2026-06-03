import { OButton } from '@/components/OButton';
import { OCardCatalog } from '@/components/OCardCatalog';
import { OEmptyState } from '@/components/OEmptyState';
import { OSectionHeading } from '@/components/OSectionHeading';
import { OTab } from '@/components/OTab';
import { toolCategories, toolGroups, tools } from '@/config/site';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const showFilters = !compact;
  const query = showFilters ? (searchParams.get('q') ?? '') : '';
  const category = showFilters
    ? (searchParams.get('category') ?? '全部')
    : '全部';
  const baseTools = useMemo(
    () => (compact ? tools.filter(tool => tool.compact) : tools),
    [compact]
  );
  const groupMeta = new Map(toolGroups.map(group => [group.name, group]));
  const categoryOptions = toolCategories.map(item => ({
    label: item,
    value: item,
  }));

  function updateFilters(nextQuery: string, nextCategory = category) {
    const next = new URLSearchParams();
    if (nextQuery.trim()) next.set('q', nextQuery.trim());
    if (nextCategory !== '全部') next.set('category', nextCategory);
    setSearchParams(next, { replace: true });
  }

  const visibleTools = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return baseTools.filter(tool => {
      const matchesCategory = category === '全部' || tool.group === category;
      const haystack = [
        tool.id,
        tool.name,
        tool.group,
        tool.summary,
        tool.lifecycle.stage,
        ...tool.badges,
        ...tool.platform,
      ]
        .join(' ')
        .toLowerCase();
      return matchesCategory && (!normalized || haystack.includes(normalized));
    });
  }, [baseTools, category, query]);
  const groups = toolGroups
    .map(group => group.name)
    .filter(group => visibleTools.some(tool => tool.group === group));

  return (
    <section
      className={compact ? 'tool-directory compact' : 'tool-directory'}
      aria-label='在线工具'
    >
      {title ? <OSectionHeading description={subtitle} title={title} /> : null}
      {showFilters ? (
        <div className='directory-controls'>
          <label className='search-box'>
            <Search size={18} aria-hidden='true' />
            <span className='sr-only'>搜索工具</span>
            <input
              value={query}
              onChange={event => updateFilters(event.target.value)}
              placeholder='搜索 AI、图片、JSON、营销...'
            />
          </label>
          <OTab
            ariaLabel='工具分类'
            className='category-tabs'
            options={categoryOptions}
            value={category}
            onChange={nextCategory => updateFilters(query, nextCategory)}
          />
        </div>
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
                  <OCardCatalog item={tool} key={tool.id} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
      {!visibleTools.length ? (
        <OEmptyState>暂时没有匹配的工具，换个关键词试试。</OEmptyState>
      ) : null}
      {compact ? (
        <div className='section-action'>
          <OButton to='/tools'>查看全部工具</OButton>
        </div>
      ) : null}
    </section>
  );
}
