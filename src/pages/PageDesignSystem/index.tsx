import { OBadge } from '@/components/OBadge';
import { OButton } from '@/components/OButton';
import { OCard } from '@/components/OCard';
import { OCardCatalog } from '@/components/OCardCatalog';
import { OEmptyState } from '@/components/OEmptyState';
import { OIconButton } from '@/components/OIconButton';
import { OModal } from '@/components/OModal';
import { OPageHero } from '@/components/OPageHero';
import { OSectionHeading } from '@/components/OSectionHeading';
import { Seo } from '@/components/Seo';
import { getPageSeo } from '@/config/seo';
import { useI18n } from '@/hooks/useI18n';
import { getProducts, getTools } from '@/i18n';
import type { CatalogItem } from '@/types/catalog';
import { ArrowUpRight, Plus, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import './index.css';

const colors = [
  { value: 'var(--color-green)' },
  { value: 'var(--color-green-dark)' },
  { value: 'var(--color-ink)' },
  { value: 'var(--color-muted)' },
  { value: 'var(--color-line)' },
  { value: 'var(--color-green-soft)' },
];

const spacingScale = [
  ['4', 'var(--space-1)'],
  ['8', 'var(--space-2)'],
  ['12', 'var(--space-3)'],
  ['16', 'var(--space-4)'],
  ['24', 'var(--space-6)'],
  ['32', 'var(--space-8)'],
] as const;

const typeScaleValues = [
  'var(--text-caption)',
  'var(--text-body-sm)',
  'var(--text-body)',
  'var(--text-lead)',
  'var(--text-heading-md)',
] as const;

function isCatalogItem(item: CatalogItem | undefined): item is CatalogItem {
  return Boolean(item);
}

export function PageDesignSystem() {
  const { locale, messages } = useI18n();
  const pageSeo = getPageSeo(locale);
  const copy = messages.designSystem;
  const products = getProducts(locale);
  const tools = getTools(locale);
  const catalogShowcaseItems = [
    products.find(item => item.id === 'weather'),
    products.find(item => item.id === 'silicon'),
    products.find(item => item.id === 'fiveball'),
    products.find(item => item.id === 'orz2-blog'),
    tools.find(item => item.id === 'tool-wechat-publisher'),
    products.find(item => item.id === 'leafy-note'),
  ].filter(isCatalogItem);
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Seo config={pageSeo.designSystem} />
      <OPageHero title={copy.heroTitle} description={copy.heroDescription} />
      <div className='design-system-page'>
        <section className='design-system-section'>
          <OSectionHeading
            title={copy.sections.visual.title}
            description={copy.sections.visual.description}
          />
          <div className='design-token-grid'>
            {colors.map((color, index) => (
              <OCard
                className='design-color-card'
                key={copy.colors[index]}
                padding='sm'
              >
                <span style={{ background: color.value }} />
                <strong>{copy.colors[index]}</strong>
                <code>{color.value}</code>
              </OCard>
            ))}
          </div>
          <div className='design-foundation-grid'>
            <OCard className='design-foundation-card' padding='md'>
              <strong>{copy.labels.radius}</strong>
              <div className='design-radius-row'>
                <span>Control · 8px</span>
                <span>Card · 8px</span>
                <span>Modal · 12px</span>
              </div>
            </OCard>
            <OCard className='design-foundation-card' padding='md'>
              <strong>{copy.labels.shadow}</strong>
              <div className='design-shadow-row'>
                <span>Small</span>
                <span>Hover</span>
                <span>Modal</span>
              </div>
            </OCard>
          </div>
          <div className='design-foundation-grid'>
            <OCard className='design-foundation-card' padding='md'>
              <strong>{copy.labels.spacing}</strong>
              <div className='design-spacing-list'>
                {spacingScale.map(([label, value]) => (
                  <span key={label}>
                    <i style={{ width: value }} />
                    {label}px
                  </span>
                ))}
              </div>
            </OCard>
            <OCard className='design-foundation-card' padding='md'>
              <strong>{copy.labels.typography}</strong>
              <div className='design-type-list'>
                {copy.typography.map(([label, description], index) => (
                  <span
                    key={label}
                    style={{ fontSize: typeScaleValues[index] }}
                  >
                    <b>{label}</b>
                    <small>{description}</small>
                  </span>
                ))}
              </div>
            </OCard>
          </div>
        </section>

        <section className='design-system-section'>
          <OSectionHeading
            title={copy.sections.buttons.title}
            description={copy.sections.buttons.description}
          />
          <OCard className='design-component-panel' padding='md' tone='soft'>
            <div className='design-action-row'>
              <OButton size='sm' variant='ghost'>
                {copy.labels.compactButton}
              </OButton>
              <OButton>
                {copy.labels.primaryAction}
                <ArrowUpRight size={17} aria-hidden='true' />
              </OButton>
              <OButton size='lg'>{copy.labels.keyAction}</OButton>
              <OButton variant='secondary'>
                {copy.labels.secondaryAction}
              </OButton>
              <OButton variant='ghost'>{copy.labels.ghostAction}</OButton>
              <OButton disabled>{copy.labels.disabledState}</OButton>
              <OIconButton aria-label={copy.labels.addItem}>
                <Plus size={18} aria-hidden='true' />
              </OIconButton>
            </div>
            <div className='design-action-row'>
              <OBadge>{copy.labels.defaultBadge}</OBadge>
              <OBadge tone='brand'>{copy.labels.brandBadge}</OBadge>
              <OBadge tone='warning'>{copy.labels.warningBadge}</OBadge>
              <OBadge tone='danger'>{copy.labels.dangerBadge}</OBadge>
              <OBadge pill tone='brand'>
                {copy.labels.pillBadge}
              </OBadge>
            </div>
          </OCard>
        </section>

        <section className='design-system-section'>
          <OSectionHeading
            title={copy.sections.cards.title}
            description={copy.sections.cards.description}
          />
          <div className='design-card-grid'>
            {copy.cardTones.map(([tone, title, description]) => (
              <OCard
                className='design-tone-card'
                interactive
                key={tone}
                padding='md'
                tone={tone}
              >
                <OBadge tone={tone === 'danger' ? 'danger' : 'brand'}>
                  {tone}
                </OBadge>
                <h3>{title}</h3>
                <p>{description}</p>
              </OCard>
            ))}
            <OCard accentBar className='design-tone-card' padding='md'>
              <OBadge tone='brand'>accentBar</OBadge>
              <h3>{copy.labels.accentBar}</h3>
              <p>{copy.labels.accentBarDescription}</p>
            </OCard>
          </div>
        </section>

        <section className='design-system-section'>
          <OSectionHeading
            title={copy.sections.catalog.title}
            description={copy.sections.catalog.description}
          />
          <div className='design-catalog-feature-grid'>
            {copy.catalogFeatureGroups.map(([title, description]) => (
              <OCard
                className='design-catalog-feature-card'
                key={title}
                padding='md'
                tone='soft'
              >
                <strong>{title}</strong>
                <span>{description}</span>
              </OCard>
            ))}
          </div>
          <div className='design-catalog-grid'>
            {catalogShowcaseItems.map(item => (
              <OCardCatalog item={item} key={item.id} />
            ))}
          </div>
        </section>

        <section className='design-system-section'>
          <OSectionHeading
            title={copy.sections.states.title}
            description={copy.sections.states.description}
          />
          <OEmptyState>{copy.labels.emptyState}</OEmptyState>
          <div className='design-modal-action'>
            <OButton onClick={() => setModalOpen(true)}>
              {copy.labels.openModal}
            </OButton>
          </div>
        </section>
      </div>

      <OModal
        className='design-example-modal'
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        titleId='design-example-modal-title'
      >
        <OIconButton
          className='design-example-modal-close'
          aria-label={copy.labels.closeModal}
          onClick={() => setModalOpen(false)}
          size='sm'
          variant='ghost'
        >
          <X size={18} aria-hidden='true' />
        </OIconButton>
        <span className='design-example-modal-icon' aria-hidden='true'>
          <Sparkles size={22} />
        </span>
        <h2 id='design-example-modal-title'>{copy.labels.modalTitle}</h2>
        <p>{copy.labels.modalDescription}</p>
        <div className='design-action-row'>
          <OButton variant='ghost' onClick={() => setModalOpen(false)}>
            {copy.labels.cancel}
          </OButton>
          <OButton onClick={() => setModalOpen(false)}>
            {copy.labels.confirm}
          </OButton>
        </div>
      </OModal>
    </>
  );
}
