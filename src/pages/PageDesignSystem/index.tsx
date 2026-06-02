import { OBadge } from '@/components/OBadge';
import { OButton } from '@/components/OButton';
import { OCard } from '@/components/OCard';
import { OEmptyState } from '@/components/OEmptyState';
import { OIconButton } from '@/components/OIconButton';
import { OModal } from '@/components/OModal';
import { OPageHero } from '@/components/OPageHero';
import { OSectionHeading } from '@/components/OSectionHeading';
import { Seo } from '@/components/Seo';
import { pageSeo } from '@/config/seo';
import { ArrowUpRight, Plus, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import './index.css';

const colors = [
  { name: 'Brand', value: 'var(--color-green)' },
  { name: 'Brand Dark', value: 'var(--color-green-dark)' },
  { name: 'Ink', value: 'var(--color-ink)' },
  { name: 'Muted', value: 'var(--color-muted)' },
  { name: 'Line', value: 'var(--color-line)' },
  { name: 'Soft', value: 'var(--color-green-soft)' },
];

const spacingScale = [
  ['4', 'var(--space-1)'],
  ['8', 'var(--space-2)'],
  ['12', 'var(--space-3)'],
  ['16', 'var(--space-4)'],
  ['24', 'var(--space-6)'],
  ['32', 'var(--space-8)'],
] as const;

const typeScale = [
  ['Caption', 'var(--text-caption)', '辅助说明与状态时间'],
  ['Body small', 'var(--text-body-sm)', '工具页正文与控件文字'],
  ['Body', 'var(--text-body)', '页面常规正文'],
  ['Lead', 'var(--text-lead)', '页面描述与重点说明'],
  ['Heading', 'var(--text-heading-md)', '弹窗和文章章节标题'],
] as const;

const cardTones = [
  ['default', '默认面板', '适合列表、摘要和常规内容。'],
  ['soft', '柔和面板', '适合次级信息和轻量分组。'],
  ['brand', '品牌面板', '适合进度、亮点和关键提示。'],
  ['warm', '暖色面板', '适合操作前的准备说明。'],
  ['danger', '危险面板', '适合错误信息和阻断性提醒。'],
] as const;

export function PageDesignSystem() {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Seo config={pageSeo.designSystem} />
      <OPageHero
        title='设计系统'
        description='ORZ2 公共组件、视觉 token 与交互状态的公开参考页。页面保持克制、清晰，也为工具扩展留下稳定的基础。'
      />
      <div className='design-system-page'>
        <section className='design-system-section'>
          <OSectionHeading
            title='视觉基础'
            description='颜色、圆角和阴影构成 ORZ2 绿色工具风格的基础语汇。'
          />
          <div className='design-token-grid'>
            {colors.map(color => (
              <OCard
                className='design-color-card'
                key={color.name}
                padding='sm'
              >
                <span style={{ background: color.value }} />
                <strong>{color.name}</strong>
                <code>{color.value}</code>
              </OCard>
            ))}
          </div>
          <div className='design-foundation-grid'>
            <OCard className='design-foundation-card' padding='md'>
              <strong>圆角</strong>
              <div className='design-radius-row'>
                <span>Control · 8px</span>
                <span>Card · 8px</span>
                <span>Modal · 12px</span>
              </div>
            </OCard>
            <OCard className='design-foundation-card' padding='md'>
              <strong>阴影</strong>
              <div className='design-shadow-row'>
                <span>Small</span>
                <span>Hover</span>
                <span>Modal</span>
              </div>
            </OCard>
          </div>
          <div className='design-foundation-grid'>
            <OCard className='design-foundation-card' padding='md'>
              <strong>间距层级</strong>
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
              <strong>排版层级</strong>
              <div className='design-type-list'>
                {typeScale.map(([label, value, description]) => (
                  <span key={label} style={{ fontSize: value }}>
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
            title='按钮与标签'
            description='统一动作层级，同时保留适合信息密度较高工具页的紧凑表达。'
          />
          <OCard className='design-component-panel' padding='md' tone='soft'>
            <div className='design-action-row'>
              <OButton size='sm' variant='ghost'>
                紧凑按钮
              </OButton>
              <OButton>
                主操作
                <ArrowUpRight size={17} aria-hidden='true' />
              </OButton>
              <OButton size='lg'>关键操作</OButton>
              <OButton variant='secondary'>次级操作</OButton>
              <OButton variant='ghost'>轻量操作</OButton>
              <OButton disabled>禁用状态</OButton>
              <OIconButton aria-label='增加项目'>
                <Plus size={18} aria-hidden='true' />
              </OIconButton>
            </div>
            <div className='design-action-row'>
              <OBadge>默认标签</OBadge>
              <OBadge tone='brand'>品牌标签</OBadge>
              <OBadge tone='warning'>提醒标签</OBadge>
              <OBadge tone='danger'>危险标签</OBadge>
              <OBadge pill tone='brand'>
                胶囊标签
              </OBadge>
            </div>
          </OCard>
        </section>

        <section className='design-system-section'>
          <OSectionHeading
            title='卡片与面板'
            description='OCard 统一容器质感，业务模块只需要选择语义明确的 tone。'
          />
          <div className='design-card-grid'>
            {cardTones.map(([tone, title, description]) => (
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
              <h3>强调边栏</h3>
              <p>用于表单面板和需要强化节奏的业务分组。</p>
            </OCard>
          </div>
        </section>

        <section className='design-system-section'>
          <OSectionHeading
            title='状态与弹窗'
            description='空状态和弹窗采用同一套视觉语言，保持反馈直接而温和。'
          />
          <OEmptyState>暂时没有匹配结果，调整条件后再试一次。</OEmptyState>
          <div className='design-modal-action'>
            <OButton onClick={() => setModalOpen(true)}>查看弹窗实例</OButton>
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
          aria-label='关闭示例弹窗'
          onClick={() => setModalOpen(false)}
          size='sm'
          variant='ghost'
        >
          <X size={18} aria-hidden='true' />
        </OIconButton>
        <span className='design-example-modal-icon' aria-hidden='true'>
          <Sparkles size={22} />
        </span>
        <h2 id='design-example-modal-title'>统一的弹窗容器</h2>
        <p>
          OModal 已封装遮罩、Esc
          关闭、点击遮罩关闭、页面滚动锁定和关闭后的焦点恢复。
        </p>
        <div className='design-action-row'>
          <OButton variant='ghost' onClick={() => setModalOpen(false)}>
            取消
          </OButton>
          <OButton onClick={() => setModalOpen(false)}>确认</OButton>
        </div>
      </OModal>
    </>
  );
}
