import type { Locale } from '@/i18n';
import type { XshulinerBuildInfo } from '@/types/buildInfo';

export const buildInfoJsonPath = `${import.meta.env.BASE_URL}__xshuliner__/build-info.json`;

export function getBuildInfoVersion(info: XshulinerBuildInfo) {
  return info.app.version ? `v${info.app.version}` : '';
}

export function getBuildInfoCommit(info: XshulinerBuildInfo) {
  return info.git.shortCommit || info.git.commit.slice(0, 8);
}

export function formatBuildInfoDateTime(
  value: string | undefined,
  locale: Locale
) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatBuildInfoBoolean(value: boolean | undefined) {
  if (typeof value !== 'boolean') return '';
  return value ? 'true' : 'false';
}
