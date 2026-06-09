import { useAuth } from '@/components/ContextAuth';
import { OIconButton } from '@/components/OIconButton';
import { ORadio, type ORadioOption } from '@/components/ORadio';
import { localeNames, localeShortNames, useI18n, type Locale } from '@/i18n';
import { useTheme, type ThemePreference } from '@/theme';
import { LogOut, Menu, Monitor, Moon, Sun, UserCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import './index.css';

export function OHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, openLogin, logout, user } = useAuth();
  const { locale, locales, localizePath, messages, switchLocale } = useI18n();
  const headerCopy = messages.header;
  const pageTitles = messages.pageTitles;
  const navItems = [
    { label: pageTitles.home, to: '/' },
    { label: pageTitles.onlineTools, to: '/tools' },
    { label: pageTitles.products, to: '/products' },
    { label: pageTitles.team, to: '/team' },
    { label: pageTitles.privacy, to: '/privacy' },
  ];

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <header className='site-header'>
      <Link
        to={localizePath('/')}
        className='brand-link interactive'
        aria-label={headerCopy.brandAriaLabel}
      >
        <img
          src='https://cos.orz2.online/Logo/orz2/logo_light_320x320.webp'
          alt='ORZ2'
          className='brand-logo'
        />
      </Link>
      <nav className='desktop-nav' aria-label={headerCopy.navAriaLabel}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={localizePath(item.to)}
            end={item.to === '/'}
            className={({ isActive }) =>
              isActive ? 'nav-link active interactive' : 'nav-link interactive'
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <OHeaderPreferenceControls
        locale={locale}
        locales={locales}
        onLocaleChange={switchLocale}
        variant='desktop'
      />
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
        <nav className='mobile-nav-links' aria-label={headerCopy.navAriaLabel}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={localizePath(item.to)}
              end={item.to === '/'}
              className={({ isActive }) =>
                isActive
                  ? 'nav-link active interactive'
                  : 'nav-link interactive'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className='mobile-nav-panel'>
          <OHeaderPreferenceControls
            locale={locale}
            locales={locales}
            onLocaleChange={switchLocale}
            variant='mobile'
          />
        </div>
        <div className='mobile-nav-account'>
          <UserInfoModule
            isAuthenticated={isAuthenticated}
            onLogin={openLogin}
            onLogout={logout}
            userName={user?.name}
            variant='mobile'
          />
        </div>
      </div>
    </header>
  );
}

function OHeaderPreferenceControls({
  locale,
  locales,
  onLocaleChange,
  variant,
}: {
  locale: Locale;
  locales: readonly Locale[];
  onLocaleChange: (locale: Locale) => void;
  variant: 'desktop' | 'mobile';
}) {
  const { preference, setPreference } = useTheme();
  const { messages } = useI18n();
  const localeOptions: ORadioOption<Locale>[] = locales.map(item => ({
    value: item,
    label: localeNames[item],
    ariaLabel: `${messages.locale.switchTo} ${localeNames[item]}`,
  }));
  const desktopLocaleOptions: ORadioOption<Locale>[] = locales.map(item => ({
    value: item,
    label: localeShortNames[item],
  }));
  const themeOptions: ORadioOption<ThemePreference>[] = [
    {
      value: 'system',
      label: messages.theme.system,
      ariaLabel: messages.theme.switchToSystem,
      icon: Monitor,
    },
    {
      value: 'light',
      label: messages.theme.light,
      ariaLabel: messages.theme.switchToLight,
      icon: Sun,
    },
    {
      value: 'dark',
      label: messages.theme.dark,
      ariaLabel: messages.theme.switchToDark,
      icon: Moon,
    },
  ];
  const currentThemeOption =
    themeOptions.find(option => option.value === preference) ?? themeOptions[0];
  const CurrentThemeIcon = currentThemeOption.icon ?? Monitor;

  function cycleThemePreference() {
    const order: ThemePreference[] = ['system', 'light', 'dark'];
    const nextIndex = (order.indexOf(preference) + 1) % order.length;
    setPreference(order[nextIndex]);
  }

  if (variant === 'desktop') {
    return (
      <div className='header-preferences desktop-only'>
        <div
          className='desktop-locale-switch'
          aria-label={messages.locale.ariaLabel}
        >
          {desktopLocaleOptions.map(option => (
            <button
              key={option.value}
              className={
                option.value === locale ? 'active interactive' : 'interactive'
              }
              type='button'
              aria-pressed={option.value === locale}
              onClick={() => onLocaleChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <OIconButton
          aria-label={currentThemeOption.ariaLabel ?? messages.theme.ariaLabel}
          className='theme-cycle-button'
          hoverTranslate={false}
          onClick={cycleThemePreference}
          size='sm'
          title={currentThemeOption.label}
        >
          <CurrentThemeIcon size={16} aria-hidden='true' />
        </OIconButton>
      </div>
    );
  }

  return (
    <div className='header-preferences mobile-preferences'>
      <ORadio
        ariaLabel={messages.locale.ariaLabel}
        className='header-radio header-locale-radio'
        options={localeOptions}
        value={locale}
        onChange={onLocaleChange}
      />
      <ORadio
        ariaLabel={messages.theme.ariaLabel}
        className='header-radio header-theme-radio'
        options={themeOptions}
        value={preference}
        onChange={setPreference}
      />
    </div>
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
  const { messages } = useI18n();
  const headerCopy = messages.header;
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
