import { useAuth } from '@/components/ContextAuth';
import { OIconButton } from '@/components/OIconButton';
import { headerCopy, pageTitles } from '@/config/site';
import { LogOut, Menu, UserCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import './index.css';

const navItems = [
  { label: pageTitles.home, to: '/' },
  { label: pageTitles.onlineTools, to: '/tools' },
  { label: pageTitles.products, to: '/products' },
  { label: pageTitles.team, to: '/team' },
  { label: pageTitles.privacy, to: '/privacy' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, openLogin, logout, user } = useAuth();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <header className='site-header'>
      <Link
        to='/'
        className='brand-link interactive'
        aria-label={headerCopy.brandAriaLabel}
      >
        <img
          src='https://cos.orz2.online/Orz2/Logo/logo_light_320x320.webp'
          alt='ORZ2'
          className='brand-logo'
        />
      </Link>
      <nav className='desktop-nav' aria-label={headerCopy.navAriaLabel}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? 'nav-link active interactive' : 'nav-link interactive'
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <UserInfoModule
        isAuthenticated={isAuthenticated}
        onLogin={openLogin}
        onLogout={logout}
        userName={user?.name}
        variant='desktop'
      />
      <OIconButton
        className='mobile-menu-button'
        aria-label={
          isOpen ? headerCopy.closeNavAriaLabel : headerCopy.openNavAriaLabel
        }
        aria-expanded={isOpen}
        onClick={() => setIsOpen(value => !value)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </OIconButton>
      <div className={isOpen ? 'mobile-nav open' : 'mobile-nav'}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? 'nav-link active interactive' : 'nav-link interactive'
            }
          >
            {item.label}
          </NavLink>
        ))}
        <UserInfoModule
          isAuthenticated={isAuthenticated}
          onLogin={openLogin}
          onLogout={logout}
          userName={user?.name}
          variant='mobile'
        />
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
  variant: 'desktop' | 'mobile';
}) {
  const className =
    variant === 'desktop' ? 'nav-user desktop-only' : 'nav-user';

  if (!isAuthenticated) {
    return (
      <button
        className={`${className} logged-out interactive`}
        type='button'
        onClick={onLogin}
      >
        <UserCircle size={20} aria-hidden='true' />
        <span>{headerCopy.loggedOut}</span>
      </button>
    );
  }

  return (
    <div className={`${className} logged-in`}>
      <span className='nav-user-avatar' aria-hidden='true'>
        {userName?.slice(0, 1) || headerCopy.defaultAvatar}
      </span>
      <span className='nav-user-copy'>
        <strong>{userName || headerCopy.defaultUserName}</strong>
        <small>{headerCopy.loggedIn}</small>
      </span>
      <button
        className='nav-logout interactive'
        type='button'
        aria-label={headerCopy.logoutAriaLabel}
        onClick={onLogout}
      >
        <LogOut size={16} aria-hidden='true' />
      </button>
    </div>
  );
}
