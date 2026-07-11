import { LayoutToolPage } from '@/components/LayoutToolPage';
import { OButton } from '@/components/OButton';
import { OCard } from '@/components/OCard';
import { OIconButton } from '@/components/OIconButton';
import { OSelector, type OSelectorOption } from '@/components/OSelector';
import { useI18n } from '@/hooks/useI18n';
import {
  Base64Transfer,
  MetricItem,
  ToggleRow,
} from '@/pages/Tools/ToolImageStudio/components/ImageToolParts';
import {
  canvasFormats,
  defaultScale,
  imageToolId,
  imageToolSeoKey,
  maxScale,
  minScale,
  uploadAccept,
} from '@/pages/Tools/ToolImageStudio/config';
import type {
  BatchProcessItem,
  ImageInfo,
  OutputFormat,
  ProcessResult,
  ProcessState,
  ReadImageFileResult,
  ResizeIntent,
} from '@/pages/Tools/ToolImageStudio/types';
import {
  clampDimension,
  clampScale,
  createArchiveName,
  createOutputName,
  dataUrlToBlob,
  estimateSize,
  formatBytes,
  formatDate,
  getExtension,
  getHeightFromScale,
  getHeightFromWidth,
  getMimeFromDataUrl,
  getTotalBytes,
  getUniqueArchiveName,
  getWidthFromHeight,
  getWidthFromScale,
  normalizeBase64Image,
  readFileAsDataUrl,
  readImageInfo,
  renderToBlob,
  resolveCanvasMime,
  sanitizeDimensionInput,
  tinypngCompress,
} from '@/pages/Tools/ToolImageStudio/utils/imageProcessing';
import JSZip from 'jszip';
import {
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
import './index.css';

export function ImageStudio() {
  const { messages } = useI18n();
  const copy = messages.imageTool;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const base64ParseIdRef = useRef(0);
  const skipNextBase64ParseRef = useRef(false);
  const previewStripRef = useRef<HTMLDivElement>(null);
  const previewButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const batchResultUrlsRef = useRef<Set<string>>(new Set());
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
    <LayoutToolPage icon={Images} seoKey={imageToolSeoKey} toolId={imageToolId}>
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
            <div className='image-batch-summary' aria-label={copy.batch.title}>
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
    </LayoutToolPage>
  );
}
