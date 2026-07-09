import type { I18nContextValue } from '@/i18n/context';
import type { Locale } from '@/i18n/locale';

type TimezoneCopy = I18nContextValue['messages']['timezoneTool'];

interface DateTimeFields {
  day: number;
  hour: number;
  minute: number;
  month: number;
  second: number;
  year: number;
}

export function toIntlLocale(locale: Locale) {
  if (locale === 'zh-CN') return 'zh-CN';
  if (locale === 'ja') return 'ja-JP';
  return 'en-US';
}

function getZonedParts(date: Date, timeZone: string): DateTimeFields {
  const formatter = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    hourCycle: 'h23',
    minute: '2-digit',
    month: '2-digit',
    second: '2-digit',
    timeZone,
    year: 'numeric',
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, part.value])
  );

  return {
    day: Number(parts.day),
    hour: Number(parts.hour === '24' ? '00' : parts.hour),
    minute: Number(parts.minute),
    month: Number(parts.month),
    second: Number(parts.second),
    year: Number(parts.year),
  };
}

function padDatePart(value: number) {
  return String(value).padStart(2, '0');
}

export function formatDateTimeLocal(date: Date, timeZone: string) {
  const parts = getZonedParts(date, timeZone);
  return `${parts.year}-${padDatePart(parts.month)}-${padDatePart(parts.day)}T${padDatePart(parts.hour)}:${padDatePart(parts.minute)}`;
}

export function parseDateTimeLocal(value: string): DateTimeFields | null {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/
  );
  if (!match) return null;

  const [, year, month, day, hour, minute, second = '0'] = match;
  const fields = {
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    month: Number(month),
    second: Number(second),
    year: Number(year),
  };
  const testDate = new Date(
    Date.UTC(fields.year, fields.month - 1, fields.day)
  );
  const isValidDate =
    testDate.getUTCFullYear() === fields.year &&
    testDate.getUTCMonth() === fields.month - 1 &&
    testDate.getUTCDate() === fields.day;

  if (
    !isValidDate ||
    fields.hour > 23 ||
    fields.minute > 59 ||
    fields.second > 59
  ) {
    return null;
  }
  return fields;
}

export function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = getZonedParts(date, timeZone);
  const zonedAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );
  return zonedAsUtc - Math.floor(date.getTime() / 1000) * 1000;
}

export function zonedTimeToUtc(fields: DateTimeFields, timeZone: string) {
  const localAsUtc = Date.UTC(
    fields.year,
    fields.month - 1,
    fields.day,
    fields.hour,
    fields.minute,
    fields.second
  );
  let timestamp = localAsUtc;

  for (let index = 0; index < 4; index += 1) {
    const offset = getTimeZoneOffsetMs(new Date(timestamp), timeZone);
    const nextTimestamp = localAsUtc - offset;
    if (Math.abs(nextTimestamp - timestamp) < 1) break;
    timestamp = nextTimestamp;
  }

  return new Date(timestamp);
}

export function formatOffset(offsetMs: number) {
  return formatOffsetWithPrefix(offsetMs, 'UTC');
}

export function formatGmtOffset(offsetMs: number) {
  return formatOffsetWithPrefix(offsetMs, 'GMT');
}

function formatOffsetWithPrefix(offsetMs: number, prefix: string) {
  const totalMinutes = Math.round(offsetMs / 60000);
  const sign = totalMinutes >= 0 ? '+' : '-';
  const absoluteMinutes = Math.abs(totalMinutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;
  return `${prefix}${sign}${padDatePart(hours)}:${padDatePart(minutes)}`;
}

export function getTimeZoneName(date: Date, timeZone: string, locale: Locale) {
  const name = new Intl.DateTimeFormat(toIntlLocale(locale), {
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
    timeZoneName: 'short',
  })
    .formatToParts(date)
    .find(part => part.type === 'timeZoneName')?.value;
  return name ?? timeZone;
}

export function getDstLabel(date: Date, timeZone: string, copy: TimezoneCopy) {
  const year = date.getUTCFullYear();
  const januaryOffset = getTimeZoneOffsetMs(
    new Date(Date.UTC(year, 0, 1, 12)),
    timeZone
  );
  const julyOffset = getTimeZoneOffsetMs(
    new Date(Date.UTC(year, 6, 1, 12)),
    timeZone
  );

  if (januaryOffset === julyOffset) return copy.noDst;

  const currentOffset = getTimeZoneOffsetMs(date, timeZone);
  return currentOffset === Math.max(januaryOffset, julyOffset)
    ? copy.dstActive
    : copy.dstInactive;
}

export function formatDisplayDate(
  date: Date,
  timeZone: string,
  locale: Locale
) {
  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    hourCycle: 'h23',
    minute: '2-digit',
    month: 'short',
    timeZone,
    weekday: 'short',
    year: 'numeric',
  }).format(date);
}
