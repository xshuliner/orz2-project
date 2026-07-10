import { OButton } from '@/components/OButton';
import { OCard } from '@/components/OCard';
import { OPageHero } from '@/components/OPageHero';
import { Seo } from '@/components/Seo';
import { getPageSeo } from '@/config/seo';
import { useBuildInfo } from '@/hooks/useBuildInfo';
import { useI18n } from '@/hooks/useI18n';
import type { XshulinerBuildInfo } from '@/types/buildInfo';
import {
  buildInfoJsonPath,
  formatBuildInfoBoolean,
  formatBuildInfoDateTime,
  getBuildInfoCommit,
  getBuildInfoVersion,
} from '@/utils/buildInfo';
import { ExternalLink, RefreshCw } from 'lucide-react';
import './index.css';

type InfoRow = {
  href?: string;
  label: string;
  value?: string;
};

function present(value: string | undefined) {
  return value && value.trim() ? value : undefined;
}

function SectionCard({ rows, title }: { rows: InfoRow[]; title: string }) {
  const visibleRows = rows.filter(row => present(row.value));
  if (!visibleRows.length) return null;

  return (
    <OCard as='section' className='build-info-card' padding='md' tone='soft'>
      <h2>{title}</h2>
      <dl className='build-info-list'>
        {visibleRows.map(row => (
          <div className='build-info-row' key={row.label}>
            <dt>{row.label}</dt>
            <dd>
              {row.href ? (
                <a
                  className='interactive build-info-link'
                  href={row.href}
                  rel='noreferrer'
                  target='_blank'
                >
                  {row.value}
                </a>
              ) : (
                row.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </OCard>
  );
}

function createSections(
  info: XshulinerBuildInfo,
  copy: ReturnType<typeof useI18n>['messages']['buildInfo'],
  locale: ReturnType<typeof useI18n>['locale']
) {
  const tag = info.git.tag || info.git.nearestTag;
  return [
    {
      title: copy.sections.app,
      rows: [
        { label: copy.fields.appName, value: info.app.name },
        { label: copy.fields.version, value: getBuildInfoVersion(info) },
        { label: copy.fields.env, value: info.app.env },
        { label: copy.fields.mode, value: info.app.mode },
        { label: copy.fields.schemaVersion, value: info.schemaVersion },
      ],
    },
    {
      title: copy.sections.git,
      rows: [
        { label: copy.fields.branch, value: info.git.branch },
        { label: copy.fields.tag, value: tag },
        { label: copy.fields.commit, value: info.git.commit },
        {
          label: copy.fields.commitTime,
          value: formatBuildInfoDateTime(info.git.commitTime, locale),
        },
        {
          label: copy.fields.dirty,
          value: formatBuildInfoBoolean(info.git.dirty),
        },
        {
          label: copy.fields.remote,
          value: info.git.remote,
          href: info.git.remote,
        },
      ],
    },
    {
      title: copy.sections.build,
      rows: [
        {
          label: copy.fields.buildTime,
          value: formatBuildInfoDateTime(info.build.time, locale),
        },
        { label: copy.fields.buildUser, value: info.build.user },
        { label: copy.fields.machine, value: info.build.machine },
        { label: copy.fields.nodeVersion, value: info.build.nodeVersion },
        { label: copy.fields.packageManager, value: info.build.packageManager },
      ],
    },
    {
      title: copy.sections.deploy,
      rows: [
        { label: copy.fields.deployTarget, value: info.deploy?.target },
        { label: copy.fields.deployRegion, value: info.deploy?.region },
        {
          label: copy.fields.deployUrl,
          value: info.deploy?.url,
          href: info.deploy?.url,
        },
        { label: copy.fields.releaseId, value: info.deploy?.releaseId },
        { label: copy.fields.buildId, value: info.deploy?.buildId },
      ],
    },
    {
      title: copy.sections.ci,
      rows: [
        { label: copy.fields.provider, value: info.ci?.provider },
        { label: copy.fields.workflow, value: info.ci?.workflow },
        { label: copy.fields.runId, value: info.ci?.runId },
        { label: copy.fields.runNumber, value: info.ci?.runNumber },
        {
          label: copy.fields.jobUrl,
          value: info.ci?.jobUrl,
          href: info.ci?.jobUrl,
        },
        {
          label: copy.fields.commitUrl,
          value: info.ci?.commitUrl,
          href: info.ci?.commitUrl,
        },
      ],
    },
    {
      title: copy.sections.runtime,
      rows: [
        { label: copy.fields.apiBaseUrl, value: info.runtime?.apiBaseUrl },
        { label: copy.fields.publicPath, value: info.runtime?.publicPath },
      ],
    },
  ];
}

export function PageBuildInfo() {
  const { info, reload, src, status } = useBuildInfo();
  const { locale, messages } = useI18n();
  const pageSeo = getPageSeo(locale);
  const copy = messages.buildInfo;

  return (
    <>
      <Seo config={pageSeo.buildInfo} />
      <OPageHero title={copy.heroTitle} description={copy.heroDescription}>
        <div className='build-info-actions'>
          <OButton
            hoverTranslate={false}
            onClick={() => {
              reload();
            }}
            size='sm'
            type='button'
            variant='secondary'
          >
            <RefreshCw size={16} strokeWidth={2} />
            {copy.refresh}
          </OButton>
          <OButton
            href={src}
            rel='noreferrer'
            size='sm'
            target='_blank'
            variant='ghost'
          >
            <ExternalLink size={16} strokeWidth={2} />
            {copy.rawJson}
          </OButton>
        </div>
      </OPageHero>

      <section className='build-info-layout'>
        {info ? (
          <>
            <OCard className='build-info-summary' padding='lg' tone='brand'>
              <p>{copy.summaryLabel}</p>
              <strong>
                {[
                  info.app.name,
                  getBuildInfoVersion(info),
                  getBuildInfoCommit(info),
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </strong>
            </OCard>
            <div className='build-info-grid'>
              {createSections(info, copy, locale).map(section => (
                <SectionCard
                  key={section.title}
                  rows={section.rows}
                  title={section.title}
                />
              ))}
            </div>
            {info.git.latestCommits.length ? (
              <OCard
                as='section'
                className='build-info-card build-info-commits'
                padding='md'
                tone='default'
              >
                <h2>{copy.sections.latestCommits}</h2>
                <ol>
                  {info.git.latestCommits.map(commit => (
                    <li key={commit.hash}>
                      <time dateTime={commit.date}>
                        {formatBuildInfoDateTime(commit.date, locale)}
                      </time>
                      <span className='build-info-commit-author'>
                        {commit.author}
                      </span>
                      <code>{commit.shortHash}</code>
                      <span className='build-info-commit-message'>
                        {commit.message}
                      </span>
                    </li>
                  ))}
                </ol>
              </OCard>
            ) : null}
          </>
        ) : (
          <OCard className='build-info-empty' padding='lg' tone='warm'>
            <h2>
              {status === 'loading' ? copy.loadingTitle : copy.emptyTitle}
            </h2>
            <p>
              {status === 'loading'
                ? copy.loadingDescription
                : copy.emptyDescription.replace('{path}', buildInfoJsonPath)}
            </p>
          </OCard>
        )}
      </section>
    </>
  );
}
