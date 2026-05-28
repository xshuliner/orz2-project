import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const navItems = [
  { label: "首页", to: "/" },
  { label: "产品", to: "/products" },
  { label: "团队", to: "/team" },
  { label: "隐私协议", to: "/privacy" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <header className="site-header">
      <Link to="/" className="brand-link" aria-label="ORZ2 首页">
        <img src="/assets/logo-light.png" alt="ORZ2" className="brand-logo" />
        <span>ORZ2</span>
      </Link>
      <nav className="desktop-nav" aria-label="主导航">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <Link className="nav-cta desktop-only" to="/products">
        打开工具
      </Link>
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
        <Link className="nav-cta" to="/products">
          打开工具
        </Link>
      </div>
    </header>
  );
}
