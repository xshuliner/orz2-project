import { getQueryScoreList, type ScoreRecord } from '@/api';
import { useAuth } from '@/components/ContextAuth';
import { LayoutPage } from '@/components/LayoutPage';
import { OButton } from '@/components/OButton';
import { OCard } from '@/components/OCard';
import { OEmptyState } from '@/components/OEmptyState';
import { useI18n } from '@/hooks/useI18n';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import './index.css';

const pageSize = 15;

const ScoreTypeMap = {
  REWARDED_CREATE: { label: 'REWARDED_CREATE', icon: 'iconemoji' },
  REWARDED_AD: { label: 'REWARDED_AD', icon: 'iconlive' },
  USE_CHAT: { label: 'USE_CHAT', icon: 'iconinteractive' },
  USE_OFFICIAL: { label: 'USE_OFFICIAL', icon: 'icongongzhonghao' },
  MANUAL: { label: 'MANUAL', icon: 'iconsetup' },
  DEFAULT: { label: 'DEFAULT', icon: 'iconsetup' },
} as const;

function getScoreType(type: string) {
  return (
    ScoreTypeMap[type as keyof typeof ScoreTypeMap] ?? ScoreTypeMap.DEFAULT
  );
}

export function PageMemberScoreList() {
  const { locale, messages } = useI18n();
  const { user } = useAuth();
  const copy = messages.member;
  const [records, setRecords] = useState<ScoreRecord[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = async (pageNum: number) => {
    setIsLoading(true);
    setFailed(false);
    try {
      const response = await getQueryScoreList({ pageNum, pageSize });
      const body = response.data?.body;
      if (!body) throw new Error('Load failed');
      setRecords(current =>
        pageNum === 0 ? body.list : [...current, ...body.list]
      );
      setPage(pageNum);
      setTotal(body.totalCount);
    } catch {
      setFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) void load(0);
  }, [user]);

  if (!user) return <Navigate replace to='/' />;

  return (
    <LayoutPage
      backLink={false}
      description={copy.scoreDescription}
      seoConfig={{
        title: copy.scoreTitle,
        description: copy.scoreDescription,
        canonicalPath: '/member/score-list',
        locale,
        robots: 'noindex, follow',
      }}
      title={copy.scoreTitle}
    >
      <section className='member-score-list' aria-label={copy.scoreTitle}>
        <OCard className='member-score-summary' padding='md'>
          <span>{copy.balance}</span>
          <strong>{user.score}</strong>
        </OCard>
        <OCard padding='none'>
          <div className='member-score-table-wrap'>
            <table className='member-score-table'>
              <thead>
                <tr>
                  <th scope='col'>{copy.time}</th>
                  <th scope='col'>{copy.typeLabels.DEFAULT}</th>
                  <th scope='col'>{copy.change}</th>
                  <th scope='col'>{copy.balance}</th>
                </tr>
              </thead>
              <tbody>
                {records.map(record => {
                  const scoreType = getScoreType(record.type);
                  return (
                    <tr key={record._id}>
                      <td>
                        <time dateTime={record.sys_createTime}>
                          {new Date(record.sys_createTime).toLocaleString(
                            locale
                          )}
                        </time>
                      </td>
                      <td>
                        <span className='member-score-type'>
                          <i
                            aria-hidden='true'
                            className={`iconfont ${scoreType.icon}`}
                          />
                          {copy.typeLabels[scoreType.label]}
                        </span>
                      </td>
                      <td>
                        <strong
                          className={
                            record.scoreOperation > 0
                              ? 'member-score-positive'
                              : 'member-score-negative'
                          }
                        >
                          {record.scoreOperation > 0 ? '+' : ''}
                          {record.scoreOperation}
                        </strong>
                      </td>
                      <td>{record.scoreBalance}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!isLoading && !failed && records.length === 0 && (
            <OEmptyState>{copy.noRecords}</OEmptyState>
          )}
          {failed && <OEmptyState>{copy.loadFailed}</OEmptyState>}
        </OCard>
        {records.length < total && (
          <OButton
            disabled={isLoading}
            variant='secondary'
            type='button'
            onClick={() => void load(page + 1)}
          >
            {isLoading ? copy.loading : copy.loadMore}
          </OButton>
        )}
      </section>
    </LayoutPage>
  );
}
