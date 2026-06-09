import { OBadge } from '@/components/OBadge';
import { OCard } from '@/components/OCard';
import { OTab } from '@/components/OTab';
import { OTooltip } from '@/components/OTooltip';
import {
  catalogStages,
  getStageLabel,
  getStageToneClass,
} from '@/config/catalog-stages';
import { useI18n } from '@/i18n';
import type {
  CatalogEntry,
  CatalogIconName,
  CatalogItem,
  CatalogPlatform,
} from '@/types';
import {
  recordCatalogRecentUsage,
  type CatalogRecentKind,
} from '@/utils/catalogRecentUsage';
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
  catalogType?: CatalogRecentKind;
  item: CatalogItem;
}

export function OCardCatalog({ catalogType, item }: OCardCatalogProps) {
  const { locale, localizePath, messages } = useI18n();
  const common = messages.common;
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

  function rememberUsage() {
    if (!catalogType) return;
    recordCatalogRecentUsage(catalogType, item.id);
  }

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
          <span
            className={`catalog-card-stage ${getStageToneClass(item.lifecycle.stage)}`}
            title={
              messages.catalogStages[item.lifecycle.stage]?.description ??
              catalogStages[item.lifecycle.stage].description
            }
          >
            <span aria-hidden='true' />
            {getStageLabel(item.lifecycle.stage, locale)}
          </span>
        </div>
      </div>

      <div className='catalog-card-copy'>
        <h3>{item.name}</h3>
        <p>{item.summary}</p>
      </div>

      <div
        className='catalog-platform-track'
        aria-label={common.platformAriaLabel}
      >
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
              <Link
                className='card-link interactive'
                to={localizePath(primaryLink.href)}
                onClick={rememberUsage}
              >
                <LogIn size={15} aria-hidden='true' />
                {common.openEntry}
              </Link>
            ) : (
              <a
                className='card-link interactive'
                href={primaryLink.href}
                target='_blank'
                rel='noreferrer'
                onClick={rememberUsage}
              >
                <LogIn size={15} aria-hidden='true' />
                {common.openEntry}
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
              onTriggerClick={rememberUsage}
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
                      ariaLabel={`${item.name} ${common.qrMode}`}
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
                        title={`${item.name} ${activeEntry.label} ${common.qrTitle}`}
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
                                ? common.sunCodePending
                                : common.sunCodeLoading}
                            </span>
                          </div>
                        ) : null}
                        {!failedSunCodes[activeEntry.id] ? (
                          <img
                            className={
                              loadedSunCodes[activeEntry.id] ? '' : 'is-loading'
                            }
                            src={activeEntry.imageUrl}
                            alt={`${item.name} ${activeEntry.label} ${common.sunCodeAlt}`}
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
                        <span>{common.directScanHint}</span>
                        {isInternalHref(activeEntry.href) ? (
                          <Link
                            className='catalog-entry-direct interactive'
                            to={localizePath(activeEntry.href)}
                            onClick={rememberUsage}
                          >
                            <ExternalLink size={14} aria-hidden='true' />
                            {common.openLink}
                          </Link>
                        ) : (
                          <a
                            className='catalog-entry-direct interactive'
                            href={activeEntry.href}
                            target='_blank'
                            rel='noreferrer'
                            onClick={rememberUsage}
                          >
                            <ExternalLink size={14} aria-hidden='true' />
                            {common.openLink}
                          </a>
                        )}
                      </>
                    ) : (
                      <span>{common.wechatScanHint}</span>
                    )}
                  </div>
                </div>
              }
            >
              <button className='catalog-scan-button interactive' type='button'>
                <QrCode size={15} strokeWidth={2} aria-hidden='true' />
                {common.scanExperience}
              </button>
            </OTooltip>
          ) : null}
          {!primaryLink && !defaultScanEntry ? (
            <span className='catalog-card-muted'>{common.preparing}</span>
          ) : null}
        </div>
      </div>
    </OCard>
  );
}
