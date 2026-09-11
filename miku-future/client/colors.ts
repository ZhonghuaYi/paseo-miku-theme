// Single source of truth for the Miku Future palette. index.client.ts builds
// the theme contributions, wallpaper-css.ts derives every scrim, border, and
// blur value, and the mode detector derives its marker colors from here.
// Editing a color in one place updates the theme, the visuals, and detection.

import type { MikuPreferences } from "../shared/preferences";

export type Rgb = readonly [red: number, green: number, blue: number];

export const MIKU_LIGHT_COLORS = {
  background: "#F7FCFB",
  foreground: "#203638",
  raised: "#FFFFFF",
  control: "#E6F5F3",
  border: "#B9DCD8",
  // Deeper than the iconic turquoise so light button labels meet WCAG AA.
  accent: "#087F79",
  mutedForeground: "#5A7375",
  ring: "#2B8F8A",
} as const;

export const MIKU_DARK_COLORS = {
  background: "#10181B",
  foreground: "#EAF7F6",
  raised: "#172326",
  control: "#203236",
  border: "#38555A",
  // The canonical brighter Miku turquoise has strong contrast on dark canvas.
  accent: "#39C5BB",
  mutedForeground: "#9AB6B8",
  ring: "#65DED2",
} as const;

// Miku has no canonical purple. Her official identity color is blue-green;
// the magenta is the recognizable accent from her original outfit.
export const MIKU_ACCENT_HEXES = {
  magenta: { light: "#E12885", dark: "#FF7EBE" },
  turquoise: { light: "#087F79", dark: "#65DED2" },
} as const;

export type AccentChoice = MikuPreferences["accent"];

export const ACCENT_CHOICES: readonly { label: string; value: AccentChoice }[] = [
  { label: "Miku magenta", value: "magenta" },
  { label: "Miku turquoise", value: "turquoise" },
];

// Wallpaper visibility presets scale the scrim alphas painted over the
// illustration. "subtle" hides more of the image behind heavier scrims;
// "vivid" lets more of it through. Readability-critical message cards and
// code blocks are intentionally not scaled.
export type ScrimLevel = MikuPreferences["scrim"];

export const SCRIM_LEVELS: readonly { label: string; value: ScrimLevel }[] = [
  { label: "Subtle", value: "subtle" },
  { label: "Balanced", value: "balanced" },
  { label: "Vivid", value: "vivid" },
];

const SCRIM_SCALES: Record<ScrimLevel, number> = {
  subtle: 1.25,
  balanced: 1,
  vivid: 0.78,
};

// Frosted-glass blur presets in CSS pixels. "strong" matches the original
// design; "medium" softens it; "off" removes the backdrop-filter layers.
export type BlurLevel = MikuPreferences["blur"];

export const BLUR_LEVELS: readonly { label: string; value: BlurLevel }[] = [
  { label: "Off", value: "off" },
  { label: "Medium", value: "medium" },
  { label: "Strong", value: "strong" },
];

const BLUR_PIXELS: Record<BlurLevel, { sidebar: number; sheet: number; code: number }> = {
  off: { sidebar: 0, sheet: 0, code: 0 },
  medium: { sidebar: 14, sheet: 12, code: 10 },
  strong: { sidebar: 22, sheet: 18, code: 16 },
};

/** Shared visual options for the wallpaper enhancement and the settings UI. */
export interface WallpaperStyleOptions {
  readonly scrim: ScrimLevel;
  readonly accent: AccentChoice;
  readonly blur: BlurLevel;
}

export const DEFAULT_STYLE_OPTIONS: WallpaperStyleOptions = {
  scrim: "balanced",
  accent: "magenta",
  blur: "strong",
};

export function hexToRgb(hex: string): Rgb {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) {
    throw new Error(`Invalid hex color: ${JSON.stringify(hex)}`);
  }
  const value = Number.parseInt(match[1], 16);
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

export function rgbaString(rgb: Rgb, alpha: number): string {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${roundAlpha(alpha)})`;
}

function roundAlpha(alpha: number): number {
  return Math.min(1, Math.max(0.05, Math.round(alpha * 100) / 100));
}

export function scaledAlpha(base: number, scrim: ScrimLevel): number {
  return roundAlpha(base * SCRIM_SCALES[scrim]);
}

export function blurPixels(level: BlurLevel): {
  sidebar: number;
  sheet: number;
  code: number;
} {
  return BLUR_PIXELS[level];
}

// Marker colors for detecting which Miku theme is active. They deliberately
// reuse the theme palette: unique hues prevent an unrelated Paseo theme from
// accidentally enabling the illustration. Light matches background + control;
// dark additionally matches raised, because dark surfaces are layered.
export const LIGHT_MARKERS: readonly Rgb[] = [
  hexToRgb(MIKU_LIGHT_COLORS.background),
  hexToRgb(MIKU_LIGHT_COLORS.control),
];

export const DARK_MARKERS: readonly Rgb[] = [
  hexToRgb(MIKU_DARK_COLORS.background),
  hexToRgb(MIKU_DARK_COLORS.raised),
  hexToRgb(MIKU_DARK_COLORS.control),
];

type Rgba = readonly [red: number, green: number, blue: number, alpha: number];

export function parseRgba(value: string): Rgba | null {
  const match = value.match(
    /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/,
  );
  if (!match) return null;
  return [
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
    match[4] === undefined ? 1 : Number(match[4]),
  ];
}

export function matchesMarker(
  color: Rgba,
  markers: readonly Rgb[],
): boolean {
  if (color[3] < 0.1) return false;
  return markers.some(
    ([red, green, blue]) =>
      Math.abs(color[0] - red) <= 2 &&
      Math.abs(color[1] - green) <= 2 &&
      Math.abs(color[2] - blue) <= 2,
  );
}
