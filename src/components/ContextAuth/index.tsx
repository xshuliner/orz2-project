import CacheManager from '@/utils/CacheManager';
import { Loader2, MessageCircle, RefreshCw, X } from 'lucide-react';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import './index.css';

interface MemberInfo {
  _id?: string;
  sys_thirdId?: string;
  identity_email?: string;
  identity_username?: string;
  user_avatarUrl?: string;
  user_nickName?: string;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

type GuardedAction<TArgs extends unknown[]> = (
  ...args: TArgs
) => void | Promise<void>;
type LoginGate = <TArgs extends unknown[]>(
  action: GuardedAction<TArgs>
) => (...args: TArgs) => void | Promise<void>;

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  logout: () => void;
  withLoginRequired: LoginGate;
}

const authStorageKey = 'orz2:auth-user';
const tokenStorageKey = 'token';
const refreshTokenStorageKey = 'refreshToken';
const pollingDelay = 2000;

const AuthContext = createContext<AuthContextValue | null>(null);
const loadOrz2Api = () => import('@/api').then(module => module.default.Orz2);

function stopDefaultAction(value: unknown) {
  if (!value || typeof value !== 'object') return;
  const eventLike = value as {
    preventDefault?: () => void;
    stopPropagation?: () => void;
  };
  eventLike.preventDefault?.();
  eventLike.stopPropagation?.();
}

function toAuthUser(memberInfo: MemberInfo): AuthUser {
  return {
    id: memberInfo._id || memberInfo.sys_thirdId || 'wechat-user',
    name:
      memberInfo.user_nickName || memberInfo.identity_username || '微信用户',
    email: memberInfo.identity_email || '',
    avatarUrl: memberInfo.user_avatarUrl || undefined,
  };
}

function persistTokens(token: string, refreshToken?: string) {
  CacheManager.setLocalStorage(tokenStorageKey, token);
  if (refreshToken) {
    CacheManager.setLocalStorage(refreshTokenStorageKey, refreshToken);
  } else {
    CacheManager.removeLocalStorage(refreshTokenStorageKey);
  }
}

function removeAuthStorage() {
  CacheManager.removeLocalStorage(authStorageKey);
  CacheManager.removeLocalStorage(tokenStorageKey);
  CacheManager.removeLocalStorage(refreshTokenStorageKey);
}

function readStoredUser() {
  const token = CacheManager.getLocalStorage<string>(tokenStorageKey);
  if (!token) return null;
  return CacheManager.getLocalStorage<AuthUser>(authStorageKey);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const openLogin = useCallback(() => setIsLoginOpen(true), []);
  const closeLogin = useCallback(() => setIsLoginOpen(false), []);

  const completeLogin = useCallback((nextUser: AuthUser) => {
    setUser(nextUser);
    CacheManager.setLocalStorage(authStorageKey, nextUser);
    setIsLoginOpen(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    removeAuthStorage();
  }, []);

  useEffect(() => {
    const token = CacheManager.getLocalStorage<string>(tokenStorageKey);
    if (!token) {
      removeAuthStorage();
      setUser(null);
      return;
    }

    let isActive = true;
    loadOrz2Api()
      .then(api => api.getQueryMemberInfo())
      .then(response => {
        if (!isActive) return;
        const memberInfo = response?.data?.body?.memberInfo as
          | MemberInfo
          | undefined;
        if (!memberInfo) {
          removeAuthStorage();
          setUser(null);
          return;
        }
        const nextUser = toAuthUser(memberInfo);
        CacheManager.setLocalStorage(authStorageKey, nextUser);
        setUser(nextUser);
      })
      .catch(() => {
        if (!isActive) return;
        removeAuthStorage();
        setUser(null);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const withLoginRequired = useCallback<LoginGate>(
    action =>
      (...args) => {
        if (!user) {
          stopDefaultAction(args[0]);
          setIsLoginOpen(true);
          return;
        }
        return action(...args);
      },
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      openLogin,
      closeLogin,
      logout,
      withLoginRequired,
    }),
    [closeLogin, logout, openLogin, user, withLoginRequired]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={closeLogin}
        onLogin={completeLogin}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}

export function useLoginGate() {
  return useAuth().withLoginRequired;
}

function readQrCodeAsDataUrl(buffer: unknown) {
  return new Promise<string>((resolve, reject) => {
    if (!Array.isArray(buffer)) {
      reject(new Error('二维码图片数据格式异常'));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('二维码图片读取失败'));
    reader.readAsDataURL(
      new Blob([new Uint8Array(buffer)], { type: 'image/jpeg' })
    );
  });
}

function LoginModal({
  isOpen,
  onClose,
  onLogin,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: AuthUser) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [error, setError] = useState('');
  const pollingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionRef = useRef(0);

  const stopPolling = useCallback(() => {
    sessionRef.current += 1;
    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  }, []);

  const queryLoginStatus = useCallback(
    async (uuid: string, session: number) => {
      if (session !== sessionRef.current) return;
      try {
        const api = await loadOrz2Api();
        const response = await api.getQueryMiniCodeLogin({ uuid });
        if (session !== sessionRef.current) return;
        const { timer, token, refreshToken } = response?.data?.body || {};

        if (!timer) {
          setIsExpired(true);
          stopPolling();
          return;
        }

        if (token) {
          persistTokens(token, refreshToken);
          const memberResponse = await api.getQueryMemberInfo();
          if (session !== sessionRef.current) return;
          const memberInfo = memberResponse?.data?.body?.memberInfo as
            | MemberInfo
            | undefined;
          if (!memberInfo) {
            removeAuthStorage();
            setError('登录失败，请刷新二维码后重试');
            stopPolling();
            return;
          }
          stopPolling();
          onLogin(toAuthUser(memberInfo));
          return;
        }

        pollingTimerRef.current = setTimeout(
          () => queryLoginStatus(uuid, session),
          pollingDelay
        );
      } catch (queryError) {
        console.error('ContextAuth query login status error', queryError);
        if (session === sessionRef.current) {
          pollingTimerRef.current = setTimeout(
            () => queryLoginStatus(uuid, session),
            pollingDelay
          );
        }
      }
    },
    [onLogin, stopPolling]
  );

  const initQrCode = useCallback(async () => {
    stopPolling();
    const session = sessionRef.current;
    setIsLoading(true);
    setIsExpired(false);
    setQrCodeUrl('');
    setError('');

    try {
      const api = await loadOrz2Api();
      const response = await api.postCreateMiniCodeLogin();
      if (session !== sessionRef.current) return;
      const { data, uuid } = response?.data?.body || {};
      if (!uuid) throw new Error('创建二维码失败');
      setQrCodeUrl(await readQrCodeAsDataUrl(data?.data));
      if (session === sessionRef.current) {
        queryLoginStatus(uuid, session);
      }
    } catch (initError) {
      console.error('ContextAuth init QR code error', initError);
      if (session === sessionRef.current) {
        setError('二维码加载失败，请稍后刷新重试');
      }
    } finally {
      if (session === sessionRef.current) {
        setIsLoading(false);
      }
    }
  }, [queryLoginStatus, stopPolling]);

  useEffect(() => {
    if (!isOpen) {
      stopPolling();
      return;
    }
    initQrCode();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      stopPolling();
    };
  }, [initQrCode, isOpen, onClose, stopPolling]);

  if (!isOpen) return null;

  return (
    <div
      className='login-modal-overlay'
      role='presentation'
      onMouseDown={onClose}
    >
      <div
        className='login-modal'
        role='dialog'
        aria-modal='true'
        aria-labelledby='login-modal-title'
        onMouseDown={event => event.stopPropagation()}
      >
        <button
          className='login-modal-close icon-button interactive'
          type='button'
          aria-label='关闭登录窗口'
          onClick={onClose}
        >
          <X size={18} aria-hidden='true' />
        </button>
        <div className='login-modal-heading'>
          <span className='login-modal-icon' aria-hidden='true'>
            <MessageCircle size={22} />
          </span>
          <div>
            <p className='login-modal-kicker'>微信扫码登录</p>
            <h2 id='login-modal-title'>欢迎回来</h2>
            <p>使用微信扫描太阳码，完成授权后将自动登录。</p>
          </div>
        </div>

        <div className='login-qr-panel'>
          {isLoading ? (
            <div className='login-qr-placeholder'>
              <Loader2 className='login-spin' size={30} aria-hidden='true' />
              <span>正在生成太阳码...</span>
            </div>
          ) : qrCodeUrl ? (
            <div className='login-qr-image-wrap'>
              <img
                className={
                  isExpired ? 'login-qr-image expired' : 'login-qr-image'
                }
                src={qrCodeUrl}
                alt='微信小程序登录太阳码'
              />
              {isExpired || error ? (
                <div className='login-qr-expired'>
                  <span>{error || '太阳码已过期'}</span>
                  <RefreshButton onClick={initQrCode} />
                </div>
              ) : null}
            </div>
          ) : (
            <div className='login-qr-placeholder'>
              <span>{error || '暂未获取到太阳码'}</span>
              <RefreshButton onClick={initQrCode} />
            </div>
          )}
        </div>

        <p className='login-modal-hint'>请在微信中扫码，并按提示完成授权</p>
      </div>
    </div>
  );
}

function RefreshButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className='button secondary interactive'
      type='button'
      onClick={onClick}
    >
      <RefreshCw size={16} aria-hidden='true' />
      刷新太阳码
    </button>
  );
}
