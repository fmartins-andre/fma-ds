// Form fields: `--input` is the field border (by default the same value as `--border`) and
// `inputMix` the share of it in the field fill (`--color-input-background` in styles.css).

import type { Theme, ThemeMode } from "./schema";

/** Default share of `--input` in the field fill, per mode (`--input-mix` in styles.css): light fields stay transparent. */
export const INPUT_MIX = { light: 0, dark: 0.3 } as const;

const share = (percent: string) => Number.parseFloat(percent) / 100;

/** Share (0–1) of `--input` in the field fill of `mode`: the theme's `inputMix`, or the default. */
export function inputMixOf(theme: Theme, mode: ThemeMode): number {
  return theme.inputMix === undefined ? INPUT_MIX[mode] : share(theme.inputMix[mode]);
}
