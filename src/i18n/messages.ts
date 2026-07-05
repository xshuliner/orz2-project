import { locales, type Locale } from '@/i18n/locale';
import { messages as enMessages } from '@/i18n/locales/en';
import { messages as jaMessages } from '@/i18n/locales/ja';
import { messages as zhCNMessages } from '@/i18n/locales/zh-CN';

export const messages = {
  'zh-CN': zhCNMessages,
  en: enMessages,
  ja: jaMessages,
} as const;

export type Messages = (typeof messages)[Locale];

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

export function getMessages(locale: Locale) {
  return messages[locale];
}
