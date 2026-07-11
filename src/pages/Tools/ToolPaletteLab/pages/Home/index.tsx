import { OCard } from '@/components/OCard';
import { useI18n } from '@/hooks/useI18n';
import { UtilityToolPageLayout } from '@/pages/Tools/components/UtilityToolPageLayout';
import {
  paletteLabSeoKey,
  paletteLabToolId,
} from '@/pages/Tools/ToolPaletteLab/config';
import { Palette } from 'lucide-react';
import { useState } from 'react';

function luminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    ?.map(value => parseInt(value, 16) / 255) ?? [0, 0, 0];
  return channels
    .map(value =>
      value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    )
    .reduce(
      (sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index],
      0
    );
}

function contrastRatio(foreground: string, background: string) {
  const [light, dark] = [luminance(foreground), luminance(background)].sort(
    (first, second) => second - first
  );
  return (light + 0.05) / (dark + 0.05);
}

export function PaletteLab() {
  const { messages } = useI18n();
  const copy = messages.utilityTool;
  const [color, setColor] = useState('#16a34a');
  const [background, setBackground] = useState('#ffffff');
  const ratio = contrastRatio(color, background);

  return (
    <UtilityToolPageLayout
      icon={Palette}
      seoKey={paletteLabSeoKey}
      toolId={paletteLabToolId}
    >
      <section className='utility-single-grid'>
        <OCard as='section' className='utility-card' padding='lg'>
          <label>
            {copy.color}
            <input
              aria-label={copy.color}
              type='color'
              value={color}
              onChange={event => setColor(event.target.value)}
            />
          </label>
          <output className='utility-color-value'>{color.toUpperCase()}</output>
        </OCard>
        <OCard as='section' className='utility-card' padding='lg'>
          <label>
            {copy.contrast}
            <input
              aria-label={copy.contrast}
              type='color'
              value={background}
              onChange={event => setBackground(event.target.value)}
            />
          </label>
          <div
            className='utility-contrast-preview'
            style={{ backgroundColor: background, color }}
          >
            Aa
          </div>
          <strong>
            {ratio.toFixed(2)}:1 ·{' '}
            {ratio >= 4.5 ? copy.accessible : copy.needsContrast}
          </strong>
        </OCard>
      </section>
    </UtilityToolPageLayout>
  );
}
