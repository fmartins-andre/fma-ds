// The contrast bar curated themes must meet (tests/themes.test.ts), also shown
// live in the theme editor. Body text meets WCAG AA (4.5:1); fills with their
// own text color (buttons, badges, muted text, tinted status text) reach 3:1 —
// the bar shadcn's own default theme meets (muted-foreground on muted is 4.34:1).

import { contrastRatio, mixColors } from "./color";
import type { ColorToken, Theme, ThemeColors, ThemeMode } from "./schema";

/**
 * The recipe percentages every tone-based style shares (share of the tone in the mix). `text` is
 * the share of `--foreground` in the initial `-text` value; `softHover` multiplies the soft share.
 */
export const TONE_MIX = {
  text: 0.5,
  icon: 0.42,
  soft: { light: 0.1, dark: 0.18 },
  softHover: 1.8,
  line: { light: 0.38, dark: 0.45 },
} as const;

/** The colored tones that have an in-tone text token (`--X-text`). Neutral uses `--foreground`. */
export const TEXT_TONES = [
  "primary",
  "brand",
  "success",
  "warning",
  "info",
  "destructive",
] as const;

export type TextTone = (typeof TEXT_TONES)[number];

/** The surfaces the in-tone text of `tone` sits on, and the minimum contrast on each. */
export function toneTextSurfaces(
  colors: ThemeColors,
  tone: TextTone,
  mode: ThemeMode,
  soft: number = TONE_MIX.soft[mode],
) {
  return [
    { label: "--background", value: colors.background, minimum: 4.5 },
    {
      label: `soft(--${tone})`,
      value: mixColors(colors.background, colors[tone], soft, 6),
      minimum: 4.5,
    },
    {
      label: `soft-hover(--${tone})`,
      value: mixColors(colors.background, colors[tone], soft * TONE_MIX.softHover, 6),
      minimum: 3,
    },
  ];
}

const share = (percent: string) => Number.parseFloat(percent) / 100;

/** Share (0–1) of `-text` in icons and dots: the theme's `iconMix`, or the shared default. */
export function iconMixOf(theme: Theme): number {
  return theme.iconMix === undefined ? TONE_MIX.icon : share(theme.iconMix);
}

/** Share (0–1) of the tone in the soft tint of `mode`: the theme's `softMix`, or the default. */
export function softMixOf(theme: Theme, mode: ThemeMode): number {
  return theme.softMix === undefined ? TONE_MIX.soft[mode] : share(theme.softMix[mode]);
}

export interface ContrastPair {
  background: ColorToken;
  foreground: ColorToken;
  minimum: number;
}

const body = (background: ColorToken, foreground: ColorToken): ContrastPair => ({
  background,
  foreground,
  minimum: 4.5,
});
const fill = (background: ColorToken, foreground: ColorToken): ContrastPair => ({
  background,
  foreground,
  minimum: 3,
});

export const CONTRAST_PAIRS: ContrastPair[] = [
  body("background", "foreground"),
  body("card", "card-foreground"),
  body("popover", "popover-foreground"),
  body("sidebar", "sidebar-foreground"),
  fill("primary", "primary-foreground"),
  fill("accent", "accent-foreground"),
  fill("muted", "muted-foreground"),
  fill("background", "muted-foreground"),
  // Our status foregrounds are text on the solid status color; the color itself must
  // also stand out against the page (border and fill).
  fill("success", "success-foreground"),
  fill("warning", "warning-foreground"),
  fill("info", "info-foreground"),
  fill("destructive", "destructive-foreground"),
  fill("background", "success"),
  fill("background", "warning"),
  fill("background", "info"),
  fill("background", "destructive"),
  fill("brand", "brand-foreground"),
  fill("sidebar-primary", "sidebar-primary-foreground"),
  fill("sidebar-accent", "sidebar-accent-foreground"),
];

export interface ContrastResult {
  /** Label of the surface: a token name ("--card") or a computed one ("soft(--info)"). */
  background: string;
  /** Label of the text: a token name ("--info-text"). */
  foreground: string;
  backgroundValue: string;
  foregroundValue: string;
  minimum: number;
  ratio: number;
  passes: boolean;
}

function result(
  background: string,
  foreground: string,
  backgroundValue: string,
  foregroundValue: string,
  minimum: number,
): ContrastResult {
  const ratio = contrastRatio(backgroundValue, foregroundValue);
  return {
    background,
    foreground,
    backgroundValue,
    foregroundValue,
    minimum,
    ratio,
    passes: ratio >= minimum,
  };
}

export function checkContrast(theme: Theme, mode: ThemeMode): ContrastResult[] {
  const colors = theme[mode];
  const pairs = CONTRAST_PAIRS.map((pair) =>
    result(
      `--${pair.background}`,
      `--${pair.foreground}`,
      colors[pair.background],
      colors[pair.foreground],
      pair.minimum,
    ),
  );
  const soft = softMixOf(theme, mode);
  const toneText = TEXT_TONES.flatMap((tone) =>
    toneTextSurfaces(colors, tone, mode, soft).map((surface) =>
      result(
        surface.label,
        `--${tone}-text`,
        surface.value,
        colors[`${tone}-text`],
        surface.minimum,
      ),
    ),
  );
  // Icons and dots: the tone nudged toward its text, on the page and on its soft tint.
  const icons = TEXT_TONES.flatMap((tone) => {
    const icon = mixColors(colors[tone], colors[`${tone}-text`], iconMixOf(theme));
    return toneTextSurfaces(colors, tone, mode, soft)
      .filter((surface) => !surface.label.startsWith("soft-hover("))
      .map((surface) => result(surface.label, `icon(--${tone})`, surface.value, icon, 3));
  });
  return [...pairs, ...toneText, ...icons];
}
