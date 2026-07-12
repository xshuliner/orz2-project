import {
  clearAuthStorage,
  OModalLogin,
  toAuthUser,
  type AuthUser,
} from '@/components/OModalLogin';
import { useI18n } from '@/hooks/useI18n';
import managerCache, { cacheKeys } from '@/utils/manager/cache';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type { AuthUser } from '@/components/OModalLogin';

type GuardedAction<TArgs extends unknown[]> = (
  ...args: TArgs
) => void | Promise<void>;
type LoginGate = <TArgs extends unknown[]>(
  action: GuardedAction<TArgs>
) => (...args: TArgs) => void | Promise<void>;
type PendingLoginAction = () => void | Promise<void>;

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  logout: () => void;
  refreshUser: () => Promise<AuthUser | null>;
  withLoginRequired: LoginGate;
}

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

function readStoredUser() {
  const token = managerCache.getLocalStorage<string>(cacheKeys.authToken);
  const refreshToken = managerCache.getLocalStorage<string>(
    cacheKeys.authRefreshToken
  );
  if (!token && !refreshToken) return null;
  return managerCache.getLocalStorage<AuthUser>(cacheKeys.authUser);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { messages } = useI18n();
  const loginCopy = messages.login;
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const pendingLoginActionRef = useRef<PendingLoginAction | null>(null);

  const openLogin = useCallback(() => setIsLoginOpen(true), []);
  const closeLogin = useCallback(() => {
    pendingLoginActionRef.current = null;
    setIsLoginOpen(false);
  }, []);

  const completeLogin = useCallback((nextUser: AuthUser) => {
    const pendingAction = pendingLoginActionRef.current;
    pendingLoginActionRef.current = null;
    setUser(nextUser);
    managerCache.setLocalStorage(cacheKeys.authUser, nextUser);
    setIsLoginOpen(false);

    if (pendingAction) {
      void Promise.resolve(pendingAction()).catch(error => {
        console.error('ContextAuth pending login action error', error);
      });
    }
  }, []);

  const logout = useCallback(() => {
    pendingLoginActionRef.current = null;
    setUser(null);
    clearAuthStorage();
  }, []);

  const refreshUser = useCallback(async () => {
    const response = await loadOrz2Api().then(api => api.getQueryMemberInfo());
    const memberInfo = response?.data?.body?.memberInfo;
    if (!memberInfo) return null;
    const nextUser = toAuthUser(memberInfo, loginCopy.wechatUser);
    managerCache.setLocalStorage(cacheKeys.authUser, nextUser);
    setUser(nextUser);
    return nextUser;
  }, [loginCopy.wechatUser]);

  useEffect(() => {
    const token = managerCache.getLocalStorage<string>(cacheKeys.authToken);
    const refreshToken = managerCache.getLocalStorage<string>(
      cacheKeys.authRefreshToken
    );
    if (!token && !refreshToken) {
      clearAuthStorage();
      setUser(null);
      return;
    }

    let isActive = true;
    refreshUser()
      .then(nextUser => {
        if (!isActive) return;
        if (!nextUser) {
          clearAuthStorage();
          setUser(null);
        }
      })
      .catch(() => {
        if (!isActive) return;
        clearAuthStorage();
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
          pendingLoginActionRef.current = () => action(...args);
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
      <OModalLogin
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

export function useAuthLogin() {
  return useAuth().withLoginRequired;
}
