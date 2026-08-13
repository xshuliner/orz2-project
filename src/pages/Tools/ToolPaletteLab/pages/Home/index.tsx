import { LayoutPage } from '@/components/LayoutPage';
import { OButton } from '@/components/OButton';
import { OCard } from '@/components/OCard';
import { OIconButton } from '@/components/OIconButton';
import { useI18n } from '@/hooks/useI18n';
import { ColorField } from '@/pages/Tools/ToolPaletteLab/components/ColorField';
import { PaletteSectionHeading } from '@/pages/Tools/ToolPaletteLab/components/PaletteSectionHeading';
import {
  paletteLabSeoKey,
  paletteLabToolId,
} from '@/pages/Tools/ToolPaletteLab/config';
import {
  classifyColor,
  getColorFormats,
  getColorHarmonies,
  getContrastRatio,
  getReadableTextColor,
  hexToRgb,
  parseColor,
  rgbToHex,
  type HarmonyScheme,
} from '@/pages/Tools/ToolPaletteLab/utils/color';
import {
  drawImageToCanvas,
  extractImageColors,
  sampleCanvasColor,
} from '@/pages/Tools/ToolPaletteLab/utils/image';
import {
  ArrowRightLeft,
  Check,
  Clipboard,
  Contrast,
  Eye,
  ImagePlus,
  Palette,
  Pipette,
  RefreshCcw,
  SwatchBook,
  Upload,
  X,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import './index.css';

interface EyeDropperResult {
  sRGBHex: string;
}

interface EyeDropperInstance {
  open: () => Promise<EyeDropperResult>;
}

interface EyeDropperConstructor {
  new (): EyeDropperInstance;
}

const formatOrder = ['hex', 'rgb', 'hsl', 'hsv'] as const;
const harmonyOrder: HarmonyScheme[] = [
  'complementary',
  'analogous',
  'triadic',
  'splitComplementary',
  'monochromatic',
];

function formatMessage(template: string, replacements: Record<string, string>) {
  return Object.entries(replacements).reduce(
    (message, [key, value]) => message.split(`{${key}}`).join(value),
    template
  );
}

export function PaletteLab() {
  const { messages } = useI18n();
  const copy = messages.utilityTool.paletteLab;
  const [color, setColor] = useState('#16A34A');
  const [colorInput, setColorInput] = useState(color);
  const [foreground, setForeground] = useState('#111827');
  const [background, setBackground] = useState('#FFFFFF');
  const [status, setStatus] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageColors, setImageColors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const rgb = useMemo(() => hexToRgb(color)!, [color]);
  const colorFormats = useMemo(() => getColorFormats(rgb), [rgb]);
  const classification = useMemo(() => classifyColor(rgb), [rgb]);
  const harmonies = useMemo(() => getColorHarmonies(rgb), [rgb]);
  const foregroundRgb = useMemo(() => hexToRgb(foreground)!, [foreground]);
  const backgroundRgb = useMemo(() => hexToRgb(background)!, [background]);
  const contrastRatio = useMemo(
    () => getContrastRatio(foregroundRgb, backgroundRgb),
    [backgroundRgb, foregroundRgb]
  );
  const readableText = useMemo(
    () => getReadableTextColor(backgroundRgb),
    [backgroundRgb]
  );
  const supportsEyeDropper =
    typeof window !== 'undefined' && 'EyeDropper' in window;

  useEffect(
    () => () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    },
    [imageUrl]
  );

  function selectColor(nextColor: string) {
    const parsed = parseColor(nextColor);
    if (!parsed) return;
    const normalized = rgbToHex(parsed);
    setColor(normalized);
    setColorInput(normalized);
    setStatus('');
  }

  function commitColorInput() {
    const parsed = parseColor(colorInput);
    if (!parsed) {
      setStatus(copy.invalidColor);
      return;
    }
    selectColor(rgbToHex(parsed));
  }

  async function copyValue(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setStatus(formatMessage(copy.copiedTemplate, { value }));
    } catch {
      setStatus(copy.copyFailed);
    }
  }

  async function pickScreenColor() {
    const EyeDropper = (
      window as typeof window & { EyeDropper?: EyeDropperConstructor }
    ).EyeDropper;
    if (!EyeDropper) {
      setStatus(copy.eyedropperUnsupported);
      return;
    }

    try {
      const result = await new EyeDropper().open();
      selectColor(result.sRGBHex);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setStatus(copy.eyedropperFailed);
    }
  }

  function clearImage() {
    setImageUrl('');
    setImageColors([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setStatus(copy.imageInvalid);
      event.target.value = '';
      return;
    }

    setImageUrl(URL.createObjectURL(file));
    setImageColors([]);
    setStatus('');
  }

  function handleImageLoad() {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas) return;
    drawImageToCanvas(image, canvas);
    setImageColors(extractImageColors(image));
  }

  function handleImageError() {
    clearImage();
    setStatus(copy.imageLoadFailed);
  }

  function handleCanvasClick(event: MouseEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const sampledColor = sampleCanvasColor(
      canvas,
      ((event.clientX - rect.left) / rect.width) * canvas.width,
      ((event.clientY - rect.top) / rect.height) * canvas.height
    );
    if (sampledColor) selectColor(sampledColor);
  }

  function handleCanvasKeyDown(event: KeyboardEvent<HTMLCanvasElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    const canvas = event.currentTarget;
    const sampledColor = sampleCanvasColor(
      canvas,
      canvas.width / 2,
      canvas.height / 2
    );
    if (sampledColor) selectColor(sampledColor);
  }

  const criteria = [
    {
      label: copy.criterionLabels.aaNormal,
      passed: contrastRatio >= 4.5,
    },
    { label: copy.criterionLabels.aaLarge, passed: contrastRatio >= 3 },
    { label: copy.criterionLabels.aaaNormal, passed: contrastRatio >= 7 },
    { label: copy.criterionLabels.aaaLarge, passed: contrastRatio >= 4.5 },
  ];

  return (
    <LayoutPage
      icon={Palette}
      seoKey={paletteLabSeoKey}
      toolId={paletteLabToolId}
    >
      <section className='palette-workbench'>
        <OCard
          as='section'
          className='palette-card palette-picker-card reveal-on-scroll'
          padding='lg'
        >
          <PaletteSectionHeading
            description={copy.pickerDescription}
            icon={Pipette}
            title={copy.pickerTitle}
          />

          <div
            className='palette-color-stage'
            style={{ backgroundColor: color }}
          >
            <strong style={{ color: getReadableTextColor(rgb).color }}>
              {color}
            </strong>
          </div>

          <div className='palette-color-input-row'>
            <input
              aria-label={copy.colorLabel}
              className='palette-native-color-input'
              type='color'
              value={color}
              onChange={event => selectColor(event.target.value)}
            />
            <input
              aria-invalid={!parseColor(colorInput)}
              aria-label={copy.colorLabel}
              className='palette-text-input'
              placeholder={copy.colorPlaceholder}
              spellCheck='false'
              value={colorInput}
              onBlur={commitColorInput}
              onChange={event => {
                setColorInput(event.target.value);
                setStatus('');
              }}
              onKeyDown={event => {
                if (event.key === 'Enter') commitColorInput();
              }}
            />
            <OButton
              disabled={!supportsEyeDropper}
              onClick={pickScreenColor}
              size='sm'
              type='button'
              variant='secondary'
            >
              <Pipette size={15} aria-hidden='true' />
              {copy.pickScreenColor}
            </OButton>
          </div>
          {!supportsEyeDropper ? (
            <p className='palette-inline-hint'>{copy.eyedropperUnsupported}</p>
          ) : null}

          <dl className='palette-recognition'>
            <div>
              <dt>{copy.recognizedLabel}</dt>
              <dd>
                {formatMessage(copy.recognizedTemplate, {
                  family: copy.familyLabels[classification.family],
                  tone: copy.toneLabels[classification.tone],
                })}
              </dd>
            </div>
            <div>
              <dt>{copy.formatLabels.hex}</dt>
              <dd>{colorFormats.hex}</dd>
            </div>
          </dl>
        </OCard>

        <OCard
          as='section'
          className='palette-card palette-image-card reveal-on-scroll'
          padding='lg'
        >
          <PaletteSectionHeading
            description={copy.imageDescription}
            icon={ImagePlus}
            title={copy.imageTitle}
          />

          <input
            ref={fileInputRef}
            accept='image/*'
            hidden
            type='file'
            onChange={handleImageChange}
          />

          {imageUrl ? (
            <div className='palette-image-workspace'>
              <img
                ref={imageRef}
                alt=''
                className='palette-visually-hidden'
                src={imageUrl}
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
              <canvas
                ref={canvasRef}
                aria-label={copy.imagePreviewLabel}
                className='palette-image-canvas'
                role='img'
                tabIndex={0}
                onClick={handleCanvasClick}
                onKeyDown={handleCanvasKeyDown}
              />
              <div className='palette-image-toolbar'>
                <p>{copy.imagePickHint}</p>
                <span>
                  <OButton
                    onClick={() => fileInputRef.current?.click()}
                    size='sm'
                    type='button'
                    variant='secondary'
                  >
                    <RefreshCcw size={15} aria-hidden='true' />
                    {copy.replaceImage}
                  </OButton>
                  <OIconButton
                    aria-label={copy.removeImage}
                    onClick={clearImage}
                    size='sm'
                    variant='ghost'
                  >
                    <X size={16} aria-hidden='true' />
                  </OIconButton>
                </span>
              </div>
            </div>
          ) : (
            <button
              className='palette-upload-zone interactive'
              type='button'
              onClick={() => fileInputRef.current?.click()}
            >
              <span aria-hidden='true'>
                <Upload size={23} />
              </span>
              <strong>{copy.uploadImage}</strong>
              <small>{copy.imagePickHint}</small>
            </button>
          )}

          {imageColors.length ? (
            <div className='palette-extracted-colors'>
              <h3>{copy.extractedTitle}</h3>
              <div>
                {imageColors.map(imageColor => (
                  <button
                    aria-label={formatMessage(copy.applyColorLabel, {
                      color: imageColor,
                    })}
                    key={imageColor}
                    style={{ backgroundColor: imageColor }}
                    title={imageColor}
                    type='button'
                    onClick={() => selectColor(imageColor)}
                  >
                    <span
                      style={{
                        color: getReadableTextColor(hexToRgb(imageColor)!)
                          .color,
                      }}
                    >
                      {imageColor}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </OCard>

        <OCard
          as='section'
          className='palette-card palette-formats-card reveal-on-scroll'
          padding='lg'
        >
          <PaletteSectionHeading
            description={copy.formatsDescription}
            icon={Clipboard}
            title={copy.formatsTitle}
          />
          <dl className='palette-format-list'>
            {formatOrder.map(format => {
              const value = colorFormats[format];
              return (
                <div key={format}>
                  <dt>{copy.formatLabels[format]}</dt>
                  <dd>
                    <code>{value}</code>
                    <OIconButton
                      aria-label={formatMessage(copy.copyFormatLabel, {
                        format: copy.formatLabels[format],
                      })}
                      onClick={() => copyValue(value)}
                      size='sm'
                      variant='ghost'
                    >
                      <Clipboard size={15} aria-hidden='true' />
                    </OIconButton>
                  </dd>
                </div>
              );
            })}
          </dl>
        </OCard>
      </section>

      <OCard
        as='section'
        className='palette-card palette-harmony-card reveal-on-scroll'
        padding='lg'
      >
        <PaletteSectionHeading
          description={copy.harmoniesDescription}
          icon={SwatchBook}
          title={copy.harmoniesTitle}
        />
        <div className='palette-harmony-list'>
          {harmonyOrder.map(scheme => (
            <article key={scheme}>
              <h3>{copy.schemeLabels[scheme]}</h3>
              <div>
                {harmonies[scheme].map((harmonyColor, index) => (
                  <button
                    aria-label={formatMessage(copy.applyColorLabel, {
                      color: harmonyColor,
                    })}
                    key={`${harmonyColor}-${index}`}
                    style={{ backgroundColor: harmonyColor }}
                    type='button'
                    onClick={() => selectColor(harmonyColor)}
                  >
                    <span
                      style={{
                        color: getReadableTextColor(hexToRgb(harmonyColor)!)
                          .color,
                      }}
                    >
                      {harmonyColor}
                    </span>
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </OCard>

      <OCard
        as='section'
        className='palette-card palette-contrast-card reveal-on-scroll'
        padding='lg'
      >
        <PaletteSectionHeading
          description={copy.contrastDescription}
          icon={Contrast}
          title={copy.contrastTitle}
        />
        <div className='palette-contrast-layout'>
          <div className='palette-contrast-controls'>
            <ColorField
              color={foreground}
              label={copy.foregroundLabel}
              onChange={setForeground}
            />
            <OIconButton
              aria-label={copy.swapColors}
              className='palette-swap-button'
              onClick={() => {
                setForeground(background);
                setBackground(foreground);
              }}
              size='sm'
            >
              <ArrowRightLeft size={16} aria-hidden='true' />
            </OIconButton>
            <ColorField
              color={background}
              label={copy.backgroundLabel}
              onChange={setBackground}
            />
          </div>

          <div
            aria-label={copy.previewLabel}
            className='palette-contrast-preview'
            style={{ backgroundColor: background, color: foreground }}
          >
            <Eye size={18} aria-hidden='true' />
            <strong>{copy.previewHeading}</strong>
            <p>{copy.previewBody}</p>
          </div>

          <div className='palette-contrast-results'>
            <div className='palette-ratio'>
              <span>{copy.ratioLabel}</span>
              <strong>{contrastRatio.toFixed(2)}:1</strong>
            </div>
            <ul>
              {criteria.map(criterion => (
                <li
                  className={criterion.passed ? 'is-passed' : ''}
                  key={criterion.label}
                >
                  <span aria-hidden='true'>
                    {criterion.passed ? <Check size={14} /> : <X size={14} />}
                  </span>
                  <strong>{criterion.label}</strong>
                  <small>{criterion.passed ? copy.pass : copy.fail}</small>
                </li>
              ))}
            </ul>
            <div className='palette-recommendation'>
              <span style={{ backgroundColor: readableText.color }} />
              <div>
                <strong>{copy.recommendationTitle}</strong>
                <p>
                  {formatMessage(copy.recommendationTemplate, {
                    color: readableText.color,
                    ratio: readableText.ratio.toFixed(2),
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </OCard>

      <p className='palette-status' aria-live='polite' role='status'>
        {status}
      </p>
    </LayoutPage>
  );
}
