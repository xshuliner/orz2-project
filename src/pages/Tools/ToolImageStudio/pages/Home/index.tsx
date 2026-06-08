import { postTinifyImage } from '@/api';
import { OButton } from '@/components/OButton';
import { OCard } from '@/components/OCard';
import { OIconButton } from '@/components/OIconButton';
import { OPageHero } from '@/components/OPageHero';
import { OSelector, type OSelectorOption } from '@/components/OSelector';
import { OTab } from '@/components/OTab';
import { Seo } from '@/components/Seo';
import { getToolSeo } from '@/config/seo';
import { useI18n } from '@/i18n';
import { getTools } from '@/i18n/catalog';
import {
  Base64Transfer,
  MetricItem,
  ToggleRow,
} from '@/pages/Tools/ToolImageStudio/components/ImageToolParts';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileImage,
  ImageDown,
  Info,
  Loader2,
  Maximize2,
  RefreshCcw,
  RotateCcw,
  UploadCloud,
  Wand2,
  X,
  Zap,
} from 'lucide-react';
import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import './index.css';

type OutputFormat = 'original' | 'image/png' | 'image/jpeg' | 'image/webp';
type ResizeMode = 'scale' | 'dimensions';
type ProcessPhase = 'idle' | 'processing' | 'compressing' | 'done' | 'error';

interface ImageInfo {
  aspectRatio: string;
  height: number;
  lastModified: number;
  name: string;
  size: number;
  type: string;
  width: number;
}

interface ProcessResult {
  blob: Blob;
  height: number;
  name: string;
  savingsRatio: number;
  size: number;
  source: 'browser' | 'tinypng';
  type: string;
  url: string;
  width: number;
}

interface ProcessState {
  message: string;
  phase: ProcessPhase;
}

const uploadAccept = 'image/png,image/jpeg,image/webp,image/avif';
const canvasFormats = new Set(['image/png', 'image/jpeg', 'image/webp']);

function clampDimension(value: number) {
  return Math.max(1, Math.round(value));
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return `${size.toFixed(index === 0 ? 0 : size >= 10 ? 1 : 2)} ${units[index]}`;
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

function getExtension(type: string) {
  if (type === 'image/jpeg') return 'jpg';
  if (type === 'image/webp') return 'webp';
  if (type === 'image/png') return 'png';
  if (type === 'image/avif') return 'avif';
  return 'png';
}

function createOutputName(fileName: string, type: string, source: string) {
  const baseName = fileName.replace(/\.[^.]+$/, '') || 'orz2-image';
  return `${baseName}-${source}.${getExtension(type)}`;
}

function getMimeFromDataUrl(dataUrl: string) {
  return dataUrl.match(/^data:([^;,]+)[;,]/)?.[1] ?? 'image/png';
}

function normalizeBase64Payload(value: string) {
  const payload = value.replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/');
  const withoutPadding = payload.replace(/=+$/, '');
  const remainder = withoutPadding.length % 4;
  return remainder
    ? `${withoutPadding}${'='.repeat(4 - remainder)}`
    : withoutPadding;
}

function bytesStartWith(bytes: Uint8Array, signature: readonly number[]) {
  return signature.every((byte, index) => bytes[index] === byte);
}

function asciiAt(bytes: Uint8Array, offset: number, length: number) {
  return Array.from(bytes.slice(offset, offset + length))
    .map(byte => String.fromCharCode(byte))
    .join('');
}

function inferMimeFromBase64(payload: string) {
  const binary = atob(payload.slice(0, 96));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  if (bytesStartWith(bytes, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (bytesStartWith(bytes, [0x89, 0x50, 0x4e, 0x47])) return 'image/png';
  if (bytesStartWith(bytes, [0x47, 0x49, 0x46, 0x38])) return 'image/gif';
  if (asciiAt(bytes, 0, 4) === 'RIFF' && asciiAt(bytes, 8, 4) === 'WEBP') {
    return 'image/webp';
  }
  if (asciiAt(bytes, 4, 8).startsWith('ftypavif')) return 'image/avif';
  return 'image/png';
}

function normalizeBase64Image(value: string) {
  const trimmed = value.trim();
  if (!trimmed) throw new Error('empty-base64');

  const dataUrlMatch = trimmed.match(
    /^data:(image\/[a-z0-9.+-]+);base64,([\s\S]+)$/i
  );
  if (dataUrlMatch) {
    const payload = normalizeBase64Payload(dataUrlMatch[2]);
    atob(payload);
    return `data:${dataUrlMatch[1].toLowerCase()};base64,${payload}`;
  }

  const payload = normalizeBase64Payload(trimmed);
  atob(payload);
  return `data:${inferMimeFromBase64(payload)};base64,${payload}`;
}

function dataUrlToBlob(dataUrl: string) {
  const [, base64 = ''] = dataUrl.split(',');
  const mime = getMimeFromDataUrl(dataUrl);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mime });
}

function resolveCanvasMime(format: OutputFormat, inputType: string) {
  if (format !== 'original') return format;
  return canvasFormats.has(inputType) ? inputType : 'image/png';
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('image-load-failed'));
    image.src = url;
  });
}

function readFileAsDataUrl(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('file-reader-failed'));
    };
    reader.onerror = () => reject(new Error('file-reader-failed'));
    reader.readAsDataURL(file);
  });
}

async function readImageInfo(
  file: File,
  previewUrl: string
): Promise<ImageInfo> {
  const image = await loadImage(previewUrl);
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  return {
    aspectRatio: `${width}:${height}`,
    height,
    lastModified: file.lastModified,
    name: file.name,
    size: file.size,
    type: file.type || 'image/unknown',
    width,
  };
}

function estimateSize(
  fileSize: number,
  originalWidth: number,
  originalHeight: number,
  targetWidth: number,
  targetHeight: number,
  convertEnabled: boolean,
  outputFormat: OutputFormat,
  compressEnabled: boolean
) {
  const areaRatio =
    (targetWidth * targetHeight) / Math.max(originalWidth * originalHeight, 1);
  const formatRatio =
    convertEnabled && outputFormat === 'image/webp'
      ? 0.72
      : convertEnabled && outputFormat === 'image/jpeg'
        ? 0.84
        : convertEnabled && outputFormat === 'image/png'
          ? 1.08
          : 1;
  const compressionRatio = compressEnabled ? 0.58 : 1;
  return Math.max(
    1,
    Math.round(fileSize * areaRatio * formatRatio * compressionRatio)
  );
}

async function renderToBlob(
  imageUrl: string,
  width: number,
  height: number,
  type: string
) {
  const image = await loadImage(imageUrl);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('canvas-context-failed');

  if (type === 'image/jpeg') {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) resolve(blob);
        else reject(new Error('canvas-export-failed'));
      },
      type,
      type === 'image/jpeg' || type === 'image/webp' ? 0.88 : undefined
    );
  });
}

async function tinypngCompress(blob: Blob, filename: string) {
  const result = await postTinifyImage({ filename, image: blob });
  const compressedBlob = dataUrlToBlob(result.data);
  return {
    blob: compressedBlob,
    filename: result.filename,
    type: compressedBlob.type || getMimeFromDataUrl(result.data) || blob.type,
  };
}

export function ImageStudio() {
  const { locale, localizePath, messages } = useI18n();
  const copy = messages.imageTool;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolSeo = getToolSeo(locale);
  const tools = useMemo(() => getTools(locale), [locale]);
  const tool = tools.find(item => item.id === 'tool-image');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [base64Input, setBase64Input] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [base64Error, setBase64Error] = useState('');
  const [copiedBase64, setCopiedBase64] = useState(false);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [convertEnabled, setConvertEnabled] = useState(false);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/webp');
  const [resizeEnabled, setResizeEnabled] = useState(false);
  const [resizeMode, setResizeMode] = useState<ResizeMode>('scale');
  const [scale, setScale] = useState(50);
  const [targetWidth, setTargetWidth] = useState('');
  const [targetHeight, setTargetHeight] = useState('');
  const [compressEnabled, setCompressEnabled] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [processState, setProcessState] = useState<ProcessState>({
    message: copy.status.idle,
    phase: 'idle',
  });

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [result?.url]);

  useEffect(() => {
    if (!copiedBase64) return;
    const timer = window.setTimeout(() => setCopiedBase64(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copiedBase64]);

  useEffect(() => {
    if (!imageInfo) return;
    setTargetWidth(String(imageInfo.width));
    setTargetHeight(String(imageInfo.height));
  }, [imageInfo]);

  const formatOptions = useMemo<readonly OSelectorOption<OutputFormat>[]>(
    () => [
      { label: copy.convert.keep, value: 'original' },
      { label: copy.convert.webp, value: 'image/webp' },
      { label: copy.convert.jpeg, value: 'image/jpeg' },
      { label: copy.convert.png, value: 'image/png' },
    ],
    [copy.convert.jpeg, copy.convert.keep, copy.convert.png, copy.convert.webp]
  );

  const resizeOptions = useMemo(
    () => [
      { label: copy.resize.modeScale, value: 'scale' },
      { label: copy.resize.modeDimensions, value: 'dimensions' },
    ],
    [copy.resize.modeDimensions, copy.resize.modeScale]
  );

  const targetDimensions = useMemo(() => {
    if (!imageInfo) return null;
    if (!resizeEnabled) {
      return { height: imageInfo.height, width: imageInfo.width };
    }
    if (resizeMode === 'scale') {
      return {
        height: clampDimension((imageInfo.height * scale) / 100),
        width: clampDimension((imageInfo.width * scale) / 100),
      };
    }
    return {
      height: clampDimension(Number(targetHeight) || imageInfo.height),
      width: clampDimension(Number(targetWidth) || imageInfo.width),
    };
  }, [imageInfo, resizeEnabled, resizeMode, scale, targetHeight, targetWidth]);

  const estimatedSize = useMemo(() => {
    if (!imageInfo || !targetDimensions) return null;
    return estimateSize(
      imageInfo.size,
      imageInfo.width,
      imageInfo.height,
      targetDimensions.width,
      targetDimensions.height,
      convertEnabled,
      outputFormat,
      compressEnabled
    );
  }, [
    compressEnabled,
    convertEnabled,
    imageInfo,
    outputFormat,
    targetDimensions,
  ]);

  const canProcess =
    Boolean(file && previewUrl && imageInfo && targetDimensions) &&
    processState.phase !== 'processing' &&
    processState.phase !== 'compressing';

  async function handleFile(nextFile: File | undefined) {
    if (!nextFile) return false;
    setResult(null);
    setFile(null);
    setPreviewUrl('');
    setImageBase64('');
    setImageInfo(null);
    setCopiedBase64(false);
    setBase64Error('');
    setProcessState({ message: copy.status.reading, phase: 'processing' });
    const nextPreviewUrl = URL.createObjectURL(nextFile);
    try {
      const [nextInfo, nextBase64] = await Promise.all([
        readImageInfo(nextFile, nextPreviewUrl),
        readFileAsDataUrl(nextFile),
      ]);
      setFile(nextFile);
      setPreviewUrl(nextPreviewUrl);
      setImageBase64(nextBase64);
      setImageInfo(nextInfo);
      setProcessState({ message: copy.status.ready, phase: 'idle' });
      return true;
    } catch {
      URL.revokeObjectURL(nextPreviewUrl);
      setProcessState({ message: copy.validation.unsupported, phase: 'error' });
      return false;
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    void handleFile(event.target.files?.[0]);
    event.target.value = '';
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    void handleFile(event.dataTransfer.files?.[0]);
  }

  async function handleBase64Import() {
    if (!base64Input.trim()) {
      setBase64Error(copy.validation.noBase64);
      setProcessState({ message: copy.validation.noBase64, phase: 'error' });
      return;
    }

    setResult(null);
    setCopiedBase64(false);
    setBase64Error('');
    setProcessState({ message: copy.status.reading, phase: 'processing' });

    try {
      const dataUrl = normalizeBase64Image(base64Input);
      const blob = dataUrlToBlob(dataUrl);
      const mime = blob.type || getMimeFromDataUrl(dataUrl);
      const nextFile = new File([blob], `base64-image.${getExtension(mime)}`, {
        lastModified: Date.now(),
        type: mime,
      });
      const imported = await handleFile(nextFile);
      if (imported) setImageBase64(dataUrl);
    } catch {
      setBase64Error(copy.validation.invalidBase64);
      setProcessState({
        message: copy.validation.invalidBase64,
        phase: 'error',
      });
    }
  }

  async function copyImageBase64() {
    if (!imageBase64) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(imageBase64);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = imageBase64;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedBase64(true);
      setBase64Error('');
    } catch {
      setBase64Error(copy.validation.copyFailed);
    }
  }

  function resetAll() {
    setFile(null);
    setPreviewUrl('');
    setBase64Input('');
    setImageBase64('');
    setBase64Error('');
    setCopiedBase64(false);
    setImageInfo(null);
    setResult(null);
    setConvertEnabled(false);
    setOutputFormat('image/webp');
    setResizeEnabled(false);
    setResizeMode('scale');
    setScale(50);
    setTargetWidth('');
    setTargetHeight('');
    setCompressEnabled(false);
    setProcessState({ message: copy.status.idle, phase: 'idle' });
  }

  async function processImage() {
    if (!file || !imageInfo || !targetDimensions) {
      setProcessState({ message: copy.validation.noFile, phase: 'error' });
      return;
    }

    try {
      setProcessState({ message: copy.status.processing, phase: 'processing' });
      const needsCanvas =
        convertEnabled ||
        resizeEnabled ||
        !canvasFormats.has(file.type || imageInfo.type);
      let workingBlob: Blob = file;
      let workingType = file.type || imageInfo.type;
      let workingWidth = imageInfo.width;
      let workingHeight = imageInfo.height;

      if (needsCanvas) {
        workingType = resolveCanvasMime(
          convertEnabled ? outputFormat : 'original',
          workingType
        );
        workingBlob = await renderToBlob(
          previewUrl,
          targetDimensions.width,
          targetDimensions.height,
          workingType
        );
        workingWidth = targetDimensions.width;
        workingHeight = targetDimensions.height;
      }

      let source: ProcessResult['source'] = 'browser';
      let resultName = createOutputName(file.name, workingType, source);
      if (compressEnabled) {
        setProcessState({
          message: copy.status.compressing,
          phase: 'compressing',
        });
        const compressed = await tinypngCompress(workingBlob, resultName);
        workingBlob = compressed.blob;
        workingType = compressed.type || workingBlob.type || workingType;
        source = 'tinypng';
        resultName =
          compressed.filename ||
          createOutputName(file.name, workingType, source);
      }

      const nextUrl = URL.createObjectURL(workingBlob);
      setResult({
        blob: workingBlob,
        height: workingHeight,
        name: resultName,
        savingsRatio: 1 - workingBlob.size / file.size,
        size: workingBlob.size,
        source,
        type: workingType,
        url: nextUrl,
        width: workingWidth,
      });
      setProcessState({ message: copy.status.done, phase: 'done' });
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : copy.validation.failed;
      setProcessState({
        message: `${copy.validation.failedPrefix}${detail}`,
        phase: 'error',
      });
    }
  }

  return (
    <>
      <Seo config={toolSeo['smart-image-compressor']} />
      <main className='image-tool-page'>
        <Link
          className='image-back-link interactive'
          to={localizePath('/tools')}
        >
          <ArrowLeft size={16} aria-hidden='true' />
          {copy.backToTools}
        </Link>

        <OPageHero
          className='image-tool-hero'
          title={tool?.name ?? copy.title}
          description={tool?.summary ?? copy.description}
        >
          <div className='image-hero-strip' aria-label={copy.heroAriaLabel}>
            {copy.heroHighlights.map((highlight, index) => {
              const Icon = [FileImage, Maximize2, Zap][index] ?? CheckCircle2;
              return (
                <span key={highlight}>
                  <Icon size={15} aria-hidden='true' />
                  {highlight}
                </span>
              );
            })}
          </div>
        </OPageHero>

        <section className='image-tool-workbench'>
          <OCard
            as='section'
            className='image-upload-panel reveal-on-scroll'
            padding='lg'
          >
            <div className='image-panel-heading'>
              <div>
                <h2>{copy.upload.title}</h2>
                <p>{copy.upload.subtitle}</p>
              </div>
              {imageInfo ? (
                <OIconButton
                  aria-label={copy.upload.clear}
                  className='image-clear-button'
                  variant='ghost'
                  onClick={resetAll}
                >
                  <X size={17} aria-hidden='true' />
                </OIconButton>
              ) : null}
            </div>

            <label
              className={[
                'image-dropzone',
                isDragging ? 'is-dragging' : '',
                imageInfo ? 'has-image' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onDragEnter={event => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={event => {
                event.preventDefault();
                setIsDragging(false);
              }}
              onDragOver={event => event.preventDefault()}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                accept={uploadAccept}
                type='file'
                onChange={handleInputChange}
              />
              {previewUrl && imageInfo ? (
                <img src={previewUrl} alt={copy.upload.previewAlt} />
              ) : (
                <span className='image-empty-state'>
                  <UploadCloud size={34} strokeWidth={1.7} aria-hidden='true' />
                  <strong>{copy.upload.emptyTitle}</strong>
                  <small>{copy.upload.emptyDescription}</small>
                </span>
              )}
            </label>

            <div className='image-upload-actions'>
              <OButton
                size='sm'
                type='button'
                variant='secondary'
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud size={16} aria-hidden='true' />
                {imageInfo ? copy.upload.replace : copy.upload.browse}
              </OButton>
              <span>{processState.message}</span>
            </div>

            <Base64Transfer
              copied={copiedBase64}
              copy={copy.base64}
              error={base64Error}
              inputValue={base64Input}
              outputValue={imageBase64}
              onCopy={() => void copyImageBase64()}
              onImport={() => void handleBase64Import()}
              onInputChange={setBase64Input}
            />

            <div className='image-info-grid' aria-label={copy.info.title}>
              <MetricItem
                label={copy.info.dimensions}
                value={
                  imageInfo
                    ? `${imageInfo.width} x ${imageInfo.height}`
                    : copy.info.unknown
                }
              />
              <MetricItem
                label={copy.info.size}
                value={
                  imageInfo ? formatBytes(imageInfo.size) : copy.info.unknown
                }
              />
              <MetricItem
                label={copy.info.mime}
                value={imageInfo?.type || copy.info.unknown}
              />
              <MetricItem
                label={copy.info.lastModified}
                value={
                  imageInfo
                    ? formatDate(imageInfo.lastModified)
                    : copy.info.unknown
                }
              />
            </div>
          </OCard>

          <OCard
            as='aside'
            className='image-settings-panel reveal-on-scroll'
            padding='lg'
          >
            <div className='image-panel-heading'>
              <div>
                <h2>{copy.settings.title}</h2>
                <p>{copy.settings.subtitle}</p>
              </div>
              <Wand2 size={20} strokeWidth={1.8} aria-hidden='true' />
            </div>

            <div className='image-setting-group'>
              <ToggleRow
                checked={convertEnabled}
                label={copy.convert.enable}
                onChange={setConvertEnabled}
              >
                {copy.convert.description}
              </ToggleRow>
              <OSelector
                ariaLabel={copy.convert.formatLabel}
                className='image-format-selector'
                options={formatOptions}
                value={convertEnabled ? outputFormat : 'original'}
                onChange={value => setOutputFormat(value as OutputFormat)}
              />
            </div>

            <div className='image-setting-group'>
              <ToggleRow
                checked={resizeEnabled}
                label={copy.resize.enable}
                onChange={setResizeEnabled}
              >
                {copy.resize.description}
              </ToggleRow>
              <OTab
                ariaLabel={copy.resize.modeAriaLabel}
                className='image-resize-tabs'
                options={resizeOptions}
                value={resizeMode}
                onChange={value => setResizeMode(value as ResizeMode)}
              />
              {resizeMode === 'scale' ? (
                <label className='image-range-control'>
                  <span>
                    {copy.resize.scaleLabel}
                    <strong>{scale}%</strong>
                  </span>
                  <input
                    disabled={!resizeEnabled}
                    max='200'
                    min='10'
                    step='5'
                    type='range'
                    value={scale}
                    onChange={event => setScale(Number(event.target.value))}
                  />
                </label>
              ) : (
                <div className='image-dimension-controls'>
                  <label>
                    <span>{copy.resize.width}</span>
                    <input
                      disabled={!resizeEnabled}
                      inputMode='numeric'
                      min='1'
                      type='number'
                      value={targetWidth}
                      onChange={event => setTargetWidth(event.target.value)}
                    />
                  </label>
                  <label>
                    <span>{copy.resize.height}</span>
                    <input
                      disabled={!resizeEnabled}
                      inputMode='numeric'
                      min='1'
                      type='number'
                      value={targetHeight}
                      onChange={event => setTargetHeight(event.target.value)}
                    />
                  </label>
                </div>
              )}
            </div>

            <div className='image-setting-group'>
              <ToggleRow
                checked={compressEnabled}
                label={copy.compress.enable}
                onChange={setCompressEnabled}
              >
                {copy.compress.description}
              </ToggleRow>
              <div className='image-provider-row'>
                <ImageDown size={16} aria-hidden='true' />
                <span>{copy.compress.provider}</span>
              </div>
            </div>

            <div
              className='image-estimate-panel'
              aria-label={copy.output.estimateTitle}
            >
              <MetricItem
                label={copy.output.estimatedDimensions}
                value={
                  targetDimensions
                    ? `${targetDimensions.width} x ${targetDimensions.height}`
                    : copy.info.unknown
                }
              />
              <MetricItem
                label={copy.output.estimatedSize}
                value={
                  estimatedSize
                    ? `~${formatBytes(estimatedSize)}`
                    : copy.info.unknown
                }
              />
              <MetricItem
                label={copy.output.outputType}
                value={convertEnabled ? outputFormat : copy.convert.keep}
              />
            </div>

            <div className='image-action-row'>
              <OButton
                disabled={!canProcess}
                type='button'
                onClick={() => void processImage()}
              >
                {processState.phase === 'processing' ||
                processState.phase === 'compressing' ? (
                  <Loader2 className='spin' size={16} aria-hidden='true' />
                ) : (
                  <Zap size={16} aria-hidden='true' />
                )}
                {processState.phase === 'compressing'
                  ? copy.output.compressing
                  : processState.phase === 'processing'
                    ? copy.output.processing
                    : copy.output.process}
              </OButton>
              <OButton type='button' variant='ghost' onClick={resetAll}>
                <RotateCcw size={16} aria-hidden='true' />
                {copy.output.reset}
              </OButton>
            </div>
          </OCard>
        </section>

        <OCard
          as='section'
          className={[
            'image-result-panel reveal-on-scroll',
            result ? 'has-result' : '',
            `is-${processState.phase}`,
          ].join(' ')}
          padding='lg'
        >
          <div className='image-result-status'>
            <span>
              {processState.phase === 'done' ? (
                <CheckCircle2 size={18} aria-hidden='true' />
              ) : processState.phase === 'compressing' ||
                processState.phase === 'processing' ? (
                <Loader2 className='spin' size={18} aria-hidden='true' />
              ) : processState.phase === 'error' ? (
                <Info size={18} aria-hidden='true' />
              ) : (
                <RefreshCcw size={18} aria-hidden='true' />
              )}
            </span>
            <div>
              <h2>{copy.output.title}</h2>
              <p>
                {result
                  ? copy.output.ready
                  : processState.phase === 'error'
                    ? processState.message
                    : copy.output.empty}
              </p>
            </div>
          </div>

          <div className='image-result-grid'>
            <MetricItem
              label={copy.output.processedDimensions}
              value={
                result
                  ? `${result.width} x ${result.height}`
                  : copy.info.unknown
              }
            />
            <MetricItem
              label={copy.output.processedSize}
              value={result ? formatBytes(result.size) : copy.info.unknown}
            />
            <MetricItem
              label={copy.output.savings}
              value={
                result
                  ? `${Math.max(0, result.savingsRatio * 100).toFixed(1)}%`
                  : copy.info.unknown
              }
            />
            <MetricItem
              label={copy.output.engine}
              value={
                result?.source === 'tinypng'
                  ? copy.compress.provider
                  : copy.output.localEngine
              }
            />
          </div>

          <div className='image-result-actions'>
            {result ? (
              <OButton
                download={result.name}
                href={result.url}
                variant='secondary'
              >
                <Download size={16} aria-hidden='true' />
                {copy.output.download}
              </OButton>
            ) : null}
          </div>
        </OCard>
      </main>
    </>
  );
}
