import { OButton } from '@/components/OButton';
import { OCard } from '@/components/OCard';
import { OPageHero } from '@/components/OPageHero';
import { Seo } from '@/components/Seo';
import { getToolSeo } from '@/config/seo';
import { useI18n } from '@/hooks/useI18n';
import { getTools } from '@/i18n';
import {
  utilityTools,
  type UtilityToolKind,
  type UtilityToolSlug,
} from '@/pages/Tools/ToolUtility/config';
import {
  ArrowLeft,
  Braces,
  Clipboard,
  Palette,
  QrCode,
  RefreshCcw,
  TextCursorInput,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './index.css';

function getSlug(pathname: string): UtilityToolSlug {
  const segments = pathname.split('/').filter(Boolean);
  const slug = segments[segments.length - 1] as UtilityToolSlug;
  return slug in utilityTools ? slug : 'json-formatter';
}

function iconFor(kind: UtilityToolKind) {
  return {
    json: Braces,
    color: Palette,
    base64: TextCursorInput,
    markdown: Clipboard,
    qrcode: QrCode,
  }[kind];
}

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
    (a, b) => b - a
  );
  return (light + 0.05) / (dark + 0.05);
}

function renderMarkdown(source: string) {
  const nodes: ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];

  source.split('\n').forEach((line, index) => {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        nodes.push(<pre key={`code-${index}`}>{codeLines.join('\n')}</pre>);
        codeLines = [];
      }
      inCodeBlock = !inCodeBlock;
      return;
    }
    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }
    if (line.startsWith('# ')) {
      nodes.push(<h2 key={index}>{line.slice(2)}</h2>);
    } else if (line.startsWith('## ')) {
      nodes.push(<h3 key={index}>{line.slice(3)}</h3>);
    } else if (line.startsWith('- ')) {
      nodes.push(<li key={index}>{line.slice(2)}</li>);
    } else if (line.startsWith('> ')) {
      nodes.push(<blockquote key={index}>{line.slice(2)}</blockquote>);
    } else if (line) {
      nodes.push(<p key={index}>{line}</p>);
    }
  });
  if (codeLines.length)
    nodes.push(<pre key='code-final'>{codeLines.join('\n')}</pre>);
  return nodes;
}

export function UtilityToolPage() {
  const { locale, localizePath, messages } = useI18n();
  const { pathname } = useLocation();
  const slug = getSlug(pathname);
  const { id, kind } = utilityTools[slug];
  const copy = messages.utilityTool;
  const tool = useMemo(
    () => getTools(locale).find(item => item.id === id),
    [id, locale]
  );
  const seo = useMemo(() => getToolSeo(locale), [locale]);
  const [input, setInput] = useState(
    kind === 'markdown'
      ? copy.markdownPlaceholder
      : kind === 'qrcode'
        ? copy.qrcodePlaceholder
        : ''
  );
  const [output, setOutput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [color, setColor] = useState('#16a34a');
  const [background, setBackground] = useState('#ffffff');
  const [size, setSize] = useState(240);
  const qrRef = useRef<SVGSVGElement>(null);
  const Icon = iconFor(kind);
  const ratio = contrastRatio(color, background);

  function process(action: 'format' | 'minify' | 'encode' | 'decode') {
    try {
      if (kind === 'json') {
        const value = JSON.parse(input);
        setOutput(
          action === 'minify'
            ? JSON.stringify(value)
            : JSON.stringify(value, null, 2)
        );
      }
      if (kind === 'base64') {
        setOutput(
          action === 'encode'
            ? window.btoa(unescape(encodeURIComponent(input)))
            : decodeURIComponent(escape(window.atob(input)))
        );
      }
      setFeedback('');
    } catch {
      setFeedback(kind === 'json' ? copy.invalidJson : copy.invalidBase64);
    }
  }

  async function copyOutput() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setFeedback(copy.copied);
  }

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
    <>
      <Seo config={seo[slug]} />
      <section className='utility-tool-page'>
        <Link
          className='utility-back-link interactive'
          to={localizePath('/tools')}
        >
          <ArrowLeft size={16} aria-hidden='true' />
          {copy.backToTools}
        </Link>
        <OPageHero
          className='utility-tool-hero'
          description={tool?.summary}
          title={tool?.name ?? slug}
        >
          <span className='utility-tool-chip'>
            <Icon size={16} aria-hidden='true' />
            {tool?.badges[0]}
          </span>
        </OPageHero>
        {kind === 'color' ? (
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
              <output className='utility-color-value'>
                {color.toUpperCase()}
              </output>
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
        ) : kind === 'qrcode' ? (
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
        ) : kind === 'markdown' ? (
          <section className='utility-workbench'>
            <OCard as='section' className='utility-card' padding='lg'>
              <label>
                {copy.input}
                <textarea
                  value={input}
                  placeholder={copy.markdownPlaceholder}
                  onChange={event => setInput(event.target.value)}
                />
              </label>
            </OCard>
            <OCard as='section' className='utility-card' padding='lg'>
              <h2>{copy.preview}</h2>
              <p className='utility-markdown-hint'>{copy.markdownHint}</p>
              <div className='utility-markdown-preview'>
                {renderMarkdown(input)}
              </div>
            </OCard>
          </section>
        ) : (
          <section className='utility-workbench'>
            <OCard as='section' className='utility-card' padding='lg'>
              <label>
                {copy.input}
                <textarea
                  value={input}
                  placeholder={
                    kind === 'json'
                      ? copy.jsonPlaceholder
                      : copy.base64Placeholder
                  }
                  onChange={event => {
                    setInput(event.target.value);
                    setFeedback('');
                  }}
                />
              </label>
              <div className='utility-actions'>
                {kind === 'json' ? (
                  <>
                    <OButton onClick={() => process('format')} type='button'>
                      {copy.format}
                    </OButton>
                    <OButton
                      onClick={() => process('minify')}
                      type='button'
                      variant='secondary'
                    >
                      {copy.minify}
                    </OButton>
                  </>
                ) : (
                  <>
                    <OButton onClick={() => process('encode')} type='button'>
                      {copy.encode}
                    </OButton>
                    <OButton
                      onClick={() => process('decode')}
                      type='button'
                      variant='secondary'
                    >
                      {copy.decode}
                    </OButton>
                  </>
                )}
                <OButton
                  onClick={() => {
                    setInput('');
                    setOutput('');
                    setFeedback('');
                  }}
                  type='button'
                  variant='ghost'
                >
                  <RefreshCcw size={15} aria-hidden='true' />
                  {copy.clear}
                </OButton>
              </div>
            </OCard>
            <OCard as='section' className='utility-card' padding='lg'>
              <label>
                {copy.output}
                <textarea readOnly value={output} />
              </label>
              <OButton
                disabled={!output}
                onClick={copyOutput}
                type='button'
                variant='secondary'
              >
                {copy.copy}
              </OButton>
            </OCard>
          </section>
        )}
        {feedback ? (
          <p className='utility-feedback' role='alert'>
            {feedback}
          </p>
        ) : null}
      </section>
    </>
  );
}
