export const timezoneToolId = 'tool-timezone';
export const timezoneSeoKey = 'timezone-converter';

export type ConverterSide = 'left' | 'right';

export const timeZoneOptions = [
  { id: 'china', flag: '🇨🇳', timeZone: 'Asia/Shanghai' },
  { id: 'us-east', flag: '🇺🇸', timeZone: 'America/New_York' },
  { id: 'us-central', flag: '🇺🇸', timeZone: 'America/Chicago' },
  { id: 'us-mountain', flag: '🇺🇸', timeZone: 'America/Denver' },
  { id: 'us-pacific', flag: '🇺🇸', timeZone: 'America/Los_Angeles' },
  { id: 'us-alaska', flag: '🇺🇸', timeZone: 'America/Anchorage' },
  { id: 'us-hawaii', flag: '🇺🇸', timeZone: 'Pacific/Honolulu' },
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

export type TimeZoneOption = (typeof timeZoneOptions)[number];
export type TimeZoneId = TimeZoneOption['id'];

export function getOptionById(id: TimeZoneId): TimeZoneOption {
  return timeZoneOptions.find(option => option.id === id) ?? timeZoneOptions[0];
}
