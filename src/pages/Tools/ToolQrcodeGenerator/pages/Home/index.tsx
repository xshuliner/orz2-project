import { LayoutPage } from '@/components/LayoutPage';
import { OButton } from '@/components/OButton';
import { OCard } from '@/components/OCard';
import { useI18n } from '@/hooks/useI18n';
import {
  qrcodeGeneratorSeoKey,
  qrcodeGeneratorToolId,
} from '@/pages/Tools/ToolQrcodeGenerator/config';
import { QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useRef, useState } from 'react';

export function QrcodeGenerator() {
  const { messages } = useI18n();
  const copy = messages.utilityTool;
  const [input, setInput] = useState<string>(copy.qrcodePlaceholder);
  const [size, setSize] = useState(240);
  const qrRef = useRef<SVGSVGElement>(null);

  function downloadQr() {
    const svg = qrRef.current;
    if (!svg) return;
    const image = new Image();
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], {
      type: 'image/svg+xml',
    });
    const url = URL.createObjectURL(blob);
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      canvas.getContext('2d')?.drawImage(image, 0, 0, size, size);
      URL.revokeObjectURL(url);
      const link = document.createElement('a');
      link.download = 'orz2-qrcode.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    image.src = url;
  }

  return (
    <LayoutPage
      icon={QrCode}
      seoKey={qrcodeGeneratorSeoKey}
      toolId={qrcodeGeneratorToolId}
    >
      <section className='utility-single-grid'>
        <OCard as='section' className='utility-card' padding='lg'>
          <label>
            {copy.qrcodeContent}
            <textarea
              value={input}
              placeholder={copy.qrcodePlaceholder}
              onChange={event => setInput(event.target.value)}
            />
          </label>
          <label>
            {copy.qrcodeSize}
            <input
              min='128'
              max='512'
              step='16'
              type='range'
              value={size}
              onChange={event => setSize(Number(event.target.value))}
            />
          </label>
        </OCard>
        <OCard
          as='section'
          className='utility-card utility-qr-card'
          padding='lg'
        >
          <QRCodeSVG
            ref={qrRef}
            value={input || ' '}
            size={size}
            includeMargin
          />
          <OButton onClick={downloadQr} type='button'>
            {copy.download}
          </OButton>
        </OCard>
      </section>
    </LayoutPage>
  );
}
