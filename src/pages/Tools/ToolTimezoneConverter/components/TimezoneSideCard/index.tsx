import { OCard } from '@/components/OCard';
import type { I18nContextValue } from '@/i18n/context';
import type { Locale } from '@/i18n/locale';
import {
  timeZoneOptions,
  type TimeZoneId,
  type TimeZoneOption,
} from '@/pages/Tools/ToolTimezoneConverter/config';
import {
  formatGmtOffset,
  formatOffset,
  getTimeZoneOffsetMs,
  toIntlLocale,
} from '@/pages/Tools/ToolTimezoneConverter/utils/dateTime';
import { ChevronDown } from 'lucide-react';
import { ChangeEvent, useMemo } from 'react';

type TimezoneCopy = I18nContextValue['messages']['timezoneTool'];

export interface TimezoneDetails {
  date: string;
  dst: string;
  offset: string;
  zoneName: string;
}

function getZoneLabel(option: TimeZoneOption, copy: TimezoneCopy) {
  const zone = copy.zones[option.id];
  return zone.country;
}

function getZoneOptionLabel(
  option: TimeZoneOption,
  copy: TimezoneCopy,
  instant: Date
) {
  const zone = copy.zones[option.id];
  const offsetMs = getTimeZoneOffsetMs(instant, option.timeZone);
  return `${option.flag} ${formatGmtOffset(
    offsetMs
  )} · ${formatOffset(offsetMs)} · ${zone.country} · ${zone.city}`;
}

export function TimezoneSideCard({
  copy,
  details,
  inputValue,
  instant,
  isSource,
  locale,
  onTimeChange,
  onZoneChange,
  option,
  sideTitle,
  zoneId,
}: {
  copy: TimezoneCopy;
  details: TimezoneDetails;
  inputValue: string;
  instant: Date;
  isSource: boolean;
  locale: Locale;
  onTimeChange: (value: string) => void;
  onZoneChange: (value: TimeZoneId) => void;
  option: TimeZoneOption;
  sideTitle: string;
  zoneId: TimeZoneId;
}) {
  const zoneCopy = copy.zones[option.id];
  const zoneOptionLabels = useMemo(() => {
    const enriched = timeZoneOptions.map(zoneOption => ({
      id: zoneOption.id,
      label: getZoneOptionLabel(zoneOption, copy, instant),
      offsetMs: getTimeZoneOffsetMs(instant, zoneOption.timeZone),
    }));
    enriched.sort((a, b) => a.offsetMs - b.offsetMs);
    return enriched.map(({ id, label }) => ({ id, label }));
  }, [copy, instant]);

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
          <span
            className='timezone-card-icon timezone-card-flag'
            aria-hidden='true'
          >
            {option.flag}
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
            {zoneOptionLabels.map(zoneOption => (
              <option key={zoneOption.id} value={zoneOption.id}>
                {zoneOption.label}
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
