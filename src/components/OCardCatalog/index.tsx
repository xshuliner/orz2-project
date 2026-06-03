import { OBadge } from '@/components/OBadge';
import { OCard } from '@/components/OCard';
import { OTab } from '@/components/OTab';
import { OTooltip } from '@/components/OTooltip';
import type {
  CatalogEntry,
  CatalogIconName,
  CatalogItem,
  CatalogPlatform,
} from '@/types';
import {
  AppWindow,
  Boxes,
  Braces,
  ExternalLink,
  Gamepad2,
  GitBranch,
  Globe2,
  ImageDown,
  LogIn,
  Monitor,
  Palette,
  Puzzle,
  QrCode,
  ScanLine,
  Send,
  Smartphone,
  Sparkles,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import './index.css';

const mediaIcons: Record<CatalogIconName, LucideIcon> = {
  Braces,
  Gamepad2,
  Globe2,
  ImageDown,
  Palette,
  Send,
  Smartphone,
  Sparkles,
  Workflow,
};

const platformMeta: Record<
  CatalogPlatform,
  { icon: LucideIcon; label: string }
> = {
  web: { icon: Monitor, label: 'WEB' },
  h5: { icon: Smartphone, label: 'H5' },
  weapp: { icon: ScanLine, label: 'WEAPP' },
  app: { icon: AppWindow, label: 'APP' },
  extension: { icon: Puzzle, label: 'EXTENSION' },
};

function getPrimaryLink(entries: CatalogEntry[]) {
  return (
    entries.find(entry => entry.kind === 'link' && entry.primary) ??
    entries.find(entry => entry.kind === 'link')
  );
}

function isInternalHref(href: string) {
  return href.startsWith('/');
}

interface OCardCatalogProps {
  item: CatalogItem;
}

export function OCardCatalog({ item }: OCardCatalogProps) {
  const supportsMobileH5 = item.platform.includes('h5');
  const scannableEntries = item.entries.filter(
    entry =>
      entry.kind === 'sunCode' || (entry.kind === 'link' && supportsMobileH5)
  );
  const primaryLink = getPrimaryLink(item.entries);
  const defaultScanEntry =
    scannableEntries.find(entry => entry.primary) ?? scannableEntries[0];
  const [activeEntryId, setActiveEntryId] = useState(defaultScanEntry?.id);
  const [failedSunCodes, setFailedSunCodes] = useState<Record<string, boolean>>(
    {}
  );
  const [loadedSunCodes, setLoadedSunCodes] = useState<Record<string, boolean>>(
    {}
  );
  const activeEntry =
    scannableEntries.find(entry => entry.id === activeEntryId) ??
    defaultScanEntry;
  const scanTabOptions = scannableEntries.map(entry => ({
    label: entry.label,
    value: entry.id,
  }));
  const MediaIcon =
    item.media.kind === 'icon' ? mediaIcons[item.media.name] : null;

  return (
    <OCard
      as='article'
      className='catalog-card reveal-on-scroll'
      interactive
      padding='lg'
    >
      <div className='catalog-card-header'>
        <div className='catalog-card-media'>
          {MediaIcon ? (
            <MediaIcon size={22} strokeWidth={1.8} aria-hidden='true' />
          ) : null}
          {item.media.kind === 'image' ? (
            <>
              <Boxes
                className='catalog-card-fallback'
                size={22}
                strokeWidth={1.7}
                aria-hidden='true'
              />
              <img
                src={item.media.src}
                alt={item.media.alt ?? ''}
                width='52'
                height='52'
                loading='lazy'
                onError={event => {
                  event.currentTarget.hidden = true;
                }}
              />
            </>
          ) : null}
        </div>
        <div className='catalog-card-kicker'>
          <span className='catalog-card-category'>{item.group}</span>
          <span className='catalog-card-stage'>
            <span aria-hidden='true' />
            {item.lifecycle.stage}
          </span>
        </div>
      </div>

      <div className='catalog-card-copy'>
        <h3>{item.name}</h3>
        <p>{item.summary}</p>
      </div>

      <div className='catalog-platform-track' aria-label='支持平台'>
        {item.platform.map(platform => {
          const Icon = platformMeta[platform].icon;
          return (
            <span key={platform}>
              <Icon size={13} strokeWidth={2} aria-hidden='true' />
              {platformMeta[platform].label}
            </span>
          );
        })}
      </div>

      <div className='tag-row'>
        {item.badges.map(badge => (
          <OBadge key={badge} tone='brand'>
            {badge}
          </OBadge>
        ))}
      </div>

      <div className='catalog-card-footer'>
        <small className='catalog-card-version'>
          <GitBranch size={14} strokeWidth={1.8} aria-hidden='true' />
          <span>
            v{item.lifecycle.version} · {item.lifecycle.updatedAt}
          </span>
        </small>
        <div className='catalog-card-actions'>
          {primaryLink?.kind === 'link' ? (
            isInternalHref(primaryLink.href) ? (
              <Link className='card-link interactive' to={primaryLink.href}>
                <LogIn size={15} aria-hidden='true' />
                打开入口
              </Link>
            ) : (
              <a
                className='card-link interactive'
                href={primaryLink.href}
                target='_blank'
                rel='noreferrer'
              >
                <LogIn size={15} aria-hidden='true' />
                打开入口
              </a>
            )
          ) : null}
          {activeEntry ? (
            <OTooltip
              interactive
              className='catalog-scan-tooltip'
              contentClassName='catalog-entry-tooltip'
              maxWidth={336}
              placement='top-end'
              content={
                <div className='catalog-entry-panel'>
                  <div className='catalog-entry-panel-header'>
                    <div>
                      <span>{item.name}</span>
                      <strong>{activeEntry.label}</strong>
                    </div>
                  </div>

                  {scannableEntries.length > 1 ? (
                    <OTab
                      ariaLabel={`${item.name} 扫码模式`}
                      className='catalog-entry-tabs'
                      options={scanTabOptions}
                      value={activeEntry.id}
                      onChange={setActiveEntryId}
                    />
                  ) : null}

                  <div className='catalog-entry-code'>
                    {activeEntry.kind === 'link' ? (
                      <QRCodeSVG
                        value={activeEntry.qrValue}
                        size={184}
                        level='M'
                        marginSize={2}
                        title={`${item.name} ${activeEntry.label} 二维码`}
                      />
                    ) : (
                      <>
                        {!loadedSunCodes[activeEntry.id] ||
                        failedSunCodes[activeEntry.id] ? (
                          <div className='catalog-suncode-placeholder'>
                            <ScanLine
                              size={36}
                              strokeWidth={1.7}
                              aria-hidden='true'
                            />
                            <span>
                              {failedSunCodes[activeEntry.id]
                                ? '太阳码待上传'
                                : '太阳码加载中'}
                            </span>
                          </div>
                        ) : null}
                        {!failedSunCodes[activeEntry.id] ? (
                          <img
                            className={
                              loadedSunCodes[activeEntry.id] ? '' : 'is-loading'
                            }
                            src={activeEntry.imageUrl}
                            alt={`${item.name} ${activeEntry.label} 太阳码`}
                            width='184'
                            height='184'
                            loading='lazy'
                            onLoad={() =>
                              setLoadedSunCodes(loaded => ({
                                ...loaded,
                                [activeEntry.id]: true,
                              }))
                            }
                            onError={() =>
                              setFailedSunCodes(errors => ({
                                ...errors,
                                [activeEntry.id]: true,
                              }))
                            }
                          />
                        ) : null}
                      </>
                    )}
                  </div>

                  <div className='catalog-entry-hint'>
                    {activeEntry.kind === 'link' ? (
                      <>
                        <span>手机扫码打开，也可以直接访问入口。</span>
                        {isInternalHref(activeEntry.href) ? (
                          <Link
                            className='catalog-entry-direct interactive'
                            to={activeEntry.href}
                          >
                            <ExternalLink size={14} aria-hidden='true' />
                            打开链接
                          </Link>
                        ) : (
                          <a
                            className='catalog-entry-direct interactive'
                            href={activeEntry.href}
                            target='_blank'
                            rel='noreferrer'
                          >
                            <ExternalLink size={14} aria-hidden='true' />
                            打开链接
                          </a>
                        )}
                      </>
                    ) : (
                      <span>使用微信扫描太阳码体验小程序。</span>
                    )}
                  </div>
                </div>
              }
            >
              <button className='catalog-scan-button interactive' type='button'>
                <QrCode size={15} strokeWidth={2} aria-hidden='true' />
                扫码体验
              </button>
            </OTooltip>
          ) : null}
          {!primaryLink && !defaultScanEntry ? (
            <span className='catalog-card-muted'>筹备中</span>
          ) : null}
        </div>
      </div>
    </OCard>
  );
}
