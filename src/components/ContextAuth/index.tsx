import type { AuthMemberInfo } from '@/api';
import { OButton } from '@/components/OButton';
import { OIconButton } from '@/components/OIconButton';
import { OModal } from '@/components/OModal';
import { useI18n } from '@/hooks/useI18n';
import CacheManager, { cacheKeys } from '@/utils/CacheManager';
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

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  gender: number;
  province: string;
  provinceCode: string;
  city: string;
  cityCode: string;
  area: string;
  areaCode: string;
  title: string;
  level: number;
  experience: number;
  score: number;
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
  refreshUser: () => Promise<AuthUser | null>;
  withLoginRequired: LoginGate;
}

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

function toAuthUser(
  memberInfo: AuthMemberInfo,
  fallbackName = 'WeChat user'
): AuthUser {
  return {
    id: memberInfo._id || memberInfo.sys_thirdId || 'wechat-user',
    name:
      memberInfo.user_nickName || memberInfo.identity_username || fallbackName,
    email: memberInfo.identity_email || '',
    avatarUrl: memberInfo.user_avatarUrl || undefined,
    gender: memberInfo.user_gender ?? 0,
    province: memberInfo.user_province || '',
    provinceCode: memberInfo.user_province_code || '',
    city: memberInfo.user_city || '',
    cityCode: memberInfo.user_city_code || '',
    area: memberInfo.user_area || '',
    areaCode: memberInfo.user_area_code || '',
    title: memberInfo.user_title || '',
    level: memberInfo.user_level ?? 0,
    experience: memberInfo.user_exp ?? 0,
    score: memberInfo.user_score ?? 0,
  };
}

function persistTokens(token: string, refreshToken?: string) {
  CacheManager.setLocalStorage(cacheKeys.authToken, token);
  if (refreshToken) {
    CacheManager.setLocalStorage(cacheKeys.authRefreshToken, refreshToken);
  } else {
    CacheManager.removeLocalStorage(cacheKeys.authRefreshToken);
  }
}

function removeAuthStorage() {
  CacheManager.removeLocalStorage(cacheKeys.authUser);
  CacheManager.removeLocalStorage(cacheKeys.authToken);
  CacheManager.removeLocalStorage(cacheKeys.authRefreshToken);
}

function readStoredUser() {
  const token = CacheManager.getLocalStorage<string>(cacheKeys.authToken);
  const refreshToken = CacheManager.getLocalStorage<string>(
    cacheKeys.authRefreshToken
  );
  if (!token && !refreshToken) return null;
  return CacheManager.getLocalStorage<AuthUser>(cacheKeys.authUser);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { messages } = useI18n();
  const loginCopy = messages.login;
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const openLogin = useCallback(() => setIsLoginOpen(true), []);
  const closeLogin = useCallback(() => setIsLoginOpen(false), []);

  const completeLogin = useCallback((nextUser: AuthUser) => {
    setUser(nextUser);
    CacheManager.setLocalStorage(cacheKeys.authUser, nextUser);
    setIsLoginOpen(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    removeAuthStorage();
  }, []);

  const refreshUser = useCallback(async () => {
    const response = await loadOrz2Api().then(api => api.getQueryMemberInfo());
    const memberInfo = response?.data?.body?.memberInfo;
    if (!memberInfo) return null;
    const nextUser = toAuthUser(memberInfo, loginCopy.wechatUser);
    CacheManager.setLocalStorage(cacheKeys.authUser, nextUser);
    setUser(nextUser);
    return nextUser;
  }, [loginCopy.wechatUser]);

  useEffect(() => {
    const token = CacheManager.getLocalStorage<string>(cacheKeys.authToken);
    const refreshToken = CacheManager.getLocalStorage<string>(
      cacheKeys.authRefreshToken
    );
    if (!token && !refreshToken) {
      removeAuthStorage();
      setUser(null);
      return;
    }

    let isActive = true;
    refreshUser()
      .then(nextUser => {
        if (!isActive) return;
        if (!nextUser) {
          removeAuthStorage();
          setUser(null);
          return;
        }
      })
      .catch(() => {
        if (!isActive) return;
        removeAuthStorage();
        setUser(null);
      });

    return () => {
      isActive = false;
    };
  }, [refreshUser]);

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
      refreshUser,
      withLoginRequired,
    }),
    [closeLogin, logout, openLogin, refreshUser, user, withLoginRequired]
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

function readQrCodeAsDataUrl(
  buffer: unknown,
  copy: ReturnType<typeof useI18n>['messages']['login']
) {
  return new Promise<string>((resolve, reject) => {
    if (!Array.isArray(buffer)) {
      reject(new Error(copy.errors.qrDataInvalid));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error(copy.errors.qrReadFailed));
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
  const { messages } = useI18n();
  const loginCopy = messages.login;
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
          const memberInfo = memberResponse?.data?.body?.memberInfo;
          if (!memberInfo) {
            removeAuthStorage();
            setError(loginCopy.errors.loginFailed);
            stopPolling();
            return;
          }
          stopPolling();
          onLogin(toAuthUser(memberInfo, loginCopy.wechatUser));
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
    [loginCopy.wechatUser, onLogin, stopPolling]
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
      if (!uuid) throw new Error(loginCopy.errors.qrCreateFailed);
      setQrCodeUrl(await readQrCodeAsDataUrl(data?.data, loginCopy));
      if (session === sessionRef.current) {
        queryLoginStatus(uuid, session);
      }
    } catch (initError) {
      console.error('ContextAuth init QR code error', initError);
      if (session === sessionRef.current) {
        setError(loginCopy.errors.qrLoadFailed);
      }
    } finally {
      if (session === sessionRef.current) {
        setIsLoading(false);
      }
    }
  }, [loginCopy, queryLoginStatus, stopPolling]);

  useEffect(() => {
    if (!isOpen) {
      stopPolling();
      return;
    }
    initQrCode();

    return () => {
      stopPolling();
    };
  }, [initQrCode, isOpen, stopPolling]);

  if (!isOpen) return null;

  return (
    <OModal
      className='login-modal'
      isOpen={isOpen}
      onClose={onClose}
      overlayClassName='login-modal-overlay'
      titleId='login-modal-title'
    >
      <>
        <OIconButton
          className='login-modal-close'
          size='sm'
          aria-label={loginCopy.closeAriaLabel}
          onClick={onClose}
        >
          <X size={18} aria-hidden='true' />
        </OIconButton>
        <div className='login-modal-heading'>
          <span className='login-modal-icon' aria-hidden='true'>
            <MessageCircle size={22} />
          </span>
          <div>
            <p className='login-modal-kicker'>{loginCopy.kicker}</p>
            <h2 id='login-modal-title'>{loginCopy.title}</h2>
            <p>{loginCopy.description}</p>
          </div>
        </div>

        <div className='login-qr-panel'>
          {isLoading ? (
            <div className='login-qr-placeholder'>
              <Loader2 className='login-spin' size={30} aria-hidden='true' />
              <span>{loginCopy.loading}</span>
            </div>
          ) : qrCodeUrl ? (
            <div className='login-qr-image-wrap'>
              <img
                className={
                  isExpired ? 'login-qr-image expired' : 'login-qr-image'
                }
                src={qrCodeUrl}
                alt={loginCopy.qrAlt}
              />
              {isExpired || error ? (
                <div className='login-qr-expired'>
                  <span>{error || loginCopy.expired}</span>
                  <RefreshButton onClick={initQrCode} />
                </div>
              ) : null}
            </div>
          ) : (
            <div className='login-qr-placeholder'>
              <span>{error || loginCopy.noQr}</span>
              <RefreshButton onClick={initQrCode} />
            </div>
          )}
        </div>

        <p className='login-modal-hint'>{loginCopy.hint}</p>
      </>
    </OModal>
  );
}

function RefreshButton({ onClick }: { onClick: () => void }) {
  const { messages } = useI18n();
  const loginCopy = messages.login;

  return (
    <OButton type='button' variant='secondary' onClick={onClick}>
      <RefreshCw size={16} aria-hidden='true' />
      {loginCopy.refreshButton}
    </OButton>
  );
}
