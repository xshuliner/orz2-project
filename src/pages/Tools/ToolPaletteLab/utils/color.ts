export interface RgbColor {
  b: number;
  g: number;
  r: number;
}

export interface HslColor {
  h: number;
  l: number;
  s: number;
}

export interface HsvColor {
  h: number;
  s: number;
  v: number;
}

export type ColorFamily =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'magenta'
  | 'neutral';

export type ColorTone = 'dark' | 'muted' | 'vivid' | 'light';

export type HarmonyScheme =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'splitComplementary'
  | 'monochromatic';

export interface ColorFormats {
  hex: string;
  hsl: string;
  hsv: string;
  rgb: string;
}

export interface ColorClassification {
  family: ColorFamily;
  tone: ColorTone;
}

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum);

const normalizeHue = (hue: number) => ((hue % 360) + 360) % 360;

function parseChannel(value: string) {
  const normalized = value.trim();
  const number = Number.parseFloat(normalized);
  if (!Number.isFinite(number)) return null;
  return normalized.endsWith('%')
    ? Math.round((clamp(number, 0, 100) / 100) * 255)
    : Math.round(clamp(number, 0, 255));
}

function parsePercentage(value: string) {
  const normalized = value.trim();
  if (!normalized.endsWith('%')) return null;
  const number = Number.parseFloat(normalized);
  return Number.isFinite(number) ? clamp(number, 0, 100) : null;
}

export function rgbToHex({ b, g, r }: RgbColor) {
  return `#${[r, g, b]
    .map(channel =>
      Math.round(clamp(channel, 0, 255))
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`.toUpperCase();
}

export function hexToRgb(hex: string): RgbColor | null {
  const normalized = hex.trim().replace(/^#/, '');
  if (!/^(?:[\da-f]{3}|[\da-f]{6})$/i.test(normalized)) return null;

  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map(character => character.repeat(2))
          .join('')
      : normalized;

  return {
    b: Number.parseInt(expanded.slice(4, 6), 16),
    g: Number.parseInt(expanded.slice(2, 4), 16),
    r: Number.parseInt(expanded.slice(0, 2), 16),
  };
}

export function rgbToHsl({ b, g, r }: RgbColor): HslColor {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const difference = maximum - minimum;
  const lightness = (maximum + minimum) / 2;

  if (difference === 0) return { h: 0, l: lightness * 100, s: 0 };

  const saturation = difference / (1 - Math.abs(2 * lightness - 1));
  let hue: number;
  if (maximum === red) hue = 60 * (((green - blue) / difference) % 6);
  else if (maximum === green) hue = 60 * ((blue - red) / difference + 2);
  else hue = 60 * ((red - green) / difference + 4);

  return {
    h: normalizeHue(hue),
    l: lightness * 100,
    s: saturation * 100,
  };
}

export function hslToRgb({ h, l, s }: HslColor): RgbColor {
  const hue = normalizeHue(h);
  const saturation = clamp(s, 0, 100) / 100;
  const lightness = clamp(l, 0, 100) / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const hueSection = hue / 60;
  const secondary = chroma * (1 - Math.abs((hueSection % 2) - 1));
  const offset = lightness - chroma / 2;

  const [red, green, blue] =
    hueSection < 1
      ? [chroma, secondary, 0]
      : hueSection < 2
        ? [secondary, chroma, 0]
        : hueSection < 3
          ? [0, chroma, secondary]
          : hueSection < 4
            ? [0, secondary, chroma]
            : hueSection < 5
              ? [secondary, 0, chroma]
              : [chroma, 0, secondary];

  return {
    b: Math.round((blue + offset) * 255),
    g: Math.round((green + offset) * 255),
    r: Math.round((red + offset) * 255),
  };
}

export function rgbToHsv({ b, g, r }: RgbColor): HsvColor {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const difference = maximum - minimum;
  let hue = 0;

  if (difference !== 0) {
    if (maximum === red) hue = 60 * (((green - blue) / difference) % 6);
    else if (maximum === green) hue = 60 * ((blue - red) / difference + 2);
    else hue = 60 * ((red - green) / difference + 4);
  }

  return {
    h: normalizeHue(hue),
    s: maximum === 0 ? 0 : (difference / maximum) * 100,
    v: maximum * 100,
  };
}

export function hsvToRgb({ h, s, v }: HsvColor): RgbColor {
  const hue = normalizeHue(h);
  const saturation = clamp(s, 0, 100) / 100;
  const value = clamp(v, 0, 100) / 100;
  const chroma = value * saturation;
  const hueSection = hue / 60;
  const secondary = chroma * (1 - Math.abs((hueSection % 2) - 1));
  const offset = value - chroma;

  const [red, green, blue] =
    hueSection < 1
      ? [chroma, secondary, 0]
      : hueSection < 2
        ? [secondary, chroma, 0]
        : hueSection < 3
          ? [0, chroma, secondary]
          : hueSection < 4
            ? [0, secondary, chroma]
            : hueSection < 5
              ? [secondary, 0, chroma]
              : [chroma, 0, secondary];

  return {
    b: Math.round((blue + offset) * 255),
    g: Math.round((green + offset) * 255),
    r: Math.round((red + offset) * 255),
  };
}

export function parseColor(value: string): RgbColor | null {
  const normalized = value.trim();
  const hexColor = hexToRgb(normalized);
  if (hexColor) return hexColor;

  const rgbMatch = normalized.match(
    /^rgba?\(\s*([\d.]+%?)\s*[, ]\s*([\d.]+%?)\s*[, ]\s*([\d.]+%?)(?:\s*[,/]\s*[\d.]+%?)?\s*\)$/i
  );
  if (rgbMatch) {
    const channels = rgbMatch.slice(1, 4).map(parseChannel);
    if (channels.every(channel => channel !== null)) {
      const [r, g, b] = channels as [number, number, number];
      return { b, g, r };
    }
  }

  const hslMatch = normalized.match(
    /^hsla?\(\s*(-?[\d.]+)(?:deg)?\s*[, ]\s*([\d.]+%)\s*[, ]\s*([\d.]+%)(?:\s*[,/]\s*[\d.]+%?)?\s*\)$/i
  );
  if (hslMatch) {
    const saturation = parsePercentage(hslMatch[2]);
    const lightness = parsePercentage(hslMatch[3]);
    const hue = Number.parseFloat(hslMatch[1]);
    if (saturation !== null && lightness !== null && Number.isFinite(hue)) {
      return hslToRgb({ h: hue, l: lightness, s: saturation });
    }
  }

  const hsvMatch = normalized.match(
    /^(?:hsv|hsb)\(\s*(-?[\d.]+)(?:deg)?\s*[, ]\s*([\d.]+%)\s*[, ]\s*([\d.]+%)\s*\)$/i
  );
  if (hsvMatch) {
    const saturation = parsePercentage(hsvMatch[2]);
    const valueChannel = parsePercentage(hsvMatch[3]);
    const hue = Number.parseFloat(hsvMatch[1]);
    if (saturation !== null && valueChannel !== null && Number.isFinite(hue)) {
      return hsvToRgb({ h: hue, s: saturation, v: valueChannel });
    }
  }

  return null;
}

export function getColorFormats(rgb: RgbColor): ColorFormats {
  const hex = rgbToHex(rgb);
  const hsl = rgbToHsl(rgb);
  const hsv = rgbToHsv(rgb);

  return {
    hex,
    hsl: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`,
    hsv: `hsv(${Math.round(hsv.h)}, ${Math.round(hsv.s)}%, ${Math.round(hsv.v)}%)`,
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
  };
}

function relativeLuminance(rgb: RgbColor) {
  const channels = [rgb.r, rgb.g, rgb.b].map(channel => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function getContrastRatio(first: RgbColor, second: RgbColor) {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

export function getReadableTextColor(background: RgbColor) {
  const dark = { b: 17, g: 17, r: 17 };
  const light = { b: 255, g: 255, r: 255 };
  const darkRatio = getContrastRatio(dark, background);
  const lightRatio = getContrastRatio(light, background);
  return darkRatio >= lightRatio
    ? { color: rgbToHex(dark), ratio: darkRatio }
    : { color: rgbToHex(light), ratio: lightRatio };
}

export function classifyColor(rgb: RgbColor): ColorClassification {
  const { h, l, s } = rgbToHsl(rgb);
  const family: ColorFamily =
    s < 12
      ? 'neutral'
      : h < 15 || h >= 345
        ? 'red'
        : h < 45
          ? 'orange'
          : h < 70
            ? 'yellow'
            : h < 165
              ? 'green'
              : h < 200
                ? 'cyan'
                : h < 255
                  ? 'blue'
                  : h < 290
                    ? 'purple'
                    : 'magenta';
  const tone: ColorTone =
    l < 28 ? 'dark' : l > 72 ? 'light' : s < 30 ? 'muted' : 'vivid';

  return { family, tone };
}

function colorFromHsl(hsl: HslColor, hueOffset = 0, lightness = hsl.l) {
  return rgbToHex(
    hslToRgb({
      h: hsl.h + hueOffset,
      l: clamp(lightness, 8, 92),
      s: hsl.s,
    })
  );
}

export function getColorHarmonies(
  rgb: RgbColor
): Record<HarmonyScheme, string[]> {
  const hsl = rgbToHsl(rgb);
  const monochromaticLightness = [
    Math.max(12, hsl.l - 30),
    Math.max(20, hsl.l - 15),
    hsl.l,
    Math.min(80, hsl.l + 15),
    Math.min(92, hsl.l + 30),
  ];

  return {
    analogous: [-30, 0, 30].map(offset => colorFromHsl(hsl, offset)),
    complementary: [0, 180].map(offset => colorFromHsl(hsl, offset)),
    monochromatic: monochromaticLightness.map(lightness =>
      colorFromHsl(hsl, 0, lightness)
    ),
    splitComplementary: [0, 150, 210].map(offset => colorFromHsl(hsl, offset)),
    triadic: [0, 120, 240].map(offset => colorFromHsl(hsl, offset)),
  };
}
