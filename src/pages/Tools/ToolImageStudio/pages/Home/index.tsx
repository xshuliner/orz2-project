import { postTinifyImage } from '@/api';
import { OButton } from '@/components/OButton';
import { OCard } from '@/components/OCard';
import { OIconButton } from '@/components/OIconButton';
import { OPageHero } from '@/components/OPageHero';
import { OSelector, type OSelectorOption } from '@/components/OSelector';
import { Seo } from '@/components/Seo';
import { getToolSeo } from '@/config/seo';
import { getTools, useI18n } from '@/i18n';
import {
  Base64Transfer,
  MetricItem,
  ToggleRow,
} from '@/pages/Tools/ToolImageStudio/components/ImageToolParts';
import JSZip from 'jszip';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileImage,
  ImageDown,
  Images,
  Info,
  Loader2,
  Lock,
  Maximize2,
  RefreshCcw,
  RotateCcw,
  Unlock,
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
type ProcessPhase = 'idle' | 'processing' | 'compressing' | 'done' | 'error';
type BatchItemPhase = 'idle' | 'processing' | 'compressing' | 'done' | 'error';
type ResizeIntent = 'dimensions' | 'scale';

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

interface BatchProcessItem {
  message: string;
  name: string;
  phase: BatchItemPhase;
  result?: ProcessResult;
}

interface ReadImageFileResult {
  file: File;
  info: ImageInfo;
  previewUrl: string;
}

const uploadAccept = 'image/png,image/jpeg,image/webp,image/avif';
const canvasFormats = new Set(['image/png', 'image/jpeg', 'image/webp']);
const defaultScale = 100;
const minScale = 10;
const maxScale = 200;

function clampDimension(value: number) {
  return Math.max(1, Math.round(value));
}

function clampScale(value: number) {
  return Math.min(maxScale, Math.max(minScale, Math.round(value)));
}

function sanitizeDimensionInput(value: string) {
  const sanitized = value.replace(/[^\d]/g, '');
  if (!sanitized) return '';
  return String(Math.max(1, Number(sanitized)));
}

function getWidthFromScale(imageInfo: ImageInfo, nextScale: number) {
  return clampDimension((imageInfo.width * nextScale) / 100);
}

function getHeightFromScale(imageInfo: ImageInfo, nextScale: number) {
  return clampDimension((imageInfo.height * nextScale) / 100);
}

function getHeightFromWidth(imageInfo: ImageInfo, width: number) {
  return clampDimension((width * imageInfo.height) / imageInfo.width);
}

function getWidthFromHeight(imageInfo: ImageInfo, height: number) {
  return clampDimension((height * imageInfo.width) / imageInfo.height);
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

function getMimeFromFilename(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'webp') return 'image/webp';
  if (extension === 'png') return 'image/png';
  if (extension === 'avif') return 'image/avif';
  return '';
}

function replaceFileExtension(fileName: string, type: string) {
  const extension = getExtension(type);
  if (/\.[^.]+$/.test(fileName)) {
    return fileName.replace(/\.[^.]+$/, `.${extension}`);
  }
  return `${fileName}.${extension}`;
}

function createOutputName(fileName: string, type: string, source: string) {
  const baseName = fileName.replace(/\.[^.]+$/, '') || 'orz2-image';
  return `${baseName}-${source}.${getExtension(type)}`;
}

function createArchiveName() {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, '');
  return `orz2-images-${timestamp}.zip`;
}

function getUniqueArchiveName(fileName: string, usedNames: Set<string>) {
  if (!usedNames.has(fileName)) {
    usedNames.add(fileName);
    return fileName;
  }

  const extensionMatch = fileName.match(/(\.[^.]+)$/);
  const extension = extensionMatch?.[1] ?? '';
  const baseName = extension ? fileName.slice(0, -extension.length) : fileName;
  let index = 2;
  let nextName = `${baseName}-${index}${extension}`;
  while (usedNames.has(nextName)) {
    index += 1;
    nextName = `${baseName}-${index}${extension}`;
  }
  usedNames.add(nextName);
  return nextName;
}

function getMimeFromDataUrl(dataUrl: string) {
  return dataUrl.match(/^data:([^;,]+)[;,]/)?.[1] ?? 'image/png';
}

function normalizeBase64Payload(value: string) {
  const payload = value
    .replace(/\s/g, '')
    .replace(/-/g, '+')
    .replace(/_/g, '/');
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

function getTotalBytes(items: readonly { size: number }[]) {
  return items.reduce((total, item) => total + item.size, 0);
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
  const uploadType = blob.type || getMimeFromFilename(filename) || 'image/png';
  const uploadName = replaceFileExtension(filename, uploadType);
  const uploadFile = new File([blob], uploadName, {
    lastModified: Date.now(),
    type: uploadType,
  });
  const result = await postTinifyImage({
    filename: uploadFile.name,
    image: uploadFile,
  });
  if (result.errcode && result.errcode !== 0) {
    throw new Error(result.errmsg || 'TinyPNG 压缩失败');
  }
  const dataUrl = normalizeBase64Image(result.data);
  const compressedBlob = dataUrlToBlob(dataUrl);
  const compressedType = compressedBlob.type || getMimeFromDataUrl(dataUrl);
  return {
    blob: compressedBlob,
    filename: result.filename || uploadName,
    type: compressedType || uploadType,
  };
}

export function ImageStudio() {
  const { locale, localizePath, messages } = useI18n();
  const copy = messages.imageTool;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const base64ParseIdRef = useRef(0);
  const skipNextBase64ParseRef = useRef(false);
  const previewStripRef = useRef<HTMLDivElement>(null);
  const previewButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const batchResultUrlsRef = useRef<Set<string>>(new Set());
  const toolSeo = getToolSeo(locale);
  const tools = useMemo(() => getTools(locale), [locale]);
  const tool = tools.find(item => item.id === 'tool-image');
  const batchImagesRef = useRef<ReadImageFileResult[]>([]);
  const [batchImages, setBatchImages] = useState<ReadImageFileResult[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [base64Value, setBase64Value] = useState('');
  const [base64Error, setBase64Error] = useState('');
  const [copiedBase64, setCopiedBase64] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [convertEnabled, setConvertEnabled] = useState(false);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/webp');
  const [resizeEnabled, setResizeEnabled] = useState(false);
  const [resizeIntent, setResizeIntent] = useState<ResizeIntent>('dimensions');
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  const [scale, setScale] = useState(defaultScale);
  const [targetWidth, setTargetWidth] = useState('');
  const [targetHeight, setTargetHeight] = useState('');
  const [compressEnabled, setCompressEnabled] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [batchResults, setBatchResults] = useState<ProcessResult[]>([]);
  const [batchProcessItems, setBatchProcessItems] = useState<
    BatchProcessItem[]
  >([]);
  const [isZipping, setIsZipping] = useState(false);
  const [processState, setProcessState] = useState<ProcessState>({
    message: copy.status.idle,
    phase: 'idle',
  });

  const batchFiles = useMemo(
    () => batchImages.map(item => item.file),
    [batchImages]
  );
  const batchInfos = useMemo(
    () => batchImages.map(item => item.info),
    [batchImages]
  );
  const activeImage = batchImages[activeImageIndex] ?? null;
  const file = activeImage?.file ?? null;
  const imageInfo = activeImage?.info ?? null;
  const previewUrl = activeImage?.previewUrl ?? '';
  const isBatchMode = batchImages.length > 1;
  const previewPosition = imageInfo
    ? `${activeImageIndex + 1}/${batchImages.length}`
    : '';

  function replaceBatchImages(
    nextImages: ReadImageFileResult[],
    nextActiveIndex = 0
  ) {
    setBatchImages(currentImages => {
      const retainedUrls = new Set(nextImages.map(item => item.previewUrl));
      currentImages.forEach(item => {
        if (!retainedUrls.has(item.previewUrl)) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
      return nextImages;
    });
    setActiveImageIndex(
      nextImages.length
        ? Math.min(Math.max(nextActiveIndex, 0), nextImages.length - 1)
        : 0
    );
  }

  function showPreviewAt(nextIndex: number) {
    if (!batchImages.length) return;
    setActiveImageIndex(
      Math.min(Math.max(nextIndex, 0), batchImages.length - 1)
    );
    setCopiedBase64(false);
    setBase64Error('');
  }

  function showPreviousPreview() {
    if (!batchImages.length) return;
    showPreviewAt(
      activeImageIndex === 0 ? batchImages.length - 1 : activeImageIndex - 1
    );
  }

  function showNextPreview() {
    if (!batchImages.length) return;
    showPreviewAt((activeImageIndex + 1) % batchImages.length);
  }

  useEffect(() => {
    batchImagesRef.current = batchImages;
    previewButtonRefs.current.length = batchImages.length;
  }, [batchImages]);

  useEffect(() => {
    if (!batchImages.length) return;

    const strip = previewStripRef.current;
    const activeButton = previewButtonRefs.current[activeImageIndex];
    if (!strip || !activeButton) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const nextLeft =
      activeButton.offsetLeft -
      strip.clientWidth / 2 +
      activeButton.clientWidth / 2;

    strip.scrollTo({
      behavior: reduceMotion ? 'auto' : 'smooth',
      left: Math.max(0, nextLeft),
    });
  }, [activeImageIndex, batchImages.length]);

  useEffect(
    () => () => {
      batchImagesRef.current.forEach(item =>
        URL.revokeObjectURL(item.previewUrl)
      );
    },
    []
  );

  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [result?.url]);

  useEffect(() => {
    const currentUrls = new Set(batchResults.map(item => item.url));
    batchResultUrlsRef.current.forEach(url => {
      if (!currentUrls.has(url)) {
        URL.revokeObjectURL(url);
      }
    });
    batchResultUrlsRef.current = currentUrls;
  }, [batchResults]);

  useEffect(
    () => () => {
      batchResultUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    },
    []
  );

  useEffect(() => {
    if (!copiedBase64) return;
    const timer = window.setTimeout(() => setCopiedBase64(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copiedBase64]);

  useEffect(() => {
    if (!activeImage) return;
    const requestId = base64ParseIdRef.current + 1;
    base64ParseIdRef.current = requestId;
    setCopiedBase64(false);
    setBase64Error('');

    void readFileAsDataUrl(activeImage.file)
      .then(dataUrl => {
        if (requestId !== base64ParseIdRef.current) return;
        skipNextBase64ParseRef.current = true;
        setBase64Value(dataUrl);
      })
      .catch(() => {
        if (requestId !== base64ParseIdRef.current) return;
        setBase64Error(copy.validation.invalidBase64);
      });
  }, [activeImage, copy.validation.invalidBase64]);

  useEffect(() => {
    if (!imageInfo) return;
    setScale(defaultScale);
    setTargetWidth(String(imageInfo.width));
    setTargetHeight(String(imageInfo.height));
  }, [imageInfo]);

  useEffect(() => {
    const requestId = base64ParseIdRef.current + 1;
    base64ParseIdRef.current = requestId;

    if (skipNextBase64ParseRef.current) {
      skipNextBase64ParseRef.current = false;
      return;
    }

    const trimmed = base64Value.trim();
    if (!trimmed) {
      replaceBatchImages([]);
      setResult(null);
      setBatchResults([]);
      setBatchProcessItems([]);
      setBase64Error('');
      setProcessState({ message: copy.status.idle, phase: 'idle' });
      return;
    }

    const timer = window.setTimeout(async () => {
      setResult(null);
      setBatchResults([]);
      setBatchProcessItems([]);
      setBase64Error('');
      setProcessState({ message: copy.status.reading, phase: 'processing' });

      let nextPreviewUrl = '';
      try {
        const dataUrl = normalizeBase64Image(trimmed);
        const blob = dataUrlToBlob(dataUrl);
        const mime = blob.type || getMimeFromDataUrl(dataUrl);
        const nextFile = new File(
          [blob],
          `base64-image.${getExtension(mime)}`,
          {
            lastModified: Date.now(),
            type: mime,
          }
        );
        nextPreviewUrl = URL.createObjectURL(nextFile);
        const nextInfo = await readImageInfo(nextFile, nextPreviewUrl);

        if (requestId !== base64ParseIdRef.current) {
          URL.revokeObjectURL(nextPreviewUrl);
          return;
        }

        replaceBatchImages([
          {
            file: nextFile,
            info: nextInfo,
            previewUrl: nextPreviewUrl,
          },
        ]);
        setProcessState({ message: copy.status.ready, phase: 'idle' });
      } catch {
        if (nextPreviewUrl) URL.revokeObjectURL(nextPreviewUrl);
        if (requestId !== base64ParseIdRef.current) return;
        setBase64Error(copy.validation.invalidBase64);
        setProcessState({
          message: copy.validation.invalidBase64,
          phase: 'error',
        });
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [
    base64Value,
    copy.status.idle,
    copy.status.ready,
    copy.status.reading,
    copy.validation.invalidBase64,
  ]);

  const formatOptions = useMemo<readonly OSelectorOption<OutputFormat>[]>(
    () => [
      { label: copy.convert.keep, value: 'original' },
      { label: copy.convert.webp, value: 'image/webp' },
      { label: copy.convert.jpeg, value: 'image/jpeg' },
      { label: copy.convert.png, value: 'image/png' },
    ],
    [copy.convert.jpeg, copy.convert.keep, copy.convert.png, copy.convert.webp]
  );

  const targetDimensions = useMemo(() => {
    if (!imageInfo) return null;
    if (!resizeEnabled) {
      return { height: imageInfo.height, width: imageInfo.width };
    }
    if (resizeIntent === 'scale') {
      return {
        height: getHeightFromScale(imageInfo, scale),
        width: getWidthFromScale(imageInfo, scale),
      };
    }
    return {
      height: clampDimension(Number(targetHeight) || imageInfo.height),
      width: clampDimension(Number(targetWidth) || imageInfo.width),
    };
  }, [
    imageInfo,
    resizeEnabled,
    resizeIntent,
    scale,
    targetHeight,
    targetWidth,
  ]);

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
    Boolean(
      batchFiles.length && file && previewUrl && imageInfo && targetDimensions
    ) &&
    processState.phase !== 'processing' &&
    processState.phase !== 'compressing';

  const totalInputSize = useMemo(() => getTotalBytes(batchInfos), [batchInfos]);
  const totalResultSize = useMemo(
    () => getTotalBytes(batchResults),
    [batchResults]
  );
  const completedBatchItemCount = useMemo(
    () =>
      batchProcessItems.filter(
        item => item.phase === 'done' || item.phase === 'error'
      ).length,
    [batchProcessItems]
  );
  const failedBatchItemCount = useMemo(
    () => batchProcessItems.filter(item => item.phase === 'error').length,
    [batchProcessItems]
  );
  const batchSuccessCount = batchResults.length;
  const hasBatchFeedback = batchProcessItems.length > 1;
  const isBatchFinished =
    batchProcessItems.length > 0 &&
    completedBatchItemCount === batchProcessItems.length;
  const batchSavingsRatio =
    totalInputSize > 0 && totalResultSize > 0
      ? 1 - totalResultSize / totalInputSize
      : null;
  const outputMessage = useMemo(() => {
    if (hasBatchFeedback) {
      if (
        processState.phase === 'processing' ||
        processState.phase === 'compressing'
      ) {
        return processState.message;
      }
      if (isBatchFinished && failedBatchItemCount === 0) {
        return copy.output.batchReady;
      }
      if (isBatchFinished && batchSuccessCount > 0) {
        return copy.output.batchPartial;
      }
      if (isBatchFinished) {
        return copy.output.batchFailed;
      }
      return `${copy.output.batchProgressPrefix}${completedBatchItemCount}/${batchProcessItems.length}`;
    }

    if (result) return copy.output.ready;
    if (
      processState.phase === 'processing' ||
      processState.phase === 'compressing'
    ) {
      return processState.message;
    }
    if (processState.phase === 'error') return processState.message;
    return copy.output.empty;
  }, [
    batchProcessItems.length,
    batchSuccessCount,
    completedBatchItemCount,
    copy.output.batchFailed,
    copy.output.batchPartial,
    copy.output.batchProgressPrefix,
    copy.output.batchReady,
    copy.output.empty,
    copy.output.ready,
    failedBatchItemCount,
    hasBatchFeedback,
    isBatchFinished,
    processState.message,
    processState.phase,
    result,
  ]);

  function getOutputDimensions(info: ImageInfo) {
    if (!resizeEnabled) return { height: info.height, width: info.width };
    if (resizeIntent === 'scale') {
      return {
        height: getHeightFromScale(info, scale),
        width: getWidthFromScale(info, scale),
      };
    }
    return {
      height: clampDimension(Number(targetHeight) || info.height),
      width: clampDimension(Number(targetWidth) || info.width),
    };
  }

  async function readImageFile(nextFile: File): Promise<ReadImageFileResult> {
    const nextPreviewUrl = URL.createObjectURL(nextFile);
    try {
      const nextInfo = await readImageInfo(nextFile, nextPreviewUrl);
      return {
        file: nextFile,
        info: nextInfo,
        previewUrl: nextPreviewUrl,
      };
    } catch (error) {
      URL.revokeObjectURL(nextPreviewUrl);
      throw error;
    }
  }

  async function handleFiles(nextFiles: FileList | File[] | undefined) {
    const candidates = Array.from(nextFiles ?? []);
    if (!candidates.length) return false;
    base64ParseIdRef.current += 1;
    setResult(null);
    setBatchResults([]);
    setBatchProcessItems([]);
    setIsZipping(false);
    replaceBatchImages([]);
    skipNextBase64ParseRef.current = true;
    setBase64Value('');
    setCopiedBase64(false);
    setBase64Error('');
    setProcessState({ message: copy.status.reading, phase: 'processing' });
    try {
      const loadedImages = (
        await Promise.all(
          candidates.map(async candidate => {
            try {
              return await readImageFile(candidate);
            } catch {
              return null;
            }
          })
        )
      ).filter((item): item is ReadImageFileResult => Boolean(item));
      const primaryImage = loadedImages[0];
      if (!primaryImage) {
        setProcessState({
          message: copy.validation.unsupported,
          phase: 'error',
        });
        return false;
      }
      replaceBatchImages(loadedImages);
      setProcessState({ message: copy.status.ready, phase: 'idle' });
      return true;
    } catch {
      setProcessState({ message: copy.validation.unsupported, phase: 'error' });
      return false;
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    void handleFiles(event.target.files ?? undefined);
    event.target.value = '';
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDragging(false);
    void handleFiles(event.dataTransfer.files);
  }

  async function copyImageBase64() {
    if (!base64Value) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(base64Value);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = base64Value;
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
    base64ParseIdRef.current += 1;
    replaceBatchImages([]);
    setBase64Value('');
    setBase64Error('');
    setCopiedBase64(false);
    setResult(null);
    setBatchResults([]);
    setBatchProcessItems([]);
    setIsZipping(false);
    setConvertEnabled(false);
    setOutputFormat('image/webp');
    setResizeEnabled(false);
    setResizeIntent('dimensions');
    setKeepAspectRatio(true);
    setScale(defaultScale);
    setTargetWidth('');
    setTargetHeight('');
    setCompressEnabled(false);
    setProcessState({ message: copy.status.idle, phase: 'idle' });
  }

  async function processImageFile(
    nextFile: File,
    nextInfo: ImageInfo,
    imageUrl?: string
  ) {
    const nextDimensions = getOutputDimensions(nextInfo);
    const needsCanvas =
      convertEnabled ||
      resizeEnabled ||
      !canvasFormats.has(nextFile.type || nextInfo.type);
    let workingBlob: Blob = nextFile;
    let workingType = nextFile.type || nextInfo.type;
    let workingWidth = nextInfo.width;
    let workingHeight = nextInfo.height;
    let temporaryUrl = '';

    try {
      if (needsCanvas) {
        workingType = resolveCanvasMime(
          convertEnabled ? outputFormat : 'original',
          workingType
        );
        temporaryUrl = imageUrl || URL.createObjectURL(nextFile);
        workingBlob = await renderToBlob(
          temporaryUrl,
          nextDimensions.width,
          nextDimensions.height,
          workingType
        );
        workingWidth = nextDimensions.width;
        workingHeight = nextDimensions.height;
      }

      let source: ProcessResult['source'] = 'browser';
      let resultName = createOutputName(nextFile.name, workingType, source);
      if (compressEnabled) {
        const compressed = await tinypngCompress(workingBlob, resultName);
        workingBlob = compressed.blob;
        workingType = compressed.type || workingBlob.type || workingType;
        source = 'tinypng';
        resultName =
          compressed.filename ||
          createOutputName(nextFile.name, workingType, source);
      }

      return {
        blob: workingBlob,
        height: workingHeight,
        name: resultName,
        savingsRatio: 1 - workingBlob.size / nextFile.size,
        size: workingBlob.size,
        source,
        type: workingType,
        url: URL.createObjectURL(workingBlob),
        width: workingWidth,
      } satisfies ProcessResult;
    } finally {
      if (temporaryUrl && temporaryUrl !== imageUrl) {
        URL.revokeObjectURL(temporaryUrl);
      }
    }
  }

  function createBatchProcessItems() {
    return batchImages.map(item => ({
      message: copy.status.pending,
      name: item.info.name,
      phase: 'idle' as const,
    }));
  }

  function updateBatchProcessItem(
    index: number,
    nextPatch: Partial<BatchProcessItem>
  ) {
    setBatchProcessItems(currentItems =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...nextPatch } : item
      )
    );
  }

  function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : copy.validation.failed;
  }

  async function processImage() {
    if (!batchFiles.length || !imageInfo || !targetDimensions) {
      setProcessState({ message: copy.validation.noFile, phase: 'error' });
      return;
    }

    setResult(null);
    setBatchResults([]);
    setBatchProcessItems(createBatchProcessItems());
    setIsZipping(false);

    const nextResults: ProcessResult[] = [];
    let failedCount = 0;
    let firstErrorMessage = '';

    for (const [index, nextFile] of batchFiles.entries()) {
      const nextInfo = batchInfos[index];
      if (!nextInfo) continue;

      try {
        setProcessState({
          message:
            batchFiles.length > 1
              ? `${copy.status.batchProcessingPrefix}${index + 1}/${batchFiles.length}`
              : copy.status.processing,
          phase: 'processing',
        });
        updateBatchProcessItem(index, {
          message: copy.status.itemProcessing,
          phase: 'processing',
        });
        if (compressEnabled) {
          setProcessState({
            message:
              batchFiles.length > 1
                ? `${copy.status.batchCompressingPrefix}${index + 1}/${batchFiles.length}`
                : copy.status.compressing,
            phase: 'compressing',
          });
          updateBatchProcessItem(index, {
            message: copy.status.itemCompressing,
            phase: 'compressing',
          });
        }
        const nextResult = await processImageFile(
          nextFile,
          nextInfo,
          batchImages[index]?.previewUrl
        );
        nextResults.push(nextResult);
        setBatchResults(currentResults => [...currentResults, nextResult]);
        setResult(currentResult => currentResult ?? nextResult);
        updateBatchProcessItem(index, {
          message: copy.status.itemDone,
          phase: 'done',
          result: nextResult,
        });
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        failedCount += 1;
        if (!firstErrorMessage) {
          firstErrorMessage = errorMessage;
        }
        updateBatchProcessItem(index, {
          message: errorMessage,
          phase: 'error',
        });
      }
    }

    if (nextResults.length && failedCount === 0) {
      setProcessState({ message: copy.status.done, phase: 'done' });
      return;
    }

    if (nextResults.length) {
      setProcessState({
        message: copy.output.batchPartial,
        phase: 'done',
      });
      return;
    }

    if (failedCount > 0) {
      setProcessState({
        message:
          batchFiles.length > 1
            ? copy.output.batchFailed
            : `${copy.validation.failedPrefix}${firstErrorMessage || copy.validation.failed}`,
        phase: 'error',
      });
      return;
    }

    setProcessState({
      message: copy.validation.failed,
      phase: 'error',
    });
  }

  function handleScaleChange(value: string) {
    const nextScale = clampScale(Number(value));
    setResizeIntent('scale');
    setScale(nextScale);
    if (!imageInfo) return;
    setTargetWidth(String(getWidthFromScale(imageInfo, nextScale)));
    setTargetHeight(String(getHeightFromScale(imageInfo, nextScale)));
  }

  function handleDimensionChange(axis: 'height' | 'width', value: string) {
    const nextValue = sanitizeDimensionInput(value);
    setResizeIntent('dimensions');

    if (axis === 'width') {
      setTargetWidth(nextValue);
    } else {
      setTargetHeight(nextValue);
    }

    if (!imageInfo || !nextValue) return;

    const numericValue = Number(nextValue);
    const nextScale =
      axis === 'width'
        ? (numericValue / imageInfo.width) * 100
        : (numericValue / imageInfo.height) * 100;
    setScale(clampScale(nextScale));

    if (!keepAspectRatio) return;

    if (axis === 'width') {
      setTargetHeight(String(getHeightFromWidth(imageInfo, numericValue)));
    } else {
      setTargetWidth(String(getWidthFromHeight(imageInfo, numericValue)));
    }
  }

  function handleAspectRatioToggle() {
    setResizeIntent('dimensions');
    setKeepAspectRatio(current => {
      const nextValue = !current;
      if (!nextValue || !imageInfo) return nextValue;

      const width = Number(targetWidth);
      const height = Number(targetHeight);
      if (width > 0) {
        setTargetHeight(String(getHeightFromWidth(imageInfo, width)));
        setScale(clampScale((width / imageInfo.width) * 100));
      } else if (height > 0) {
        setTargetWidth(String(getWidthFromHeight(imageInfo, height)));
        setScale(clampScale((height / imageInfo.height) * 100));
      } else {
        setTargetWidth(String(imageInfo.width));
        setTargetHeight(String(imageInfo.height));
        setScale(defaultScale);
      }

      return nextValue;
    });
  }

  function downloadResult(nextResult: ProcessResult) {
    const anchor = document.createElement('a');
    anchor.href = nextResult.url;
    anchor.download = nextResult.name;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  async function downloadAllResults() {
    if (!batchResults.length) return;
    setIsZipping(true);
    try {
      const archive = new JSZip();
      const usedNames = new Set<string>();
      batchResults.forEach(item => {
        archive.file(getUniqueArchiveName(item.name, usedNames), item.blob);
      });
      const archiveBlob = await archive.generateAsync({ type: 'blob' });
      const archiveUrl = URL.createObjectURL(archiveBlob);
      downloadResult({
        blob: archiveBlob,
        height: 0,
        name: createArchiveName(),
        savingsRatio: 0,
        size: archiveBlob.size,
        source: 'browser',
        type: 'application/zip',
        url: archiveUrl,
        width: 0,
      });
      window.setTimeout(() => URL.revokeObjectURL(archiveUrl), 1000);
    } finally {
      setIsZipping(false);
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
              const Icon = [Images, Maximize2, Zap][index] ?? CheckCircle2;
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

            <div
              aria-label={copy.upload.dropzoneAriaLabel}
              className={[
                'image-dropzone',
                isDragging ? 'is-dragging' : '',
                imageInfo ? 'has-image' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              role='button'
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
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
              onKeyDown={event => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                fileInputRef.current?.click();
              }}
            >
              <input
                ref={fileInputRef}
                accept={uploadAccept}
                multiple
                type='file'
                onChange={handleInputChange}
              />
              {previewUrl && imageInfo ? (
                <div className='image-preview-frame'>
                  <img src={previewUrl} alt={copy.upload.previewAlt} />
                  {isBatchMode ? (
                    <>
                      <OIconButton
                        aria-label={copy.upload.previousPreview}
                        className='image-preview-nav image-preview-nav--prev'
                        hoverTranslate={false}
                        size='sm'
                        variant='ghost'
                        onClick={event => {
                          event.preventDefault();
                          event.stopPropagation();
                          showPreviousPreview();
                        }}
                      >
                        <ChevronLeft size={16} aria-hidden='true' />
                      </OIconButton>
                      <OIconButton
                        aria-label={copy.upload.nextPreview}
                        className='image-preview-nav image-preview-nav--next'
                        hoverTranslate={false}
                        size='sm'
                        variant='ghost'
                        onClick={event => {
                          event.preventDefault();
                          event.stopPropagation();
                          showNextPreview();
                        }}
                      >
                        <ChevronRight size={16} aria-hidden='true' />
                      </OIconButton>
                      <span className='image-preview-counter'>
                        {previewPosition}
                      </span>
                    </>
                  ) : null}
                </div>
              ) : (
                <span className='image-empty-state'>
                  <UploadCloud size={34} strokeWidth={1.7} aria-hidden='true' />
                  <strong>{copy.upload.emptyTitle}</strong>
                  <small>{copy.upload.emptyDescription}</small>
                </span>
              )}
            </div>

            {batchImages.length ? (
              <div
                ref={previewStripRef}
                className='image-preview-strip'
                aria-label={copy.batch.title}
              >
                {batchImages.map((item, index) => (
                  <button
                    ref={node => {
                      previewButtonRefs.current[index] = node;
                    }}
                    key={`${item.info.name}-${item.info.lastModified}-${index}`}
                    className={[
                      'interactive',
                      index === activeImageIndex ? 'is-active' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    type='button'
                    onClick={() => showPreviewAt(index)}
                  >
                    <img src={item.previewUrl} alt='' aria-hidden='true' />
                    <span>
                      <strong>{item.info.name}</strong>
                      <small>
                        {item.info.width} x {item.info.height} ·{' '}
                        {formatBytes(item.info.size)}
                      </small>
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            {batchFiles.length ? (
              <div
                className='image-batch-summary'
                aria-label={copy.batch.title}
              >
                <div className='image-batch-summary-head'>
                  <span aria-hidden='true'>
                    <Images size={16} />
                  </span>
                  <div>
                    <strong>
                      {batchFiles.length}
                      {copy.batch.countSuffix}
                    </strong>
                    <small>{copy.batch.unifiedNote}</small>
                  </div>
                </div>
                <div className='image-batch-stats'>
                  <span>
                    {copy.batch.totalSize}: {formatBytes(totalInputSize)}
                  </span>
                  <span>
                    {copy.batch.primary}: {previewPosition || copy.info.unknown}
                  </span>
                </div>
              </div>
            ) : null}

            <Base64Transfer
              copied={copiedBase64}
              copy={copy.base64}
              error={base64Error}
              value={base64Value}
              onCopy={() => void copyImageBase64()}
              onChange={value => {
                setCopiedBase64(false);
                setBase64Error('');
                setBase64Value(value);
              }}
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
              <div className='image-resize-panel'>
                <div className='image-resize-heading'>
                  <span>
                    <Maximize2 size={15} aria-hidden='true' />
                    {copy.resize.dimensionTitle}
                  </span>
                  <span
                    className={[
                      'image-aspect-status',
                      keepAspectRatio ? 'is-locked' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {keepAspectRatio
                      ? copy.resize.aspectLocked
                      : copy.resize.aspectUnlocked}
                  </span>
                </div>
                <div className='image-dimension-controls'>
                  <label>
                    <span>{copy.resize.width}</span>
                    <input
                      disabled={!resizeEnabled || !imageInfo}
                      inputMode='numeric'
                      min='1'
                      type='number'
                      value={targetWidth}
                      onChange={event =>
                        handleDimensionChange('width', event.target.value)
                      }
                    />
                  </label>
                  <OIconButton
                    aria-label={
                      keepAspectRatio
                        ? copy.resize.aspectLocked
                        : copy.resize.aspectUnlocked
                    }
                    aria-pressed={keepAspectRatio}
                    className={[
                      'image-aspect-button',
                      keepAspectRatio ? 'is-active' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    disabled={!resizeEnabled || !imageInfo}
                    hoverTranslate={false}
                    size='md'
                    title={copy.resize.aspectToggleLabel}
                    variant='ghost'
                    onClick={handleAspectRatioToggle}
                  >
                    {keepAspectRatio ? (
                      <Lock size={16} aria-hidden='true' />
                    ) : (
                      <Unlock size={16} aria-hidden='true' />
                    )}
                  </OIconButton>
                  <label>
                    <span>{copy.resize.height}</span>
                    <input
                      disabled={!resizeEnabled || !imageInfo}
                      inputMode='numeric'
                      min='1'
                      type='number'
                      value={targetHeight}
                      onChange={event =>
                        handleDimensionChange('height', event.target.value)
                      }
                    />
                  </label>
                </div>
                <label className='image-range-control'>
                  <span>
                    {copy.resize.scaleLabel}
                    <strong>{scale}%</strong>
                  </span>
                  <input
                    disabled={!resizeEnabled || !imageInfo}
                    max={maxScale}
                    min={minScale}
                    step='5'
                    type='range'
                    value={scale}
                    onChange={event => handleScaleChange(event.target.value)}
                  />
                  <small>
                    <span>{minScale}%</span>
                    <span>{maxScale}%</span>
                  </small>
                </label>
                <p className='image-resize-help'>{copy.resize.batchHint}</p>
              </div>
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
                    : isBatchMode
                      ? copy.output.processBatch
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
              <p>{outputMessage}</p>
            </div>
          </div>

          <div className='image-result-grid'>
            <MetricItem
              label={
                hasBatchFeedback
                  ? copy.output.processedCount
                  : copy.output.processedDimensions
              }
              value={
                hasBatchFeedback
                  ? `${completedBatchItemCount}/${batchProcessItems.length}`
                  : result
                    ? `${result.width} x ${result.height}`
                    : copy.info.unknown
              }
            />
            <MetricItem
              label={
                hasBatchFeedback
                  ? copy.output.outputTotalSize
                  : copy.output.processedSize
              }
              value={
                hasBatchFeedback
                  ? formatBytes(totalResultSize)
                  : result
                    ? formatBytes(result.size)
                    : copy.info.unknown
              }
            />
            <MetricItem
              label={copy.output.savings}
              value={
                hasBatchFeedback && batchSavingsRatio !== null
                  ? `${Math.max(0, batchSavingsRatio * 100).toFixed(1)}%`
                  : result
                    ? `${Math.max(0, result.savingsRatio * 100).toFixed(1)}%`
                    : copy.info.unknown
              }
            />
            <MetricItem
              label={
                hasBatchFeedback ? copy.output.failedCount : copy.output.engine
              }
              value={
                hasBatchFeedback
                  ? String(failedBatchItemCount)
                  : result?.source === 'tinypng'
                    ? copy.compress.provider
                    : copy.output.localEngine
              }
            />
          </div>

          <div className='image-result-actions'>
            {isBatchMode && batchResults.length ? (
              <OButton
                disabled={isZipping}
                type='button'
                variant='secondary'
                onClick={() => void downloadAllResults()}
              >
                {isZipping ? (
                  <Loader2 className='spin' size={16} aria-hidden='true' />
                ) : (
                  <Download size={16} aria-hidden='true' />
                )}
                {isZipping
                  ? copy.output.zipping
                  : failedBatchItemCount
                    ? copy.output.downloadSuccessfulZip
                    : copy.output.downloadZip}
              </OButton>
            ) : result ? (
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

          {hasBatchFeedback ? (
            <div
              className='image-result-items'
              aria-label={copy.output.batchItemsTitle}
            >
              {batchProcessItems.map((item, index) => {
                const icon =
                  item.phase === 'done' ? (
                    <CheckCircle2 size={14} aria-hidden='true' />
                  ) : item.phase === 'processing' ||
                    item.phase === 'compressing' ? (
                    <Loader2 className='spin' size={14} aria-hidden='true' />
                  ) : item.phase === 'error' ? (
                    <Info size={14} aria-hidden='true' />
                  ) : (
                    <FileImage size={14} aria-hidden='true' />
                  );
                const statusDetail = item.result
                  ? `${item.message} · ${formatBytes(item.result.size)}`
                  : item.message;
                const className = [
                  'image-result-item',
                  `is-${item.phase}`,
                  item.result ? 'interactive' : '',
                ]
                  .filter(Boolean)
                  .join(' ');
                const content = (
                  <>
                    {icon}
                    <span>
                      <strong>{item.result?.name || item.name}</strong>
                      <small>{statusDetail}</small>
                    </span>
                    <small>
                      {index + 1}/{batchProcessItems.length}
                    </small>
                  </>
                );

                return item.result ? (
                  <a
                    key={`${item.name}-${index}`}
                    className={className}
                    download={item.result.name}
                    href={item.result.url}
                  >
                    {content}
                  </a>
                ) : (
                  <div key={`${item.name}-${index}`} className={className}>
                    {content}
                  </div>
                );
              })}
            </div>
          ) : null}
        </OCard>
      </main>
    </>
  );
}
