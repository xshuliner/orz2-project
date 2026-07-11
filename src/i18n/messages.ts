import { locales, type Locale } from '@/i18n/locale';
import type { messages as enMessages } from '@/i18n/locales/en';
import type { messages as jaMessages } from '@/i18n/locales/ja';
import { messages as zhCNMessages } from '@/i18n/locales/zh-CN';

export type Messages =
  | typeof zhCNMessages
  | typeof enMessages
  | typeof jaMessages;

const loadedMessages: Partial<Record<Locale, Messages>> = {
  'zh-CN': zhCNMessages,
};

const messageLoaders: Record<Locale, () => Promise<Messages>> = {
  'zh-CN': () => Promise.resolve(zhCNMessages),
  en: () => import('@/i18n/locales/en').then(module => module.messages),
  ja: () => import('@/i18n/locales/ja').then(module => module.messages),
};

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

export function getMessages(locale: Locale) {
  const localeMessages = loadedMessages[locale];
  if (!localeMessages) {
    throw new Error(`Locale messages for "${locale}" have not been loaded.`);
  }
  return localeMessages;
}

export async function loadMessages(locale: Locale) {
  const cachedMessages = loadedMessages[locale];
  if (cachedMessages) return cachedMessages;

  const localeMessages = await messageLoaders[locale]();
  loadedMessages[locale] = localeMessages;
  return localeMessages;
}
