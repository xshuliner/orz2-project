/**
 * Business keys for all browser-persisted ORZ2 state.
 *
 * managerCache adds its storage namespace when values are persisted, so callers
 * must use these logical keys instead of constructing localStorage keys.
 */
export const cacheKeys = {
  authToken: 'orz2:auth-token',
  authRefreshToken: 'orz2:auth-refresh-token',
  authUser: 'orz2:auth-user',
  locale: 'orz2:locale',
  localRum: 'orz2:local-rum',
  officialPublisherForm: 'orz2:official-publisher-form',
  siliconMemberToken: 'orz2:silicon-member-token',
  themePreference: 'orz2:theme-preference',
  workReportPolisherForm: 'orz2:work-report-polisher-form',
} as const;

// Persistent storage manager.
class managerCache {
  private static instance: managerCache | null = null;

  private readonly header = 'CACHE_';
  private readonly tailer = '_EXPIRE';

  static getInstance(): managerCache {
    this.instance ??= new managerCache();
    return this.instance;
  }

  /**
   * getNowSeconds
   * @returns The current time in seconds
   */
  private getNowSeconds(): number {
    return Math.floor(Date.now() / 1000);
  }

  /**
   * buildDataKey
   * @param key - The key to build the data key for
   * @returns The data key
   */
  private buildDataKey(key: string): string {
    return `${this.header}${key}`;
  }

  /**
   * buildTimeKey
   * @param key - The key to build the time key for
   * @returns The time key
   */
  private buildTimeKey(key: string): string {
    return `${this.buildDataKey(key)}${this.tailer}`;
  }

  /**
   * setStorageCore
   * @param storage - localStorage or sessionStorage instance.
   * @param key - Business key.
   * @param value - Value to store.
   * @param seconds - Expiration in seconds; 0 means no expiration.
   */
  setStorageCore(
    storage: Storage,
    key: string,
    value: unknown,
    seconds = 0
  ): void {
    const dataKey = this.buildDataKey(key);
    const timeKey = this.buildTimeKey(key);

    storage.setItem(dataKey, JSON.stringify(value));
    if (seconds > 0) {
      const expireAt = this.getNowSeconds() + seconds;
      storage.setItem(timeKey, String(expireAt));
    } else {
      storage.removeItem(timeKey);
    }
  }

  /**
   * getStorageCore
   * @param storage - localStorage or sessionStorage instance.
   * @param key - Business key.
   * @param defaultValue - Value returned when missing, expired, or invalid.
   */
  getStorageCore<T>(
    storage: Storage,
    key: string,
    defaultValue: T | null = null
  ): T | null {
    const dataKey = this.buildDataKey(key);
    const timeKey = this.buildTimeKey(key);
    const rawExpire = storage.getItem(timeKey);
    const expireAt = rawExpire ? Number(rawExpire) : 0;

    if (expireAt && expireAt < this.getNowSeconds()) {
      storage.removeItem(dataKey);
      storage.removeItem(timeKey);
      return defaultValue;
    }

    const raw = storage.getItem(dataKey);
    if (raw == null) return defaultValue;

    try {
      return JSON.parse(raw) as T;
    } catch (e) {
      console.debug('managerCache#getStorageCore parse error', raw, e);
      return defaultValue;
    }
  }

  /**
   * removeStorageCore
   */
  removeStorageCore(storage: Storage, key: string): void {
    const dataKey = this.buildDataKey(key);
    const timeKey = this.buildTimeKey(key);

    storage.removeItem(dataKey);
    storage.removeItem(timeKey);
  }

  /**
   * Clear only this namespace instead of the entire storage.
   */
  clearStorageCore(storage: Storage): void {
    const keysToRemove: string[] = [];

    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (!key) continue;
      if (key.startsWith(this.header) && !key.endsWith(this.tailer)) {
        keysToRemove.push(key, `${key}${this.tailer}`);
      }
    }

    keysToRemove.forEach(key => {
      storage.removeItem(key);
    });
  }

  /**
   * setLocalStorage
   */
  setLocalStorage(key: string, value: unknown, seconds = 0): void {
    if (typeof window === 'undefined') return;

    this.setStorageCore(window.localStorage, key, value, seconds);
  }

  /**
   * getLocalStorage
   */
  getLocalStorage<T = unknown>(
    key: string,
    defaultValue: T | null = null
  ): T | null {
    if (typeof window === 'undefined') return defaultValue;

    return this.getStorageCore<T>(window.localStorage, key, defaultValue);
  }

  /**
   * removeLocalStorage
   */
  removeLocalStorage(key: string): void {
    if (typeof window === 'undefined') return;

    this.removeStorageCore(window.localStorage, key);
  }

  /**
   * clearLocalStorage
   */
  clearLocalStorage(): void {
    if (typeof window === 'undefined') return;

    this.clearStorageCore(window.localStorage);
  }

  /**
   * setSessionStorage
   */
  setSessionStorage(key: string, value: unknown, seconds = 0): void {
    if (typeof window === 'undefined') return;

    this.setStorageCore(window.sessionStorage, key, value, seconds);
  }

  /**
   * getSessionStorage
   */
  getSessionStorage(key: string, defaultValue: unknown = null): unknown {
    if (typeof window === 'undefined') return defaultValue;

    return this.getStorageCore(window.sessionStorage, key, defaultValue);
  }

  /**
   * removeSessionStorage
   */
  removeSessionStorage(key: string): void {
    if (typeof window === 'undefined') return;

    this.removeStorageCore(window.sessionStorage, key);
  }

  /**
   * clearSessionStorage
   */
  clearSessionStorage(): void {
    if (typeof window === 'undefined') return;

    this.clearStorageCore(window.sessionStorage);
  }
}

export default managerCache.getInstance();
