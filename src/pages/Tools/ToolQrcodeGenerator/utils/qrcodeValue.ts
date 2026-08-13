import type {
  StandardQrcodeContentType,
  WifiEncryption,
} from '@/pages/Tools/ToolQrcodeGenerator/config';

export interface StandardQrcodeForm {
  contentType: StandardQrcodeContentType;
  text: string;
  url: string;
  wifiName: string;
  wifiPassword: string;
  wifiEncryption: WifiEncryption;
  wifiHidden: boolean;
  emailAddress: string;
  emailSubject: string;
  emailBody: string;
  phoneNumber: string;
  smsNumber: string;
  smsMessage: string;
}

export type QrcodeValueError = 'required' | 'invalid-url';

export type QrcodeValueResult =
  | { error: null; value: string }
  | { error: QrcodeValueError; value: '' };

function escapeWifiValue(value: string) {
  return value.replace(/([\\;,:"])/g, '\\$1');
}

function normalizeWebUrl(value: string) {
  const candidate = /^[a-z][a-z\d+.-]*:/i.test(value)
    ? value
    : `https://${value}`;
  const parsedUrl = new URL(candidate);
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error();
  return parsedUrl.href;
}

export function buildStandardQrcodeValue(
  form: StandardQrcodeForm
): QrcodeValueResult {
  switch (form.contentType) {
    case 'text': {
      const text = form.text.trim();
      return text
        ? { error: null, value: text }
        : { error: 'required', value: '' };
    }
    case 'url': {
      const url = form.url.trim();
      if (!url) return { error: 'required', value: '' };
      try {
        return { error: null, value: normalizeWebUrl(url) };
      } catch {
        return { error: 'invalid-url', value: '' };
      }
    }
    case 'wifi': {
      const name = form.wifiName.trim();
      if (!name) return { error: 'required', value: '' };
      if (form.wifiEncryption !== 'nopass' && !form.wifiPassword) {
        return { error: 'required', value: '' };
      }
      const password =
        form.wifiEncryption === 'nopass'
          ? ''
          : `P:${escapeWifiValue(form.wifiPassword)};`;
      return {
        error: null,
        value: `WIFI:T:${form.wifiEncryption};S:${escapeWifiValue(name)};${password}H:${form.wifiHidden ? 'true' : 'false'};;`,
      };
    }
    case 'email': {
      const address = form.emailAddress.trim();
      if (!address) return { error: 'required', value: '' };
      const query = new URLSearchParams();
      if (form.emailSubject.trim())
        query.set('subject', form.emailSubject.trim());
      if (form.emailBody.trim()) query.set('body', form.emailBody.trim());
      const search = query.toString();
      return {
        error: null,
        value: `mailto:${address}${search ? `?${search}` : ''}`,
      };
    }
    case 'phone': {
      const number = form.phoneNumber.trim();
      return number
        ? { error: null, value: `tel:${number}` }
        : { error: 'required', value: '' };
    }
    case 'sms': {
      const number = form.smsNumber.trim();
      if (!number) return { error: 'required', value: '' };
      return {
        error: null,
        value: `SMSTO:${number}:${form.smsMessage.trim()}`,
      };
    }
  }
}

export function getUtf8ByteCount(value: string) {
  return new TextEncoder().encode(value).length;
}

export function getColorLuminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    ?.map(value => parseInt(value, 16) / 255) ?? [0, 0, 0];

  return channels
    .map(value =>
      value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    )
    .reduce(
      (sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index],
      0
    );
}

export function getColorContrastRatio(foreground: string, background: string) {
  const foregroundLuminance = getColorLuminance(foreground);
  const backgroundLuminance = getColorLuminance(background);
  const light = Math.max(foregroundLuminance, backgroundLuminance);
  const dark = Math.min(foregroundLuminance, backgroundLuminance);
  return (light + 0.05) / (dark + 0.05);
}
