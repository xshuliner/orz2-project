import { siteConfig } from '@/config/site';
import { useBuildInfo } from '@/hooks/useBuildInfo';
import { useI18n } from '@/hooks/useI18n';
import { getBuildInfoCommit, getBuildInfoVersion } from '@/utils/buildInfo';
import { Link } from 'react-router-dom';
import './index.css';

export function OFooter() {
  const { localizePath, messages } = useI18n();
  const { info } = useBuildInfo();
  const footerCopy = messages.footer;
  const pageTitles = messages.pageTitles;
  const buildInfoVersion = info ? getBuildInfoVersion(info) : '';
  const buildInfoCommit = info ? getBuildInfoCommit(info) : '';
  const buildInfoSummary = [buildInfoVersion, buildInfoCommit]
    .filter(Boolean)
    .join(' · ');
  const footerNavItems = [
    { label: pageTitles.privacy, to: '/privacy' },
    { label: pageTitles.designSystem, to: '/design-system' },
    { label: pageTitles.buildInfo, to: '/build-info' },
  ];
  return (
    <footer className='bg-footer text-footer-text'>
      <div className='footer-grid'>
        <div>
          <img
            className='h-[46px] w-[46px] overflow-hidden rounded-[10px] object-contain'
            src='https://cos.orz2.online/Logo/orz2/logo_dark_320x320.webp'
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
          {footerNavItems.map(item => (
            <Link
              key={item.to}
              className='interactive w-fit text-sm leading-relaxed text-footer-copy underline-offset-[3px] hover:!text-white hover:underline'
              to={localizePath(item.to)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className='grid content-start gap-2'>
          <h2 className='!mb-[14px] text-[15px] !text-white'>
            {footerCopy.sections.friendlyLinks}
          </h2>
          {footerCopy.friendlyLinks.map(link => {
            const key = `${link.name}-${link.url}`;
            return (
              <a
                key={key}
                className='interactive w-fit text-sm leading-relaxed text-footer-copy underline-offset-[3px] hover:!text-white hover:underline'
                href={link.url}
                target='_blank'
                rel='noopener noreferrer'
              >
                {link.name}
              </a>
            );
          })}
        </div>
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
        {/* <div className='grid content-start gap-2'>
          <h2 className='!mb-[14px] text-[15px] !text-white'>
            {footerCopy.sections.compliance}
          </h2>
          <p className='text-sm leading-relaxed text-footer-copy'>
            {footerCopy.complianceNote}
          </p>
        </div> */}
      </div>
      <div className='footer-bottom mx-auto flex justify-between gap-4 border-t border-white/10 px-0 pt-[18px] pb-[26px] text-[13px] text-footer-muted max-sm:flex-col'>
        <span>{footerCopy.copyright}</span>
        <div className='footer-bottom-meta'>
          {buildInfoSummary ? (
            <Link
              className='interactive footer-build-info-link'
              to={localizePath('/build-info')}
            >
              <span>{footerCopy.buildInfoLabel}</span>
              <code>{buildInfoSummary}</code>
            </Link>
          ) : null}
          <span>{footerCopy.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
