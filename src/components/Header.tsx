import { LogOut, Menu, UserCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const navItems = [
  { label: "首页", to: "/" },
  { label: "产品", to: "/products" },
  { label: "团队", to: "/team" },
  { label: "隐私协议", to: "/privacy" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, openLogin, logout, user } = useAuth();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <header className="site-header">
      <Link to="/" className="brand-link" aria-label="ORZ2 首页">
        <img src="/assets/logo-light.png" alt="ORZ2" className="brand-logo" />
      </Link>
      <nav className="desktop-nav" aria-label="主导航">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <UserInfoModule isAuthenticated={isAuthenticated} onLogin={openLogin} onLogout={logout} userName={user?.name} variant="desktop" />
      <button
        className="icon-button mobile-menu-button"
        type="button"
        aria-label={isOpen ? "关闭导航" : "打开导航"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <div className={isOpen ? "mobile-nav open" : "mobile-nav"}>
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            {item.label}
          </NavLink>
        ))}
        <UserInfoModule isAuthenticated={isAuthenticated} onLogin={openLogin} onLogout={logout} userName={user?.name} variant="mobile" />
      </div>
    </header>
  );
}

function UserInfoModule({
  isAuthenticated,
  onLogin,
  onLogout,
  userName,
  variant,
}: {
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
  userName?: string;
  variant: "desktop" | "mobile";
}) {
  const className = variant === "desktop" ? "nav-user desktop-only" : "nav-user";

  if (!isAuthenticated) {
    return (
      <button className={`${className} logged-out`} type="button" onClick={onLogin}>
        <UserCircle size={20} aria-hidden="true" />
        <span>未登录</span>
      </button>
    );
  }

  return (
    <div className={`${className} logged-in`}>
      <span className="nav-user-avatar" aria-hidden="true">
        {userName?.slice(0, 1) || "测"}
      </span>
      <span className="nav-user-copy">
        <strong>{userName || "测试用户"}</strong>
        <small>已登录</small>
      </span>
      <button className="nav-logout" type="button" aria-label="退出登录" onClick={onLogout}>
        <LogOut size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
