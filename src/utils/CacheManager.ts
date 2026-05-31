// 持久化管理器
class CacheManager {
  private static instance: CacheManager | null = null;

  private readonly header = 'CACHE_';
  private readonly tailer = '_EXPIRE';

  static getInstance(): CacheManager {
    this.instance ??= new CacheManager();
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
   * @param storage - localStorage 或 sessionStorage 实例
   * @param key - 业务层 key
   * @param value - 要保存的值
   * @param seconds - 过期时间（秒），0 表示不过期
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
   * @param storage - localStorage 或 sessionStorage 实例
   * @param key - 业务层 key
   * @param defaultValue - 未命中或解析失败、已过期时返回的默认值
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
      console.debug('CacheManager#getStorageCore parse error', raw, e);
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
   * 只清理当前命名空间下的缓存，不清空整个 storage
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

export default CacheManager.getInstance();
