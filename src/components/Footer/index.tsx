import { siteConfig } from '@/config';
import { useI18n } from '@/i18n';
import { Link } from 'react-router-dom';
import './index.css';

export function Footer() {
  const { localizePath, messages } = useI18n();
  const footerCopy = messages.footer;
  const pageTitles = messages.pageTitles;
  return (
    <footer className='bg-footer text-footer-text'>
      <div className='footer-grid'>
        <div>
          <img
            className='h-[46px] w-[46px] overflow-hidden rounded-[10px] object-contain'
            src='https://cos.orz2.online/Orz2/Logo/logo_dark_320x320.webp'
            alt='ORZ2'
          />
          <p className='mt-2 text-sm leading-relaxed text-footer-copy'>
            {footerCopy.brandDescription}
          </p>
        </div>
        <nav
          className='grid content-start gap-2'
          aria-label={footerCopy.navAriaLabel}
        >
          <h2 className='!mb-[14px] text-[15px] !text-white'>
            {footerCopy.sections.nav}
          </h2>
          <Link
            className='interactive w-fit text-sm leading-relaxed text-footer-copy underline-offset-[3px] hover:!text-white hover:underline'
            to={localizePath('/')}
          >
            {pageTitles.home}
          </Link>
          <Link
            className='interactive w-fit text-sm leading-relaxed text-footer-copy underline-offset-[3px] hover:!text-white hover:underline'
            to={localizePath('/tools')}
          >
            {pageTitles.onlineTools}
          </Link>
          <Link
            className='interactive w-fit text-sm leading-relaxed text-footer-copy underline-offset-[3px] hover:!text-white hover:underline'
            to={localizePath('/products')}
          >
            {pageTitles.products}
          </Link>
          <Link
            className='interactive w-fit text-sm leading-relaxed text-footer-copy underline-offset-[3px] hover:!text-white hover:underline'
            to={localizePath('/team')}
          >
            {pageTitles.team}
          </Link>
          <Link
            className='interactive w-fit text-sm leading-relaxed text-footer-copy underline-offset-[3px] hover:!text-white hover:underline'
            to={localizePath('/privacy')}
          >
            {pageTitles.privacy}
          </Link>
          <Link
            className='interactive w-fit text-sm leading-relaxed text-footer-copy underline-offset-[3px] hover:!text-white hover:underline'
            to={localizePath('/design-system')}
          >
            {pageTitles.designSystem}
          </Link>
        </nav>
        <div className='grid content-start gap-2'>
          <h2 className='!mb-[14px] text-[15px] !text-white'>
            {footerCopy.sections.contact}
          </h2>
          <a
            className='interactive w-fit text-sm leading-relaxed text-footer-copy underline-offset-[3px] hover:!text-white hover:underline'
            href={`mailto:${siteConfig.contactEmail}`}
          >
            {siteConfig.contactEmail}
          </a>
          <p className='text-sm leading-relaxed text-footer-copy'>
            {footerCopy.contactSupport}
          </p>
        </div>
        <div className='grid content-start gap-2'>
          <h2 className='!mb-[14px] text-[15px] !text-white'>
            {footerCopy.sections.compliance}
          </h2>
          <p className='text-sm leading-relaxed text-footer-copy'>
            {footerCopy.complianceNote}
          </p>
          <Link
            className='interactive w-fit text-sm leading-relaxed text-footer-copy underline-offset-[3px] hover:!text-white hover:underline'
            to={localizePath('/privacy')}
          >
            {footerCopy.viewPrivacy}
          </Link>
        </div>
      </div>
      <div className='footer-bottom mx-auto flex justify-between gap-4 border-t border-white/10 px-0 pt-[18px] pb-[26px] text-[13px] text-footer-muted max-sm:flex-col'>
        <span>{footerCopy.copyright}</span>
        <span>{footerCopy.tagline}</span>
      </div>
    </footer>
  );
}
