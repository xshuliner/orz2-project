import { CardCatalog } from '@/components/CardCatalog';
import { toolCategories, tools } from '@/config/site';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  const [localQuery, setLocalQuery] = useState('');
  const [localCategory, setLocalCategory] = useState('全部');
  const query = compact ? localQuery : (searchParams.get('q') ?? '');
  const category = compact
    ? localCategory
    : (searchParams.get('category') ?? '全部');

  function updateFilters(nextQuery: string, nextCategory = category) {
    if (compact) {
      setLocalQuery(nextQuery);
      setLocalCategory(nextCategory);
      return;
    }

    const next = new URLSearchParams();
    if (nextQuery.trim()) next.set('q', nextQuery.trim());
    if (nextCategory !== '全部') next.set('category', nextCategory);
    setSearchParams(next, { replace: true });
  }

  const visibleTools = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return tools.filter(tool => {
      const matchesCategory = category === '全部' || tool.category === category;
      const haystack = [
        tool.name,
        tool.category,
        tool.description,
        ...tool.tags,
      ]
        .join(' ')
        .toLowerCase();
      return matchesCategory && (!normalized || haystack.includes(normalized));
    });
  }, [category, query]);

  const displayedTools = compact ? visibleTools.slice(0, 3) : visibleTools;

  return (
    <section
      className={compact ? 'tool-directory compact' : 'tool-directory'}
      aria-label='在线工具'
    >
      {title ? (
        <div className='section-heading'>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      ) : null}
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
        <div className='category-tabs' role='list' aria-label='工具分类'>
          {toolCategories.map(item => (
            <button
              key={item}
              className={
                item === category ? 'active interactive' : 'interactive'
              }
              type='button'
              onClick={() => updateFilters(query, item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className='tool-grid'>
        {displayedTools.map(tool => (
          <CardCatalog item={tool} key={tool.id} type='tool' />
        ))}
      </div>
      {!displayedTools.length ? (
        <p className='empty-state'>暂时没有匹配的工具，换个关键词试试。</p>
      ) : null}
      {compact ? (
        <div className='section-action'>
          <Link className='button primary interactive' to='/tools'>
            查看全部工具
          </Link>
        </div>
      ) : null}
    </section>
  );
}
