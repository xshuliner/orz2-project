import { rgbToHex, type RgbColor } from './color';

interface ColorBucket {
  b: number;
  count: number;
  g: number;
  r: number;
}

function colorDistance(first: RgbColor, second: RgbColor) {
  return Math.hypot(first.r - second.r, first.g - second.g, first.b - second.b);
}

export function extractImageColors(image: HTMLImageElement, limit = 8) {
  const maximumDimension = 180;
  const scale = Math.min(
    1,
    maximumDimension / Math.max(image.naturalWidth, image.naturalHeight)
  );
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return [];

  context.drawImage(image, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height).data;
  const buckets = new Map<string, ColorBucket>();

  for (let index = 0; index < pixels.length; index += 16) {
    if (pixels[index + 3] < 160) continue;
    const r = pixels[index];
    const g = pixels[index + 1];
    const b = pixels[index + 2];
    const key = `${Math.round(r / 28)},${Math.round(g / 28)},${Math.round(b / 28)}`;
    const bucket = buckets.get(key) ?? { b: 0, count: 0, g: 0, r: 0 };
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    bucket.count += 1;
    buckets.set(key, bucket);
  }

  const candidates = [...buckets.values()]
    .sort((first, second) => second.count - first.count)
    .map(bucket => ({
      b: Math.round(bucket.b / bucket.count),
      g: Math.round(bucket.g / bucket.count),
      r: Math.round(bucket.r / bucket.count),
    }));
  const selected: RgbColor[] = [];

  for (const candidate of candidates) {
    if (selected.every(color => colorDistance(color, candidate) >= 46)) {
      selected.push(candidate);
    }
    if (selected.length === limit) break;
  }

  return selected.map(rgbToHex);
}

export function drawImageToCanvas(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement
) {
  const maximumWidth = 1000;
  const maximumHeight = 640;
  const scale = Math.min(
    1,
    maximumWidth / image.naturalWidth,
    maximumHeight / image.naturalHeight
  );
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
}

export function sampleCanvasColor(
  canvas: HTMLCanvasElement,
  x: number,
  y: number
) {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;
  const boundedX = Math.min(Math.max(Math.floor(x), 0), canvas.width - 1);
  const boundedY = Math.min(Math.max(Math.floor(y), 0), canvas.height - 1);
  const [r, g, b, alpha] = context.getImageData(boundedX, boundedY, 1, 1).data;
  return alpha === 0 ? null : rgbToHex({ b, g, r });
}
