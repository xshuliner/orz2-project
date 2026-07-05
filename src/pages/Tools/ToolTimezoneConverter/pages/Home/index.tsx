import { OCard } from '@/components/OCard';
import { OIconButton } from '@/components/OIconButton';
import { OPageHero } from '@/components/OPageHero';
import { Seo } from '@/components/Seo';
import { getToolSeo } from '@/config/seo';
import { getTools, useI18n, type Locale } from '@/i18n';
import {
  ArrowLeft,
  ArrowRightLeft,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Globe2,
} from 'lucide-react';
import { ChangeEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './index.css';

type ConverterSide = 'left' | 'right';

interface DateTimeFields {
  day: number;
  hour: number;
  minute: number;
  month: number;
  second: number;
  year: number;
}

const timeZoneOptions = [
  { id: 'china', flag: '🇨🇳', timeZone: 'Asia/Shanghai' },
  { id: 'unitedStates', flag: '🇺🇸', timeZone: 'America/New_York' },
  { id: 'unitedKingdom', flag: '🇬🇧', timeZone: 'Europe/London' },
  { id: 'japan', flag: '🇯🇵', timeZone: 'Asia/Tokyo' },
  { id: 'southKorea', flag: '🇰🇷', timeZone: 'Asia/Seoul' },
  { id: 'singapore', flag: '🇸🇬', timeZone: 'Asia/Singapore' },
  { id: 'india', flag: '🇮🇳', timeZone: 'Asia/Kolkata' },
  { id: 'australia', flag: '🇦🇺', timeZone: 'Australia/Sydney' },
  { id: 'germany', flag: '🇩🇪', timeZone: 'Europe/Berlin' },
  { id: 'france', flag: '🇫🇷', timeZone: 'Europe/Paris' },
  { id: 'canada', flag: '🇨🇦', timeZone: 'America/Toronto' },
  { id: 'mexico', flag: '🇲🇽', timeZone: 'America/Mexico_City' },
  { id: 'brazil', flag: '🇧🇷', timeZone: 'America/Sao_Paulo' },
  { id: 'argentina', flag: '🇦🇷', timeZone: 'America/Argentina/Buenos_Aires' },
  { id: 'italy', flag: '🇮🇹', timeZone: 'Europe/Rome' },
  { id: 'spain', flag: '🇪🇸', timeZone: 'Europe/Madrid' },
  { id: 'netherlands', flag: '🇳🇱', timeZone: 'Europe/Amsterdam' },
  { id: 'russia', flag: '🇷🇺', timeZone: 'Europe/Moscow' },
  { id: 'newZealand', flag: '🇳🇿', timeZone: 'Pacific/Auckland' },
  { id: 'indonesia', flag: '🇮🇩', timeZone: 'Asia/Jakarta' },
  { id: 'vietnam', flag: '🇻🇳', timeZone: 'Asia/Ho_Chi_Minh' },
  { id: 'malaysia', flag: '🇲🇾', timeZone: 'Asia/Kuala_Lumpur' },
  { id: 'philippines', flag: '🇵🇭', timeZone: 'Asia/Manila' },
  { id: 'turkey', flag: '🇹🇷', timeZone: 'Europe/Istanbul' },
  { id: 'uae', flag: '🇦🇪', timeZone: 'Asia/Dubai' },
  { id: 'saudiArabia', flag: '🇸🇦', timeZone: 'Asia/Riyadh' },
  { id: 'southAfrica', flag: '🇿🇦', timeZone: 'Africa/Johannesburg' },
  { id: 'egypt', flag: '🇪🇬', timeZone: 'Africa/Cairo' },
  { id: 'thailand', flag: '🇹🇭', timeZone: 'Asia/Bangkok' },
] as const;

type TimeZoneOption = (typeof timeZoneOptions)[number];
type TimeZoneId = TimeZoneOption['id'];
type TimezoneCopy = ReturnType<typeof useI18n>['messages']['timezoneTool'];

function getOptionById(id: TimeZoneId): TimeZoneOption {
  return timeZoneOptions.find(option => option.id === id) ?? timeZoneOptions[0];
}

function toIntlLocale(locale: Locale) {
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

function formatDateTimeLocal(date: Date, timeZone: string) {
  const parts = getZonedParts(date, timeZone);
  return `${parts.year}-${padDatePart(parts.month)}-${padDatePart(parts.day)}T${padDatePart(parts.hour)}:${padDatePart(parts.minute)}`;
}

function parseDateTimeLocal(value: string): DateTimeFields | null {
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

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
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

function zonedTimeToUtc(fields: DateTimeFields, timeZone: string) {
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

function formatOffset(offsetMs: number) {
  const totalMinutes = Math.round(offsetMs / 60000);
  const sign = totalMinutes >= 0 ? '+' : '-';
  const absoluteMinutes = Math.abs(totalMinutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;
  return `UTC${sign}${padDatePart(hours)}:${padDatePart(minutes)}`;
}

function getTimeZoneName(date: Date, timeZone: string, locale: Locale) {
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

function getDstLabel(date: Date, timeZone: string, copy: TimezoneCopy) {
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

function formatDisplayDate(date: Date, timeZone: string, locale: Locale) {
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

function getZoneLabel(option: TimeZoneOption, copy: TimezoneCopy) {
  const zone = copy.zones[option.id];
  return `${option.flag} ${zone.country}`;
}

function getZoneOptionLabel(option: TimeZoneOption, copy: TimezoneCopy) {
  const zone = copy.zones[option.id];
  return `${option.flag} ${zone.country} · ${zone.city}`;
}

function TimezoneSideCard({
  copy,
  details,
  inputValue,
  isSource,
  locale,
  onTimeChange,
  onZoneChange,
  option,
  sideTitle,
  zoneId,
}: {
  copy: TimezoneCopy;
  details: {
    date: string;
    dst: string;
    offset: string;
    zoneName: string;
  };
  inputValue: string;
  isSource: boolean;
  locale: Locale;
  onTimeChange: (value: string) => void;
  onZoneChange: (value: TimeZoneId) => void;
  option: TimeZoneOption;
  sideTitle: string;
  zoneId: TimeZoneId;
}) {
  const zoneCopy = copy.zones[option.id];

  return (
    <OCard
      as='section'
      className={[
        'timezone-side-card reveal-on-scroll',
        isSource ? 'is-source' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      padding='lg'
    >
      <div className='timezone-card-heading'>
        <div className='timezone-card-title-group'>
          <span className='timezone-card-icon' aria-hidden='true'>
            <Clock3 size={19} strokeWidth={1.9} />
          </span>
          <div>
            <span className='timezone-card-kicker'>{sideTitle}</span>
            <h2>{getZoneLabel(option, copy)}</h2>
          </div>
        </div>
        <span className='timezone-source-badge'>
          {isSource ? copy.sourceBadge : copy.convertedBadge}
        </span>
      </div>

      <label className='timezone-field'>
        <span>{copy.countryLabel}</span>
        <span className='timezone-select-shell'>
          <select
            value={zoneId}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              onZoneChange(event.target.value as TimeZoneId)
            }
          >
            {timeZoneOptions.map(zoneOption => (
              <option key={zoneOption.id} value={zoneOption.id}>
                {getZoneOptionLabel(zoneOption, copy)}
              </option>
            ))}
          </select>
          <ChevronDown
            className='timezone-select-chevron'
            size={18}
            strokeWidth={1.9}
            aria-hidden='true'
          />
        </span>
      </label>

      <label className='timezone-field'>
        <span>{copy.timeLabel}</span>
        <input
          type='datetime-local'
          step='60'
          value={inputValue}
          onChange={event => onTimeChange(event.target.value)}
        />
      </label>

      <div className='timezone-local-time' lang={toIntlLocale(locale)}>
        <span>{details.date}</span>
        <strong>{zoneCopy.city}</strong>
      </div>

      <dl className='timezone-detail-list'>
        <div>
          <dt>{copy.zoneNameLabel}</dt>
          <dd>{details.zoneName}</dd>
        </div>
        <div>
          <dt>{copy.utcOffsetLabel}</dt>
          <dd>{details.offset}</dd>
        </div>
        <div>
          <dt>{copy.dstLabel}</dt>
          <dd>{details.dst}</dd>
        </div>
      </dl>
    </OCard>
  );
}

export function TimezoneConverter() {
  const { locale, localizePath, messages } = useI18n();
  const copy = messages.timezoneTool;
  const [leftZoneId, setLeftZoneId] = useState<TimeZoneId>('china');
  const [rightZoneId, setRightZoneId] = useState<TimeZoneId>('unitedStates');
  const [sourceSide, setSourceSide] = useState<ConverterSide>('left');
  const [instantMs, setInstantMs] = useState(() => Date.now());

  const tool = useMemo(
    () => getTools(locale).find(item => item.id === 'tool-timezone'),
    [locale]
  );
  const localizedToolSeo = useMemo(() => getToolSeo(locale), [locale]);
  const instant = useMemo(() => new Date(instantMs), [instantMs]);
  const leftOption = getOptionById(leftZoneId);
  const rightOption = getOptionById(rightZoneId);
  const leftInputValue = formatDateTimeLocal(instant, leftOption.timeZone);
  const rightInputValue = formatDateTimeLocal(instant, rightOption.timeZone);
  const leftOffsetMs = getTimeZoneOffsetMs(instant, leftOption.timeZone);
  const rightOffsetMs = getTimeZoneOffsetMs(instant, rightOption.timeZone);

  const leftDetails = {
    date: formatDisplayDate(instant, leftOption.timeZone, locale),
    dst: getDstLabel(instant, leftOption.timeZone, copy),
    offset: formatOffset(leftOffsetMs),
    zoneName: getTimeZoneName(instant, leftOption.timeZone, locale),
  };
  const rightDetails = {
    date: formatDisplayDate(instant, rightOption.timeZone, locale),
    dst: getDstLabel(instant, rightOption.timeZone, copy),
    offset: formatOffset(rightOffsetMs),
    zoneName: getTimeZoneName(instant, rightOption.timeZone, locale),
  };

  function updateFromInput(
    value: string,
    option: TimeZoneOption,
    side: ConverterSide
  ) {
    const fields = parseDateTimeLocal(value);
    if (!fields) return;
    setInstantMs(zonedTimeToUtc(fields, option.timeZone).getTime());
    setSourceSide(side);
  }

  function swapSides() {
    setLeftZoneId(rightZoneId);
    setRightZoneId(leftZoneId);
    setSourceSide(sourceSide === 'left' ? 'right' : 'left');
  }

  return (
    <>
      <Seo config={localizedToolSeo['timezone-converter']} />
      <section className='timezone-tool-page'>
        <Link
          className='timezone-back-link interactive'
          to={localizePath('/tools')}
        >
          <ArrowLeft size={16} aria-hidden='true' />
          {copy.backToTools}
        </Link>

        <OPageHero
          className='timezone-tool-hero'
          title={tool?.name ?? copy.title}
          description={tool?.summary ?? copy.description}
        >
          <div className='timezone-hero-strip' aria-label={copy.heroAriaLabel}>
            {copy.heroHighlights.map((highlight, index) => {
              const Icon =
                [Globe2, CalendarClock, CheckCircle2][index] ?? CheckCircle2;
              return (
                <span key={highlight}>
                  <Icon size={15} aria-hidden='true' />
                  {highlight}
                </span>
              );
            })}
          </div>
        </OPageHero>

        <section className='timezone-workbench'>
          <TimezoneSideCard
            copy={copy}
            details={leftDetails}
            inputValue={leftInputValue}
            isSource={sourceSide === 'left'}
            locale={locale}
            option={leftOption}
            sideTitle={copy.leftSide}
            zoneId={leftZoneId}
            onTimeChange={value => updateFromInput(value, leftOption, 'left')}
            onZoneChange={setLeftZoneId}
          />

          <OCard
            as='section'
            className='timezone-relation-card reveal-on-scroll'
            aria-label={copy.swapSides}
            padding='sm'
            tone='brand'
          >
            <OIconButton
              aria-label={copy.swapSides}
              className='timezone-swap-button'
              hoverTranslate={false}
              size='lg'
              onClick={swapSides}
            >
              <ArrowRightLeft size={22} strokeWidth={1.9} aria-hidden='true' />
            </OIconButton>
          </OCard>

          <TimezoneSideCard
            copy={copy}
            details={rightDetails}
            inputValue={rightInputValue}
            isSource={sourceSide === 'right'}
            locale={locale}
            option={rightOption}
            sideTitle={copy.rightSide}
            zoneId={rightZoneId}
            onTimeChange={value => updateFromInput(value, rightOption, 'right')}
            onZoneChange={setRightZoneId}
          />
        </section>

        <OCard
          as='aside'
          className='timezone-note-card reveal-on-scroll'
          padding='md'
          tone='soft'
        >
          <Globe2 size={18} strokeWidth={1.8} aria-hidden='true' />
          <div>
            <strong>{copy.noteTitle}</strong>
            <p>{copy.noteDescription}</p>
          </div>
        </OCard>
      </section>
    </>
  );
}
