// Color Tools Utility Functions

export interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

export interface ColorHSL {
  h: number;
  s: number;
  l: number;
}

export interface ColorHSV {
  h: number;
  s: number;
  v: number;
}

export interface ColorValue {
  hex: string;
  rgb: ColorRGB;
  hsl: ColorHSL;
  hsv: ColorHSV;
}

// HEX to RGB
export function hexToRgb(hex: string): ColorRGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error('Invalid HEX color');
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

// RGB to HEX
export function rgbToHex(rgb: ColorRGB): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

// RGB to HSL
export function rgbToHsl(rgb: ColorRGB): ColorHSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// HSL to RGB
export function hslToRgb(hsl: ColorHSL): ColorRGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// RGB to HSV
export function rgbToHsv(rgb: ColorRGB): ColorHSV {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;

  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

// HSV to RGB
export function hsvToRgb(hsv: ColorHSV): ColorRGB {
  const h = hsv.h / 360;
  const s = hsv.s / 100;
  const v = hsv.v / 100;

  let r, g, b;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
    default:
      r = v;
      g = p;
      b = q;
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// Parse any color format
export function parseColor(input: string): ColorValue {
  input = input.trim();

  // Try HEX
  if (/^#?[a-f0-9]{6}$/i.test(input)) {
    const hex = input.startsWith('#') ? input : `#${input}`;
    const rgb = hexToRgb(hex);
    return {
      hex,
      rgb,
      hsl: rgbToHsl(rgb),
      hsv: rgbToHsv(rgb),
    };
  }

  // Try RGB
  const rgbMatch = input.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    const rgb = {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
    };
    return {
      hex: rgbToHex(rgb),
      rgb,
      hsl: rgbToHsl(rgb),
      hsv: rgbToHsv(rgb),
    };
  }

  // Try HSL
  const hslMatch = input.match(/^hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/i);
  if (hslMatch) {
    const hsl = {
      h: parseInt(hslMatch[1]),
      s: parseInt(hslMatch[2]),
      l: parseInt(hslMatch[3]),
    };
    const rgb = hslToRgb(hsl);
    return {
      hex: rgbToHex(rgb),
      rgb,
      hsl,
      hsv: rgbToHsv(rgb),
    };
  }

  throw new Error('Invalid color format');
}

// Generate color palette
export type PaletteType = 'complementary' | 'triadic' | 'analogous' | 'split-complementary' | 'tetradic' | 'monochromatic';

export function generatePalette(baseHex: string, type: PaletteType): string[] {
  const rgb = hexToRgb(baseHex);
  const hsl = rgbToHsl(rgb);
  const colors: string[] = [baseHex];

  switch (type) {
    case 'complementary':
      colors.push(rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 180) % 360 })));
      break;

    case 'triadic':
      colors.push(rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 120) % 360 })));
      colors.push(rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 240) % 360 })));
      break;

    case 'analogous':
      colors.push(rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 30) % 360 })));
      colors.push(rgbToHex(hslToRgb({ ...hsl, h: (hsl.h - 30 + 360) % 360 })));
      break;

    case 'split-complementary':
      colors.push(rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 150) % 360 })));
      colors.push(rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 210) % 360 })));
      break;

    case 'tetradic':
      colors.push(rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 90) % 360 })));
      colors.push(rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 180) % 360 })));
      colors.push(rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 270) % 360 })));
      break;

    case 'monochromatic':
      for (let i = 1; i <= 4; i++) {
        const newL = Math.max(10, Math.min(90, hsl.l + (i - 2) * 15));
        colors.push(rgbToHex(hslToRgb({ ...hsl, l: newL })));
      }
      break;
  }

  return colors;
}

export const paletteTypes: { value: PaletteType; label: string; description: string }[] = [
  { value: 'complementary', label: 'Complementary', description: 'Opposite colors on the wheel' },
  { value: 'triadic', label: 'Triadic', description: 'Three evenly spaced colors' },
  { value: 'analogous', label: 'Analogous', description: 'Adjacent colors on the wheel' },
  { value: 'split-complementary', label: 'Split Complementary', description: 'Base + two adjacent to complement' },
  { value: 'tetradic', label: 'Tetradic', description: 'Four evenly spaced colors' },
  { value: 'monochromatic', label: 'Monochromatic', description: 'Different shades of one color' },
];

// Generate gradient CSS
export interface GradientStop {
  color: string;
  position: number;
}

export type GradientType = 'linear' | 'radial' | 'conic';
export type GradientDirection = 'to right' | 'to left' | 'to top' | 'to bottom' | 'to top right' | 'to top left' | 'to bottom right' | 'to bottom left';

export function generateGradientCss(
  stops: GradientStop[],
  type: GradientType,
  direction: GradientDirection | number
): string {
  const stopsStr = stops
    .sort((a, b) => a.position - b.position)
    .map(s => `${s.color} ${s.position}%`)
    .join(', ');

  switch (type) {
    case 'linear':
      const dir = typeof direction === 'number' ? `${direction}deg` : direction;
      return `linear-gradient(${dir}, ${stopsStr})`;
    case 'radial':
      return `radial-gradient(circle, ${stopsStr})`;
    case 'conic':
      return `conic-gradient(from ${typeof direction === 'number' ? direction : 0}deg, ${stopsStr})`;
    default:
      return '';
  }
}

// Color contrast ratio (WCAG)
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance(rgb: ColorRGB): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
    v = v / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getWcagRating(ratio: number): { aa: boolean; aaLarge: boolean; aaa: boolean; aaaLarge: boolean } {
  return {
    aa: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaa: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  };
}

// Random color
export function randomColor(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

// Generate random color (alias for page compatibility)
export function generateRandomColor(): string {
  return randomColor();
}

// HEX to HSL (convenience function)
export function hexToHsl(hex: string): ColorHSL {
  const rgb = hexToRgb(hex);
  return rgbToHsl(rgb);
}

// HSL to HEX (convenience function)
export function hslToHex(hsl: ColorHSL): string {
  const rgb = hslToRgb(hsl);
  return rgbToHex(rgb);
}

// Generate gradient (alias for page compatibility)
export function generateGradient(
  stops: GradientStop[],
  type: GradientType,
  direction: GradientDirection | number
): string {
  return generateGradientCss(stops, type, direction);
}

// Color formats for display
export function formatColor(color: ColorValue): { [key: string]: string } {
  return {
    hex: color.hex.toUpperCase(),
    rgb: `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
    hsl: `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`,
    hsv: `hsv(${color.hsv.h}, ${color.hsv.s}%, ${color.hsv.v}%)`,
  };
}
