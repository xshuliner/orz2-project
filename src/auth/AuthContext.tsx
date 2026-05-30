import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface AuthUser {
  id: string;
  name: string;
  email: string;
}

type GuardedAction<TArgs extends unknown[]> = (...args: TArgs) => void | Promise<void>;
type LoginGate = <TArgs extends unknown[]>(action: GuardedAction<TArgs>) => (...args: TArgs) => void | Promise<void>;

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  login: () => void;
  logout: () => void;
  withLoginRequired: LoginGate;
}

const authStorageKey = "orz2:auth-user";
const mockUser: AuthUser = {
  id: "test-user",
  name: "测试用户",
  email: "test@orz2.com",
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredUser() {
  try {
    const stored = window.localStorage.getItem(authStorageKey);
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  } catch {
    return null;
  }
}

function stopDefaultAction(value: unknown) {
  if (!value || typeof value !== "object") return;
  const eventLike = value as { preventDefault?: () => void; stopPropagation?: () => void };
  eventLike.preventDefault?.();
  eventLike.stopPropagation?.();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const openLogin = useCallback(() => setIsLoginOpen(true), []);
  const closeLogin = useCallback(() => setIsLoginOpen(false), []);

  const login = useCallback(() => {
    setUser(mockUser);
    window.localStorage.setItem(authStorageKey, JSON.stringify(mockUser));
    setIsLoginOpen(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    window.localStorage.removeItem(authStorageKey);
  }, []);

  const withLoginRequired = useCallback<LoginGate>(
    (action) =>
      (...args) => {
        if (!user) {
          stopDefaultAction(args[0]);
          setIsLoginOpen(true);
          return;
        }
        return action(...args);
      },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      openLogin,
      closeLogin,
      login,
      logout,
      withLoginRequired,
    }),
    [closeLogin, login, logout, openLogin, user, withLoginRequired],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoginModal isOpen={isLoginOpen} onClose={closeLogin} onLogin={login} />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

export function useLoginGate() {
  return useAuth().withLoginRequired;
}

function LoginModal({ isOpen, onClose, onLogin }: { isOpen: boolean; onClose: () => void; onLogin: () => void }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay" role="presentation" onMouseDown={onClose}>
      <div className="login-modal" role="dialog" aria-modal="true" aria-labelledby="login-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <div>
          <p className="login-modal-kicker">登录占位</p>
          <h2 id="login-modal-title">需要先登录</h2>
          <p>这里是临时登录弹窗文案，占位用于后续接入真实账号体系。</p>
        </div>
        <div className="login-modal-actions">
          <button className="button secondary" type="button" onClick={onClose}>
            取消
          </button>
          <button className="button primary" type="button" onClick={onLogin}>
            模拟登录
          </button>
        </div>
      </div>
    </div>
  );
}
