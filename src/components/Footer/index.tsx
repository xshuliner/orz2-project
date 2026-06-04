import { siteConfig } from '@/config';
import { footerCopy, pageTitles } from '@/config/site';
import { Link } from 'react-router-dom';
import './index.css';

export function Footer() {
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
            to='/'
          >
            {pageTitles.home}
          </Link>
          <Link
            className='interactive w-fit text-sm leading-relaxed text-footer-copy underline-offset-[3px] hover:!text-white hover:underline'
            to='/tools'
          >
            {pageTitles.onlineTools}
          </Link>
          <Link
            className='interactive w-fit text-sm leading-relaxed text-footer-copy underline-offset-[3px] hover:!text-white hover:underline'
            to='/products'
          >
            {pageTitles.products}
          </Link>
          <Link
            className='interactive w-fit text-sm leading-relaxed text-footer-copy underline-offset-[3px] hover:!text-white hover:underline'
            to='/team'
          >
            {pageTitles.team}
          </Link>
          <Link
            className='interactive w-fit text-sm leading-relaxed text-footer-copy underline-offset-[3px] hover:!text-white hover:underline'
            to='/privacy'
          >
            {pageTitles.privacy}
          </Link>
          <Link
            className='interactive w-fit text-sm leading-relaxed text-footer-copy underline-offset-[3px] hover:!text-white hover:underline'
            to='/design-system'
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
            to='/privacy'
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
