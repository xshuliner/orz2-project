import { LayoutToolPage } from '@/components/LayoutToolPage';
import { OCard } from '@/components/OCard';
import { OIconButton } from '@/components/OIconButton';
import { useI18n } from '@/hooks/useI18n';
import { TimezoneSideCard } from '@/pages/Tools/ToolTimezoneConverter/components/TimezoneSideCard';
import {
  getOptionById,
  timezoneSeoKey,
  timezoneToolId,
  type ConverterSide,
  type TimeZoneId,
  type TimeZoneOption,
} from '@/pages/Tools/ToolTimezoneConverter/config';
import {
  formatDateTimeLocal,
  formatDisplayDate,
  formatOffset,
  getDstLabel,
  getTimeZoneName,
  getTimeZoneOffsetMs,
  parseDateTimeLocal,
  zonedTimeToUtc,
} from '@/pages/Tools/ToolTimezoneConverter/utils/dateTime';
import { ArrowRightLeft, Globe2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import './index.css';

export function TimezoneConverter() {
  const { locale, messages } = useI18n();
  const copy = messages.timezoneTool;
  const [leftZoneId, setLeftZoneId] = useState<TimeZoneId>('china');
  const [rightZoneId, setRightZoneId] = useState<TimeZoneId>('us-pacific');
  const [sourceSide, setSourceSide] = useState<ConverterSide>('left');
  const [instantMs, setInstantMs] = useState(() => Date.now());

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
    <LayoutToolPage
      icon={Globe2}
      seoKey={timezoneSeoKey}
      toolId={timezoneToolId}
    >
      <section className='timezone-workbench'>
        <TimezoneSideCard
          copy={copy}
          details={leftDetails}
          inputValue={leftInputValue}
          instant={instant}
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
          instant={instant}
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
    </LayoutToolPage>
  );
}
