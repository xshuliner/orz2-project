import { postTinifyImage } from '@/api';
import {
  canvasFormats,
  maxScale,
  minScale,
} from '@/pages/Tools/ToolImageStudio/config';
import type {
  ImageInfo,
  OutputFormat,
} from '@/pages/Tools/ToolImageStudio/types';

export function clampDimension(value: number) {
  return Math.max(1, Math.round(value));
}

export function clampScale(value: number) {
  return Math.min(maxScale, Math.max(minScale, Math.round(value)));
}

export function sanitizeDimensionInput(value: string) {
  const sanitized = value.replace(/[^\d]/g, '');
  if (!sanitized) return '';
  return String(Math.max(1, Number(sanitized)));
}

export function getWidthFromScale(imageInfo: ImageInfo, nextScale: number) {
  return clampDimension((imageInfo.width * nextScale) / 100);
}

export function getHeightFromScale(imageInfo: ImageInfo, nextScale: number) {
  return clampDimension((imageInfo.height * nextScale) / 100);
}

export function getHeightFromWidth(imageInfo: ImageInfo, width: number) {
  return clampDimension((width * imageInfo.height) / imageInfo.width);
}

export function getWidthFromHeight(imageInfo: ImageInfo, height: number) {
  return clampDimension((height * imageInfo.width) / imageInfo.height);
}

export function formatBytes(bytes: number) {
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

export function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

export function getExtension(type: string) {
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

export function createOutputName(
  fileName: string,
  type: string,
  source: string
) {
  const baseName = fileName.replace(/\.[^.]+$/, '') || 'orz2-image';
  return `${baseName}-${source}.${getExtension(type)}`;
}

export function createArchiveName() {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, '');
  return `orz2-images-${timestamp}.zip`;
}

export function getUniqueArchiveName(fileName: string, usedNames: Set<string>) {
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

export function getMimeFromDataUrl(dataUrl: string) {
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

export function normalizeBase64Image(value: string) {
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

export function dataUrlToBlob(dataUrl: string) {
  const [, base64 = ''] = dataUrl.split(',');
  const mime = getMimeFromDataUrl(dataUrl);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mime });
}

export function resolveCanvasMime(format: OutputFormat, inputType: string) {
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

export function readFileAsDataUrl(file: Blob) {
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

export async function readImageInfo(
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

export function estimateSize(
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

export function getTotalBytes(items: readonly { size: number }[]) {
  return items.reduce((total, item) => total + item.size, 0);
}

export async function renderToBlob(
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

export async function tinypngCompress(blob: Blob, filename: string) {
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
