// Form fields: `--input` is the field border and `inputMix` the share of it in the field fill
// (`--color-input-background` in styles.css). The border reaches 3:1 against the page and the
// card, the bar WCAG 1.4.11 sets for a component's boundary; the fill stays a faint tint of it.

import { alphaOf, contrastRatio, mixColors, shiftLightness, toOklch, withAlpha } from "./color";
import type { Theme, ThemeColors, ThemeMode } from "./schema";

/** Minimum contrast of `--input` against `--background` and `--card`. */
export const INPUT_CONTRAST = 3;

/** Default share of `--input` in the field fill, per mode (`--input-mix` in styles.css): light fields stay transparent. */
export const INPUT_MIX = { light: 0, dark: 0.1 } as const;

const STEP = 0.005;

const lightnessOf = (value: string) => Number(/^oklch\(\s*([\d.]+)/.exec(toOklch(value))?.[1] ?? 0);

/** `--input` as it is drawn: a translucent value composited over the page. */
function opaqueInput(colors: ThemeColors): string {
  const alpha = alphaOf(colors.input);
  return alpha >= 1
    ? toOklch(colors.input)
    : mixColors(colors.background, withAlpha(colors.input, 1), alpha);
}

const inputPasses = (colors: ThemeColors, input: string) =>
  contrastRatio(input, colors.background) >= INPUT_CONTRAST &&
  contrastRatio(input, colors.card) >= INPUT_CONTRAST;

/**
 * `--input` moved in lightness only (away from the page) until it reaches `INPUT_CONTRAST`
 * against the page and the card. A value that already passes comes back unchanged.
 */
export function strengthenInput(colors: ThemeColors): string {
  if (inputPasses(colors, opaqueInput(colors))) return colors.input;
  const direction = lightnessOf(colors.background) > 0.5 ? -1 : 1;
  let input = opaqueInput(colors);
  for (let i = 0; i < 1 / STEP && !inputPasses(colors, input); i++) {
    input = shiftLightness(input, direction * STEP);
  }
  return input;
}

const share = (percent: string) => Number.parseFloat(percent) / 100;

/** Share (0–1) of `--input` in the field fill of `mode`: the theme's `inputMix`, or the default. */
export function inputMixOf(theme: Theme, mode: ThemeMode): number {
  return theme.inputMix === undefined ? INPUT_MIX[mode] : share(theme.inputMix[mode]);
}
